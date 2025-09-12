/**
 * Frontend Accessibility Analyzer
 *
 * Specialized analyzer for WCAG compliance and accessibility best practices
 * in frontend code. Extracted from FrontendIntelligenceEngine for better modularity.
 */

import { AccessibilityAnalysis } from '../../CategoryIntelligenceEngine.js';

/**
 * Analyze code for accessibility compliance and best practices
 */
export class AccessibilityAnalyzer {
  /**
   * Analyze frontend code for accessibility compliance (WCAG 2.1 AA)
   */
  async analyzeAccessibility(
    code: string,
    _technology: string,
    _insights: any
  ): Promise<AccessibilityAnalysis> {
    const issues: string[] = [];
    const improvements: string[] = [];
    let score = 75;

    // WCAG 2.1 AA Compliance Checks

    // 1. Images and Alt Text (WCAG 1.1.1)
    if (code.includes('<img') && !code.includes('alt=')) {
      issues.push('Images missing alt attributes (WCAG 1.1.1)');
      improvements.push('Add descriptive alt text to all images');
      score -= 15;
    }

    // 2. Form Labels (WCAG 1.3.1)
    if (code.includes('<input') && !code.includes('aria-label') && !code.includes('<label')) {
      issues.push('Form inputs missing labels (WCAG 1.3.1)');
      improvements.push('Add proper labels to all form inputs');
      score -= 10;
    }

    // 3. Color Contrast (WCAG 1.4.3)
    if (code.includes('color:') && !this.hasHighContrast(code)) {
      issues.push('Potential color contrast issues (WCAG 1.4.3)');
      improvements.push('Ensure color contrast ratio meets 4.5:1 minimum');
      score -= 8;
    }

    // 4. Keyboard Navigation (WCAG 2.1.1)
    if (code.includes('onClick') && !code.includes('onKeyDown')) {
      issues.push('Interactive elements may not be keyboard accessible (WCAG 2.1.1)');
      improvements.push('Add keyboard event handlers for interactive elements');
      score -= 12;
    }

    // 5. Semantic HTML (WCAG 1.3.1)
    if (code.includes('<div') && code.includes('onClick') && !code.includes('role=')) {
      issues.push('Non-semantic elements used for interactive content (WCAG 1.3.1)');
      improvements.push('Use semantic HTML elements or add appropriate ARIA roles');
      score -= 8;
    }

    // 6. Headings Structure (WCAG 1.3.1)
    if (code.includes('<h1') && code.includes('<h3') && !code.includes('<h2')) {
      issues.push('Heading hierarchy is not logical (WCAG 1.3.1)');
      improvements.push('Ensure heading levels follow logical sequence (h1 → h2 → h3)');
      score -= 6;
    }

    // 7. Focus Management (WCAG 2.4.3)
    if (code.includes('tabindex="-1"') && !code.includes('focus()')) {
      issues.push('Elements removed from tab order without focus management (WCAG 2.4.3)');
      improvements.push('Implement proper focus management for hidden elements');
      score -= 5;
    }

    // 8. ARIA Labels (WCAG 4.1.2)
    if (code.includes('<button') && !code.includes('aria-label') && !code.includes('>')) {
      issues.push('Buttons missing accessible names (WCAG 4.1.2)');
      improvements.push('Add aria-label or text content to buttons');
      score -= 7;
    }

    // Bonus points for advanced accessibility features
    if (code.includes('role=')) score += 3;
    if (code.includes('aria-live')) score += 3;
    if (code.includes('aria-expanded')) score += 2;
    if (code.includes('aria-hidden')) score += 2;

    return {
      score: Math.max(0, Math.min(100, score)),
      wcagLevel: score >= 80 ? 'AA' : 'A',
      issues,
      improvements,
    };
  }

  /**
   * Add accessibility features to code if missing
   */
  addAccessibilityFeatures(code: string, _technology: string): string {
    let enhancedCode = code;

    // Add basic ARIA attributes
    if (!enhancedCode.includes('aria-')) {
      enhancedCode = enhancedCode.replace(/<button/g, '<button aria-label="Action button"');
    }

    // Add landmark roles
    if (!enhancedCode.includes('role=')) {
      enhancedCode = enhancedCode.replace(/<header>/g, '<header role="banner">');
      enhancedCode = enhancedCode.replace(/<main>/g, '<main role="main">');
      enhancedCode = enhancedCode.replace(/<footer>/g, '<footer role="contentinfo">');
    }

    // Add alt attributes to images
    if (enhancedCode.includes('<img') && !enhancedCode.includes('alt=')) {
      enhancedCode = enhancedCode.replace(/<img/g, '<img alt="Descriptive image"');
    }

    // Add labels to form inputs
    if (enhancedCode.includes('<input') && !enhancedCode.includes('aria-label')) {
      enhancedCode = enhancedCode.replace(/<input/g, '<input aria-label="Input field"');
    }

    return enhancedCode;
  }

  /**
   * Check if code has high contrast colors
   */
  private hasHighContrast(code: string): boolean {
    // Simple heuristic - look for high contrast color combinations
    const hasLightBackground =
      code.includes('background') &&
      (code.includes('white') || code.includes('#fff') || code.includes('rgb(255'));
    const hasDarkText =
      code.includes('color') &&
      (code.includes('black') || code.includes('#000') || code.includes('rgb(0'));

    return hasLightBackground && hasDarkText;
  }

  /**
   * Get accessibility recommendations based on code analysis
   */
  private getAccessibilityRecommendations(code: string): string[] {
    const recommendations: string[] = [];

    if (!code.includes('aria-')) {
      recommendations.push('Implement ARIA attributes for better screen reader support');
    }

    if (!code.includes('alt=')) {
      recommendations.push('Add descriptive alt text to all images');
    }

    if (!code.includes('role=')) {
      recommendations.push('Use semantic HTML elements or add appropriate ARIA roles');
    }

    if (!code.includes('focus')) {
      recommendations.push('Implement proper focus management for keyboard users');
    }

    if (!code.includes('lang=')) {
      recommendations.push('Add language attributes to HTML elements');
    }

    return recommendations;
  }
}
