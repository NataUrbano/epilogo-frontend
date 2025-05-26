import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReportData, ReportFormat, ReportService, ReportRequest } from '../../core/services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  filterForm: FormGroup;
  reportData: ReportData[] = [];
  loading = false;
  message = '';
  messageType = '';

  // Opciones para el formulario
  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'ACTIVE', label: 'Activa' },
    { value: 'COMPLETED', label: 'Completada' },
    { value: 'CANCELLED', label: 'Cancelada' }
  ];

  formatOptions = [
    { value: ReportFormat.HTML, label: 'HTML', icon: '🌐' },
    { value: ReportFormat.PDF, label: 'PDF', icon: '📄' },
    { value: ReportFormat.CSV, label: 'CSV', icon: '📊' }
  ];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService
  ) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      status: [''],
      overdueOnly: [false],
      format: [ReportFormat.HTML]
    });
  }

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    this.loading = true;
    this.clearMessage();
    const formValue = this.filterForm.value;
    
    const request: ReportRequest = {
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined,
      status: formValue.status || undefined,
      overdueOnly: formValue.overdueOnly,
      format: formValue.format
    };

    this.reportService.getReportData(request).subscribe({
      next: (data) => {
        this.reportData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando datos:', error);
        this.showMessage('Error al cargar los datos del reporte', 'error');
        this.loading = false;
      }
    });
  }

  generateReport(): void {
    const formValue = this.filterForm.value;
    
    const request: ReportRequest = {
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined,
      status: formValue.status || undefined,
      overdueOnly: formValue.overdueOnly,
      format: formValue.format
    };

    this.loading = true;
    this.clearMessage();
    
    this.reportService.generateReport(request).subscribe({
      next: (response) => {
        this.reportService.downloadFile(response);
        this.showMessage(`Reporte ${formValue.format} generado exitosamente`, 'success');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generando reporte:', error);
        this.showMessage('Error al generar el reporte', 'error');
        this.loading = false;
      }
    });
  }

  generateOverdueReport(): void {
    this.loading = true;
    this.clearMessage();
    
    this.reportService.generateOverdueReport().subscribe({
      next: (response) => {
        this.reportService.downloadFile(response, 'reservas_vencidas.html');
        this.showMessage('Reporte de vencidas (HTML) generado exitosamente', 'success');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generando reporte de vencidas:', error);
        this.showMessage('Error al generar el reporte de vencidas', 'error');
        this.loading = false;
      }
    });
  }

  generateOverduePdfReport(): void {
    this.loading = true;
    this.clearMessage();
    
    this.reportService.generateOverduePdfReport().subscribe({
      next: (response) => {
        this.reportService.downloadFile(response, 'reservas_vencidas.pdf');
        this.showMessage('Reporte de vencidas (PDF) generado exitosamente', 'success');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generando reporte PDF de vencidas:', error);
        this.showMessage('Error al generar el reporte PDF de vencidas', 'error');
        this.loading = false;
      }
    });
  }

  generateMonthlyReport(): void {
    this.loading = true;
    this.clearMessage();
    
    this.reportService.generateMonthlyReport().subscribe({
      next: (response) => {
        this.reportService.downloadFile(response, 'reporte_mensual.csv');
        this.showMessage('Reporte mensual (CSV) generado exitosamente', 'success');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generando reporte mensual:', error);
        this.showMessage('Error al generar el reporte mensual', 'error');
        this.loading = false;
      }
    });
  }

  generateMonthlyHtmlReport(): void {
    this.loading = true;
    this.clearMessage();
    
    this.reportService.generateMonthlyHtmlReport().subscribe({
      next: (response) => {
        this.reportService.downloadFile(response, 'reporte_mensual.html');
        this.showMessage('Reporte mensual (HTML) generado exitosamente', 'success');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generando reporte mensual HTML:', error);
        this.showMessage('Error al generar el reporte mensual HTML', 'error');
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadReportData();
  }

  clearFilters(): void {
    this.filterForm.reset({
      startDate: '',
      endDate: '',
      status: '',
      overdueOnly: false,
      format: ReportFormat.HTML
    });
    this.loadReportData();
  }

  getStatusClass(status: string, isOverdue: boolean): string {
    if (isOverdue) return 'status-overdue';
    
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      case 'PENDING': return 'status-pending';
      default: return '';
    }
  }

  getStatusText(status: string, isOverdue: boolean): string {
    if (isOverdue) return this.translateStatus(status) + ' (VENCIDA)';
    return this.translateStatus(status);
  }

  private translateStatus(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'ACTIVE': return 'Activa';
      case 'COMPLETED': return 'Completada';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  private showMessage(text: string, type: string): void {
    this.message = text;
    this.messageType = type;
    setTimeout(() => this.clearMessage(), 5000);
  }

  private clearMessage(): void {
    this.message = '';
    this.messageType = '';
  }
}