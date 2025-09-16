import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentSpecificationEvolution } from './agent-specification-evolution.js';
import { AgentSpecification } from './agent-md-parser.js';
import * as fs from 'fs';
import * as path from 'path';

describe('AgentSpecificationEvolution', () => {
  let evolution: AgentSpecificationEvolution;
  let testHistoryDir: string;
  let testSpecId: string;

  beforeEach(() => {
    testHistoryDir = './test-spec-history';
    testSpecId = 'test-agent-spec';
    evolution = new AgentSpecificationEvolution(testHistoryDir);
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testHistoryDir)) {
      fs.rmSync(testHistoryDir, { recursive: true, force: true });
    }
  });

  describe('version tracking', () => {
    it('should track initial version', async () => {
      const spec: AgentSpecification = {
        name: 'Test Agent',
        description: 'A test agent',
        capabilities: ['Testing'],
        tools: [{
          name: 'test_tool',
          description: 'A test tool',
          parameters: [],
          examples: []
        }],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      const version = await evolution.trackVersion(testSpecId, spec, {
        author: 'Test Author',
        message: 'Initial version'
      });

      expect(version.version).toBe('1.0.0');
      expect(version.specification.name).toBe('Test Agent');
      expect(version.changes.length).toBe(1);
      expect(version.changes[0].type).toBe('added');
      expect(version.metadata.author).toBe('Test Author');
    });

    it('should track version changes', async () => {
      const initialSpec: AgentSpecification = {
        name: 'Test Agent',
        description: 'A test agent',
        capabilities: ['Testing'],
        tools: [],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      const updatedSpec: AgentSpecification = {
        ...initialSpec,
        name: 'Updated Test Agent',
        description: 'An updated test agent',
        capabilities: ['Testing', 'Debugging'],
        tools: [{
          name: 'new_tool',
          description: 'A new tool',
          parameters: [],
          examples: []
        }]
      };

      // Track initial version
      await evolution.trackVersion(testSpecId, initialSpec, {
        author: 'Test Author',
        message: 'Initial version'
      });

      // Track updated version
      const version = await evolution.trackVersion(testSpecId, updatedSpec, {
        author: 'Test Author',
        message: 'Added new capabilities and tools'
      });

      expect(version.version).toBe('1.0.1');
      expect(version.changes.length).toBeGreaterThan(0);

      const nameChange = version.changes.find(c => c.path === 'name');
      expect(nameChange).toBeDefined();
      expect(nameChange?.type).toBe('modified');
      expect(nameChange?.oldValue).toBe('Test Agent');
      expect(nameChange?.newValue).toBe('Updated Test Agent');
    });

    it('should get evolution history', async () => {
      const spec: AgentSpecification = {
        name: 'Test Agent',
        description: 'A test agent',
        capabilities: ['Testing'],
        tools: [],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      await evolution.trackVersion(testSpecId, spec, {
        author: 'Test Author',
        message: 'Initial version'
      });

      const history = await evolution.getHistory(testSpecId);
      expect(history.specificationId).toBe(testSpecId);
      expect(history.versions.length).toBe(1);
      expect(history.currentVersion).toBe('1.0.0');
    });

    it('should get specific version', async () => {
      const spec: AgentSpecification = {
        name: 'Test Agent',
        description: 'A test agent',
        capabilities: ['Testing'],
        tools: [],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      await evolution.trackVersion(testSpecId, spec, {
        author: 'Test Author',
        message: 'Initial version'
      });

      const version = await evolution.getVersion(testSpecId, '1.0.0');
      expect(version).toBeDefined();
      expect(version?.specification.name).toBe('Test Agent');
    });
  });

  describe('change detection', () => {
    it('should detect capability changes', async () => {
      const oldSpec: AgentSpecification = {
        name: 'Test Agent',
        description: 'A test agent',
        capabilities: ['Testing'],
        tools: [],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      const newSpec: AgentSpecification = {
        ...oldSpec,
        capabilities: ['Testing', 'Debugging', 'Monitoring']
      };

      await evolution.trackVersion(testSpecId, oldSpec, {
        author: 'Test Author',
        message: 'Initial version'
      });

      const version = await evolution.trackVersion(testSpecId, newSpec, {
        author: 'Test Author',
        message: 'Added capabilities'
      });

      const capabilityChanges = version.changes.filter(c => c.path.startsWith('capabilities'));
      expect(capabilityChanges.length).toBe(2); // Added Debugging and Monitoring
      expect(capabilityChanges.every(c => c.type === 'added')).toBe(true);
    });

    it('should detect tool changes', async () => {
      const oldSpec: AgentSpecification = {
        name: 'Test Agent',
        description: 'A test agent',
        capabilities: ['Testing'],
        tools: [{
          name: 'old_tool',
          description: 'An old tool',
          parameters: [],
          examples: []
        }],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      const newSpec: AgentSpecification = {
        ...oldSpec,
        tools: [{
          name: 'new_tool',
          description: 'A new tool',
          parameters: [],
          examples: []
        }]
      };

      await evolution.trackVersion(testSpecId, oldSpec, {
        author: 'Test Author',
        message: 'Initial version'
      });

      const version = await evolution.trackVersion(testSpecId, newSpec, {
        author: 'Test Author',
        message: 'Replaced tool'
      });

      const toolChanges = version.changes.filter(c => c.path.startsWith('tools'));
      expect(toolChanges.length).toBe(2); // Removed old_tool, added new_tool
      expect(toolChanges.some(c => c.type === 'removed' && c.path.includes('old_tool'))).toBe(true);
      expect(toolChanges.some(c => c.type === 'added' && c.path.includes('new_tool'))).toBe(true);
    });

    it('should detect workflow changes', async () => {
      const oldSpec: AgentSpecification = {
        name: 'Test Agent',
        description: 'A test agent',
        capabilities: ['Testing'],
        tools: [],
        workflows: [{
          name: 'Old Workflow',
          description: 'An old workflow',
          steps: ['Step 1'],
          triggers: [],
          outcomes: []
        }],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      const newSpec: AgentSpecification = {
        ...oldSpec,
        workflows: [{
          name: 'New Workflow',
          description: 'A new workflow',
          steps: ['Step 1', 'Step 2'],
          triggers: [],
          outcomes: []
        }]
      };

      await evolution.trackVersion(testSpecId, oldSpec, {
        author: 'Test Author',
        message: 'Initial version'
      });

      const version = await evolution.trackVersion(testSpecId, newSpec, {
        author: 'Test Author',
        message: 'Updated workflow'
      });

      const workflowChanges = version.changes.filter(c => c.path.startsWith('workflows'));
      expect(workflowChanges.length).toBe(2); // Removed Old Workflow, added New Workflow
    });
  });

  describe('version comparison', () => {
    it('should compare two versions', async () => {
      const spec1: AgentSpecification = {
        name: 'Test Agent v1',
        description: 'Version 1',
        capabilities: ['Testing'],
        tools: [],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      const spec2: AgentSpecification = {
        name: 'Test Agent v2',
        description: 'Version 2',
        capabilities: ['Testing', 'Debugging'],
        tools: [],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '2.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      await evolution.trackVersion(testSpecId, spec1, {
        author: 'Test Author',
        message: 'Version 1'
      });

      await evolution.trackVersion(testSpecId, spec2, {
        author: 'Test Author',
        message: 'Version 2'
      });

      const diff = await evolution.compareVersions(testSpecId, '1.0.0', '1.0.1');

      expect(diff.changes.length).toBeGreaterThan(0);
      expect(diff.summary.totalChanges).toBeGreaterThan(0);
      expect(diff.summary.newFeatures).toBeGreaterThan(0);
    });
  });

  describe('branch management', () => {
    it('should create a branch', async () => {
      const spec: AgentSpecification = {
        name: 'Test Agent',
        description: 'A test agent',
        capabilities: ['Testing'],
        tools: [],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      await evolution.trackVersion(testSpecId, spec, {
        author: 'Test Author',
        message: 'Initial version'
      });

      const branchVersion = await evolution.createBranch(testSpecId, 'feature-branch', '1.0.0', {
        author: 'Test Author',
        message: 'Created feature branch'
      });

      expect(branchVersion.metadata.branch).toBe('feature-branch');
      expect(branchVersion.version).toContain('-'); // Pre-release version
    });

    it('should merge a branch', async () => {
      const spec: AgentSpecification = {
        name: 'Test Agent',
        description: 'A test agent',
        capabilities: ['Testing'],
        tools: [],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      await evolution.trackVersion(testSpecId, spec, {
        author: 'Test Author',
        message: 'Initial version'
      });

      await evolution.createBranch(testSpecId, 'feature-branch', '1.0.0', {
        author: 'Test Author',
        message: 'Created feature branch'
      });

      const mergeVersion = await evolution.mergeBranch(testSpecId, 'feature-branch', {
        author: 'Test Author',
        message: 'Merged feature branch'
      });

      expect(mergeVersion.metadata.branch).toBe('main');
      expect(mergeVersion.changes.some(c => c.description.includes('Merged branch'))).toBe(true);
    });
  });

  describe('migration guide generation', () => {
    it('should generate migration guide for breaking changes', async () => {
      const spec1: AgentSpecification = {
        name: 'Test Agent',
        description: 'Version 1',
        capabilities: ['Testing'],
        tools: [{
          name: 'old_tool',
          description: 'An old tool',
          parameters: [],
          examples: []
        }],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      const spec2: AgentSpecification = {
        name: 'Test Agent v2',
        description: 'Version 2',
        capabilities: ['Testing', 'Debugging'],
        tools: [{
          name: 'new_tool',
          description: 'A new tool',
          parameters: [],
          examples: []
        }],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '2.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      await evolution.trackVersion(testSpecId, spec1, {
        author: 'Test Author',
        message: 'Version 1'
      });

      await evolution.trackVersion(testSpecId, spec2, {
        author: 'Test Author',
        message: 'Version 2 with breaking changes'
      });

      const guide = await evolution.generateMigrationGuide(testSpecId, '1.0.0', '1.0.1');

      expect(guide).toContain('# Migration Guide');
      expect(guide).toContain('1.0.0 → 1.0.1');
      expect(guide).toContain('Breaking Changes');
      expect(guide).toContain('old_tool');
      expect(guide).toContain('new_tool');
    });
  });

  describe('impact analysis', () => {
    it('should analyze change impact', async () => {
      const spec: AgentSpecification = {
        name: 'Test Agent',
        description: 'A test agent',
        capabilities: ['Testing'],
        tools: [{
          name: 'test_tool',
          description: 'A test tool',
          parameters: [],
          examples: []
        }],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      await evolution.trackVersion(testSpecId, spec, {
        author: 'Test Author',
        message: 'Initial version'
      });

      const impact = await evolution.getChangeImpact(testSpecId, '1.0.0');

      expect(impact.affectedCode).toBeDefined();
      expect(impact.breakingChanges).toBeDefined();
      expect(impact.migrationRequired).toBeDefined();
      expect(impact.estimatedEffort).toBeDefined();
    });
  });

  describe('recent changes', () => {
    it('should get recent changes', async () => {
      const spec1: AgentSpecification = {
        name: 'Test Agent v1',
        description: 'Version 1',
        capabilities: ['Testing'],
        tools: [],
        workflows: [],
        constraints: [],
        examples: [],
        metadata: {
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: 'TappMCP'
        }
      };

      const spec2: AgentSpecification = {
        ...spec1,
        name: 'Test Agent v2',
        capabilities: ['Testing', 'Debugging']
      };

      await evolution.trackVersion(testSpecId, spec1, {
        author: 'Test Author',
        message: 'Version 1'
      });

      await evolution.trackVersion(testSpecId, spec2, {
        author: 'Test Author',
        message: 'Version 2'
      });

      const recentChanges = await evolution.getRecentChanges(testSpecId, 2);

      expect(recentChanges.length).toBeGreaterThan(0);
      expect(recentChanges.some(c => c.path === 'name')).toBe(true);
    });
  });

  describe('options configuration', () => {
    it('should respect configuration options', () => {
      const customEvolution = new AgentSpecificationEvolution('./custom-history', {
        autoIncrementVersion: false,
        trackCodeChanges: false,
        generateDiff: false,
        validateChanges: false,
        backupOnChange: false
      });

      expect(customEvolution).toBeDefined();
    });
  });
});
