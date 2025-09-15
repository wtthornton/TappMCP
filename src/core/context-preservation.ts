#!/usr/bin/env node

/**
 * Context Preservation System
 *
 * Manages context preservation and transitions across workflow phases
 * to maintain continuity and accuracy in AI assistant interactions.
 */

import { BusinessContext } from './business-context-broker.js';
import { EventEmitter } from 'events';

/**
 * Represents a snapshot of context at a specific point in time
 */
export interface ContextSnapshot {
  id: string;
  phase: string;
  role: string;
  context: BusinessContext;
  timestamp: number;
  source: string;
  accuracy: number;
  metadata: Record<string, any>;
}

/**
 * Represents a transition between two context states
 */
export interface ContextTransition {
  id: string;
  fromPhase: string;
  toPhase: string;
  fromContext: BusinessContext;
  toContext: BusinessContext;
  timestamp: number;
  accuracy: number;
  changes: string[];
  metadata: Record<string, any>;
}

/**
 * Context Preservation System
 *
 * Manages context preservation and transitions across workflow phases
 * to maintain continuity and accuracy in AI assistant interactions.
 */
export class ContextPreservationSystem extends EventEmitter {
  private contextHistory: ContextSnapshot[] = [];
  private contextTransitions: ContextTransition[] = [];
  private accuracyThreshold: number = 0.98;
  private maxHistorySize: number = 1000;

  constructor() {
    super();
  }

  /**
   * Capture a context snapshot at a specific point in time
   */
  captureContextSnapshot(
    phase: string,
    role: string,
    context: BusinessContext,
    source: string
  ): ContextSnapshot {
    const snapshot: ContextSnapshot = {
      id: this.generateId(),
      phase,
      role,
      context,
      timestamp: Date.now(),
      source,
      accuracy: this.calculateContextAccuracy(context),
      metadata: {
        version: '1.0.0',
        system: 'TappMCP',
      },
    };

    this.contextHistory.push(snapshot);
    this.trimHistory();

    // Emit event for monitoring
    this.emit('context-snapshot-captured', snapshot);

    return snapshot;
  }

  /**
   * Track a transition between two context states
   */
  trackContextTransition(
    fromPhase: string,
    toPhase: string,
    fromContext: BusinessContext,
    toContext: BusinessContext
  ): ContextTransition {
    const transition: ContextTransition = {
      id: this.generateId(),
      fromPhase,
      toPhase,
      fromContext,
      toContext,
      timestamp: Date.now(),
      accuracy: this.calculateTransitionAccuracy(fromContext, toContext),
      changes: this.identifyContextChanges(fromContext, toContext),
      metadata: {
        version: '1.0.0',
        system: 'TappMCP',
      },
    };

    this.contextTransitions.push(transition);

    // Check for accuracy degradation
    if (transition.accuracy < this.accuracyThreshold) {
      this.emit('context-accuracy-warning', {
        transition,
        threshold: this.accuracyThreshold,
        currentAccuracy: transition.accuracy,
      });
    }

    // Emit event for monitoring
    this.emit('context-transition-tracked', transition);

    return transition;
  }

  /**
   * Get all context transitions
   */
  getContextTransitions(): ContextTransition[] {
    return [...this.contextTransitions];
  }

  /**
   * Get context history
   */
  getContextHistory(): ContextSnapshot[] {
    return [...this.contextHistory];
  }

  /**
   * Get the latest context snapshot
   */
  getLatestContextSnapshot(): ContextSnapshot | null {
    return this.contextHistory.length > 0
      ? this.contextHistory[this.contextHistory.length - 1]
      : null;
  }

  /**
   * Validate context accuracy
   */
  validateContextAccuracy(context: BusinessContext): boolean {
    const accuracy = this.calculateContextAccuracy(context);
    return accuracy >= this.accuracyThreshold;
  }

  /**
   * Calculate context accuracy based on completeness and consistency
   */
  private calculateContextAccuracy(context: BusinessContext): number {
    let score = 0;
    let totalChecks = 0;

    // Check for required fields
    const requiredFields = ['projectName', 'description', 'requirements'];
    requiredFields.forEach(field => {
      totalChecks++;
      if (
        context[field as keyof BusinessContext] &&
        context[field as keyof BusinessContext] !== ''
      ) {
        score++;
      }
    });

    // Check for consistency in requirements
    if (context.requirements && Array.isArray(context.requirements)) {
      totalChecks++;
      if (context.requirements.length > 0) {
        score++;
      }
    }

    // Check for success criteria completeness
    if (context.success && context.success.criteria) {
      totalChecks++;
      if (context.success.criteria.length >= 2) {
        score++;
      }
    }

    return totalChecks > 0 ? score / totalChecks : 0;
  }

  /**
   * Calculate transition accuracy between two contexts
   */
  private calculateTransitionAccuracy(
    fromContext: BusinessContext,
    toContext: BusinessContext
  ): number {
    let score = 0;
    let totalChecks = 0;

    // Check for preserved fields
    const preservedFields = ['projectName', 'description', 'businessValue'];
    preservedFields.forEach(field => {
      totalChecks++;
      const fromValue = fromContext[field as keyof BusinessContext];
      const toValue = toContext[field as keyof BusinessContext];

      if (fromValue && toValue && fromValue === toValue) {
        score++;
      }
    });

    // Check for logical progression in requirements
    if (fromContext.requirements && toContext.requirements) {
      totalChecks++;
      if (
        Array.isArray(fromContext.requirements) &&
        Array.isArray(toContext.requirements) &&
        toContext.requirements.length >= fromContext.requirements.length
      ) {
        score++;
      }
    }

    return totalChecks > 0 ? score / totalChecks : 1.0;
  }

  /**
   * Identify changes between two contexts
   */
  private identifyContextChanges(
    fromContext: BusinessContext,
    toContext: BusinessContext
  ): string[] {
    const changes: string[] = [];

    // Compare each field
    Object.keys(toContext).forEach(key => {
      const fromValue = fromContext[key as keyof BusinessContext];
      const toValue = toContext[key as keyof BusinessContext];

      if (fromValue !== toValue) {
        changes.push(`${key}: ${fromValue} → ${toValue}`);
      }
    });

    return changes;
  }

  /**
   * Trim context history to maintain maximum size
   */
  private trimHistory(): void {
    if (this.contextHistory.length > this.maxHistorySize) {
      this.contextHistory = this.contextHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start context monitoring
   */
  startContextMonitoring(): void {
    // Implementation for starting context monitoring
    this.emit('context-monitoring-started');
  }

  /**
   * Stop context monitoring
   */
  stopContextMonitoring(): void {
    // Implementation for stopping context monitoring
    this.emit('context-monitoring-stopped');
  }

  /**
   * Get context history analysis
   */
  getContextHistoryAnalysis(): {
    totalSnapshots: number;
    totalTransitions: number;
    averageAccuracy: number;
    accuracyWarnings: number;
    recentActivity: ContextSnapshot[];
  } {
    const stats = this.getContextStatistics();
    const recentActivity = this.contextHistory.slice(-10); // Last 10 snapshots

    return {
      ...stats,
      recentActivity,
    };
  }

  /**
   * Clear all context data
   */
  clearContextData(): void {
    this.contextHistory = [];
    this.contextTransitions = [];
    this.emit('context-data-cleared');
  }

  /**
   * Get context statistics
   */
  getContextStatistics(): {
    totalSnapshots: number;
    totalTransitions: number;
    averageAccuracy: number;
    accuracyWarnings: number;
  } {
    const totalSnapshots = this.contextHistory.length;
    const totalTransitions = this.contextTransitions.length;

    const allAccuracies = [
      ...this.contextHistory.map(s => s.accuracy),
      ...this.contextTransitions.map(t => t.accuracy),
    ];

    const averageAccuracy =
      allAccuracies.length > 0
        ? allAccuracies.reduce((sum, acc) => sum + acc, 0) / allAccuracies.length
        : 1.0;

    const accuracyWarnings = this.contextTransitions.filter(
      t => t.accuracy < this.accuracyThreshold
    ).length;

    return {
      totalSnapshots,
      totalTransitions,
      averageAccuracy,
      accuracyWarnings,
    };
  }
}
