/**
 * Generic Intelligence Engine
 *
 * Universal fallback engine that can handle any technology not covered by
 * specialized engines. Provides general best practices and quality standards.
 */

import {
  BaseCategoryIntelligenceEngine,
  CodeAnalysis,
  Context7Data,
  ValidationResult,
  TechnologyInsights,
  QualityAnalysis,
  MaintainabilityAnalysis,
  PerformanceAnalysis,
  SecurityAnalysis,
} from '../CategoryIntelligenceEngine.js';
import { CodeGenerationRequest } from '../UnifiedCodeIntelligenceEngine.js';

/**
 * Generic engine for universal code generation and analysis
 */
export class GenericIntelligenceEngine extends BaseCategoryIntelligenceEngine {
  category = 'generic';
  technologies: string[] = []; // Dynamically populated from Context7

  /**
   * Analyze code using general best practices
   */
  async analyzeCode(
    code: string,
    technology: string,
    context: Context7Data
  ): Promise<CodeAnalysis> {
    const insights = await this.getTechnologyInsights(technology, context);

    // Perform general quality analysis
    const quality = await this.analyzeGenericQuality(code, technology, insights);
    const maintainability = await this.analyzeMaintainability(code, technology, insights);
    const performance = await this.analyzePerformance(code, technology, insights);
    const security = await this.analyzeSecurity(code, technology, insights);

    return {
      quality,
      maintainability,
      performance,
      security,
    };
  }

  /**
   * Generate code using general programming principles
   */
  async generateCode(request: CodeGenerationRequest, context: Context7Data): Promise<string> {
    const { featureDescription, techStack, role, quality } = request;

    // Determine the technology to use
    const technology = techStack?.[0] || 'typescript';

    // Get technology insights from Context7
    const insights = await this.getTechnologyInsights(technology, context);

    // Generate base code structure
    let code = this.generateBaseCode(featureDescription, technology, role);

    // Apply quality standards based on the requested quality level
    code = await this.applyQualityStandards(code, quality || 'standard');

    // Apply Context7 insights
    code = await this.applyContext7Insights(code, insights);

    // Add documentation
    code = this.addDocumentation(code, featureDescription, technology);

    return code;
  }

  /**
   * Get general best practices for any technology
   */
  async getBestPractices(technology: string, context: Context7Data): Promise<string[]> {
    const practices = [
      'Follow consistent naming conventions',
      'Write clear and descriptive comments',
      'Keep functions small and focused',
      'Use meaningful variable and function names',
      "Apply DRY (Don't Repeat Yourself) principle",
      'Follow SOLID principles where applicable',
      'Write unit tests for critical functionality',
      'Handle errors gracefully',
      'Validate input data',
      'Optimize for readability over cleverness',
    ];

    // Add technology-specific practices from Context7
    const insights = await this.getTechnologyInsights(technology, context);
    practices.push(...insights.bestPractices);

    return practices;
  }

  /**
   * Get general anti-patterns to avoid
   */
  async getAntiPatterns(technology: string, context: Context7Data): Promise<string[]> {
    const antiPatterns = [
      'Avoid deep nesting (more than 3 levels)',
      'Avoid magic numbers and strings',
      'Avoid global variables',
      'Avoid overly complex expressions',
      'Avoid premature optimization',
      'Avoid tight coupling between components',
      'Avoid ignoring error cases',
      'Avoid hardcoding configuration values',
      'Avoid inconsistent formatting',
      'Avoid commented-out code in production',
    ];

    // Add technology-specific anti-patterns from Context7
    const insights = await this.getTechnologyInsights(technology, context);
    antiPatterns.push(...insights.antiPatterns);

    return antiPatterns;
  }

  /**
   * Validate code using general quality checks
   */
  async validateCode(code: string, _technology: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic validation checks
    if (!code || code.trim().length === 0) {
      errors.push('Code is empty');
    }

    // Check for common issues
    if (code.includes('TODO') || code.includes('FIXME')) {
      warnings.push('Code contains TODO or FIXME comments');
    }

    if (code.includes('console.log') || code.includes('print(')) {
      warnings.push('Code contains debug output statements');
    }

    // Check for potential security issues
    if (code.includes('eval(') || code.includes('exec(')) {
      errors.push('Code contains potentially dangerous eval/exec statements');
    }

    if (code.match(/password\s*=\s*["'][^"']+["']/i)) {
      errors.push('Code may contain hardcoded passwords');
    }

    // Suggestions for improvement
    if (!code.includes('/**') && !code.includes('//')) {
      suggestions.push('Add documentation comments to explain the code');
    }

    if (code.split('\n').some(line => line.length > 120)) {
      suggestions.push('Consider breaking long lines (>120 characters) for better readability');
    }

    // Check nesting depth
    const nestingDepth = this.calculateMaxNestingDepth(code);
    if (nestingDepth > 3) {
      warnings.push(`Code has deep nesting (${nestingDepth} levels). Consider refactoring`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Optimize code using general optimization techniques
   */
  async optimizeCode(code: string, technology: string, context: Context7Data): Promise<string> {
    let optimizedCode = code;

    // Apply general optimizations
    optimizedCode = this.removeUnusedCode(optimizedCode);
    optimizedCode = this.simplifyComplexExpressions(optimizedCode);
    optimizedCode = this.improveNaming(optimizedCode);
    optimizedCode = this.addErrorHandling(optimizedCode);

    // Apply Context7 insights
    const insights = await this.getTechnologyInsights(technology, context);
    optimizedCode = await this.applyContext7Insights(optimizedCode, insights);

    return optimizedCode;
  }

  /**
   * Private helper methods
   */

  private async analyzeGenericQuality(
    code: string,
    _technology: string,
    insights: TechnologyInsights
  ): Promise<QualityAnalysis> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check for common quality issues
    if (code.includes('var ')) {
      issues.push('Use const/let instead of var');
      score -= 5;
    }

    if (!code.includes('strict')) {
      suggestions.push('Consider using strict mode');
      score -= 3;
    }

    if (code.match(/function\s+\w+\s*\([^)]{50,}\)/)) {
      issues.push('Functions with too many parameters detected');
      score -= 10;
    }

    // Add insights-based suggestions
    suggestions.push(...insights.bestPractices.slice(0, 3));

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }

  private async analyzeMaintainability(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<MaintainabilityAnalysis> {
    const lines = code.split('\n');
    const functionCount = (code.match(/function\s+\w+/g) || []).length;
    const avgLinesPerFunction = functionCount > 0 ? lines.length / functionCount : lines.length;

    // Calculate complexity (simplified)
    const complexity = this.calculateComplexity(code);

    // Calculate readability score
    const readability = this.calculateReadability(code);

    // Calculate testability score
    const testability = this.calculateTestability(code);

    const score = Math.round((100 - complexity) * 0.4 + readability * 0.3 + testability * 0.3);

    const suggestions: string[] = [];
    if (complexity > 10) {
      suggestions.push('Reduce cyclomatic complexity by splitting complex functions');
    }
    if (avgLinesPerFunction > 50) {
      suggestions.push('Consider breaking down large functions');
    }

    return {
      score,
      complexity,
      readability,
      testability,
      suggestions,
    };
  }

  private async analyzePerformance(
    code: string,
    _technology: string,
    insights: TechnologyInsights
  ): Promise<PerformanceAnalysis> {
    const bottlenecks: string[] = [];
    const optimizations: string[] = [];
    let score = 85; // Base score for generic code

    // Check for common performance issues
    if (code.includes('forEach') && code.includes('async')) {
      bottlenecks.push('Async operations in forEach loop may not work as expected');
      optimizations.push('Use for...of loop or Promise.all() for async operations');
      score -= 15;
    }

    if (code.match(/for.*in\s+/)) {
      bottlenecks.push('for...in loop can be slow for arrays');
      optimizations.push('Use for...of or traditional for loop for arrays');
      score -= 10;
    }

    // Add insights-based optimizations
    optimizations.push(...insights.performanceConsiderations.slice(0, 2));

    return {
      score: Math.max(0, score),
      bottlenecks,
      optimizations,
    };
  }

  private async analyzeSecurity(
    code: string,
    _technology: string,
    insights: TechnologyInsights
  ): Promise<SecurityAnalysis> {
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];
    let score = 90; // Base security score

    // Check for common security issues
    if (code.includes('innerHTML')) {
      vulnerabilities.push('Potential XSS vulnerability with innerHTML');
      recommendations.push('Use textContent or sanitize HTML input');
      score -= 20;
    }

    if (code.match(/SELECT.*FROM.*WHERE/i) && !code.includes('?')) {
      vulnerabilities.push('Potential SQL injection vulnerability');
      recommendations.push('Use parameterized queries');
      score -= 25;
    }

    if (code.includes('eval(') || code.includes('Function(')) {
      vulnerabilities.push('Use of eval or Function constructor is dangerous');
      recommendations.push('Avoid dynamic code execution');
      score -= 30;
    }

    // Add insights-based security recommendations
    recommendations.push(...insights.securityConsiderations.slice(0, 2));

    return {
      score: Math.max(0, score),
      vulnerabilities,
      recommendations,
    };
  }

  private generateBaseCode(description: string, technology: string, role?: string): string {
    // Generate basic code structure based on technology
    const lowerTech = technology.toLowerCase();

    if (lowerTech.includes('typescript') || lowerTech.includes('javascript')) {
      return this.generateJavaScriptCode(description, role);
    } else if (lowerTech.includes('python')) {
      return this.generatePythonCode(description, role);
    } else if (lowerTech.includes('java')) {
      return this.generateJavaCode(description, role);
    } else if (lowerTech.includes('html')) {
      return this.generateHTMLCode(description, role);
    } else if (lowerTech.includes('css')) {
      return this.generateCSSCode(description, role);
    } else {
      // Default to a generic function structure
      return this.generateGenericCode(description, role);
    }
  }

  private generateJavaScriptCode(description: string, role?: string): string {
    const functionName = this.extractFunctionName(description);

    return `/**
 * ${description}
 * Generated by GenericIntelligenceEngine
 * Role: ${role || 'developer'}
 */

'use strict';

/**
 * ${functionName} - ${description}
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Result object
 */
async function ${functionName}(options = {}) {
  try {
    // Validate input
    if (!options || typeof options !== 'object') {
      throw new Error('Invalid options provided');
    }

    // Main logic
    const result = await processData(options);

    // Return result
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(\`Error in \${functionName}:\`, error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Process data according to requirements
 * @private
 */
async function processData(options) {
  // TODO: Implement main logic based on requirements
  return {
    message: 'Implementation pending',
    options
  };
}

module.exports = { ${functionName} };`;
  }

  private generatePythonCode(description: string, role?: string): string {
    const functionName = this.extractFunctionName(description);

    return `"""
${description}
Generated by GenericIntelligenceEngine
Role: ${role || 'developer'}
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)


def ${functionName}(options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    ${description}

    Args:
        options: Configuration options dictionary

    Returns:
        Dict containing the result of the operation
    """
    try:
        # Validate input
        if options is None:
            options = {}

        if not isinstance(options, dict):
            raise ValueError("Options must be a dictionary")

        # Main logic
        result = process_data(options)

        # Return result
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in ${functionName}: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


def process_data(options: Dict[str, Any]) -> Dict[str, Any]:
    """Process data according to requirements."""
    # TODO: Implement main logic based on requirements
    return {
        "message": "Implementation pending",
        "options": options
    }


if __name__ == "__main__":
    # Example usage
    result = ${functionName}({"example": "data"})
    print(result)`;
  }

  private generateJavaCode(description: string, role?: string): string {
    const className = this.extractClassName(description);

    return `/**
 * ${description}
 * Generated by GenericIntelligenceEngine
 * Role: ${role || 'developer'}
 */

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.logging.Level;

public class ${className} {
    private static final Logger LOGGER = Logger.getLogger(${className}.class.getName());

    /**
     * ${description}
     *
     * @param options Configuration options
     * @return Result map containing operation outcome
     */
    public Map<String, Object> execute(Map<String, Object> options) {
        Map<String, Object> result = new HashMap<>();

        try {
            // Validate input
            if (options == null) {
                options = new HashMap<>();
            }

            // Main logic
            Map<String, Object> data = processData(options);

            // Build success result
            result.put("success", true);
            result.put("data", data);
            result.put("timestamp", System.currentTimeMillis());

        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in execute: " + e.getMessage(), e);
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("timestamp", System.currentTimeMillis());
        }

        return result;
    }

    /**
     * Process data according to requirements
     *
     * @param options Input options
     * @return Processed data
     */
    private Map<String, Object> processData(Map<String, Object> options) {
        Map<String, Object> data = new HashMap<>();
        // TODO: Implement main logic based on requirements
        data.put("message", "Implementation pending");
        data.put("options", options);
        return data;
    }
}`;
  }

  private generateHTMLCode(description: string, role?: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${description}">
    <title>${description}</title>
    <!-- Generated by GenericIntelligenceEngine -->
    <!-- Role: ${role || 'developer'} -->
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        header {
            background-color: #333;
            color: #fff;
            padding: 1rem 0;
            margin-bottom: 2rem;
        }

        main {
            background-color: #fff;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>${description}</h1>
        </div>
    </header>

    <main>
        <div class="container">
            <section>
                <h2>Content Section</h2>
                <p>This page implements: ${description}</p>
                <!-- TODO: Add main content here -->
            </section>
        </div>
    </main>

    <script>
        // JavaScript functionality
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Page loaded: ${description}');
            // TODO: Add interactive functionality
        });
    </script>
</body>
</html>`;
  }

  private generateCSSCode(description: string, role?: string): string {
    return `/**
 * ${description}
 * Generated by GenericIntelligenceEngine
 * Role: ${role || 'developer'}
 */

/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    font-size: 16px;
    scroll-behavior: smooth;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

/* Layout Components */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.flex {
    display: flex;
    flex-wrap: wrap;
}

.grid {
    display: grid;
    gap: 20px;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    margin-bottom: 1rem;
    font-weight: 600;
    line-height: 1.2;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.75rem; }
h4 { font-size: 1.5rem; }
h5 { font-size: 1.25rem; }
h6 { font-size: 1rem; }

p {
    margin-bottom: 1rem;
}

/* Components */
.button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s ease;
    cursor: pointer;
    border: none;
}

.button:hover {
    background-color: #0056b3;
}

/* Responsive Design */
@media (max-width: 768px) {
    html {
        font-size: 14px;
    }

    .container {
        padding: 0 15px;
    }
}

/* Accessibility */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* TODO: Add specific styles for ${description} */`;
  }

  private generateGenericCode(description: string, role?: string): string {
    return `# ${description}
# Generated by GenericIntelligenceEngine
# Role: ${role || 'developer'}

# This is a generic code template
# Please implement the following requirements:
# ${description}

# Main function/class definition
def main():
    """
    Main entry point for: ${description}
    """
    # TODO: Implement main logic
    pass

# Helper functions
def helper_function():
    """
    Helper function for processing
    """
    # TODO: Implement helper logic
    pass

# Error handling
def handle_error(error):
    """
    Error handling logic
    """
    print(f"Error occurred: {error}")
    # TODO: Implement proper error handling

# Entry point
if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        handle_error(e)`;
  }

  private async applyQualityStandards(code: string, quality: string): Promise<string> {
    // Apply different quality standards based on level
    switch (quality) {
      case 'basic':
        return code; // No additional standards for basic

      case 'standard':
        // Add basic error handling if missing
        if (!code.includes('try') && !code.includes('catch')) {
          // Add try-catch wrapper where appropriate
        }
        return code;

      case 'enterprise':
        // Add comprehensive error handling, logging, validation
        return this.addEnterpriseFeatures(code);

      case 'production':
        // Add all enterprise features plus monitoring, metrics
        return this.addProductionFeatures(code);

      default:
        return code;
    }
  }

  private addEnterpriseFeatures(code: string): string {
    // Add enterprise-level features
    // This would be more sophisticated in a real implementation
    return code;
  }

  private addProductionFeatures(code: string): string {
    // Add production-ready features
    // This would be more sophisticated in a real implementation
    return code;
  }

  private addDocumentation(code: string, description: string, technology: string): string {
    // Add or enhance documentation
    if (!code.includes('/**') && !code.includes('"""')) {
      // Add documentation header if missing
      const header = `/**
 * ${description}
 * Technology: ${technology}
 * Generated: ${new Date().toISOString()}
 */

`;
      return header + code;
    }
    return code;
  }

  private calculateMaxNestingDepth(code: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of code) {
      if (char === '{' || char === '(' || char === '[') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}' || char === ')' || char === ']') {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }

    return maxDepth;
  }

  private calculateComplexity(code: string): number {
    // Simplified cyclomatic complexity calculation
    let complexity = 1;

    // Count decision points
    const decisionPatterns = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /\?\s*[^:]+:/g, // ternary operator
    ];

    for (const pattern of decisionPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  private calculateReadability(code: string): number {
    let score = 100;

    // Check various readability factors
    const lines = code.split('\n');
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;

    if (avgLineLength > 80) score -= 10;
    if (avgLineLength > 120) score -= 10;

    // Check for comments
    const commentLines = lines.filter(
      line => line.includes('//') || line.includes('/*') || line.includes('#')
    ).length;
    const commentRatio = commentLines / lines.length;

    if (commentRatio < 0.1) score -= 15;

    // Check for consistent indentation
    const indentationStyles = new Set(
      lines.filter(line => line.match(/^\s+/)).map(line => line.match(/^(\s+)/)?.[1]?.length || 0)
    );

    if (indentationStyles.size > 3) score -= 10;

    return Math.max(0, score);
  }

  private calculateTestability(code: string): number {
    let score = 100;

    // Check for testability factors
    const functionCount = (code.match(/function\s+\w+/g) || []).length;
    const classCount = (code.match(/class\s+\w+/g) || []).length;

    // Functions should be small and focused
    const lines = code.split('\n').length;
    const avgLinesPerFunction = functionCount > 0 ? lines / functionCount : lines;

    if (avgLinesPerFunction > 50) score -= 20;
    if (avgLinesPerFunction > 100) score -= 20;

    // Check for global variables (reduce testability)
    if (code.includes('global ') || code.match(/var\s+\w+\s*=/)) {
      score -= 15;
    }

    // Check for dependency injection patterns (increase testability)
    if (code.includes('constructor(') || code.includes('__init__(')) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private removeUnusedCode(code: string): string {
    // Remove commented-out code
    code = code.replace(/\/\/.*TODO:.*\n/g, '');
    code = code.replace(/\/\*[\s\S]*?\*\//g, match => {
      // Keep documentation comments
      if (match.startsWith('/**')) return match;
      return '';
    });

    return code;
  }

  private simplifyComplexExpressions(code: string): string {
    // Simplify ternary operators that are too complex
    // This is a simplified implementation
    return code;
  }

  private improveNaming(code: string): string {
    // Improve variable and function naming
    // This would need more sophisticated analysis in production
    return code;
  }

  private addErrorHandling(code: string): string {
    // Add basic error handling if missing
    if (!code.includes('try') && !code.includes('catch') && !code.includes('except')) {
      // This would be more sophisticated in production
    }
    return code;
  }

  private extractFunctionName(description: string): string {
    // Extract a function name from the description
    const words = description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);

    if (words.length === 0) return 'processData';

    // Convert to camelCase
    return (
      words[0] +
      words
        .slice(1)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
    );
  }

  private extractClassName(description: string): string {
    // Extract a class name from the description
    const functionName = this.extractFunctionName(description);
    return functionName.charAt(0).toUpperCase() + functionName.slice(1);
  }
}
