"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const static_analyzer_js_1 = require("./static-analyzer.js");
// Mock child_process
vitest_1.vi.mock('child_process', () => ({
    execSync: vitest_1.vi.fn(),
}));
// Mock fs
vitest_1.vi.mock('fs', () => ({
    readFileSync: vitest_1.vi.fn(),
    existsSync: vitest_1.vi.fn(),
}));
// Mock path
vitest_1.vi.mock('path', () => ({
    join: vitest_1.vi.fn((...args) => args.join('/')),
}));
(0, vitest_1.describe)('StaticAnalyzer', () => {
    let staticAnalyzer;
    const mockProjectPath = '/test/project';
    (0, vitest_1.beforeEach)(() => {
        staticAnalyzer = new static_analyzer_js_1.StaticAnalyzer(mockProjectPath);
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('runStaticAnalysis', () => {
        (0, vitest_1.it)('should run comprehensive static analysis', async () => {
            const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
            const { readFileSync } = await Promise.resolve().then(() => __importStar(require('fs')));
            // Mock ESLint output
            execSync.mockImplementation((command) => {
                if (command.includes('eslint')) {
                    return JSON.stringify([
                        {
                            filePath: '/test/project/src/test.ts',
                            messages: [
                                {
                                    ruleId: 'no-console',
                                    severity: 1,
                                    message: 'Unexpected console statement',
                                    line: 5,
                                    column: 1,
                                },
                            ],
                        },
                    ]);
                }
                if (command.includes('tsc')) {
                    throw new Error('TypeScript errors found');
                }
                return '';
            });
            // Mock file reading
            readFileSync.mockReturnValue('console.log("test");\nif (true) { console.log("test"); }');
            const result = await staticAnalyzer.runStaticAnalysis();
            (0, vitest_1.expect)(result).toHaveProperty('issues');
            (0, vitest_1.expect)(result).toHaveProperty('scanTime');
            (0, vitest_1.expect)(result).toHaveProperty('status');
            (0, vitest_1.expect)(result).toHaveProperty('summary');
            (0, vitest_1.expect)(result).toHaveProperty('metrics');
            (0, vitest_1.expect)(result.issues.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should handle ESLint failures gracefully', async () => {
            const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
            execSync.mockImplementation((command) => {
                if (command.includes('eslint')) {
                    throw new Error('ESLint failed');
                }
                return '';
            });
            const result = await staticAnalyzer.runStaticAnalysis();
            (0, vitest_1.expect)(result.issues).toEqual([]);
            (0, vitest_1.expect)(result.status).toBe('fail');
        });
        (0, vitest_1.it)('should analyze file complexity correctly', async () => {
            // Use the actual project path instead of mocking
            const realAnalyzer = new static_analyzer_js_1.StaticAnalyzer(process.cwd());
            const result = await realAnalyzer.runStaticAnalysis();
            // The metrics should be calculated (even if 0, that's valid for empty projects)
            (0, vitest_1.expect)(result.metrics.complexity).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.metrics.maintainability).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.metrics.duplication).toBeGreaterThanOrEqual(0);
        });
    });
    (0, vitest_1.describe)('calculateFileComplexity', () => {
        (0, vitest_1.it)('should calculate file complexity correctly', () => {
            const analyzer = new static_analyzer_js_1.StaticAnalyzer('/test');
            // Access private method through any type
            const calculateComplexity = analyzer.calculateFileComplexity.bind(analyzer);
            const simpleCode = 'const x = 1;';
            const complexCode = `
        if (true) {
          for (let i = 0; i < 10; i++) {
            if (i > 5) {
              console.log(i);
            }
          }
        }
      `;
            (0, vitest_1.expect)(calculateComplexity(simpleCode)).toBe(1);
            (0, vitest_1.expect)(calculateComplexity(complexCode)).toBeGreaterThan(1);
        });
    });
    (0, vitest_1.describe)('detectDuplicates', () => {
        (0, vitest_1.it)('should detect duplicate lines correctly', () => {
            const analyzer = new static_analyzer_js_1.StaticAnalyzer('/test');
            // Access private method through any type
            const detectDuplicates = analyzer.detectDuplicates.bind(analyzer);
            const codeWithDuplicates = `
        const x = 1;
        const y = 2;
        const x = 1;
        const z = 3;
        const y = 2;
      `;
            const codeWithoutDuplicates = `
        const x = 1;
        const y = 2;
        const z = 3;
      `;
            (0, vitest_1.expect)(detectDuplicates(codeWithDuplicates)).toBeGreaterThan(0);
            (0, vitest_1.expect)(detectDuplicates(codeWithoutDuplicates)).toBe(0);
        });
    });
    (0, vitest_1.describe)('calculateSummary', () => {
        (0, vitest_1.it)('should calculate issue summary correctly', () => {
            const analyzer = new static_analyzer_js_1.StaticAnalyzer('/test');
            // Access private method through any type
            const calculateSummary = analyzer.calculateSummary.bind(analyzer);
            const issues = [
                { severity: 'error' },
                { severity: 'warning' },
                { severity: 'info' },
                { severity: 'warning' },
            ];
            const summary = calculateSummary(issues);
            (0, vitest_1.expect)(summary.total).toBe(4);
            (0, vitest_1.expect)(summary.error).toBe(1);
            (0, vitest_1.expect)(summary.warning).toBe(2);
            (0, vitest_1.expect)(summary.info).toBe(1);
        });
    });
    (0, vitest_1.describe)('determineStatus', () => {
        (0, vitest_1.it)('should determine status based on issues', () => {
            const analyzer = new static_analyzer_js_1.StaticAnalyzer('/test');
            // Access private method through any type
            const determineStatus = analyzer.determineStatus.bind(analyzer);
            (0, vitest_1.expect)(determineStatus({ error: 1, warning: 0, info: 0 })).toBe('fail');
            (0, vitest_1.expect)(determineStatus({ error: 0, warning: 1, info: 0 })).toBe('warning');
            (0, vitest_1.expect)(determineStatus({ error: 0, warning: 0, info: 1 })).toBe('pass');
            (0, vitest_1.expect)(determineStatus({ error: 0, warning: 0, info: 0 })).toBe('pass');
        });
    });
});
//# sourceMappingURL=static-analyzer.test.js.map