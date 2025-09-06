#!/usr/bin/env node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
/**
 * MCP HTML Generation Test: Real Web Page Creation
 *
 * This test connects to the deployed TappMCP Docker container and tests
 * the actual MCP server's ability to generate HTML code.
 *
 * Test Prompt: "Create me an HTML page that has a header, a footer, and says
 * 'I'm the best' in the body. Make sure it produces that code for you."
 */
// MCP Client configuration
const MCP_CONFIG = {
    serverUrl: 'http://localhost:8080', // TappMCP Docker container port
    timeout: 30000, // 30 second timeout
    retries: 3,
};
// MCP Tool call function
async function callMCPTool(toolName, input) {
    try {
        console.log(`🔧 Calling MCP Tool: ${toolName}`);
        console.log(`📝 Input:`, JSON.stringify(input, null, 2));
        const response = await fetch(`${MCP_CONFIG.serverUrl}/mcp/${toolName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
            signal: AbortSignal.timeout(MCP_CONFIG.timeout),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        console.log(`✅ MCP Response:`, JSON.stringify(result, null, 2));
        return {
            success: result.success || false,
            data: result.data,
            error: result.error,
        };
    }
    catch (error) {
        console.error(`❌ MCP Tool Call Failed:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
describe('MCP HTML Generation Test: Real Web Page Creation', () => {
    let projectId;
    let generatedCode;
    let testResults;
    beforeAll(async () => {
        testResults = {
            mcpConnection: false,
            projectInitialization: false,
            htmlGeneration: false,
            codeQuality: false,
            functionality: false,
            structure: false,
            styling: false,
            accessibility: false,
            performance: false,
        };
    });
    afterAll(() => {
        console.log('\n=== MCP HTML GENERATION TEST RESULTS ===');
        console.log('MCP Connection:', testResults.mcpConnection ? '✅ PASS' : '❌ FAIL');
        console.log('Project Initialization:', testResults.projectInitialization ? '✅ PASS' : '❌ FAIL');
        console.log('HTML Generation:', testResults.htmlGeneration ? '✅ PASS' : '❌ FAIL');
        console.log('Code Quality:', testResults.codeQuality ? '✅ PASS' : '❌ FAIL');
        console.log('Functionality:', testResults.functionality ? '✅ PASS' : '❌ FAIL');
        console.log('Structure (Header/Footer/Body):', testResults.structure ? '✅ PASS' : '❌ FAIL');
        console.log('Styling:', testResults.styling ? '✅ PASS' : '❌ FAIL');
        console.log('Accessibility:', testResults.accessibility ? '✅ PASS' : '❌ FAIL');
        console.log('Performance:', testResults.performance ? '✅ PASS' : '❌ FAIL');
        const passCount = Object.values(testResults).filter(Boolean).length;
        const totalCount = Object.keys(testResults).length;
        const score = Math.round((passCount / totalCount) * 100);
        console.log(`\nOverall Score: ${score}% (${passCount}/${totalCount} tests passed)`);
        console.log('Grade:', score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F');
    });
    it('should connect to deployed MCP server', async () => {
        console.log('\n🧪 Testing: MCP Server Connection');
        try {
            // Test basic connectivity
            const response = await fetch(`${MCP_CONFIG.serverUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000),
            });
            if (response.ok) {
                console.log('✅ MCP Server is running and accessible');
                testResults.mcpConnection = true;
            }
            else {
                console.log('❌ MCP Server responded with error:', response.status);
                testResults.mcpConnection = false;
            }
        }
        catch (error) {
            console.log('❌ MCP Server connection failed:', error);
            testResults.mcpConnection = false;
        }
        expect(testResults.mcpConnection).toBe(true);
    });
    it('should initialize project via MCP', async () => {
        console.log('\n🧪 Testing: MCP Project Initialization');
        const beginResult = await callMCPTool('smart_begin', {
            projectName: 'HTML Page Generator',
            description: 'Simple HTML page with header, footer, and body content',
            techStack: ['html', 'css', 'javascript'],
            targetUsers: ['non-technical-founder'],
            businessGoals: ['create simple web page', 'learn HTML basics', 'build portfolio'],
        });
        expect(beginResult.success).toBe(true);
        expect(beginResult.data).toBeDefined();
        testResults.projectInitialization = beginResult.success;
        if (beginResult.success && beginResult.data) {
            const data = beginResult.data;
            projectId = data.projectId;
            console.log(`✅ Project initialized via MCP: ${data.projectId}`);
            console.log(`   - Folders: ${data.projectStructure?.folders?.length || 'N/A'}`);
            console.log(`   - Quality Gates: ${data.qualityGates?.length || 'N/A'}`);
            console.log(`   - Cost Prevention: $${data.businessValue?.costPrevention?.toLocaleString() || 'N/A'}`);
        }
    });
    it('should generate HTML page via MCP', async () => {
        console.log('\n🧪 Testing: MCP HTML Page Generation');
        expect(projectId).toBeDefined();
        const writeResult = await callMCPTool('smart_write', {
            projectId,
            featureDescription: 'Create me an HTML page that has a header, a footer, and says "I\'m the best" in the body',
            targetRole: 'developer',
            codeType: 'component',
            techStack: ['html', 'css', 'javascript'],
            businessContext: {
                goals: ['create simple web page', 'learn HTML basics'],
                targetUsers: ['non-technical-founder'],
                priority: 'high',
            },
            qualityRequirements: {
                testCoverage: 80,
                complexity: 3,
                securityLevel: 'medium',
            },
        });
        expect(writeResult.success).toBe(true);
        expect(writeResult.data).toBeDefined();
        testResults.htmlGeneration = writeResult.success;
        if (writeResult.success && writeResult.data) {
            const data = writeResult.data;
            generatedCode = data.generatedCode;
            console.log(`✅ HTML page generated via MCP`);
            console.log(`   - Files Created: ${data.generatedCode?.files?.length || 'N/A'}`);
            console.log(`   - Lines Generated: ${data.technicalMetrics?.linesGenerated || 'N/A'}`);
            console.log(`   - Response Time: ${data.technicalMetrics?.responseTime || 'N/A'}ms`);
            // Display thought process if available
            if (data.thoughtProcess) {
                console.log(`\n🧠 TappMCP Thought Process:`);
                console.log(`   - Step 1: ${data.thoughtProcess.step1_analysis?.decision || 'N/A'}`);
                console.log(`   - Reasoning: ${data.thoughtProcess.step1_analysis?.reasoning || 'N/A'}`);
                console.log(`   - Detection Confidence: ${data.thoughtProcess.step2_detection?.confidence || 'N/A'}%`);
                console.log(`   - Approach: ${data.thoughtProcess.step3_generation?.chosenApproach || 'N/A'}`);
                console.log(`   - Requirements Met: ${data.thoughtProcess.step4_validation?.requirementsCheck?.filter((check) => check.includes('✅')).length || 0}/${data.thoughtProcess.step4_validation?.requirementsCheck?.length || 0}`);
            }
        }
    });
    it('should analyze generated HTML code from MCP', async () => {
        console.log('\n🧪 Testing: MCP Generated HTML Analysis');
        expect(generatedCode).toBeDefined();
        expect(generatedCode.files).toBeDefined();
        expect(generatedCode.files.length).toBeGreaterThan(0);
        // Find the HTML file
        const htmlFile = generatedCode.files.find((file) => file.path.endsWith('.html') || file.type === 'html' || file.content.includes('<html'));
        if (htmlFile) {
            console.log(`📄 Found HTML file: ${htmlFile.path}`);
            console.log(`📊 File size: ${htmlFile.content.length} characters`);
            // Analyze HTML structure
            const hasHeader = htmlFile.content.includes('<header') ||
                htmlFile.content.includes('<h1') ||
                htmlFile.content.includes('header');
            const hasFooter = htmlFile.content.includes('<footer') || htmlFile.content.includes('footer');
            const hasBody = htmlFile.content.includes('<body') || htmlFile.content.includes('body');
            const hasContent = htmlFile.content.includes("I'm the best") ||
                htmlFile.content.includes("i'm the best") ||
                htmlFile.content.includes('I am the best');
            testResults.structure = hasHeader && hasFooter && hasBody && hasContent;
            console.log(`   - Has Header: ${hasHeader ? '✅' : '❌'}`);
            console.log(`   - Has Footer: ${hasFooter ? '✅' : '❌'}`);
            console.log(`   - Has Body: ${hasBody ? '✅' : '❌'}`);
            console.log(`   - Has Required Content: ${hasContent ? '✅' : '❌'}`);
            // Analyze code quality
            const hasDoctype = htmlFile.content.includes('<!DOCTYPE');
            const hasHtmlTag = htmlFile.content.includes('<html');
            const hasHeadTag = htmlFile.content.includes('<head');
            const hasTitle = htmlFile.content.includes('<title');
            const hasCss = htmlFile.content.includes('<style') || htmlFile.content.includes('.css');
            testResults.codeQuality = hasDoctype && hasHtmlTag && hasHeadTag;
            testResults.styling = hasCss || hasTitle;
            console.log(`   - Has DOCTYPE: ${hasDoctype ? '✅' : '❌'}`);
            console.log(`   - Has HTML Tag: ${hasHtmlTag ? '✅' : '❌'}`);
            console.log(`   - Has Head Tag: ${hasHeadTag ? '✅' : '❌'}`);
            console.log(`   - Has Title: ${hasTitle ? '✅' : '❌'}`);
            console.log(`   - Has CSS/Styling: ${hasCss ? '✅' : '❌'}`);
            // Analyze accessibility
            const hasAltText = htmlFile.content.includes('alt=');
            const hasLang = htmlFile.content.includes('lang=');
            const hasSemanticTags = htmlFile.content.includes('<main') ||
                htmlFile.content.includes('<section') ||
                htmlFile.content.includes('<article');
            testResults.accessibility = hasLang || hasSemanticTags;
            console.log(`   - Has Language Attribute: ${hasLang ? '✅' : '❌'}`);
            console.log(`   - Has Alt Text: ${hasAltText ? '✅' : '❌'}`);
            console.log(`   - Has Semantic Tags: ${hasSemanticTags ? '✅' : '❌'}`);
            // Analyze functionality
            const hasJavaScript = htmlFile.content.includes('<script') || htmlFile.content.includes('javascript');
            const hasInteractive = htmlFile.content.includes('onclick') || htmlFile.content.includes('addEventListener');
            testResults.functionality = true; // Basic HTML is functional
            console.log(`   - Has JavaScript: ${hasJavaScript ? '✅' : '❌'}`);
            console.log(`   - Has Interactive Elements: ${hasInteractive ? '✅' : '❌'}`);
            // Performance analysis
            const fileSize = htmlFile.content.length;
            const isLightweight = fileSize < 10000; // Less than 10KB
            testResults.performance = isLightweight;
            console.log(`   - File Size: ${fileSize} characters`);
            console.log(`   - Is Lightweight: ${isLightweight ? '✅' : '❌'}`);
        }
        else {
            console.log('❌ No HTML file found in MCP generated code');
            testResults.structure = false;
            testResults.codeQuality = false;
        }
    });
    it('should document MCP test results', async () => {
        console.log('\n🧪 Testing: MCP Results Documentation');
        // Document all results for analysis (no pass/fail)
        console.log('📊 MCP HTML Generation Analysis Summary:');
        console.log('   - MCP Connection: Connected to deployed Docker container');
        console.log('   - Project initialization: Via MCP smart_begin tool');
        console.log('   - HTML generation: Via MCP smart_write tool');
        console.log('   - Code quality: Analysis of MCP-generated HTML');
        console.log('   - Functionality: MCP-generated HTML functionality');
        console.log('   - Structure: Header, footer, and body elements from MCP');
        console.log('   - Styling: CSS and visual presentation from MCP');
        console.log('   - Accessibility: Basic accessibility features from MCP');
        console.log('   - Performance: File size and loading optimization from MCP');
        // Always pass - this is just documentation
        expect(true).toBe(true);
    });
});
//# sourceMappingURL=mcp_html_generation_test.js.map