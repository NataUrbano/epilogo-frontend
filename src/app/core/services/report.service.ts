import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportRequest {
  format: ReportFormat;
  startDate?: string;
  endDate?: string;
  status?: string;
  overdueOnly?: boolean;
  reportType?: ReportType;  // <-- Agrega esta línea
}

export enum ReportType {
  RESERVATIONS = 'RESERVATIONS',
  USERS = 'USERS',
}


export interface ReportData {
  reservationId: number;
  userName: string;
  userEmail: string;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn: string;
  reservationDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: string;
  isOverdue: boolean;
}

export enum ReportFormat {
  HTML = 'HTML',
  PDF = 'PDF',
  CSV = 'CSV',
  EXCEL = "EXCEL"
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  /**
   * Genera y descarga un reporte
   */
  generateReport(request: ReportRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/generate`, request, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  /**
   * Obtiene datos del reporte para vista previa
   */
  getReportData(request: ReportRequest): Observable<ReportData[]> {
    let params = new HttpParams();

    if (request.startDate) {
      params = params.set('startDate', request.startDate);
    }
    if (request.endDate) {
      params = params.set('endDate', request.endDate);
    }
    if (request.status) {
      params = params.set('status', request.status);
    }
    if (request.overdueOnly !== undefined) {
      params = params.set('overdueOnly', request.overdueOnly.toString());
    }

    return this.http.get<ReportData[]>(`${this.apiUrl}/data`, { params });
  }

  /**
   * Genera reporte rápido de reservas vencidas en HTML
   */
  generateOverdueReport(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/overdue`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  /**
   * Genera reporte rápido de reservas vencidas en PDF
   */
  generateOverduePdfReport(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/overdue/pdf`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  /**
   * Genera reporte mensual en CSV
   */
  generateMonthlyReport(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/monthly`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  /**
   * Genera reporte mensual en HTML
   */
  generateMonthlyHtmlReport(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/monthly/html`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  /**
   * Descarga un archivo desde una respuesta HTTP
   */
  downloadFile(response: HttpResponse<Blob>, defaultFileName: string = 'reporte'): void {
    const blob = response.body;
    if (!blob) return;

    const fileName = this.getFileNameFromResponse(response) || defaultFileName;
    
    // Si es HTML, abrir en nueva ventana en lugar de descargar
    if (fileName.endsWith('.html')) {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Limpiar URL después de un tiempo
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } else {
      // Para PDF y CSV, descargar normalmente
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }

  private getFileNameFromResponse(response: HttpResponse<Blob>): string | null {
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch) {
        return fileNameMatch[1];
      }
    }
    return null;
  }
}