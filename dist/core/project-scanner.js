#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
export class ProjectScanner {
    configFilePatterns = [
        'package.json',
        'tsconfig.json',
        '.eslintrc.json',
        '.eslintrc.js',
        '.prettierrc',
        '.prettierrc.json',
        'vitest.config.ts',
        'jest.config.js',
        'webpack.config.js',
        'vite.config.ts',
        'next.config.js',
        'nuxt.config.js',
        'tailwind.config.js',
        'postcss.config.js',
        'babel.config.js',
        '.gitignore',
        '.env.example',
        'docker-compose.yml',
        'Dockerfile',
    ];
    techStackIndicators = {
        typescript: ['.ts', '.tsx', 'tsconfig.json'],
        javascript: ['.js', '.jsx', '.mjs'],
        react: ['react', 'react-dom', '.jsx', '.tsx'],
        vue: ['vue', 'nuxt', '.vue'],
        angular: ['@angular/core', 'angular'],
        nodejs: ['node', 'express', 'koa', 'fastify'],
        python: ['.py', 'requirements.txt', 'pyproject.toml'],
        java: ['.java', 'pom.xml', 'build.gradle'],
        csharp: ['.cs', '.csproj', 'packages.config'],
        php: ['.php', 'composer.json'],
        ruby: ['.rb', 'Gemfile'],
        go: ['.go', 'go.mod'],
        rust: ['.rs', 'Cargo.toml'],
        'mcp-server': ['@modelcontextprotocol/sdk'],
    };
    async scanProject(projectPath, analysisDepth = 'standard') {
        const startTime = Date.now();
        try {
            // Validate project path
            const stats = await fs.stat(projectPath);
            if (!stats.isDirectory()) {
                throw new Error(`Path ${projectPath} is not a directory`);
            }
            // Scan project structure
            const projectStructure = await this.scanProjectStructure(projectPath, analysisDepth);
            // Detect tech stack
            const detectedTechStack = await this.detectTechStack(projectPath, projectStructure);
            // Analyze quality issues
            const qualityIssues = await this.analyzeQualityIssues(projectPath, projectStructure, detectedTechStack);
            // Identify improvement opportunities
            const improvementOpportunities = await this.identifyImprovementOpportunities(projectPath, projectStructure, detectedTechStack, qualityIssues);
            // Extract project metadata
            const projectMetadata = await this.extractProjectMetadata(projectPath);
            return {
                projectStructure,
                detectedTechStack,
                qualityIssues,
                improvementOpportunities,
                projectMetadata,
                analysisDepth,
                analysisTimestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new Error(`Failed to scan project at ${projectPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async scanProjectStructure(projectPath, analysisDepth) {
        const folders = [];
        const files = [];
        const configFiles = [];
        const templates = [];
        const scanDirectory = async (dirPath, depth = 0) => {
            if (analysisDepth === 'quick' && depth > 2)
                return;
            if (analysisDepth === 'standard' && depth > 3)
                return;
            // deep analysis has no depth limit
            try {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dirPath, entry.name);
                    const relativePath = path.relative(projectPath, fullPath);
                    // Skip hidden files and common ignore patterns
                    if (entry.name.startsWith('.') && !this.configFilePatterns.includes(entry.name)) {
                        continue;
                    }
                    if (entry.isDirectory()) {
                        // Skip common directories that don't need analysis
                        if (['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt'].includes(entry.name)) {
                            continue;
                        }
                        folders.push(relativePath);
                        await scanDirectory(fullPath, depth + 1);
                    }
                    else {
                        files.push(relativePath);
                        // Check if it's a config file
                        if (this.configFilePatterns.includes(entry.name)) {
                            configFiles.push(relativePath);
                        }
                    }
                }
            }
            catch (error) {
                // Skip directories we can't read
                console.warn(`Warning: Could not read directory ${dirPath}: ${error}`);
            }
        };
        await scanDirectory(projectPath);
        return {
            folders: folders.sort(),
            files: files.sort(),
            configFiles: configFiles.sort(),
            templates, // Will be populated in future enhancements
        };
    }
    async detectTechStack(projectPath, projectStructure) {
        const detectedTech = [];
        // Check package.json for dependencies
        const packageJsonPath = path.join(projectPath, 'package.json');
        try {
            const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(packageContent);
            const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies,
            };
            // Check for tech stack indicators
            for (const [tech, indicators] of Object.entries(this.techStackIndicators)) {
                for (const indicator of indicators) {
                    if (indicator.startsWith('.')) {
                        // File extension
                        if (projectStructure.files.some(file => file.endsWith(indicator))) {
                            detectedTech.push(tech);
                            break;
                        }
                    }
                    else {
                        // Package name
                        if (allDeps[indicator]) {
                            detectedTech.push(tech);
                            break;
                        }
                    }
                }
            }
        }
        catch (error) {
            // No package.json or invalid format
        }
        // Check for config files
        for (const configFile of projectStructure.configFiles) {
            if (configFile.includes('tsconfig'))
                detectedTech.push('typescript');
            if (configFile.includes('vitest') || configFile.includes('jest'))
                detectedTech.push('testing');
            if (configFile.includes('eslint'))
                detectedTech.push('linting');
            if (configFile.includes('prettier'))
                detectedTech.push('formatting');
            if (configFile.includes('webpack') || configFile.includes('vite'))
                detectedTech.push('bundling');
            if (configFile.includes('docker'))
                detectedTech.push('containerization');
        }
        return [...new Set(detectedTech)]; // Remove duplicates
    }
    async analyzeQualityIssues(projectPath, projectStructure, detectedTechStack) {
        const issues = [];
        // Check for missing essential config files
        if (detectedTechStack.includes('typescript') && !projectStructure.configFiles.some(f => f.includes('tsconfig'))) {
            issues.push('Missing TypeScript configuration (tsconfig.json)');
        }
        if (!projectStructure.configFiles.some(f => f.includes('eslint'))) {
            issues.push('Missing ESLint configuration for code quality');
        }
        if (!projectStructure.configFiles.some(f => f.includes('prettier'))) {
            issues.push('Missing Prettier configuration for code formatting');
        }
        if (!projectStructure.configFiles.some(f => f.includes('vitest') || f.includes('jest'))) {
            issues.push('Missing test configuration (vitest.config.ts or jest.config.js)');
        }
        if (!projectStructure.files.includes('.gitignore')) {
            issues.push('Missing .gitignore file');
        }
        // Check for common quality issues
        if (projectStructure.files.some(f => f.includes('node_modules'))) {
            issues.push('node_modules directory should be in .gitignore');
        }
        if (projectStructure.files.some(f => f.includes('.env') && !f.includes('.example'))) {
            issues.push('Environment files should not be committed to version control');
        }
        // Check for package.json issues
        const packageJsonPath = path.join(projectPath, 'package.json');
        try {
            const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(packageContent);
            if (!packageJson.scripts || !packageJson.scripts.test) {
                issues.push('Missing test script in package.json');
            }
            if (!packageJson.scripts || !packageJson.scripts.lint) {
                issues.push('Missing lint script in package.json');
            }
            if (!packageJson.scripts || !packageJson.scripts.build) {
                issues.push('Missing build script in package.json');
            }
        }
        catch (error) {
            issues.push('Invalid or missing package.json');
        }
        return issues;
    }
    async identifyImprovementOpportunities(_projectPath, projectStructure, detectedTechStack, qualityIssues) {
        const opportunities = [];
        // Convert quality issues to improvement opportunities
        for (const issue of qualityIssues) {
            if (issue.includes('TypeScript configuration')) {
                opportunities.push('Add TypeScript configuration for better type safety');
            }
            else if (issue.includes('ESLint')) {
                opportunities.push('Add ESLint configuration for code quality enforcement');
            }
            else if (issue.includes('Prettier')) {
                opportunities.push('Add Prettier configuration for consistent code formatting');
            }
            else if (issue.includes('test configuration')) {
                opportunities.push('Add testing framework for better code reliability');
            }
            else if (issue.includes('.gitignore')) {
                opportunities.push('Add .gitignore file to exclude unnecessary files from version control');
            }
            else if (issue.includes('scripts')) {
                opportunities.push('Add missing npm scripts for better development workflow');
            }
        }
        // Add tech-stack specific opportunities
        if (detectedTechStack.includes('typescript') && !detectedTechStack.includes('linting')) {
            opportunities.push('Add ESLint with TypeScript support for better code quality');
        }
        if (detectedTechStack.includes('react') && !detectedTechStack.includes('testing')) {
            opportunities.push('Add React Testing Library for component testing');
        }
        if (detectedTechStack.includes('nodejs') && !detectedTechStack.includes('containerization')) {
            opportunities.push('Add Docker configuration for consistent deployment');
        }
        if (detectedTechStack.includes('typescript') && !projectStructure.files.some(f => f.includes('.d.ts'))) {
            opportunities.push('Add TypeScript declaration files for better type definitions');
        }
        // Add general improvement opportunities
        if (projectStructure.files.length > 50 && !detectedTechStack.includes('bundling')) {
            opportunities.push('Consider adding a bundler (Webpack, Vite) for better asset management');
        }
        if (!projectStructure.files.some(f => f.includes('README'))) {
            opportunities.push('Add README.md file for better project documentation');
        }
        if (!projectStructure.files.some(f => f.includes('LICENSE'))) {
            opportunities.push('Add LICENSE file to clarify usage rights');
        }
        return opportunities;
    }
    async extractProjectMetadata(projectPath) {
        const packageJsonPath = path.join(projectPath, 'package.json');
        try {
            const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(packageContent);
            return {
                name: packageJson.name || path.basename(projectPath),
                version: packageJson.version,
                description: packageJson.description,
                main: packageJson.main,
                scripts: packageJson.scripts,
                dependencies: packageJson.dependencies,
                devDependencies: packageJson.devDependencies,
            };
        }
        catch (error) {
            return {
                name: path.basename(projectPath),
            };
        }
    }
}
//# sourceMappingURL=project-scanner.js.map