import { jsPDF } from "jspdf";
import { EventDTO } from "../Domain/DTOs/EventDTO";

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
        
        // Sadržaj
        doc.setFont("helvetica", "normal");
        let y = 60;

        events.forEach((e) => {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }

            const date = new Date(e.timestamp);
            const shortDate = date.toLocaleString(); // Format: 26/10/2025, 05:47:39

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
}