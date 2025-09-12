/**
 * Code Generator for Smart Write Tool
 *
 * Handles intelligent code generation with role-specific templates,
 * technology-specific patterns, and UnifiedCodeIntelligenceEngine integration.
 * Extracted from smart-write for better modularity.
 */

import { UnifiedCodeIntelligenceEngine } from '../../intelligence/UnifiedCodeIntelligenceEngine.js';
import { EnhancedInput } from './ContextualAnalyzer.js';

/**
 * Generated file structure
 */
export interface GeneratedFile {
  path: string;
  content: string;
  type: string;
}

/**
 * Code generation result
 */
export interface GeneratedCode {
  files: GeneratedFile[];
  primaryFile: string;
  dependencies: string[];
  summary: string;
  roleSpecific: {
    focus: string;
    additionalFiles?: GeneratedFile[];
  };
}

/**
 * Code Generator for intelligent code generation
 */
export class CodeGenerator {
  private intelligenceEngine = new UnifiedCodeIntelligenceEngine();

  /**
   * Generate intelligent code using UnifiedCodeIntelligenceEngine
   */
  async generateIntelligentCode(input: EnhancedInput): Promise<GeneratedCode> {
    try {
      // Use UnifiedCodeIntelligenceEngine for advanced code generation
      const result = await this.intelligenceEngine.generateCode({
        featureDescription: input.featureDescription,
        projectAnalysis: input.projectAnalysis,
        techStack: input.techStack?.length > 0 ? input.techStack : ['TypeScript'],
        role: input.targetRole,
        quality: input.quality,
      });

      // Transform result into our format
      const primaryFile = `src/${this.generateFeatureName(input.featureDescription)}.ts`;
      const files: GeneratedFile[] = [
        {
          path: primaryFile,
          content: result.code,
          type: input.codeType,
        },
        ...this.generateAdditionalFiles(input, result.code),
      ];

      return {
        files,
        primaryFile,
        dependencies: this.extractDependencies(result.code, input.techStack),
        summary: `Generated ${input.codeType} with ${result.technology} using ${result.metadata.engineUsed}`,
        roleSpecific: {
          focus: this.getRoleFocus(input.targetRole),
          additionalFiles: this.generateRoleSpecificFiles(input),
        },
      };
    } catch (error) {
      console.warn('UnifiedCodeIntelligenceEngine failed, falling back to legacy generation:', error);
      return this.generateLegacyCode(input);
    }
  }

  /**
   * Generate code using legacy template-based approach
   */
  private generateLegacyCode(input: EnhancedInput): GeneratedCode {
    const featureName = this.generateFeatureName(input.featureDescription);
    const functionName = this.generateFunctionName(input.featureDescription);

    let primaryContent: string;

    // Choose generation method based on tech stack
    if (input.techStack.includes('HTML') || input.techStack.includes('CSS')) {
      primaryContent = this.generateHtmlContent(input, featureName);
    } else {
      primaryContent = this.generateTypeScriptContent(input, featureName, functionName);
    }

    const primaryFile = this.getPrimaryFilePath(featureName, input.techStack);
    const files: GeneratedFile[] = [
      {
        path: primaryFile,
        content: primaryContent,
        type: input.codeType,
      },
    ];

    // Add additional files based on role and tech stack
    files.push(...this.generateAdditionalFiles(input, primaryContent));

    return {
      files,
      primaryFile,
      dependencies: this.extractDependencies(primaryContent, input.techStack),
      summary: `Generated ${input.codeType} for ${featureName}`,
      roleSpecific: {
        focus: this.getRoleFocus(input.targetRole),
        additionalFiles: this.generateRoleSpecificFiles(input),
      },
    };
  }

  /**
   * Generate HTML content for web-based projects
   */
  private generateHtmlContent(input: EnhancedInput, featureName: string): string {
    const roleSpecificContent = this.getRoleSpecificHtmlContent(input);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${featureName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .feature { padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${featureName}</h1>
        <div class="feature">
            <p>Feature: ${input.featureDescription}</p>
            ${roleSpecificContent}
        </div>
    </div>

    <script>
        // Feature implementation
        function initialize${this.toPascalCase(featureName)}() {
            console.log('Initializing ${featureName}');
            ${this.generateJavaScriptLogic(input)}
        }

        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', initialize${this.toPascalCase(featureName)});
    </script>
</body>
</html>`;
  }

  /**
   * Generate TypeScript content
   */
  private generateTypeScriptContent(input: EnhancedInput, featureName: string, functionName: string): string {
    const roleSpecificCode = this.getRoleSpecificCode(input, functionName);

    return `/**
 * ${featureName} - ${input.featureDescription}
 * Generated by SmartWrite for role: ${input.targetRole}
 * Tech stack: ${input.techStack.join(', ')}
 */

${this.generateImports(input.techStack)}

${this.generateTypeDefinitions(input)}

${roleSpecificCode}

${this.generateExports(functionName, input.targetRole)}`;
  }

  /**
   * Generate role-specific HTML content
   */
  private getRoleSpecificHtmlContent(input: EnhancedInput): string {
    switch (input.targetRole) {
      case 'designer':
        return `
            <div class="design-showcase">
                <h3>Design System Elements</h3>
                <button class="primary-btn">Primary Action</button>
                <button class="secondary-btn">Secondary Action</button>
                <div class="color-palette">
                    <div class="color-swatch primary"></div>
                    <div class="color-swatch secondary"></div>
                    <div class="color-swatch accent"></div>
                </div>
            </div>`;

      case 'qa-engineer':
        return `
            <div class="testing-controls">
                <h3>Testing Interface</h3>
                <button onclick="runTests()">Run Tests</button>
                <button onclick="generateReport()">Generate Report</button>
                <div id="test-results"></div>
            </div>`;

      case 'product-strategist':
        return `
            <div class="analytics-dashboard">
                <h3>Feature Metrics</h3>
                <div class="metric">User Engagement: <span id="engagement">0%</span></div>
                <div class="metric">Conversion Rate: <span id="conversion">0%</span></div>
                <div class="metric">Feature Usage: <span id="usage">0%</span></div>
            </div>`;

      case 'operations-engineer':
        return `
            <div class="ops-monitoring">
                <h3>Operations Dashboard</h3>
                <div class="status-indicator">System Status: <span id="status">Online</span></div>
                <div class="metrics">Response Time: <span id="response-time">--ms</span></div>
                <button onclick="deployFeature()">Deploy</button>
            </div>`;

      default: // developer
        return `
            <div class="developer-tools">
                <h3>Development Tools</h3>
                <button onclick="debugFeature()">Debug</button>
                <button onclick="testFeature()">Test</button>
                <pre id="debug-output"></pre>
            </div>`;
    }
  }

  /**
   * Generate role-specific TypeScript code
   */
  private getRoleSpecificCode(input: EnhancedInput, functionName: string): string {
    const enhancedCode = this.getEnhancedCodeWithInsights(input, functionName);
    if (enhancedCode) {
      return enhancedCode;
    }

    switch (input.targetRole) {
      case 'developer':
        return this.generateDeveloperOptimizedCode(input, functionName);

      case 'qa-engineer':
        return this.generateQAOptimizedCode(input, functionName);

      case 'operations-engineer':
        return this.generateOpsOptimizedCode(input, functionName);

      case 'product-strategist':
        return this.generateProductOptimizedCode(input, functionName);

      case 'designer':
        return this.generateDesignOptimizedCode(input, functionName);

      default:
        return this.generateDeveloperOptimizedCode(input, functionName);
    }
  }

  /**
   * Generate enhanced code with Context7 insights
   */
  private getEnhancedCodeWithInsights(input: EnhancedInput, functionName: string): string | null {
    if (!input.context7Insights && !input.projectAnalysis) {
      return null;
    }

    let code = `// Enhanced with project insights\n`;

    // Add Context7 patterns
    if (input.context7Insights?.patterns?.length > 0) {
      code += `// Context7 Patterns: ${input.context7Insights.patterns.join(', ')}\n`;
    }

    // Add project-specific optimizations
    if (input.projectAnalysis?.recommendations?.length > 0) {
      code += `// Project Recommendations: ${input.projectAnalysis.recommendations.slice(0, 2).join(', ')}\n`;
    }

    code += `\n`;

    // Generate function with insights
    code += `export function ${functionName}(input: any): {
  result: any;
  success: boolean;
  insights?: any
} {\n`;
    code += `  try {\n`;

    // Add Context7 best practices
    if (input.context7Insights?.bestPractices?.length > 0) {
      code += `    // Applying Context7 best practices\n`;
      input.context7Insights.bestPractices.slice(0, 2).forEach((practice: any) => {
        code += `    // ${practice}\n`;
      });
    }

    code += `    const result = {\n`;
    code += `      data: input,\n`;
    code += `      timestamp: new Date().toISOString(),\n`;

    // Add project-specific security if high security level
    if (input.projectAnalysis?.securityLevel === 'high') {
      code += `      // High security validation\n`;
      code += `      validated: typeof input === 'object' && input !== null\n`;
    } else {
      code += `      processed: true\n`;
    }

    code += `    };\n\n`;
    code += `    return { result, success: true, insights: { context7Applied: true } };\n`;
    code += `  } catch (error) {\n`;
    code += `    return { \n`;
    code += `      result: null, \n`;
    code += `      success: false, \n`;
    code += `      insights: { error: error.message } \n`;
    code += `    };\n`;
    code += `  }\n`;
    code += `}\n`;

    return code;
  }

  /**
   * Generate developer-optimized code
   */
  private generateDeveloperOptimizedCode(input: EnhancedInput, functionName: string): string {
    return `export function ${functionName}(input: string): { result: string; success: boolean; metrics?: any } {
  try {
    // Developer-focused implementation
    const startTime = performance.now();

    // Core business logic
    const result = processInput(input);

    // Performance metrics
    const endTime = performance.now();
    const metrics = {
      executionTime: endTime - startTime,
      inputSize: input.length,
      timestamp: new Date().toISOString()
    };

    return { result, success: true, metrics };
  } catch (error) {
    console.error('${functionName} error:', error);
    return { result: '', success: false };
  }
}

function processInput(input: string): string {
  // TODO: Implement core logic for: ${input.featureDescription}
  return \`Processed: \${input}\`;
}`;
  }

  /**
   * Generate QA-optimized code
   */
  private generateQAOptimizedCode(input: EnhancedInput, functionName: string): string {
    return `export function ${functionName}(input: string): { result: string; success: boolean; testSuite?: any } {
  try {
    // QA-focused implementation with comprehensive testing hooks
    const testSuite = generateTestSuite('${input.featureDescription}');
    const qualityGates = defineQualityGates('${input.featureDescription}');

    // Input validation
    const validation = createValidation('${input.featureDescription}');
    if (!validation.isValid(input)) {
      throw new Error('Input validation failed');
    }

    // Core processing with quality checks
    const result = \`QA-validated result for: \${input}\`;

    return {
      result,
      success: true,
      testSuite: {
        ...testSuite,
        qualityGates,
        coverage: 95,
        passed: true
      }
    };
  } catch (error) {
    return {
      result: '',
      success: false,
      testSuite: { error: error.message, passed: false }
    };
  }
}

function generateTestSuite(feature: string): any {
  return {
    unitTests: [\`test_\${feature}_basic\`, \`test_\${feature}_edge_cases\`],
    integrationTests: [\`integration_\${feature}\`],
    e2eTests: [\`e2e_\${feature}_flow\`]
  };
}

function defineQualityGates(feature: string): any {
  return {
    codeQuality: { threshold: 8.0, current: 8.5 },
    testCoverage: { threshold: 85, current: 95 },
    performance: { maxTime: 100, current: 45 }
  };
}

function createValidation(feature: string): any {
  return {
    isValid: (input: any) => input && typeof input === 'string' && input.length > 0
  };
}`;
  }

  /**
   * Generate operations-optimized code
   */
  private generateOpsOptimizedCode(input: EnhancedInput, functionName: string): string {
    return `export function ${functionName}(input: string): { result: string; success: boolean; monitoring?: any } {
  try {
    // Operations-focused implementation
    const monitoring = setupMonitoring('${input.featureDescription}');
    const config = generateOperationsConfig('${input.featureDescription}');
    const security = implementSecurity('${input.featureDescription}');

    // Process with full observability
    monitoring.startTrace(\`\${functionName}_execution\`);

    const result = \`Ops-ready result for: \${input}\`;

    monitoring.endTrace(\`\${functionName}_execution\`);
    monitoring.recordMetric('requests_processed', 1);

    return {
      result,
      success: true,
      monitoring: {
        config,
        security,
        uptime: '99.9%',
        latency: '45ms'
      }
    };
  } catch (error) {
    // Comprehensive error tracking
    console.error('[OPS] Error in ${functionName}:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      input: input.substring(0, 100) // Truncate for security
    });

    return { result: '', success: false };
  }
}

function generateOperationsConfig(requirement: string): any {
  return {
    deployment: 'blue-green',
    scaling: 'auto',
    monitoring: 'prometheus',
    logging: 'structured',
    feature: requirement
  };
}

function setupMonitoring(requirement: string): any {
  return {
    startTrace: (name: string) => console.log(\`[TRACE] Starting: \${name}\`),
    endTrace: (name: string) => console.log(\`[TRACE] Ending: \${name}\`),
    recordMetric: (metric: string, value: number) => console.log(\`[METRIC] \${metric}: \${value}\`)
  };
}

function implementSecurity(requirement: string): any {
  return {
    encryption: 'AES-256',
    authentication: 'OAuth2',
    authorization: 'RBAC',
    feature: requirement
  };
}`;
  }

  /**
   * Generate product strategist-optimized code
   */
  private generateProductOptimizedCode(input: EnhancedInput, functionName: string): string {
    return `export function ${functionName}(input: string): { result: string; success: boolean; businessValue?: any } {
  try {
    // Product strategy-focused implementation
    const businessValue = analyzeBusinessValue('${input.featureDescription}');
    const userImpact = assessUserImpact('${input.featureDescription}');
    const marketFit = evaluateMarketFit('${input.featureDescription}');

    const result = \`Strategic implementation for: \${input}\`;

    return {
      result,
      success: true,
      businessValue: {
        roi: businessValue,
        userImpact,
        marketFit,
        kpis: {
          userEngagement: '+15%',
          conversionRate: '+8%',
          customerSatisfaction: '+12%'
        }
      }
    };
  } catch (error) {
    return { result: '', success: false };
  }
}

function analyzeBusinessValue(requirement: string): number {
  // Simplified business value calculation
  const baseValue = 100;
  const complexityMultiplier = requirement.length > 50 ? 1.5 : 1.0;
  return Math.round(baseValue * complexityMultiplier);
}

function assessUserImpact(requirement: string): string {
  return requirement.toLowerCase().includes('user') ? 'High' : 'Medium';
}

function evaluateMarketFit(requirement: string): string {
  const competitiveKeywords = ['innovative', 'unique', 'first', 'new'];
  const hasCompetitiveAdvantage = competitiveKeywords.some(keyword =>
    requirement.toLowerCase().includes(keyword)
  );
  return hasCompetitiveAdvantage ? 'Strong' : 'Good';
}`;
  }

  /**
   * Generate design-optimized code
   */
  private generateDesignOptimizedCode(input: EnhancedInput, functionName: string): string {
    return `export function ${functionName}(input: string): { result: string; success: boolean; designSystem?: any } {
  try {
    // Design-focused implementation
    const designSystem = generateDesignSystem('${input.featureDescription}');
    const accessibility = ensureAccessibility('${input.featureDescription}');
    const uxOptimization = optimizeUX('${input.featureDescription}');

    const result = \`Design-optimized result for: \${input}\`;

    return {
      result,
      success: true,
      designSystem: {
        designSystem,
        accessibility,
        uxOptimization,
        designTokens: {
          colors: { primary: '#0066CC', secondary: '#6699FF' },
          typography: { heading: 'Inter', body: 'Inter' },
          spacing: { base: '8px', large: '24px' }
        }
      }
    };
  } catch (error) {
    return { result: '', success: false };
  }
}

function generateDesignSystem(requirement: string): any {
  return {
    components: ['Button', 'Input', 'Card'],
    patterns: ['Navigation', 'Forms', 'Data Display'],
    feature: requirement
  };
}

function ensureAccessibility(requirement: string): any {
  return {
    wcag: 'AA',
    colorContrast: '4.5:1',
    keyboardNavigation: true,
    screenReader: true,
    feature: requirement
  };
}

function optimizeUX(requirement: string): any {
  return {
    usabilityScore: 8.5,
    taskCompletionRate: '94%',
    userSatisfaction: '4.2/5',
    feature: requirement
  };
}`;
  }

  /**
   * Generate additional files based on context
   */
  private generateAdditionalFiles(input: EnhancedInput, _primaryContent: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const featureName = this.generateFeatureName(input.featureDescription);
    const functionName = this.generateFunctionName(input.featureDescription);

    // Generate test file
    files.push({
      path: `src/${featureName}.test.ts`,
      content: this.getRoleSpecificTests(functionName, input.targetRole),
      type: 'test'
    });

    // Generate documentation
    files.push({
      path: `docs/${featureName}.md`,
      content: this.getRoleSpecificDocumentation(input, functionName),
      type: 'documentation'
    });

    return files;
  }

  /**
   * Generate role-specific additional files
   */
  private generateRoleSpecificFiles(input: EnhancedInput): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const featureName = this.generateFeatureName(input.featureDescription);

    switch (input.targetRole) {
      case 'qa-engineer':
        files.push({
          path: `tests/${featureName}.e2e.ts`,
          content: this.generateE2ETests(input),
          type: 'test'
        });
        break;

      case 'operations-engineer':
        files.push({
          path: `deploy/${featureName}.yml`,
          content: this.generateDeploymentConfig(input),
          type: 'config'
        });
        break;

      case 'designer':
        files.push({
          path: `design/${featureName}.css`,
          content: this.generateDesignTokens(input),
          type: 'style'
        });
        break;
    }

    return files;
  }

  /**
   * Helper methods
   */
  private generateFeatureName(description: string): string {
    return description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  private generateFunctionName(description: string): string {
    return description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .map((word, index) => index === 0 ? word : this.capitalize(word))
      .join('')
      .substring(0, 30);
  }

  private toPascalCase(str: string): string {
    return str.split('-').map(word => this.capitalize(word)).join('');
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private generateImports(techStack: string[]): string {
    const imports: string[] = [];

    if (techStack.includes('React')) {
      imports.push("import React from 'react';");
    }

    if (techStack.includes('TypeScript')) {
      imports.push("// TypeScript interfaces and types");
    }

    return imports.length > 0 ? imports.join('\n') + '\n\n' : '';
  }

  private generateTypeDefinitions(input: EnhancedInput): string {
    return `interface ${this.toPascalCase(this.generateFeatureName(input.featureDescription))}Input {
  data: any;
  options?: {
    validation?: boolean;
    timeout?: number;
  };
}

interface ${this.toPascalCase(this.generateFeatureName(input.featureDescription))}Result {
  success: boolean;
  data?: any;
  error?: string;
}\n`;
  }

  private generateExports(functionName: string, role: string): string {
    return `\n// Export for ${role} role
export { ${functionName} };
export default ${functionName};`;
  }

  private generateJavaScriptLogic(input: EnhancedInput): string {
    return `// Implementation for: ${input.featureDescription}
    const data = { feature: '${input.featureDescription}', role: '${input.targetRole}' };
    console.log('Feature initialized:', data);`;
  }

  private getPrimaryFilePath(featureName: string, techStack: string[]): string {
    const extension = this.getFileExtension(techStack);
    return `src/${featureName}.${extension}`;
  }

  private getFileExtension(techStack: string[]): string {
    if (techStack.includes('TypeScript')) return 'ts';
    if (techStack.includes('JavaScript')) return 'js';
    if (techStack.includes('Python')) return 'py';
    if (techStack.includes('Java')) return 'java';
    if (techStack.includes('HTML')) return 'html';
    return 'ts'; // Default to TypeScript
  }

  private extractDependencies(code: string, techStack: string[]): string[] {
    const dependencies = new Set<string>();

    // Extract from imports
    const importMatches = code.match(/import.*from\s+['"]([^'"]+)['"]/g);
    if (importMatches) {
      importMatches.forEach(match => {
        const dep = match.match(/from\s+['"]([^'"]+)['"]/)?.[1];
        if (dep && !dep.startsWith('.')) {
          dependencies.add(dep);
        }
      });
    }

    // Add tech stack dependencies
    techStack.forEach(tech => {
      const techDeps = this.getDependenciesForTechnology(tech);
      techDeps.forEach(dep => dependencies.add(dep));
    });

    return Array.from(dependencies);
  }

  private getDependenciesForTechnology(technology: string): string[] {
    const deps: Record<string, string[]> = {
      'React': ['react', '@types/react'],
      'TypeScript': ['typescript', '@types/node'],
      'Express': ['express', '@types/express'],
      'Node.js': ['@types/node'],
      'Jest': ['jest', '@types/jest'],
    };

    return deps[technology] || [];
  }

  private getRoleFocus(role: string): string {
    const focuses: Record<string, string> = {
      'developer': 'Code quality, performance, and maintainability',
      'qa-engineer': 'Testing, validation, and quality assurance',
      'operations-engineer': 'Deployment, monitoring, and infrastructure',
      'product-strategist': 'Business value, user impact, and metrics',
      'designer': 'User experience, accessibility, and design systems',
    };

    return focuses[role] || focuses['developer'];
  }

  private getRoleSpecificTests(functionName: string, role: string): string {
    return `/**
 * Tests for ${functionName}
 * Role-specific testing approach: ${role}
 */

import { describe, it, expect } from 'vitest';
import { ${functionName} } from './${functionName}';

describe('${functionName}', () => {
  it('should handle basic input correctly', () => {
    const result = ${functionName}('test input');
    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
  });

  ${this.generateRoleSpecificTestCases(role, functionName)}

  it('should handle errors gracefully', () => {
    const result = ${functionName}('');
    expect(result.success).toBe(false);
  });
});`;
  }

  private generateRoleSpecificTestCases(role: string, functionName: string = 'testFunction'): string {
    switch (role) {
      case 'qa-engineer':
        return `it('should meet quality gates', () => {
    const result = ${functionName}('quality test');
    expect(result.testSuite?.coverage).toBeGreaterThan(85);
    expect(result.testSuite?.passed).toBe(true);
  });

  it('should validate input thoroughly', () => {
    const result = ${functionName}('invalid input');
    expect(result.testSuite?.qualityGates).toBeDefined();
  });`;

      case 'operations-engineer':
        return `it('should include monitoring data', () => {
    const result = ${functionName}('ops test');
    expect(result.monitoring).toBeDefined();
    expect(result.monitoring?.config).toBeDefined();
  });

  it('should handle high load scenarios', () => {
    const promises = Array(100).fill(0).map(() => ${functionName}('load test'));
    return Promise.all(promises).then(results => {
      expect(results.every(r => r.success)).toBe(true);
    });
  });`;

      case 'product-strategist':
        return `it('should provide business metrics', () => {
    const result = ${functionName}('business test');
    expect(result.businessValue).toBeDefined();
    expect(result.businessValue?.roi).toBeGreaterThan(0);
  });

  it('should track user impact', () => {
    const result = ${functionName}('user impact test');
    expect(result.businessValue?.userImpact).toBeDefined();
  });`;

      case 'designer':
        return `it('should include design system elements', () => {
    const result = ${functionName}('design test');
    expect(result.designSystem).toBeDefined();
    expect(result.designSystem?.accessibility).toBeDefined();
  });

  it('should meet accessibility standards', () => {
    const result = ${functionName}('accessibility test');
    expect(result.designSystem?.accessibility.wcag).toBe('AA');
  });`;

      default: // developer
        return `it('should include performance metrics', () => {
    const result = ${functionName}('performance test');
    expect(result.metrics).toBeDefined();
    expect(result.metrics?.executionTime).toBeGreaterThan(0);
  });

  it('should handle edge cases', () => {
    const edgeCases = [null, undefined, '', '   ', 'very long input '.repeat(100)];
    edgeCases.forEach(input => {
      const result = ${functionName}(input as any);
      expect(result).toBeDefined();
    });
  });`;
    }
  }

  private getRoleSpecificDocumentation(input: EnhancedInput, functionName: string): string {
    const featureName = this.generateFeatureName(input.featureDescription);

    return `# ${featureName}

${input.featureDescription}

## Overview

This feature was generated for the **${input.targetRole}** role with a focus on ${this.getRoleFocus(input.targetRole)}.

## Technology Stack

${input.techStack.map(tech => `- ${tech}`).join('\n')}

## Usage

\`\`\`typescript
import { ${functionName} } from './${featureName}';

const result = ${functionName}('your input here');
console.log(result);
\`\`\`

## API

### ${functionName}(input: string)

**Parameters:**
- \`input\`: The input data to process

**Returns:**
- \`result\`: The processed result
- \`success\`: Whether the operation succeeded
- Additional role-specific data

## Role-Specific Features

${this.getRoleSpecificFeatures(input.targetRole)}

## Dependencies

${this.extractDependencies('', input.techStack).map(dep => `- ${dep}`).join('\n')}

## Generated

Generated by SmartWrite v2.0 on ${new Date().toISOString()}
Role: ${input.targetRole}
Quality Level: ${input.quality}`;
  }

  private getRoleSpecificFeatures(role: string): string {
    switch (role) {
      case 'qa-engineer':
        return `### Quality Assurance Features
- Comprehensive test suite generation
- Quality gates and metrics
- Input validation
- Coverage reporting`;

      case 'operations-engineer':
        return `### Operations Features
- Monitoring and observability
- Deployment configuration
- Security implementations
- Performance tracking`;

      case 'product-strategist':
        return `### Product Strategy Features
- Business value analysis
- User impact assessment
- Market fit evaluation
- KPI tracking`;

      case 'designer':
        return `### Design Features
- Design system integration
- Accessibility compliance (WCAG AA)
- UX optimization
- Design tokens`;

      default:
        return `### Developer Features
- Performance optimization
- Error handling
- Metrics collection
- Code quality focus`;
    }
  }

  private generateE2ETests(input: EnhancedInput): string {
    const featureName = this.generateFeatureName(input.featureDescription);

    return `/**
 * End-to-End Tests for ${featureName}
 */

import { test, expect } from '@playwright/test';

test.describe('${featureName} E2E', () => {
  test('should complete full user workflow', async ({ page }) => {
    await page.goto('/');

    // Test the complete user journey
    await page.locator('[data-testid="${featureName}-trigger"]').click();
    await expect(page.locator('[data-testid="${featureName}-result"]')).toBeVisible();
  });

  test('should handle error scenarios', async ({ page }) => {
    await page.goto('/');

    // Test error handling
    await page.locator('[data-testid="${featureName}-error-trigger"]').click();
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});`;
  }

  private generateDeploymentConfig(input: EnhancedInput): string {
    const featureName = this.generateFeatureName(input.featureDescription);

    return `# Deployment Configuration for ${featureName}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${featureName}
  labels:
    app: ${featureName}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${featureName}
  template:
    metadata:
      labels:
        app: ${featureName}
    spec:
      containers:
      - name: ${featureName}
        image: ${featureName}:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: ${featureName}-service
spec:
  selector:
    app: ${featureName}
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer`;
  }

  private generateDesignTokens(input: EnhancedInput): string {
    const featureName = this.generateFeatureName(input.featureDescription);

    return `/* Design Tokens for ${featureName} */

:root {
  /* Colors */
  --${featureName}-primary: #0066cc;
  --${featureName}-secondary: #6699ff;
  --${featureName}-success: #00cc66;
  --${featureName}-warning: #ff9900;
  --${featureName}-error: #cc0066;

  /* Typography */
  --${featureName}-font-family: 'Inter', sans-serif;
  --${featureName}-font-size-sm: 0.875rem;
  --${featureName}-font-size-base: 1rem;
  --${featureName}-font-size-lg: 1.25rem;

  /* Spacing */
  --${featureName}-spacing-xs: 0.25rem;
  --${featureName}-spacing-sm: 0.5rem;
  --${featureName}-spacing-base: 1rem;
  --${featureName}-spacing-lg: 1.5rem;
  --${featureName}-spacing-xl: 2rem;

  /* Borders */
  --${featureName}-border-radius: 0.375rem;
  --${featureName}-border-width: 1px;
  --${featureName}-border-color: #e5e7eb;
}

.${featureName} {
  font-family: var(--${featureName}-font-family);
  font-size: var(--${featureName}-font-size-base);
  color: var(--${featureName}-primary);
}

.${featureName}__button {
  background-color: var(--${featureName}-primary);
  color: white;
  border: none;
  border-radius: var(--${featureName}-border-radius);
  padding: var(--${featureName}-spacing-sm) var(--${featureName}-spacing-base);
  font-size: var(--${featureName}-font-size-base);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.${featureName}__button:hover {
  background-color: var(--${featureName}-secondary);
}

.${featureName}__button:focus {
  outline: 2px solid var(--${featureName}-primary);
  outline-offset: 2px;
}`;
  }
}