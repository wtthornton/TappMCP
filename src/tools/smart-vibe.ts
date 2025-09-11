/**
 * Smart Vibe Tool - Full VibeTapp Integration for MCP
 *
 * Provides the complete VibeTapp natural language interface
 * as an MCP tool for Cursor integration.
 */

import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { VibeTapp } from '../vibe/core/VibeTapp.js';

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
    })
    .optional()
    .describe('Optional configuration options'),
});

export type SmartVibeInput = z.infer<typeof SmartVibeSchema>;

// Tool definition for MCP server
export const smartVibeTool: Tool = {
  name: 'smart_vibe',
  description:
    'Natural language interface for TappMCP - full vibe coder experience with context management, role switching, and rich responses',
  inputSchema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description:
          'Natural language command (e.g., "make me a todo app", "check my code", "improve this function")',
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
    formatted += vibeResponse.message + '\n\n';
  }

  // Details section
  if (vibeResponse.details && vibeResponse.details.data) {
    const data = vibeResponse.details.data;

    if (data.projectStructure) {
      formatted += '**📁 Project Structure:**\n';
      formatted += '```json\n' + JSON.stringify(data.projectStructure, null, 2) + '\n```\n\n';
    }

    if (data.qualityScorecard) {
      formatted += '**📊 Quality Scorecard:**\n';
      formatted += '```json\n' + JSON.stringify(data.qualityScorecard, null, 2) + '\n```\n\n';
    }

    if (data.generatedCode) {
      formatted += '**💻 Generated Code:**\n';
      formatted += '```typescript\n' + data.generatedCode + '\n```\n\n';
    }

    if (data.projectPlan) {
      formatted += '**📋 Project Plan:**\n';
      formatted += '```json\n' + JSON.stringify(data.projectPlan, null, 2) + '\n```\n\n';
    }

    if (data.techStack) {
      formatted += '**🛠️ Tech Stack:**\n';
      formatted += data.techStack.join(', ') + '\n\n';
    }

    if (data.targetRole) {
      formatted += '**👤 Target Role:**\n';
      formatted += data.targetRole + '\n\n';
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

  return formatted.trim();
}

/**
 * Handle smart_vibe tool execution
 */
export async function handleSmartVibe(
  input: SmartVibeInput
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  try {
    // Validate input
    const validatedInput = SmartVibeSchema.parse(input);

    // Get VibeTapp instance
    const vibe = getVibeInstance();

    // Apply configuration options if provided
    if (validatedInput.options) {
      const { role, quality, verbosity, mode } = validatedInput.options;

      if (role) {
        vibe.setRole(role as any);
      }
      if (quality) {
        vibe.setQuality(quality as any);
      }
      if (verbosity) {
        vibe.setVerbosity(verbosity as any);
      }
      if (mode) {
        vibe.setMode(mode as any);
      }
    }

    // Execute vibe command
    const vibeResponse = await vibe.vibe(validatedInput.command, validatedInput.options as any);

    // Format response for MCP/Cursor
    const formattedResponse = formatVibeResponse(vibeResponse);

    // Return MCP-compatible response
    return {
      content: [
        {
          type: 'text',
          text: formattedResponse,
        },
      ],
      isError: !vibeResponse.success,
    };
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
