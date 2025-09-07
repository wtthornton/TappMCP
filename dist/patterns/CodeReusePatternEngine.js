#!/usr/bin/env node
/**
 * Code Reuse Pattern Engine
 *
 * Detects, analyzes, and suggests reusable code patterns to reduce
 * redundancy and improve development efficiency across MCP tools.
 *
 * Phase 1, Week 1 - Code Reuse Pattern Detection System
 */
import { z } from 'zod';
import { createHash } from 'crypto';
/**
 * Code Pattern Schema
 */
export const CodePatternSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.enum([
        'validation',
        'error-handling',
        'data-transformation',
        'api-integration',
        'logging',
        'testing',
        'utility',
        'schema',
    ]),
    pattern: z.string(), // The actual code pattern
    abstractPattern: z.string(), // Generalized version with placeholders
    complexity: z.enum(['low', 'medium', 'high']),
    confidence: z.number().min(0).max(1), // Pattern detection confidence
    usageCount: z.number().default(1),
    locations: z.array(z.object({
        file: z.string(),
        startLine: z.number(),
        endLine: z.number(),
        toolName: z.string().optional(),
    })),
    variables: z
        .array(z.object({
        name: z.string(),
        type: z.string(),
        description: z.string().optional(),
    }))
        .default([]),
    dependencies: z.array(z.string()).default([]),
    examples: z
        .array(z.object({
        code: z.string(),
        description: z.string(),
        context: z.string().optional(),
    }))
        .default([]),
    metrics: z
        .object({
        tokensPerUse: z.number().default(0),
        avgComplexity: z.number().default(0),
        reuseOpportunities: z.number().default(0),
        potentialSavings: z.number().default(0), // Token savings if reused
    })
        .default({}),
});
/**
 * Pattern Detection Config
 */
export const DetectionConfigSchema = z.object({
    minPatternSize: z.number().default(3), // Minimum lines for a pattern
    maxPatternSize: z.number().default(50), // Maximum lines for a pattern
    minSimilarity: z.number().min(0).max(1).default(0.8), // Similarity threshold
    minOccurrences: z.number().default(2), // Min occurrences to be a pattern
    excludePatterns: z
        .array(z.string())
        .default([
        'import\\s+.*',
        'export\\s+.*',
        '//.*',
        '/\\*[\\s\\S]*?\\*/',
        'console\\.log\\(.*\\)',
        'console\\.warn\\(.*\\)',
        'console\\.error\\(.*\\)',
    ]),
    priorityKeywords: z
        .array(z.string())
        .default([
        'zod',
        'schema',
        'validation',
        'error',
        'try',
        'catch',
        'async',
        'await',
        'Promise',
        'response',
        'request',
    ]),
});
/**
 * Code Reuse Pattern Engine Class
 */
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
        const codeLines = code.split('\n');
        // Find potential pattern matches
        for (const pattern of this.patterns.values()) {
            const similarity = this.calculateSimilarity(codeLines, pattern.pattern.split('\n'));
            if (similarity.similarity >= this.config.minSimilarity) {
                const suggestion = await this.createPatternSuggestion(pattern, code, similarity, context);
                if (suggestion) {
                    suggestions.push(suggestion);
                }
            }
        }
        // Sort by potential savings and confidence
        return suggestions.sort((a, b) => b.estimatedSavings * b.confidence - a.estimatedSavings * a.confidence);
    }
    /**
     * Generate reusable utility function from pattern
     */
    generateUtilityFunction(pattern, functionName) {
        const params = pattern.variables.map(v => `${v.name}: ${v.type}`).join(', ');
        const description = pattern.description || 'Generated utility function';
        const functionCode = `
/**
 * ${description}
 * @category ${pattern.category}
 */
export function ${functionName}(${params}) {
${this.parameterizePattern(pattern.abstractPattern, pattern.variables)}
}`;
        const usage = `${functionName}(${pattern.variables.map(v => `your${v.name.charAt(0).toUpperCase() + v.name.slice(1)}`).join(', ')})`;
        return {
            functionCode: functionCode.trim(),
            imports: pattern.dependencies,
            usage,
        };
    }
    /**
     * Get pattern statistics
     */
    getPatternStats() {
        const patterns = Array.from(this.patterns.values());
        const patternsByCategory = {};
        let totalSavings = 0;
        let totalOpportunities = 0;
        // Calculate statistics
        for (const pattern of patterns) {
            patternsByCategory[pattern.category] = (patternsByCategory[pattern.category] || 0) + 1;
            totalSavings += pattern.metrics.potentialSavings || 0;
            totalOpportunities += pattern.metrics.reuseOpportunities || 0;
        }
        // Calculate top patterns by usage and savings potential
        const topPatterns = patterns
            .map(pattern => ({
            pattern,
            score: pattern.usageCount * 10 +
                pattern.confidence * 50 +
                (pattern.metrics.potentialSavings || 0),
        }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        return {
            totalPatterns: patterns.length,
            patternsByCategory,
            topPatterns,
            potentialSavings: totalSavings,
            reuseOpportunities: totalOpportunities,
        };
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
    /**
     * Find similar patterns in code segments
     */
    findSimilarPatterns(segments) {
        const patternGroups = new Map();
        // Group segments by hash (exact matches)
        for (const segment of segments) {
            if (!patternGroups.has(segment.hash)) {
                patternGroups.set(segment.hash, []);
            }
            patternGroups.get(segment.hash).push(segment);
        }
        // Find groups with minimum occurrences
        const patterns = [];
        for (const [hash, group] of patternGroups) {
            if (group.length >= this.config.minOccurrences) {
                const pattern = group[0].code.join('\n');
                const abstractPattern = this.createAbstractPattern(group);
                patterns.push({
                    segments: group,
                    pattern,
                    abstractPattern,
                    confidence: this.calculatePatternConfidence(group, pattern),
                });
            }
        }
        return patterns;
    }
    /**
     * Analyze detected patterns
     */
    async analyzePatterns(detectedPatterns) {
        const patterns = [];
        for (const detected of detectedPatterns) {
            const category = this.categorizePattern(detected.pattern);
            const complexity = this.assessComplexity(detected.pattern);
            const variables = this.extractVariables(detected.abstractPattern);
            const dependencies = this.extractDependencies(detected.pattern);
            const pattern = {
                id: this.generatePatternId(detected.pattern),
                name: this.generatePatternName(detected.pattern, category),
                description: this.generatePatternDescription(detected.pattern, category),
                category,
                pattern: detected.pattern,
                abstractPattern: detected.abstractPattern,
                complexity,
                confidence: detected.confidence,
                usageCount: detected.segments.length,
                locations: detected.segments.map((seg) => ({
                    file: seg.file,
                    startLine: seg.startLine,
                    endLine: seg.endLine,
                })),
                variables,
                dependencies,
                examples: this.generateExamples(detected.segments.slice(0, 3)),
                metrics: {
                    tokensPerUse: this.estimateTokenCount(detected.pattern),
                    avgComplexity: this.calculateAverageComplexity(detected.segments),
                    reuseOpportunities: Math.max(0, detected.segments.length - 1),
                    potentialSavings: this.calculatePotentialSavings(detected.pattern, detected.segments.length),
                },
            };
            patterns.push(pattern);
        }
        return patterns.sort((a, b) => b.metrics.potentialSavings - a.metrics.potentialSavings);
    }
    /**
     * Helper methods
     */
    shouldExcludeSegment(lines) {
        const joined = lines.join('\n');
        for (const excludePattern of this.config.excludePatterns) {
            if (new RegExp(excludePattern).test(joined)) {
                return true;
            }
        }
        // Skip segments that are mostly whitespace or comments
        const meaningfulLines = lines.filter(line => line.trim().length > 0 && !line.trim().startsWith('//') && !line.trim().startsWith('*'));
        return meaningfulLines.length < this.config.minPatternSize / 2;
    }
    hashCodeSegment(lines) {
        const normalized = lines
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
        return createHash('md5').update(normalized).digest('hex');
    }
    createAbstractPattern(segments) {
        // Create a generalized version by identifying common structure
        const firstSegment = segments[0].code;
        let abstractPattern = firstSegment.join('\n');
        // Simple abstraction - replace string literals and identifiers with placeholders
        abstractPattern = abstractPattern
            .replace(/"[^"]*"/g, '"{{STRING}}"')
            .replace(/'[^']*'/g, "'{{STRING}}'")
            .replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, '{{IDENTIFIER}}')
            .replace(/\b\d+\b/g, '{{NUMBER}}');
        return abstractPattern;
    }
    calculatePatternConfidence(segments, pattern) {
        // Base confidence on pattern complexity and frequency
        const lines = pattern.split('\n').length;
        const complexity = Math.min(lines / 20, 1); // Normalize to 0-1
        const frequency = Math.min(segments.length / 10, 1); // Normalize to 0-1
        return complexity * 0.4 + frequency * 0.6;
    }
    categorizePattern(pattern) {
        const code = pattern.toLowerCase();
        if (code.includes('zod') || code.includes('schema') || code.includes('parse')) {
            return 'validation';
        }
        else if (code.includes('try') || code.includes('catch') || code.includes('error')) {
            return 'error-handling';
        }
        else if (code.includes('map') || code.includes('filter') || code.includes('transform')) {
            return 'data-transformation';
        }
        else if (code.includes('fetch') || code.includes('api') || code.includes('request')) {
            return 'api-integration';
        }
        else if (code.includes('console') || code.includes('log')) {
            return 'logging';
        }
        else if (code.includes('test') || code.includes('expect') || code.includes('describe')) {
            return 'testing';
        }
        else if (code.includes('schema') || code.includes('type') || code.includes('interface')) {
            return 'schema';
        }
        return 'utility';
    }
    assessComplexity(pattern) {
        const lines = pattern.split('\n').length;
        const complexity = pattern.split(/[{}();]/).length;
        if (lines <= 5 && complexity <= 10)
            return 'low';
        if (lines <= 15 && complexity <= 30)
            return 'medium';
        return 'high';
    }
    extractVariables(abstractPattern) {
        const variables = [];
        if (abstractPattern.includes('{{STRING}}')) {
            variables.push({ name: 'value', type: 'string' });
        }
        if (abstractPattern.includes('{{NUMBER}}')) {
            variables.push({ name: 'count', type: 'number' });
        }
        if (abstractPattern.includes('{{IDENTIFIER}}')) {
            variables.push({ name: 'identifier', type: 'string' });
        }
        return variables;
    }
    extractDependencies(pattern) {
        const dependencies = [];
        const importMatches = pattern.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
        if (importMatches) {
            for (const match of importMatches) {
                const moduleMatch = match.match(/from\s+['"]([^'"]+)['"]/);
                if (moduleMatch) {
                    dependencies.push(moduleMatch[1]);
                }
            }
        }
        return dependencies;
    }
    generateExamples(segments) {
        return segments.map((segment, index) => ({
            code: segment.code.join('\n'),
            description: `Example ${index + 1} from ${segment.file.split('/').pop()}`,
        }));
    }
    estimateTokenCount(pattern) {
        // Rough token estimation (1 token ≈ 4 characters)
        return Math.ceil(pattern.length / 4);
    }
    calculateAverageComplexity(segments) {
        let totalComplexity = 0;
        for (const segment of segments) {
            const complexity = segment.code.join('').split(/[{}();]/).length;
            totalComplexity += complexity;
        }
        return totalComplexity / segments.length;
    }
    calculatePotentialSavings(pattern, occurrences) {
        const tokensPerPattern = this.estimateTokenCount(pattern);
        const reuseOpportunities = Math.max(0, occurrences - 1);
        // Assuming 70% savings when converting to reusable function
        return Math.floor(tokensPerPattern * reuseOpportunities * 0.7);
    }
    generatePatternId(pattern) {
        return `pattern_${createHash('md5').update(pattern).digest('hex').slice(0, 8)}`;
    }
    generatePatternName(pattern, category) {
        const words = pattern.match(/\b[A-Z][a-z]+|[a-z]+\b/g) || [];
        const keywords = words.filter(w => this.config.priorityKeywords.includes(w.toLowerCase()));
        if (keywords.length > 0) {
            return `${category} - ${keywords.slice(0, 2).join(' ')}`;
        }
        return `${category} pattern`;
    }
    generatePatternDescription(pattern, category) {
        const lines = pattern.split('\n').length;
        return `Reusable ${category} pattern with ${lines} lines of code`;
    }
    calculateSimilarity(lines1, lines2) {
        const maxLines = Math.max(lines1.length, lines2.length);
        let matchedLines = 0;
        const differences = [];
        for (let i = 0; i < maxLines; i++) {
            const line1 = lines1[i]?.trim() || '';
            const line2 = lines2[i]?.trim() || '';
            if (line1 === line2) {
                matchedLines++;
            }
            else {
                differences.push({
                    line: i + 1,
                    expected: line2,
                    actual: line1,
                    type: !line1 ? 'deletion' : !line2 ? 'addition' : 'modification',
                });
            }
        }
        return {
            similarity: matchedLines / maxLines,
            matchedLines,
            totalLines: maxLines,
            differences,
        };
    }
    async createPatternSuggestion(pattern, code, similarity, context) {
        if (similarity.similarity < this.config.minSimilarity) {
            return null;
        }
        const estimatedSavings = Math.floor(pattern.metrics.tokensPerUse * similarity.similarity * 0.6);
        return {
            pattern,
            confidence: similarity.similarity * pattern.confidence,
            estimatedSavings,
            replacements: [
                {
                    file: context.file || 'current-file',
                    startLine: 1,
                    endLine: code.split('\n').length,
                    currentCode: code,
                    suggestedCode: this.applyPatternToCode(pattern, code),
                    variables: this.extractVariableValues(code, pattern),
                },
            ],
            rationale: `This code is ${Math.round(similarity.similarity * 100)}% similar to a known ${pattern.category} pattern used ${pattern.usageCount} times. Using the pattern could save approximately ${estimatedSavings} tokens.`,
        };
    }
    applyPatternToCode(pattern, code) {
        // Simplified pattern application
        const functionName = `apply${pattern.name.replace(/[^a-zA-Z0-9]/g, '')}`;
        return `${functionName}(${pattern.variables.map(v => `extracted${v.name}`).join(', ')})`;
    }
    extractVariableValues(code, pattern) {
        const values = {};
        // Simple extraction based on pattern variables
        for (const variable of pattern.variables) {
            if (variable.type === 'string') {
                const match = code.match(/"([^"]+)"/);
                if (match) {
                    values[variable.name] = match[1];
                }
            }
        }
        return values;
    }
    parameterizePattern(abstractPattern, variables) {
        let result = abstractPattern;
        for (const variable of variables) {
            result = result
                .replace(/\{\{STRING\}\}/g, `\${${variable.name}}`)
                .replace(/\{\{NUMBER\}\}/g, `\${${variable.name}}`)
                .replace(/\{\{IDENTIFIER\}\}/g, `\${${variable.name}}`);
        }
        return result
            .split('\n')
            .map(line => `  ${line}`)
            .join('\n');
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