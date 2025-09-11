/**
 * Code Optimization Engine
 *
 * AI-powered code optimization system that improves code quality,
 * performance, and maintainability across all categories and technologies.
 */

import { Context7Data } from './CategoryIntelligenceEngine.js';

// Optimization types
export interface Optimization {
  type: 'performance' | 'security' | 'maintainability' | 'readability' | 'best-practice';
  description: string;
  pattern: string | RegExp;
  replacement?: string | ((match: string) => string);
  priority: 'high' | 'medium' | 'low';
}

/**
 * Engine for AI-powered code optimization
 */
export class CodeOptimizationEngine {
  /**
   * Optimize code based on Context7 insights and best practices
   */
  async optimize(code: string, context: Context7Data): Promise<string> {
    try {
      // Identify optimizations to apply
      const optimizations = await this.identifyOptimizations(code, context);

      // Sort optimizations by priority
      optimizations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      // Apply optimizations
      let optimizedCode = code;
      for (const optimization of optimizations) {
        optimizedCode = await this.applyOptimization(optimizedCode, optimization);
      }

      // Final cleanup and formatting
      optimizedCode = this.cleanupCode(optimizedCode);

      return optimizedCode;
    } catch (error) {
      console.error('[CodeOptimizationEngine] Error optimizing code:', error);
      // Return original code if optimization fails
      return code;
    }
  }

  /**
   * Identify optimizations to apply based on code analysis
   */
  private async identifyOptimizations(
    code: string,
    context: Context7Data
  ): Promise<Optimization[]> {
    const optimizations: Optimization[] = [];

    // Performance optimizations
    if (context.insights?.patterns?.includes('performance')) {
      optimizations.push(...(await this.identifyPerformanceOptimizations(code)));
    }

    // Security optimizations
    if (context.insights?.patterns?.includes('security')) {
      optimizations.push(...(await this.identifySecurityOptimizations(code)));
    }

    // Always apply maintainability optimizations
    optimizations.push(...(await this.identifyMaintainabilityOptimizations(code)));

    // Readability optimizations
    optimizations.push(...(await this.identifyReadabilityOptimizations(code)));

    // Best practice optimizations
    optimizations.push(...(await this.identifyBestPracticeOptimizations(code)));

    return optimizations;
  }

  /**
   * Identify performance optimizations
   */
  private async identifyPerformanceOptimizations(code: string): Promise<Optimization[]> {
    const optimizations: Optimization[] = [];

    // Replace forEach with for...of for async operations
    if (/\.forEach\s*\([^)]*async/s.test(code)) {
      optimizations.push({
        type: 'performance',
        description: 'Replace forEach with for...of for async operations',
        pattern: /(\w+)\.forEach\s*\(\s*async\s*\(([^)]+)\)\s*=>\s*{([^}]+)}\s*\)/gs,
        replacement: 'for (const $2 of $1) {$3}',
        priority: 'high',
      });
    }

    // Use Promise.all for parallel async operations
    if (/await.*await.*await/s.test(code) && !code.includes('Promise.all')) {
      optimizations.push({
        type: 'performance',
        description: 'Consider using Promise.all for parallel async operations',
        pattern: '',
        priority: 'medium',
      });
    }

    // Replace string concatenation in loops
    if (/for.*\+=/s.test(code) && /\+\s*=\s*['"`]/.test(code)) {
      optimizations.push({
        type: 'performance',
        description: 'Use array.join() instead of string concatenation in loops',
        pattern: '',
        priority: 'medium',
      });
    }

    // Optimize array operations
    if (/\.filter\([^)]+\)\.map\([^)]+\)/.test(code)) {
      optimizations.push({
        type: 'performance',
        description: 'Combine filter and map into a single reduce operation',
        pattern: '',
        priority: 'low',
      });
    }

    // Cache DOM queries
    if (/document\.(getElementById|querySelector).*document\.\1/s.test(code)) {
      optimizations.push({
        type: 'performance',
        description: 'Cache repeated DOM queries',
        pattern: '',
        priority: 'high',
      });
    }

    // Debounce/throttle event handlers
    if (
      /(scroll|resize|input|mousemove).*addEventListener/.test(code) &&
      !/(debounce|throttle)/.test(code)
    ) {
      optimizations.push({
        type: 'performance',
        description: 'Add debounce/throttle to expensive event handlers',
        pattern: '',
        priority: 'medium',
      });
    }

    return optimizations;
  }

  /**
   * Identify security optimizations
   */
  private async identifySecurityOptimizations(code: string): Promise<Optimization[]> {
    const optimizations: Optimization[] = [];

    // Replace innerHTML with textContent where possible
    if (/\.innerHTML\s*=\s*[^`]/.test(code)) {
      optimizations.push({
        type: 'security',
        description: 'Replace innerHTML with textContent to prevent XSS',
        pattern: /\.innerHTML\s*=\s*([^;]+)/g,
        replacement: '.textContent = $1',
        priority: 'high',
      });
    }

    // Add input validation
    if (/req\.(body|query|params)/.test(code) && !/validate|sanitize/.test(code)) {
      optimizations.push({
        type: 'security',
        description: 'Add input validation for user inputs',
        pattern: '',
        priority: 'high',
      });
    }

    // Use parameterized queries
    if (/query\s*\(\s*['"`].*\$\{/.test(code)) {
      optimizations.push({
        type: 'security',
        description: 'Use parameterized queries to prevent SQL injection',
        pattern: '',
        priority: 'high',
      });
    }

    // Replace eval with safer alternatives
    if (/eval\s*\(/.test(code)) {
      optimizations.push({
        type: 'security',
        description: 'Replace eval with safer alternatives',
        pattern: /eval\s*\(/g,
        replacement: 'JSON.parse(',
        priority: 'high',
      });
    }

    // Add HTTPS enforcement
    if (/http:\/\//.test(code) && !/https:\/\//.test(code)) {
      optimizations.push({
        type: 'security',
        description: 'Use HTTPS instead of HTTP',
        pattern: /http:\/\//g,
        replacement: 'https://',
        priority: 'medium',
      });
    }

    return optimizations;
  }

  /**
   * Identify maintainability optimizations
   */
  private async identifyMaintainabilityOptimizations(code: string): Promise<Optimization[]> {
    const optimizations: Optimization[] = [];

    // Replace var with const/let
    if (/\bvar\s+/.test(code)) {
      optimizations.push({
        type: 'maintainability',
        description: 'Replace var with const/let',
        pattern: /\bvar\s+/g,
        replacement: 'const ',
        priority: 'medium',
      });
    }

    // Add explicit return types for TypeScript
    if (/\.ts/.test(code) && /function\s+\w+\s*\([^)]*\)\s*{/.test(code)) {
      optimizations.push({
        type: 'maintainability',
        description: 'Add explicit return types for functions',
        pattern: '',
        priority: 'low',
      });
    }

    // Extract magic numbers to constants
    if (/[^0-9]\d{3,}[^0-9]/.test(code)) {
      optimizations.push({
        type: 'maintainability',
        description: 'Extract magic numbers to named constants',
        pattern: '',
        priority: 'medium',
      });
    }

    // Break down complex functions
    const functionMatches = code.match(/function[^{]*{[^}]{500,}}/g);
    if (functionMatches) {
      optimizations.push({
        type: 'maintainability',
        description: 'Break down large functions into smaller ones',
        pattern: '',
        priority: 'high',
      });
    }

    // Add error handling
    if (!/try\s*{/.test(code) && /async|await|Promise/.test(code)) {
      optimizations.push({
        type: 'maintainability',
        description: 'Add try-catch blocks for async operations',
        pattern: '',
        priority: 'medium',
      });
    }

    return optimizations;
  }

  /**
   * Identify readability optimizations
   */
  private async identifyReadabilityOptimizations(code: string): Promise<Optimization[]> {
    const optimizations: Optimization[] = [];

    // Use template literals instead of string concatenation
    if (/['"].*\+.*['"]/.test(code)) {
      optimizations.push({
        type: 'readability',
        description: 'Use template literals instead of string concatenation',
        pattern: /(['"])([^'"]*)\1\s*\+\s*(\w+)\s*\+\s*(['"])([^'"]*)\4/g,
        replacement: '`$2${$3}$5`',
        priority: 'low',
      });
    }

    // Use destructuring
    if (/const\s+\w+\s*=\s*\w+\.\w+/.test(code)) {
      optimizations.push({
        type: 'readability',
        description: 'Use destructuring for object properties',
        pattern: '',
        priority: 'low',
      });
    }

    // Use optional chaining
    if (/&&\s*\w+\.\w+/.test(code)) {
      optimizations.push({
        type: 'readability',
        description: 'Use optional chaining (?.) operator',
        pattern: /(\w+)\s*&&\s*\1\.(\w+)/g,
        replacement: '$1?.$2',
        priority: 'low',
      });
    }

    // Use nullish coalescing
    if (/\|\|\s*['"]/.test(code)) {
      optimizations.push({
        type: 'readability',
        description: 'Use nullish coalescing (??) operator',
        pattern: /\|\|/g,
        replacement: '??',
        priority: 'low',
      });
    }

    // Add spacing around operators
    if (/\w[+\-*/%=<>!]=?\w/.test(code)) {
      optimizations.push({
        type: 'readability',
        description: 'Add spacing around operators',
        pattern: '',
        priority: 'low',
      });
    }

    return optimizations;
  }

  /**
   * Identify best practice optimizations
   */
  private async identifyBestPracticeOptimizations(code: string): Promise<Optimization[]> {
    const optimizations: Optimization[] = [];

    // Use strict equality
    if (/[^=!]==[^=]/.test(code)) {
      optimizations.push({
        type: 'best-practice',
        description: 'Use strict equality (===) instead of loose equality (==)',
        pattern: /([^=!])={2}([^=])/g,
        replacement: '$1===$2',
        priority: 'medium',
      });
    }

    // Remove console.log in production
    if (/console\.(log|debug)/.test(code)) {
      optimizations.push({
        type: 'best-practice',
        description: 'Remove or conditionally enable console statements',
        pattern: '',
        priority: 'low',
      });
    }

    // Use early returns
    if (/if\s*\([^)]+\)\s*{\s*[^}]{100,}\s*}\s*else\s*{/.test(code)) {
      optimizations.push({
        type: 'best-practice',
        description: 'Use early returns to reduce nesting',
        pattern: '',
        priority: 'medium',
      });
    }

    // Add default values to function parameters
    if (/function\s+\w+\s*\((\w+)\)/.test(code)) {
      optimizations.push({
        type: 'best-practice',
        description: 'Add default values to function parameters',
        pattern: '',
        priority: 'low',
      });
    }

    // Use const for immutable values
    if (/let\s+\w+\s*=\s*['"\d]/.test(code)) {
      const lines = code.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/let\s+(\w+)\s*=/);
        if (match) {
          const varName = match[1];
          // Check if variable is reassigned
          const restOfCode = lines.slice(i + 1).join('\n');
          if (!new RegExp(`${varName}\\s*=`).test(restOfCode)) {
            optimizations.push({
              type: 'best-practice',
              description: `Use const instead of let for ${varName}`,
              pattern: new RegExp(`let\\s+${varName}\\s*=`),
              replacement: `const ${varName} =`,
              priority: 'low',
            });
          }
        }
      }
    }

    return optimizations;
  }

  /**
   * Apply a single optimization to the code
   */
  private async applyOptimization(code: string, optimization: Optimization): Promise<string> {
    // Skip optimizations without patterns (these are suggestions only)
    if (!optimization.pattern) {
      console.log(`[CodeOptimizationEngine] Suggestion: ${optimization.description}`);
      return code;
    }

    // Apply the optimization
    if (optimization.replacement) {
      if (typeof optimization.replacement === 'string') {
        code = code.replace(optimization.pattern, optimization.replacement);
      } else {
        code = code.replace(optimization.pattern, optimization.replacement);
      }
      console.log(`[CodeOptimizationEngine] Applied: ${optimization.description}`);
    }

    return code;
  }

  /**
   * Clean up and format the optimized code
   */
  private cleanupCode(code: string): string {
    // Remove trailing whitespace
    code = code
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n');

    // Remove multiple consecutive blank lines
    code = code.replace(/\n{3,}/g, '\n\n');

    // Ensure consistent line endings
    code = code.replace(/\r\n/g, '\n');

    // Add newline at end of file if missing
    if (!code.endsWith('\n')) {
      code += '\n';
    }

    // Fix indentation (basic - would need more sophisticated logic for production)
    code = this.fixIndentation(code);

    // Add optimization marker to indicate code has been processed
    if (!code.includes('// Optimized')) {
      code += '\n// Optimized';
    }

    return code;
  }

  /**
   * Fix code indentation
   */
  private fixIndentation(code: string): string {
    const lines = code.split('\n');
    const fixedLines: string[] = [];
    let indentLevel = 0;
    const indentSize = 2; // Default to 2 spaces

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        fixedLines.push('');
        continue;
      }

      // Decrease indent for closing braces
      if (
        trimmedLine.startsWith('}') ||
        trimmedLine.startsWith(']') ||
        trimmedLine.startsWith(')')
      ) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Add indentation
      const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmedLine;
      fixedLines.push(indentedLine);

      // Increase indent for opening braces
      if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[') || trimmedLine.endsWith('(')) {
        indentLevel++;
      }

      // Handle single-line statements
      if (trimmedLine.match(/^(if|for|while|else)\s*\(/)) {
        if (!trimmedLine.endsWith('{') && !trimmedLine.endsWith(';')) {
          indentLevel++;
        }
      } else if (
        indentLevel > 0 &&
        !trimmedLine.startsWith('{') &&
        (trimmedLine.endsWith(';') || trimmedLine.endsWith('}'))
      ) {
        // Check if we need to decrease indent after single-line statement
        const prevLine = fixedLines[fixedLines.length - 2];
        if (prevLine && prevLine.match(/^\s*(if|for|while|else)\s*\(/) && !prevLine.endsWith('{')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
      }
    }

    return fixedLines.join('\n');
  }

  /**
   * Get optimization statistics
   */
  async getOptimizationStats(
    code: string,
    optimizedCode: string
  ): Promise<{
    originalSize: number;
    optimizedSize: number;
    sizeReduction: number;
    linesChanged: number;
    optimizationsApplied: number;
  }> {
    const originalLines = code.split('\n');
    const optimizedLines = optimizedCode.split('\n');

    let linesChanged = 0;
    for (let i = 0; i < Math.max(originalLines.length, optimizedLines.length); i++) {
      if (originalLines[i] !== optimizedLines[i]) {
        linesChanged++;
      }
    }

    return {
      originalSize: code.length,
      optimizedSize: optimizedCode.length,
      sizeReduction: code.length - optimizedCode.length,
      linesChanged,
      optimizationsApplied: 0, // Would need to track this during optimization
    };
  }
}
