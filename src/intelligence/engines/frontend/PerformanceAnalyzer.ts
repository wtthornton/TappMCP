/**
 * Frontend Performance Analyzer
 *
 * Specialized analyzer for frontend performance optimization, Core Web Vitals,
 * and performance best practices. Extracted from FrontendIntelligenceEngine.
 */

import { PerformanceAnalysis } from '../../CategoryIntelligenceEngine.js';

/**
 * Analyze code for frontend performance optimization opportunities
 */
export class PerformanceAnalyzer {
  /**
   * Analyze frontend code for performance bottlenecks and optimizations
   */
  async analyzePerformance(
    code: string,
    technology: string,
    _insights: any
  ): Promise<PerformanceAnalysis> {
    const bottlenecks: string[] = [];
    const optimizations: string[] = [];
    let score = 85;

    // Core Web Vitals Analysis

    // 1. Largest Contentful Paint (LCP) optimizations
    if (
      code.includes('<img') &&
      !code.includes('loading="lazy"') &&
      !code.includes('decoding="async"')
    ) {
      bottlenecks.push('Images not optimized for loading performance');
      optimizations.push('Add loading="lazy" and decoding="async" to images');
      score -= 8;
    }

    if (code.includes('<img') && !code.includes('sizes=') && code.includes('srcset=')) {
      optimizations.push('Add sizes attribute to responsive images for better LCP');
      score -= 5;
    }

    // 2. First Input Delay (FID) optimizations
    if (code.includes('addEventListener') && !code.includes('passive:')) {
      bottlenecks.push('Event listeners may block main thread');
      optimizations.push('Use passive event listeners for scroll/touch events');
      score -= 6;
    }

    if (code.includes('setTimeout(') || code.includes('setInterval(')) {
      if (!code.includes('requestAnimationFrame')) {
        optimizations.push('Use requestAnimationFrame for smooth animations');
        score -= 4;
      }
    }

    // 3. Cumulative Layout Shift (CLS) optimizations
    if (code.includes('<img') && !code.includes('width=') && !code.includes('height=')) {
      bottlenecks.push('Images without dimensions cause layout shift');
      optimizations.push('Add explicit width and height to images');
      score -= 7;
    }

    // 4. Resource Loading Performance
    if (code.includes('<script') && !code.includes('defer') && !code.includes('async')) {
      bottlenecks.push('Blocking script resources slow page load');
      optimizations.push('Add defer or async attributes to script tags');
      score -= 10;
    }

    if (code.includes('<link') && code.includes('stylesheet') && !code.includes('preload')) {
      optimizations.push('Consider preloading critical CSS resources');
      score -= 3;
    }

    // 5. Third-party Performance
    if (code.includes('fonts.googleapis.com') && !code.includes('font-display')) {
      optimizations.push('Add font-display: swap for better font loading performance');
      score -= 5;
    }

    // 6. JavaScript Performance
    if (code.includes('for') && code.includes('appendChild')) {
      bottlenecks.push('DOM manipulation in loops causes performance issues');
      optimizations.push('Use DocumentFragment for batch DOM updates');
      score -= 10;
    }

    if (code.includes('document.write')) {
      bottlenecks.push('document.write blocks page rendering');
      optimizations.push('Use modern DOM manipulation methods');
      score -= 20;
    }

    if (code.includes('innerHTML') && code.includes('+=')) {
      bottlenecks.push('String concatenation with innerHTML is inefficient');
      optimizations.push('Build HTML strings first, then set innerHTML once');
      score -= 8;
    }

    // 7. CSS Performance
    if (code.includes('*') && code.includes('{')) {
      bottlenecks.push('Universal selector can impact performance');
      optimizations.push('Use specific selectors instead of universal selector');
      score -= 3;
    }

    if (code.includes('@import')) {
      bottlenecks.push('@import blocks parallel CSS downloads');
      optimizations.push('Use <link> tags instead of @import');
      score -= 7;
    }

    // 8. Framework-specific optimizations
    if (technology.toLowerCase().includes('react')) {
      if (!code.includes('React.memo') && !code.includes('useMemo') && code.includes('render')) {
        optimizations.push('Use React.memo and useMemo for performance optimization');
        score -= 5;
      }
      if (code.includes('useState') && code.includes('object') && !code.includes('useCallback')) {
        optimizations.push('Use useCallback to prevent unnecessary re-renders');
        score -= 4;
      }
    }

    if (technology.toLowerCase().includes('vue')) {
      if (!code.includes('v-once') && code.includes('computed')) {
        optimizations.push('Use v-once directive for static content');
        score -= 3;
      }
    }

    // 9. Bundle and Code Splitting
    if (code.includes('import(') || code.includes('React.lazy')) {
      score += 8; // Bonus for code splitting
    }

    if (code.includes('Service Worker') || code.includes('sw.js')) {
      score += 5; // Bonus for service worker
    }

    // 10. Modern web APIs for performance
    if (code.includes('will-change:')) {
      score += 3; // Bonus for GPU acceleration hints
    }

    if (code.includes('contain:')) {
      score += 3; // Bonus for CSS containment
    }

    if (code.includes('content-visibility:')) {
      score += 5; // Bonus for content-visibility
    }

    // Performance monitoring
    if (code.includes('PerformanceObserver') || code.includes('web-vitals')) {
      score += 5; // Bonus for performance monitoring
    }

    return {
      score: Math.max(0, score),
      coreWebVitals: {
        lcp: score >= 80 ? 'good' : score >= 60 ? 'needs-improvement' : 'poor',
        fid: score >= 75 ? 'good' : score >= 55 ? 'needs-improvement' : 'poor',
        cls: score >= 85 ? 'good' : score >= 65 ? 'needs-improvement' : 'poor',
      },
      bottlenecks,
      optimizations,
    };
  }

  /**
   * Apply performance optimizations to code
   */
  optimizePerformance(code: string, technology: string): string {
    let optimizedCode = code;

    // Remove performance bottlenecks
    if (optimizedCode.includes('document.write')) {
      optimizedCode = optimizedCode.replace(
        /document\.write/g,
        '// document.write removed for performance'
      );
    }

    // Add lazy loading to images
    if (optimizedCode.includes('<img') && !optimizedCode.includes('loading=')) {
      optimizedCode = optimizedCode.replace(/<img/g, '<img loading="lazy" decoding="async"');
    }

    // Add defer to script tags
    if (
      optimizedCode.includes('<script') &&
      !optimizedCode.includes('defer') &&
      !optimizedCode.includes('async')
    ) {
      optimizedCode = optimizedCode.replace(/<script/g, '<script defer');
    }

    // Framework-specific optimizations
    if (technology.toLowerCase().includes('react')) {
      // Add React.memo wrapper if not present
      if (
        optimizedCode.includes('export default function') &&
        !optimizedCode.includes('React.memo')
      ) {
        optimizedCode = optimizedCode.replace(
          'export default function',
          'export default React.memo(function'
        );
        // Close the memo wrapper
        optimizedCode = optimizedCode.replace(/}\s*$/, '})');
      }
    }

    return optimizedCode;
  }

  /**
   * Get performance recommendations based on technology and code analysis
   */
  private getPerformanceRecommendations(code: string, technology: string): string[] {
    const recommendations: string[] = [];

    // General web performance recommendations
    recommendations.push('Minimize HTTP requests by combining CSS and JS files');
    recommendations.push('Enable gzip compression on server');
    recommendations.push('Use CDN for static assets');
    recommendations.push('Optimize images (WebP format, proper sizing)');

    // Code-specific recommendations
    if (!code.includes('loading="lazy"')) {
      recommendations.push('Implement lazy loading for images below the fold');
    }

    if (!code.includes('defer') && !code.includes('async')) {
      recommendations.push('Add defer or async attributes to non-critical scripts');
    }

    // Framework-specific recommendations
    if (technology.toLowerCase().includes('react')) {
      recommendations.push('Implement code splitting with React.lazy()');
      recommendations.push('Use React DevTools Profiler to identify performance bottlenecks');
      recommendations.push('Memoize expensive calculations with useMemo');
    }

    if (technology.toLowerCase().includes('vue')) {
      recommendations.push('Use Vue 3 composition API for better performance');
      recommendations.push('Implement virtual scrolling for large lists');
    }

    if (technology.toLowerCase().includes('angular')) {
      recommendations.push('Use OnPush change detection strategy');
      recommendations.push('Implement lazy loading for feature modules');
    }

    // CSS performance recommendations
    if (code.includes('<style') || technology.toLowerCase().includes('css')) {
      recommendations.push('Remove unused CSS with tools like PurgeCSS');
      recommendations.push('Use CSS containment for performance isolation');
      recommendations.push('Minimize CSS reflows and repaints');
    }

    return recommendations;
  }

  /**
   * Get Core Web Vitals thresholds and scoring
   */
  getCoreWebVitalsInfo() {
    return {
      lcp: {
        good: '≤ 2.5s',
        needsImprovement: '2.5s - 4.0s',
        poor: '> 4.0s',
      },
      fid: {
        good: '≤ 100ms',
        needsImprovement: '100ms - 300ms',
        poor: '> 300ms',
      },
      cls: {
        good: '≤ 0.1',
        needsImprovement: '0.1 - 0.25',
        poor: '> 0.25',
      },
    };
  }
}
