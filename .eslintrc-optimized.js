module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',
    
    // TypeScript specific - optimized for Node.js server projects
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    '@typescript-eslint/explicit-function-return-type': 'off', // Too verbose for server code
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Too verbose for server code
    '@typescript-eslint/no-explicit-any': 'warn', // Warn instead of error for flexibility
    '@typescript-eslint/no-non-null-assertion': 'warn', // Warn instead of error for flexibility
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': ['error', { 
      ignoreConditionalTests: true,
      ignoreMixedLogicalExpressions: true,
      ignoreTernaryTests: true
    }],
    '@typescript-eslint/no-unnecessary-condition': 'warn', // Can have false positives
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn', // Can have false positives
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    
    // Industry standard complexity rules - optimized for server projects
    'complexity': ['warn', 20], // Industry standard: 20 (was 15) - more lenient for server logic
    'max-lines-per-function': ['warn', { 
      max: 200, // Industry standard: 200 (was 150) - more lenient for server functions
      skipBlankLines: true, 
      skipComments: true 
    }],
    'max-lines': ['warn', { 
      max: 800, // Industry standard: 800 (was 500) - more lenient for server files
      skipBlankLines: true, 
      skipComments: true 
    }],
    'max-params': ['warn', 8], // Industry standard: 8 (was 6) - more lenient for server APIs
    'max-depth': ['warn', 5], // Industry standard: 5 (was 4) - more lenient for server logic
    'max-statements': ['warn', 50], // Industry standard: 50 (was 30) - more lenient for server functions
    
    // General rules - optimized for server projects
    'no-console': 'warn', // Warn instead of error for server logging
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-expressions': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-return': 'error',
    'prefer-template': 'error',
    'object-shorthand': 'error',
    'prefer-destructuring': ['error', { object: true, array: false }],
    
    // Server-specific optimizations
    'no-process-exit': 'off', // Allow process.exit in server code
    'no-process-env': 'off', // Allow process.env in server code
    'no-sync': 'off', // Allow sync operations in server code when needed
    
    // Disable rules that commonly cause false positives in server projects
    'no-constant-condition': 'off', // Can flag valid server logic
    'no-empty': 'off', // Can flag valid empty catch blocks
    'no-useless-catch': 'off', // Can flag valid error handling patterns
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    '*.js',
    '*.d.ts',
    '*.config.js',
    '*.config.ts',
  ],
  overrides: [
    {
      // Test files - more lenient rules
      files: ['**/*.test.ts', '**/*.spec.ts', '**/test/**/*.ts'],
      rules: {
        'max-lines-per-function': ['warn', { max: 300 }], // More lenient for tests
        'max-lines': ['warn', { max: 1000 }], // More lenient for test files
        'complexity': ['warn', 30], // More lenient for test logic
        'max-statements': ['warn', 100], // More lenient for test setup
        'no-console': 'off', // Allow console in tests
        '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
      },
    },
    {
      // Configuration files - more lenient rules
      files: ['*.config.js', '*.config.ts', '*.config.*'],
      rules: {
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'complexity': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
