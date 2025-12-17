// PDFExportButton.tsx
// Add this component to your project to enable PDF downloads

import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

interface PDFExportButtonProps {
  book: {
    title: string;
    author: string;
    pages: Array<{
      pageNumber: number;
      text: string;
      imageUrl?: string;
      imageData?: string;
    }>;
  };
  className?: string;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({ book, className }) => {
  const generatePDF = async () => {
    try {
      // Create PDF with standard page size
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // Title Page
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      const titleLines = pdf.splitTextToSize(book.title || 'Untitled', contentWidth);
      let yPosition = pageHeight / 3;
      titleLines.forEach((line: string) => {
        const titleWidth = pdf.getTextWidth(line);
        pdf.text(line, (pageWidth - titleWidth) / 2, yPosition);
        yPosition += 12;
      });

      // Author
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'normal');
      yPosition += 20;
      const authorText = `by ${book.author || 'Young Author'}`;
      const authorWidth = pdf.getTextWidth(authorText);
      pdf.text(authorText, (pageWidth - authorWidth) / 2, yPosition);

      // Add decorative line
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition + 10, pageWidth - margin, yPosition + 10);

      // Content Pages
      for (const page of book.pages) {
        pdf.addPage();

        // Page number at top
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${page.pageNumber}`, pageWidth - margin - 15, margin);

        yPosition = margin + 10;

        // Add image if exists
        if (page.imageData || page.imageUrl) {
          try {
            const imgData = page.imageData || page.imageUrl;
            const imgWidth = contentWidth * 0.6; // 60% of content width
            const imgX = (pageWidth - imgWidth) / 2; // Center image
            
            pdf.addImage(imgData, 'JPEG', imgX, yPosition, imgWidth, imgWidth * 0.75);
            yPosition += (imgWidth * 0.75) + 10; // Image height + spacing
          } catch (error) {
            console.error('Error adding image:', error);
          }
        }

        // Add text content
        if (page.text && page.text.trim()) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          
          const textLines = pdf.splitTextToSize(page.text, contentWidth);
          const lineHeight = 7;
          
          textLines.forEach((line: string) => {
            if (yPosition > pageHeight - margin - 20) {
              // Text would go off page, add new page
              pdf.addPage();
              yPosition = margin;
              pdf.setFontSize(10);
              pdf.text(`Page ${page.pageNumber} (continued)`, pageWidth - margin - 40, margin);
              yPosition = margin + 10;
              pdf.setFontSize(12);
            }
            
            pdf.text(line, margin, yPosition);
            yPosition += lineHeight;
          });
        }

        // Decorative footer
        pdf.setLineWidth(0.3);
        pdf.line(margin, pageHeight - margin + 5, pageWidth - margin, pageHeight - margin + 5);
      }

      // Save the PDF
      const fileName = `${book.title || 'My-Book'}.pdf`.replace(/[^a-z0-9]/gi, '-');
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error creating PDF. Please try again.');
    }
  };

  return (
    <Button
      onClick={generatePDF}
      className={`bg-[#ffd700] text-[#1a2744] hover:bg-[#e6c200] ${className}`}
    >
      <Download className="w-4 h-4 mr-2" />
      Download as PDF
    </Button>
  );
};
