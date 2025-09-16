/**
 * Smart Quality Tool - MCP Integration
 *
 * MCP tool handler for the Smart Code Quality Engine
 * Provides natural language interface for code quality analysis and improvement
 *
 * Task 2.3.5: Code Quality Improvement Engine Completion
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SmartCodeQualityEngine, QualityEngineConfig, QualityReport, BatchAnalysisResult } from './smart-code-quality-engine.js';
import { CallTreeTracer } from '../tracing/CallTreeTracer.js';

// Global quality engine instance
let qualityEngine: SmartCodeQualityEngine | null = null;

export const smartQualityTool: Tool = {
  name: 'smart_quality',
  description: 'AI-powered code quality analysis and improvement engine with comprehensive quality metrics, automated fixes, trend tracking, and batch processing capabilities.',
  inputSchema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'Quality analysis command (analyze, batch, report, improve, monitor, trends, rules)',
        enum: ['analyze', 'batch', 'report', 'improve', 'monitor', 'trends', 'rules', 'config']
      },
      files: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path' },
            code: { type: 'string', description: 'File content' },
            language: { type: 'string', description: 'Programming language', default: 'typescript' }
          },
          required: ['path', 'code']
        },
        description: 'Files to analyze (for analyze, batch, improve commands)'
      },
      filePath: {
        type: 'string',
        description: 'Single file path (for analyze, improve commands)'
      },
      code: {
        type: 'string',
        description: 'Code content (for analyze, improve commands)'
      },
      language: {
        type: 'string',
        description: 'Programming language',
        default: 'typescript'
      },
      improvements: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            issueId: { type: 'string', description: 'Issue ID to fix' },
            recommendationId: { type: 'string', description: 'Recommendation ID to apply' }
          },
          required: ['issueId', 'recommendationId']
        },
        description: 'Improvements to apply (for improve command)'
      },
      config: {
        type: 'object',
        description: 'Quality engine configuration (for config command)',
        properties: {
          enableRealTimeMonitoring: { type: 'boolean' },
          enableAutomatedFixes: { type: 'boolean' },
          enableTrendAnalysis: { type: 'boolean' },
          qualityThresholds: {
            type: 'object',
            properties: {
              critical: { type: 'number' },
              high: { type: 'number' },
              medium: { type: 'number' },
              low: { type: 'number' }
            }
          }
        }
      },
      rule: {
        type: 'object',
        description: 'Custom quality rule (for rules command)',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          pattern: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          enabled: { type: 'boolean' }
        }
      },
      action: {
        type: 'string',
        description: 'Action for rules command (add, remove, list)',
        enum: ['add', 'remove', 'list']
      }
    },
    required: ['command']
  }
};

export async function handleSmartQuality(args: any): Promise<any> {
  const startTime = Date.now();
  const tracer = new CallTreeTracer();

  try {
    tracer.startTrace('initialize_engine');

    // Initialize quality engine if not already done
    if (!qualityEngine) {
      qualityEngine = new SmartCodeQualityEngine();
      console.log('✅ Smart Code Quality Engine initialized');
    }

    tracer.endTrace();
    tracer.startTrace('process_command');

    const { command, files, filePath, code, language, improvements, config, rule, action } = args;

    let result: any = {};

    switch (command) {
      case 'analyze':
        result = await handleAnalyzeCommand(qualityEngine, { filePath, code, language });
        break;

      case 'batch':
        result = await handleBatchCommand(qualityEngine, { files });
        break;

      case 'report':
        result = await handleReportCommand(qualityEngine, { files });
        break;

      case 'improve':
        result = await handleImproveCommand(qualityEngine, { filePath, code, improvements });
        break;

      case 'monitor':
        result = await handleMonitorCommand(qualityEngine, { action: args.action || 'start' });
        break;

      case 'trends':
        result = await handleTrendsCommand(qualityEngine, { filePath });
        break;

      case 'rules':
        result = await handleRulesCommand(qualityEngine, { action, rule });
        break;

      case 'config':
        result = await handleConfigCommand(qualityEngine, { config });
        break;

      default:
        throw new Error(`Unknown command: ${command}`);
    }

    tracer.endTrace();
    tracer.startTrace('format_response');

    const response = formatQualityResponse(result, command, Date.now() - startTime);

    tracer.endTrace();
    const traceData = tracer.endTrace();

    return {
      content: [
        {
          type: 'text',
          text: response
        }
      ],
      trace: traceData,
      traceInfo: {
        command,
        executionTime: Date.now() - startTime,
        engineStatus: 'active',
        features: ['analysis', 'batch_processing', 'trend_tracking', 'automated_fixes', 'custom_rules']
      }
    };

  } catch (error) {
    console.error('❌ Smart Quality Tool Error:', error);
    tracer.endTrace();

    return {
      content: [
        {
          type: 'text',
          text: `❌ **Smart Quality Tool Error**\n\n**Error:** ${error instanceof Error ? error.message : String(error)}\n\n**Command:** ${args.command}\n\n**Suggestions:**\n- Check file paths and code content\n- Verify command parameters\n- Ensure quality engine is properly initialized\n\n**Available Commands:**\n- \`analyze\` - Analyze single file\n- \`batch\` - Analyze multiple files\n- \`report\` - Generate quality report\n- \`improve\` - Apply improvements\n- \`monitor\` - Start/stop monitoring\n- \`trends\` - View quality trends\n- \`rules\` - Manage custom rules\n- \`config\` - Update configuration`
        }
      ],
      trace: {},
      traceInfo: {
        command: args.command,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        engineStatus: 'error'
      }
    };
  }
}

async function handleAnalyzeCommand(engine: SmartCodeQualityEngine, args: { filePath?: string; code?: string; language?: string }) {
  const { filePath, code, language = 'typescript' } = args;

  if (!filePath || !code) {
    throw new Error('filePath and code are required for analyze command');
  }

  const analysis = await engine.analyzeFile(filePath, code, language);

  return {
    type: 'analysis',
    filePath,
    analysis,
    summary: {
      score: analysis.metrics.current.overall || 0,
      issues: analysis.issues.length,
      recommendations: analysis.recommendations.length,
      executionTime: analysis.executionTime
    }
  };
}

async function handleBatchCommand(engine: SmartCodeQualityEngine, args: { files?: Array<{ path: string; code: string; language?: string }> }) {
  const { files = [] } = args;

  if (files.length === 0) {
    throw new Error('files array is required for batch command');
  }

  const result = await engine.analyzeBatch(files);

  return {
    type: 'batch_analysis',
    result,
    summary: result.summary
  };
}

async function handleReportCommand(engine: SmartCodeQualityEngine, args: { files?: Array<{ path: string; code: string; language?: string }> }) {
  const { files = [] } = args;

  if (files.length === 0) {
    throw new Error('files array is required for report command');
  }

  const filePaths = files.map(f => f.path);
  const report = await engine.generateQualityReport(filePaths);

  return {
    type: 'quality_report',
    report,
    summary: {
      overallScore: report.overallScore,
      grade: report.grade,
      totalIssues: report.metrics.totalIssues,
      analyzedFiles: report.metrics.analyzedFiles
    }
  };
}

async function handleImproveCommand(engine: SmartCodeQualityEngine, args: { filePath?: string; code?: string; improvements?: Array<{ issueId: string; recommendationId: string }> }) {
  const { filePath, code, improvements = [] } = args;

  if (!filePath || !code) {
    throw new Error('filePath and code are required for improve command');
  }

  if (improvements.length === 0) {
    throw new Error('improvements array is required for improve command');
  }

  const result = await engine.applyImprovements(filePath, code, improvements);

  return {
    type: 'improvements',
    filePath,
    result,
    summary: {
      success: result.success,
      appliedCount: result.appliedImprovements.length,
      totalCount: improvements.length,
      warnings: result.warnings.length
    }
  };
}

async function handleMonitorCommand(engine: SmartCodeQualityEngine, args: { action: string }) {
  const { action } = args;

  if (action === 'start') {
    engine.startMonitoring();
    return {
      type: 'monitor',
      action: 'started',
      status: 'monitoring_active'
    };
  } else if (action === 'stop') {
    engine.stopMonitoring();
    return {
      type: 'monitor',
      action: 'stopped',
      status: 'monitoring_inactive'
    };
  } else {
    throw new Error(`Unknown monitor action: ${action}`);
  }
}

async function handleTrendsCommand(engine: SmartCodeQualityEngine, args: { filePath?: string }) {
  const { filePath } = args;

  if (filePath) {
    const trends = engine.getQualityTrends(filePath);
    return {
      type: 'file_trends',
      filePath,
      trends,
      summary: {
        trendCount: trends.length,
        latestScore: trends.length > 0 ? trends[trends.length - 1].score : 0
      }
    };
  } else {
    const trends = engine.getOverallTrends();
    return {
      type: 'overall_trends',
      trends,
      summary: {
        trendCount: trends.length,
        filesTracked: new Set(trends.map(t => t.filePath)).size
      }
    };
  }
}

async function handleRulesCommand(engine: SmartCodeQualityEngine, args: { action: string; rule?: any }) {
  const { action, rule } = args;

  switch (action) {
    case 'add':
      if (!rule) {
        throw new Error('rule object is required for add action');
      }
      engine.addCustomRule(rule);
      return {
        type: 'rule_added',
        ruleId: rule.id,
        message: `Custom rule '${rule.name}' added successfully`
      };

    case 'remove':
      if (!rule?.id) {
        throw new Error('rule.id is required for remove action');
      }
      engine.removeCustomRule(rule.id);
      return {
        type: 'rule_removed',
        ruleId: rule.id,
        message: `Custom rule '${rule.id}' removed successfully`
      };

    case 'list':
      const config = engine.getConfig();
      return {
        type: 'rules_list',
        rules: config.customRules,
        count: config.customRules.length
      };

    default:
      throw new Error(`Unknown rules action: ${action}`);
  }
}

async function handleConfigCommand(engine: SmartCodeQualityEngine, args: { config?: Partial<QualityEngineConfig> }) {
  const { config } = args;

  if (config) {
    engine.updateConfig(config);
    return {
      type: 'config_updated',
      config: engine.getConfig(),
      message: 'Configuration updated successfully'
    };
  } else {
    return {
      type: 'config_current',
      config: engine.getConfig()
    };
  }
}

function formatQualityResponse(result: any, command: string, executionTime: number): string {
  const timestamp = new Date().toLocaleString();

  switch (result.type) {
    case 'analysis':
      return formatAnalysisResponse(result, executionTime);

    case 'batch_analysis':
      return formatBatchAnalysisResponse(result, executionTime);

    case 'quality_report':
      return formatQualityReportResponse(result, executionTime);

    case 'improvements':
      return formatImprovementsResponse(result, executionTime);

    case 'monitor':
      return formatMonitorResponse(result, executionTime);

    case 'file_trends':
    case 'overall_trends':
      return formatTrendsResponse(result, executionTime);

    case 'rule_added':
    case 'rule_removed':
    case 'rules_list':
      return formatRulesResponse(result, executionTime);

    case 'config_updated':
    case 'config_current':
      return formatConfigResponse(result, executionTime);

    default:
      return `✅ **Smart Quality Tool** - Command: ${command}\n\n**Result:** ${JSON.stringify(result, null, 2)}\n\n**Execution Time:** ${executionTime}ms\n**Timestamp:** ${timestamp}`;
  }
}

function formatAnalysisResponse(result: any, executionTime: number): string {
  const { filePath, analysis, summary } = result;
  const { issues, recommendations, metrics } = analysis;

  const criticalIssues = issues.filter((i: any) => i.severity === 'critical').length;
  const highIssues = issues.filter((i: any) => i.severity === 'high').length;
  const mediumIssues = issues.filter((i: any) => i.severity === 'medium').length;
  const lowIssues = issues.filter((i: any) => i.severity === 'low').length;

  return `🎯 **Smart Quality Analysis** - ${filePath}

## 📊 **Quality Score: ${summary.score.toFixed(1)}/100**

### **📈 Issues Breakdown**
- 🔴 **Critical:** ${criticalIssues}
- 🟠 **High:** ${highIssues}
- 🟡 **Medium:** ${mediumIssues}
- 🟢 **Low:** ${lowIssues}
- **Total:** ${summary.issues} issues

### **💡 Recommendations**
- **Available:** ${summary.recommendations} recommendations
- **Execution Time:** ${executionTime}ms

### **🔍 Top Issues**
${issues.slice(0, 3).map((issue: any, index: number) =>
  `${index + 1}. **${issue.title}** (${issue.severity})\n   ${issue.description}`
).join('\n\n')}

${recommendations.length > 0 ? `\n### **🚀 Top Recommendations**
${recommendations.slice(0, 3).map((rec: any, index: number) =>
  `${index + 1}. **${rec.title}**\n   ${rec.description}\n   **Impact:** ${rec.impact.overallImprovement}% improvement`
).join('\n\n')}` : ''}

**Timestamp:** ${new Date().toLocaleString()}`;
}

function formatBatchAnalysisResponse(result: any, executionTime: number): string {
  const { summary } = result;

  return `🎯 **Smart Quality Batch Analysis**

## 📊 **Batch Summary**
- **Files Analyzed:** ${summary.successfulAnalyses}/${summary.totalFiles}
- **Average Score:** ${summary.averageScore.toFixed(1)}/100
- **Total Issues:** ${summary.totalIssues}
- **Total Recommendations:** ${summary.totalRecommendations}
- **Execution Time:** ${executionTime}ms

### **📈 Analysis Results**
- ✅ **Successful:** ${summary.successfulAnalyses} files
- ❌ **Failed:** ${summary.failedAnalyses} files
- **Success Rate:** ${((summary.successfulAnalyses / summary.totalFiles) * 100).toFixed(1)}%

**Timestamp:** ${new Date().toLocaleString()}`;
}

function formatQualityReportResponse(result: any, executionTime: number): string {
  const { report } = result;
  const { overallScore, grade, metrics } = report;

  return `🎯 **Smart Quality Report**

## 📊 **Overall Quality Score: ${overallScore.toFixed(1)}/100 (${grade})**

### **📈 Metrics Summary**
- **Files Analyzed:** ${metrics.analyzedFiles}
- **Total Issues:** ${metrics.totalIssues}
  - 🔴 **Critical:** ${metrics.criticalIssues}
  - 🟠 **High:** ${metrics.highIssues}
  - 🟡 **Medium:** ${metrics.mediumIssues}
  - 🟢 **Low:** ${metrics.lowIssues}

### **📊 Quality Distribution**
- **Average Score:** ${metrics.averageScore.toFixed(1)}/100
- **Improvement Rate:** ${metrics.improvementRate.toFixed(1)}%
- **Report Duration:** ${executionTime}ms

**Generated:** ${new Date().toLocaleString()}`;
}

function formatImprovementsResponse(result: any, executionTime: number): string {
  const { filePath, result: improvementResult, summary } = result;

  return `🎯 **Smart Quality Improvements** - ${filePath}

## 🔧 **Improvement Results**
- **Status:** ${summary.success ? '✅ Success' : '❌ Failed'}
- **Applied:** ${summary.appliedCount}/${summary.totalCount} improvements
- **Warnings:** ${summary.warnings} warnings
- **Execution Time:** ${executionTime}ms

### **📝 Applied Improvements**
${improvementResult.appliedImprovements.map((id: string, index: number) =>
  `${index + 1}. ${id}`
).join('\n')}

${improvementResult.warnings.length > 0 ? `\n### **⚠️ Warnings**
${improvementResult.warnings.map((warning: string, index: number) =>
  `${index + 1}. ${warning}`
).join('\n')}` : ''}

**Timestamp:** ${new Date().toLocaleString()}`;
}

function formatMonitorResponse(result: any, executionTime: number): string {
  const { action, status } = result;

  return `🎯 **Smart Quality Monitoring**

## 🚀 **Monitoring ${action === 'started' ? 'Started' : 'Stopped'}**
- **Status:** ${status}
- **Action:** ${action}
- **Execution Time:** ${executionTime}ms

${action === 'started' ?
  '**Real-time quality monitoring is now active and will check for code quality issues automatically.**' :
  '**Real-time quality monitoring has been stopped.**'
}

**Timestamp:** ${new Date().toLocaleString()}`;
}

function formatTrendsResponse(result: any, executionTime: number): string {
  const { type, trends, summary } = result;

  if (type === 'file_trends') {
    return `🎯 **Quality Trends** - ${result.filePath}

## 📈 **File Quality Trends**
- **Trend Count:** ${summary.trendCount}
- **Latest Score:** ${summary.latestScore.toFixed(1)}/100
- **Execution Time:** ${executionTime}ms

### **📊 Recent Trends**
${trends.slice(-5).map((trend: any, index: number) =>
  `${index + 1}. **${new Date(trend.timestamp).toLocaleString()}** - Score: ${trend.score.toFixed(1)}, Issues: ${trend.issues}`
).join('\n')}

**Timestamp:** ${new Date().toLocaleString()}`;
  } else {
    return `🎯 **Overall Quality Trends**

## 📈 **System Quality Trends**
- **Trend Count:** ${summary.trendCount}
- **Files Tracked:** ${summary.filesTracked}
- **Execution Time:** ${executionTime}ms

### **📊 Recent Trends**
${trends.slice(-10).map((trend: any, index: number) =>
  `${index + 1}. **${trend.filePath}** - ${new Date(trend.timestamp).toLocaleString()} - Score: ${trend.score.toFixed(1)}`
).join('\n')}

**Timestamp:** ${new Date().toLocaleString()}`;
  }
}

function formatRulesResponse(result: any, executionTime: number): string {
  const { type, rules, count, ruleId, message } = result;

  if (type === 'rules_list') {
    return `🎯 **Custom Quality Rules**

## 📋 **Rules List**
- **Total Rules:** ${count}
- **Execution Time:** ${executionTime}ms

### **🔧 Active Rules**
${rules.map((rule: any, index: number) =>
  `${index + 1}. **${rule.name}** (${rule.id})\n   ${rule.description}\n   **Severity:** ${rule.severity} | **Enabled:** ${rule.enabled}`
).join('\n\n')}

**Timestamp:** ${new Date().toLocaleString()}`;
  } else {
    return `🎯 **Custom Quality Rule ${type === 'rule_added' ? 'Added' : 'Removed'}**

## ✅ **${message}**
- **Rule ID:** ${ruleId}
- **Action:** ${type}
- **Execution Time:** ${executionTime}ms

**Timestamp:** ${new Date().toLocaleString()}`;
  }
}

function formatConfigResponse(result: any, executionTime: number): string {
  const { type, config, message } = result;

  if (type === 'config_updated') {
    return `🎯 **Quality Engine Configuration Updated**

## ✅ **${message}**
- **Execution Time:** ${executionTime}ms

### **🔧 Current Configuration**
- **Real-time Monitoring:** ${config.enableRealTimeMonitoring ? '✅ Enabled' : '❌ Disabled'}
- **Automated Fixes:** ${config.enableAutomatedFixes ? '✅ Enabled' : '❌ Disabled'}
- **Trend Analysis:** ${config.enableTrendAnalysis ? '✅ Enabled' : '❌ Disabled'}
- **Custom Rules:** ${config.enableCustomRules ? '✅ Enabled' : '❌ Disabled'}
- **Monitoring Interval:** ${config.monitoringInterval}ms
- **Max File Size:** ${config.maxFileSize} bytes
- **Supported Languages:** ${config.supportedLanguages.join(', ')}

**Timestamp:** ${new Date().toLocaleString()}`;
  } else {
    return `🎯 **Quality Engine Configuration**

## 🔧 **Current Configuration**
- **Real-time Monitoring:** ${config.enableRealTimeMonitoring ? '✅ Enabled' : '❌ Disabled'}
- **Automated Fixes:** ${config.enableAutomatedFixes ? '✅ Enabled' : '❌ Disabled'}
- **Trend Analysis:** ${config.enableTrendAnalysis ? '✅ Enabled' : '❌ Disabled'}
- **Custom Rules:** ${config.enableCustomRules ? '✅ Enabled' : '❌ Disabled'}
- **Monitoring Interval:** ${config.monitoringInterval}ms
- **Max File Size:** ${config.maxFileSize} bytes
- **Supported Languages:** ${config.supportedLanguages.join(', ')}

**Execution Time:** ${executionTime}ms
**Timestamp:** ${new Date().toLocaleString()}`;
  }
}
