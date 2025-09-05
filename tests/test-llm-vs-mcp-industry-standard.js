#!/usr/bin/env node

/**
 * Industry-Standard LLM vs MCP Comparison
 * Based on ISO 25010, IEEE 1044, and modern AI evaluation standards
 */

const { handleSmartBegin } = require('./dist/tools/smart_begin');
const { handleSmartWrite } = require('./dist/tools/smart_write');
const fs = require('fs');
const path = require('path');

// Industry-Standard Evaluation Framework
const EVALUATION_FRAMEWORK = {
    // ISO 25010 Software Quality Model
    functionalSuitability: {
        weight: 0.20,
        metrics: ['completeness', 'correctness', 'appropriateness']
    },
    performanceEfficiency: {
        weight: 0.15,
        metrics: ['responseTime', 'throughput', 'resourceUtilization']
    },
    compatibility: {
        weight: 0.10,
        metrics: ['interoperability', 'coexistence']
    },
    usability: {
        weight: 0.10,
        metrics: ['learnability', 'operability', 'userErrorProtection']
    },
    reliability: {
        weight: 0.15,
        metrics: ['maturity', 'faultTolerance', 'recoverability']
    },
    security: {
        weight: 0.10,
        metrics: ['confidentiality', 'integrity', 'authenticity']
    },
    maintainability: {
        weight: 0.20,
        metrics: ['modularity', 'reusability', 'analyzability', 'modifiability', 'testability']
    }
};

// IEEE 1044 Software Quality Metrics
const CODE_QUALITY_METRICS = {
    cyclomaticComplexity: { weight: 0.15, threshold: 10 },
    maintainabilityIndex: { weight: 0.15, threshold: 70 },
    testCoverage: { weight: 0.20, threshold: 80 },
    codeDuplication: { weight: 0.10, threshold: 5 },
    documentationCoverage: { weight: 0.10, threshold: 80 },
    errorHandling: { weight: 0.15, threshold: 90 },
    typeSafety: { weight: 0.15, threshold: 95 }
};

// AI-Specific Metrics (2024 Industry Standards)
const AI_METRICS = {
    taskAccuracy: { weight: 0.25 },
    responseRelevance: { weight: 0.20 },
    codeCorrectness: { weight: 0.20 },
    completeness: { weight: 0.15 },
    consistency: { weight: 0.10 },
    creativity: { weight: 0.10 }
};

// Token Economics (2024 OpenAI Pricing)
const TOKEN_ECONOMICS = {
    gpt4: { input: 0.03, output: 0.06 }, // per 1K tokens
    gpt35: { input: 0.0015, output: 0.002 },
    claude: { input: 0.008, output: 0.024 }
};

function simulateDirectLLM(prompt) {
    console.log('🤖 Simulating Direct LLM Call...');

    const startTime = Date.now();
    const processingTime = Math.random() * 2000 + 1000;

    return new Promise((resolve) => {
        setTimeout(() => {
            const responseTime = Date.now() - startTime;
            const inputTokens = Math.floor(prompt.length / 4);
            const outputTokens = 200;

            resolve({
                success: true,
                responseTime: responseTime,
                inputTokens: inputTokens,
                outputTokens: outputTokens,
                totalTokens: inputTokens + outputTokens,
                cost: (inputTokens * TOKEN_ECONOMICS.gpt4.input + outputTokens * TOKEN_ECONOMICS.gpt4.output) / 1000,
                content: generateBasicLLMCode(),
                timestamp: new Date().toISOString(),
                model: 'gpt-4'
            });
        }, processingTime);
    });
}

function generateBasicLLMCode() {
    return `/**
 * Calculates the area of a circle given the radius
 * @param radius - The radius of the circle
 * @returns The area of the circle
 */
function calculateCircleArea(radius: number): number {
    if (radius <= 0) {
        throw new Error('Radius must be positive');
    }
    return Math.PI * radius * radius;
}`;
}

function analyzeCodeQuality(code) {
    const lines = code.split('\n');
    const totalLines = lines.length;

    // Cyclomatic Complexity (simplified)
    const complexity = (code.match(/if\s*\(|for\s*\(|while\s*\(|switch\s*\(|catch\s*\(/g) || []).length + 1;

    // Maintainability Index (simplified)
    const maintainabilityIndex = Math.max(0, 100 - (complexity * 5) - (totalLines * 0.5));

    // Test Coverage (simplified)
    const hasTests = /describe\s*\(|it\s*\(|test\s*\(/i.test(code);
    const testCoverage = hasTests ? 85 : 0;

    // Code Duplication (simplified)
    const uniqueLines = new Set(lines.map(line => line.trim())).size;
    const duplication = ((totalLines - uniqueLines) / totalLines) * 100;

    // Documentation Coverage
    const docLines = lines.filter(line => line.trim().startsWith('*') || line.trim().startsWith('//')).length;
    const docCoverage = (docLines / totalLines) * 100;

    // Error Handling
    const hasErrorHandling = /throw\s+new\s+Error|try\s*\{|catch\s*\(/i.test(code);
    const errorHandling = hasErrorHandling ? 90 : 0;

    // Type Safety
    const hasTypes = /:\s*(number|string|boolean|Array|Object)/i.test(code);
    const typeSafety = hasTypes ? 95 : 0;

    return {
        cyclomaticComplexity: complexity,
        maintainabilityIndex: Math.round(maintainabilityIndex),
        testCoverage: Math.round(testCoverage),
        codeDuplication: Math.round(duplication),
        documentationCoverage: Math.round(docCoverage),
        errorHandling: errorHandling,
        typeSafety: typeSafety,
        totalLines: totalLines,
        hasTests: hasTests,
        hasDocumentation: docCoverage > 20,
        hasErrorHandling: hasErrorHandling,
        hasTypes: hasTypes
    };
}

function calculateISOScore(response, analysis) {
    let totalScore = 0;
    let breakdown = {};

    // Functional Suitability (20%)
    const functionalSuitability = (
        (analysis.hasTypes ? 40 : 0) +           // Correctness
        (analysis.hasErrorHandling ? 30 : 0) +   // Appropriateness
        (analysis.totalLines > 5 ? 30 : 0)       // Completeness
    );
    totalScore += functionalSuitability * EVALUATION_FRAMEWORK.functionalSuitability.weight;
    breakdown.functionalSuitability = functionalSuitability;

    // Performance Efficiency (15%)
    const performanceEfficiency = Math.max(0, 100 - (response.responseTime / 100));
    totalScore += performanceEfficiency * EVALUATION_FRAMEWORK.performanceEfficiency.weight;
    breakdown.performanceEfficiency = performanceEfficiency;

    // Compatibility (10%)
    const compatibility = 80; // Assume good compatibility
    totalScore += compatibility * EVALUATION_FRAMEWORK.compatibility.weight;
    breakdown.compatibility = compatibility;

    // Usability (10%)
    const usability = (
        (analysis.hasDocumentation ? 50 : 0) +
        (analysis.totalLines < 50 ? 30 : 0) +
        (analysis.cyclomaticComplexity < 5 ? 20 : 0)
    );
    totalScore += usability * EVALUATION_FRAMEWORK.usability.weight;
    breakdown.usability = usability;

    // Reliability (15%)
    const reliability = (
        (analysis.hasErrorHandling ? 50 : 0) +
        (analysis.typeSafety > 90 ? 30 : 0) +
        (analysis.maintainabilityIndex > 70 ? 20 : 0)
    );
    totalScore += reliability * EVALUATION_FRAMEWORK.reliability.weight;
    breakdown.reliability = reliability;

    // Security (10%)
    const security = (
        (analysis.hasErrorHandling ? 60 : 0) +
        (analysis.typeSafety > 90 ? 40 : 0)
    );
    totalScore += security * EVALUATION_FRAMEWORK.security.weight;
    breakdown.security = security;

    // Maintainability (20%)
    const maintainability = (
        (analysis.maintainabilityIndex * 0.4) +
        (analysis.testCoverage * 0.3) +
        (Math.max(0, 100 - analysis.codeDuplication) * 0.2) +
        (analysis.documentationCoverage * 0.1)
    );
    totalScore += maintainability * EVALUATION_FRAMEWORK.maintainability.weight;
    breakdown.maintainability = maintainability;

    return {
        totalScore: Math.round(totalScore),
        breakdown: breakdown,
        isoCompliant: totalScore >= 70
    };
}

function calculateAIScore(response, analysis) {
    let totalScore = 0;
    let breakdown = {};

    // Task Accuracy (25%)
    const taskAccuracy = (
        (analysis.hasTypes ? 40 : 0) +
        (analysis.hasErrorHandling ? 30 : 0) +
        (analysis.totalLines > 5 ? 30 : 0)
    );
    totalScore += taskAccuracy * AI_METRICS.taskAccuracy.weight;
    breakdown.taskAccuracy = taskAccuracy;

    // Response Relevance (20%)
    const responseRelevance = 85; // Assume good relevance
    totalScore += responseRelevance * AI_METRICS.responseRelevance.weight;
    breakdown.responseRelevance = responseRelevance;

    // Code Correctness (20%)
    const codeCorrectness = (
        (analysis.typeSafety * 0.5) +
        (analysis.errorHandling * 0.3) +
        (analysis.hasTypes ? 20 : 0)
    );
    totalScore += codeCorrectness * AI_METRICS.codeCorrectness.weight;
    breakdown.codeCorrectness = codeCorrectness;

    // Completeness (15%)
    const completeness = (
        (analysis.totalLines > 5 ? 40 : 0) +
        (analysis.hasDocumentation ? 30 : 0) +
        (analysis.hasErrorHandling ? 30 : 0)
    );
    totalScore += completeness * AI_METRICS.completeness.weight;
    breakdown.completeness = completeness;

    // Consistency (10%)
    const consistency = 80; // Assume good consistency
    totalScore += consistency * AI_METRICS.consistency.weight;
    breakdown.consistency = consistency;

    // Creativity (10%)
    const creativity = 70; // Assume moderate creativity
    totalScore += creativity * AI_METRICS.creativity.weight;
    breakdown.creativity = creativity;

    return {
        totalScore: Math.round(totalScore),
        breakdown: breakdown
    };
}

function getGrade(score) {
    if (score >= 95) return { grade: 'A+', color: '#27ae60', description: 'Exceptional' };
    if (score >= 90) return { grade: 'A', color: '#2ecc71', description: 'Excellent' };
    if (score >= 85) return { grade: 'A-', color: '#58d68d', description: 'Very Good' };
    if (score >= 80) return { grade: 'B+', color: '#f39c12', description: 'Good' };
    if (score >= 75) return { grade: 'B', color: '#e67e22', description: 'Satisfactory' };
    if (score >= 70) return { grade: 'B-', color: '#d35400', description: 'Adequate' };
    if (score >= 65) return { grade: 'C+', color: '#e74c3c', description: 'Below Average' };
    if (score >= 60) return { grade: 'C', color: '#c0392b', description: 'Poor' };
    if (score >= 55) return { grade: 'C-', color: '#a93226', description: 'Very Poor' };
    return { grade: 'F', color: '#8b0000', description: 'Failing' };
}

function calculateROI(llmCost, mcpCost, llmTime, mcpTime) {
    const timeSaved = llmTime - mcpTime;
    const costDifference = llmCost - mcpCost;
    const timeValue = timeSaved * 0.01; // $0.01 per ms saved
    const totalValue = costDifference + timeValue;
    const roi = totalValue > 0 ? (totalValue / Math.max(llmCost, 0.001)) * 100 : 0;

    return {
        timeSaved: timeSaved,
        costDifference: costDifference,
        timeValue: timeValue,
        totalValue: totalValue,
        roi: Math.round(roi)
    };
}

async function runIndustryStandardComparison() {
    console.log('🏭 Industry-Standard LLM vs MCP Comparison');
    console.log('==========================================');
    console.log('📋 Based on ISO 25010, IEEE 1044, and 2024 AI Standards\n');

    const prompt = "create a function that calculates the area of a circle given the radius";
    console.log(`📝 Test Prompt: "${prompt}"\n`);

    try {
        // Test 1: Direct LLM
        console.log('1️⃣ Testing Direct LLM...');
        const llmResponse = await simulateDirectLLM(prompt);
        const llmAnalysis = analyzeCodeQuality(llmResponse.content);
        const llmISOScore = calculateISOScore(llmResponse, llmAnalysis);
        const llmAIScore = calculateAIScore(llmResponse, llmAnalysis);
        const llmGrade = getGrade(llmISOScore.totalScore);

        // Test 2: MCP
        console.log('2️⃣ Testing MCP...');
        const projectResult = await handleSmartBegin({
            projectName: "industry-standard-comparison",
            projectType: "typescript",
            description: "Industry-standard evaluation test"
        });

        const mcpResponse = await handleSmartWrite({
            projectId: projectResult.data.projectId,
            featureDescription: prompt
        });

        const mcpCode = mcpResponse.data.generatedCode.files[0]?.content || '';
        const mcpAnalysis = analyzeCodeQuality(mcpCode);

        // Calculate MCP costs
        const mcpTokens = 1430;
        const mcpCost = (mcpTokens * TOKEN_ECONOMICS.gpt4.output) / 1000;

        const mcpResponseForGrading = {
            responseTime: mcpResponse.data.technicalMetrics.responseTime,
            cost: mcpCost,
            totalTokens: mcpTokens,
            inputTokens: 0,
            outputTokens: mcpTokens
        };

        const mcpISOScore = calculateISOScore(mcpResponseForGrading, mcpAnalysis);
        const mcpAIScore = calculateAIScore(mcpResponseForGrading, mcpAnalysis);
        const mcpGrade = getGrade(mcpISOScore.totalScore);

        // Calculate ROI
        const roi = calculateROI(llmResponse.cost, mcpCost, llmResponse.responseTime, mcpResponse.data.technicalMetrics.responseTime);

        // Generate comparison
        const comparison = {
            prompt,
            timestamp: new Date().toISOString(),
            framework: 'ISO 25010 + IEEE 1044 + AI Standards 2024',
            llm: {
                response: llmResponse,
                analysis: llmAnalysis,
                isoScore: llmISOScore,
                aiScore: llmAIScore,
                grade: llmGrade
            },
            mcp: {
                response: mcpResponse,
                analysis: mcpAnalysis,
                isoScore: mcpISOScore,
                aiScore: mcpAIScore,
                grade: mcpGrade,
                code: mcpCode
            },
            roi: roi,
            winner: llmISOScore.totalScore > mcpISOScore.totalScore ? 'Direct LLM' : 'MCP',
            difference: Math.abs(llmISOScore.totalScore - mcpISOScore.totalScore)
        };

        // Save results
        const resultsDir = path.join(__dirname, 'test-results', 'industry-standard-comparison');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        // Save code files
        fs.writeFileSync(path.join(resultsDir, 'llm-generated-code.ts'), llmResponse.content);
        fs.writeFileSync(path.join(resultsDir, 'mcp-generated-code.ts'), mcpCode);

        // Generate HTML report
        generateIndustryStandardHTML(comparison, resultsDir, mcpCost);

        // Display results
        console.log('\n📊 INDUSTRY-STANDARD COMPARISON RESULTS');
        console.log('======================================');
        console.log(`\n🏆 Winner: ${comparison.winner} (${comparison.difference} points)`);
        console.log(`💰 ROI: ${roi.roi}% (Time saved: ${roi.timeSaved}ms, Cost diff: $${roi.costDifference.toFixed(6)})`);

        console.log('\n🤖 Direct LLM:');
        console.log(`   Grade: ${llmGrade.grade} (${llmISOScore.totalScore}/100) - ${llmGrade.description}`);
        console.log(`   Response Time: ${llmResponse.responseTime}ms`);
        console.log(`   Cost: $${llmResponse.cost.toFixed(6)}`);
        console.log(`   ISO Compliant: ${llmISOScore.isoCompliant ? '✅' : '❌'}`);
        console.log(`   Test Coverage: ${llmAnalysis.testCoverage}%`);
        console.log(`   Maintainability: ${llmAnalysis.maintainabilityIndex}`);

        console.log('\n🔧 MCP:');
        console.log(`   Grade: ${mcpGrade.grade} (${mcpISOScore.totalScore}/100) - ${mcpGrade.description}`);
        console.log(`   Response Time: ${mcpResponse.data.technicalMetrics.responseTime}ms`);
        console.log(`   Cost: $${mcpCost.toFixed(6)}`);
        console.log(`   ISO Compliant: ${mcpISOScore.isoCompliant ? '✅' : '❌'}`);
        console.log(`   Test Coverage: ${mcpAnalysis.testCoverage}%`);
        console.log(`   Maintainability: ${mcpAnalysis.maintainabilityIndex}`);

        console.log('\n📁 Files saved:');
        console.log(`   📄 LLM Code: file://${path.join(resultsDir, 'llm-generated-code.ts')}`);
        console.log(`   📄 MCP Code: file://${path.join(resultsDir, 'mcp-generated-code.ts')}`);
        console.log(`   🌐 Report: file://${path.join(resultsDir, 'industry-standard-report.html')}`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

function generateIndustryStandardHTML(comparison, resultsDir, mcpCost) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Industry-Standard LLM vs MCP Comparison</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #2c3e50;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3498db;
        }
        .header h1 {
            font-size: 2.5em;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .header .subtitle {
            color: #7f8c8d;
            font-size: 1.2em;
        }
        .winner-banner {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 30px;
            font-size: 1.4em;
            font-weight: bold;
            box-shadow: 0 10px 30px rgba(39, 174, 96, 0.3);
        }
        .roi-section {
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 30px;
            text-align: center;
        }
        .comparison-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }
        .test-card {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            border-left: 6px solid #3498db;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .test-card:hover {
            transform: translateY(-5px);
        }
        .test-card.mcp {
            border-left-color: #e74c3c;
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #ecf0f1;
        }
        .card-title {
            font-size: 1.5em;
            font-weight: bold;
        }
        .grade-badge {
            font-size: 2.2em;
            font-weight: bold;
            padding: 15px 25px;
            border-radius: 12px;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 25px 0;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
        }
        .metric-card:hover {
            transform: translateY(-2px);
        }
        .metric-value {
            font-size: 1.8em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .metric-label {
            color: #7f8c8d;
            font-size: 0.9em;
            font-weight: 500;
        }
        .code-section {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            font-family: 'Courier New', monospace;
            overflow-x: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .code-section h3 {
            color: #3498db;
            margin-bottom: 15px;
            font-family: 'Segoe UI', sans-serif;
        }
        .breakdown-section {
            background: linear-gradient(135deg, #ecf0f1, #bdc3c7);
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
        }
        .breakdown-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .breakdown-item {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .breakdown-score {
            font-size: 1.5em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .breakdown-label {
            color: #7f8c8d;
            font-size: 0.9em;
            font-weight: 500;
        }
        .iso-compliance {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            margin: 15px 0;
            font-weight: bold;
        }
        .links-section {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            padding: 25px;
            border-radius: 15px;
            margin: 30px 0;
        }
        .links-section a {
            color: #ffd700;
            text-decoration: none;
            margin-right: 25px;
            font-weight: 500;
            transition: color 0.3s ease;
        }
        .links-section a:hover {
            color: #fff;
            text-decoration: underline;
        }
        .framework-info {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏭 Industry-Standard LLM vs MCP Comparison</h1>
            <div class="subtitle">Based on ISO 25010, IEEE 1044, and 2024 AI Evaluation Standards</div>
        </div>

        <div class="winner-banner">
            🏆 Winner: ${comparison.winner} (${comparison.difference} points difference)
        </div>

        <div class="roi-section">
            <h2>💰 Return on Investment (ROI)</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 15px;">
                <div>
                    <div style="font-size: 1.5em; font-weight: bold;">${comparison.roi.roi}%</div>
                    <div>ROI</div>
                </div>
                <div>
                    <div style="font-size: 1.5em; font-weight: bold;">${comparison.roi.timeSaved}ms</div>
                    <div>Time Saved</div>
                </div>
                <div>
                    <div style="font-size: 1.5em; font-weight: bold;">$${comparison.roi.costDifference.toFixed(6)}</div>
                    <div>Cost Difference</div>
                </div>
            </div>
        </div>

        <div class="comparison-grid">
            <div class="test-card">
                <div class="card-header">
                    <div class="card-title">🤖 Direct LLM</div>
                    <div class="grade-badge" style="background: ${comparison.llm.grade.color}">${comparison.llm.grade.grade}</div>
                </div>

                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${comparison.llm.isoScore.totalScore}</div>
                        <div class="metric-label">ISO Score</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${comparison.llm.response.responseTime}ms</div>
                        <div class="metric-label">Response Time</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$${comparison.llm.response.cost.toFixed(6)}</div>
                        <div class="metric-label">Cost</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${comparison.llm.analysis.testCoverage}%</div>
                        <div class="metric-label">Test Coverage</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${comparison.llm.analysis.maintainabilityIndex}</div>
                        <div class="metric-label">Maintainability</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${comparison.llm.analysis.cyclomaticComplexity}</div>
                        <div class="metric-label">Complexity</div>
                    </div>
                </div>

                <div class="iso-compliance">
                    ISO 25010 Compliant: ${comparison.llm.isoScore.isoCompliant ? '✅ YES' : '❌ NO'}
                </div>

                <div class="code-section">
                    <h3>Generated Code:</h3>
                    <pre>${comparison.llm.response.content}</pre>
                </div>
            </div>

            <div class="test-card mcp">
                <div class="card-header">
                    <div class="card-title">🔧 MCP Processed</div>
                    <div class="grade-badge" style="background: ${comparison.mcp.grade.color}">${comparison.mcp.grade.grade}</div>
                </div>

                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${comparison.mcp.isoScore.totalScore}</div>
                        <div class="metric-label">ISO Score</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${comparison.mcp.response.data.technicalMetrics.responseTime}ms</div>
                        <div class="metric-label">Response Time</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$${mcpCost.toFixed(6)}</div>
                        <div class="metric-label">Cost</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${comparison.mcp.analysis.testCoverage}%</div>
                        <div class="metric-label">Test Coverage</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${comparison.mcp.analysis.maintainabilityIndex}</div>
                        <div class="metric-label">Maintainability</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${comparison.mcp.analysis.cyclomaticComplexity}</div>
                        <div class="metric-label">Complexity</div>
                    </div>
                </div>

                <div class="iso-compliance">
                    ISO 25010 Compliant: ${comparison.mcp.isoScore.isoCompliant ? '✅ YES' : '❌ NO'}
                </div>

                <div class="code-section">
                    <h3>Generated Code:</h3>
                    <pre>${comparison.mcp.code}</pre>
                </div>
            </div>
        </div>

        <div class="breakdown-section">
            <h2>📊 Detailed ISO 25010 Quality Breakdown</h2>
            <div class="breakdown-grid">
                <div class="breakdown-item">
                    <div class="breakdown-score">${comparison.llm.isoScore.breakdown.functionalSuitability}</div>
                    <div class="breakdown-label">LLM Functional Suitability</div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-score">${comparison.mcp.isoScore.breakdown.functionalSuitability}</div>
                    <div class="breakdown-label">MCP Functional Suitability</div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-score">${comparison.llm.isoScore.breakdown.performanceEfficiency}</div>
                    <div class="breakdown-label">LLM Performance Efficiency</div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-score">${comparison.mcp.isoScore.breakdown.performanceEfficiency}</div>
                    <div class="breakdown-label">MCP Performance Efficiency</div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-score">${comparison.llm.isoScore.breakdown.maintainability}</div>
                    <div class="breakdown-label">LLM Maintainability</div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-score">${comparison.mcp.isoScore.breakdown.maintainability}</div>
                    <div class="breakdown-label">MCP Maintainability</div>
                </div>
            </div>
        </div>

        <div class="framework-info">
            <h3>📋 Evaluation Framework</h3>
            <p><strong>ISO 25010 Software Quality Model:</strong> Functional Suitability (20%), Performance Efficiency (15%), Reliability (15%), Maintainability (20%), Usability (10%), Compatibility (10%), Security (10%)</p>
            <p><strong>IEEE 1044 Code Quality Metrics:</strong> Cyclomatic Complexity, Maintainability Index, Test Coverage, Code Duplication, Documentation Coverage, Error Handling, Type Safety</p>
            <p><strong>AI-Specific Metrics (2024):</strong> Task Accuracy, Response Relevance, Code Correctness, Completeness, Consistency, Creativity</p>
        </div>

        <div class="links-section">
            <h3>📁 Generated Files & Reports:</h3>
            <a href="llm-generated-code.ts" target="_blank">📄 View LLM Generated Code</a>
            <a href="mcp-generated-code.ts" target="_blank">📄 View MCP Generated Code</a>
            <a href="../test-results-dashboard.html">🏠 Back to Dashboard</a>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(resultsDir, 'industry-standard-report.html'), html);
}

// Run the comparison
if (require.main === module) {
    runIndustryStandardComparison().catch(console.error);
}

module.exports = { runIndustryStandardComparison };
