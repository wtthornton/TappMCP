import { AgentSpecification } from './agent-md-parser.js';
import { AgentCodeGenerator, GeneratedCode } from './agent-code-generator.js';
import * as fs from 'fs';
import * as path from 'path';

export interface SpecificationVersion {
  version: string;
  timestamp: string;
  specification: AgentSpecification;
  changes: SpecificationChange[];
  codeGenerated: boolean;
  codeHash?: string;
  metadata: {
    author: string;
    message: string;
    tags: string[];
    branch?: string;
  };
}

export interface SpecificationChange {
  type: 'added' | 'modified' | 'removed';
  path: string;
  oldValue?: any;
  newValue?: any;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  affectedComponents: string[];
}

export interface EvolutionHistory {
  specificationId: string;
  versions: SpecificationVersion[];
  currentVersion: string;
  branches: Map<string, string>; // branch name -> version
  tags: Map<string, string>; // tag name -> version
}

export interface EvolutionOptions {
  autoIncrementVersion: boolean;
  trackCodeChanges: boolean;
  generateDiff: boolean;
  validateChanges: boolean;
  backupOnChange: boolean;
}

export interface DiffResult {
  changes: SpecificationChange[];
  summary: {
    totalChanges: number;
    breakingChanges: number;
    newFeatures: number;
    bugFixes: number;
    refactoring: number;
  };
  impact: {
    tools: string[];
    workflows: string[];
    constraints: string[];
    examples: string[];
  };
}

export class AgentSpecificationEvolution {
  private historyDir: string;
  private codeGenerator: AgentCodeGenerator;
  private options: EvolutionOptions;

  constructor(historyDir: string = './spec-history', options: Partial<EvolutionOptions> = {}) {
    this.historyDir = historyDir;
    this.codeGenerator = new AgentCodeGenerator();
    this.options = {
      autoIncrementVersion: true,
      trackCodeChanges: true,
      generateDiff: true,
      validateChanges: true,
      backupOnChange: true,
      ...options
    };

    this.ensureHistoryDirectory();
  }

  /**
   * Track a new version of a specification
   */
  async trackVersion(
    specificationId: string,
    specification: AgentSpecification,
    metadata: {
      author: string;
      message: string;
      tags?: string[];
      branch?: string;
    }
  ): Promise<SpecificationVersion> {
    const history = await this.getHistory(specificationId);
    const previousVersion = history.versions[history.versions.length - 1];

    // Generate version number
    const version = this.generateVersionNumber(previousVersion?.version);

    // Calculate changes
    const changes = previousVersion
      ? await this.calculateChanges(previousVersion.specification, specification)
      : this.calculateInitialChanges(specification);

    // Generate code if tracking code changes
    let codeHash: string | undefined;
    if (this.options.trackCodeChanges) {
      try {
        const generatedCode = await this.generateCodeForSpecification(specification);
        codeHash = this.calculateCodeHash(generatedCode);
      } catch (error) {
        console.warn('Failed to generate code for tracking:', error);
      }
    }

    // Create new version
    const newVersion: SpecificationVersion = {
      version,
      timestamp: new Date().toISOString(),
      specification: { ...specification },
      changes,
      codeGenerated: !!codeHash,
      codeHash,
      metadata: {
        author: metadata.author,
        message: metadata.message,
        tags: metadata.tags || [],
        branch: metadata.branch || 'main'
      }
    };

    // Add to history
    history.versions.push(newVersion);
    history.currentVersion = version;

    // Update branch if specified
    if (metadata.branch) {
      history.branches.set(metadata.branch, version);
    }

    // Add tags
    metadata.tags?.forEach(tag => {
      history.tags.set(tag, version);
    });

    // Save history
    await this.saveHistory(specificationId, history);

    // Create backup if enabled
    if (this.options.backupOnChange) {
      await this.createBackup(specificationId, version, specification);
    }

    return newVersion;
  }

  /**
   * Get evolution history for a specification
   */
  async getHistory(specificationId: string): Promise<EvolutionHistory> {
    const historyPath = path.join(this.historyDir, `${specificationId}.json`);

    if (!fs.existsSync(historyPath)) {
      return {
        specificationId,
        versions: [],
        currentVersion: '0.0.0',
        branches: new Map([['main', '0.0.0']]),
        tags: new Map()
      };
    }

    const data = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));

    // Convert Maps back from arrays
    return {
      ...data,
      branches: new Map(data.branches || []),
      tags: new Map(data.tags || [])
    };
  }

  /**
   * Get specific version of a specification
   */
  async getVersion(specificationId: string, version: string): Promise<SpecificationVersion | undefined> {
    const history = await this.getHistory(specificationId);
    return history.versions.find(v => v.version === version);
  }

  /**
   * Compare two versions of a specification
   */
  async compareVersions(
    specificationId: string,
    fromVersion: string,
    toVersion: string
  ): Promise<DiffResult> {
    const fromSpec = await this.getVersion(specificationId, fromVersion);
    const toSpec = await this.getVersion(specificationId, toVersion);

    if (!fromSpec || !toSpec) {
      throw new Error(`Version not found: ${fromVersion} or ${toVersion}`);
    }

    const changes = await this.calculateChanges(fromSpec.specification, toSpec.specification);

    return this.analyzeChanges(changes);
  }

  /**
   * Get changes between current and previous version
   */
  async getRecentChanges(specificationId: string, count: number = 5): Promise<SpecificationChange[]> {
    const history = await this.getHistory(specificationId);
    const recentVersions = history.versions.slice(-count);

    const allChanges: SpecificationChange[] = [];
    recentVersions.forEach(version => {
      allChanges.push(...version.changes);
    });

    return allChanges;
  }

  /**
   * Get impact analysis for a change
   */
  async getChangeImpact(
    specificationId: string,
    version: string
  ): Promise<{
    affectedCode: string[];
    breakingChanges: SpecificationChange[];
    migrationRequired: boolean;
    estimatedEffort: string;
  }> {
    const versionData = await this.getVersion(specificationId, version);
    if (!versionData) {
      throw new Error(`Version not found: ${version}`);
    }

    const breakingChanges = versionData.changes.filter(c => c.impact === 'critical' || c.impact === 'high');
    const affectedCode: string[] = [];

    // Analyze which code components are affected
    versionData.changes.forEach(change => {
      if (change.affectedComponents) {
        affectedCode.push(...change.affectedComponents);
      }
    });

    const migrationRequired = breakingChanges.length > 0;
    const estimatedEffort = this.estimateMigrationEffort(breakingChanges);

    return {
      affectedCode: [...new Set(affectedCode)],
      breakingChanges,
      migrationRequired,
      estimatedEffort
    };
  }

  /**
   * Create a branch from a specific version
   */
  async createBranch(
    specificationId: string,
    branchName: string,
    fromVersion: string,
    metadata: {
      author: string;
      message: string;
    }
  ): Promise<SpecificationVersion> {
    const fromSpec = await this.getVersion(specificationId, fromVersion);
    if (!fromSpec) {
      throw new Error(`Version not found: ${fromVersion}`);
    }

    const history = await this.getHistory(specificationId);
    const version = this.generateVersionNumber(fromVersion, true); // Pre-release version

    const newVersion: SpecificationVersion = {
      version,
      timestamp: new Date().toISOString(),
      specification: { ...fromSpec.specification },
      changes: [{
        type: 'added',
        path: 'branch',
        newValue: branchName,
        description: `Created branch '${branchName}' from version ${fromVersion}`,
        impact: 'low',
        affectedComponents: []
      }],
      codeGenerated: false,
      metadata: {
        author: metadata.author,
        message: metadata.message,
        tags: [],
        branch: branchName
      }
    };

    history.versions.push(newVersion);
    history.branches.set(branchName, version);

    await this.saveHistory(specificationId, history);
    return newVersion;
  }

  /**
   * Merge a branch back to main
   */
  async mergeBranch(
    specificationId: string,
    branchName: string,
    metadata: {
      author: string;
      message: string;
    }
  ): Promise<SpecificationVersion> {
    const history = await this.getHistory(specificationId);
    const branchVersion = history.branches.get(branchName);

    if (!branchVersion) {
      throw new Error(`Branch not found: ${branchName}`);
    }

    const branchSpec = await this.getVersion(specificationId, branchVersion);
    if (!branchSpec) {
      throw new Error(`Branch version not found: ${branchVersion}`);
    }

    // Create merge version
    const version = this.generateVersionNumber(history.currentVersion);
    const changes = await this.calculateChanges(
      history.versions[history.versions.length - 1].specification,
      branchSpec.specification
    );

    const mergeVersion: SpecificationVersion = {
      version,
      timestamp: new Date().toISOString(),
      specification: { ...branchSpec.specification },
      changes: [
        ...changes,
        {
          type: 'added',
          path: 'merge',
          newValue: branchName,
          description: `Merged branch '${branchName}' into main`,
          impact: 'medium',
          affectedComponents: changes.flatMap(c => c.affectedComponents)
        }
      ],
      codeGenerated: false,
      metadata: {
        author: metadata.author,
        message: metadata.message,
        tags: [],
        branch: 'main'
      }
    };

    history.versions.push(mergeVersion);
    history.currentVersion = version;
    history.branches.delete(branchName);

    await this.saveHistory(specificationId, history);
    return mergeVersion;
  }

  /**
   * Generate migration guide for breaking changes
   */
  async generateMigrationGuide(
    specificationId: string,
    fromVersion: string,
    toVersion: string
  ): Promise<string> {
    const diff = await this.compareVersions(specificationId, fromVersion, toVersion);
    const breakingChanges = diff.changes.filter(c => c.impact === 'critical' || c.impact === 'high');

    let guide = `# Migration Guide: ${fromVersion} → ${toVersion}\n\n`;
    guide += `**Specification ID**: ${specificationId}\n`;
    guide += `**Generated**: ${new Date().toISOString()}\n\n`;

    if (breakingChanges.length === 0) {
      guide += `## ✅ No Breaking Changes\n\n`;
      guide += `This update contains only non-breaking changes. You can safely update without migration.\n\n`;
    } else {
      guide += `## ⚠️ Breaking Changes (${breakingChanges.length})\n\n`;
      guide += `**Migration Required**: Yes\n`;
      guide += `**Estimated Effort**: ${this.estimateMigrationEffort(breakingChanges)}\n\n`;

      breakingChanges.forEach((change, index) => {
        guide += `### ${index + 1}. ${change.description}\n\n`;
        guide += `**Type**: ${change.type}\n`;
        guide += `**Path**: \`${change.path}\`\n`;
        guide += `**Impact**: ${change.impact}\n\n`;

        if (change.oldValue !== undefined) {
          guide += `**Before**:\n\`\`\`json\n${JSON.stringify(change.oldValue, null, 2)}\n\`\`\`\n\n`;
        }

        if (change.newValue !== undefined) {
          guide += `**After**:\n\`\`\`json\n${JSON.stringify(change.newValue, null, 2)}\n\`\`\`\n\n`;
        }

        if (change.affectedComponents.length > 0) {
          guide += `**Affected Components**: ${change.affectedComponents.join(', ')}\n\n`;
        }
      });
    }

    // Add summary
    guide += `## Summary\n\n`;
    guide += `- **Total Changes**: ${diff.summary.totalChanges}\n`;
    guide += `- **Breaking Changes**: ${diff.summary.breakingChanges}\n`;
    guide += `- **New Features**: ${diff.summary.newFeatures}\n`;
    guide += `- **Bug Fixes**: ${diff.summary.bugFixes}\n`;
    guide += `- **Refactoring**: ${diff.summary.refactoring}\n\n`;

    return guide;
  }

  /**
   * Private helper methods
   */
  private ensureHistoryDirectory(): void {
    if (!fs.existsSync(this.historyDir)) {
      fs.mkdirSync(this.historyDir, { recursive: true });
    }
  }

  private generateVersionNumber(previousVersion?: string, isPreRelease: boolean = false): string {
    if (!previousVersion) {
      return '1.0.0';
    }

    const [major, minor, patch] = previousVersion.split('.').map(Number);

    if (isPreRelease) {
      return `${major}.${minor}.${patch + 1}-${Date.now()}`;
    }

    // Auto-increment based on change types (simplified logic)
    return `${major}.${minor}.${patch + 1}`;
  }

  private async calculateChanges(
    oldSpec: AgentSpecification,
    newSpec: AgentSpecification
  ): Promise<SpecificationChange[]> {
    const changes: SpecificationChange[] = [];

    // Compare basic properties
    if (oldSpec.name !== newSpec.name) {
      changes.push({
        type: 'modified',
        path: 'name',
        oldValue: oldSpec.name,
        newValue: newSpec.name,
        description: `Name changed from '${oldSpec.name}' to '${newSpec.name}'`,
        impact: 'high',
        affectedComponents: ['all']
      });
    }

    if (oldSpec.description !== newSpec.description) {
      changes.push({
        type: 'modified',
        path: 'description',
        oldValue: oldSpec.description,
        newValue: newSpec.description,
        description: 'Description updated',
        impact: 'low',
        affectedComponents: ['documentation']
      });
    }

    // Compare capabilities
    const capabilityChanges = this.compareArrays(
      oldSpec.capabilities,
      newSpec.capabilities,
      'capabilities'
    );
    changes.push(...capabilityChanges);

    // Compare tools
    const toolChanges = this.compareTools(oldSpec.tools, newSpec.tools);
    changes.push(...toolChanges);

    // Compare workflows
    const workflowChanges = this.compareWorkflows(oldSpec.workflows, newSpec.workflows);
    changes.push(...workflowChanges);

    // Compare constraints
    const constraintChanges = this.compareArrays(
      oldSpec.constraints,
      newSpec.constraints,
      'constraints'
    );
    changes.push(...constraintChanges);

    // Compare examples
    const exampleChanges = this.compareExamples(oldSpec.examples, newSpec.examples);
    changes.push(...exampleChanges);

    return changes;
  }

  private calculateInitialChanges(specification: AgentSpecification): SpecificationChange[] {
    return [{
      type: 'added',
      path: 'specification',
      newValue: specification.name,
      description: `Initial specification '${specification.name}' created`,
      impact: 'low',
      affectedComponents: ['all']
    }];
  }

  private compareArrays(
    oldArray: string[],
    newArray: string[],
    path: string
  ): SpecificationChange[] {
    const changes: SpecificationChange[] = [];
    const oldSet = new Set(oldArray);
    const newSet = new Set(newArray);

    // Find additions
    newArray.forEach(item => {
      if (!oldSet.has(item)) {
        changes.push({
          type: 'added',
          path: `${path}.${item}`,
          newValue: item,
          description: `Added ${path.slice(0, -1)}: ${item}`,
          impact: 'medium',
          affectedComponents: [path]
        });
      }
    });

    // Find removals
    oldArray.forEach(item => {
      if (!newSet.has(item)) {
        changes.push({
          type: 'removed',
          path: `${path}.${item}`,
          oldValue: item,
          description: `Removed ${path.slice(0, -1)}: ${item}`,
          impact: 'high',
          affectedComponents: [path]
        });
      }
    });

    return changes;
  }

  private compareTools(oldTools: any[], newTools: any[]): SpecificationChange[] {
    const changes: SpecificationChange[] = [];
    const oldMap = new Map(oldTools.map(t => [t.name, t]));
    const newMap = new Map(newTools.map(t => [t.name, t]));

    // Find added tools
    newTools.forEach(tool => {
      if (!oldMap.has(tool.name)) {
        changes.push({
          type: 'added',
          path: `tools.${tool.name}`,
          newValue: tool,
          description: `Added tool: ${tool.name}`,
          impact: 'high',
          affectedComponents: ['tools', 'code-generation']
        });
      }
    });

    // Find removed tools
    oldTools.forEach(tool => {
      if (!newMap.has(tool.name)) {
        changes.push({
          type: 'removed',
          path: `tools.${tool.name}`,
          oldValue: tool,
          description: `Removed tool: ${tool.name}`,
          impact: 'critical',
          affectedComponents: ['tools', 'code-generation']
        });
      }
    });

    // Find modified tools
    newTools.forEach(tool => {
      const oldTool = oldMap.get(tool.name);
      if (oldTool && JSON.stringify(oldTool) !== JSON.stringify(tool)) {
        changes.push({
          type: 'modified',
          path: `tools.${tool.name}`,
          oldValue: oldTool,
          newValue: tool,
          description: `Modified tool: ${tool.name}`,
          impact: 'high',
          affectedComponents: ['tools', 'code-generation']
        });
      }
    });

    return changes;
  }

  private compareWorkflows(oldWorkflows: any[], newWorkflows: any[]): SpecificationChange[] {
    const changes: SpecificationChange[] = [];
    const oldMap = new Map(oldWorkflows.map(w => [w.name, w]));
    const newMap = new Map(newWorkflows.map(w => [w.name, w]));

    // Find added workflows
    newWorkflows.forEach(workflow => {
      if (!oldMap.has(workflow.name)) {
        changes.push({
          type: 'added',
          path: `workflows.${workflow.name}`,
          newValue: workflow,
          description: `Added workflow: ${workflow.name}`,
          impact: 'medium',
          affectedComponents: ['workflows', 'code-generation']
        });
      }
    });

    // Find removed workflows
    oldWorkflows.forEach(workflow => {
      if (!newMap.has(workflow.name)) {
        changes.push({
          type: 'removed',
          path: `workflows.${workflow.name}`,
          oldValue: workflow,
          description: `Removed workflow: ${workflow.name}`,
          impact: 'high',
          affectedComponents: ['workflows', 'code-generation']
        });
      }
    });

    // Find modified workflows
    newWorkflows.forEach(workflow => {
      const oldWorkflow = oldMap.get(workflow.name);
      if (oldWorkflow && JSON.stringify(oldWorkflow) !== JSON.stringify(workflow)) {
        changes.push({
          type: 'modified',
          path: `workflows.${workflow.name}`,
          oldValue: oldWorkflow,
          newValue: workflow,
          description: `Modified workflow: ${workflow.name}`,
          impact: 'medium',
          affectedComponents: ['workflows', 'code-generation']
        });
      }
    });

    return changes;
  }

  private compareExamples(oldExamples: any[], newExamples: any[]): SpecificationChange[] {
    const changes: SpecificationChange[] = [];
    const oldMap = new Map(oldExamples.map((e, i) => [`example_${i}`, e]));
    const newMap = new Map(newExamples.map((e, i) => [`example_${i}`, e]));

    // Find added examples
    newExamples.forEach((example, index) => {
      if (!oldMap.has(`example_${index}`)) {
        changes.push({
          type: 'added',
          path: `examples.${index}`,
          newValue: example,
          description: `Added example: ${example.scenario || `Example ${index + 1}`}`,
          impact: 'low',
          affectedComponents: ['examples', 'documentation']
        });
      }
    });

    // Find removed examples
    oldExamples.forEach((example, index) => {
      if (!newMap.has(`example_${index}`)) {
        changes.push({
          type: 'removed',
          path: `examples.${index}`,
          oldValue: example,
          description: `Removed example: ${example.scenario || `Example ${index + 1}`}`,
          impact: 'low',
          affectedComponents: ['examples', 'documentation']
        });
      }
    });

    return changes;
  }

  private analyzeChanges(changes: SpecificationChange[]): DiffResult {
    const summary = {
      totalChanges: changes.length,
      breakingChanges: changes.filter(c => c.impact === 'critical' || c.impact === 'high').length,
      newFeatures: changes.filter(c => c.type === 'added' && c.impact === 'medium').length,
      bugFixes: changes.filter(c => c.type === 'modified' && c.impact === 'low').length,
      refactoring: changes.filter(c => c.type === 'modified' && c.impact === 'medium').length
    };

    const impact = {
      tools: changes.filter(c => c.affectedComponents.includes('tools')).map(c => c.path),
      workflows: changes.filter(c => c.affectedComponents.includes('workflows')).map(c => c.path),
      constraints: changes.filter(c => c.affectedComponents.includes('constraints')).map(c => c.path),
      examples: changes.filter(c => c.affectedComponents.includes('examples')).map(c => c.path)
    };

    return {
      changes,
      summary,
      impact
    };
  }

  private async generateCodeForSpecification(specification: AgentSpecification): Promise<GeneratedCode> {
    const options = {
      language: 'typescript',
      quality: 'standard' as const,
      includeTests: true,
      includeDocumentation: true,
      includeExamples: true
    };

    return this.codeGenerator.generateCode(specification, options);
  }

  private calculateCodeHash(code: GeneratedCode): string {
    const content = JSON.stringify(code, null, 2);
    // Simple hash function (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private estimateMigrationEffort(breakingChanges: SpecificationChange[]): string {
    const criticalCount = breakingChanges.filter(c => c.impact === 'critical').length;
    const highCount = breakingChanges.filter(c => c.impact === 'high').length;

    if (criticalCount > 3) return 'High (2-4 hours)';
    if (criticalCount > 0 || highCount > 5) return 'Medium (1-2 hours)';
    if (highCount > 0) return 'Low (30-60 minutes)';
    return 'Minimal (15-30 minutes)';
  }

  private async saveHistory(specificationId: string, history: EvolutionHistory): Promise<void> {
    const historyPath = path.join(this.historyDir, `${specificationId}.json`);

    // Convert Maps to arrays for JSON serialization
    const serializableHistory = {
      ...history,
      branches: Array.from(history.branches.entries()),
      tags: Array.from(history.tags.entries())
    };

    fs.writeFileSync(historyPath, JSON.stringify(serializableHistory, null, 2));
  }

  private async createBackup(
    specificationId: string,
    version: string,
    specification: AgentSpecification
  ): Promise<void> {
    const backupDir = path.join(this.historyDir, 'backups', specificationId);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, `${version}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(specification, null, 2));
  }
}
