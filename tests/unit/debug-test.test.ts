import { describe, it, expect } from 'vitest';

describe('Debug Test', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should import smart_finish', async () => {
    const { handleSmartFinish } = await import('../../src/tools/smart-finish.js');
    expect(handleSmartFinish).toBeDefined();
  });

  it('should call handleSmartFinish with minimal input', async () => {
    const { handleSmartFinish } = await import('../../src/tools/smart-finish.js');

    const input = {
      projectId: 'proj_test_123',
      codeIds: ['code_123', 'code_456'],
    };

    try {
      const result = await handleSmartFinish(input);
      console.log('Result:', result);
      expect(result.success).toBe(true);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });
});
