import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div class="dialog-container">
        <div class="dialog-header">
          <h2>{{ title }}</h2>
        </div>
        <div class="dialog-body">
          <p>{{ message }}</p>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-cancel" (click)="onCancel()">{{ cancelText }}</button>
          <button 
            class="btn btn-confirm" 
            [class.btn-danger]="isDanger"
            (click)="onConfirm()"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .dialog-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      width: 100%;
      max-width: 450px;
      overflow: hidden;
      animation: dialog-fade-in 0.3s ease;
    }
    
    @keyframes dialog-fade-in {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .dialog-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
    }
    
    .dialog-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }
    
    .dialog-body {
      padding: 1.5rem;
    }
    
    .dialog-body p {
      margin: 0;
      color: #555;
      line-height: 1.5;
    }
    
    .dialog-footer {
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      border-top: 1px solid #eee;
    }
    
    .btn {
      padding: 0.6rem 1.2rem;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
      font-size: 1rem;
    }
    
    .btn-cancel {
      background-color: #f5f5f5;
      color: #333;
    }
    
    .btn-confirm {
      background-color: #3f51b5;
      color: white;
    }
    
    .btn-danger {
      background-color: #f44336;
    }
    
    .btn-cancel:hover {
      background-color: #e0e0e0;
    }
    
    .btn-confirm:hover {
      background-color: #303f9f;
    }
    
    .btn-danger:hover {
      background-color: #d32f2f;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar';
  @Input() message = '¿Estás seguro de que deseas realizar esta acción?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() isDanger = false;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  
  onConfirm(): void {
    this.confirm.emit();
    this.isOpen = false;
  }
  
  onCancel(): void {
    this.cancel.emit();
    this.isOpen = false;
  }
  
  onOverlayClick(event: MouseEvent): void {
    // Solo cerrar si se hace clic directamente en el overlay y no en el contenido
    if ((event.target as HTMLElement).className === 'dialog-overlay') {
      this.onCancel();
    }
  }
}