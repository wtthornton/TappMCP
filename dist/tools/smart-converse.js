/**
 * Smart Converse Tool - Natural Language Interface for TappMCP
 *
 * Provides a conversational interface that maps natural language
 * to existing TappMCP tools using simple keyword matching.
 */
import { z } from 'zod';
import { handleSmartOrchestrate } from './smart-orchestrate.js';
// Input schema for smart_converse tool
export const SmartConverseSchema = z.object({
    userMessage: z.string().min(1).describe('Natural language message from the user'),
});
// Tool definition for MCP server
export const smartConverseTool = {
    name: 'smart_converse',
    description: 'Natural language interface for TappMCP - converts conversations to project setup',
    inputSchema: {
        type: 'object',
        properties: {
            userMessage: {
                type: 'string',
                description: 'Natural language message describing what you want to build',
                minLength: 1,
            },
        },
        required: ['userMessage'],
    },
};
// Supported project types (order matters - more specific first)
const PROJECT_TYPES = {
    'api-service': ['api', 'backend', 'rest', 'graphql', 'service', 'endpoint'],
    'mobile-app': ['mobile', 'ios', 'android', 'native', 'react native'],
    library: ['library', 'package', 'module', 'sdk', 'framework', 'utility'],
    'web-app': ['website', 'web app', 'web application', 'frontend', 'ui', 'webpage'],
};
// Supported tech stacks
const TECH_STACKS = {
    react: ['react', 'jsx', 'next', 'nextjs'],
    vue: ['vue', 'vuejs', 'nuxt'],
    angular: ['angular', 'ng'],
    nodejs: ['node', 'nodejs', 'express', 'fastify'],
    python: ['python', 'django', 'flask', 'fastapi'],
    typescript: ['typescript', 'ts', 'typed'],
};
// Supported roles
const ROLES = {
    developer: ['develop', 'code', 'program', 'build', 'create', 'implement'],
    designer: ['design', 'ui', 'ux', 'interface', 'visual', 'style'],
    'qa-engineer': ['test', 'quality', 'qa', 'bug', 'verify', 'validate'],
    'operations-engineer': ['deploy', 'devops', 'infrastructure', 'ci/cd', 'pipeline'],
    'product-strategist': ['strategy', 'product', 'business', 'plan', 'roadmap'],
};
/**
 * Parse user intent from natural language message
 * @param message - User's natural language input
 * @returns Parsed intent with project details
 */
export function parseIntent(message) {
    const lowerMessage = message.toLowerCase();
    // Detect project type
    let projectType;
    for (const [type, keywords] of Object.entries(PROJECT_TYPES)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            projectType = type;
            break;
        }
    }
    // Detect tech stack (use word boundaries to avoid false matches)
    const techStack = [];
    for (const [tech, keywords] of Object.entries(TECH_STACKS)) {
        if (keywords.some(keyword => {
            // Create word boundary regex for more accurate matching
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            return regex.test(message);
        })) {
            techStack.push(tech);
        }
    }
    // Detect role
    let role;
    for (const [r, keywords] of Object.entries(ROLES)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            role = r;
            break;
        }
    }
    // Extract project name (basic heuristic: look for quoted text or after "called/named")
    let projectName = 'new-project';
    const quotedMatch = message.match(/["']([^"']+)["']/);
    if (quotedMatch) {
        projectName = quotedMatch[1];
    }
    else {
        const namedMatch = message.match(/(?:called|named|project)\s+(\w+)/i);
        if (namedMatch) {
            projectName = namedMatch[1];
        }
    }
    // Generate project ID with small delay to ensure uniqueness
    const timestamp = Date.now() + Math.floor(Math.random() * 1000);
    const projectId = `${projectName}-${timestamp}`;
    return {
        projectId,
        projectName,
        projectType: projectType || 'web-app',
        techStack,
        role: role || 'developer',
        description: message,
    };
}
/**
 * Generate human-friendly response based on orchestration result
 * @param intent - Parsed user intent
 * @param orchestrateResult - Result from smart_orchestrate
 * @returns Formatted response text
 */
export function generateResponse(intent, orchestrateResult) {
    const { success, orchestrationId, businessValue, workflow } = orchestrateResult;
    if (!success) {
        return `I encountered an issue while setting up your ${intent.projectType} project. Please try again or provide more details about what you'd like to build.`;
    }
    // Success response templates
    const projectTypeDescriptions = {
        'web-app': 'web application',
        'api-service': 'API service',
        'mobile-app': 'mobile application',
        library: 'software library',
    };
    const roleDescriptions = {
        developer: 'development',
        designer: 'design',
        'qa-engineer': 'quality assurance',
        'operations-engineer': 'operations and deployment',
        'product-strategist': 'product strategy',
    };
    let response = `🚀 **Project "${intent.projectName}" Initialized Successfully!**\n\n`;
    response += `I've set up your ${projectTypeDescriptions[intent.projectType] || intent.projectType} project with the following configuration:\n\n`;
    // Project details
    response += `**📋 Project Details:**\n`;
    response += `- Project ID: ${intent.projectId}\n`;
    response += `- Type: ${projectTypeDescriptions[intent.projectType] || intent.projectType}\n`;
    response += `- Role: ${roleDescriptions[intent.role] || intent.role}\n`;
    if (intent.techStack.length > 0) {
        response += `- Technology Stack: ${intent.techStack.join(', ')}\n`;
    }
    response += `- Orchestration ID: ${orchestrationId}\n\n`;
    // Business value if available
    if (businessValue) {
        response += `**💰 Business Value:**\n`;
        if (businessValue.costPrevention) {
            response += `- Estimated Cost Prevention: $${businessValue.costPrevention.toLocaleString()}\n`;
        }
        if (businessValue.timeSaved) {
            response += `- Estimated Time Saved: ${businessValue.timeSaved} hours\n`;
        }
        response += '\n';
    }
    // Next steps
    response += `**🎯 Next Steps:**\n`;
    const nextSteps = [
        `1. Review the project structure and configuration`,
        `2. Install necessary dependencies for ${intent.techStack.length > 0 ? intent.techStack.join(' and ') : 'your chosen technologies'}`,
        `3. Set up your development environment`,
        `4. Begin implementing core features`,
        `5. Configure testing and quality assurance`,
    ];
    response += `${nextSteps.join('\n')}\n\n`;
    // Workflow phases if available
    if (workflow && workflow.phases && workflow.phases.length > 0) {
        response += `**📊 Workflow Phases:**\n`;
        workflow.phases.slice(0, 3).forEach((phase, index) => {
            response += `${index + 1}. ${phase.name || phase.id || `Phase ${index + 1}`}\n`;
        });
        response += '\n';
    }
    // Call to action
    response += `**Ready to start building!** Your project has been orchestrated and is ready for ${roleDescriptions[intent.role] || 'development'}. `;
    response += `The system has automatically configured the optimal workflow for your ${projectTypeDescriptions[intent.projectType] || 'project'}.`;
    return response;
}
/**
 * Handle natural language conversation and map to TappMCP tools
 * @param input - User's natural language message
 * @returns Tool response with conversation result
 */
export async function handleSmartConverse(input) {
    try {
        // Validate input
        const validatedInput = SmartConverseSchema.parse(input);
        // Parse user intent
        const intent = parseIntent(validatedInput.userMessage);
        // Map intent to smart_orchestrate parameters
        const orchestrateInput = {
            request: intent.description,
            options: {
                businessContext: {
                    projectId: intent.projectId,
                    businessGoals: [
                        `Create a ${intent.projectType} solution`,
                        `Implement using ${intent.techStack.length > 0 ? intent.techStack.join(', ') : 'appropriate technologies'}`,
                    ],
                    requirements: [
                        `Project type: ${intent.projectType}`,
                        `Technology stack: ${intent.techStack.join(', ') || 'To be determined'}`,
                        `Development role: ${intent.role}`,
                    ],
                    stakeholders: [intent.role],
                    constraints: {
                        projectType: intent.projectType,
                        techStack: intent.techStack,
                        role: intent.role,
                    },
                },
                qualityLevel: 'standard',
                costPrevention: true,
            },
            workflow: 'project',
            role: intent.role,
        };
        // Call smart_orchestrate
        const orchestrateResult = await handleSmartOrchestrate(orchestrateInput);
        // Generate user-friendly response
        const responseText = generateResponse(intent, orchestrateResult);
        // Return formatted response
        return {
            content: [
                {
                    type: 'text',
                    text: responseText,
                },
            ],
        };
    }
    catch (error) {
        // Error handling with user-friendly message
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        let userMessage = `❌ **Unable to Process Your Request**\n\n`;
        userMessage += `I encountered an issue while trying to understand or process your request.\n\n`;
        userMessage += `**Error Details:**\n`;
        userMessage += `${errorMessage}\n\n`;
        userMessage += `**💡 Suggestions:**\n`;
        userMessage += `- Try rephrasing your request with more specific details\n`;
        userMessage += `- Specify the project type (web app, API, mobile app, or library)\n`;
        userMessage += `- Include the technology stack you'd like to use (React, Node.js, Python, etc.)\n`;
        userMessage += `- Mention your role (developer, designer, QA, operations, product strategist)\n\n`;
        userMessage += `**Example:**\n`;
        userMessage += `"I want to create a React web application called MyApp with TypeScript"`;
        return {
            content: [
                {
                    type: 'text',
                    text: userMessage,
                },
            ],
            isError: true,
        };
    }
}
//# sourceMappingURL=smart-converse.js.map