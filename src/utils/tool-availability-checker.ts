#!/usr/bin/env node

/**
 * Tool Availability Checker
 * Checks for external tools required by TappMCP
 */

import { execSync } from 'child_process';

export interface ToolStatus {
  name: string;
  available?: boolean;
  command: string;
  installCommand?: string;
  description: string;
  critical: boolean;
}

export class ToolAvailabilityChecker {
  private static tools: ToolStatus[] = [
    {
      name: 'OSV-Scanner',
      command: 'osv-scanner --version',
      installCommand: 'go install github.com/google/osv-scanner/cmd/osv-scanner@latest',
      description: 'Vulnerability scanning and security analysis',
      critical: false,
    },
    {
      name: 'Semgrep',
      command: 'semgrep --version',
      installCommand: 'pip install semgrep',
      description: 'Security and OWASP best practices analysis',
      critical: false,
    },
    {
      name: 'Gitleaks',
      command: 'gitleaks version',
      installCommand: 'go install github.com/gitleaks/gitleaks/v8@latest',
      description: 'Secret detection and security scanning',
      critical: false,
    },
    {
      name: 'Node.js',
      command: 'node --version',
      description: 'JavaScript runtime environment',
      critical: true,
    },
    {
      name: 'NPM',
      command: 'npm --version',
      description: 'Package manager for Node.js',
      critical: true,
    },
  ];

  /**
   * Detect if running inside Docker container
   */
  private static isRunningInDocker(): boolean {
    try {
      // Check for Docker environment indicators
      return (
        process.env.DOCKER_CONTAINER === 'true' ||
        process.env.NODE_ENV === 'production' ||
        (process.platform === 'linux' && require('fs').existsSync('/.dockerenv'))
      );
    } catch {
      return false;
    }
  }

  /**
   * Get appropriate shell command for current environment
   */
  private static getShellCommand(): string {
    if (this.isRunningInDocker()) {
      return '/bin/sh'; // Use sh in Docker container
    }
    return process.platform === 'win32' ? 'cmd' : '/bin/sh';
  }

  /**
   * Check availability of all tools
   */
  static async checkAllTools(): Promise<ToolStatus[]> {
    const results: ToolStatus[] = [];
    const shell = this.getShellCommand();
    const isDocker = this.isRunningInDocker();

    for (const tool of this.tools) {
      try {
        execSync(tool.command, {
          stdio: 'pipe',
          timeout: 5000,
          shell: shell,
        });
        results.push({ ...tool, available: true });
      } catch (error) {
        results.push({ ...tool, available: false });
      }
    }

    return results;
  }

  /**
   * Get missing tools
   */
  static async getMissingTools(): Promise<ToolStatus[]> {
    const allTools = await this.checkAllTools();
    return allTools.filter(tool => !tool.available);
  }

  /**
   * Get critical missing tools
   */
  static async getCriticalMissingTools(): Promise<ToolStatus[]> {
    const missingTools = await this.getMissingTools();
    return missingTools.filter(tool => tool.critical);
  }

  /**
   * Get non-critical missing tools
   */
  static async getOptionalMissingTools(): Promise<ToolStatus[]> {
    const missingTools = await this.getMissingTools();
    return missingTools.filter(tool => !tool.critical);
  }

  /**
   * Check if system is functional (has all critical tools)
   */
  static async isSystemFunctional(): Promise<boolean> {
    const criticalMissing = await this.getCriticalMissingTools();
    return criticalMissing.length === 0;
  }

  /**
   * Generate installation instructions
   */
  static generateInstallationInstructions(missingTools: ToolStatus[]): string {
    if (missingTools.length === 0) {
      return '✅ All tools are available!';
    }

    const isDocker = this.isRunningInDocker();
    const environment = isDocker ? 'Docker Container' : 'Host System';

    let instructions = `📦 **Installation Instructions for ${environment}:**\n\n`;

    for (const tool of missingTools) {
      instructions += `**${tool.name}** (${tool.description})\n`;

      if (tool.installCommand) {
        if (isDocker) {
          // Provide Docker-specific installation instructions
          instructions += `\`\`\`bash\n# Install in Docker container:\n`;
          instructions += `docker exec -it tappmcp-smart-mcp-1 ${tool.installCommand}\n\`\`\`\n\n`;

          // Also provide host installation for reference
          instructions += `\`\`\`bash\n# Or install on host system:\n${tool.installCommand}\n\`\`\`\n\n`;
        } else {
          instructions += `\`\`\`bash\n${tool.installCommand}\n\`\`\`\n\n`;
        }
      } else {
        instructions += `Please install ${tool.name} manually\n\n`;
      }
    }

    if (isDocker) {
      instructions += `\n**Note:** You're running inside a Docker container. `;
      instructions += `Some tools may need to be installed in the container image `;
      instructions += `or mounted from the host system.\n`;
    }

    return instructions;
  }
}
