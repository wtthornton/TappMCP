/**
 * Quality Assurance Engine Tests
 *
 * Tests the comprehensive quality scoring system with industry benchmarks,
 * compliance checking, trend analysis, and category-specific metrics.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QualityAssuranceEngine } from './QualityAssuranceEngine.js';

describe('QualityAssuranceEngine', () => {
  let qaEngine: QualityAssuranceEngine;

  beforeEach(() => {
    qaEngine = new QualityAssuranceEngine();
  });

  describe('Code Quality Analysis', () => {
    it('should analyze high-quality TypeScript React component', async () => {
      const highQualityCode = `
import React, { useState, useCallback, useMemo } from 'react';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
  className?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * UserProfile component displays and allows editing of user information
 * @param userId - The ID of the user to display
 * @param onUpdate - Callback when user is updated
 * @param className - Additional CSS class names
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onUpdate,
  className = '',
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = useCallback(async (updatedUser: User) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(\`/api/users/\${updatedUser.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error(\`Failed to update user: \${response.statusText}\`);
      }

      const user = await response.json();
      setUser(user);
      onUpdate?.(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [onUpdate]);

  const displayName = useMemo(() => {
    return user?.name || 'Unknown User';
  }, [user?.name]);

  if (error) {
    return (
      <div
        className={\`error-container \${className}\`}
        role="alert"
        aria-live="polite"
      >
        Error: {error}
      </div>
    );
  }

  return (
    <div
      className={\`user-profile \${className}\`}
      data-testid="user-profile"
    >
      <h2>{displayName}</h2>
      {user && (
        <>
          <p>Email: {user.email}</p>
          {user.avatar && (
            <img
              src={user.avatar}
              alt={\`\${user.name}'s avatar\`}
              loading="lazy"
            />
          )}
        </>
      )}
      {isLoading && <p aria-live="polite">Loading...</p>}
    </div>
  );
};`;

      const result = await qaEngine.analyze(highQualityCode, 'frontend');

      expect(result.overall).toBeGreaterThan(85);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown!.maintainability.score).toBeGreaterThan(80);
      expect(result.breakdown!.security.score).toBeGreaterThan(75);
      expect(result.grade).toBe('A');
      expect(result.benchmark).toBeDefined();
      expect(result.compliance).toBeDefined();
    });

    it('should analyze low-quality code correctly', async () => {
      const lowQualityCode = `
var x;
function bad() {
  x = document.getElementById('thing').innerHTML;
  eval(x);
  for (i = 0; i < 1000000; i++) {
    console.log(i);
  }
}
setTimeout(function() { bad(); }, 1);`;

      const result = await qaEngine.analyze(lowQualityCode, 'frontend');

      expect(result.overall).toBeLessThan(50);
      expect(result.breakdown!.security.score).toBeLessThan(30); // eval usage
      expect(result.breakdown!.performance.score).toBeLessThan(40); // inefficient loop
      expect(result.grade).toMatch(/[D-F]/);
      expect(result.recommendations).toContain(expect.stringMatching(/security|eval|performance/i));
    });

    it('should provide category-specific analysis for backend code', async () => {
      const backendCode = `
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const app = express();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts',
});

app.use(express.json({ limit: '10mb' }));

app.post('/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});`;

      const result = await qaEngine.analyze(backendCode, 'backend');

      expect(result.overall).toBeGreaterThan(75);
      expect(result.breakdown!.security.score).toBeGreaterThan(80); // Good security practices
      expect(result.breakdown!.scalability?.score).toBeGreaterThan(70); // Rate limiting
      expect(result.benchmark!.category).toBe('backend');
    });

    it('should analyze mobile code with mobile-specific criteria', async () => {
      const mobileCode = `
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';

export const MobileComponent: React.FC = () => {
  const [count, setCount] = useState(0);

  const handlePress = () => {
    setCount(prev => prev + 1);
    // Haptic feedback would be good here
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text
          style={styles.text}
          accessible={true}
          accessibilityLabel={\`Count is \${count}\`}
        >
          Count: {count}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          accessible={true}
          accessibilityRole="button"
          accessibilityHint="Tap to increment counter"
        >
          <Text style={styles.buttonText}>Increment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44, // Proper touch target size
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});`;

      const result = await qaEngine.analyze(mobileCode, 'mobile');

      expect(result.overall).toBeGreaterThan(80);
      expect(result.breakdown!.accessibility?.score).toBeGreaterThan(85); // Good accessibility
      expect(result.breakdown!.usability?.score).toBeGreaterThan(80); // SafeAreaView, proper touch targets
    });
  });

  describe('Industry Benchmarks', () => {
    it('should provide accurate frontend benchmarks', async () => {
      const code = `const Component = () => <div>Hello</div>;`;

      const result = await qaEngine.analyze(code, 'frontend');

      expect(result.benchmark).toBeDefined();
      expect(result.benchmark!.category).toBe('frontend');
      expect(result.benchmark!.industryAverage).toBeGreaterThan(60);
      expect(result.benchmark!.topPercentile).toBeGreaterThan(85);
      expect(result.benchmark!.standards).toContain(expect.stringMatching(/WCAG|Web Standards/i));
    });

    it('should provide accurate backend benchmarks', async () => {
      const code = `app.get('/api/test', (req, res) => res.json({ message: 'ok' }));`;

      const result = await qaEngine.analyze(code, 'backend');

      expect(result.benchmark!.category).toBe('backend');
      expect(result.benchmark!.standards).toContain(expect.stringMatching(/OWASP|REST/i));
    });

    it('should compare against industry standards correctly', async () => {
      const goodCode = `
interface Props { name: string; }
const Component: React.FC<Props> = ({ name }) => (
  <div role="main" aria-label="Content">
    <h1>Hello {name}</h1>
  </div>
);`;

      const result = await qaEngine.analyze(goodCode, 'frontend');

      expect(result.benchmark!.percentileRank).toBeGreaterThan(50);
      expect(result.benchmark!.comparisonText).toContain('above average');
    });
  });

  describe('Compliance Checking', () => {
    it('should check WCAG compliance for frontend code', async () => {
      const accessibleCode = `
<form role="form" aria-labelledby="form-title">
  <h2 id="form-title">Login Form</h2>
  <label htmlFor="email">Email Address</label>
  <input
    id="email"
    type="email"
    required
    aria-describedby="email-help"
  />
  <div id="email-help">Enter your email address</div>

  <label htmlFor="password">Password</label>
  <input
    id="password"
    type="password"
    required
    aria-describedby="password-help"
  />
  <div id="password-help">Enter your password</div>

  <button type="submit" aria-describedby="submit-help">
    Sign In
  </button>
  <div id="submit-help">Click to sign in to your account</div>
</form>`;

      const result = await qaEngine.analyze(accessibleCode, 'frontend');

      expect(result.compliance).toBeDefined();
      expect(result.compliance!.wcag).toBeDefined();
      expect(result.compliance!.wcag.level).toMatch(/A|AA|AAA/);
      expect(result.compliance!.wcag.score).toBeGreaterThan(80);
    });

    it('should check OWASP compliance for backend code', async () => {
      const secureCode = `
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use('/api/', rateLimit({ windowMs: 60000, max: 100 }));

app.post('/api/users', validateInput, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({
      ...req.body,
      password: hashedPassword
    });
    res.status(201).json({ id: user.id });
  } catch (error) {
    logger.error('User creation failed', error);
    res.status(500).json({ error: 'Server error' });
  }
});`;

      const result = await qaEngine.analyze(secureCode, 'backend');

      expect(result.compliance!.owasp).toBeDefined();
      expect(result.compliance!.owasp.score).toBeGreaterThan(75);
      expect(result.compliance!.owasp.checkedItems).toContain('Input validation');
    });

    it('should check Clean Code compliance', async () => {
      const cleanCode = `
/**
 * Calculates the total price including tax
 * @param basePrice - The base price before tax
 * @param taxRate - The tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns The total price including tax
 */
function calculateTotalPrice(basePrice: number, taxRate: number): number {
  if (basePrice < 0) {
    throw new Error('Base price must be non-negative');
  }

  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Tax rate must be between 0 and 1');
  }

  const taxAmount = basePrice * taxRate;
  const totalPrice = basePrice + taxAmount;

  return Math.round(totalPrice * 100) / 100; // Round to 2 decimal places
}`;

      const result = await qaEngine.analyze(cleanCode, 'generic');

      expect(result.compliance!.cleanCode).toBeDefined();
      expect(result.compliance!.cleanCode.score).toBeGreaterThan(85);
      expect(result.compliance!.cleanCode.violations).toHaveLength(0);
    });
  });

  describe('Trend Analysis', () => {
    it('should track quality trends over time', async () => {
      const codes = [
        'const x = 1;', // Simple
        'const Component = () => <div>Test</div>;', // Better
        'const Component: React.FC<Props> = ({ name }) => <div>{name}</div>;', // Best
      ];

      const results = [];
      for (const code of codes) {
        const result = await qaEngine.analyze(code, 'frontend');
        results.push(result);
      }

      // Should show improving trend
      expect(results[2].overall).toBeGreaterThan(results[0].overall);

      // Trend should be tracked
      results.forEach(result => {
        expect(result.trend).toBeDefined();
        expect(result.trend!.direction).toMatch(/improving|stable|declining/);
      });
    });

    it('should detect quality regressions', async () => {
      // Simulate a quality regression
      const goodCode = `
interface Props { value: string; }
const Component: React.FC<Props> = ({ value }) => (
  <div aria-label="Content">{value}</div>
);`;

      const badCode = `
function component(props) {
  return React.createElement('div', null, props.value);
}`;

      const goodResult = await qaEngine.analyze(goodCode, 'frontend');
      const badResult = await qaEngine.analyze(badCode, 'frontend');

      expect(goodResult.overall).toBeGreaterThan(badResult.overall);
      expect(badResult.trend!.direction).toBe('declining');
    });
  });

  describe('Quality Metrics and Scoring', () => {
    it('should provide detailed quality metrics', async () => {
      const code = `
class DataProcessor {
  process(data: any[]): ProcessedData[] {
    return data
      .filter(item => item.isValid)
      .map(item => this.transform(item))
      .sort((a, b) => a.priority - b.priority);
  }

  private transform(item: any): ProcessedData {
    return {
      id: item.id,
      value: item.value * 2,
      processed: true,
      timestamp: Date.now(),
    };
  }
}`;

      const result = await qaEngine.analyze(code, 'generic');

      expect(result.metrics).toBeDefined();
      expect(result.metrics!.linesOfCode).toBeGreaterThan(0);
      expect(result.metrics!.cyclomaticComplexity).toBeGreaterThan(0);
      expect(result.metrics!.cognitiveComplexity).toBeGreaterThan(0);
      expect(result.metrics!.maintainabilityIndex).toBeGreaterThan(0);
      expect(result.metrics!.technicalDebt).toBeDefined();
    });

    it('should calculate consistent scoring across categories', async () => {
      const simpleCode = 'const x = 1;';

      const results = await Promise.all([
        qaEngine.analyze(simpleCode, 'frontend'),
        qaEngine.analyze(simpleCode, 'backend'),
        qaEngine.analyze(simpleCode, 'generic'),
      ]);

      // Scores should be consistent for simple code
      results.forEach(result => {
        expect(result.overall).toBeGreaterThan(50);
        expect(result.overall).toBeLessThan(100);
      });

      // Should not vary wildly between categories for the same simple code
      const scores = results.map(r => r.overall);
      const maxDiff = Math.max(...scores) - Math.min(...scores);
      expect(maxDiff).toBeLessThan(30);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large code analysis efficiently', async () => {
      const largeCode = Array(1000).fill(0).map((_, i) =>
        `const variable${i} = "value${i}";`
      ).join('\n');

      const startTime = Date.now();
      const result = await qaEngine.analyze(largeCode, 'generic');
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.overall).toBeGreaterThan(0);
    });

    it('should handle concurrent analysis requests', async () => {
      const codes = Array(10).fill(0).map((_, i) =>
        `const component${i} = () => <div>Component {${i}}</div>;`
      );

      const startTime = Date.now();
      const results = await Promise.all(
        codes.map(code => qaEngine.analyze(code, 'frontend'))
      );
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds

      results.forEach(result => {
        expect(result.overall).toBeGreaterThan(0);
        expect(result.grade).toMatch(/[A-F]/);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed code gracefully', async () => {
      const malformedCode = `
function broken( {
  var x = ;
  return x +
}`;

      const result = await qaEngine.analyze(malformedCode, 'generic');

      expect(result).toBeDefined();
      expect(result.overall).toBeLessThan(50); // Should be low quality
      expect(result.breakdown!.syntaxErrors).toBeGreaterThan(0);
    });

    it('should handle empty code', async () => {
      const result = await qaEngine.analyze('', 'generic');

      expect(result).toBeDefined();
      expect(result.overall).toBeLessThan(30);
      expect(result.recommendations).toContain('Add code content');
    });

    it('should handle unsupported categories gracefully', async () => {
      const result = await qaEngine.analyze('const x = 1;', 'unsupported-category' as any);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThan(0);
      // Should fall back to generic analysis
    });
  });

  describe('Recommendations and Suggestions', () => {
    it('should provide actionable recommendations', async () => {
      const improvableCode = `
function calculate(x, y) {
  var result;
  if (x > 0) {
    if (y > 0) {
      result = x * y;
    } else {
      result = 0;
    }
  } else {
    result = 0;
  }
  return result;
}`;

      const result = await qaEngine.analyze(improvableCode, 'generic');

      expect(result.recommendations).toBeDefined();
      expect(result.recommendations!.length).toBeGreaterThan(0);
      expect(result.recommendations).toContain(expect.stringMatching(/type|const|let/i));
    });

    it('should prioritize recommendations by impact', async () => {
      const securityIssueCode = `
function login(username, password) {
  eval("SELECT * FROM users WHERE username='" + username + "'");
  return true;
}`;

      const result = await qaEngine.analyze(securityIssueCode, 'backend');

      expect(result.recommendations![0]).toMatch(/security|eval|injection/i);
    });
  });
});