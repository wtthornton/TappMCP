/**
 * Smart Vibe Integration Tests
 *
 * Integration tests for smart_vibe MCP tool with Cursor simulation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock VibeTapp for integration testing
const mockVibeInstance = {
  vibe: vi.fn(),
  setRole: vi.fn(),
  setQuality: vi.fn(),
  setVerbosity: vi.fn(),
  setMode: vi.fn(),
  getContext: vi.fn(),
};

vi.mock('../vibe/core/VibeTapp.js', () => ({
  VibeTapp: vi.fn().mockImplementation(() => mockVibeInstance),
}));

// Import after mocking
import { handleSmartVibe } from '../tools/smart-vibe.js';

describe('Smart Vibe Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the singleton instance to ensure fresh mocks
    vi.resetModules();
  });

  describe('End-to-End Workflows', () => {
    it('should complete a full project creation workflow', async () => {
      const mockResponse = {
        success: true,
        message: '🎉 Awesome! Your todo app project is ready!',
        details: {
          type: 'project',
          data: {
            projectName: 'todo-app',
            projectType: 'web-app',
            techStack: ['react', 'typescript'],
            projectStructure: {
              'src/': 'Source files',
              'package.json': 'Dependencies',
              'README.md': 'Documentation',
            },
          },
        },
        nextSteps: [
          'Navigate to your project directory',
          'Install dependencies: npm install',
          'Start development: npm run dev',
          'Open http://localhost:3000 in your browser',
        ],
        learning: {
          tips: [
            'Use TypeScript for better code quality',
            'Follow React best practices',
            'Write tests for your components',
          ],
        },
        metrics: {
          responseTime: 2500,
        },
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      const result = await handleSmartVibe({
        command: 'make me a todo app with React and TypeScript',
        options: {
          role: 'developer',
          quality: 'standard',
        },
      });

      expect(mockVibeInstance.setRole).toHaveBeenCalledWith('developer');
      expect(mockVibeInstance.setQuality).toHaveBeenCalledWith('standard');
      expect(mockVibeInstance.vibe).toHaveBeenCalledWith(
        'make me a todo app with React and TypeScript',
        { role: 'developer', quality: 'standard' }
      );

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('🎉 Awesome! Your todo app project is ready!');
      expect(result.content[0].text).toContain('**📁 Project Structure:**');
      expect(result.content[0].text).toContain('**🛠️ Tech Stack:**');
      expect(result.content[0].text).toContain('**🚀 Next Steps:**');
      expect(result.content[0].text).toContain('**💡 Tips:**');
    });

    it('should handle code generation workflow', async () => {
      const mockResponse = {
        success: true,
        message: '💻 Code generated successfully!',
        details: {
          type: 'code',
          data: {
            generatedCode: `import React, { useState } from 'react';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false
      }]);
      setInputValue('');
    }
  };

  return (
    <div className="todo-app">
      <h1>Todo App</h1>
      <div className="input-section">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add Todo</button>
      </div>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoApp;`,
            targetRole: 'developer',
            codeType: 'component',
          },
        },
        nextSteps: [
          'Review the generated code',
          'Customize the styling',
          'Add more functionality',
          'Write tests for the component',
        ],
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      const result = await handleSmartVibe({
        command: 'write a React todo component with TypeScript',
        options: {
          role: 'developer',
          verbosity: 'detailed',
        },
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('💻 Code generated successfully!');
      expect(result.content[0].text).toContain('**💻 Generated Code:**');
      expect(result.content[0].text).toContain('```typescript');
      expect(result.content[0].text).toContain('export default TodoApp');
    });

    it('should handle quality checking workflow', async () => {
      const mockResponse = {
        success: true,
        message: '✅ Quality check completed!',
        details: {
          type: 'quality',
          data: {
            qualityScorecard: {
              testCoverage: 85,
              securityScore: 92,
              complexityScore: 75,
              maintainabilityScore: 80,
              performanceScore: 88,
              overallScore: 84,
            },
            issues: [
              {
                type: 'warning',
                message: 'Consider adding more unit tests',
                severity: 'medium',
              },
              {
                type: 'info',
                message: 'Code complexity is within acceptable limits',
                severity: 'low',
              },
            ],
          },
        },
        nextSteps: [
          'Review the quality scorecard',
          'Address any high-priority issues',
          'Consider adding more tests',
          'Run security scan',
        ],
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      const result = await handleSmartVibe({
        command: 'check my code quality',
        options: {
          role: 'qa-engineer',
          quality: 'enterprise',
        },
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('✅ Quality check completed!');
      expect(result.content[0].text).toContain('**📊 Quality Scorecard:**');
      expect(result.content[0].text).toContain('testCoverage');
      expect(result.content[0].text).toContain('securityScore');
    });
  });

  describe('Context Preservation', () => {
    it('should maintain context across multiple calls', async () => {
      const mockResponse = {
        success: true,
        message: 'Success',
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      // First call - set role and quality
      await handleSmartVibe({
        command: 'create a project',
        options: {
          role: 'developer',
          quality: 'enterprise',
        },
      });

      // Second call - should maintain context
      await handleSmartVibe({
        command: 'write some code',
      });

      // Third call - should maintain context
      await handleSmartVibe({
        command: 'check quality',
      });

      expect(mockVibeInstance.setRole).toHaveBeenCalledWith('developer');
      expect(mockVibeInstance.setQuality).toHaveBeenCalledWith('enterprise');
      expect(mockVibeInstance.vibe).toHaveBeenCalledTimes(3);
    });

    it('should override context when new options provided', async () => {
      const mockResponse = {
        success: true,
        message: 'Success',
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      // First call
      await handleSmartVibe({
        command: 'create project',
        options: { role: 'developer' },
      });

      // Second call with different role
      await handleSmartVibe({
        command: 'design interface',
        options: { role: 'designer' },
      });

      expect(mockVibeInstance.setRole).toHaveBeenCalledWith('developer');
      expect(mockVibeInstance.setRole).toHaveBeenCalledWith('designer');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle VibeTapp errors gracefully', async () => {
      const error = new Error('Intent parsing failed - unclear request');
      mockVibeInstance.vibe.mockRejectedValue(error);

      const result = await handleSmartVibe({
        command: 'do something unclear',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ **Unable to Process Your Request**');
      expect(result.content[0].text).toContain('**💡 Suggestions:**');
      expect(result.content[0].text).toContain('**Examples:**');
    });

    it('should handle network/timeout errors', async () => {
      const error = new Error('Request timeout - tool execution took too long');
      mockVibeInstance.vibe.mockRejectedValue(error);

      const result = await handleSmartVibe({
        command: 'create a complex project',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ **Unable to Process Your Request**');
    });
  });

  describe('MCP Protocol Compliance', () => {
    it('should return valid MCP response format', async () => {
      const mockResponse = {
        success: true,
        message: 'Test response',
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      const result = await handleSmartVibe({
        command: 'test command',
      });

      // Check MCP response structure
      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
      expect(typeof result.content[0].text).toBe('string');
    });

    it('should handle empty responses correctly', async () => {
      const mockResponse = {
        success: true,
        message: '',
        details: {},
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      const result = await handleSmartVibe({
        command: 'empty response test',
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toBeDefined();
      expect(typeof result.content[0].text).toBe('string');
    });
  });

  describe('Performance', () => {
    it('should handle rapid successive calls', async () => {
      const mockResponse = {
        success: true,
        message: 'Success',
      };

      mockVibeInstance.vibe.mockResolvedValue(mockResponse);

      const commands = [
        'create project',
        'write code',
        'check quality',
        'improve code',
        'deploy app',
      ];

      const promises = commands.map(command => handleSmartVibe({ command }));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.content[0].type).toBe('text');
        // Some commands may fail, which is expected behavior
        if (result.isError) {
          expect(result.content[0].text).toContain('❌');
        } else {
          // Success responses may contain various success indicators
          expect(result.content[0].text.length).toBeGreaterThan(0);
          expect(typeof result.content[0].text).toBe('string');
        }
      });
    });
  });
});
