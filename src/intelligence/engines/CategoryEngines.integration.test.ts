/**
 * Integration Tests for Category Intelligence Engines
 *
 * Tests all category engines with real code analysis and generation,
 * verifying their specialized capabilities and integration patterns.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FrontendIntelligenceEngine } from './FrontendIntelligenceEngine.js';
import { BackendIntelligenceEngine } from './BackendIntelligenceEngine.js';
import { DatabaseIntelligenceEngine } from './DatabaseIntelligenceEngine.js';
import { DevOpsIntelligenceEngine } from './DevOpsIntelligenceEngine.js';
import { MobileIntelligenceEngine } from './MobileIntelligenceEngine.js';
import { GenericIntelligenceEngine } from './GenericIntelligenceEngine.js';
import { Context7Data, CodeAnalysis } from '../CategoryIntelligenceEngine.js';
import { CodeGenerationRequest } from '../UnifiedCodeIntelligenceEngine.js';

// Mock Context7 data for testing
const mockContext7Data: Context7Data = {
  insights: {
    patterns: ['modern development', 'component-based architecture', 'responsive design'],
    recommendations: ['use TypeScript', 'implement testing', 'follow accessibility guidelines'],
    qualityMetrics: { overall: 85, complexity: 5, maintainability: 8 },
  },
  projectContext: {
    name: 'test-project',
    type: 'web-application',
  },
  technologyInsights: {
    frameworks: ['React', 'Express', 'PostgreSQL'],
    libraries: ['lodash', 'axios', 'styled-components'],
    tools: ['webpack', 'babel', 'jest'],
  },
};

describe('Category Intelligence Engines Integration', () => {
  let frontendEngine: FrontendIntelligenceEngine;
  let backendEngine: BackendIntelligenceEngine;
  let databaseEngine: DatabaseIntelligenceEngine;
  let devopsEngine: DevOpsIntelligenceEngine;
  let mobileEngine: MobileIntelligenceEngine;
  let genericEngine: GenericIntelligenceEngine;

  beforeEach(() => {
    frontendEngine = new FrontendIntelligenceEngine();
    backendEngine = new BackendIntelligenceEngine();
    databaseEngine = new DatabaseIntelligenceEngine();
    devopsEngine = new DevOpsIntelligenceEngine();
    mobileEngine = new MobileIntelligenceEngine();
    genericEngine = new GenericIntelligenceEngine();
  });

  describe('FrontendIntelligenceEngine', () => {
    it('should analyze React component code correctly', async () => {
      const reactCode = `
import React, { useState } from 'react';

interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export const LoginForm: React.FC<Props> = ({ title, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Login form">
      <h1>{title}</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        aria-label="Email address"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        aria-label="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
};`;

      const analysis = await frontendEngine.analyzeCode(reactCode, 'React', mockContext7Data);

      expect(analysis).toBeDefined();
      expect(analysis.quality.score).toBeGreaterThan(70);
      expect(analysis.accessibility).toBeDefined();
      expect(analysis.accessibility!.score).toBeGreaterThan(60); // Has aria-labels
      expect(analysis.performance).toBeDefined();
      expect(analysis.security).toBeDefined();
    });

    it('should generate React component with best practices', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a user profile card component with avatar and user details',
        techStack: ['React', 'TypeScript'],
        role: 'developer',
      };

      const code = await frontendEngine.generateCode(request, mockContext7Data);

      expect(code).toBeDefined();
      expect(code).toContain('React');
      expect(code).toContain('interface');
      expect(code).toContain('export');
      expect(code.length).toBeGreaterThan(200);
    });

    it('should provide frontend-specific best practices', async () => {
      const practices = await frontendEngine.getBestPractices('React', mockContext7Data);

      expect(practices).toBeDefined();
      expect(practices.length).toBeGreaterThan(5);
      expect(practices.some((p: string) => p.toLowerCase().includes('accessibility'))).toBe(true);
      expect(practices.some((p: string) => p.toLowerCase().includes('performance'))).toBe(true);
    });

    it('should validate frontend code correctly', async () => {
      const invalidCode = `
const component = () => {
  // Missing accessibility attributes
  return <button onclick="handleClick()">Click me</button>;
};`;

      const validation = await frontendEngine.validateCode(invalidCode, 'React');

      expect(validation.valid).toBe(false);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('BackendIntelligenceEngine', () => {
    it('should analyze Node.js API code correctly', async () => {
      const apiCode = `
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const app = express();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
});

app.use(express.json());

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});`;

      const analysis = await backendEngine.analyzeCode(apiCode, 'Node.js', mockContext7Data);

      expect(analysis).toBeDefined();
      expect(analysis.quality.score).toBeGreaterThan(80);
      expect(analysis.security.score).toBeGreaterThan(75); // Has rate limiting, bcrypt, JWT
      expect(analysis.performance).toBeDefined();
      expect(analysis.scalability).toBeDefined();
    });

    it('should generate backend API with security best practices', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a REST API endpoint for user management with authentication',
        techStack: ['Node.js', 'Express'],
        role: 'developer',
      };

      const code = await backendEngine.generateCode(request, mockContext7Data);

      expect(code).toBeDefined();
      expect(code).toContain('express');
      expect(code).toContain('async');
      expect(code).toContain('try');
      expect(code).toContain('catch');
      expect(code.length).toBeGreaterThan(300);
    });

    it('should provide backend security recommendations', async () => {
      const practices = await backendEngine.getBestPractices('Node.js', mockContext7Data);

      expect(practices).toBeDefined();
      expect(practices.some((p: string) => p.toLowerCase().includes('security'))).toBe(true);
      expect(practices.some((p: string) => p.toLowerCase().includes('authentication'))).toBe(true);
      expect(practices.some((p: string) => p.toLowerCase().includes('validation'))).toBe(true);
    });
  });

  describe('DatabaseIntelligenceEngine', () => {
    it('should analyze SQL query code correctly', async () => {
      const sqlCode = `
-- Optimized user query with proper indexing
CREATE INDEX CONCURRENTLY idx_users_email_active
ON users(email) WHERE active = true;

-- Efficient user lookup with prepared statement
SELECT u.id, u.email, u.created_at, p.first_name, p.last_name
FROM users u
JOIN profiles p ON u.id = p.user_id
WHERE u.email = $1
  AND u.active = true
  AND u.email_verified = true
LIMIT 1;

-- Secure update with row-level validation
UPDATE users
SET last_login = NOW(), login_count = login_count + 1
WHERE id = $1
  AND active = true
  AND login_attempts < 5;`;

      const analysis = await databaseEngine.analyzeCode(sqlCode, 'PostgreSQL', mockContext7Data);

      expect(analysis).toBeDefined();
      expect(analysis.quality.score).toBeGreaterThan(75);
      expect(analysis.performance.score).toBeGreaterThan(70); // Has indexes
      expect(analysis.security.score).toBeGreaterThan(80); // Uses parameterized queries
    });

    it('should generate database schema with best practices', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a user management database schema with roles and permissions',
        techStack: ['PostgreSQL'],
        role: 'developer',
      };

      const code = await databaseEngine.generateCode(request, mockContext7Data);

      expect(code).toBeDefined();
      expect(code).toContain('CREATE TABLE');
      expect(code).toContain('PRIMARY KEY');
      expect(code).toContain('NOT NULL');
      expect(code.length).toBeGreaterThan(200);
    });

    it('should provide database optimization recommendations', async () => {
      const practices = await databaseEngine.getBestPractices('PostgreSQL', mockContext7Data);

      expect(practices).toBeDefined();
      expect(practices.some((p: string) => p.toLowerCase().includes('index'))).toBe(true);
      expect(practices.some((p: string) => p.toLowerCase().includes('performance'))).toBe(true);
      expect(practices.some((p: string) => p.toLowerCase().includes('security'))).toBe(true);
    });
  });

  describe('DevOpsIntelligenceEngine', () => {
    it('should analyze Dockerfile correctly', async () => {
      const dockerCode = `
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1
CMD ["npm", "start"]`;

      const analysis = await devopsEngine.analyzeCode(dockerCode, 'Docker', mockContext7Data);

      expect(analysis).toBeDefined();
      expect(analysis.quality.score).toBeGreaterThan(80);
      expect(analysis.security.score).toBeGreaterThan(85); // Non-root user, multi-stage
      expect(analysis.devops).toBeDefined();
      expect(analysis.devops!.overall).toBeGreaterThan(75);
    });

    it('should generate Kubernetes manifests with best practices', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create Kubernetes deployment for a web application with auto-scaling',
        techStack: ['Kubernetes'],
        role: 'operations',
      };

      const code = await devopsEngine.generateCode(request, mockContext7Data);

      expect(code).toBeDefined();
      expect(code).toContain('apiVersion');
      expect(code).toContain('kind: Deployment');
      expect(code).toContain('resources:');
      expect(code).toContain('securityContext');
      expect(code.length).toBeGreaterThan(500);
    });

    it('should provide DevOps security recommendations', async () => {
      const practices = await devopsEngine.getBestPractices('Docker', mockContext7Data);

      expect(practices).toBeDefined();
      expect(practices.some((p: string) => p.toLowerCase().includes('security'))).toBe(true);
      expect(practices.some((p: string) => p.toLowerCase().includes('multi-stage'))).toBe(true);
      expect(practices.some((p: string) => p.toLowerCase().includes('health'))).toBe(true);
    });
  });

  describe('MobileIntelligenceEngine', () => {
    it('should analyze React Native code correctly', async () => {
      const mobileCode = `
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Network request with error handling
      const response = await fetch('/api/user/profile');
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text
          style={styles.title}
          accessible={true}
          accessibilityLabel="User profile title"
          accessibilityRole="header"
        >
          Profile
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={fetchUserProfile}
          accessible={true}
          accessibilityLabel="Refresh profile"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    ...Platform.select({
      ios: { fontFamily: 'SF Pro Display' },
      android: { fontFamily: 'Roboto' },
    }),
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44, // Minimum touch target
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});`;

      const analysis = await mobileEngine.analyzeCode(mobileCode, 'React Native', mockContext7Data);

      expect(analysis).toBeDefined();
      expect(analysis.quality.score).toBeGreaterThan(80);
      expect(analysis.mobile).toBeDefined();
      expect(analysis.mobile!.overall).toBeGreaterThan(75);
    });

    it('should generate mobile component with accessibility', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a mobile settings screen with toggle switches and navigation',
        techStack: ['React Native'],
        role: 'developer',
      };

      const code = await mobileEngine.generateCode(request, mockContext7Data);

      expect(code).toBeDefined();
      expect(code).toContain('SafeAreaView');
      expect(code).toContain('accessible');
      expect(code).toContain('TouchableOpacity');
      expect(code).toContain('StyleSheet');
      expect(code.length).toBeGreaterThan(400);
    });

    it('should provide mobile-specific best practices', async () => {
      const practices = await mobileEngine.getBestPractices('React Native', mockContext7Data);

      expect(practices).toBeDefined();
      expect(practices.some((p: string) => p.toLowerCase().includes('accessibility'))).toBe(true);
      expect(practices.some((p: string) => p.toLowerCase().includes('performance'))).toBe(true);
      expect(practices.some((p: string) => p.toLowerCase().includes('responsive'))).toBe(true);
    });
  });

  describe('GenericIntelligenceEngine', () => {
    it('should analyze general code correctly', async () => {
      const genericCode = `
class DataProcessor {
  private data: any[];

  constructor(initialData: any[] = []) {
    this.data = initialData;
  }

  public process(filterFn: (item: any) => boolean): any[] {
    try {
      return this.data
        .filter(filterFn)
        .map(this.transformItem)
        .sort(this.compareItems);
    } catch (error) {
      console.error('Processing failed:', error);
      return [];
    }
  }

  private transformItem(item: any): any {
    return { ...item, processed: true, timestamp: Date.now() };
  }

  private compareItems(a: any, b: any): number {
    return a.timestamp - b.timestamp;
  }
}`;

      const analysis = await genericEngine.analyzeCode(genericCode, 'TypeScript', mockContext7Data);

      expect(analysis).toBeDefined();
      expect(analysis.quality.score).toBeGreaterThan(70);
      expect(analysis.maintainability.score).toBeGreaterThan(70);
      expect(analysis.performance).toBeDefined();
      expect(analysis.security).toBeDefined();
    });

    it('should generate generic utility code', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a utility class for data validation and transformation',
        techStack: ['TypeScript'],
        role: 'developer',
      };

      const code = await genericEngine.generateCode(request, mockContext7Data);

      expect(code).toBeDefined();
      expect(code).toContain('class');
      expect(code).toContain('public');
      expect(code).toContain('private');
      expect(code.length).toBeGreaterThan(200);
    });

    it('should provide general development best practices', async () => {
      const practices = await genericEngine.getBestPractices('TypeScript', mockContext7Data);

      expect(practices).toBeDefined();
      expect(practices.some((p: string) => p.toLowerCase().includes('type'))).toBe(true);
      expect(practices.some((p: string) => p.toLowerCase().includes('test'))).toBe(true);
      expect(practices.some((p: string) => p.toLowerCase().includes('error'))).toBe(true);
    });
  });

  describe('Cross-Engine Integration', () => {
    it('should maintain consistent quality scoring across engines', async () => {
      const testCode = `
const testFunction = () => {
  console.log('Hello World');
};`;

      const analyses = await Promise.all([
        frontendEngine.analyzeCode(testCode, 'JavaScript', mockContext7Data),
        backendEngine.analyzeCode(testCode, 'JavaScript', mockContext7Data),
        genericEngine.analyzeCode(testCode, 'JavaScript', mockContext7Data),
      ]);

      analyses.forEach(analysis => {
        expect(analysis.quality.score).toBeGreaterThan(0);
        expect(analysis.quality.score).toBeLessThanOrEqual(100);
        expect(analysis.maintainability).toBeDefined();
        expect(analysis.performance).toBeDefined();
        expect(analysis.security).toBeDefined();
      });
    });

    it('should handle Context7 integration consistently', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a simple function',
        techStack: ['JavaScript'],
      };

      const codes = await Promise.all([
        frontendEngine.generateCode(request, mockContext7Data),
        backendEngine.generateCode(request, mockContext7Data),
        genericEngine.generateCode(request, mockContext7Data),
      ]);

      codes.forEach(code => {
        expect(code).toBeDefined();
        expect(typeof code).toBe('string');
        expect(code.length).toBeGreaterThan(10);
      });
    });

    it('should validate code consistently across engines', async () => {
      const badCode = `function() { var x = 1; }`;

      const validations = await Promise.all([
        frontendEngine.validateCode(badCode, 'JavaScript'),
        backendEngine.validateCode(badCode, 'JavaScript'),
        genericEngine.validateCode(badCode, 'JavaScript'),
      ]);

      validations.forEach(validation => {
        expect(validation).toBeDefined();
        expect(typeof validation.valid).toBe('boolean');
        expect(Array.isArray(validation.errors)).toBe(true);
        expect(Array.isArray(validation.warnings)).toBe(true);
        expect(Array.isArray(validation.suggestions)).toBe(true);
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent requests efficiently', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a test component',
        techStack: ['React'],
      };

      const startTime = Date.now();

      // Run 10 concurrent requests
      const promises = Array(10)
        .fill(null)
        .map(() => frontendEngine.generateCode(request, mockContext7Data));

      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds

      results.forEach(code => {
        expect(code).toBeDefined();
        expect(typeof code).toBe('string');
      });
    });

    it('should handle large code analysis efficiently', async () => {
      const largeCode = `
// Large code sample
${Array(100)
  .fill(null)
  .map(
    (_, i) => `
const function${i} = () => {
  const data = { id: ${i}, value: 'test${i}' };
  return data;
};`
  )
  .join('\n')}

class LargeClass {
  ${Array(50)
    .fill(null)
    .map(
      (_, i) => `
  method${i}() {
    return this.function${i}();
  }`
    )
    .join('\n')}
}`;

      const startTime = Date.now();
      const analysis = await genericEngine.analyzeCode(largeCode, 'JavaScript', mockContext7Data);
      const endTime = Date.now();

      expect(analysis).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(analysis.quality.score).toBeGreaterThan(0);
    });
  });

  describe('Error Resilience', () => {
    it('should handle malformed code gracefully', async () => {
      const malformedCode = `
function broken( {
  var x = ;
  return x +
}`;

      const analyses = await Promise.all([
        frontendEngine.analyzeCode(malformedCode, 'JavaScript', mockContext7Data).catch(() => null),
        backendEngine.analyzeCode(malformedCode, 'JavaScript', mockContext7Data).catch(() => null),
        genericEngine.analyzeCode(malformedCode, 'JavaScript', mockContext7Data).catch(() => null),
      ]);

      // Should either return an analysis with low scores or handle gracefully
      analyses.forEach(analysis => {
        if (analysis) {
          expect(analysis.quality.score).toBeLessThan(50);
        }
      });
    });

    it('should handle invalid technology gracefully', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create something',
        techStack: ['NonExistentTechnology'],
      };

      const code = await genericEngine.generateCode(request, mockContext7Data);

      expect(code).toBeDefined();
      expect(typeof code).toBe('string');
      expect(code.length).toBeGreaterThan(0);
    });
  });
});
