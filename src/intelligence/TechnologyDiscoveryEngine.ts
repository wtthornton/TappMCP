/**
 * Technology Discovery Engine
 *
 * Dynamically discovers and categorizes technologies from Context7 data.
 * This engine queries Context7 to find available technologies and automatically
 * categorizes them into appropriate domains.
 */

import { Context7Cache } from '../core/context7-cache.js';
import { Context7Data } from './CategoryIntelligenceEngine.js';

export interface TechnologyMap {
  frontend: string[];
  backend: string[];
  database: string[];
  devops: string[];
  mobile: string[];
  datascience: string[];
  generic: string[];
}

/**
 * Engine for discovering and categorizing technologies
 */
export class TechnologyDiscoveryEngine {
  private context7Cache: Context7Cache;
  private technologyCache: Map<string, TechnologyMap>;
  private cacheTimeout: number = 3600000; // 1 hour cache timeout
  private lastCacheTime: number = 0;

  constructor() {
    this.context7Cache = new Context7Cache();
    this.technologyCache = new Map();
  }

  /**
   * Discover available technologies from Context7
   */
  async discoverAvailableTechnologies(_context7Data: Context7Data): Promise<TechnologyMap> {
    // Check cache first
    const cachedKey = 'all-technologies';
    const now = Date.now();

    if (this.technologyCache.has(cachedKey) && now - this.lastCacheTime < this.cacheTimeout) {
      console.log('[TechnologyDiscoveryEngine] Using cached technology map');
      return this.technologyCache.get(cachedKey)!;
    }

    try {
      // Query Context7 for all available technologies
      const technologies = await this.context7Cache.getRelevantData({
        businessRequest:
          'programming languages frameworks technologies development tools libraries platforms',
        domain: 'general',
        priority: 'high',
        maxResults: 100,
      });

      // Categorize technologies dynamically
      const technologyMap = this.categorizeTechnologies(technologies);

      // Cache the result
      this.technologyCache.set(cachedKey, technologyMap);
      this.lastCacheTime = now;

      console.log('[TechnologyDiscoveryEngine] Discovered technologies:', {
        frontend: technologyMap.frontend.length,
        backend: technologyMap.backend.length,
        database: technologyMap.database.length,
        devops: technologyMap.devops.length,
        mobile: technologyMap.mobile.length,
        datascience: technologyMap.datascience.length,
        generic: technologyMap.generic.length,
      });

      return technologyMap;
    } catch (error) {
      console.error('[TechnologyDiscoveryEngine] Error discovering technologies:', error);
      // Return default technology map on error
      return this.getDefaultTechnologyMap();
    }
  }

  /**
   * Categorize technologies based on their characteristics
   */
  private categorizeTechnologies(technologies: any): TechnologyMap {
    const map: TechnologyMap = {
      frontend: [],
      backend: [],
      database: [],
      devops: [],
      mobile: [],
      datascience: [],
      generic: [],
    };

    // If technologies is an array of items from Context7
    if (Array.isArray(technologies)) {
      for (const tech of technologies) {
        this.categorizeTechnology(tech, map);
      }
    } else if (technologies && typeof technologies === 'object') {
      // If technologies is a structured object with categories
      this.extractFromStructuredData(technologies, map);
    }

    // Add default technologies if categories are empty
    this.ensureDefaultTechnologies(map);

    return map;
  }

  /**
   * Categorize a single technology item
   */
  private categorizeTechnology(tech: any, map: TechnologyMap): void {
    const name = this.extractTechnologyName(tech);
    if (!name) return;

    const lowerName = name.toLowerCase();
    const description = this.extractDescription(tech).toLowerCase();

    // Frontend technologies
    if (this.isFrontendTechnology(lowerName, description)) {
      map.frontend.push(name);
    }
    // Backend technologies
    else if (this.isBackendTechnology(lowerName, description)) {
      map.backend.push(name);
    }
    // Database technologies
    else if (this.isDatabaseTechnology(lowerName, description)) {
      map.database.push(name);
    }
    // DevOps technologies
    else if (this.isDevOpsTechnology(lowerName, description)) {
      map.devops.push(name);
    }
    // Mobile technologies
    else if (this.isMobileTechnology(lowerName, description)) {
      map.mobile.push(name);
    }
    // Data Science technologies
    else if (this.isDataScienceTechnology(lowerName, description)) {
      map.datascience.push(name);
    }
    // Generic/Other
    else {
      map.generic.push(name);
    }
  }

  /**
   * Extract technology name from various data structures
   */
  private extractTechnologyName(tech: any): string {
    if (typeof tech === 'string') return tech;
    if (tech.name) return tech.name;
    if (tech.technology) return tech.technology;
    if (tech.title) return tech.title;
    if (tech.label) return tech.label;
    return '';
  }

  /**
   * Extract description from technology data
   */
  private extractDescription(tech: any): string {
    if (typeof tech === 'string') return tech;
    if (tech.description) return tech.description;
    if (tech.summary) return tech.summary;
    if (tech.details) return tech.details;
    return '';
  }

  /**
   * Check if technology is frontend-related
   */
  private isFrontendTechnology(name: string, description: string): boolean {
    const frontendKeywords = [
      'html',
      'css',
      'javascript',
      'typescript',
      'react',
      'vue',
      'angular',
      'svelte',
      'jquery',
      'bootstrap',
      'tailwind',
      'sass',
      'less',
      'webpack',
      'frontend',
      'front-end',
      'client-side',
      'browser',
      'dom',
      'ui',
      'ux',
      'component',
      'jsx',
      'tsx',
      'next.js',
      'nuxt',
      'gatsby',
      'web components',
    ];

    const combined = name + ' ' + description;
    return frontendKeywords.some(keyword => combined.includes(keyword));
  }

  /**
   * Check if technology is backend-related
   */
  private isBackendTechnology(name: string, description: string): boolean {
    const backendKeywords = [
      'node',
      'nodejs',
      'express',
      'python',
      'django',
      'flask',
      'fastapi',
      'java',
      'spring',
      'kotlin',
      'csharp',
      'c#',
      '.net',
      'asp.net',
      'go',
      'golang',
      'rust',
      'php',
      'laravel',
      'symfony',
      'ruby',
      'rails',
      'backend',
      'back-end',
      'server-side',
      'api',
      'rest',
      'graphql',
      'microservice',
      'serverless',
      'lambda',
      'function',
    ];

    const combined = name + ' ' + description;
    return backendKeywords.some(keyword => combined.includes(keyword));
  }

  /**
   * Check if technology is database-related
   */
  private isDatabaseTechnology(name: string, description: string): boolean {
    const databaseKeywords = [
      'database',
      'sql',
      'nosql',
      'postgresql',
      'postgres',
      'mysql',
      'mariadb',
      'mongodb',
      'redis',
      'cassandra',
      'couchdb',
      'dynamodb',
      'firebase',
      'sqlite',
      'oracle',
      'mssql',
      'sqlserver',
      'elasticsearch',
      'neo4j',
      'graphdb',
      'timeseries',
      'influxdb',
      'query',
      'orm',
      'odm',
      'prisma',
      'sequelize',
      'typeorm',
      'mongoose',
    ];

    const combined = name + ' ' + description;
    return databaseKeywords.some(keyword => combined.includes(keyword));
  }

  /**
   * Check if technology is DevOps-related
   */
  private isDevOpsTechnology(name: string, description: string): boolean {
    const devopsKeywords = [
      'docker',
      'kubernetes',
      'k8s',
      'terraform',
      'ansible',
      'puppet',
      'chef',
      'jenkins',
      'gitlab',
      'github',
      'circleci',
      'travis',
      'azure devops',
      'aws',
      'gcp',
      'azure',
      'cloud',
      'ci/cd',
      'cicd',
      'pipeline',
      'deployment',
      'infrastructure',
      'iac',
      'container',
      'orchestration',
      'monitoring',
      'prometheus',
      'grafana',
      'datadog',
      'newrelic',
      'logging',
      'elk',
      'helm',
      'vagrant',
      'packer',
    ];

    const combined = name + ' ' + description;
    return devopsKeywords.some(keyword => combined.includes(keyword));
  }

  /**
   * Check if technology is mobile-related
   */
  private isMobileTechnology(name: string, description: string): boolean {
    const mobileKeywords = [
      'mobile',
      'android',
      'ios',
      'swift',
      'kotlin',
      'react native',
      'react-native',
      'flutter',
      'xamarin',
      'ionic',
      'cordova',
      'phonegap',
      'nativescript',
      'expo',
      'capacitor',
      'objective-c',
      'objc',
      'xcode',
      'android studio',
      'app development',
      'mobile app',
      'smartphone',
      'tablet',
      'responsive',
      'pwa',
      'progressive web app',
    ];

    const combined = name + ' ' + description;
    return mobileKeywords.some(keyword => combined.includes(keyword));
  }

  /**
   * Check if technology is data science-related
   */
  private isDataScienceTechnology(name: string, description: string): boolean {
    const dataScienceKeywords = [
      'data science',
      'machine learning',
      'ml',
      'ai',
      'artificial intelligence',
      'deep learning',
      'neural network',
      'tensorflow',
      'pytorch',
      'keras',
      'scikit-learn',
      'sklearn',
      'pandas',
      'numpy',
      'scipy',
      'jupyter',
      'notebook',
      'anaconda',
      'conda',
      'r language',
      'rstudio',
      'matlab',
      'statistics',
      'data analysis',
      'data mining',
      'nlp',
      'computer vision',
      'cv',
      'bert',
      'gpt',
      'transformer',
      'model',
      'training',
      'dataset',
    ];

    const combined = name + ' ' + description;
    return dataScienceKeywords.some(keyword => combined.includes(keyword));
  }

  /**
   * Extract technologies from structured Context7 data
   */
  private extractFromStructuredData(data: any, map: TechnologyMap): void {
    // Handle various possible structures from Context7
    if (data.technologies) {
      this.processDataArray(data.technologies, map);
    }
    if (data.frameworks) {
      this.processDataArray(data.frameworks, map);
    }
    if (data.languages) {
      this.processDataArray(data.languages, map);
    }
    if (data.tools) {
      this.processDataArray(data.tools, map);
    }
    if (data.platforms) {
      this.processDataArray(data.platforms, map);
    }
    if (data.libraries) {
      this.processDataArray(data.libraries, map);
    }
  }

  /**
   * Process an array of technology data
   */
  private processDataArray(dataArray: any, map: TechnologyMap): void {
    if (!Array.isArray(dataArray)) {
      if (typeof dataArray === 'object') {
        // Convert object to array
        dataArray = Object.values(dataArray);
      } else {
        return;
      }
    }

    for (const item of dataArray) {
      this.categorizeTechnology(item, map);
    }
  }

  /**
   * Ensure each category has at least some default technologies
   */
  private ensureDefaultTechnologies(map: TechnologyMap): void {
    // Add default frontend technologies if empty
    if (map.frontend.length === 0) {
      map.frontend.push('HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular');
    }

    // Add default backend technologies if empty
    if (map.backend.length === 0) {
      map.backend.push('Node.js', 'Python', 'Java', 'C#', 'Go', 'Ruby', 'PHP');
    }

    // Add default database technologies if empty
    if (map.database.length === 0) {
      map.database.push('PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite');
    }

    // Add default DevOps technologies if empty
    if (map.devops.length === 0) {
      map.devops.push('Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitHub Actions');
    }

    // Add default mobile technologies if empty
    if (map.mobile.length === 0) {
      map.mobile.push('React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin');
    }

    // Add default data science technologies if empty
    if (map.datascience.length === 0) {
      map.datascience.push('Python', 'R', 'Jupyter', 'TensorFlow', 'PyTorch', 'Pandas');
    }
  }

  /**
   * Get default technology map when Context7 is unavailable
   */
  private getDefaultTechnologyMap(): TechnologyMap {
    return {
      frontend: [
        'HTML',
        'CSS',
        'JavaScript',
        'TypeScript',
        'React',
        'Vue',
        'Angular',
        'Svelte',
        'jQuery',
        'Bootstrap',
        'Tailwind CSS',
        'Sass',
        'Less',
        'Webpack',
        'Vite',
        'Next.js',
        'Nuxt.js',
        'Gatsby',
      ],
      backend: [
        'Node.js',
        'Express',
        'Python',
        'Django',
        'Flask',
        'FastAPI',
        'Java',
        'Spring',
        'C#',
        '.NET',
        'Go',
        'Rust',
        'PHP',
        'Laravel',
        'Ruby',
        'Rails',
      ],
      database: [
        'PostgreSQL',
        'MySQL',
        'MongoDB',
        'Redis',
        'Cassandra',
        'SQLite',
        'Oracle',
        'SQL Server',
        'DynamoDB',
        'Firebase',
        'Elasticsearch',
        'Neo4j',
      ],
      devops: [
        'Docker',
        'Kubernetes',
        'Terraform',
        'Ansible',
        'Jenkins',
        'GitLab CI',
        'GitHub Actions',
        'CircleCI',
        'AWS',
        'Azure',
        'GCP',
        'Prometheus',
        'Grafana',
        'ELK Stack',
        'Helm',
        'ArgoCD',
      ],
      mobile: [
        'React Native',
        'Flutter',
        'Swift',
        'Kotlin',
        'Xamarin',
        'Ionic',
        'Cordova',
        'NativeScript',
        'Expo',
        'Android',
        'iOS',
        'Capacitor',
      ],
      datascience: [
        'Python',
        'R',
        'Jupyter',
        'TensorFlow',
        'PyTorch',
        'Keras',
        'Pandas',
        'NumPy',
        'SciPy',
        'Scikit-learn',
        'Matplotlib',
        'Seaborn',
        'Plotly',
        'NLTK',
        'spaCy',
        'OpenCV',
      ],
      generic: [
        'Bash',
        'PowerShell',
        'Perl',
        'Lua',
        'Haskell',
        'Scala',
        'Clojure',
        'Erlang',
        'Elixir',
        'F#',
        'OCaml',
        'Nim',
        'Crystal',
        'Zig',
      ],
    };
  }

  /**
   * Clear the technology cache
   */
  clearCache(): void {
    this.technologyCache.clear();
    this.lastCacheTime = 0;
    console.log('[TechnologyDiscoveryEngine] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; age: number; timeout: number } {
    return {
      size: this.technologyCache.size,
      age: Date.now() - this.lastCacheTime,
      timeout: this.cacheTimeout,
    };
  }
}
