#!/usr/bin/env node
export class ImprovementDetector {
    qualityThresholds = {
        high: 0.8,
        medium: 0.6,
        low: 0.4,
    };
    async detectImprovements(analysis, targetQualityLevel = 'standard') {
        const opportunities = [];
        // Analyze quality issues
        opportunities.push(...this.analyzeQualityIssues(analysis));
        // Analyze security issues
        opportunities.push(...this.analyzeSecurityIssues(analysis));
        // Analyze performance issues
        opportunities.push(...this.analyzePerformanceIssues(analysis));
        // Analyze maintainability issues
        opportunities.push(...this.analyzeMaintainabilityIssues(analysis));
        // Analyze documentation issues
        opportunities.push(...this.analyzeDocumentationIssues(analysis));
        // Analyze testing issues
        opportunities.push(...this.analyzeTestingIssues(analysis));
        // Calculate scores
        const scores = this.calculateScores(analysis, opportunities);
        // Generate recommendations
        const recommendations = this.generateRecommendations(opportunities, targetQualityLevel);
        // Sort opportunities by priority and impact
        opportunities.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return b.estimatedTime - a.estimatedTime;
        });
        return {
            projectId: analysis.projectMetadata.name,
            totalOpportunities: opportunities.length,
            highPriorityCount: opportunities.filter(o => o.priority === 'high').length,
            mediumPriorityCount: opportunities.filter(o => o.priority === 'medium').length,
            lowPriorityCount: opportunities.filter(o => o.priority === 'low').length,
            estimatedTotalTime: opportunities.reduce((sum, o) => sum + o.estimatedTime, 0),
            opportunities,
            summary: scores,
            recommendations,
        };
    }
    analyzeQualityIssues(analysis) {
        const opportunities = [];
        // Check for missing TypeScript configuration
        if (analysis.detectedTechStack.includes('typescript') &&
            !analysis.projectStructure.configFiles.some(f => f.includes('tsconfig'))) {
            opportunities.push({
                id: 'typescript-config',
                type: 'quality',
                priority: 'high',
                title: 'Add TypeScript Configuration',
                description: 'Project uses TypeScript but lacks proper configuration',
                impact: 'Improves type safety and developer experience',
                effort: 'low',
                estimatedTime: 1,
                dependencies: [],
                recommendations: [
                    'Create tsconfig.json with strict mode enabled',
                    'Configure compiler options for better type checking',
                    'Add TypeScript declaration files if needed',
                ],
                codeExamples: [
                    `{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src"
  }
}`,
                ],
            });
        }
        // Check for missing ESLint
        if (!analysis.projectStructure.configFiles.some(f => f.includes('eslint'))) {
            opportunities.push({
                id: 'eslint-config',
                type: 'quality',
                priority: 'high',
                title: 'Add ESLint Configuration',
                description: 'Missing code quality enforcement tool',
                impact: 'Enforces consistent code style and catches common errors',
                effort: 'low',
                estimatedTime: 2,
                dependencies: [],
                recommendations: [
                    'Install ESLint and appropriate plugins',
                    'Configure rules for your tech stack',
                    'Add lint script to package.json',
                    'Set up pre-commit hooks',
                ],
            });
        }
        // Check for missing Prettier
        if (!analysis.projectStructure.configFiles.some(f => f.includes('prettier'))) {
            opportunities.push({
                id: 'prettier-config',
                type: 'quality',
                priority: 'medium',
                title: 'Add Prettier Configuration',
                description: 'Missing code formatting tool',
                impact: 'Ensures consistent code formatting across the project',
                effort: 'low',
                estimatedTime: 1,
                dependencies: [],
                recommendations: [
                    'Install Prettier',
                    'Configure formatting rules',
                    'Add format script to package.json',
                    'Integrate with ESLint',
                ],
            });
        }
        return opportunities;
    }
    analyzeSecurityIssues(analysis) {
        const opportunities = [];
        // Check for missing .gitignore
        if (!analysis.projectStructure.files.includes('.gitignore')) {
            opportunities.push({
                id: 'gitignore-missing',
                type: 'security',
                priority: 'high',
                title: 'Add .gitignore File',
                description: 'Missing .gitignore file could lead to sensitive data being committed',
                impact: 'Prevents accidental commit of sensitive files and build artifacts',
                effort: 'low',
                estimatedTime: 0.5,
                dependencies: [],
                recommendations: [
                    'Create .gitignore file with appropriate patterns',
                    'Include node_modules, .env files, build directories',
                    'Review existing commits for sensitive data',
                ],
            });
        }
        // Check for environment files
        if (analysis.projectStructure.files.some(f => f.includes('.env') && !f.includes('.example'))) {
            opportunities.push({
                id: 'env-files-exposed',
                type: 'security',
                priority: 'high',
                title: 'Secure Environment Files',
                description: 'Environment files may be exposed in version control',
                impact: 'Prevents exposure of sensitive configuration data',
                effort: 'low',
                estimatedTime: 1,
                dependencies: [],
                recommendations: [
                    'Move .env files to .gitignore',
                    'Create .env.example with dummy values',
                    'Use environment variable management tools',
                    'Review git history for exposed secrets',
                ],
            });
        }
        // Check for package.json security
        if (analysis.projectMetadata.dependencies) {
            const hasSecurityAudit = analysis.projectStructure.files.some(f => f.includes('audit') || f.includes('security'));
            if (!hasSecurityAudit) {
                opportunities.push({
                    id: 'security-audit',
                    type: 'security',
                    priority: 'medium',
                    title: 'Add Security Audit',
                    description: 'Missing security audit for dependencies',
                    impact: 'Identifies and fixes security vulnerabilities in dependencies',
                    effort: 'low',
                    estimatedTime: 1,
                    dependencies: [],
                    recommendations: [
                        'Run npm audit to check for vulnerabilities',
                        'Add security audit script to package.json',
                        'Set up automated security scanning',
                        'Keep dependencies updated',
                    ],
                });
            }
        }
        return opportunities;
    }
    analyzePerformanceIssues(analysis) {
        const opportunities = [];
        // Check for missing bundler
        if (analysis.detectedTechStack.includes('typescript') ||
            analysis.detectedTechStack.includes('javascript')) {
            const hasBundler = analysis.detectedTechStack.includes('bundling') ||
                analysis.projectStructure.configFiles.some(f => f.includes('webpack') || f.includes('vite') || f.includes('rollup'));
            if (!hasBundler && analysis.projectStructure.files.length > 20) {
                opportunities.push({
                    id: 'bundler-missing',
                    type: 'performance',
                    priority: 'medium',
                    title: 'Add Module Bundler',
                    description: 'Large project without bundler may have performance issues',
                    impact: 'Improves load times and optimizes asset delivery',
                    effort: 'medium',
                    estimatedTime: 4,
                    dependencies: [],
                    recommendations: [
                        'Choose appropriate bundler (Webpack, Vite, Rollup)',
                        'Configure build optimization',
                        'Add code splitting for large applications',
                        'Set up asset optimization',
                    ],
                });
            }
        }
        // Check for missing compression
        if (analysis.detectedTechStack.includes('nodejs') ||
            analysis.detectedTechStack.includes('express')) {
            const hasCompression = analysis.projectStructure.files.some(f => f.includes('compression') || f.includes('gzip'));
            if (!hasCompression) {
                opportunities.push({
                    id: 'compression-missing',
                    type: 'performance',
                    priority: 'low',
                    title: 'Add Response Compression',
                    description: 'Missing response compression for better performance',
                    impact: 'Reduces bandwidth usage and improves load times',
                    effort: 'low',
                    estimatedTime: 1,
                    dependencies: [],
                    recommendations: [
                        'Add compression middleware',
                        'Configure gzip compression',
                        'Set up static asset compression',
                    ],
                });
            }
        }
        return opportunities;
    }
    analyzeMaintainabilityIssues(analysis) {
        const opportunities = [];
        // Check for missing documentation
        if (!analysis.projectStructure.files.some(f => f.includes('README'))) {
            opportunities.push({
                id: 'readme-missing',
                type: 'documentation',
                priority: 'medium',
                title: 'Add README Documentation',
                description: 'Missing project documentation',
                impact: 'Improves project understanding and onboarding',
                effort: 'low',
                estimatedTime: 2,
                dependencies: [],
                recommendations: [
                    'Create comprehensive README.md',
                    'Include installation instructions',
                    'Add usage examples',
                    'Document API endpoints if applicable',
                ],
            });
        }
        // Check for missing package.json scripts
        if (analysis.projectMetadata.scripts) {
            const requiredScripts = ['test', 'lint', 'build'];
            const missingScripts = requiredScripts.filter(script => !analysis.projectMetadata.scripts[script]);
            if (missingScripts.length > 0) {
                opportunities.push({
                    id: 'missing-scripts',
                    type: 'maintainability',
                    priority: 'medium',
                    title: 'Add Missing NPM Scripts',
                    description: `Missing essential scripts: ${missingScripts.join(', ')}`,
                    impact: 'Improves development workflow and automation',
                    effort: 'low',
                    estimatedTime: 1,
                    dependencies: [],
                    recommendations: [
                        'Add test script for running tests',
                        'Add lint script for code quality',
                        'Add build script for production builds',
                        'Consider adding start and dev scripts',
                    ],
                });
            }
        }
        return opportunities;
    }
    analyzeDocumentationIssues(analysis) {
        const opportunities = [];
        // Check for missing API documentation
        if (analysis.detectedTechStack.includes('nodejs') ||
            analysis.detectedTechStack.includes('express')) {
            const hasApiDocs = analysis.projectStructure.files.some(f => f.includes('swagger') || f.includes('openapi') || f.includes('api-docs'));
            if (!hasApiDocs) {
                opportunities.push({
                    id: 'api-docs-missing',
                    type: 'documentation',
                    priority: 'low',
                    title: 'Add API Documentation',
                    description: 'Missing API documentation for backend services',
                    impact: 'Improves API usability and developer experience',
                    effort: 'medium',
                    estimatedTime: 3,
                    dependencies: [],
                    recommendations: [
                        'Add Swagger/OpenAPI documentation',
                        'Document all API endpoints',
                        'Include request/response examples',
                        'Set up interactive API explorer',
                    ],
                });
            }
        }
        return opportunities;
    }
    analyzeTestingIssues(analysis) {
        const opportunities = [];
        // Check for missing test configuration
        if (!analysis.projectStructure.configFiles.some(f => f.includes('vitest') || f.includes('jest'))) {
            opportunities.push({
                id: 'test-config-missing',
                type: 'testing',
                priority: 'high',
                title: 'Add Test Configuration',
                description: 'Missing test framework configuration',
                impact: 'Enables automated testing for better code reliability',
                effort: 'medium',
                estimatedTime: 3,
                dependencies: [],
                recommendations: [
                    'Choose testing framework (Vitest, Jest, Mocha)',
                    'Configure test environment',
                    'Add test scripts to package.json',
                    'Set up test coverage reporting',
                ],
            });
        }
        // Check for missing test files
        const testFiles = analysis.projectStructure.files.filter(f => f.includes('.test.') || f.includes('.spec.') || f.includes('__tests__'));
        if (testFiles.length === 0 && analysis.projectStructure.files.length > 10) {
            opportunities.push({
                id: 'test-files-missing',
                type: 'testing',
                priority: 'high',
                title: 'Add Test Files',
                description: 'No test files found in the project',
                impact: 'Improves code reliability and prevents regressions',
                effort: 'high',
                estimatedTime: 8,
                dependencies: ['test-config-missing'],
                recommendations: [
                    'Write unit tests for core functionality',
                    'Add integration tests for API endpoints',
                    'Set up test coverage goals',
                    'Implement continuous testing in CI/CD',
                ],
            });
        }
        return opportunities;
    }
    calculateScores(analysis, opportunities) {
        const totalIssues = analysis.qualityIssues.length;
        const _totalOpportunities = opportunities.length;
        // Calculate quality score (inverse of issues)
        const qualityScore = Math.max(0, 100 - totalIssues * 10);
        // Calculate security score
        const securityIssues = opportunities.filter(o => o.type === 'security').length;
        const securityScore = Math.max(0, 100 - securityIssues * 15);
        // Calculate performance score
        const performanceIssues = opportunities.filter(o => o.type === 'performance').length;
        const performanceScore = Math.max(0, 100 - performanceIssues * 12);
        // Calculate maintainability score
        const maintainabilityIssues = opportunities.filter(o => o.type === 'maintainability').length;
        const maintainabilityScore = Math.max(0, 100 - maintainabilityIssues * 8);
        // Calculate overall score
        const overallScore = Math.round((qualityScore + securityScore + performanceScore + maintainabilityScore) / 4);
        return {
            qualityScore: Math.round(qualityScore),
            securityScore: Math.round(securityScore),
            performanceScore: Math.round(performanceScore),
            maintainabilityScore: Math.round(maintainabilityScore),
            overallScore,
        };
    }
    generateRecommendations(opportunities, targetQualityLevel) {
        const immediate = [];
        const shortTerm = [];
        const longTerm = [];
        // Categorize opportunities by timeline
        for (const opportunity of opportunities) {
            if (opportunity.priority === 'high' && opportunity.effort === 'low') {
                immediate.push(opportunity.title);
            }
            else if (opportunity.priority === 'high' || opportunity.effort === 'medium') {
                shortTerm.push(opportunity.title);
            }
            else {
                longTerm.push(opportunity.title);
            }
        }
        // Add level-specific recommendations
        if (targetQualityLevel === 'production') {
            immediate.push('Implement comprehensive monitoring and logging');
            immediate.push('Set up automated security scanning');
            shortTerm.push('Add performance monitoring and alerting');
            longTerm.push('Implement disaster recovery procedures');
        }
        else if (targetQualityLevel === 'enterprise') {
            immediate.push('Set up CI/CD pipeline');
            shortTerm.push('Implement code quality gates');
            longTerm.push('Add comprehensive documentation');
        }
        return { immediate, shortTerm, longTerm };
    }
}
//# sourceMappingURL=improvement-detector.js.map