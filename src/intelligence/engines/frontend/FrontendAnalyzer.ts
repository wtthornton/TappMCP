/**
 * Frontend Analyzer - Core Module
 *
 * Refactored core frontend analysis engine that coordinates specialized analyzers.
 * This replaces the monolithic FrontendIntelligenceEngine with a modular approach.
 */

import {
  BaseCategoryIntelligenceEngine,
  CodeAnalysis,
  Context7Data,
  ValidationResult,
  QualityAnalysis,
  MaintainabilityAnalysis,
  SecurityAnalysis,
} from '../../CategoryIntelligenceEngine.js';
import { CodeGenerationRequest } from '../../UnifiedCodeIntelligenceEngine.js';
import { AccessibilityAnalyzer } from './AccessibilityAnalyzer.js';
import { PerformanceAnalyzer } from './PerformanceAnalyzer.js';
import { SEOAnalyzer } from './SEOAnalyzer.js';

/**
 * Refactored Frontend Intelligence Engine with modular architecture
 */
export class FrontendAnalyzer extends BaseCategoryIntelligenceEngine {
  category = 'frontend';
  technologies = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular'];

  // Specialized analyzers
  private accessibilityAnalyzer = new AccessibilityAnalyzer();
  private performanceAnalyzer = new PerformanceAnalyzer();
  private seoAnalyzer = new SEOAnalyzer();

  /**
   * Analyze frontend code with accessibility, performance, and SEO considerations
   */
  async analyzeCode(
    code: string,
    technology: string,
    context: Context7Data
  ): Promise<CodeAnalysis> {
    const insights = await this.getTechnologyInsights(technology, context);

    // Use specialized analyzers
    const quality = await this.analyzeFrontendQuality(code, technology, insights);
    const maintainability = await this.analyzeMaintainability(code, technology, insights);
    const performance = await this.performanceAnalyzer.analyzePerformance(
      code,
      technology,
      insights
    );
    const security = await this.analyzeSecurity(code, technology, insights);
    const accessibility = await this.accessibilityAnalyzer.analyzeAccessibility(
      code,
      technology,
      insights
    );
    const seo = await this.seoAnalyzer.analyzeSEO(code, technology, insights);

    return {
      quality,
      maintainability,
      performance,
      security,
      accessibility,
      seo,
    };
  }

  /**
   * Generate frontend code with best practices
   */
  async generateCode(request: CodeGenerationRequest, context: Context7Data): Promise<string> {
    const { featureDescription, techStack, role, quality } = request;

    // Determine the technology to use
    const technology = techStack?.[0] || 'HTML';

    // Get technology insights from Context7
    const insights = await this.getTechnologyInsights(technology, context);

    // Generate frontend-specific code
    let code = this.generateFrontendCode(featureDescription, technology, role);

    // Apply Context7 insights
    code = await this.applyContext7Insights(code, insights);

    // Apply optimizations using specialized analyzers
    code = this.accessibilityAnalyzer.addAccessibilityFeatures(code, technology);
    code = this.performanceAnalyzer.optimizePerformance(code, technology);
    code = this.seoAnalyzer.addSEOOptimizations(code, technology);

    return code;
  }

  /**
   * Get frontend-specific best practices
   */
  async getBestPractices(technology: string, context: Context7Data): Promise<string[]> {
    const practices = [
      'Use semantic HTML elements',
      'Implement responsive design',
      'Optimize for accessibility (WCAG 2.1 AA)',
      'Add proper meta tags for SEO',
      'Use HTTPS and secure protocols',
      'Implement lazy loading for images',
      'Minimize and compress assets',
      'Use CSS Grid and Flexbox for layouts',
      'Implement proper error boundaries',
      'Add proper ARIA labels and roles',
    ];

    // Add technology-specific practices from Context7
    const insights = await this.getTechnologyInsights(technology, context);
    practices.push(...insights.bestPractices);

    return practices;
  }

  /**
   * Get frontend-specific anti-patterns to avoid
   */
  async getAntiPatterns(technology: string, context: Context7Data): Promise<string[]> {
    const antiPatterns = [
      'Using inline styles extensively',
      'Not using semantic HTML',
      'Ignoring accessibility requirements',
      'Missing alt text for images',
      'Using tables for layout',
      'Not optimizing images',
      'Using !important in CSS excessively',
      'Not handling error states',
      'Blocking the main thread with heavy operations',
      'Not using HTTPS',
    ];

    // Add technology-specific anti-patterns from Context7
    const insights = await this.getTechnologyInsights(technology, context);
    antiPatterns.push(...insights.antiPatterns);

    return antiPatterns;
  }

  /**
   * Validate frontend code
   */
  async validateCode(code: string, technology: string): Promise<ValidationResult> {
    const mockContext: Context7Data = {
      insights: { patterns: [], recommendations: [], qualityMetrics: { overall: 0 } },
    };
    const analysis = await this.analyzeCode(code, technology, mockContext);

    return {
      valid: analysis.quality.score >= 70,
      errors: analysis.quality.issues,
      warnings: analysis.quality.suggestions,
      suggestions: [
        ...(analysis.accessibility?.improvements || []),
        ...(analysis.performance?.optimizations || []),
        ...(analysis.seo?.improvements || []),
      ],
    };
  }

  /**
   * Optimize code for production
   */
  async optimizeCode(code: string, technology: string, context: Context7Data): Promise<string> {
    let optimizedCode = code;

    // Apply default optimizations
    optimizedCode = this.addProductionFeatures(optimizedCode);

    // Apply specialized optimizations
    optimizedCode = this.performanceAnalyzer.optimizePerformance(optimizedCode, technology);
    optimizedCode = this.accessibilityAnalyzer.addAccessibilityFeatures(optimizedCode, technology);
    optimizedCode = this.seoAnalyzer.addSEOOptimizations(optimizedCode, technology);

    // Apply Context7 insights
    const insights = await this.getTechnologyInsights(technology, context);
    optimizedCode = await this.applyContext7Insights(optimizedCode, insights);

    return optimizedCode;
  }

  /**
   * Private helper methods (core functionality)
   */
  private async analyzeFrontendQuality(
    code: string,
    technology: string,
    _insights: any
  ): Promise<QualityAnalysis> {
    let score = 75;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Basic HTML/CSS analysis
    if (technology.toLowerCase().includes('html')) {
      if (!code.includes('<!DOCTYPE html>')) {
        issues.push('Missing DOCTYPE declaration');
        score -= 10;
      }
      if (!code.includes('<meta charset')) {
        issues.push('Missing charset declaration');
        score -= 5;
      }
    }

    // CSS analysis
    if (technology.toLowerCase().includes('css') || code.includes('<style')) {
      if (code.includes('!important')) {
        suggestions.push('Avoid using !important - use specific selectors instead');
        score -= 3;
      }
      if (code.includes('position: fixed') && !code.includes('z-index')) {
        suggestions.push('Add z-index to fixed positioned elements');
        score -= 2;
      }
    }

    // JavaScript/TypeScript analysis
    if (
      technology.toLowerCase().includes('javascript') ||
      technology.toLowerCase().includes('typescript')
    ) {
      if (code.includes('var ')) {
        suggestions.push('Use let or const instead of var');
        score -= 5;
      }
      if (code.includes('== ') && !code.includes('=== ')) {
        suggestions.push('Use strict equality (===) instead of loose equality (==)');
        score -= 3;
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }

  private async analyzeMaintainability(
    code: string,
    _technology: string,
    _insights: any
  ): Promise<MaintainabilityAnalysis> {
    let score = 80;
    const codeLines = code.split('\n').filter(line => line.trim().length > 0).length;

    // Penalize very long files
    if (codeLines > 500) {score -= 20;}
    else if (codeLines > 200) {score -= 10;}

    // Check for comments
    const commentLines = code
      .split('\n')
      .filter(
        line =>
          line.trim().startsWith('//') ||
          line.trim().startsWith('/*') ||
          line.trim().startsWith('*')
      ).length;

    if (commentLines / codeLines < 0.1) {
      score -= 10; // Too few comments
    }

    return {
      score: Math.max(0, score),
      complexity: codeLines,
      readability: (commentLines / codeLines) * 100,
      testability: codeLines < 100 ? 80 : 60, // Simple heuristic
      suggestions: [
        'Add meaningful comments',
        'Break large functions into smaller ones',
        'Use consistent naming conventions',
      ],
    };
  }

  private async analyzeSecurity(
    code: string,
    _technology: string,
    _insights: any
  ): Promise<SecurityAnalysis> {
    const vulnerabilities: string[] = [];
    let score = 85;

    // Check for common security issues
    if (code.includes('eval(')) {
      vulnerabilities.push('Use of eval() creates security risk');
      score -= 25;
    }

    if (code.includes('innerHTML') && code.includes('+')) {
      vulnerabilities.push('Potential XSS vulnerability with innerHTML');
      score -= 15;
    }

    if (code.includes('document.write')) {
      vulnerabilities.push('document.write can be exploited for XSS');
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      vulnerabilities,
      recommendations: [
        'Validate and sanitize all user inputs',
        'Use Content Security Policy (CSP)',
        'Avoid eval() and similar functions',
      ],
    };
  }

  private generateFrontendCode(description: string, technology: string, role?: string): string {
    const componentName = this.extractComponentName(description);

    if (technology.toLowerCase().includes('react')) {
      return this.generateReactComponent(componentName, description, role);
    } else if (technology.toLowerCase().includes('vue')) {
      return this.generateVueComponent(componentName, description, role);
    } else if (technology.toLowerCase().includes('html')) {
      return this.generateHTMLPage(componentName, description, role);
    }

    return this.generateHTMLPage(componentName, description, role);
  }

  private generateReactComponent(name: string, description: string, role?: string): string {
    const roleComment = role ? `// Generated for role: ${role}\n` : '';
    return `${roleComment}import React from 'react';

interface ${name}Props {
  // Define component props here
}

const ${name}: React.FC<${name}Props> = () => {
  // ${description}

  return (
    <div className="${name.toLowerCase()}">
      <h1>${name}</h1>
      <p>Component for: ${description}</p>
    </div>
  );
};

export default ${name};`;
  }

  private generateVueComponent(name: string, description: string, role?: string): string {
    const roleComment = role ? `<!-- Generated for role: ${role} -->\n` : '';
    return `${roleComment}<template>
  <div class="${name.toLowerCase()}">
    <h1>${name}</h1>
    <p>Component for: ${description}</p>
  </div>
</template>

<script setup lang="ts">
// ${description}
</script>

<style scoped>
.${name.toLowerCase()} {
  padding: 20px;
}
</style>`;
  }

  private generateHTMLPage(name: string, description: string, role?: string): string {
    const roleComment = role ? `<!-- Generated for role: ${role} -->\n` : '';
    return `${roleComment}<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
</head>
<body>
    <main>
        <h1>${name}</h1>
        <p>${description}</p>
    </main>
</body>
</html>`;
  }

  private extractComponentName(description: string): string {
    const words = description.split(' ');
    return words
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private addProductionFeatures(code: string): string {
    // Add production-ready features
    if (code.includes('<head>')) {
      code = code.replace(
        '<head>',
        `<head>
    <!-- Production optimizations -->
    <meta name="robots" content="index, follow">
    <link rel="preconnect" href="https://fonts.googleapis.com">`
      );
    }
    return code;
  }

  private addEnterpriseFeatures(code: string): string {
    // Add enterprise-level features
    if (code.includes('<head>')) {
      code = code.replace(
        '<head>',
        `<head>
    <!-- Enterprise features -->
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">`
      );
    }
    return code;
  }
}
