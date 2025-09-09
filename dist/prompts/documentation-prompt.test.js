#!/usr/bin/env node
import { describe, it, expect } from 'vitest';
import { DocumentationPrompt, DocumentationPromptSchema, } from './documentation-prompt.js';
describe('DocumentationPrompt', () => {
    describe('Schema Validation', () => {
        it('should validate required fields', () => {
            const validInput = {
                code: 'function add(a, b) { return a + b; }',
                language: 'javascript',
                docType: 'function',
            };
            const result = DocumentationPromptSchema.safeParse(validInput);
            expect(result.success).toBe(true);
        });
        it('should validate all docType enum values', () => {
            const docTypes = [
                'api',
                'function',
                'class',
                'module',
                'readme',
                'tutorial',
                'guide',
            ];
            for (const docType of docTypes) {
                const input = {
                    code: 'sample code',
                    language: 'javascript',
                    docType,
                };
                const result = DocumentationPromptSchema.safeParse(input);
                expect(result.success).toBe(true);
            }
        });
        it('should validate all style enum values', () => {
            const styles = ['jsdoc', 'tsdoc', 'sphinx', 'markdown', 'asciidoc', 'plain'];
            for (const style of styles) {
                const input = {
                    code: 'sample code',
                    language: 'python',
                    docType: 'function',
                    style,
                };
                const result = DocumentationPromptSchema.safeParse(input);
                expect(result.success).toBe(true);
            }
        });
        it('should validate all audience enum values', () => {
            const audiences = ['developer', 'end-user', 'maintainer', 'beginner', 'expert'];
            for (const audience of audiences) {
                const input = {
                    code: 'sample code',
                    language: 'typescript',
                    docType: 'class',
                    audience,
                };
                const result = DocumentationPromptSchema.safeParse(input);
                expect(result.success).toBe(true);
            }
        });
        it('should reject invalid docType values', () => {
            const invalidInput = {
                code: 'sample code',
                language: 'javascript',
                docType: 'invalid-type', // Invalid enum value
            };
            const result = DocumentationPromptSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });
        it('should require all mandatory fields', () => {
            const invalidInputs = [
                { language: 'javascript', docType: 'function' }, // Missing code
                { code: 'sample code', docType: 'function' }, // Missing language
                { code: 'sample code', language: 'javascript' }, // Missing docType
            ];
            for (const invalidInput of invalidInputs) {
                const result = DocumentationPromptSchema.safeParse(invalidInput);
                expect(result.success).toBe(false);
            }
        });
        it('should validate complete input with all optional fields', () => {
            const validInput = {
                code: 'class Calculator { add(a, b) { return a + b; } }',
                language: 'javascript',
                docType: 'class',
                style: 'jsdoc',
                audience: 'developer',
                includeExamples: true,
                includeParameters: true,
                includeReturnValues: true,
                includeErrors: true,
                includeUsage: true,
                contextInfo: 'Simple calculator utility class',
                requirements: ['Include method signatures', 'Add usage examples'],
            };
            const result = DocumentationPromptSchema.safeParse(validInput);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.includeExamples).toBe(true);
                expect(result.data.requirements).toHaveLength(2);
            }
        });
    });
    describe('DocumentationPrompt Class', () => {
        it('should create prompt with valid configuration', () => {
            const config = {
                name: 'documentation-generator',
                description: 'Generates code documentation',
                version: '1.0.0',
            };
            const prompt = new DocumentationPrompt();
            expect(prompt).toBeInstanceOf(DocumentationPrompt);
        });
        it('should generate prompt for function documentation', async () => {
            const config = {
                name: 'documentation-generator',
                description: 'Function documentation generator',
                version: '1.0.0',
            };
            const prompt = new DocumentationPrompt();
            const input = {
                code: 'function calculateTax(income, rate) { return income * rate; }',
                language: 'javascript',
                docType: 'function',
            };
            const context = {
                requestId: 'func-doc-test',
                timestamp: new Date().toISOString(),
            };
            const result = await prompt.generateDocumentation(input, context);
            expect(result.success).toBe(true);
            expect(result.prompt).toContain('calculateTax');
            expect(result.prompt).toContain('function');
            expect(result.metadata?.variablesUsed).toEqual(Object.keys(input));
        });
        it('should generate prompt for class documentation', async () => {
            const config = {
                name: 'documentation-generator',
                description: 'Class documentation generator',
                version: '1.0.0',
            };
            const prompt = new DocumentationPrompt();
            const input = {
                code: `class UserManager {
          constructor(database) { this.db = database; }
          async createUser(userData) { return await this.db.insert(userData); }
          async getUser(id) { return await this.db.findById(id); }
        }`,
                language: 'javascript',
                docType: 'class',
                style: 'jsdoc',
                audience: 'developer',
                includeExamples: true,
                includeParameters: true,
                includeReturnValues: true,
            };
            const context = {
                requestId: 'class-doc-test',
                timestamp: new Date().toISOString(),
            };
            const result = await prompt.generateDocumentation(input, context);
            expect(result.success).toBe(true);
            expect(result.prompt).toContain('UserManager');
            expect(result.prompt).toContain('class');
            expect(result.prompt).toContain('jsdoc');
            expect(result.variables.includeExamples).toBe(true);
        });
        it('should generate prompt for API documentation', async () => {
            const config = {
                name: 'documentation-generator',
                description: 'API documentation generator',
                version: '1.0.0',
            };
            const prompt = new DocumentationPrompt();
            const input = {
                code: `@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    user = User.create(data)
    return jsonify(user.to_dict()), 201`,
                language: 'python',
                docType: 'api',
                style: 'sphinx',
                audience: 'developer',
                includeExamples: true,
                includeParameters: true,
                includeReturnValues: true,
                includeErrors: true,
                contextInfo: 'REST API for user management',
            };
            const context = {
                requestId: 'api-doc-test',
                timestamp: new Date().toISOString(),
            };
            const result = await prompt.generateDocumentation(input, context);
            expect(result.success).toBe(true);
            expect(result.prompt).toContain('/users');
            expect(result.prompt).toContain('POST');
            expect(result.prompt).toContain('sphinx');
            expect(result.variables.contextInfo).toContain('REST API');
        });
        it('should handle different programming languages', async () => {
            const config = {
                name: 'documentation-generator',
                description: 'Multi-language documentation generator',
                version: '1.0.0',
            };
            const prompt = new DocumentationPrompt();
            const languages = [
                { lang: 'javascript', code: 'const sum = (a, b) => a + b;' },
                { lang: 'python', code: 'def sum(a, b):\n    return a + b' },
                {
                    lang: 'typescript',
                    code: 'function sum(a: number, b: number): number { return a + b; }',
                },
                { lang: 'java', code: 'public int sum(int a, int b) { return a + b; }' },
                { lang: 'csharp', code: 'public int Sum(int a, int b) { return a + b; }' },
            ];
            for (const { lang, code } of languages) {
                const input = {
                    code,
                    language: lang,
                    docType: 'function',
                    style: 'markdown',
                };
                const context = {
                    requestId: `${lang}-test`,
                    timestamp: new Date().toISOString(),
                };
                const result = await prompt.generateDocumentation(input, context);
                expect(result.success).toBe(true);
                expect(result.prompt).toContain(lang);
                expect(result.prompt?.toLowerCase()).toContain('sum');
            }
        });
        it('should generate prompt for README documentation', async () => {
            const config = {
                name: 'documentation-generator',
                description: 'README generator',
                version: '1.0.0',
            };
            const prompt = new DocumentationPrompt();
            const input = {
                code: `// Main application entry point
const app = require('./app');
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});`,
                language: 'javascript',
                docType: 'readme',
                style: 'markdown',
                audience: 'end-user',
                includeUsage: true,
                contextInfo: 'Express.js web application',
                requirements: ['Installation instructions', 'Environment setup', 'Usage examples'],
            };
            const context = {
                requestId: 'readme-test',
                timestamp: new Date().toISOString(),
            };
            const result = await prompt.generateDocumentation(input, context);
            expect(result.success).toBe(true);
            expect(result.prompt).toContain('readme');
            expect(result.prompt).toContain('Express');
            expect(result.variables.requirements).toHaveLength(3);
        });
        it('should handle validation errors gracefully', async () => {
            const config = {
                name: 'documentation-generator',
                description: 'Documentation with validation',
                version: '1.0.0',
            };
            const prompt = new DocumentationPrompt();
            const invalidInput = {
                code: 'function test() {}',
                // Missing required language field
                docType: 'function',
            };
            const context = {
                requestId: 'validation-test',
                timestamp: new Date().toISOString(),
            };
            const result = await prompt.generateDocumentation(invalidInput, context);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Required');
        });
        it('should generate different prompts for different audiences', async () => {
            const config = {
                name: 'documentation-generator',
                description: 'Audience-specific documentation',
                version: '1.0.0',
            };
            const prompt = new DocumentationPrompt();
            const baseInput = {
                code: 'function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }',
                language: 'javascript',
                docType: 'function',
            };
            const audiences = ['developer', 'beginner', 'expert', 'end-user', 'maintainer'];
            for (const audience of audiences) {
                const input = {
                    ...baseInput,
                    audience,
                };
                const context = {
                    requestId: `${audience}-test`,
                    timestamp: new Date().toISOString(),
                };
                const result = await prompt.generateDocumentation(input, context);
                expect(result.success).toBe(true);
                expect(result.prompt).toContain(audience);
                expect(result.variables.audience).toBe(audience);
            }
        });
    });
    describe('Edge Cases', () => {
        it('should handle complex code with special characters', async () => {
            const config = {
                name: 'documentation-generator',
                description: 'Complex code documentation',
                version: '1.0.0',
            };
            const prompt = new DocumentationPrompt();
            const input = {
                code: `const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
function validateEmail(email) {
  return regex.test(email) && email.includes('@') && !email.includes('...');
}`,
                language: 'javascript',
                docType: 'function',
                style: 'jsdoc',
                includeExamples: true,
            };
            const context = {
                requestId: 'complex-code-test',
                timestamp: new Date().toISOString(),
            };
            const result = await prompt.generateDocumentation(input, context);
            expect(result.success).toBe(true);
            expect(result.prompt).toContain('validateEmail');
            expect(result.prompt).toContain('regex');
        });
        it('should handle very long code snippets', async () => {
            const config = {
                name: 'documentation-generator',
                description: 'Long code documentation',
                version: '1.0.0',
            };
            const prompt = new DocumentationPrompt();
            const longCode = 'function longFunction() {\n' + '  // comment\n'.repeat(100) + '}';
            const input = {
                code: longCode,
                language: 'javascript',
                docType: 'function',
                style: 'markdown',
            };
            const context = {
                requestId: 'long-code-test',
                timestamp: new Date().toISOString(),
            };
            const result = await prompt.generateDocumentation(input, context);
            expect(result.success).toBe(true);
            expect(result.prompt).toContain('longFunction');
        });
        it('should handle empty requirements array', async () => {
            const config = {
                name: 'documentation-generator',
                description: 'Documentation with empty requirements',
                version: '1.0.0',
            };
            const prompt = new DocumentationPrompt();
            const input = {
                code: 'function simple() { return true; }',
                language: 'javascript',
                docType: 'function',
                requirements: [], // Empty array
            };
            const context = {
                requestId: 'empty-requirements-test',
                timestamp: new Date().toISOString(),
            };
            const result = await prompt.generateDocumentation(input, context);
            expect(result.success).toBe(true);
            expect(result.variables.requirements).toEqual([]);
        });
    });
});
//# sourceMappingURL=documentation-prompt.test.js.map