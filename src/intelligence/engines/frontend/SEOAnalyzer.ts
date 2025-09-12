/**
 * Frontend SEO Analyzer
 *
 * Specialized analyzer for search engine optimization in frontend code.
 * Covers meta tags, structured data, semantic HTML, and SEO best practices.
 * Extracted from FrontendIntelligenceEngine for better modularity.
 */

import { SEOAnalysis } from '../../CategoryIntelligenceEngine.js';

/**
 * Analyze code for SEO optimization opportunities and best practices
 */
export class SEOAnalyzer {
  /**
   * Analyze frontend code for SEO compliance and optimization opportunities
   */
  async analyzeSEO(code: string, _technology: string, _insights: any): Promise<SEOAnalysis> {
    let score = 70;
    const issues: string[] = [];
    const improvements: string[] = [];

    // Essential SEO elements
    const hasTitle = code.includes('<title>');
    const hasMetaDescription = code.includes('meta name="description"');
    const hasH1 = code.includes('<h1');
    const hasStructuredData = code.includes('schema.org') || code.includes('json-ld');
    const hasCanonical = code.includes('rel="canonical"');
    const hasViewport = code.includes('name="viewport"');

    // Score based on essential elements
    if (hasTitle) {
      score += 10;
      // Check title quality
      if (code.includes('<title></title>') || code.includes('<title>Page Title</title>')) {
        issues.push('Title tag is empty or generic');
        improvements.push('Add descriptive, unique page title (50-60 characters)');
        score -= 5;
      }
    } else {
      issues.push('Missing title tag');
      improvements.push('Add descriptive page title');
      score -= 15;
    }

    if (hasMetaDescription) {
      score += 10;
      // Check meta description quality
      if (code.includes('content=""') || code.includes('content="Page description"')) {
        issues.push('Meta description is empty or generic');
        improvements.push('Add compelling meta description (150-160 characters)');
        score -= 5;
      }
    } else {
      issues.push('Missing meta description');
      improvements.push('Add meta description for search snippets');
      score -= 12;
    }

    if (hasH1) {
      score += 5;
      // Check for multiple H1s (SEO anti-pattern)
      const h1Count = (code.match(/<h1/g) || []).length;
      if (h1Count > 1) {
        issues.push('Multiple H1 tags found (should be unique per page)');
        improvements.push('Use only one H1 tag per page');
        score -= 8;
      }
    } else {
      issues.push('Missing H1 heading');
      improvements.push('Add primary H1 heading');
      score -= 8;
    }

    if (hasStructuredData) {
      score += 10;
    } else {
      improvements.push('Add structured data (JSON-LD) for rich snippets');
      score -= 5;
    }

    if (hasCanonical) {
      score += 5;
    } else {
      improvements.push('Add canonical URL to prevent duplicate content issues');
      score -= 3;
    }

    if (hasViewport) {
      score += 5;
    } else {
      issues.push('Missing viewport meta tag');
      improvements.push('Add viewport meta tag for mobile optimization');
      score -= 10;
    }

    // Advanced SEO checks

    // Open Graph meta tags
    const hasOgTitle = code.includes('property="og:title"');
    const hasOgDescription = code.includes('property="og:description"');
    const hasOgImage = code.includes('property="og:image"');

    if (hasOgTitle && hasOgDescription && hasOgImage) {
      score += 8; // Bonus for social media optimization
    } else {
      improvements.push('Add Open Graph meta tags for social media sharing');
    }

    // Twitter Card meta tags
    const hasTwitterCard = code.includes('name="twitter:card"');
    if (hasTwitterCard) {
      score += 5; // Bonus for Twitter optimization
    }

    // Semantic HTML elements
    const semanticElements = ['<article', '<section', '<nav', '<header', '<footer', '<main'];
    const usesSemanticHTML = semanticElements.some(element => code.includes(element));

    if (usesSemanticHTML) {
      score += 8; // Bonus for semantic HTML
    } else {
      improvements.push('Use semantic HTML elements (article, section, nav, etc.)');
      score -= 5;
    }

    // Image SEO
    if (code.includes('<img')) {
      const imagesWithAlt = (code.match(/alt="/g) || []).length;
      const totalImages = (code.match(/<img/g) || []).length;

      if (imagesWithAlt === totalImages) {
        score += 5; // All images have alt text
      } else {
        issues.push('Some images missing alt attributes');
        improvements.push('Add descriptive alt text to all images');
        score -= 8;
      }
    }

    // Internal linking
    if (code.includes('<a href="/') || code.includes('<a href="./')) {
      score += 3; // Bonus for internal links
    }

    // Page speed indicators
    if (code.includes('loading="lazy"')) {
      score += 3; // Bonus for lazy loading
    }

    if (code.includes('preload')) {
      score += 2; // Bonus for resource preloading
    }

    // Language declaration
    if (code.includes('lang=')) {
      score += 3;
    } else {
      improvements.push('Add language declaration to html tag');
      score -= 2;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      metaTags: hasTitle && hasMetaDescription,
      structuredData: hasStructuredData,
      semanticHTML: usesSemanticHTML,
      improvements,
    };
  }

  /**
   * Add SEO optimizations to code
   */
  addSEOOptimizations(code: string, technology: string): string {
    let optimizedCode = code;

    // Add SEO optimizations for HTML
    if (technology.toLowerCase() === 'html' || code.includes('<!DOCTYPE')) {
      // Add title if missing
      if (!optimizedCode.includes('<title>')) {
        optimizedCode = optimizedCode.replace(
          /<head>/,
          '<head>\n    <title>Page Title - Update This</title>'
        );
      }

      // Add meta description if missing
      if (!optimizedCode.includes('meta name="description"')) {
        optimizedCode = optimizedCode.replace(
          /<title>.*<\/title>/,
          '$&\n    <meta name="description" content="Add compelling page description here (150-160 chars)">'
        );
      }

      // Add viewport if missing
      if (!optimizedCode.includes('name="viewport"')) {
        optimizedCode = optimizedCode.replace(
          /<meta name="description".*>/,
          '$&\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">'
        );
      }

      // Add canonical URL if missing
      if (!optimizedCode.includes('rel="canonical"')) {
        optimizedCode = optimizedCode.replace(
          /<meta name="viewport".*>/,
          '$&\n    <link rel="canonical" href="https://example.com/current-page">'
        );
      }

      // Add basic Open Graph tags if missing
      if (!optimizedCode.includes('property="og:')) {
        const ogTags = `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://example.com/">
    <meta property="og:title" content="Page Title">
    <meta property="og:description" content="Page description">
    <meta property="og:image" content="https://example.com/image.jpg">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://example.com/">
    <meta property="twitter:title" content="Page Title">
    <meta property="twitter:description" content="Page description">
    <meta property="twitter:image" content="https://example.com/image.jpg">`;

        optimizedCode = optimizedCode.replace(/<link rel="canonical".*>/, '$&' + ogTags);
      }

      // Add language if missing
      if (!optimizedCode.includes('lang=')) {
        optimizedCode = optimizedCode.replace(/<html/, '<html lang="en"');
      }
    }

    return optimizedCode;
  }

  /**
   * Generate structured data (JSON-LD) for common content types
   */
  generateStructuredData(
    contentType: 'website' | 'article' | 'product' | 'organization',
    data: any
  ): string {
    const baseStructure = {
      '@context': 'https://schema.org',
      '@type': contentType.charAt(0).toUpperCase() + contentType.slice(1),
    };

    let structuredData;

    switch (contentType) {
      case 'website':
        structuredData = {
          ...baseStructure,
          name: data.name || 'Website Name',
          url: data.url || 'https://example.com',
          description: data.description || 'Website description',
        };
        break;

      case 'article':
        structuredData = {
          ...baseStructure,
          headline: data.headline || 'Article Title',
          author: {
            '@type': 'Person',
            name: data.author || 'Author Name',
          },
          datePublished: data.datePublished || new Date().toISOString(),
          description: data.description || 'Article description',
        };
        break;

      case 'product':
        structuredData = {
          ...baseStructure,
          name: data.name || 'Product Name',
          description: data.description || 'Product description',
          offers: {
            '@type': 'Offer',
            price: data.price || '0',
            priceCurrency: data.currency || 'USD',
          },
        };
        break;

      case 'organization':
        structuredData = {
          ...baseStructure,
          name: data.name || 'Organization Name',
          url: data.url || 'https://example.com',
          logo: data.logo || 'https://example.com/logo.jpg',
        };
        break;

      default:
        structuredData = baseStructure;
    }

    return `<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>`;
  }

  /**
   * Get SEO recommendations based on code analysis
   */
  private getSEORecommendations(code: string): string[] {
    const recommendations: string[] = [];

    // Essential recommendations
    recommendations.push('Optimize page title (50-60 characters, include primary keyword)');
    recommendations.push('Write compelling meta description (150-160 characters)');
    recommendations.push('Use semantic HTML elements for better content structure');

    // Technical SEO
    if (!code.includes('sitemap')) {
      recommendations.push('Create and submit XML sitemap');
    }

    if (!code.includes('robots')) {
      recommendations.push('Add robots.txt file for search engine crawling guidance');
    }

    // Content recommendations
    recommendations.push('Use heading hierarchy (H1 → H2 → H3) logically');
    recommendations.push('Add internal links to related content');
    recommendations.push('Optimize images with descriptive alt text and proper file names');

    // Performance for SEO
    recommendations.push('Improve page load speed (Core Web Vitals)');
    recommendations.push('Ensure mobile-first responsive design');
    recommendations.push('Use HTTPS for security and SEO benefits');

    // Advanced SEO
    recommendations.push('Implement structured data for rich snippets');
    recommendations.push('Add Open Graph and Twitter Card meta tags');
    recommendations.push('Create content clusters and topic authority');

    return recommendations;
  }
}
