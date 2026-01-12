import { jsPDF } from "jspdf";
import { EventDTO } from "../Domain/DTOs/EventDTO";

export interface AlertReportDTO {
    source: string;
    severity: string;
    status: string;
    createdAt: string;
    description: string;
}

export class PdfGenerator {
    public static async createReport(events: EventDTO[]): Promise<string> {
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("Security Event Report", 14, 20);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Total events found: ${events.length}`, 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);
        
        doc.setFont("helvetica", "bold");
        doc.setFillColor(240, 240, 240);
        doc.rect(14, 45, 182, 8, 'F');
        doc.text("SOURCE", 16, 51);
        doc.text("TYPE", 70, 51);
        doc.text("TIMESTAMP", 110, 51);
        
        doc.setFont("helvetica", "normal");
        let y = 60;

        events.forEach((e) => {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            const date = new Date(e.timestamp);
            const shortDate = date.toLocaleString();
            doc.text(String(e.source), 16, y);
            doc.text(String(e.type), 70, y);
            doc.text(shortDate, 110, y);
            doc.setDrawColor(220, 220, 220);
            doc.line(14, y + 2, 196, y + 2);
            y += 10;
        });

        const pdfBase64 = doc.output('datauristring').split(',')[1];
        return pdfBase64;
    }

    public static async createAlertReport(alerts: AlertReportDTO[]): Promise<string> {
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(180, 0, 0); 
        doc.text("SIEM ALERTS REPORT", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.text(`Total alerts: ${alerts.length}`, 14, 30);
        doc.text(`Date generated: ${new Date().toLocaleString()}`, 14, 35);
        
        doc.setFont("helvetica", "bold");
        doc.setFillColor(230, 230, 230);
        doc.rect(14, 45, 182, 10, 'F');
        
        doc.text("SOURCE", 16, 52);
        doc.text("SEVERITY", 60, 52);
        doc.text("STATUS", 95, 52);
        doc.text("TIME", 130, 52);
        
        let y = 65;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        alerts.forEach((a) => {
            if (y > 275) {
                doc.addPage();
                y = 20;
            }

            if (a.severity.toLowerCase() === 'high' || a.severity.toLowerCase() === 'critical') {
                doc.setTextColor(200, 0, 0);
            } else if (a.severity.toLowerCase() === 'medium') {
                doc.setTextColor(200, 100, 0);
            } else {
                doc.setTextColor(0, 0, 0);
            }

            doc.text(String(a.source), 16, y);
            doc.text(String(a.severity).toUpperCase(), 60, y);
            doc.setTextColor(0, 0, 0); 
            doc.text(String(a.status), 95, y);
            doc.text(String(a.createdAt), 130, y);
            
            if (a.description) {
                y += 5;
                doc.setFontSize(8);
                doc.setFont("helvetica", "italic");
                doc.setTextColor(100, 100, 100);
                doc.text(`Rule: ${a.description}`, 16, y);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
            }

            doc.setDrawColor(235, 235, 235);
            doc.line(14, y + 2, 196, y + 2);
            y += 12;
        });

        const pdfBase64 = doc.output('datauristring').split(',')[1];
        return pdfBase64;
    }
}