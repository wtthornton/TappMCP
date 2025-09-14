import React, { useState, useRef } from 'react';
import { DashboardExporter, ExportOptions, ExportData, exportUtils } from './ExportUtils';

interface ExportPanelProps {
  data: ExportData;
  svgRef?: React.RefObject<SVGSVGElement>;
  onExport?: (format: string, success: boolean) => void;
  className?: string;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  data,
  svgRef,
  onExport,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<Array<'PNG' | 'SVG' | 'JSON' | 'PDF'>>(['PNG']);
  const [exportOptions, setExportOptions] = useState<Partial<ExportOptions>>({
    quality: 90,
    includeData: true,
    includeMetadata: true,
    width: 1200,
    height: 800
  });
  const [exportStats, setExportStats] = useState({
    totalExports: 0,
    successfulExports: 0,
    failedExports: 0
  });

  const exporter = DashboardExporter.getInstance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormatChange = (format: 'PNG' | 'SVG' | 'JSON' | 'PDF', checked: boolean) => {
    if (checked) {
      setSelectedFormats(prev => [...prev, format]);
    } else {
      setSelectedFormats(prev => prev.filter(f => f !== format));
    }
  };

  const handleExport = async () => {
    if (selectedFormats.length === 0 || !svgRef?.current) {
      onExport?.('none', false);
      return;
    }

    setIsExporting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      if (selectedFormats.includes('PDF')) {
        // PDF export doesn't return a blob
        await exporter.exportPDF(svgRef.current, {
          format: 'PDF',
          filename: exportUtils.formatFilename('tappmcp-dashboard', 'pdf'),
          ...exportOptions
        } as ExportOptions);
        successCount++;
      } else {
        // Export other formats
        const results = await exporter.exportBatch(
          svgRef.current,
          data,
          selectedFormats.filter(f => f !== 'PDF'),
          {
            filename: exportUtils.formatFilename('tappmcp-dashboard', 'export'),
            ...exportOptions
          }
        );

        // Download files
        for (const [format, blob] of results) {
          try {
            const filename = exportUtils.formatFilename(
              `tappmcp-dashboard-${data.type}`,
              format.toLowerCase()
            );
            const mimeType = format === 'PNG' ? 'image/png' :
                           format === 'SVG' ? 'image/svg+xml' :
                           'application/json';

            exporter.downloadFile(blob, filename, mimeType);
            successCount++;
          } catch (error) {
            console.error(`Failed to download ${format}:`, error);
            failCount++;
          }
        }
      }

      // Update stats
      setExportStats(prev => ({
        totalExports: prev.totalExports + selectedFormats.length,
        successfulExports: prev.successfulExports + successCount,
        failedExports: prev.failedExports + failCount
      }));

      onExport?.(selectedFormats.join(', '), successCount > 0);
    } catch (error) {
      console.error('Export failed:', error);
      failCount = selectedFormats.length;
      onExport?.(selectedFormats.join(', '), false);
    } finally {
      setIsExporting(false);
    }
  };

  const validateOptions = (): string[] => {
    return exportUtils.validateExportOptions({
      format: selectedFormats[0] || 'PNG',
      ...exportOptions
    } as ExportOptions);
  };

  const errors = validateOptions();
  const canExport = selectedFormats.length > 0 && errors.length === 0 && !isExporting;

  return (
    <div className={`export-panel ${className}`} style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
        📤 Export Dashboard
      </h3>

      {/* Format Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Export Formats:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { format: 'PNG', label: 'PNG Image', icon: '🖼️' },
            { format: 'SVG', label: 'SVG Vector', icon: '📐' },
            { format: 'JSON', label: 'JSON Data', icon: '📊' },
            { format: 'PDF', label: 'PDF Report', icon: '📄' }
          ].map(({ format, label, icon }) => (
            <label key={format} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              background: selectedFormats.includes(format as any) ? '#f0f9ff' : 'white'
            }}>
              <input
                type="checkbox"
                checked={selectedFormats.includes(format as any)}
                onChange={(e) => handleFormatChange(format as any, e.target.checked)}
                style={{ margin: 0 }}
              />
              <span>{icon}</span>
              <span style={{ fontSize: '14px' }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Export Options:
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              Quality (PNG):
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={exportOptions.quality || 90}
              onChange={(e) => setExportOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
              {exportOptions.quality}%
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              Width:
            </label>
            <input
              type="number"
              min="100"
              max="4000"
              value={exportOptions.width || 1200}
              onChange={(e) => setExportOptions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
              style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              Height:
            </label>
            <input
              type="number"
              min="100"
              max="4000"
              value={exportOptions.height || 800}
              onChange={(e) => setExportOptions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
              style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
              <input
                type="checkbox"
                checked={exportOptions.includeMetadata || false}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
              />
              <span style={{ fontSize: '14px' }}>Include Metadata</span>
            </label>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ color: '#dc2626', fontWeight: '500', marginBottom: '4px' }}>
            Validation Errors:
          </div>
          {errors.map((error, i) => (
            <div key={i} style={{ color: '#dc2626', fontSize: '14px' }}>
              • {error}
            </div>
          ))}
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={!canExport}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: canExport ? '#3b82f6' : '#9ca3af',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: canExport ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
      >
        {isExporting ? (
          <>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #ffffff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Exporting...
          </>
        ) : (
          <>
            📤 Export ({selectedFormats.length} formats)
          </>
        )}
      </button>

      {/* Export Statistics */}
      {exportStats.totalExports > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#f8fafc',
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>Export Statistics:</div>
          <div style={{ color: '#6b7280' }}>
            Total: {exportStats.totalExports} |
            Successful: <span style={{ color: '#10b981' }}>{exportStats.successfulExports}</span> |
            Failed: <span style={{ color: '#ef4444' }}>{exportStats.failedExports}</span>
          </div>
        </div>
      )}

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ExportPanel;
