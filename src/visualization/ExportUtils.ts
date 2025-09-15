/**
 * Export Utilities for TappMCP Dashboard
 * Provides comprehensive export functionality for visualizations and data
 */

import * as d3 from 'd3';

export interface ExportOptions {
  format: 'PNG' | 'SVG' | 'JSON' | 'PDF';
  quality?: number; // 1-100 for PNG
  includeData?: boolean; // For JSON exports
  includeMetadata?: boolean; // For all exports
  filename?: string;
  width?: number;
  height?: number;
}

export interface ExportData {
  type: 'workflow' | 'timeline' | 'performance' | 'value' | 'dashboard';
  data: any;
  metadata: {
    timestamp: number;
    version: string;
    exportFormat: string;
    generatedBy: string;
  };
}

export class DashboardExporter {
  private static instance: DashboardExporter;
  private exportQueue: Array<{ data: ExportData; options: ExportOptions }> = [];
  private isProcessing = false;

  static getInstance(): DashboardExporter {
    if (!DashboardExporter.instance) {
      DashboardExporter.instance = new DashboardExporter();
    }
    return DashboardExporter.instance;
  }

  /**
   * Export visualization as PNG
   */
  async exportPNG(svgElement: SVGSVGElement, options: ExportOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Set canvas dimensions
        const width = options.width || svgElement.clientWidth;
        const height = options.height || svgElement.clientHeight;
        canvas.width = width;
        canvas.height = height;

        // Set background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Convert SVG to image
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);

          // Convert to PNG
          canvas.toBlob(
            blob => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create PNG blob'));
              }
            },
            'image/png',
            options.quality ? options.quality / 100 : 0.9
          );
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG image'));
        };

        img.src = url;
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Export visualization as SVG
   */
  async exportSVG(svgElement: SVGSVGElement, options: ExportOptions): Promise<Blob> {
    try {
      // Clone the SVG element
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

      // Set dimensions if specified
      if (options.width) clonedSvg.setAttribute('width', options.width.toString());
      if (options.height) clonedSvg.setAttribute('height', options.height.toString());

      // Add metadata if requested
      if (options.includeMetadata) {
        const metadata = this.createMetadataElement(options);
        clonedSvg.insertBefore(metadata, clonedSvg.firstChild);
      }

      // Serialize to string
      const svgString = new XMLSerializer().serializeToString(clonedSvg);

      return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    } catch (error) {
      throw new Error(`Failed to export SVG: ${error}`);
    }
  }

  /**
   * Export data as JSON
   */
  async exportJSON(data: ExportData, options: ExportOptions): Promise<Blob> {
    try {
      const exportData = {
        ...data,
        exportInfo: {
          timestamp: new Date().toISOString(),
          format: options.format,
          version: '2.0',
          generatedBy: 'TappMCP Dashboard',
        },
      };

      // Add metadata if requested
      if (options.includeMetadata) {
        exportData.metadata = {
          ...data.metadata,
          exportTimestamp: Date.now(),
          exportOptions: options,
        };
      }

      const jsonString = JSON.stringify(exportData, null, 2);
      return new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    } catch (error) {
      throw new Error(`Failed to export JSON: ${error}`);
    }
  }

  /**
   * Export as PDF (using browser print functionality)
   */
  async exportPDF(svgElement: SVGSVGElement, options: ExportOptions): Promise<void> {
    try {
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window');
      }

      // Get SVG data
      const svgData = new XMLSerializer().serializeToString(svgElement);

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>TappMCP Dashboard Export</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .metadata {
              font-size: 12px;
              color: #666;
              margin-bottom: 20px;
            }
            .chart-container {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 400px;
            }
            svg {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TappMCP Dashboard Export</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          ${
            options.includeMetadata
              ? `
            <div class="metadata">
              <p><strong>Export Type:</strong> ${data.type}</p>
              <p><strong>Format:</strong> ${options.format}</p>
              <p><strong>Generated By:</strong> TappMCP Dashboard v2.0</p>
            </div>
          `
              : ''
          }
          <div class="chart-container">
            ${svgData}
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
    } catch (error) {
      throw new Error(`Failed to export PDF: ${error}`);
    }
  }

  /**
   * Export multiple formats in batch
   */
  async exportBatch(
    svgElement: SVGSVGElement,
    data: ExportData,
    formats: Array<'PNG' | 'SVG' | 'JSON' | 'PDF'>,
    options: Partial<ExportOptions> = {}
  ): Promise<Map<string, Blob>> {
    const results = new Map<string, Blob>();

    for (const format of formats) {
      try {
        const formatOptions: ExportOptions = {
          format,
          filename: options.filename || `tappmcp-export-${Date.now()}`,
          ...options,
        };

        let blob: Blob;
        switch (format) {
          case 'PNG':
            blob = await this.exportPNG(svgElement, formatOptions);
            break;
          case 'SVG':
            blob = await this.exportSVG(svgElement, formatOptions);
            break;
          case 'JSON':
            blob = await this.exportJSON(data, formatOptions);
            break;
          case 'PDF':
            await this.exportPDF(svgElement, formatOptions);
            continue; // PDF doesn't return a blob
        }

        results.set(format, blob);
      } catch (error) {
        console.error(`Failed to export ${format}:`, error);
        // Continue with other formats
      }
    }

    return results;
  }

  /**
   * Download exported file
   */
  downloadFile(blob: Blob, filename: string, mimeType: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Create metadata element for SVG exports
   */
  private createMetadataElement(options: ExportOptions): SVGMetadataElement {
    const metadata = document.createElementNS('http://www.w3.org/2000/svg', 'metadata');
    const metadataContent = document.createElementNS('http://www.w3.org/2000/svg', 'rdf:RDF');

    const metadataString = `
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
               xmlns:dc="http://purl.org/dc/elements/1.1/"
               xmlns:cc="http://creativecommons.org/ns#">
        <rdf:Description rdf:about="">
          <dc:title>TappMCP Dashboard Export</dc:title>
          <dc:creator>TappMCP Dashboard v2.0</dc:creator>
          <dc:description>Exported visualization from TappMCP AI Assistant Enhancement Platform</dc:description>
          <dc:date>${new Date().toISOString()}</dc:date>
          <dc:format>${options.format}</dc:format>
          <cc:license rdf:resource="https://creativecommons.org/licenses/by/4.0/"/>
        </rdf:Description>
      </rdf:RDF>
    `;

    metadataContent.innerHTML = metadataString;
    metadata.appendChild(metadataContent);

    return metadata;
  }

  /**
   * Get export statistics
   */
  getExportStats(): { totalExports: number; successfulExports: number; failedExports: number } {
    // This would track export statistics in a real implementation
    return {
      totalExports: 0,
      successfulExports: 0,
      failedExports: 0,
    };
  }

  /**
   * Clear export queue
   */
  clearQueue(): void {
    this.exportQueue = [];
  }
}

// Export utility functions
export const exportUtils = {
  /**
   * Format filename with timestamp
   */
  formatFilename(baseName: string, format: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${baseName}-${timestamp}.${format.toLowerCase()}`;
  },

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Validate export options
   */
  validateExportOptions(options: ExportOptions): string[] {
    const errors: string[] = [];

    if (!options.format) {
      errors.push('Export format is required');
    }

    if (options.quality && (options.quality < 1 || options.quality > 100)) {
      errors.push('Quality must be between 1 and 100');
    }

    if (options.width && options.width < 100) {
      errors.push('Width must be at least 100 pixels');
    }

    if (options.height && options.height < 100) {
      errors.push('Height must be at least 100 pixels');
    }

    return errors;
  },
};

export default DashboardExporter;
