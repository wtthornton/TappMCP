/**
 * Smart Vibe Tool Tests
 *
 * Comprehensive test suite for the smart_vibe MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSmartVibe, SmartVibeSchema } from './smart-vibe.js';

// Mock VibeTapp
const mockVibeInstance = {
  vibe: vi.fn(),
  setRole: vi.fn(),
  setQuality: vi.fn(),
  setVerbosity: vi.fn(),
  setMode: vi.fn(),
  getContext: vi.fn(),
};

// Mock the VibeTapp class
const MockVibeTapp = vi.fn().mockImplementation(() => mockVibeInstance);

vi.mock('../../vibe/core/VibeTapp.js', () => ({
  VibeTapp: MockVibeTapp,
}));

describe('Smart Vibe Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should validate correct input schema', () => {
      const validInput = {
        command: 'make me a todo app',
        options: {
          role: 'developer',
          quality: 'standard',
          verbosity: 'detailed',
          mode: 'advanced',
        },
      };

      expect(() => SmartVibeSchema.parse(validInput)).not.toThrow();
    });

    it('should require command field', () => {
      const invalidInput = {
        options: { role: 'developer' },
      };

      expect(() => SmartVibeSchema.parse(invalidInput)).toThrow();
    });

    it('should validate role enum values', () => {
      const validRoles = [
        'developer',
        'designer',
        'qa-engineer',
        'operations-engineer',
        'product-strategist',
      ];

      validRoles.forEach(role => {
        const input = {
          command: 'test command',
          options: { role },
        };
        expect(() => SmartVibeSchema.parse(input)).not.toThrow();
      });
    });

    it('should validate quality enum values', () => {
      const validQualities = ['basic', 'standard', 'enterprise', 'production'];

      validQualities.forEach(quality => {
        const input = {
          command: 'test command',
          options: { quality },
        };
        expect(() => SmartVibeSchema.parse(input)).not.toThrow();
      });
    });
  });

  describe('VibeTapp Integration', () => {
    it('should call vibe method with correct parameters', async () => {
      const mockResponse = {
        success: true,
        message: '🎉 Awesome! Your project is ready!',
        details: {
          type: 'project',
          data: {
            projectName: 'todo-app',
            techStack: ['react', 'typescript'],
          },
        },
        nextSteps: ['Navigate to your project directory'],
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      const input = {
        command: 'make me a todo app',
        options: { role: 'developer' },
      };

      const result = await handleSmartVibe(input);

      expect(mockVibeInstance.vibe).toHaveBeenCalledWith('make me a todo app', {
        role: 'developer',
      });
      expect(result.content[0].text).toContain('🎉 Awesome! Your project is ready!');
      expect(result.isError).toBeFalsy();
    });

    it('should apply configuration options', async () => {
      const mockResponse = {
        success: true,
        message: 'Success',
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      const input = {
        command: 'test command',
        options: {
          role: 'designer',
          quality: 'enterprise',
          verbosity: 'detailed',
          mode: 'power',
        },
      };

      await handleSmartVibe(input);

      expect(mockVibeInstance.setRole).toHaveBeenCalledWith('designer');
      expect(mockVibeInstance.setQuality).toHaveBeenCalledWith('enterprise');
      expect(mockVibeInstance.setVerbosity).toHaveBeenCalledWith('detailed');
      expect(mockVibeInstance.setMode).toHaveBeenCalledWith('power');
    });

    it('should handle VibeTapp errors gracefully', async () => {
      const error = new Error('VibeTapp error');
      mockVibeInstance.vibe.mockRejectedValue(error);

      const input = {
        command: 'invalid command',
      };

      const result = await handleSmartVibe(input);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ **Unable to Process Your Request**');
      expect(result.content[0].text).toContain('VibeTapp error');
    });
  });

  describe('Response Formatting', () => {
    it('should format success response with project details', async () => {
      const mockResponse = {
        success: true,
        message: '🎉 Project created!',
        details: {
          data: {
            projectStructure: { src: 'source files' },
            techStack: ['react', 'typescript'],
            targetRole: 'developer',
          },
        },
        nextSteps: ['Install dependencies', 'Start development'],
        learning: {
          tips: ['Use TypeScript for better code quality'],
        },
        metrics: {
          responseTime: 1500,
        },
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      const result = await handleSmartVibe({ command: 'create project' });

      expect(result.content[0].text).toContain('🎉 Project created!');
      expect(result.content[0].text).toContain('**📁 Project Structure:**');
      expect(result.content[0].text).toContain('**🛠️ Tech Stack:**');
      expect(result.content[0].text).toContain('**🚀 Next Steps:**');
      expect(result.content[0].text).toContain('**💡 Tips:**');
      expect(result.content[0].text).toContain('**⏱️ Response Time:**');
    });

    it('should format response with generated code', async () => {
      const mockResponse = {
        success: true,
        message: 'Code generated!',
        details: {
          data: {
            generatedCode: 'function hello() { return "world"; }',
          },
        },
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      const result = await handleSmartVibe({ command: 'write a function' });

      expect(result.content[0].text).toContain('**💻 Generated Code:**');
      expect(result.content[0].text).toContain('```typescript');
      expect(result.content[0].text).toContain('function hello() { return "world"; }');
    });

    it('should format response with quality scorecard', async () => {
      const mockResponse = {
        success: true,
        message: 'Quality check complete!',
        details: {
          data: {
            qualityScorecard: {
              testCoverage: 85,
              securityScore: 90,
              complexityScore: 70,
            },
          },
        },
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      const result = await handleSmartVibe({ command: 'check quality' });

      expect(result.content[0].text).toContain('**📊 Quality Scorecard:**');
      expect(result.content[0].text).toContain('```json');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const input = {
        command: '', // Invalid empty command
      };

      const result = await handleSmartVibe(input);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ **Unable to Process Your Request**');
    });

    it('should provide helpful error suggestions', async () => {
      const error = new Error('Intent parsing failed');
      mockVibeInstance.vibe.mockRejectedValue(error);

      const result = await handleSmartVibe({ command: 'unclear request' });

      expect(result.content[0].text).toContain('**💡 Suggestions:**');
      expect(result.content[0].text).toContain('Try rephrasing your request');
      expect(result.content[0].text).toContain('**Examples:**');
    });
  });

  describe('Context Management', () => {
    it('should maintain context across calls', async () => {
      const mockResponse = {
        success: true,
        message: 'Success',
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      // First call with role
      await handleSmartVibe({
        command: 'create project',
        options: { role: 'developer' },
      });

      // Second call without role (should maintain context)
      await handleSmartVibe({
        command: 'write code',
      });

      expect(mockVibeInstance.setRole).toHaveBeenCalledWith('developer');
      expect(mockVibeInstance.vibe).toHaveBeenCalledTimes(2);
    });
  });

  describe('MCP Protocol Compliance', () => {
    it('should return MCP-compatible response format', async () => {
      const mockResponse = {
        success: true,
        message: 'Test message',
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      const result = await handleSmartVibe({ command: 'test' });

      expect(result).toHaveProperty('content');
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should set isError flag correctly', async () => {
      const mockResponse = {
        success: false,
        message: 'Error message',
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      const result = await handleSmartVibe({ command: 'test' });

      expect(result.isError).toBe(true);
    });
  });
});
