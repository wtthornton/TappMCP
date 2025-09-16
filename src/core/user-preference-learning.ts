/**
 * User Preference Learning System
 * Learns from user interactions and adapts responses accordingly
 */

import * as fs from 'fs';
import * as path from 'path';

export interface UserPreference {
  userId: string;
  verbosity: 'minimal' | 'standard' | 'detailed';
  role: 'developer' | 'designer' | 'qa-engineer' | 'operations-engineer' | 'product-strategist';
  quality: 'basic' | 'standard' | 'enterprise' | 'production';
  preferredTechnologies: string[];
  responseStyle: 'concise' | 'comprehensive' | 'tutorial';
  lastUpdated: string;
  interactionCount: number;
  satisfactionScore: number;
}

export interface LearningData {
  userId: string;
  interactions: UserInteraction[];
  preferences: UserPreference;
  patterns: LearningPattern[];
}

export interface UserInteraction {
  timestamp: string;
  command: string;
  response: string;
  verbosity: string;
  role: string;
  quality: string;
  satisfaction: number; // 1-5 scale
  feedback?: string;
}

export interface LearningPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  preferredResponse: string;
}

export class UserPreferenceLearning {
  private dataDir: string;
  private preferencesFile: string;
  private interactionsFile: string;

  constructor(dataDir: string = './data') {
    this.dataDir = dataDir;
    this.preferencesFile = path.join(dataDir, 'user-preferences.json');
    this.interactionsFile = path.join(dataDir, 'user-interactions.json');

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  /**
   * Learn from user interaction
   */
  async learnFromInteraction(
    userId: string,
    command: string,
    response: string,
    verbosity: string,
    role: string,
    quality: string,
    satisfaction: number,
    feedback?: string
  ): Promise<void> {
    try {
      // Record interaction
      const interaction: UserInteraction = {
        timestamp: new Date().toISOString(),
        command,
        response,
        verbosity,
        role,
        quality,
        satisfaction,
        feedback
      };

      await this.recordInteraction(userId, interaction);

      // Update preferences based on interaction
      await this.updatePreferences(userId, interaction);

      // Learn patterns
      await this.learnPatterns(userId, interaction);

    } catch (error) {
      console.error('Error learning from interaction:', error);
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreference | null> {
    try {
      // Check if data directory exists
      if (!fs.existsSync(this.dataDir)) {
        return null;
      }

      const preferences = await this.loadPreferences();
      return preferences[userId] || null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  /**
   * Get recommended settings based on user history
   */
  async getRecommendedSettings(userId: string, command: string): Promise<{
    verbosity: string;
    role: string;
    quality: string;
    confidence: number;
  }> {
    try {
      const preferences = await this.getUserPreferences(userId);
      const interactions = await this.getUserInteractions(userId);

      if (!preferences || interactions.length < 3) {
        // Not enough data, return defaults
        return {
          verbosity: 'standard',
          role: 'developer',
          quality: 'standard',
          confidence: 0.3
        };
      }

      // Analyze recent interactions for patterns
      const recentInteractions = interactions.slice(-10);
      const patterns = this.analyzePatterns(recentInteractions, command);

      return {
        verbosity: patterns.verbosity || preferences.verbosity,
        role: patterns.role || preferences.role,
        quality: patterns.quality || preferences.quality,
        confidence: patterns.confidence || 0.7
      };

    } catch (error) {
      console.error('Error getting recommended settings:', error);
      return {
        verbosity: 'standard',
        role: 'developer',
        quality: 'standard',
        confidence: 0.1
      };
    }
  }

  /**
   * Record user interaction
   */
  private async recordInteraction(userId: string, interaction: UserInteraction): Promise<void> {
    try {
      const interactions = await this.loadInteractions();

      if (!interactions[userId]) {
        interactions[userId] = [];
      }

      interactions[userId].push(interaction);

      // Keep only last 100 interactions per user
      if (interactions[userId].length > 100) {
        interactions[userId] = interactions[userId].slice(-100);
      }

      await this.saveInteractions(interactions);
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  }

  /**
   * Update user preferences based on interaction
   */
  private async updatePreferences(userId: string, interaction: UserInteraction): Promise<void> {
    try {
      const preferences = await this.loadPreferences();

      if (!preferences[userId]) {
        preferences[userId] = this.createDefaultPreferences(userId);
      }

      const userPrefs = preferences[userId];

      // Update based on satisfaction
      if (interaction.satisfaction >= 4) {
        // High satisfaction - reinforce current preferences
        userPrefs.verbosity = interaction.verbosity as any;
        userPrefs.role = interaction.role as any;
        userPrefs.quality = interaction.quality as any;
        userPrefs.satisfactionScore = (userPrefs.satisfactionScore + interaction.satisfaction) / 2;
      } else if (interaction.satisfaction <= 2) {
        // Low satisfaction - try different approach
        if (userPrefs.responseStyle === 'concise') {
          userPrefs.responseStyle = 'comprehensive';
        } else if (userPrefs.responseStyle === 'comprehensive') {
          userPrefs.responseStyle = 'tutorial';
        } else {
          userPrefs.responseStyle = 'concise';
        }
      }

      // Update interaction count and last updated
      userPrefs.interactionCount++;
      userPrefs.lastUpdated = new Date().toISOString();

      // Learn from command patterns
      this.learnFromCommand(userPrefs, interaction.command);

      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }

  /**
   * Learn patterns from interactions
   */
  private async learnPatterns(userId: string, interaction: UserInteraction): Promise<void> {
    try {
      const interactions = await this.getUserInteractions(userId);
      const patterns = this.extractPatterns(interactions);

      // Store patterns (simplified for now)
      console.log(`Learned ${patterns.length} patterns for user ${userId}`);
    } catch (error) {
      console.error('Error learning patterns:', error);
    }
  }

  /**
   * Analyze patterns from interactions
   */
  private analyzePatterns(interactions: UserInteraction[], command: string): {
    verbosity?: string;
    role?: string;
    quality?: string;
    confidence: number;
  } {
    const patterns = {
      verbosity: undefined as string | undefined,
      role: undefined as string | undefined,
      quality: undefined as string | undefined,
      confidence: 0.5
    };

    if (interactions.length === 0) {
      return patterns;
    }

    // Find most common verbosity for similar commands
    const similarCommands = interactions.filter(i =>
      this.isSimilarCommand(i.command, command)
    );

    if (similarCommands.length > 0) {
      const verbosityCounts = this.countOccurrences(similarCommands.map(i => i.verbosity));
      patterns.verbosity = this.getMostCommon(verbosityCounts);

      const roleCounts = this.countOccurrences(similarCommands.map(i => i.role));
      patterns.role = this.getMostCommon(roleCounts);

      const qualityCounts = this.countOccurrences(similarCommands.map(i => i.quality));
      patterns.quality = this.getMostCommon(qualityCounts);

      patterns.confidence = Math.min(0.9, similarCommands.length / 5);
    }

    return patterns;
  }

  /**
   * Check if two commands are similar
   */
  private isSimilarCommand(command1: string, command2: string): boolean {
    const words1 = command1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const words2 = command2.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    if (words1.length === 0 || words2.length === 0) {
      return false;
    }

    const commonWords = words1.filter(word => words2.includes(word));
    const similarity = commonWords.length / Math.min(words1.length, words2.length);

    // Also check for key action words
    const actionWords = ['create', 'build', 'make', 'generate', 'explain', 'show', 'check', 'status'];
    const hasCommonAction = actionWords.some(action =>
      command1.toLowerCase().includes(action) && command2.toLowerCase().includes(action)
    );

    return similarity >= 0.3 || hasCommonAction;
  }

  /**
   * Count occurrences in array
   */
  private countOccurrences(arr: string[]): Record<string, number> {
    return arr.reduce((counts, item) => {
      counts[item] = (counts[item] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  /**
   * Get most common item from counts
   */
  private getMostCommon(counts: Record<string, number>): string {
    return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
  }

  /**
   * Extract patterns from interactions
   */
  private extractPatterns(interactions: UserInteraction[]): LearningPattern[] {
    const patterns: LearningPattern[] = [];

    // Group interactions by command similarity
    const commandGroups = this.groupSimilarCommands(interactions);

    for (const [pattern, groupInteractions] of commandGroups) {
      const successRate = groupInteractions.reduce((sum, i) => sum + i.satisfaction, 0) / groupInteractions.length / 5;
      const preferredResponse = this.findPreferredResponse(groupInteractions);

      patterns.push({
        pattern,
        frequency: groupInteractions.length,
        successRate,
        preferredResponse
      });
    }

    return patterns;
  }

  /**
   * Group similar commands together
   */
  private groupSimilarCommands(interactions: UserInteraction[]): Map<string, UserInteraction[]> {
    const groups = new Map<string, UserInteraction[]>();

    for (const interaction of interactions) {
      let added = false;

      for (const [pattern, group] of groups) {
        if (this.isSimilarCommand(interaction.command, pattern)) {
          group.push(interaction);
          added = true;
          break;
        }
      }

      if (!added) {
        groups.set(interaction.command, [interaction]);
      }
    }

    return groups;
  }

  /**
   * Find preferred response from interactions
   */
  private findPreferredResponse(interactions: UserInteraction[]): string {
    // Return the response with highest satisfaction
    const bestInteraction = interactions.reduce((best, current) =>
      current.satisfaction > best.satisfaction ? current : best
    );

    return bestInteraction.response;
  }

  /**
   * Learn from command structure
   */
  private learnFromCommand(preferences: UserPreference, command: string): void {
    const lowerCommand = command.toLowerCase();

    // Learn technology preferences
    const techKeywords = ['react', 'vue', 'angular', 'node', 'python', 'java', 'typescript', 'javascript'];
    for (const tech of techKeywords) {
      if (lowerCommand.includes(tech) && !preferences.preferredTechnologies.includes(tech)) {
        preferences.preferredTechnologies.push(tech);
      }
    }

    // Learn response style preferences
    if (lowerCommand.includes('brief') || lowerCommand.includes('quick')) {
      preferences.responseStyle = 'concise';
    } else if (lowerCommand.includes('explain') || lowerCommand.includes('detailed')) {
      preferences.responseStyle = 'comprehensive';
    } else if (lowerCommand.includes('tutorial') || lowerCommand.includes('guide')) {
      preferences.responseStyle = 'tutorial';
    }
  }

  /**
   * Create default preferences
   */
  private createDefaultPreferences(userId: string): UserPreference {
    return {
      userId,
      verbosity: 'standard',
      role: 'developer',
      quality: 'standard',
      preferredTechnologies: [],
      responseStyle: 'comprehensive',
      lastUpdated: new Date().toISOString(),
      interactionCount: 0,
      satisfactionScore: 3.0
    };
  }

  /**
   * Get user interactions
   */
  private async getUserInteractions(userId: string): Promise<UserInteraction[]> {
    try {
      const interactions = await this.loadInteractions();
      return interactions[userId] || [];
    } catch (error) {
      console.error('Error getting user interactions:', error);
      return [];
    }
  }

  /**
   * Load preferences from file
   */
  private async loadPreferences(): Promise<Record<string, UserPreference>> {
    try {
      if (fs.existsSync(this.preferencesFile)) {
        const data = fs.readFileSync(this.preferencesFile, 'utf8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error('Error loading preferences:', error);
      return {};
    }
  }

  /**
   * Save preferences to file
   */
  private async savePreferences(preferences: Record<string, UserPreference>): Promise<void> {
    try {
      fs.writeFileSync(this.preferencesFile, JSON.stringify(preferences, null, 2));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Load interactions from file
   */
  private async loadInteractions(): Promise<Record<string, UserInteraction[]>> {
    try {
      if (fs.existsSync(this.interactionsFile)) {
        const data = fs.readFileSync(this.interactionsFile, 'utf8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error('Error loading interactions:', error);
      return {};
    }
  }

  /**
   * Save interactions to file
   */
  private async saveInteractions(interactions: Record<string, UserInteraction[]>): Promise<void> {
    try {
      fs.writeFileSync(this.interactionsFile, JSON.stringify(interactions, null, 2));
    } catch (error) {
      console.error('Error saving interactions:', error);
    }
  }
}

export default UserPreferenceLearning;
