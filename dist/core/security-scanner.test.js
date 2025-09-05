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
const security_scanner_js_1 = require("./security-scanner.js");
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
(0, vitest_1.describe)('SecurityScanner', () => {
    let securityScanner;
    const mockProjectPath = '/test/project';
    (0, vitest_1.beforeEach)(() => {
        securityScanner = new security_scanner_js_1.SecurityScanner(mockProjectPath);
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('runSecurityScan', () => {
        (0, vitest_1.it)('should run comprehensive security scan', async () => {
            const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
            const { readFileSync } = await Promise.resolve().then(() => __importStar(require('fs')));
            // Mock npm audit output
            execSync.mockImplementation((command) => {
                if (command.includes('npm audit')) {
                    return JSON.stringify({
                        vulnerabilities: {
                            'test-package': {
                                severity: 'high',
                                range: '1.0.0',
                                title: 'Test vulnerability',
                                via: [{ cve: 'CVE-2023-1234' }],
                                fixAvailable: true,
                            },
                        },
                    });
                }
                if (command.includes('retire')) {
                    return JSON.stringify({
                        data: [
                            {
                                component: 'test-lib',
                                version: '1.0.0',
                                vulnerabilities: [
                                    {
                                        identifiers: { CVE: ['CVE-2023-5678'] },
                                        severity: 'medium',
                                        info: ['Test vulnerability description'],
                                    },
                                ],
                            },
                        ],
                    });
                }
                return '';
            });
            // Mock file reading
            readFileSync.mockReturnValue('test file content');
            const result = await securityScanner.runSecurityScan();
            (0, vitest_1.expect)(result).toHaveProperty('vulnerabilities');
            (0, vitest_1.expect)(result).toHaveProperty('scanTime');
            (0, vitest_1.expect)(result).toHaveProperty('status');
            (0, vitest_1.expect)(result).toHaveProperty('summary');
            (0, vitest_1.expect)(result.vulnerabilities.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should handle npm audit failures gracefully', async () => {
            const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
            execSync.mockImplementation((command) => {
                if (command.includes('npm audit')) {
                    throw new Error('npm audit failed');
                }
                return '';
            });
            const result = await securityScanner.runSecurityScan();
            (0, vitest_1.expect)(result.vulnerabilities).toEqual([]);
            (0, vitest_1.expect)(result.status).toBe('fail');
        });
        (0, vitest_1.it)('should handle retire scan failures gracefully', async () => {
            const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
            execSync.mockImplementation((command) => {
                if (command.includes('retire')) {
                    throw new Error('retire scan failed');
                }
                return '';
            });
            const result = await securityScanner.runSecurityScan();
            (0, vitest_1.expect)(result.vulnerabilities).toEqual([]);
            (0, vitest_1.expect)(result.status).toBe('fail');
        });
    });
    (0, vitest_1.describe)('mapNpmSeverity', () => {
        (0, vitest_1.it)('should map npm severities correctly', () => {
            const scanner = new security_scanner_js_1.SecurityScanner('/test');
            // Access private method through any type
            const mapSeverity = scanner.mapNpmSeverity.bind(scanner);
            (0, vitest_1.expect)(mapSeverity('critical')).toBe('critical');
            (0, vitest_1.expect)(mapSeverity('high')).toBe('high');
            (0, vitest_1.expect)(mapSeverity('moderate')).toBe('moderate');
            (0, vitest_1.expect)(mapSeverity('low')).toBe('low');
            (0, vitest_1.expect)(mapSeverity('unknown')).toBe('moderate');
        });
    });
    (0, vitest_1.describe)('mapRetireSeverity', () => {
        (0, vitest_1.it)('should map retire severities correctly', () => {
            const scanner = new security_scanner_js_1.SecurityScanner('/test');
            // Access private method through any type
            const mapSeverity = scanner.mapRetireSeverity.bind(scanner);
            (0, vitest_1.expect)(mapSeverity('critical')).toBe('high');
            (0, vitest_1.expect)(mapSeverity('high')).toBe('high');
            (0, vitest_1.expect)(mapSeverity('medium')).toBe('moderate');
            (0, vitest_1.expect)(mapSeverity('low')).toBe('low');
            (0, vitest_1.expect)(mapSeverity('unknown')).toBe('moderate');
        });
    });
    (0, vitest_1.describe)('calculateSummary', () => {
        (0, vitest_1.it)('should calculate vulnerability summary correctly', () => {
            const scanner = new security_scanner_js_1.SecurityScanner('/test');
            // Access private method through any type
            const calculateSummary = scanner.calculateSummary.bind(scanner);
            const vulnerabilities = [
                { severity: 'critical' },
                { severity: 'high' },
                { severity: 'moderate' },
                { severity: 'low' },
                { severity: 'low' },
            ];
            const summary = calculateSummary(vulnerabilities);
            (0, vitest_1.expect)(summary.total).toBe(5);
            (0, vitest_1.expect)(summary.critical).toBe(1);
            (0, vitest_1.expect)(summary.high).toBe(1);
            (0, vitest_1.expect)(summary.moderate).toBe(1);
            (0, vitest_1.expect)(summary.low).toBe(2);
        });
    });
    (0, vitest_1.describe)('determineStatus', () => {
        (0, vitest_1.it)('should determine status based on vulnerabilities', () => {
            const scanner = new security_scanner_js_1.SecurityScanner('/test');
            // Access private method through any type
            const determineStatus = scanner.determineStatus.bind(scanner);
            (0, vitest_1.expect)(determineStatus({ critical: 1, high: 0, moderate: 0, low: 0 })).toBe('fail');
            (0, vitest_1.expect)(determineStatus({ critical: 0, high: 1, moderate: 0, low: 0 })).toBe('fail');
            (0, vitest_1.expect)(determineStatus({ critical: 0, high: 0, moderate: 1, low: 0 })).toBe('warning');
            (0, vitest_1.expect)(determineStatus({ critical: 0, high: 0, moderate: 0, low: 1 })).toBe('warning');
            (0, vitest_1.expect)(determineStatus({ critical: 0, high: 0, moderate: 0, low: 0 })).toBe('pass');
        });
    });
});
//# sourceMappingURL=security-scanner.test.js.map