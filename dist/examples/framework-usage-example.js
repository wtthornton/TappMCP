/**
 * Framework Usage Example
 *
 * Demonstrates how to use the Smart MCP framework components:
 * - Custom tool creation
 * - Resource management
 * - Prompt templates
 * - Registry system
 */
import { MCPTool } from '../framework/mcp-tool';
import { FileResource } from '../resources/file-resource';
import { ApiResource } from '../resources/api-resource';
// import { DatabaseResource } from '../resources/database-resource';
import { CodeGenerationPrompt } from '../prompts/code-generation-prompt';
import { MCPRegistry } from '../framework/registry';
import { z } from 'zod';
// ============================================================================
// Custom Tool Creation Example
// ============================================================================
// Define schemas for our custom tool
const CustomAnalysisInput = z.object({
    projectPath: z.string().min(1),
    analysisType: z.enum(['security', 'performance', 'quality', 'dependencies']),
    options: z
        .object({
        includeTests: z.boolean().default(true),
        outputFormat: z.enum(['json', 'markdown', 'html']).default('json'),
        severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    })
        .optional(),
});
const CustomAnalysisOutput = z.object({
    analysisId: z.string(),
    projectPath: z.string(),
    analysisType: z.string(),
    results: z.object({
        summary: z.string(),
        issues: z.array(z.object({
            type: z.string(),
            severity: z.string(),
            description: z.string(),
            file: z.string().optional(),
            line: z.number().optional(),
            suggestion: z.string().optional(),
        })),
        metrics: z.record(z.number()),
        score: z.number().min(0).max(100),
    }),
    recommendations: z.array(z.string()),
    executionTime: z.number(),
});
/**
 * Custom Code Analysis Tool
 *
 * Example of creating a specialized MCP tool that analyzes code projects
 * for security, performance, quality, or dependency issues.
 */
class CustomCodeAnalysisTool extends MCPTool {
    fileResource;
    constructor() {
        super({
            name: 'custom_code_analysis',
            version: '1.0.0',
            description: 'Analyze code projects for security, performance, quality, or dependency issues',
            inputSchema: CustomAnalysisInput,
            outputSchema: CustomAnalysisOutput,
        });
        this.fileResource = new FileResource();
    }
    async executeInternal(input) {
        const startTime = Date.now();
        // Initialize file resource
        await this.fileResource.initialize();
        // Perform analysis based on type
        const analysisResult = await this.performAnalysis(input);
        const executionTime = Date.now() - startTime;
        return {
            analysisId: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            projectPath: input.projectPath,
            analysisType: input.analysisType,
            results: analysisResult,
            recommendations: this.generateRecommendations(analysisResult, input.analysisType),
            executionTime,
        };
    }
    async performAnalysis(input) {
        switch (input.analysisType) {
            case 'security':
                return await this.performSecurityAnalysis(input);
            case 'performance':
                return await this.performPerformanceAnalysis(input);
            case 'quality':
                return await this.performQualityAnalysis(input);
            case 'dependencies':
                return await this.performDependencyAnalysis(input);
            default:
                throw new Error(`Unsupported analysis type: ${input.analysisType}`);
        }
    }
    async performSecurityAnalysis(_input) {
        // Example security analysis implementation
        const issues = [];
        // Mock file analysis for demonstration
        const mockFiles = ['src/index.ts', 'src/utils.js', 'config.json'];
        // Check for common security issues
        for (const filePath of mockFiles) {
            const contentResponse = await this.fileResource.executeFileOperation({
                path: filePath,
                mode: 'read',
                encoding: 'utf8',
                createIfNotExists: false,
                backup: false,
            });
            const content = contentResponse.data || '';
            // Check for hardcoded secrets
            if (content.includes('password') || content.includes('secret') || content.includes('token')) {
                issues.push({
                    type: 'potential-secret',
                    severity: 'high',
                    description: 'Potential hardcoded secret or password found',
                    file: filePath,
                    suggestion: 'Use environment variables for sensitive data',
                });
            }
            // Check for SQL injection risks
            if (content.includes('query') && content.includes('+')) {
                issues.push({
                    type: 'sql-injection-risk',
                    severity: 'critical',
                    description: 'Potential SQL injection vulnerability',
                    file: filePath,
                    suggestion: 'Use parameterized queries or ORM',
                });
            }
        }
        const score = Math.max(0, 100 - issues.length * 10);
        return {
            summary: `Security analysis found ${issues.length} potential issues`,
            issues,
            metrics: {
                totalFiles: mockFiles.length,
                issuesFound: issues.length,
                criticalIssues: issues.filter(i => i.severity === 'critical').length,
                highIssues: issues.filter(i => i.severity === 'high').length,
            },
            score,
        };
    }
    async performPerformanceAnalysis(_input) {
        // Example performance analysis
        const issues = [];
        const mockFiles = ['src/index.ts', 'src/utils.js'];
        for (const filePath of mockFiles) {
            const contentResponse = await this.fileResource.executeFileOperation({
                path: filePath,
                mode: 'read',
                encoding: 'utf8',
                createIfNotExists: false,
                backup: false,
            });
            const content = contentResponse.data || '';
            // Check for performance anti-patterns
            if (content.includes('for') && content.includes('await')) {
                issues.push({
                    type: 'async-loop',
                    severity: 'medium',
                    description: 'Potential performance issue with async operations in loops',
                    file: filePath,
                    suggestion: 'Consider using Promise.all() for parallel execution',
                });
            }
            // Check for large synchronous operations
            if (content.includes('readFileSync') || content.includes('writeFileSync')) {
                issues.push({
                    type: 'blocking-io',
                    severity: 'high',
                    description: 'Synchronous file operations can block the event loop',
                    file: filePath,
                    suggestion: 'Use async file operations',
                });
            }
        }
        const score = Math.max(0, 100 - issues.length * 15);
        return {
            summary: `Performance analysis found ${issues.length} potential issues`,
            issues,
            metrics: {
                totalFiles: mockFiles.length,
                performanceIssues: issues.length,
                blockingOperations: issues.filter(i => i.type === 'blocking-io').length,
            },
            score,
        };
    }
    async performQualityAnalysis(_input) {
        // Example quality analysis
        const issues = [];
        let totalLines = 0;
        let totalFunctions = 0;
        const mockFiles = ['src/index.ts', 'src/utils.js'];
        for (const filePath of mockFiles) {
            const contentResponse = await this.fileResource.executeFileOperation({
                path: filePath,
                mode: 'read',
                encoding: 'utf8',
                createIfNotExists: false,
                backup: false,
            });
            const content = contentResponse.data || '';
            const lines = content.split('\n');
            totalLines += lines.length;
            // Count functions
            const functionMatches = content.match(/function\s+\w+|=>\s*{|const\s+\w+\s*=/g);
            const functionCount = functionMatches?.length || 0;
            totalFunctions += functionCount;
            // Check for long functions
            lines.forEach((line, index) => {
                if (line.includes('function') || line.includes('=>')) {
                    // Simplified: assume functions longer than 50 lines are too long
                    const remainingLines = lines.slice(index);
                    let braceCount = 0;
                    let functionLength = 0;
                    for (const l of remainingLines) {
                        functionLength++;
                        braceCount += (l.match(/{/g) || []).length - (l.match(/}/g) || []).length;
                        if (braceCount <= 0 && functionLength > 1) {
                            break;
                        }
                    }
                    if (functionLength > 50) {
                        issues.push({
                            type: 'long-function',
                            severity: 'medium',
                            description: `Function is ${functionLength} lines long, consider breaking it down`,
                            file: filePath,
                            line: index + 1,
                            suggestion: 'Break large functions into smaller, focused functions',
                        });
                    }
                }
            });
        }
        const avgLinesPerFunction = totalFunctions > 0 ? totalLines / totalFunctions : 0;
        const score = Math.max(0, 100 - issues.length * 5 - Math.max(0, avgLinesPerFunction - 20));
        return {
            summary: `Quality analysis of ${mockFiles.length} files with ${totalLines} total lines`,
            issues,
            metrics: {
                totalFiles: mockFiles.length,
                totalLines,
                totalFunctions,
                avgLinesPerFunction: Math.round(avgLinesPerFunction),
                qualityIssues: issues.length,
            },
            score,
        };
    }
    async performDependencyAnalysis(_input) {
        // Example dependency analysis
        try {
            const packageJsonResponse = await this.fileResource.executeFileOperation({
                path: 'package.json',
                mode: 'read',
                encoding: 'utf8',
                createIfNotExists: false,
                backup: false,
            });
            const packageJson = packageJsonResponse.data || '{}';
            const pkg = JSON.parse(packageJson);
            const dependencies = {
                ...(pkg.dependencies || {}),
                ...(pkg.devDependencies || {}),
            };
            const issues = [];
            // Check for outdated patterns
            Object.keys(dependencies).forEach(dep => {
                if (dep.includes('lodash') && !dep.includes('lodash-es')) {
                    issues.push({
                        type: 'outdated-dependency',
                        severity: 'low',
                        description: 'Consider using lodash-es for better tree shaking',
                        suggestion: 'Replace lodash with lodash-es',
                    });
                }
                if (dep === 'moment') {
                    issues.push({
                        type: 'heavy-dependency',
                        severity: 'medium',
                        description: 'Moment.js is heavy and has maintenance concerns',
                        suggestion: 'Consider using date-fns or dayjs instead',
                    });
                }
            });
            const score = Math.max(0, 100 - issues.length * 8);
            return {
                summary: `Dependency analysis of ${Object.keys(dependencies).length} packages`,
                issues,
                metrics: {
                    totalDependencies: Object.keys(dependencies).length,
                    productionDeps: Object.keys(pkg.dependencies || {}).length,
                    devDeps: Object.keys(pkg.devDependencies || {}).length,
                    issuesFound: issues.length,
                },
                score,
            };
        }
        catch (_error) {
            return {
                summary: 'Could not analyze dependencies - package.json not found or invalid',
                issues: [
                    {
                        type: 'missing-package-json',
                        severity: 'high',
                        description: 'package.json file not found or invalid',
                        suggestion: 'Ensure package.json exists and is valid JSON',
                    },
                ],
                metrics: { totalDependencies: 0 },
                score: 0,
            };
        }
    }
    generateRecommendations(results, analysisType) {
        const recommendations = [];
        if (results.score < 70) {
            recommendations.push('Consider addressing high and critical severity issues first');
        }
        if (results.score < 50) {
            recommendations.push('Project requires significant improvements before production use');
        }
        switch (analysisType) {
            case 'security':
                if (results.issues.some((i) => i.severity === 'critical')) {
                    recommendations.push('Run a professional security audit before deployment');
                }
                recommendations.push('Implement automated security scanning in CI/CD pipeline');
                break;
            case 'performance':
                if (results.score < 80) {
                    recommendations.push('Run performance benchmarks and establish baseline metrics');
                    recommendations.push('Consider implementing performance monitoring in production');
                }
                break;
            case 'quality':
                recommendations.push('Set up automated code quality checks with ESLint and Prettier');
                if (results.metrics.avgLinesPerFunction > 30) {
                    recommendations.push('Establish coding standards for maximum function length');
                }
                break;
            case 'dependencies':
                recommendations.push('Regularly audit and update dependencies');
                recommendations.push('Use tools like npm audit or Snyk for vulnerability scanning');
                break;
        }
        return recommendations;
    }
}
// ============================================================================
// Resource Management Examples
// ============================================================================
async function demonstrateResourceManagement() {
    console.log('🔧 Resource Management Examples');
    console.log('='.repeat(40));
    // File Resource Example
    console.log('\n📁 File Resource Usage:');
    const fileResource = new FileResource();
    await fileResource.initialize();
    try {
        // Mock file operations for demonstration
        const mockFiles = ['src/index.ts', 'src/utils.ts'];
        console.log(`✅ Found ${mockFiles.length} TypeScript files`);
        // Read a specific file
        if (mockFiles.length > 0) {
            const contentResponse = await fileResource.executeFileOperation({
                path: mockFiles[0],
                mode: 'read',
                encoding: 'utf8',
                createIfNotExists: false,
                backup: false,
            });
            const content = contentResponse.data || '';
            console.log(`📖 Read ${content.length} characters from ${mockFiles[0]}`);
        }
        // Check if file exists (mock)
        console.log(`📦 package.json exists: true`);
    }
    catch (error) {
        console.error('❌ File resource error:', error);
    }
    // API Resource Example
    console.log('\n🌐 API Resource Usage:');
    const apiResource = new ApiResource();
    try {
        // Initialize API resource
        await apiResource.initialize();
        // Mock API operations for demonstration
        console.log(`✅ Retrieved 3 posts from API (mock)`);
        console.log(`✅ Created post with ID: 101 (mock)`);
    }
    catch (error) {
        console.error('❌ API resource error:', error);
    }
    // Database Resource Example (mock connection)
    console.log('\n🗄️ Database Resource Usage:');
    // const dbResource = new DatabaseResource();
    try {
        // Note: This will fail without a real database, but shows the API
        console.log('📝 Database connection example (would require real DB):');
        console.log('  await dbResource.connect("postgresql://localhost/mydb")');
        console.log('  const users = await dbResource.query("SELECT * FROM users LIMIT 5")');
        console.log('  console.log(`Found ${users.length} users`)');
    }
    catch (error) {
        console.log('ℹ️ Database connection not available in this example');
    }
}
// ============================================================================
// Prompt Template Examples
// ============================================================================
async function demonstratePromptTemplates() {
    console.log('\n🎯 Prompt Template Examples');
    console.log('='.repeat(40));
    const codePrompt = new CodeGenerationPrompt();
    // Generate prompt for API endpoint
    const apiPrompt = await codePrompt.generate({
        context: 'E-commerce platform',
        task: 'Create RESTful API endpoint for product management',
        techStack: ['typescript', 'express', 'prisma', 'zod'],
        constraints: [
            'Use TypeScript strict mode',
            'Implement proper error handling',
            'Add input validation with Zod',
            'Include comprehensive JSDoc comments',
            'Follow REST conventions',
        ],
    });
    console.log('🤖 Generated API Development Prompt:');
    console.log('─'.repeat(60));
    console.log(`${apiPrompt.data?.substring(0, 300)}...`);
    console.log('─'.repeat(60));
    // Generate prompt for React component
    const componentPrompt = await codePrompt.generate({
        context: 'Task management dashboard',
        task: 'Create reusable task card component',
        techStack: ['typescript', 'react', 'tailwindcss', 'react-hook-form'],
        constraints: [
            'Use functional components with hooks',
            'Implement proper TypeScript interfaces',
            'Add accessibility attributes',
            'Support dark/light theme',
            'Include loading and error states',
        ],
    });
    console.log('\n🎨 Generated Component Development Prompt:');
    console.log('─'.repeat(60));
    console.log(`${componentPrompt.data?.substring(0, 300)}...`);
    console.log('─'.repeat(60));
}
// ============================================================================
// Registry System Examples
// ============================================================================
async function demonstrateRegistry() {
    console.log('\n📚 Registry System Examples');
    console.log('='.repeat(40));
    const registry = new MCPRegistry();
    // Register our custom tool
    const analysisTools = new CustomCodeAnalysisTool();
    registry.registerTool(analysisTools);
    console.log('✅ Registered custom code analysis tool');
    // List all registered tools
    const tools = registry.getAllTools();
    console.log(`📋 Total registered tools: ${tools.length}`);
    tools.forEach((tool) => {
        console.log(`  📌 ${tool.getName()}: ${tool.getDescription()}`);
    });
    // Retrieve and use a tool
    const tool = registry.getTool('custom_code_analysis');
    if (tool) {
        console.log('\n🔍 Running custom code analysis...');
        try {
            const result = await tool.execute({
                projectPath: './src',
                analysisType: 'quality',
                options: {
                    includeTests: true,
                    outputFormat: 'json',
                    severity: 'medium',
                },
            });
            if (result.success && result.data) {
                const data = result.data;
                console.log(`✅ Analysis completed with score: ${data.results?.score || 0}/100`);
                console.log(`📊 Found ${data.results?.issues?.length || 0} issues`);
                console.log(`⏱️ Execution time: ${data.executionTime || 0}ms`);
                if (data.recommendations?.length > 0) {
                    console.log('💡 Recommendations:');
                    data.recommendations.forEach((rec, index) => {
                        console.log(`  ${index + 1}. ${rec}`);
                    });
                }
            }
        }
        catch (_error) {
            console.error('❌ Analysis failed:', _error);
        }
    }
}
// ============================================================================
// Main Example Runner
// ============================================================================
export async function runFrameworkExamples() {
    console.log('🚀 Smart MCP Framework Usage Examples');
    console.log('='.repeat(50));
    console.log('This example demonstrates:');
    console.log('• Custom MCP tool creation');
    console.log('• Resource management (File, API, Database)');
    console.log('• Prompt template generation');
    console.log('• Registry system usage');
    console.log('='.repeat(50));
    const startTime = Date.now();
    try {
        // Run all examples
        await demonstrateResourceManagement();
        await demonstratePromptTemplates();
        await demonstrateRegistry();
        const endTime = Date.now();
        console.log(`\n🎉 Framework examples completed successfully!`);
        console.log(`⏱️ Total execution time: ${endTime - startTime}ms`);
        console.log(`\n💡 Key Takeaways:`);
        console.log('• Framework provides consistent patterns for tool development');
        console.log('• Resources handle external integrations with proper error handling');
        console.log('• Prompt templates ensure consistent AI interactions');
        console.log('• Registry enables dynamic tool discovery and management');
        console.log('• All components include comprehensive TypeScript support');
    }
    catch (error) {
        console.error('\n❌ Framework examples failed:', error);
        throw error;
    }
}
// Run examples if called directly
if (require.main === module) {
    runFrameworkExamples().catch(console.error);
}
//# sourceMappingURL=framework-usage-example.js.map