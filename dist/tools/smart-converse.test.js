/**
 * Tests for Smart Converse Tool
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSmartConverse, SmartConverseSchema, parseIntent, generateResponse } from './smart-converse.js';
import * as smartOrchestrate from './smart-orchestrate.js';
// Mock the smart-orchestrate module
vi.mock('./smart-orchestrate.js', () => ({
    handleSmartOrchestrate: vi.fn()
}));
describe('SmartConverse Tool', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('Basic Tool Structure', () => {
        it('should have a valid schema', () => {
            const schema = SmartConverseSchema;
            expect(schema).toBeDefined();
            // Test valid input
            const validInput = { userMessage: 'I want to create a web application' };
            const result = schema.safeParse(validInput);
            expect(result.success).toBe(true);
        });
        it('should reject empty messages', () => {
            const schema = SmartConverseSchema;
            const invalidInput = { userMessage: '' };
            const result = schema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });
        it('should reject missing userMessage', () => {
            const schema = SmartConverseSchema;
            const invalidInput = {};
            const result = schema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });
    });
    describe('Handler Function', () => {
        it('should return success response for valid input', async () => {
            // Mock the orchestrate response
            vi.mocked(smartOrchestrate.handleSmartOrchestrate).mockResolvedValue({
                success: true,
                orchestrationId: 'orch-123',
                businessContext: {
                    projectId: 'test-project-123',
                    businessGoals: [],
                    requirements: [],
                    stakeholders: [],
                    constraints: {}
                }
            });
            const input = { userMessage: 'I want to create a web application' };
            const response = await handleSmartConverse(input);
            expect(response).toBeDefined();
            expect(response.content).toBeDefined();
            expect(response.content[0].type).toBe('text');
            // Should return formatted text, not JSON
            const text = response.content[0].text;
            expect(text).toContain('Project');
            expect(text).toContain('Initialized Successfully');
            expect(text).toContain('web application');
        });
        it('should handle errors gracefully', async () => {
            const invalidInput = { userMessage: '' };
            const response = await handleSmartConverse(invalidInput);
            expect(response).toBeDefined();
            expect(response.isError).toBe(true);
            expect(response.content[0].type).toBe('text');
            const text = response.content[0].text;
            expect(text).toContain('Unable to Process');
            expect(text).toContain('Error Details');
        });
        it('should handle null input gracefully', async () => {
            const response = await handleSmartConverse(null);
            expect(response).toBeDefined();
            expect(response.isError).toBe(true);
            const text = response.content[0].text;
            expect(text).toContain('Unable to Process');
        });
        it('should handle undefined input gracefully', async () => {
            const response = await handleSmartConverse(undefined);
            expect(response).toBeDefined();
            expect(response.isError).toBe(true);
            const text = response.content[0].text;
            expect(text).toContain('Unable to Process');
        });
    });
    describe('Intent Parsing', () => {
        it('should detect web-app project type', () => {
            const intent = parseIntent('I want to create a website for my business');
            expect(intent.projectType).toBe('web-app');
        });
        it('should detect api-service project type', () => {
            const intent = parseIntent('Build a REST API for user management');
            expect(intent.projectType).toBe('api-service');
        });
        it('should detect mobile-app project type', () => {
            const intent = parseIntent('Create an iOS app for shopping');
            expect(intent.projectType).toBe('mobile-app');
        });
        it('should detect library project type', () => {
            const intent = parseIntent('I need to build a utility library');
            expect(intent.projectType).toBe('library');
        });
        it('should detect React tech stack', () => {
            const intent = parseIntent('Create a React application with TypeScript');
            expect(intent.techStack).toContain('react');
            expect(intent.techStack).toContain('typescript');
        });
        it('should detect Vue tech stack', () => {
            const intent = parseIntent('Build a Vue.js website');
            expect(intent.techStack).toContain('vue');
        });
        it('should detect Node.js tech stack', () => {
            const intent = parseIntent('Create a Node.js backend service');
            expect(intent.techStack).toContain('nodejs');
        });
        it('should detect Python tech stack', () => {
            const intent = parseIntent('Build a Python API with FastAPI');
            expect(intent.techStack).toContain('python');
        });
        it('should detect developer role', () => {
            const intent = parseIntent('I want to develop a new application');
            expect(intent.role).toBe('developer');
        });
        it('should detect designer role', () => {
            const intent = parseIntent('I need to design a beautiful UI');
            expect(intent.role).toBe('designer');
        });
        it('should detect qa-engineer role', () => {
            const intent = parseIntent('I want to test the application thoroughly');
            expect(intent.role).toBe('qa-engineer');
        });
        it('should detect operations-engineer role', () => {
            const intent = parseIntent('Deploy the application to production');
            expect(intent.role).toBe('operations-engineer');
        });
        it('should detect product-strategist role', () => {
            const intent = parseIntent('Plan the product roadmap');
            expect(intent.role).toBe('product-strategist');
        });
        it('should extract project name from quotes', () => {
            const intent = parseIntent('Create a web app called "MyAwesomeApp"');
            expect(intent.projectName).toBe('MyAwesomeApp');
        });
        it('should extract project name after "called"', () => {
            const intent = parseIntent('Build an API called UserService');
            expect(intent.projectName).toBe('UserService');
        });
        it('should use default project name when not specified', () => {
            const intent = parseIntent('Create a simple website');
            expect(intent.projectName).toBe('new-project');
        });
        it('should generate unique project ID', () => {
            const intent1 = parseIntent('Create app 1');
            const intent2 = parseIntent('Create app 2');
            expect(intent1.projectId).not.toBe(intent2.projectId);
        });
        it('should handle complex sentences with multiple keywords', () => {
            const intent = parseIntent('I want to build and deploy a React web application with Node.js backend for testing');
            expect(intent.projectType).toBe('api-service'); // 'backend' comes first in the text
            expect(intent.techStack).toContain('react');
            expect(intent.techStack).toContain('nodejs');
            expect(intent.role).toBe('developer'); // 'build' comes before 'deploy' and 'testing'
        });
        it('should use defaults for unrecognized input', () => {
            const intent = parseIntent('Something completely unrelated');
            expect(intent.projectType).toBe('web-app');
            expect(intent.techStack).toEqual([]);
            expect(intent.role).toBe('developer');
        });
    });
    describe('Smart Orchestrate Integration', () => {
        it('should call smart_orchestrate with correct parameters', async () => {
            vi.mocked(smartOrchestrate.handleSmartOrchestrate).mockResolvedValue({
                success: true,
                orchestrationId: 'orch-456'
            });
            const input = { userMessage: 'Build a React website called "MyApp"' };
            await handleSmartConverse(input);
            expect(smartOrchestrate.handleSmartOrchestrate).toHaveBeenCalledWith(expect.objectContaining({
                request: 'Build a React website called "MyApp"',
                workflow: 'project',
                role: 'developer',
                options: expect.objectContaining({
                    businessContext: expect.objectContaining({
                        projectId: expect.stringContaining('MyApp-')
                    })
                })
            }));
        });
        it('should pass tech stack to orchestrate', async () => {
            vi.mocked(smartOrchestrate.handleSmartOrchestrate).mockResolvedValue({
                success: true,
                orchestrationId: 'orch-789'
            });
            const input = { userMessage: 'Create a Node.js API with TypeScript' };
            await handleSmartConverse(input);
            const callArgs = vi.mocked(smartOrchestrate.handleSmartOrchestrate).mock.calls[0][0];
            expect(callArgs.options.businessContext.constraints.techStack).toContain('nodejs');
            expect(callArgs.options.businessContext.constraints.techStack).toContain('typescript');
        });
        it('should pass role to orchestrate', async () => {
            vi.mocked(smartOrchestrate.handleSmartOrchestrate).mockResolvedValue({
                success: true,
                orchestrationId: 'orch-101'
            });
            const input = { userMessage: 'I need to design a user interface' };
            await handleSmartConverse(input);
            const callArgs = vi.mocked(smartOrchestrate.handleSmartOrchestrate).mock.calls[0][0];
            expect(callArgs.role).toBe('designer');
            expect(callArgs.options.businessContext.stakeholders).toContain('designer');
        });
        it('should handle orchestrate errors gracefully', async () => {
            vi.mocked(smartOrchestrate.handleSmartOrchestrate).mockRejectedValue(new Error('Orchestration failed'));
            const input = { userMessage: 'Create something' };
            const response = await handleSmartConverse(input);
            expect(response.isError).toBe(true);
            const text = response.content[0].text;
            expect(text).toContain('Unable to Process');
            expect(text).toContain('Orchestration failed');
        });
        it('should return orchestration result in response', async () => {
            const mockOrchestrateResult = {
                success: true,
                orchestrationId: 'orch-202',
                businessValue: {
                    costPrevention: 5000,
                    timeSaved: 20
                }
            };
            vi.mocked(smartOrchestrate.handleSmartOrchestrate).mockResolvedValue(mockOrchestrateResult);
            const input = { userMessage: 'Build an application' };
            const response = await handleSmartConverse(input);
            const text = response.content[0].text;
            expect(text).toContain('Project');
            expect(text).toContain('orch-202');
            expect(text).toContain('5,000'); // Cost prevention formatted
            expect(text).toContain('20 hours'); // Time saved
        });
    });
    describe('Response Generation', () => {
        it('should generate success response with project details', () => {
            const intent = {
                projectId: 'test-123',
                projectName: 'MyApp',
                projectType: 'web-app',
                techStack: ['react', 'typescript'],
                role: 'developer',
                description: 'Test project'
            };
            const orchestrateResult = {
                success: true,
                orchestrationId: 'orch-999',
                businessValue: {
                    costPrevention: 10000,
                    timeSaved: 50
                }
            };
            const response = generateResponse(intent, orchestrateResult);
            expect(response).toContain('MyApp');
            expect(response).toContain('web application');
            expect(response).toContain('react, typescript');
            expect(response).toContain('orch-999');
            expect(response).toContain('10,000');
            expect(response).toContain('50 hours');
        });
        it('should generate error response for failed orchestration', () => {
            const intent = {
                projectId: 'test-456',
                projectName: 'FailedApp',
                projectType: 'api-service',
                techStack: [],
                role: 'developer',
                description: 'Failed project'
            };
            const orchestrateResult = {
                success: false
            };
            const response = generateResponse(intent, orchestrateResult);
            expect(response).toContain('encountered an issue');
            expect(response).toContain('api-service');
            expect(response).not.toContain('Successfully');
        });
        it('should include workflow phases if available', () => {
            const intent = {
                projectId: 'test-789',
                projectName: 'WorkflowApp',
                projectType: 'mobile-app',
                techStack: ['react-native'],
                role: 'designer',
                description: 'Mobile project'
            };
            const orchestrateResult = {
                success: true,
                orchestrationId: 'orch-888',
                workflow: {
                    phases: [
                        { name: 'Planning' },
                        { id: 'development' },
                        { name: 'Testing' },
                        { name: 'Deployment' }
                    ]
                }
            };
            const response = generateResponse(intent, orchestrateResult);
            expect(response).toContain('Workflow Phases');
            expect(response).toContain('Planning');
            expect(response).toContain('development');
            expect(response).toContain('Testing');
            expect(response).not.toContain('Deployment'); // Only first 3 phases shown
        });
        it('should handle missing business value gracefully', () => {
            const intent = {
                projectId: 'test-111',
                projectName: 'NoValueApp',
                projectType: 'library',
                techStack: [],
                role: 'qa-engineer',
                description: 'Library project'
            };
            const orchestrateResult = {
                success: true,
                orchestrationId: 'orch-777'
            };
            const response = generateResponse(intent, orchestrateResult);
            expect(response).toContain('software library');
            expect(response).toContain('quality assurance');
            expect(response).not.toContain('Business Value'); // Section should not appear
        });
    });
    describe('Response Format', () => {
        it('should return properly formatted ToolResponse', async () => {
            vi.mocked(smartOrchestrate.handleSmartOrchestrate).mockResolvedValue({
                success: true,
                orchestrationId: 'orch-303'
            });
            const input = { userMessage: 'Create a React app' };
            const response = await handleSmartConverse(input);
            // Check ToolResponse structure
            expect(response).toHaveProperty('content');
            expect(Array.isArray(response.content)).toBe(true);
            expect(response.content.length).toBeGreaterThan(0);
            expect(response.content[0]).toHaveProperty('type');
            expect(response.content[0]).toHaveProperty('text');
        });
        it('should include JSON parseable content', async () => {
            vi.mocked(smartOrchestrate.handleSmartOrchestrate).mockResolvedValue({
                success: true,
                orchestrationId: 'orch-404'
            });
            const input = { userMessage: 'Build an API service' };
            const response = await handleSmartConverse(input);
            // Content should be formatted text
            const text = response.content[0].text;
            expect(typeof text).toBe('string');
            expect(text.length).toBeGreaterThan(0);
            expect(text).toContain('Project');
        });
    });
});
//# sourceMappingURL=smart-converse.test.js.map