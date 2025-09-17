/**
 * Debug HTML Generator
 * Converts CallTreeTracer output to interactive HTML dashboard
 */

import { CallTreeReport } from '../tracing/types.js';

export interface DebugHTMLOptions {
  theme?: 'light' | 'dark';
  includeMetrics?: boolean;
  includeTimeline?: boolean;
  includeExport?: boolean;
}

export class DebugHTMLGenerator {
  private options: Required<DebugHTMLOptions>;

  constructor(options: DebugHTMLOptions = {}) {
    this.options = {
      theme: options.theme || 'light',
      includeMetrics: options.includeMetrics ?? true,
      includeTimeline: options.includeTimeline ?? true,
      includeExport: options.includeExport ?? true,
    };
  }

  /**
   * Generate HTML from trace data
   */
  generateHTML(traceData: CallTreeReport): string {
    const htmlTemplate = this.getHTMLTemplate();
    const debugData = this.prepareDebugData(traceData);

    return htmlTemplate
      .replace('{{DEBUG_DATA}}', JSON.stringify(debugData))
      .replace('{{THEME}}', this.options.theme)
      .replace('{{TIMESTAMP}}', new Date().toISOString());
  }

  /**
   * Prepare debug data for frontend consumption
   */
  private prepareDebugData(traceData: CallTreeReport) {
    return {
      summary: traceData.summary,
      timeline: traceData.timeline,
      context7Details: traceData.context7Details,
      toolExecution: traceData.toolExecution,
      performance: traceData.performance,
      generatedAt: new Date().toISOString(),
      options: this.options
    };
  }

  /**
   * Get HTML template with embedded data
   */
  private getHTMLTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="TappMCP Debug Dashboard - Interactive debugging interface">
    <title>TappMCP Debug Dashboard</title>

    <!-- Critical CSS -->
    <style>
        :root {
            --primary-color: #2196F3;
            --success-color: #4CAF50;
            --warning-color: #FF9800;
            --error-color: #F44336;
            --background-color: #FAFAFA;
            --text-color: #333333;
            --card-background: #FFFFFF;
            --border-radius: 8px;
            --box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --background-color: #121212;
                --text-color: #FFFFFF;
                --card-background: #1E1E1E;
            }
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--background-color);
            color: var(--text-color);
            line-height: 1.6;
        }

        .debug-dashboard {
            display: grid;
            grid-template-rows: auto 1fr auto;
            min-height: 100vh;
        }

        .header {
            background: var(--card-background);
            padding: 1rem 2rem;
            box-shadow: var(--box-shadow);
            border-bottom: 1px solid #E0E0E0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            color: var(--primary-color);
            font-size: 1.5rem;
            font-weight: 600;
        }

        .header-controls {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .theme-toggle {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: var(--transition);
        }

        .theme-toggle:hover {
            opacity: 0.9;
        }

        .main {
            padding: 2rem;
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 2rem;
            max-width: 1400px;
            margin: 0 auto;
            width: 100%;
        }

        .call-tree-container {
            background: var(--card-background);
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            padding: 1.5rem;
            overflow: hidden;
        }

        .call-tree-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #E0E0E0;
        }

        .call-tree-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--text-color);
        }

        .call-tree-controls {
            display: flex;
            gap: 0.5rem;
        }

        .filter-btn {
            background: #f5f5f5;
            border: 1px solid #ddd;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
            transition: var(--transition);
        }

        .filter-btn:hover, .filter-btn.active {
            background: var(--primary-color);
            color: white;
        }

        .metrics-panel {
            background: var(--card-background);
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            padding: 1.5rem;
            height: fit-content;
        }

        .metrics-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-color);
        }

        .metric-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .metric-label {
            font-weight: 500;
            color: var(--text-color);
        }

        .metric-value {
            color: var(--primary-color);
            font-weight: 600;
        }

        .footer {
            background: var(--card-background);
            padding: 1rem 2rem;
            text-align: center;
            color: #666;
            border-top: 1px solid #E0E0E0;
        }

        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
            color: #666;
        }

        .error {
            color: var(--error-color);
            background: #FFEBEE;
            padding: 1rem;
            border-radius: var(--border-radius);
            border-left: 4px solid var(--error-color);
        }

        .call-node {
            cursor: pointer;
            transition: var(--transition);
        }

        .call-node:hover {
            transform: translateY(-2px);
        }

        .node-rect {
            transition: var(--transition);
        }

        .node-rect:hover {
            stroke-width: 2px;
            stroke: var(--primary-color);
        }

        @media (max-width: 768px) {
            .main {
                grid-template-columns: 1fr;
                padding: 1rem;
            }

            .header {
                flex-direction: column;
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="debug-dashboard">
        <header class="header">
            <h1>🎯 TappMCP Debug Dashboard</h1>
            <div class="header-controls">
                <button class="theme-toggle" onclick="toggleTheme()">🌙 Dark</button>
            </div>
        </header>

        <main class="main">
            <div class="call-tree-container">
                <div class="call-tree-header">
                    <h2 class="call-tree-title">🌳 Call Tree</h2>
                    <div class="call-tree-controls">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="errors">Errors</button>
                        <button class="filter-btn" data-filter="slow">Slow</button>
                    </div>
                </div>
                <div id="call-tree-visualization">
                    <div class="loading">Loading debug data...</div>
                </div>
            </div>

            <div class="metrics-panel">
                <h3 class="metrics-title">📊 Debug Metrics</h3>
                <div id="metrics-content">
                    <div class="loading">Loading metrics...</div>
                </div>
            </div>
        </main>

        <footer class="footer">
            <p>TappMCP Debug Dashboard v1.0 | Generated at <span id="timestamp"></span></p>
        </footer>
    </div>

    <!-- D3.js for visualizations -->
    <script src="https://d3js.org/d3.v7.min.js"></script>

    <!-- Debug Dashboard Script -->
    <script>
        // Debug data embedded in HTML
        const debugData = {{DEBUG_DATA}};

        class DebugDashboard {
            constructor(data) {
                this.data = data;
                this.filteredData = data.timeline || [];
                this.init();
            }

            init() {
                this.setTimestamp();
                this.renderCallTree();
                this.renderMetrics();
                this.bindEvents();
            }

            setTimestamp() {
                document.getElementById('timestamp').textContent = new Date().toLocaleString();
            }

            bindEvents() {
                // Filter buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        this.filterData(e.target.dataset.filter);
                    });
                });
            }

            filterData(filter) {
                switch(filter) {
                    case 'errors':
                        this.filteredData = this.data.timeline.filter(node => node.error);
                        break;
                    case 'slow':
                        this.filteredData = this.data.timeline.filter(node => node.duration > 1000);
                        break;
                    default:
                        this.filteredData = this.data.timeline || [];
                }
                this.renderCallTree();
            }

            renderCallTree() {
                const container = document.getElementById('call-tree-visualization');

                if (!this.data || !this.filteredData.length) {
                    container.innerHTML = '<div class="error">No debug data available</div>';
                    return;
                }

                // Create SVG for call tree
                const width = container.clientWidth;
                const height = Math.max(400, this.filteredData.length * 60);

                const svg = d3.select(container)
                    .html('')
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);

                // Render call tree nodes
                this.renderCallTreeNodes(svg, this.filteredData, width, height);
            }

            renderCallTreeNodes(svg, timeline, width, height) {
                const nodeHeight = 50;
                const nodeWidth = Math.min(300, width - 40);
                const padding = 20;

                const nodes = svg.selectAll('.call-node')
                    .data(timeline)
                    .enter()
                    .append('g')
                    .attr('class', 'call-node')
                    .attr('transform', (d, i) => \`translate(\${padding}, \${i * (nodeHeight + 10) + padding})\`);

                // Node rectangles
                nodes.append('rect')
                    .attr('class', 'node-rect')
                    .attr('width', nodeWidth)
                    .attr('height', nodeHeight)
                    .attr('rx', 4)
                    .attr('fill', d => this.getNodeColor(d))
                    .attr('stroke', '#ccc')
                    .attr('stroke-width', 1);

                // Node text
                nodes.append('text')
                    .attr('x', 10)
                    .attr('y', 20)
                    .attr('font-size', '12px')
                    .attr('font-weight', 'bold')
                    .text(d => d.tool);

                nodes.append('text')
                    .attr('x', 10)
                    .attr('y', 35)
                    .attr('font-size', '10px')
                    .attr('fill', '#666')
                    .text(d => \`\${d.phase} | \${d.duration || 0}ms\`);

                // Status indicator
                nodes.append('text')
                    .attr('x', nodeWidth - 20)
                    .attr('y', 20)
                    .attr('font-size', '16px')
                    .text(d => d.error ? '❌' : '✅');

                // Click handler for node details
                nodes.on('click', (event, d) => {
                    this.showNodeDetails(d);
                });
            }

            getNodeColor(node) {
                if (node.error) return '#FFEBEE';
                if (node.duration > 1000) return '#FFF3E0';
                if (node.tool === 'context7') return '#E3F2FD';
                if (node.tool === 'cache') return '#F3E5F5';
                return '#E8F5E8';
            }

            showNodeDetails(node) {
                const details = \`
                    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                                background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                                max-width: 500px; max-height: 80vh; overflow-y: auto; z-index: 1000;">
                        <h3>Node Details: \${node.tool}</h3>
                        <p><strong>Phase:</strong> \${node.phase}</p>
                        <p><strong>Duration:</strong> \${node.duration || 0}ms</p>
                        <p><strong>Success:</strong> \${node.error ? '❌' : '✅'}</p>
                        \${node.error ? \`<p><strong>Error:</strong> \${node.error}</p>\` : ''}
                        \${node.parameters ? \`<p><strong>Parameters:</strong> <pre>\${JSON.stringify(node.parameters, null, 2)}</pre></p>\` : ''}
                        <button onclick="this.parentElement.remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                    </div>
                \`;
                document.body.insertAdjacentHTML('beforeend', details);
            }

            renderMetrics() {
                const container = document.getElementById('metrics-content');

                if (!this.data || !this.data.summary) {
                    container.innerHTML = '<div class="error">No metrics available</div>';
                    return;
                }

                const summary = this.data.summary;
                container.innerHTML = \`
                    <div class="metric-item">
                        <span class="metric-label">Total Duration</span>
                        <span class="metric-value">\${summary.totalDuration || 0}ms</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Tools Used</span>
                        <span class="metric-value">\${summary.toolsUsed?.length || 0}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Context7 Calls</span>
                        <span class="metric-value">\${summary.context7Calls || 0}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Cache Hits</span>
                        <span class="metric-value">\${summary.cacheHits || 0}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Cache Misses</span>
                        <span class="metric-value">\${summary.cacheMisses || 0}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Errors</span>
                        <span class="metric-value">\${summary.errors || 0}</span>
                    </div>
                \`;
            }
        }

        // Theme toggle functionality
        function toggleTheme() {
            document.body.classList.toggle('dark-theme');
            const btn = document.querySelector('.theme-toggle');
            btn.textContent = document.body.classList.contains('dark-theme') ? '☀️ Light' : '🌙 Dark';
        }

        // Initialize dashboard
        new DebugDashboard(debugData);
    </script>
</body>
</html>`;
  }
}

export default DebugHTMLGenerator;
