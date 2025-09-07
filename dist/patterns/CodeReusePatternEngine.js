#!/usr/bin/env node
/**
 * Code Reuse Pattern Engine
 *
 * Detects, analyzes, and suggests reusable code patterns to reduce token usage
 * and improve code quality through pattern-based optimization.
 */
import { z } from 'zod';
import { createHash } from 'crypto';
// Configuration schema
const DetectionConfigSchema = z.object({
    minPatternSize: z.number().min(3).default(3),
    maxPatternSize: z.number().max(50).default(20),
    minOccurrences: z.number().min(2).default(2),
    minSimilarity: z.number().min(0.1).max(1.0).default(0.7),
    excludePatterns: z.array(z.string()).default([
        'import ',
        'export ',
        '//',
        '/*',
        '*/',
        'interface ',
        'type ',
        'enum ',
        'const ',
        'let ',
        'var ',
        'if (',
        'for (',
        'while (',
        'switch (',
        'try {',
        'catch (',
        'finally {',
        'return ',
        'throw ',
        'console.log',
        'console.error',
        'console.warn',
        'console.info',
        'debugger',
        'break',
        'continue',
    ]),
});
// Code pattern schema
const CodePatternSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.enum([
        'function',
        'class',
        'type',
        'control-flow',
        'error-handling',
        'async',
        'testing',
        'module',
        'utility',
    ]),
    complexity: z.enum(['low', 'medium', 'high']),
    pattern: z.string(),
    abstractPattern: z.string(),
    variables: z.array(z.object({
        name: z.string(),
        type: z.string(),
        description: z.string().optional(),
    })),
    dependencies: z.array(z.string()),
    examples: z.array(z.string()),
    metrics: z.object({
        tokensPerUse: z.number(),
        avgComplexity: z.number(),
        reuseOpportunities: z.number(),
        potentialSavings: z.number(),
    }),
});
// Pattern suggestion schema
const PatternSuggestionSchema = z.object({
    id: z.string(),
    patternId: z.string(),
    code: z.string(),
    similarity: z.number(),
    suggestedReplacement: z.string(),
    confidence: z.number(),
    rationale: z.string(),
    context: z.record(z.unknown()),
});
// Similarity result schema
const SimilarityResultSchema = z.object({
    similarity: z.number(),
    commonLines: z.number(),
    totalLines: z.number(),
});
export class CodeReusePatternEngine {
    config;
    patterns;
    patternIndex; // hash -> pattern IDs
    codeCache; // file -> lines
    constructor(config = {}) {
        this.config = DetectionConfigSchema.parse(config);
        this.patterns = new Map();
        this.patternIndex = new Map();
        this.codeCache = new Map();
    }
    /**
     * Analyze codebase and detect patterns
     */
    async analyzeCodebase(files) {
        console.log(`Analyzing ${files.length} files for code patterns...`);
        // Clear previous analysis
        this.patterns.clear();
        this.patternIndex.clear();
        this.codeCache.clear();
        // Cache all file contents
        for (const file of files) {
            const lines = file.content.split('\n');
            this.codeCache.set(file.path, lines);
        }
        // Extract code segments and find patterns
        const codeSegments = this.extractCodeSegments(files);
        const detectedPatterns = this.findSimilarPatterns(codeSegments);
        // Analyze and rank patterns
        const analyzedPatterns = await this.analyzePatterns(detectedPatterns);
        // Store patterns
        for (const pattern of analyzedPatterns) {
            this.patterns.set(pattern.id, pattern);
            this.indexPattern(pattern);
        }
        console.log(`Detected ${analyzedPatterns.length} code patterns`);
        return analyzedPatterns;
    }
    /**
     * Suggest pattern applications for new code
     */
    async suggestPatterns(code, context = {}) {
        const suggestions = [];
        const lines = code.split('\n');
        for (const [patternId, pattern] of this.patterns) {
            const similarity = this.calculateSimilarity(lines, pattern.pattern.split('\n'));
            if (similarity.similarity >= this.config.minSimilarity) {
                const suggestion = await this.createPatternSuggestion(pattern, code, similarity, context);
                if (suggestion) {
                    suggestions.push(suggestion);
                }
            }
        }
        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }
    /**
     * Get pattern statistics
     */
    getPatternStats() {
        const patternsByCategory = {};
        let totalPotentialSavings = 0;
        for (const pattern of this.patterns.values()) {
            patternsByCategory[pattern.category] = (patternsByCategory[pattern.category] || 0) + 1;
            totalPotentialSavings += pattern.metrics.potentialSavings;
        }
        return {
            totalPatterns: this.patterns.size,
            patternsByCategory,
            totalPotentialSavings,
            processCompliancePatterns: this.getProcessCompliancePatterns(),
            qualityFailurePatterns: this.getQualityFailurePatterns(),
        };
    }
    /**
     * Get process compliance patterns from archive lessons
     */
    getProcessCompliancePatterns() {
        return [
            {
                id: 'process_compliance_1',
                name: 'Role Compliance Validation',
                description: 'Pattern for validating role compliance before proceeding with operations',
                category: 'utility',
                pattern: `// Role compliance validation pattern
if (!this.validateRoleCompliance(role)) {
  throw new Error('Role compliance validation failed');
}

// Run early quality checks
const qualityResults = await this.runQualityGates();
if (!qualityResults.allPassed) {
  throw new Error(\`Quality gates failed: \${qualityResults.failures.join(', ')}\`);
}

// Validate test coverage
const coverage = await this.getTestCoverage();
if (coverage < 85) {
  throw new Error(\`Test coverage \${coverage}% below 85% threshold\`);
}

// Validate TypeScript compilation
const tsResults = await this.runTypeScriptCheck();
if (tsResults.errors.length > 0) {
  throw new Error(\`TypeScript errors: \${tsResults.errors.length}\`);
}`,
                abstractPattern: `// Role compliance validation pattern
if (!this.validateRoleCompliance({{ROLE}})) {
  throw new Error('Role compliance validation failed');
}

// Run early quality checks
const qualityResults = await this.runQualityGates();
if (!qualityResults.allPassed) {
  throw new Error(\`Quality gates failed: \${qualityResults.failures.join(', ')}\`);
}

// Validate test coverage
const coverage = await this.getTestCoverage();
if (coverage < {{MIN_COVERAGE}}) {
  throw new Error(\`Test coverage \${coverage}% below {{MIN_COVERAGE}}% threshold\`);
}

// Validate TypeScript compilation
const tsResults = await this.runTypeScriptCheck();
if (tsResults.errors.length > 0) {
  throw new Error(\`TypeScript errors: \${tsResults.errors.length}\`);
}`,
                metrics: {
                    tokensPerUse: 120,
                    avgComplexity: 4,
                    reuseOpportunities: 15,
                    potentialSavings: 1800
                }
            }
        ];
    }
    /**
     * Get quality failure patterns from archive lessons
     */
    getQualityFailurePatterns() {
        return [
            {
                id: 'quality_failure_1',
                name: 'TypeScript Error Resolution',
                description: 'Pattern for resolving TypeScript compilation errors systematically',
                category: 'utility',
                pattern: `// TypeScript error resolution pattern
async function resolve{{ERROR_TYPE}}Errors(): Promise<void> {
  // Phase 1: Identify error types
  const errors = await this.identifyTypeScriptErrors();
  
  // Phase 2: Categorize by severity
  const criticalErrors = errors.filter(e => e.severity === 'error');
  const warnings = errors.filter(e => e.severity === 'warning');
  
  // Phase 3: Fix in order of priority
  for (const error of criticalErrors) {
    await this.fixTypeScriptError(error);
  }
  
  // Phase 4: Validate with tests
  await this.validateWithTests();
}`,
                abstractPattern: `// TypeScript error resolution pattern
async function resolve{{ERROR_TYPE}}Errors(): Promise<void> {
  // Phase 1: Identify error types
  const errors = await this.identifyTypeScriptErrors();
  
  // Phase 2: Categorize by severity
  const criticalErrors = errors.filter(e => e.severity === 'error');
  const warnings = errors.filter(e => e.severity === 'warning');
  
  // Phase 3: Fix in order of priority
  for (const error of criticalErrors) {
    await this.fixTypeScriptError(error);
  }
  
  // Phase 4: Validate with tests
  await this.validateWithTests();
}`,
                metrics: {
                    tokensPerUse: 80,
                    avgComplexity: 6,
                    reuseOpportunities: 8,
                    potentialSavings: 960
                }
            }
        ];
    }
    /**
     * Extract code segments from files
     */
    extractCodeSegments(files) {
        const segments = [];
        for (const file of files) {
            const lines = file.content.split('\n');
            // Extract segments of different sizes
            for (let size = this.config.minPatternSize; size <= this.config.maxPatternSize; size++) {
                for (let i = 0; i <= lines.length - size; i++) {
                    const segment = lines.slice(i, i + size);
                    // Filter out excluded patterns
                    if (this.shouldExcludeSegment(segment)) {
                        continue;
                    }
                    const hash = this.hashCodeSegment(segment);
                    segments.push({
                        code: segment,
                        file: file.path,
                        startLine: i + 1,
                        endLine: i + size,
                        hash,
                    });
                }
            }
        }
        return segments;
    }
    findSimilarPatterns(segments) {
        const patternGroups = new Map();
        for (const segment of segments) {
            const hash = segment.hash;
            if (!patternGroups.has(hash)) {
                patternGroups.set(hash, []);
            }
            patternGroups.get(hash).push(segment);
        }
        const patterns = [];
        for (const [hash, group] of patternGroups) {
            if (group.length >= this.config.minOccurrences) {
                const pattern = group[0].code.join('\n');
                const abstractPattern = this.createAbstractPattern(group);
                const confidence = this.calculatePatternConfidence(group, pattern);
                patterns.push({
                    segments: group,
                    pattern,
                    abstractPattern,
                    confidence,
                });
            }
        }
        return patterns;
    }
    async analyzePatterns(detectedPatterns) {
        const patterns = [];
        for (const detected of detectedPatterns) {
            const pattern = {
                id: this.generatePatternId(detected.pattern),
                name: this.generatePatternName(detected.pattern, this.categorizePattern(detected.pattern)),
                description: this.generatePatternDescription(detected.pattern, this.categorizePattern(detected.pattern)),
                category: this.categorizePattern(detected.pattern),
                complexity: this.assessComplexity(detected.pattern),
                pattern: detected.pattern,
                abstractPattern: detected.abstractPattern,
                variables: this.extractVariables(detected.abstractPattern),
                dependencies: this.extractDependencies(detected.pattern),
                examples: this.generateExamples(detected.segments),
                metrics: {
                    tokensPerUse: this.estimateTokenCount(detected.pattern),
                    avgComplexity: this.calculateAverageComplexity(detected.segments),
                    reuseOpportunities: detected.segments.length,
                    potentialSavings: this.calculatePotentialSavings(detected.pattern, detected.segments.length),
                },
            };
            patterns.push(pattern);
        }
        return patterns.sort((a, b) => b.metrics.potentialSavings - a.metrics.potentialSavings);
    }
    shouldExcludeSegment(lines) {
        const content = lines.join('\n').toLowerCase();
        // Exclude common patterns that aren't useful
        const excludePatterns = [
            'import ',
            'export ',
            '//',
            '/*',
            '*/',
            'interface ',
            'type ',
            'enum ',
            'const ',
            'let ',
            'var ',
            'if (',
            'for (',
            'while (',
            'switch (',
            'try {',
            'catch (',
            'finally {',
            'return ',
            'throw ',
            'console.log',
            'console.error',
            'console.warn',
            'console.info',
            'debugger',
            'break',
            'continue',
        ];
        return excludePatterns.some(pattern => content.includes(pattern));
    }
    hashCodeSegment(lines) {
        const content = lines.join('\n');
        return createHash('md5').update(content).digest('hex');
    }
    createAbstractPattern(segments) {
        if (segments.length === 0)
            return '';
        const firstSegment = segments[0].code;
        let abstractPattern = firstSegment.join('\n');
        // Replace variable names with placeholders
        for (let i = 1; i < segments.length; i++) {
            const segment = segments[i].code;
            const similarity = this.calculateSimilarity(firstSegment, segment);
            if (similarity.similarity > 0.8) {
                // Replace different parts with placeholders
                for (let j = 0; j < Math.min(firstSegment.length, segment.length); j++) {
                    if (firstSegment[j] !== segment[j]) {
                        // Replace with placeholder
                        const placeholder = `{{VAR_${j}}}`;
                        abstractPattern = abstractPattern.replace(firstSegment[j], placeholder);
                    }
                }
            }
        }
        return abstractPattern;
    }
    calculatePatternConfidence(segments, pattern) {
        if (segments.length < 2)
            return 0;
        let totalSimilarity = 0;
        let comparisons = 0;
        for (let i = 0; i < segments.length; i++) {
            for (let j = i + 1; j < segments.length; j++) {
                const similarity = this.calculateSimilarity(segments[i].code, segments[j].code);
                totalSimilarity += similarity.similarity;
                comparisons++;
            }
        }
        return comparisons > 0 ? totalSimilarity / comparisons : 0;
    }
    categorizePattern(pattern) {
        const content = pattern.toLowerCase();
        if (content.includes('function') || content.includes('=>')) {
            return 'function';
        }
        else if (content.includes('class') || content.includes('constructor')) {
            return 'class';
        }
        else if (content.includes('interface') || content.includes('type')) {
            return 'type';
        }
        else if (content.includes('if') || content.includes('switch') || content.includes('for') || content.includes('while')) {
            return 'control-flow';
        }
        else if (content.includes('try') || content.includes('catch') || content.includes('throw')) {
            return 'error-handling';
        }
        else if (content.includes('async') || content.includes('await') || content.includes('promise')) {
            return 'async';
        }
        else if (content.includes('test') || content.includes('describe') || content.includes('it(')) {
            return 'testing';
        }
        else if (content.includes('import') || content.includes('export') || content.includes('require')) {
            return 'module';
        }
        else {
            return 'utility';
        }
    }
    assessComplexity(pattern) {
        const lines = pattern.split('\n').filter(line => line.trim().length > 0);
        const lineCount = lines.length;
        if (lineCount <= 3)
            return 'low';
        if (lineCount <= 10)
            return 'medium';
        return 'high';
    }
    extractVariables(abstractPattern) {
        const variables = [];
        const varRegex = /\{\{VAR_(\d+)\}\}/g;
        let match;
        while ((match = varRegex.exec(abstractPattern)) !== null) {
            const index = parseInt(match[1]);
            variables.push({
                name: `var${index}`,
                type: 'string', // Default type, could be enhanced
            });
        }
        return variables;
    }
    extractDependencies(pattern) {
        const dependencies = [];
        const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
        const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
        let match;
        while ((match = importRegex.exec(pattern)) !== null) {
            dependencies.push(match[1]);
        }
        while ((match = requireRegex.exec(pattern)) !== null) {
            dependencies.push(match[1]);
        }
        return dependencies;
    }
    generateExamples(segments) {
        return segments.map((segment, index) => ({
            code: segment.code.join('\n'),
            description: `Example ${index + 1} from ${segment.file}`,
        }));
    }
    estimateTokenCount(pattern) {
        // Rough estimation: 1 token per 4 characters
        return Math.ceil(pattern.length / 4);
    }
    calculateAverageComplexity(segments) {
        if (segments.length === 0)
            return 0;
        let totalComplexity = 0;
        for (const segment of segments) {
            totalComplexity += segment.code.length;
        }
        return totalComplexity / segments.length;
    }
    calculatePotentialSavings(pattern, occurrences) {
        const tokenCount = this.estimateTokenCount(pattern);
        const savingsPerUse = tokenCount * 0.3; // 30% savings per reuse
        return savingsPerUse * occurrences;
    }
    generatePatternId(pattern) {
        const hash = createHash('md5').update(pattern).digest('hex');
        return `pattern_${hash.substring(0, 8)}`;
    }
    generatePatternName(pattern, category) {
        const lines = pattern.split('\n').filter(line => line.trim().length > 0);
        const firstLine = lines[0] || '';
        if (firstLine.includes('function')) {
            const match = firstLine.match(/function\s+(\w+)/);
            return match ? match[1] : `${category}_pattern`;
        }
        else if (firstLine.includes('class')) {
            const match = firstLine.match(/class\s+(\w+)/);
            return match ? match[1] : `${category}_pattern`;
        }
        else {
            return `${category}_pattern_${Date.now()}`;
        }
    }
    generatePatternDescription(pattern, category) {
        const lines = pattern.split('\n').filter(line => line.trim().length > 0);
        const firstLine = lines[0] || '';
        return `A ${category} pattern: ${firstLine.substring(0, 100)}...`;
    }
    calculateSimilarity(lines1, lines2) {
        const content1 = lines1.join('\n');
        const content2 = lines2.join('\n');
        // Simple similarity calculation based on common lines
        const set1 = new Set(lines1);
        const set2 = new Set(lines2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        const similarity = union.size > 0 ? intersection.size / union.size : 0;
        return {
            similarity,
            commonLines: intersection.size,
            totalLines: union.size,
        };
    }
    async createPatternSuggestion(pattern, code, similarity, context) {
        if (similarity.similarity < this.config.minSimilarity) {
            return null;
        }
        const suggestion = {
            id: `suggestion_${Date.now()}`,
            patternId: pattern.id,
            code,
            similarity: similarity.similarity,
            suggestedReplacement: this.applyPatternToCode(pattern, code),
            confidence: similarity.similarity * pattern.metrics.potentialSavings,
            rationale: `This code is ${Math.round(similarity.similarity * 100)}% similar to the "${pattern.name}" pattern. Applying this pattern could save ${Math.round(pattern.metrics.potentialSavings)} tokens.`,
            context,
        };
        return suggestion;
    }
    applyPatternToCode(pattern, code) {
        // Simple pattern application - replace with abstract pattern
        return pattern.abstractPattern;
    }
    extractVariableValues(code, pattern) {
        const values = {};
        // Extract values based on pattern variables
        for (const variable of pattern.variables) {
            // This is a simplified extraction - in practice, you'd need more sophisticated parsing
            const regex = new RegExp(`\\b${variable.name}\\b`, 'g');
            const matches = code.match(regex);
            if (matches) {
                values[variable.name] = matches[0];
            }
        }
        return values;
    }
    parameterizePattern(abstractPattern, variables) {
        let parameterized = abstractPattern;
        for (const variable of variables) {
            const placeholder = `{{VAR_${variable.name}}}`;
            const replacement = `\${${variable.name}}`;
            parameterized = parameterized.replace(new RegExp(placeholder, 'g'), replacement);
        }
        return parameterized;
    }
    indexPattern(pattern) {
        const hash = createHash('md5').update(pattern.pattern).digest('hex');
        if (!this.patternIndex.has(hash)) {
            this.patternIndex.set(hash, new Set());
        }
        this.patternIndex.get(hash).add(pattern.id);
    }
}
// Export factory function
export function createCodeReusePatternEngine(config) {
    return new CodeReusePatternEngine(config);
}
//# sourceMappingURL=CodeReusePatternEngine.js.map