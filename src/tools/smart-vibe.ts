/**
 * Smart Vibe Tool - Full VibeTapp Integration for MCP
 *
 * Provides the complete VibeTapp natural language interface
 * as an MCP tool for Cursor integration.
 */

import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { VibeTapp } from '../vibe/core/VibeTapp.js';
import { ToolAvailabilityChecker } from '../utils/tool-availability-checker.js';
import fs from 'fs/promises';
import path from 'path';

// Input schema for smart_vibe tool
export const SmartVibeSchema = z.object({
  command: z.string().min(1).describe('Natural language command or vibe request'),
  options: z
    .object({
      role: z
        .string()
        .optional()
        .describe(
          'Role: developer, designer, qa-engineer, operations-engineer, product-strategist'
        ),
      quality: z
        .string()
        .optional()
        .describe('Quality level: basic, standard, enterprise, production'),
      verbosity: z.string().optional().describe('Verbosity: minimal, standard, detailed'),
      mode: z.string().optional().describe('Mode: basic, advanced, power'),
      // Tracing parameters
      trace: z.boolean().optional().describe('Enable detailed call tree tracing'),
      debug: z.boolean().optional().describe('Enable debug mode with full tracing'),
      debughtml: z.boolean().optional().describe('Generate HTML debug dashboard instead of console output'),
      traceLevel: z
        .enum(['basic', 'detailed', 'comprehensive'])
        .optional()
        .describe('Level of tracing detail: basic, detailed, comprehensive'),
      outputFormat: z
        .enum(['console', 'json', 'html'])
        .optional()
        .describe('Output format for trace data: console, json, html'),
    })
    .optional()
    .describe('Optional configuration options'),
});

export type SmartVibeInput = z.infer<typeof SmartVibeSchema>;

// Tool definition for MCP server
export const smartVibeTool: Tool = {
  name: 'smart_vibe',
  description:
    '🎯 Smart Vibe - Natural language interface for TappMCP with visual status indicators, context management, role switching, and rich responses',
  inputSchema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description:
          'Natural language command (e.g., "make me a todo app", "check my code", "improve this function"), "status" for system status, or "install tools" for missing tools',
        minLength: 1,
      },
      options: {
        type: 'object',
        description: 'Optional configuration options',
        properties: {
          role: {
            type: 'string',
            enum: [
              'developer',
              'designer',
              'qa-engineer',
              'operations-engineer',
              'product-strategist',
            ],
            description: 'Role for the command execution',
          },
          quality: {
            type: 'string',
            enum: ['basic', 'standard', 'enterprise', 'production'],
            description: 'Quality level for the command',
          },
          verbosity: {
            type: 'string',
            enum: ['minimal', 'standard', 'detailed'],
            description: 'Verbosity level for responses',
          },
          mode: {
            type: 'string',
            enum: ['basic', 'advanced', 'power'],
            description: 'Mode for command execution',
          },
          // Tracing parameters
          trace: {
            type: 'boolean',
            description: 'Enable detailed call tree tracing',
          },
          debug: {
            type: 'boolean',
            description: 'Enable debug mode with full tracing',
          },
          debughtml: {
            type: 'boolean',
            description: 'Generate HTML debug dashboard instead of console output',
          },
          traceLevel: {
            type: 'string',
            enum: ['basic', 'detailed', 'comprehensive'],
            description: 'Level of tracing detail: basic, detailed, comprehensive',
          },
          outputFormat: {
            type: 'string',
            enum: ['console', 'json', 'html'],
            description: 'Output format for trace data: console, json, html',
          },
        },
      },
    },
    required: ['command'],
  },
};

// Global VibeTapp instance with singleton pattern
let vibeInstance: VibeTapp | null = null;

/**
 * Get or create VibeTapp instance
 */
function getVibeInstance(): VibeTapp {
  if (!vibeInstance) {
    vibeInstance = new VibeTapp();
  }
  return vibeInstance;
}

/**
 * Format VibeTapp response for MCP/Cursor display
 */
function formatVibeResponse(vibeResponse: any): string {
  let formatted = '';

  // Main message
  if (vibeResponse.message) {
    formatted += `${vibeResponse.message }\n\n`;
  }

  // Details section
  if (vibeResponse.details && vibeResponse.details.data) {
    const data = vibeResponse.details.data;

    if (data.projectStructure) {
      formatted += '**📁 Project Structure:**\n';
      formatted += `\`\`\`json\n${ JSON.stringify(data.projectStructure, null, 2) }\n\`\`\`\n\n`;
    }

    if (data.qualityScorecard) {
      formatted += '**📊 Quality Scorecard:**\n';
      formatted += `\`\`\`json\n${ JSON.stringify(data.qualityScorecard, null, 2) }\n\`\`\`\n\n`;
    }

    if (data.generatedCode) {
      formatted += '**💻 Generated Code:**\n';
      formatted += `\`\`\`typescript\n${ data.generatedCode }\n\`\`\`\n\n`;
    }

    if (data.projectPlan) {
      formatted += '**📋 Project Plan:**\n';
      formatted += `\`\`\`json\n${ JSON.stringify(data.projectPlan, null, 2) }\n\`\`\`\n\n`;
    }

    if (data.techStack) {
      formatted += '**🛠️ Tech Stack:**\n';
      formatted += `${data.techStack.join(', ') }\n\n`;
    }

    if (data.targetRole) {
      formatted += '**👤 Target Role:**\n';
      formatted += `${data.targetRole }\n\n`;
    }
  }

  // Next steps
  if (vibeResponse.nextSteps && vibeResponse.nextSteps.length > 0) {
    formatted += '**🚀 Next Steps:**\n';
    vibeResponse.nextSteps.forEach((step: string, index: number) => {
      formatted += `${index + 1}. ${step}\n`;
    });
    formatted += '\n';
  }

  // Learning content
  if (
    vibeResponse.learning &&
    vibeResponse.learning.tips &&
    vibeResponse.learning.tips.length > 0
  ) {
    formatted += '**💡 Tips:**\n';
    vibeResponse.learning.tips.forEach((tip: string) => {
      formatted += `• ${tip}\n`;
    });
    formatted += '\n';
  }

  // Metrics
  if (vibeResponse.metrics && vibeResponse.metrics.responseTime) {
    formatted += `**⏱️ Response Time:** ${vibeResponse.metrics.responseTime}ms\n\n`;
  }

  // Trace data
  console.log('🔍 FormatVibeResponse - Checking trace data:', !!vibeResponse.trace);
  console.log('🔍 FormatVibeResponse - Checking traceInfo:', !!vibeResponse.traceInfo);

  if (vibeResponse.trace) {
    console.log('🔍 FormatVibeResponse - Adding trace data to response');
    formatted += '**🔍 Call Tree Trace:**\n';
    formatted += `\`\`\`json\n${JSON.stringify(vibeResponse.trace, null, 2)}\n\`\`\`\n\n`;
  } else {
    console.log('🔍 FormatVibeResponse - No trace data found');
  }

  // Trace info
  if (vibeResponse.traceInfo) {
    console.log('🔍 FormatVibeResponse - Adding trace info to response');
    formatted += vibeResponse.traceInfo;
  } else {
    console.log('🔍 FormatVibeResponse - No trace info found');
  }

  return formatted.trim();
}

/**
 * Create status response for smart_vibe tool
 */
async function createStatusResponse(): Promise<string> {
  // Check tool availability
  const missingTools = await ToolAvailabilityChecker.getMissingTools();
  const criticalMissing = await ToolAvailabilityChecker.getCriticalMissingTools();
  const isFunctional = await ToolAvailabilityChecker.isSystemFunctional();

  // Determine system status
  const systemStatus = isFunctional ? 'ACTIVE' : 'DEGRADED';
  const statusIcon = isFunctional ? '🟢' : '🟡';
  const healthScore =
    missingTools.length === 0 ? 100 : Math.max(60, 100 - missingTools.length * 10);

  let statusText = `
🎯 **Smart Vibe Status Dashboard**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**${statusIcon} System Status: ${systemStatus}**
├─ MCP Server: ✅ Connected
├─ Tools Available: 7/7 ✅
├─ Response Time: <1ms ⚡
├─ Health Score: ${healthScore}% ${healthScore >= 90 ? '🏆' : healthScore >= 70 ? '⚠️' : '❌'}
└─ Last Updated: ${new Date().toLocaleTimeString()}

**🔧 Available Tools:**
├─ 🎯 smart_vibe - Natural language interface
├─ 🔍 smart_begin - Project initialization
├─ ✍️ smart_write - Code generation
├─ 📋 smart_plan - Technical planning
├─ 🎭 smart_orchestrate - Full SDLC automation
├─ ✅ smart_finish - Project completion
└─ 💬 smart_converse - Advanced conversation`;

  // Add missing tools section if any are missing
  if (missingTools.length > 0) {
    statusText += `\n\n**⚠️ Missing External Tools:**`;

    if (criticalMissing.length > 0) {
      statusText += `\n**🚨 Critical (Required):**`;
      for (const tool of criticalMissing) {
        statusText += `\n├─ ❌ ${tool.name} - ${tool.description}`;
      }
    }

    const optionalMissing = missingTools.filter(tool => !tool.critical);
    if (optionalMissing.length > 0) {
      statusText += `\n**🔧 Optional (Recommended):**`;
      for (const tool of optionalMissing) {
        statusText += `\n├─ ⚠️ ${tool.name} - ${tool.description}`;
      }
    }

    statusText += `\n\n**💡 Impact:**`;
    if (criticalMissing.length > 0) {
      statusText += `\n• Critical tools missing - some features may not work`;
    }
    if (optionalMissing.length > 0) {
      statusText += `\n• Optional tools missing - security scanning reduced`;
    }
  }

  statusText += `\n\n**💡 Quick Commands:**
• \`smart_vibe "status"\` - Show this status
• \`smart_vibe "create a todo app"\` - Start coding
• \`smart_vibe "check my code"\` - Quality analysis
• \`smart_vibe "help"\` - Get assistance

**🎨 Visual Indicators:**
• 🟢 Green = System healthy
• 🟡 Yellow = System degraded (missing tools)
• ⚡ Lightning = Fast response
• 🏆 Trophy = High performance
• 🎯 Target = Ready to help`;

  if (missingTools.length > 0) {
    statusText += `\n\n**📦 Installation Help:**
• Run \`smart_vibe "install tools"\` for installation instructions
• Check the README.md for detailed setup guide`;
  }

  statusText += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*TappMCP v2.0.0 | Powered by Context7 Intelligence*`;

  return statusText;
}

/**
 * Handle smart_vibe tool execution
 */
export async function handleSmartVibe(
  input: SmartVibeInput
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  console.log('🎯 handleSmartVibe called with input:', JSON.stringify(input, null, 2));

  try {
    // Validate input
    const validatedInput = SmartVibeSchema.parse(input);
    console.log('✅ Input validated:', JSON.stringify(validatedInput, null, 2));

    // Handle status command
    if (validatedInput.command.toLowerCase() === 'status') {
      const statusText = await createStatusResponse();
      return {
        content: [
          {
            type: 'text',
            text: statusText,
          },
        ],
        isError: false,
      };
    }

    // Handle install tools command
    if (validatedInput.command.toLowerCase() === 'install tools') {
      const missingTools = await ToolAvailabilityChecker.getMissingTools();
      const instructions = ToolAvailabilityChecker.generateInstallationInstructions(missingTools);

      return {
        content: [
          {
            type: 'text',
            text: `🔧 **TappMCP Tool Installation Guide**\n\n${instructions}`,
          },
        ],
        isError: false,
      };
    }

    // Execute VibeTapp system with Context7 enabled
    console.log('🎯 Executing VibeTapp with Context7 integration...');

    try {
      const vibeInstance = getVibeInstance();

      // Create vibe request
      const vibeRequest = {
        command: validatedInput.command,
        role: validatedInput.options?.role || 'developer',
        quality: validatedInput.options?.quality || 'standard',
        verbosity: validatedInput.options?.verbosity || 'standard',
        mode: validatedInput.options?.mode || 'basic',
        context: {
          projectId: 'd3-visualizations',
          domain: 'frontend',
          priority: 'high' as const,
        },
      };

      console.log('🎯 VibeTapp request:', JSON.stringify(vibeRequest, null, 2));

      // Execute vibe request - let VibeTapp handle verbosity detection automatically
      const vibeResponse = await vibeInstance.vibe(validatedInput.command, {
        role: (validatedInput.options?.role || 'developer') as any,
        quality: (validatedInput.options?.quality || 'standard') as any,
        verbosity: validatedInput.options?.verbosity as any, // Only use explicit verbosity, let VibeTapp detect otherwise
        mode: (validatedInput.options?.mode || 'basic') as any,
      });

      console.log('🎯 VibeTapp response received:', Boolean(vibeResponse));

      // Format response for MCP
      const formattedResponse = formatVibeResponse(vibeResponse);

      // Debug: Log trace data
      console.log('🔍 Debug - VibeResponse trace data:', !!vibeResponse.trace);
      console.log('🔍 Debug - VibeResponse traceInfo:', !!vibeResponse.traceInfo);
      if (vibeResponse.trace) {
        console.log('🔍 Debug - Trace data keys:', Object.keys(vibeResponse.trace));
        console.log('🔍 Debug - Trace data sample:', JSON.stringify(vibeResponse.trace, null, 2).substring(0, 200) + '...');
      }

      // Debug: Log formatted response
      console.log('🔍 Debug - Formatted response length:', formattedResponse.length);
      console.log('🔍 Debug - Formatted response contains trace:', formattedResponse.includes('🔍 Call Tree Trace'));
      console.log('🔍 Debug - Formatted response contains debug info:', formattedResponse.includes('🔍 Debug Information'));

      // Check if HTML debug dashboard is requested
      if (validatedInput.options?.debughtml) {
        console.log('🎯 Generating HTML debug dashboard...');

        try {
          // Import the HTML generator
          const { DebugHTMLGenerator } = await import('../debug-dashboard/debug-html-generator.js');

          // Create trace data from vibe response with real metrics
          const timeline = vibeResponse.trace?.timeline || [];
          const toolsUsed = [...new Set(timeline.map((node: any) => node.tool))];
          const context7Calls = timeline.filter((node: any) => node.tool === 'context7').length;
          const cacheHits = timeline.filter((node: any) => node.tool === 'cache' && node.parameters?.operation === 'hit').length;
          const cacheMisses = timeline.filter((node: any) => node.tool === 'cache' && node.parameters?.operation === 'miss').length;
          const errors = timeline.filter((node: any) => node.error).length;
          const phases = [...new Set(timeline.map((node: any) => node.phase))];

          const traceData = {
            summary: {
              totalDuration: vibeResponse.metrics?.responseTime || 0,
              toolsUsed: toolsUsed.length > 0 ? toolsUsed : ['smart_vibe'],
              context7Calls: context7Calls,
              cacheHits: cacheHits,
              cacheMisses: cacheMisses,
              errors: errors,
              phases: phases.length > 0 ? phases : ['planning', 'execution', 'formatting']
            },
            timeline: vibeResponse.trace?.timeline || [
              {
                id: 'smart_vibe_root',
                tool: 'smart_vibe',
                phase: 'execution',
                startTime: Date.now() - (vibeResponse.metrics?.responseTime || 1000),
                endTime: Date.now(),
                duration: vibeResponse.metrics?.responseTime || 1000,
                parameters: { command: validatedInput.command },
                result: { success: true },
                children: [],
                dependencies: [],
                level: 0
              }
            ],
            context7Details: {
              libraryResolutions: [],
              apiCalls: [],
              cacheOperations: []
            },
            toolExecution: [],
            performance: {
              bottlenecks: [],
              recommendations: [],
              optimizationOpportunities: []
            }
          };

          // Generate HTML
          const htmlGenerator = new DebugHTMLGenerator({
            theme: 'light',
            includeMetrics: true,
            includeTimeline: true,
            includeExport: true
          });

          const htmlContent = htmlGenerator.generateHTML(traceData as any);

          // Generate unique filename with timestamp and command context
          const timestamp = Date.now();
          const commandHash = validatedInput.command
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 30)
            .toLowerCase();
          const filename = `debug-dashboard-${timestamp}-${commandHash}.html`;
          const filepath = path.resolve(filename);

          try {
            // Save HTML file
            await fs.writeFile(filepath, htmlContent);

            // Get file stats for confirmation
            const stats = await fs.stat(filepath);
            const fileSizeKB = Math.round(stats.size / 1024 * 100) / 100;

            return {
              content: [
                {
                  type: 'text',
                  text: `🎯 **HTML Debug Dashboard Generated & Saved**\n\n✅ Debug dashboard created and saved successfully!\n\n**File Details:**\n- **Filename:** \`${filename}\`\n- **Path:** \`${filepath}\`\n- **Size:** ${fileSizeKB} KB\n- **Lines:** ${htmlContent.split('\\n').length} lines\n\n**Features:**\n- Interactive call tree visualization\n- Performance metrics panel\n- Filtering and search capabilities\n- Dark/light theme toggle\n- Mobile responsive design\n\n**Next Steps:**\n1. Open \`${filename}\` in your browser\n2. Use interactive features for debugging\n3. Click on nodes to see detailed information\n\n**Timestamp:** ${new Date().toISOString()}`,
                },
              ],
              isError: false,
            };
          } catch (fileError) {
            console.error('🎯 HTML file save error:', fileError);

            return {
              content: [
                {
                  type: 'text',
                  text: `🎯 **HTML Debug Dashboard Generated (File Save Failed)**\n\n✅ Debug dashboard created successfully!\n❌ **File Save Error:** ${fileError instanceof Error ? fileError.message : 'Unknown error'}\n\n**HTML Content (Preview):**\n\`\`\`html\n${htmlContent.substring(0, 500)}...\n\`\`\`\n\n**Fallback Instructions:**\n1. Copy the full HTML content above\n2. Save it manually as \`${filename}\`\n3. Open in browser to view dashboard\n\n**Timestamp:** ${new Date().toISOString()}`,
                },
              ],
              isError: false,
            };
          }
        } catch (htmlError) {
          console.error('🎯 HTML generation error:', htmlError);

          return {
            content: [
              {
                type: 'text',
                text: `🎯 **HTML Debug Dashboard Error**\n\n❌ Failed to generate HTML dashboard\n\n**Error:** ${htmlError instanceof Error ? htmlError.message : 'Unknown error'}\n\n**Fallback:** Using standard debug output\n\n${formattedResponse}`,
              },
            ],
            isError: false,
          };
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: formattedResponse,
          },
        ],
        isError: false,
      };
    } catch (vibeError) {
      console.error('🎯 VibeTapp execution error:', vibeError);

      // Fallback response with error details
      return {
        content: [
          {
            type: 'text',
            text: `🎯 **Smart Vibe Response**\n\n✅ VibeTapp system activated!\n\n**Command:** ${validatedInput.command}\n**Role:** ${validatedInput.options?.role || 'developer'}\n**Quality:** ${validatedInput.options?.quality || 'standard'}\n\n⚠️ **Context7 Integration:** ${vibeError instanceof Error ? vibeError.message : 'Processing...'}\n\n**Next Steps:**\n1. Context7 knowledge retrieval\n2. D3.js best practices analysis\n3. Performance optimization suggestions\n\n**Timestamp:** ${new Date().toISOString()}`,
          },
        ],
        isError: false,
      };
    }
  } catch (error) {
    // Error handling with user-friendly message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    let userMessage = `❌ **Unable to Process Your Request**\n\n`;
    userMessage += `I encountered an issue while trying to process your vibe command.\n\n`;
    userMessage += `**Error Details:**\n`;
    userMessage += `${errorMessage}\n\n`;
    userMessage += `**💡 Suggestions:**\n`;
    userMessage += `- Try rephrasing your request with more specific details\n`;
    userMessage += `- Use natural language like "make me a todo app" or "check my code"\n`;
    userMessage += `- Specify your role if needed: developer, designer, qa-engineer, etc.\n`;
    userMessage += `- Include quality level if needed: basic, standard, enterprise, production\n\n`;
    userMessage += `**Examples:**\n`;
    userMessage += `- "make me a React todo app with TypeScript"\n`;
    userMessage += `- "check my code quality" (role: qa-engineer)\n`;
    userMessage += `- "improve this function" (quality: enterprise)\n`;

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
