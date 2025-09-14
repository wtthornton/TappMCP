#!/usr/bin/env node
/**
 * Orchestration Engine for Smart Orchestrate Tool
 *
 * Main engine that coordinates workflow execution, role switching,
 * and business context management for complete SDLC orchestration.
 */
import { type BusinessContext, type RoleTransition } from './business-context-broker.js';
import { type QualityMetrics, type QualityAlert } from './quality-monitor.js';
import { type ContextSnapshot, type ContextTransition } from './context-preservation.js';
import { type PerformanceMetrics } from './context7-performance-optimizer.js';
import { MetricsBroadcaster } from '../websocket/MetricsBroadcaster.js';
/**
 * Represents a complete workflow with phases, tasks, and business context
 *
 * A workflow defines the structure and execution plan for a business request,
 * including all phases, tasks, and their relationships within the SDLC process.
 *
 * @interface Workflow
 * @property {string} id - Unique identifier for the workflow
 * @property {string} name - Human-readable name for the workflow
 * @property {string} type - Type of workflow (e.g., 'sdlc', 'project', 'quality')
 * @property {WorkflowPhase[]} phases - Array of workflow phases to be executed
 * @property {BusinessContext} businessContext - Business context and requirements
 * @property {string} [currentPhase] - Currently active phase identifier
 * @property {'pending'|'running'|'completed'|'failed'|'paused'} status - Current workflow status
 *
 * @example
 * ```typescript
 * const workflow: Workflow = {
 *   id: "wf-001",
 *   name: "User Management System",
 *   type: "sdlc",
 *   phases: [planningPhase, developmentPhase, testingPhase],
 *   businessContext: businessContext,
 *   status: "pending"
 * };
 * ```
 *
 * @since 2.0.0
 */
export interface Workflow {
    id: string;
    name: string;
    type: string;
    phases: WorkflowPhase[];
    businessContext: BusinessContext;
    currentPhase?: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
}
/**
 * Represents an individual task within a workflow phase
 *
 * A workflow task defines a specific deliverable or action within a phase,
 * including its requirements, dependencies, and execution details.
 *
 * @interface WorkflowTask
 * @property {string} id - Unique identifier for the task
 * @property {string} name - Human-readable name for the task
 * @property {string} description - Detailed description of what the task accomplishes
 * @property {string} type - Type of task (e.g., 'analysis', 'development', 'testing')
 * @property {string} [role] - Required role for executing this task
 * @property {string} [phase] - Phase this task belongs to
 * @property {string[]} [deliverables] - Expected deliverables from this task
 * @property {number} [estimatedTime] - Estimated time to complete in minutes
 * @property {'pending'|'running'|'completed'|'failed'} status - Current task status
 * @property {number} [estimatedDuration] - Alternative duration estimate
 * @property {string[]} [dependencies] - Array of task IDs that must complete first
 *
 * @example
 * ```typescript
 * const task: WorkflowTask = {
 *   id: "task-001",
 *   name: "Requirements Analysis",
 *   description: "Analyze business requirements and create technical specifications",
 *   type: "analysis",
 *   role: "product-strategist",
 *   phase: "planning",
 *   deliverables: ["requirements-doc", "technical-spec"],
 *   estimatedTime: 120,
 *   status: "pending"
 * };
 * ```
 *
 * @since 2.0.0
 */
export interface WorkflowTask {
    id: string;
    name: string;
    description: string;
    type: string;
    role?: string;
    phase?: string;
    deliverables?: string[];
    estimatedTime?: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    estimatedDuration?: number;
    dependencies?: string[];
}
export interface WorkflowPhase {
    name: string;
    description: string;
    role: string;
    tools: string[];
    tasks: WorkflowTask[];
    dependencies: string[];
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: string;
    endTime?: string;
    context7Config?: Context7PhaseConfig;
    intelligenceLevel?: 'basic' | 'intermediate' | 'advanced';
    domainType?: string;
    recommendedTopics?: string[];
}
export interface Context7PhaseConfig {
    enabled: boolean;
    topics: string[];
    intelligenceLevel: 'basic' | 'intermediate' | 'advanced';
    domainType: string;
    refreshInterval?: number;
    lastUpdated?: string;
    cacheEnabled: boolean;
    retryEnabled: boolean;
    fallbackEnabled: boolean;
}
export interface ProjectStructure {
    projectType: string;
    framework: string;
    architecture: string;
    fileStructure: string[];
    complexity: number;
    technologies: string[];
}
export interface SecurityAnalysis {
    vulnerabilities: string[];
    securityScore: number;
    recommendations: string[];
    compliance: string[];
}
export interface CodeQualityAnalysis {
    complexity: number;
    maintainability: number;
    testCoverage: number;
    codeSmells: string[];
    qualityScore: number;
}
export interface DependencyAnalysis {
    dependencies: string[];
    vulnerabilities: string[];
    outdated: string[];
    recommendations: string[];
}
export interface ProjectRecommendation {
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    actions: string[];
}
export interface ContextualRecommendation {
    id: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    effort: 'low' | 'medium' | 'high';
    businessValue: number;
    technicalComplexity: number;
    actions: string[];
    context: string;
    rationale: string;
    priorityScore?: number;
    roiScore?: number;
    recommended?: boolean;
}
export interface QualityCheck {
    name: string;
    category: string;
    status: 'passed' | 'failed' | 'warning';
    score: number;
    threshold: number;
    message: string;
    details: Record<string, any>;
}
export interface QualityGateResult {
    phaseName: string;
    passed: boolean;
    qualityScore: number;
    threshold: number;
    checks: QualityCheck[];
    recommendations: string[];
    timestamp: string;
}
export interface QualityIssue {
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    score: number;
    threshold: number;
}
export interface QualityAssessment {
    overallScore: number;
    categoryScores: Record<string, number>;
    issues: QualityIssue[];
    recommendations: string[];
    timestamp: number;
}
export interface QualityAlert {
    id: string;
    type: 'degradation' | 'critical' | 'warning';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details: Record<string, any>;
    timestamp: number;
}
export interface QualityHistoryEntry {
    timestamp: number;
    qualityScore: number;
    categoryScores: Record<string, number>;
    issues: QualityIssue[];
    recommendations: string[];
}
export interface QualityMonitoringState {
    workflowId: string;
    context: BusinessContext;
    startTime: number;
    endTime?: number;
    lastCheck: number;
    qualityHistory: QualityHistoryEntry[];
    alerts: QualityAlert[];
    isActive: boolean;
}
export interface QualityMonitoringStatus {
    workflowId: string;
    isActive: boolean;
    startTime: number;
    endTime?: number;
    lastCheck: number;
    totalChecks: number;
    currentScore: number;
    averageScore: number;
    alertsCount: number;
    recentAlerts: QualityAlert[];
}
export interface QualityTrend {
    timestamp: number;
    qualityScore: number;
    categoryScores: Record<string, number>;
    issuesCount: number;
    recommendationsCount: number;
}
export interface ContextPreservationState {
    contextHistory: ContextHistoryEntry[];
    currentContext: WorkflowContext;
    contextAccuracy: number;
    validationResults: ContextValidationResult[];
    lastUpdated: number;
    isHealthy: boolean;
}
export interface ContextHistoryEntry {
    id: string;
    timestamp: number;
    phase: string;
    context: WorkflowContext;
    accuracy: number;
    validationStatus: 'valid' | 'invalid' | 'warning';
    changes: ContextChange[];
    source: 'user' | 'ai' | 'system' | 'context7';
}
export interface WorkflowContext {
    id: string;
    phase: string;
    businessRequirements: string;
    technicalRequirements: string;
    constraints: string[];
    assumptions: string[];
    decisions: ContextDecision[];
    artifacts: ContextArtifact[];
    relationships: ContextRelationship[];
    metadata: ContextMetadata;
}
export interface ContextDecision {
    id: string;
    decision: string;
    rationale: string;
    alternatives: string[];
    impact: 'low' | 'medium' | 'high';
    timestamp: number;
    phase: string;
    stakeholders: string[];
}
export interface ContextArtifact {
    id: string;
    name: string;
    type: 'document' | 'code' | 'diagram' | 'data' | 'configuration';
    content: string;
    version: string;
    phase: string;
    dependencies: string[];
    metadata: Record<string, any>;
}
export interface ContextRelationship {
    id: string;
    from: string;
    to: string;
    type: 'depends_on' | 'implements' | 'extends' | 'conflicts_with' | 'replaces';
    strength: number;
    description: string;
}
export interface ContextMetadata {
    created: number;
    lastModified: number;
    version: string;
    author: string;
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface ContextChange {
    id: string;
    type: 'addition' | 'modification' | 'deletion' | 'replacement';
    field: string;
    oldValue?: any;
    newValue?: any;
    reason: string;
    timestamp: number;
    author: string;
}
export interface ContextValidationResult {
    id: string;
    timestamp: number;
    phase: string;
    validationType: 'completeness' | 'consistency' | 'accuracy' | 'relevance';
    status: 'pass' | 'fail' | 'warning';
    score: number;
    issues: ContextValidationIssue[];
    recommendations: string[];
}
export interface ContextValidationIssue {
    id: string;
    type: 'missing' | 'inconsistent' | 'inaccurate' | 'irrelevant' | 'conflicting';
    severity: 'low' | 'medium' | 'high' | 'critical';
    field: string;
    description: string;
    suggestion?: string;
    phase: string;
}
export interface ContextAccuracyMetrics {
    overallAccuracy: number;
    phaseAccuracy: Record<string, number>;
    fieldAccuracy: Record<string, number>;
    trend: 'improving' | 'stable' | 'declining';
    confidence: number;
    lastCalculated: number;
}
export interface ContextContinuityCheck {
    phase: string;
    continuityScore: number;
    missingElements: string[];
    conflictingElements: string[];
    recommendations: string[];
    timestamp: number;
}
export interface IntelligenceDetectionState {
    templateDetectionEnabled: boolean;
    intelligenceScoringEnabled: boolean;
    responseQualityTracking: boolean;
    sourceTrackingEnabled: boolean;
    detectionThresholds: IntelligenceThresholds;
    lastUpdated: number;
}
export interface IntelligenceThresholds {
    templateThreshold: number;
    realIntelligenceThreshold: number;
    qualityThreshold: number;
    confidenceThreshold: number;
}
export interface TemplateDetectionResult {
    isTemplate: boolean;
    confidence: number;
    templateType?: 'generic' | 'placeholder' | 'boilerplate' | 'standard';
    detectedPatterns: string[];
    suggestions: string[];
    timestamp: number;
}
export interface IntelligenceScore {
    overallScore: number;
    domainRelevance: number;
    specificity: number;
    originality: number;
    accuracy: number;
    completeness: number;
    confidence: number;
    timestamp: number;
}
export interface ResponseQualityMetrics {
    responseId: string;
    qualityScore: number;
    intelligenceScore: IntelligenceScore;
    templateDetection: TemplateDetectionResult;
    sourceTracking: IntelligenceSourceTracking;
    recommendations: string[];
    timestamp: number;
}
export interface IntelligenceSourceTracking {
    sources: IntelligenceSource[];
    primarySource: string;
    sourceReliability: number;
    lastVerified: number;
    verificationStatus: 'verified' | 'unverified' | 'pending';
}
export interface IntelligenceSource {
    id: string;
    name: string;
    type: 'context7' | 'project_analysis' | 'domain_expertise' | 'user_input' | 'ai_generated';
    reliability: number;
    lastUpdated: number;
    contribution: number;
    metadata: Record<string, any>;
}
export interface TemplatePattern {
    id: string;
    name: string;
    pattern: RegExp;
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
}
export interface IntelligenceAnalysisResult {
    responseId: string;
    isTemplate: boolean;
    intelligenceScore: IntelligenceScore;
    qualityMetrics: ResponseQualityMetrics;
    recommendations: string[];
    confidence: number;
    timestamp: number;
}
export interface DomainExpertiseState {
    expertiseEnabled: boolean;
    categoryExpertise: Map<string, CategoryExpertise>;
    realTimeUpdates: boolean;
    bestPracticeIntegration: boolean;
    expertiseValidation: boolean;
    lastUpdated: number;
}
export interface CategoryExpertise {
    category: string;
    expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    knowledgeAreas: string[];
    bestPractices: BestPractice[];
    commonPatterns: CommonPattern[];
    antiPatterns: AntiPattern[];
    tools: ExpertiseTool[];
    frameworks: ExpertiseFramework[];
    lastUpdated: number;
    confidence: number;
}
export interface BestPractice {
    id: string;
    name: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    implementation: string;
    benefits: string[];
    examples: string[];
    references: string[];
    lastUpdated: number;
}
export interface CommonPattern {
    id: string;
    name: string;
    description: string;
    category: string;
    useCases: string[];
    implementation: string;
    benefits: string[];
    tradeoffs: string[];
    examples: string[];
    lastUpdated: number;
}
export interface AntiPattern {
    id: string;
    name: string;
    description: string;
    category: string;
    symptoms: string[];
    consequences: string[];
    solutions: string[];
    prevention: string[];
    examples: string[];
    lastUpdated: number;
}
export interface ExpertiseTool {
    id: string;
    name: string;
    category: string;
    type: 'library' | 'framework' | 'service' | 'platform' | 'utility';
    description: string;
    useCases: string[];
    pros: string[];
    cons: string[];
    alternatives: string[];
    documentation: string;
    lastUpdated: number;
}
export interface ExpertiseFramework {
    id: string;
    name: string;
    category: string;
    description: string;
    architecture: string;
    patterns: string[];
    bestPractices: string[];
    commonIssues: string[];
    performance: string;
    scalability: string;
    security: string;
    lastUpdated: number;
}
export interface ExpertiseDeliveryResult {
    responseId: string;
    domain: string;
    expertiseLevel: string;
    deliveredKnowledge: DeliveredKnowledge[];
    bestPracticesApplied: BestPractice[];
    patternsUsed: CommonPattern[];
    antiPatternsAvoided: AntiPattern[];
    toolsRecommended: ExpertiseTool[];
    frameworksSuggested: ExpertiseFramework[];
    confidence: number;
    qualityScore: number;
    timestamp: number;
}
export interface DeliveredKnowledge {
    id: string;
    type: 'concept' | 'pattern' | 'practice' | 'tool' | 'framework' | 'anti-pattern';
    name: string;
    description: string;
    relevance: number;
    confidence: number;
    source: string;
    metadata: Record<string, any>;
}
export interface ExpertiseValidationResult {
    responseId: string;
    domain: string;
    validationScore: number;
    expertiseAccuracy: number;
    bestPracticeCompliance: number;
    patternCorrectness: number;
    toolAppropriateness: number;
    frameworkSuitability: number;
    issues: ExpertiseIssue[];
    recommendations: string[];
    timestamp: number;
}
export interface ExpertiseIssue {
    id: string;
    type: 'inaccuracy' | 'outdated' | 'inappropriate' | 'missing' | 'conflicting';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    suggestion: string;
    category: string;
    confidence: number;
}
export interface ResponseRelevanceState {
    relevanceScoringEnabled: boolean;
    feedbackLoopsEnabled: boolean;
    continuousImprovementEnabled: boolean;
    effectivenessTrackingEnabled: boolean;
    relevanceThresholds: RelevanceThresholds;
    lastUpdated: number;
}
export interface RelevanceThresholds {
    highRelevance: number;
    mediumRelevance: number;
    lowRelevance: number;
    minimumRelevance: number;
}
export interface RelevanceScore {
    overallScore: number;
    topicRelevance: number;
    contextRelevance: number;
    userIntentRelevance: number;
    domainRelevance: number;
    temporalRelevance: number;
    confidence: number;
    timestamp: number;
}
export interface ResponseQualityFeedback {
    responseId: string;
    workflowId: string;
    userRating?: number;
    userFeedback?: string;
    relevanceScore: RelevanceScore;
    qualityMetrics: ResponseQualityMetrics;
    improvementSuggestions: string[];
    timestamp: number;
}
export interface ContinuousImprovementState {
    workflowId: string;
    improvementCycles: number;
    lastImprovement: number;
    performanceTrend: 'improving' | 'stable' | 'declining';
    adaptationRate: number;
    learningRate: number;
    successRate: number;
    lastUpdated: number;
}
export interface ResponseEffectivenessMetrics {
    responseId: string;
    workflowId: string;
    effectivenessScore: number;
    userSatisfaction: number;
    taskCompletion: number;
    timeToResolution: number;
    followUpRequired: boolean;
    userEngagement: number;
    conversionRate: number;
    timestamp: number;
}
export interface RelevanceAnalysisResult {
    responseId: string;
    workflowId: string;
    relevanceScore: RelevanceScore;
    qualityFeedback: ResponseQualityFeedback;
    effectivenessMetrics: ResponseEffectivenessMetrics;
    improvementState: ContinuousImprovementState;
    recommendations: string[];
    timestamp: number;
}
export interface RelevanceLearningData {
    patterns: RelevancePattern[];
    userPreferences: UserPreference[];
    contextCorrelations: ContextCorrelation[];
    successFactors: SuccessFactor[];
    lastUpdated: number;
}
export interface RelevancePattern {
    id: string;
    pattern: string;
    relevanceScore: number;
    frequency: number;
    successRate: number;
    context: string;
    lastSeen: number;
}
export interface UserPreference {
    userId: string;
    domain: string;
    preferredStyle: string;
    complexityLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    responseLength: 'short' | 'medium' | 'long' | 'detailed';
    technicalDepth: 'basic' | 'intermediate' | 'advanced' | 'expert';
    lastUpdated: number;
}
export interface ContextCorrelation {
    context: string;
    domain: string;
    relevanceScore: number;
    frequency: number;
    successRate: number;
    lastUpdated: number;
}
export interface SuccessFactor {
    factor: string;
    weight: number;
    impact: number;
    frequency: number;
    lastUpdated: number;
}
export interface WorkflowResult {
    workflowId: string;
    success: boolean;
    phases: WorkflowPhaseResult[];
    businessValue: BusinessValueResult;
    roleTransitions: RoleTransition[];
    technicalMetrics: OrchestrationMetrics;
    errors?: string[];
    iconData?: {
        status: 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
        progress: number;
        currentPhase: string;
        systemHealth: 'healthy' | 'degraded' | 'unhealthy' | 'maintenance';
    };
}
export interface WorkflowPhaseResult {
    phase: string;
    role: string;
    success: boolean;
    deliverables: string[];
    qualityMetrics: Record<string, number>;
    duration: number;
    issues?: string[];
    context7Insights?: {
        documentation: any[];
        codeExamples: any[];
        bestPractices: any[];
        troubleshooting: any[];
    };
}
export interface BusinessValueResult {
    costPrevention: number;
    timeToMarket: number;
    qualityImprovement: number;
    riskMitigation: number;
    strategicAlignment: number;
    businessScore: number;
}
export interface OrchestrationMetrics {
    totalExecutionTime: number;
    roleTransitionTime: number;
    contextPreservationAccuracy: number;
    phaseSuccessRate: number;
    businessAlignmentScore: number;
    performanceScore: number;
}
export interface ValidationResult {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
    score: number;
}
export interface OptimizedWorkflow {
    original: Workflow;
    optimized: Workflow;
    improvements: string[];
    estimatedImprovements: {
        timeReduction: number;
        qualityIncrease: number;
        costReduction: number;
    };
}
/**
 * Main Orchestration Engine for complete workflow management
 */
/**
 * OrchestrationEngine - Central coordination engine for Smart Orchestrate workflows
 *
 * This class provides comprehensive workflow orchestration capabilities including:
 * - Business context management and role transitions
 * - Context7 intelligence integration with caching and fallback mechanisms
 * - Quality gates and validation throughout the SDLC process
 * - Performance monitoring and error handling with circuit breaker patterns
 * - Domain-specific intelligence delivery and response relevance scoring
 *
 * @example
 * ```typescript
 * const engine = new OrchestrationEngine();
 * const result = await engine.orchestrateWorkflow({
 *   request: "Build a user management system with authentication",
 *   options: { qualityLevel: "high" }
 * });
 * ```
 *
 * @since 2.0.0
 * @author TappMCP Team
 */
export declare class OrchestrationEngine {
    /** Business context broker for managing role transitions and business requirements */
    private contextBroker;
    /** Context7 broker for accessing external intelligence and documentation */
    private context7Broker;
    /** Project analysis tools for real analysis integration */
    private projectScanner;
    private securityScanner;
    private staticAnalyzer;
    private qualityMonitor;
    private contextPreservation;
    private context7Optimizer;
    /** Map of currently active workflows by workflow ID */
    private activeWorkflows;
    /** Map of completed workflow results by workflow ID */
    private workflowResults;
    /** Role orchestrator for managing role-specific behavior (TODO: Define proper type) */
    private roleOrchestrator;
    /** Enhanced caching for workflow-specific data with TTL support */
    private workflowCache;
    /** Context7 response cache to reduce API calls and improve performance */
    private context7Cache;
    /** Metrics broadcaster for real-time workflow updates */
    private metricsBroadcaster;
    /** Cache for Context7 topics to optimize topic discovery */
    private topicCache;
    /** Retry attempt tracking for failed operations */
    private retryAttempts;
    /** Circuit breaker state management for external service resilience */
    private circuitBreakerState;
    /** Maximum number of retry attempts for failed operations */
    private maxRetries;
    /** Base delay for retry operations in milliseconds */
    private retryDelay;
    private circuitBreakerThreshold;
    private circuitBreakerTimeout;
    private intelligenceEngines;
    private qualityMonitoringState;
    private monitoringIntervals;
    private qualityMonitoringInterval;
    private qualityCheckInterval;
    private qualityDegradationThreshold;
    private maxQualityHistorySize;
    private contextPreservationState;
    private contextHistoryCache;
    private contextValidationCache;
    private contextAccuracyThreshold;
    private maxContextHistorySize;
    private contextValidationInterval;
    private intelligenceDetectionState;
    private responseQualityCache;
    private templatePatterns;
    private intelligenceSourceCache;
    private intelligenceAnalysisCache;
    private maxResponseHistorySize;
    private domainExpertiseState;
    private expertiseKnowledgeCache;
    private bestPracticesCache;
    private patternsCache;
    private antiPatternsCache;
    private toolsCache;
    private frameworksCache;
    private expertiseValidationCache;
    private maxExpertiseHistorySize;
    private responseRelevanceState;
    private relevanceScoreCache;
    private qualityFeedbackCache;
    private effectivenessMetricsCache;
    private continuousImprovementState;
    private relevanceLearningData;
    private maxRelevanceHistorySize;
    /**
     * Creates a new OrchestrationEngine instance
     *
     * Initializes all required brokers, caches, and monitoring systems.
     * Sets up LRU caches with appropriate TTL values for different data types.
     *
     * @example
     * ```typescript
     * const engine = new OrchestrationEngine();
     * ```
     *
     * @since 2.0.0
     */
    constructor();
    /**
     * Sets the metrics broadcaster for real-time workflow updates
     *
     * @param broadcaster - Metrics broadcaster instance
     *
     * @example
     * ```typescript
     * orchestrationEngine.setMetricsBroadcaster(metricsBroadcaster);
     * ```
     *
     * @since 2.0.0
     */
    setMetricsBroadcaster(broadcaster: MetricsBroadcaster): void;
    /**
     * Dynamically loads an intelligence engine with caching
     *
     * @param engineName - Name of the engine to load
     * @returns Promise resolving to the engine class
     *
     * @example
     * ```typescript
     * const QualityEngine = await engine.loadIntelligenceEngine('QualityAssuranceEngine');
     * ```
     *
     * @since 2.0.0
     */
    private loadIntelligenceEngine;
    /**
     * Preloads all intelligence engines for better performance
     *
     * @returns Promise resolving when all engines are loaded
     *
     * @example
     * ```typescript
     * await engine.preloadIntelligenceEngines();
     * ```
     *
     * @since 2.0.0
     */
    preloadIntelligenceEngines(): Promise<void>;
    /**
     * Execute a complete workflow with role orchestration and context management
     */
    /**
     * Executes a complete workflow with business context and quality monitoring
     *
     * This method orchestrates the execution of a workflow through all its phases,
     * managing role transitions, quality gates, and business value tracking.
     *
     * @param workflow - The workflow to execute with phases and tasks
     * @param context - Business context including goals, requirements, and constraints
     * @returns Promise resolving to workflow execution results with metrics and outcomes
     *
     * @example
     * ```typescript
     * const workflow = createSDLCWorkflow("Build user management system");
     * const context = {
     *   projectId: "user-mgmt-001",
     *   businessGoals: ["Improve user experience"],
     *   requirements: ["OAuth integration"]
     * };
     * const result = await engine.executeWorkflow(workflow, context);
     * ```
     *
     * @throws {Error} When workflow execution fails or quality gates are not met
     * @since 2.0.0
     */
    executeWorkflow(workflow: Workflow, context: BusinessContext): Promise<WorkflowResult>;
    /**
     * Enhance workflow phases with Context7 configuration
     */
    private enhanceWorkflowPhasesWithContext7;
    /**
     * Get refresh interval for a specific phase
     */
    private getRefreshIntervalForPhase;
    /**
     * Role switching now handled by individual tools
     * No complex orchestration needed
     */
    switchRole(fromRole: string, toRole: string, context: BusinessContext): Promise<RoleTransition>;
    /**
     * Validate workflow before execution
     */
    validateWorkflow(workflow: Workflow): ValidationResult;
    /**
     * Optimize workflow for better performance and quality
     */
    optimizeWorkflow(workflow: Workflow): OptimizedWorkflow;
    /**
     * Get active workflows
     */
    getActiveWorkflows(): Workflow[];
    /**
     * Get workflow results
     */
    getWorkflowResult(workflowId: string): WorkflowResult | null;
    /**
     * Private helper methods
     */
    private executePhase;
    /**
     * Gather Context7 insights for a workflow phase with enhanced error handling, caching, and depth-based intelligence
     */
    private gatherContext7Insights;
    /**
     * Determine intelligence level based on phase, role, and context complexity
     */
    private determineIntelligenceLevel;
    /**
     * Process Context7 result and handle errors
     */
    private processContext7Result;
    /**
     * Get fallback data by type
     */
    private getFallbackByType;
    /**
     * Get cached Context7 insights
     */
    private getCachedInsights;
    /**
     * Set cached Context7 insights
     */
    private setCachedInsights;
    /**
     * Get Context7 topics with caching
     */
    private getContext7TopicsCached;
    /**
     * Get Context7 topics based on phase, role, and context with domain-specific intelligence
     */
    private getContext7Topics;
    /**
     * Get domain-specific topics based on project analysis
     */
    private getDomainSpecificTopics;
    /**
     * Check if project has graph visualization requirements
     */
    private hasGraphVisualizationRequirements;
    /**
     * Get specialized graph visualization topics
     */
    private getGraphVisualizationTopics;
    /**
     * Get graph visualization library recommendations
     */
    getGraphVisualizationRecommendations(context: BusinessContext): {
        primaryLibrary: string;
        secondaryLibraries: string[];
        chartTypes: string[];
        performanceTips: string[];
        integrationGuide: string;
    };
    /**
     * Analyze project type based on business context
     */
    private analyzeProjectType;
    /**
     * Gather documentation from Context7 with enhanced error handling, caching, and retry logic
     */
    private gatherDocumentationCached;
    /**
     * Gather documentation from Context7 with enhanced error handling (legacy method)
     */
    private gatherDocumentation;
    /**
     * Gather code examples from Context7 with enhanced error handling, caching, and retry logic
     */
    private gatherCodeExamplesCached;
    /**
     * Gather code examples from Context7 with enhanced error handling (legacy method)
     */
    private gatherCodeExamples;
    /**
     * Gather best practices from Context7 with enhanced error handling, caching, and retry logic
     */
    private gatherBestPracticesCached;
    /**
     * Gather best practices from Context7 with enhanced error handling (legacy method)
     */
    private gatherBestPractices;
    /**
     * Gather troubleshooting guides from Context7 with enhanced error handling, caching, and retry logic
     */
    private gatherTroubleshootingCached;
    /**
     * Gather troubleshooting guides from Context7 with enhanced error handling (legacy method)
     */
    private gatherTroubleshooting;
    private generatePhaseDeliverables;
    /**
     * Format Context7 insights for AI assistant consumption
     */
    private formatContext7InsightsForAI;
    /**
     * Generate Context7 summary for AI assistant
     */
    private generateContext7Summary;
    /**
     * Extract key insights from Context7 data
     */
    private extractKeyInsights;
    /**
     * Generate recommendations based on Context7 insights
     */
    private generateRecommendations;
    /**
     * Format code examples for AI assistant consumption
     */
    private formatCodeExamples;
    /**
     * Format best practices for AI assistant consumption
     */
    private formatBestPractices;
    /**
     * Format troubleshooting guides for AI assistant consumption
     */
    private formatTroubleshooting;
    private calculatePhaseQualityMetrics;
    /**
     * Calculate Context7 insights bonus for quality metrics
     */
    private calculateContext7Bonus;
    /**
     * Fallback documentation when Context7 is unavailable
     */
    private getFallbackDocumentation;
    /**
     * Fallback code examples when Context7 is unavailable
     */
    private getFallbackCodeExamples;
    /**
     * Fallback best practices when Context7 is unavailable
     */
    private getFallbackBestPractices;
    /**
     * Fallback troubleshooting when Context7 is unavailable
     */
    private getFallbackTroubleshooting;
    private calculateBusinessValue;
    private calculateTechnicalMetrics;
    private optimizePhaseOrder;
    private optimizeRoleTransitions;
    private optimizeToolUsage;
    private calculateContextPreservationAccuracy;
    /**
     * Cache management methods
     */
    /**
     * Get cache statistics for all caches
     */
    getCacheStats(): {
        workflowCache: {
            size: number;
            maxSize: number;
            ttl: number;
        };
        context7Cache: {
            size: number;
            maxSize: number;
            ttl: number;
        };
        topicCache: {
            size: number;
            maxSize: number;
            ttl: number;
        };
        context7Broker: {
            size: number;
            maxSize: number;
            hitRate: string;
            memoryUsage: string;
        };
    };
    /**
     * Clear all caches
     */
    clearAllCaches(): void;
    /**
     * Clear specific cache by type
     */
    clearCache(type: 'workflow' | 'context7' | 'topics' | 'all'): void;
    /**
     * Check if caches are healthy
     */
    isCacheHealthy(): {
        workflow: boolean;
        context7: boolean;
        topics: boolean;
        broker: boolean;
        overall: boolean;
    };
    /**
     * Warm up caches with common topics
     */
    warmupCaches(commonTopics?: string[]): Promise<void>;
    /**
     * Real-time update capabilities for Context7 insights
     */
    refreshContext7Insights(phase: WorkflowPhase, role: string, context: BusinessContext): Promise<void>;
    /**
     * Get domain-specific intelligence summary
     */
    getDomainIntelligenceSummary(context: BusinessContext): {
        domainType: string;
        intelligenceLevel: string;
        recommendedTopics: string[];
        complexityScore: number;
    };
    /**
     * Get current quality metrics
     */
    getQualityMetrics(): QualityMetrics | null;
    /**
     * Get quality trend history
     */
    getQualityTrendHistory(limit?: number): any[];
    /**
     * Get active quality alerts
     */
    getActiveQualityAlerts(): QualityAlert[];
    /**
     * Get quality dashboard data
     */
    getQualityDashboardData(): any;
    /**
     * Acknowledge quality alert
     */
    acknowledgeQualityAlert(alertId: string): boolean;
    /**
     * Resolve quality alert
     */
    resolveQualityAlert(alertId: string): boolean;
    /**
     * Start context preservation monitoring
     */
    startContextPreservationMonitoring(): void;
    /**
     * Stop context preservation monitoring
     */
    stopContextPreservationMonitoring(): void;
    /**
     * Capture context snapshot for a phase
     */
    captureContextSnapshot(phase: string, role: string, context: BusinessContext): ContextSnapshot;
    /**
     * Track context transition between phases
     */
    trackContextTransition(fromPhase: string, toPhase: string, oldContext: BusinessContext, newContext: BusinessContext): ContextTransition;
    /**
     * Get context history analysis
     */
    getContextHistoryAnalysis(): any;
    /**
     * Get context preservation dashboard data
     */
    getContextPreservationDashboard(): {
        history: ContextSnapshot[];
        transitions: ContextTransition[];
        analysis: any;
    };
    /**
     * Get Context7 performance metrics
     */
    getContext7PerformanceMetrics(): PerformanceMetrics;
    /**
     * Get Context7 cache statistics
     */
    getContext7CacheStats(): any;
    /**
     * Get Context7 performance alerts
     */
    getContext7PerformanceAlerts(): PerformanceAlert[];
    /**
     * Get Context7 optimization recommendations
     */
    getContext7OptimizationRecommendations(): string[];
    /**
     * Clear Context7 cache
     */
    clearContext7Cache(): void;
    /**
     * Optimized documentation gathering
     */
    private gatherDocumentationOptimized;
    /**
     * Optimized code examples gathering
     */
    private gatherCodeExamplesOptimized;
    /**
     * Optimized best practices gathering
     */
    private gatherBestPracticesOptimized;
    /**
     * Optimized troubleshooting gathering
     */
    private gatherTroubleshootingOptimized;
    /**
     * Calculate complexity score for project
     */
    private calculateProjectComplexityScore;
    /**
     * Determine intelligence level from complexity score
     */
    private determineIntelligenceLevelFromScore;
    /**
     * Retry logic and circuit breaker methods
     */
    /**
     * Execute a function with retry logic and circuit breaker
     */
    private executeWithRetry;
    /**
     * Calculate retry delay with exponential backoff and jitter
     */
    private calculateRetryDelay;
    /**
     * Sleep for specified milliseconds
     */
    private sleep;
    /**
     * Check if circuit breaker is open for an operation
     */
    private isCircuitBreakerOpen;
    /**
     * Record a failure for circuit breaker tracking
     */
    private recordFailure;
    /**
     * Reset circuit breaker after successful operation
     */
    private resetCircuitBreaker;
    /**
     * Get retry and circuit breaker statistics
     */
    getRetryStats(): {
        retryAttempts: {
            [k: string]: number;
        };
        circuitBreakerStates: {
            [k: string]: {
                failures: number;
                lastFailure: number;
                state: "closed" | "open" | "half-open";
            };
        };
        maxRetries: number;
        retryDelay: number;
        circuitBreakerThreshold: number;
        circuitBreakerTimeout: number;
    };
    /**
     * Reset retry and circuit breaker state
     */
    resetRetryState(): void;
    /**
     * Real project analysis integration
     */
    /**
     * Analyze project structure and generate insights
     */
    analyzeProject(context: BusinessContext): Promise<{
        projectStructure: ProjectStructure;
        securityAnalysis: SecurityAnalysis;
        codeQuality: CodeQualityAnalysis;
        dependencies: DependencyAnalysis;
        recommendations: ProjectRecommendation[];
    }>;
    /**
     * Analyze project structure using real project scanning
     */
    private analyzeProjectStructure;
    /**
     * Perform security analysis using real security scanning
     */
    private performSecurityAnalysis;
    /**
     * Analyze code quality using real static analysis
     */
    private analyzeCodeQuality;
    /**
     * Perform comprehensive project analysis using all available tools
     */
    private performComprehensiveAnalysis;
    /**
     * Helper methods for processing real analysis results
     */
    private detectFrameworkFromAnalysis;
    private detectArchitectureFromAnalysis;
    private inferFileStructureFromAnalysis;
    private calculateProjectComplexityFromAnalysis;
    private calculateSecurityScoreFromScan;
    private generateSecurityRecommendationsFromScan;
    private checkComplianceFromScan;
    /**
     * Generate AI assistant guidance based on role, context, and analysis results
     */
    private generateAIAssistantGuidance;
    /**
     * Get role-specific guidance for AI assistants
     */
    private getRoleSpecificGuidance;
    /**
     * Get contextual recommendations based on analysis results
     */
    private getContextualRecommendations;
    /**
     * Get priority actions based on role and analysis
     */
    private getPriorityActions;
    /**
     * Get best practices for the role and project type
     */
    private getBestPractices;
    /**
     * Get common pitfalls to avoid
     */
    private getCommonPitfalls;
    /**
     * Get next steps based on current state
     */
    private getNextSteps;
    /**
     * Analyze dependencies
     */
    private analyzeDependencies;
    /**
     * Generate project recommendations
     */
    private generateProjectRecommendations;
    private detectFramework;
    private detectArchitecture;
    private inferFileStructure;
    private calculateProjectComplexity;
    private detectTechnologies;
    private detectVulnerabilities;
    private calculateSecurityScore;
    private generateSecurityRecommendations;
    private checkCompliance;
    private calculateCodeComplexity;
    private calculateMaintainability;
    private estimateTestCoverage;
    private detectCodeSmells;
    private detectDependencies;
    private detectDependencyVulnerabilities;
    private detectOutdatedDependencies;
    private generateDependencyRecommendations;
    private getFallbackProjectAnalysis;
    /**
     * Contextual recommendation engine
     */
    /**
     * Generate contextual recommendations based on project analysis and business context
     */
    generateContextualRecommendations(context: BusinessContext, projectAnalysis?: {
        projectStructure: ProjectStructure;
        securityAnalysis: SecurityAnalysis;
        codeQuality: CodeQualityAnalysis;
        dependencies: DependencyAnalysis;
    }): ContextualRecommendation[];
    /**
     * Generate business context-based recommendations
     */
    private generateBusinessContextRecommendations;
    /**
     * Generate analysis-based recommendations
     */
    private generateAnalysisBasedRecommendations;
    /**
     * Generate domain-specific recommendations
     */
    private generateDomainSpecificRecommendations;
    /**
     * Score recommendations based on business value and technical complexity
     */
    private scoreRecommendations;
    /**
     * Calculate priority score for a recommendation
     */
    private calculatePriorityScore;
    /**
     * Calculate ROI score for a recommendation
     */
    private calculateROIScore;
    /**
     * Calculate context relevance for a recommendation
     */
    private calculateContextRelevance;
    private getFrontendRecommendations;
    private getBackendRecommendations;
    private getFullstackRecommendations;
    private getMobileRecommendations;
    private getDataRecommendations;
    private getDevOpsRecommendations;
    /**
     * Quality gates integration
     */
    /**
     * Validate quality gates for a workflow phase
     */
    validateQualityGates(phase: WorkflowPhase, context: BusinessContext, projectAnalysis?: {
        projectStructure: ProjectStructure;
        securityAnalysis: SecurityAnalysis;
        codeQuality: CodeQualityAnalysis;
        dependencies: DependencyAnalysis;
    }): Promise<QualityGateResult>;
    /**
     * Perform quality checks for a phase
     */
    private performQualityChecks;
    /**
     * Calculate overall quality score
     */
    private calculateQualityScore;
    private calculateQualityScoreFromRequirements;
    /**
     * Apply quality weights based on category importance
     */
    private applyQualityWeights;
    /**
     * Get quality threshold for a phase
     */
    private getQualityThreshold;
    /**
     * Generate quality recommendations
     */
    private generateQualityRecommendations;
    /**
     * Get phase-specific quality checks
     */
    private getPhaseSpecificChecks;
    /**
     * Perform Context7 quality checks
     */
    private performContext7QualityChecks;
    private checkRequirementsCompleteness;
    private checkCodeStandardsCompliance;
    private checkTestingCoverage;
    private checkDeploymentReadiness;
    private hasTypeScript;
    private hasLinting;
    private hasFormatting;
    private hasUnitTests;
    private hasIntegrationTests;
    private hasE2ETests;
    private hasCI;
    private hasCD;
    private hasMonitoring;
    private getExpectedIntelligenceLevel;
    private getFallbackQualityGateResult;
    /**
     * Perform a quality check for monitoring
     */
    private performQualityCheck;
    /**
     * Assess current quality state
     */
    private assessCurrentQuality;
    /**
     * Check for quality degradation
     */
    private checkQualityDegradation;
    /**
     * Check for critical issues
     */
    private checkCriticalIssues;
    /**
     * Get quality monitoring status
     */
    getQualityMonitoringStatus(workflowId: string): QualityMonitoringStatus | null;
    /**
     * Get quality trends for a workflow
     */
    getQualityTrends(workflowId: string, timeRange?: number): QualityTrend[];
    private calculateDependencyScore;
    private calculatePerformanceScore;
    private calculateTestingScore;
    private calculateDocumentationScore;
    private calculateContext7Score;
    private calculateOverallQualityScore;
    private identifyQualityIssues;
    private getAffectedCategories;
    private calculateAverageQualityScore;
    private generateQualityRecommendationsFromScores;
    /**
     * Domain-specific insight generation engines
     */
    /**
     * Generate frontend-specific insights
     */
    generateFrontendInsights(context: BusinessContext): {
        framework: string;
        libraries: string[];
        patterns: string[];
        bestPractices: string[];
        performanceTips: string[];
        accessibilityGuidelines: string[];
    };
    /**
     * Generate backend-specific insights
     */
    generateBackendInsights(context: BusinessContext): {
        language: string;
        frameworks: string[];
        patterns: string[];
        bestPractices: string[];
        securityGuidelines: string[];
        scalabilityTips: string[];
    };
    /**
     * Generate database-specific insights
     */
    generateDatabaseInsights(context: BusinessContext): {
        databaseType: string;
        orm: string[];
        patterns: string[];
        bestPractices: string[];
        performanceTips: string[];
        securityGuidelines: string[];
    };
    /**
     * Generate DevOps-specific insights
     */
    generateDevOpsInsights(context: BusinessContext): {
        platform: string;
        tools: string[];
        patterns: string[];
        bestPractices: string[];
        securityGuidelines: string[];
        monitoringTips: string[];
    };
    private getFrontendLibraries;
    private getFrontendPatterns;
    private getFrontendBestPractices;
    private getFrontendPerformanceTips;
    private getAccessibilityGuidelines;
    private getBackendFrameworks;
    private getBackendPatterns;
    private getBackendBestPractices;
    private getSecurityGuidelines;
    private getScalabilityTips;
    private getDatabaseORMs;
    private getDatabasePatterns;
    private getDatabaseBestPractices;
    private getDatabasePerformanceTips;
    private getDatabaseSecurityGuidelines;
    private getDevOpsTools;
    private getDevOpsPatterns;
    private getDevOpsBestPractices;
    private getDevOpsSecurityGuidelines;
    private getMonitoringTips;
    /**
     * Initialize context preservation for a workflow
     */
    initializeContextPreservation(workflowId: string, initialContext: WorkflowContext): Promise<void>;
    /**
     * Add a context history entry
     */
    addContextHistoryEntry(workflowId: string, entry: ContextHistoryEntry): Promise<void>;
    /**
     * Update workflow context with change tracking
     */
    updateWorkflowContext(workflowId: string, updates: Partial<WorkflowContext>, author?: string, reason?: string): Promise<WorkflowContext>;
    /**
     * Generate context changes for tracking
     */
    private generateContextChanges;
    /**
     * Determine the type of change
     */
    private determineChangeType;
    /**
     * Calculate context accuracy
     */
    calculateContextAccuracy(context: WorkflowContext): Promise<number>;
    /**
     * Calculate completeness score
     */
    private calculateCompletenessScore;
    /**
     * Calculate consistency score
     */
    private calculateConsistencyScore;
    /**
     * Calculate relevance score
     */
    private calculateRelevanceScore;
    /**
     * Calculate accuracy score
     */
    private calculateAccuracyScore;
    /**
     * Find conflicts between constraints and assumptions
     */
    private findConflicts;
    /**
     * Find conflicts between decisions
     */
    private findDecisionConflicts;
    /**
     * Check if two decisions conflict
     */
    private decisionsConflict;
    /**
     * Check phase relevance
     */
    private checkPhaseRelevance;
    /**
     * Check artifact relevance
     */
    private checkArtifactRelevance;
    /**
     * Validate context
     */
    validateContext(workflowId: string, context: WorkflowContext): Promise<ContextValidationResult>;
    /**
     * Validate completeness
     */
    private validateCompleteness;
    /**
     * Validate consistency
     */
    private validateConsistency;
    /**
     * Validate accuracy
     */
    private validateAccuracy;
    /**
     * Validate relevance
     */
    private validateRelevance;
    /**
     * Generate validation recommendations
     */
    private generateValidationRecommendations;
    /**
     * Calculate validation score
     */
    private calculateValidationScore;
    /**
     * Check cross-phase context continuity
     */
    checkContextContinuity(workflowId: string, fromPhase: string, toPhase: string): Promise<ContextContinuityCheck>;
    /**
     * Get context accuracy metrics
     */
    getContextAccuracyMetrics(workflowId: string): Promise<ContextAccuracyMetrics>;
    /**
     * Get context preservation status
     */
    getContextPreservationStatus(workflowId: string): ContextPreservationState | null;
    /**
     * Get context history for a workflow
     */
    getContextHistory(workflowId: string): ContextHistoryEntry[];
    /**
     * Get context validation results
     */
    getContextValidationResults(workflowId: string): ContextValidationResult[];
    /**
     * Clear context preservation data for a workflow
     */
    clearContextPreservation(workflowId: string): void;
    /**
     * Get context preservation statistics
     */
    getContextPreservationStats(): {
        activeWorkflows: number;
        totalHistoryEntries: number;
        averageAccuracy: number;
        healthyWorkflows: number;
    };
    /**
     * Initialize template patterns for detection
     */
    private initializeTemplatePatterns;
    /**
     * Initialize intelligence detection for a workflow
     */
    initializeIntelligenceDetection(workflowId: string): Promise<void>;
    /**
     * Detect template responses
     */
    detectTemplateResponse(response: string, _context?: any): Promise<TemplateDetectionResult>;
    /**
     * Perform additional template checks
     */
    private performAdditionalTemplateChecks;
    /**
     * Calculate intelligence score
     */
    calculateIntelligenceScore(response: string, context?: any): Promise<IntelligenceScore>;
    /**
     * Calculate domain relevance
     */
    private calculateDomainRelevanceForIntelligence;
    /**
     * Calculate specificity
     */
    private calculateSpecificity;
    /**
     * Calculate originality
     */
    private calculateOriginality;
    /**
     * Calculate accuracy
     */
    private calculateAccuracy;
    /**
     * Check factual consistency
     */
    private checkFactualConsistency;
    /**
     * Check technical accuracy
     */
    private checkTechnicalAccuracy;
    /**
     * Calculate completeness
     */
    private calculateCompleteness;
    /**
     * Calculate variance of scores
     */
    private calculateVariance;
    /**
     * Track intelligence sources
     */
    trackIntelligenceSources(_response: string, context?: any): Promise<IntelligenceSourceTracking>;
    /**
     * Analyze response intelligence
     */
    analyzeResponseIntelligence(response: string, workflowId: string, context?: any): Promise<IntelligenceAnalysisResult>;
    /**
     * Calculate response quality score
     */
    private calculateResponseQualityScore;
    /**
     * Generate intelligence recommendations
     */
    private generateIntelligenceRecommendations;
    /**
     * Get intelligence detection status
     */
    getIntelligenceDetectionStatus(workflowId: string): IntelligenceDetectionState | null;
    /**
     * Get response quality history
     */
    getResponseQualityHistory(workflowId: string): ResponseQualityMetrics[];
    /**
     * Get intelligence analysis history
     */
    getIntelligenceAnalysisHistory(workflowId: string): IntelligenceAnalysisResult[];
    /**
     * Get intelligence detection statistics
     */
    getIntelligenceDetectionStats(): {
        activeWorkflows: number;
        totalAnalyses: number;
        averageQualityScore: number;
        templateResponseRate: number;
        realIntelligenceRate: number;
    };
    /**
     * Clear intelligence detection data for a workflow
     */
    clearIntelligenceDetection(workflowId: string): void;
    /**
     * Initialize domain expertise knowledge
     */
    private initializeDomainExpertise;
    /**
     * Create category expertise for a domain
     */
    private createCategoryExpertise;
    /**
     * Get knowledge areas for a category
     */
    private getKnowledgeAreasForCategory;
    /**
     * Get best practices for a category
     */
    private getBestPracticesForCategory;
    /**
     * Get common patterns for a category
     */
    private getCommonPatternsForCategory;
    /**
     * Get anti-patterns for a category
     */
    private getAntiPatternsForCategory;
    /**
     * Get tools for a category
     */
    private getToolsForCategory;
    /**
     * Get frameworks for a category
     */
    private getFrameworksForCategory;
    /**
     * Initialize domain expertise for a workflow
     */
    initializeDomainExpertiseForWorkflow(workflowId: string): Promise<void>;
    /**
     * Deliver domain expertise for a response
     */
    deliverDomainExpertise(response: string, domain: string, workflowId: string, _context?: any): Promise<ExpertiseDeliveryResult>;
    /**
     * Get category expertise
     */
    private getCategoryExpertise;
    /**
     * Analyze response for knowledge delivery
     */
    private analyzeResponseForKnowledge;
    /**
     * Identify applied best practices
     */
    private identifyAppliedBestPractices;
    /**
     * Identify used patterns
     */
    private identifyUsedPatterns;
    /**
     * Identify avoided anti-patterns
     */
    private identifyAvoidedAntiPatterns;
    /**
     * Identify recommended tools
     */
    private identifyRecommendedTools;
    /**
     * Identify suggested frameworks
     */
    private identifySuggestedFrameworks;
    /**
     * Calculate expertise quality score
     */
    private calculateExpertiseQualityScore;
    /**
     * Calculate expertise confidence
     */
    private calculateExpertiseConfidence;
    /**
     * Validate expertise delivery
     */
    validateExpertiseDelivery(response: string, domain: string, _workflowId: string): Promise<ExpertiseValidationResult>;
    /**
     * Validate expertise accuracy
     */
    private validateExpertiseAccuracy;
    /**
     * Validate best practice compliance
     */
    private validateBestPracticeCompliance;
    /**
     * Validate pattern correctness
     */
    private validatePatternCorrectness;
    /**
     * Validate tool appropriateness
     */
    private validateToolAppropriateness;
    /**
     * Validate framework suitability
     */
    private validateFrameworkSuitability;
    /**
     * Get domain expertise status
     */
    getDomainExpertiseStatus(workflowId: string): DomainExpertiseState | null;
    /**
     * Get expertise validation history
     */
    getExpertiseValidationHistory(workflowId: string): ExpertiseValidationResult[];
    /**
     * Get domain expertise statistics
     */
    getDomainExpertiseStats(): {
        activeWorkflows: number;
        totalValidations: number;
        averageValidationScore: number;
        expertiseAccuracy: number;
        bestPracticeCompliance: number;
    };
    /**
     * Clear domain expertise data for a workflow
     */
    clearDomainExpertise(workflowId: string): void;
    /**
     * Initialize response relevance scoring
     */
    private initializeResponseRelevanceScoring;
    /**
     * Initialize response relevance scoring for a workflow
     */
    initializeResponseRelevanceForWorkflow(workflowId: string): Promise<void>;
    /**
     * Calculate response relevance score
     */
    calculateResponseRelevance(response: string, userQuery: string, context: any, workflowId: string): Promise<RelevanceScore>;
    /**
     * Calculate topic relevance
     */
    private calculateTopicRelevance;
    /**
     * Calculate context relevance
     */
    private calculateContextRelevanceForResponse;
    /**
     * Calculate user intent relevance
     */
    private calculateUserIntentRelevance;
    /**
     * Calculate domain relevance
     */
    private calculateDomainRelevanceForRelevance;
    /**
     * Calculate temporal relevance
     */
    private calculateTemporalRelevance;
    /**
     * Extract keywords from text
     */
    private extractKeywords;
    /**
     * Check if word is a stop word
     */
    private isStopWord;
    /**
     * Calculate semantic similarity (simplified)
     */
    private calculateSemanticSimilarity;
    /**
     * Detect user intent from query
     */
    private detectUserIntent;
    /**
     * Get domain terms for a domain
     */
    private getDomainTerms;
    /**
     * Get phase terms for a phase
     */
    private getPhaseTerms;
    /**
     * Collect response quality feedback
     */
    collectResponseQualityFeedback(responseId: string, workflowId: string, userRating?: number, userFeedback?: string, context?: any): Promise<ResponseQualityFeedback>;
    /**
     * Generate improvement suggestions
     */
    private generateImprovementSuggestions;
    /**
     * Track response effectiveness
     */
    trackResponseEffectiveness(responseId: string, workflowId: string, context?: any): Promise<ResponseEffectivenessMetrics>;
    /**
     * Calculate effectiveness score
     */
    private calculateEffectivenessScore;
    /**
     * Calculate user satisfaction
     */
    private calculateUserSatisfaction;
    /**
     * Calculate task completion
     */
    private calculateTaskCompletion;
    /**
     * Calculate time to resolution
     */
    private calculateTimeToResolution;
    /**
     * Determine if follow-up is required
     */
    private determineFollowUpRequired;
    /**
     * Calculate user engagement
     */
    private calculateUserEngagement;
    /**
     * Calculate conversion rate
     */
    private calculateConversionRate;
    /**
     * Perform continuous improvement
     */
    performContinuousImprovement(workflowId: string): Promise<ContinuousImprovementState>;
    /**
     * Calculate performance trend
     */
    private calculatePerformanceTrend;
    /**
     * Calculate adaptation rate
     */
    private calculateAdaptationRate;
    /**
     * Calculate learning rate
     */
    private calculateLearningRate;
    /**
     * Calculate success rate
     */
    private calculateSuccessRate;
    /**
     * Update learning data
     */
    private updateLearningData;
    /**
     * Get response relevance status
     */
    getResponseRelevanceStatus(workflowId: string): ResponseRelevanceState | null;
    /**
     * Get continuous improvement state
     */
    getContinuousImprovementState(workflowId: string): ContinuousImprovementState | null;
    /**
     * Get response relevance statistics
     */
    getResponseRelevanceStats(): {
        activeWorkflows: number;
        totalRelevanceScores: number;
        averageRelevanceScore: number;
        totalFeedback: number;
        averageUserRating: number;
        totalEffectivenessMetrics: number;
        averageEffectivenessScore: number;
    };
    /**
     * Clear response relevance data for a workflow
     */
    clearResponseRelevance(workflowId: string): void;
    /**
     * Determines system health based on technical metrics
     *
     * @param metrics - Technical metrics from workflow execution
     * @returns System health status
     *
     * @example
     * ```typescript
     * const health = this.determineSystemHealth(metrics);
     * ```
     *
     * @since 2.0.0
     */
    private determineSystemHealth;
}
//# sourceMappingURL=orchestration-engine.d.ts.map