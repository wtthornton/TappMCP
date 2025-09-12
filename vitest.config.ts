import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/index.ts',
        'dist/**',
        'node_modules/**',
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
    testTimeout: 15000, // Increased from 10s to 15s for integration tests
    hookTimeout: 15000, // Increased from 10s to 15s for setup/teardown
    // Increase timeout for integration tests
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
