/**
 * DevOps Intelligence Engine
 *
 * Specialized engine for DevOps, containerization, and infrastructure code generation.
 * Provides comprehensive analysis and best practices for Docker, Kubernetes, CI/CD,
 * Infrastructure as Code, and operational excellence.
 */

import {
  BaseCategoryIntelligenceEngine,
  CodeAnalysis,
  Context7Data,
  ValidationResult,
  QualityAnalysis,
  MaintainabilityAnalysis,
  PerformanceAnalysis,
  SecurityAnalysis,
  TechnologyInsights,
} from '../CategoryIntelligenceEngine.js';
import { CodeGenerationRequest } from '../UnifiedCodeIntelligenceEngine.js';

/**
 * DevOps-specific analysis interfaces
 */
export interface ContainerizationAnalysis {
  dockerBestPractices: {
    multiStageBuilds: boolean;
    layerOptimization: boolean;
    securityHardening: boolean;
    imageSizeOptimization: boolean;
    healthChecks: boolean;
    score: number;
  };
  imageCompliance: {
    baseImageSecurity: boolean;
    vulnerabilityScanning: boolean;
    minimalImages: boolean;
    tagStrategy: boolean;
    score: number;
  };
  buildOptimization: {
    cacheStrategy: boolean;
    buildContext: boolean;
    argumentsUsage: boolean;
    secretsManagement: boolean;
    score: number;
  };
  overall: number;
  recommendations: string[];
}

export interface OrchestrationAnalysis {
  kubernetesPatterns: {
    resourceManagement: boolean;
    configurationManagement: boolean;
    securityPolicies: boolean;
    networkPolicies: boolean;
    monitoringSetup: boolean;
    score: number;
  };
  deploymentStrategies: {
    rollingUpdates: boolean;
    blueGreenDeployment: boolean;
    canaryDeployment: boolean;
    rollbackStrategy: boolean;
    score: number;
  };
  scalingPatterns: {
    horizontalPodAutoscaling: boolean;
    verticalPodAutoscaling: boolean;
    clusterAutoscaling: boolean;
    resourceLimits: boolean;
    score: number;
  };
  overall: number;
  recommendations: string[];
}

export interface CICDAnalysis {
  pipelineOptimization: {
    parallelization: boolean;
    caching: boolean;
    artifactManagement: boolean;
    testingStrategy: boolean;
    deploymentAutomation: boolean;
    score: number;
  };
  securityIntegration: {
    secretsManagement: boolean;
    vulnerabilityScanning: boolean;
    codeQualityGates: boolean;
    complianceChecking: boolean;
    score: number;
  };
  monitoringIntegration: {
    deploymentTracking: boolean;
    performanceMonitoring: boolean;
    errorTracking: boolean;
    alerting: boolean;
    score: number;
  };
  overall: number;
  recommendations: string[];
}

export interface InfrastructureAnalysis {
  iacPatterns: {
    declarativeConfiguration: boolean;
    versionControl: boolean;
    modularization: boolean;
    testing: boolean;
    documentation: boolean;
    score: number;
  };
  securityHardening: {
    accessControl: boolean;
    networkSecurity: boolean;
    encryption: boolean;
    auditLogging: boolean;
    complianceFrameworks: boolean;
    score: number;
  };
  costOptimization: {
    resourceRightSizing: boolean;
    autoScaling: boolean;
    scheduledShutdown: boolean;
    spotInstances: boolean;
    score: number;
  };
  overall: number;
  recommendations: string[];
}

export interface ReliabilityAnalysis {
  monitoringObservability: {
    metricsCollection: boolean;
    distributedTracing: boolean;
    logAggregation: boolean;
    alerting: boolean;
    dashboards: boolean;
    score: number;
  };
  disasterRecovery: {
    backupStrategy: boolean;
    recoveryProcedures: boolean;
    failoverMechanisms: boolean;
    dataReplication: boolean;
    score: number;
  };
  incidentResponse: {
    runbooks: boolean;
    escalationProcedures: boolean;
    postmortemProcess: boolean;
    automatedRecovery: boolean;
    score: number;
  };
  overall: number;
  recommendations: string[];
}

/**
 * DevOps-specific intelligence engine
 */
export class DevOpsIntelligenceEngine extends BaseCategoryIntelligenceEngine {
  category = 'devops';
  technologies = [
    'Docker',
    'Kubernetes',
    'Terraform',
    'Ansible',
    'Jenkins',
    'GitLab CI',
    'GitHub Actions',
    'AWS',
    'Azure',
    'GCP',
    'Helm',
    'ArgoCD',
    'Prometheus',
    'Grafana',
    'ELK Stack',
    'Istio',
    'Envoy',
  ];

  /**
   * Analyze DevOps code with containerization, orchestration, and infrastructure considerations
   */
  async analyzeCode(
    code: string,
    technology: string,
    context: Context7Data
  ): Promise<CodeAnalysis> {
    const insights = await this.getTechnologyInsights(technology, context);

    // Core DevOps analysis
    const quality = await this.analyzeDevOpsQuality(code, technology, insights);
    const maintainability = await this.analyzeDevOpsMaintainability(code, technology, insights);
    const performance = await this.analyzeDevOpsPerformance(code, technology, insights);
    const security = await this.analyzeDevOpsSecurity(code, technology, insights);

    // DevOps-specific analysis
    const containerization = await this.analyzeContainerization(code, technology, insights);
    const orchestration = await this.analyzeOrchestration(code, technology, insights);
    const cicd = await this.analyzeCICD(code, technology, insights);
    const infrastructure = await this.analyzeInfrastructure(code, technology, insights);
    const reliability = await this.analyzeReliability(code, technology, insights);

    return {
      quality,
      maintainability,
      performance,
      security,
      devops: {
        containerization,
        orchestration,
        cicd,
        infrastructure,
        reliability,
        overall: this.calculateDevOpsScore([
          containerization.overall,
          orchestration.overall,
          cicd.overall,
          infrastructure.overall,
          reliability.overall,
        ]),
      },
    };
  }

  /**
   * Get DevOps best practices for the technology
   */
  async getBestPractices(technology: string, context: Context7Data): Promise<string[]> {
    const insights = await this.getTechnologyInsights(technology, context);
    return [
      ...insights.bestPractices,
      'Use multi-stage Docker builds for optimization',
      'Implement proper resource limits in Kubernetes',
      'Enable health checks for all containers',
      'Use Infrastructure as Code for consistency',
      'Implement automated testing in CI/CD pipelines',
      'Monitor and alert on key system metrics',
      'Implement proper backup and disaster recovery',
      'Use secrets management for sensitive data',
      'Implement security scanning in pipelines',
      'Practice immutable infrastructure',
    ];
  }

  /**
   * Get DevOps anti-patterns to avoid
   */
  async getAntiPatterns(_technology: string, _context: Context7Data): Promise<string[]> {
    return [
      'Running containers as root user',
      'Using latest tags in production',
      'Hardcoding secrets in configuration files',
      'Manual deployment processes',
      'Ignoring resource limits',
      'No monitoring or alerting',
      'No backup strategy',
      'Direct production access',
      'Shared mutable infrastructure',
      'No disaster recovery plan',
    ];
  }

  /**
   * Validate DevOps code for best practices
   */
  async validateCode(code: string, technology: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for common DevOps issues
    if (technology.toLowerCase().includes('docker')) {
      if (code.includes('USER root')) {
        errors.push('Avoid running containers as root user');
      }
      if (code.includes(':latest')) {
        warnings.push('Avoid using latest tags in production');
      }
      if (!code.includes('HEALTHCHECK')) {
        suggestions.push('Consider adding health checks');
      }
    }

    if (technology.toLowerCase().includes('kubernetes')) {
      if (!code.includes('resources:')) {
        warnings.push('Missing resource limits');
      }
      if (!code.includes('securityContext:')) {
        suggestions.push('Consider adding security context');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Optimize DevOps code for production
   */
  async optimizeCode(code: string, technology: string, context: Context7Data): Promise<string> {
    let optimizedCode = code;
    const insights = await this.getTechnologyInsights(technology, context);

    // Apply DevOps-specific optimizations
    if (technology.toLowerCase().includes('docker')) {
      optimizedCode = this.optimizeDockerfile(optimizedCode);
    }

    if (technology.toLowerCase().includes('kubernetes')) {
      optimizedCode = this.optimizeKubernetesManifests(optimizedCode);
    }

    return optimizedCode;
  }

  /**
   * Generate DevOps-optimized code with best practices
   */
  async generateCode(request: CodeGenerationRequest, context: Context7Data): Promise<string> {
    const insights = await this.getTechnologyInsights(request.techStack?.[0] || 'docker', context);

    const codeType = this.detectDevOpsCodeType(request.featureDescription);

    switch (codeType) {
      case 'dockerfile':
        return this.generateDockerfile(request, insights);
      case 'kubernetes':
        return this.generateKubernetesManifests(request, insights);
      case 'terraform':
        return this.generateTerraformConfiguration(request, insights);
      case 'cicd':
        return this.generateCICDPipeline(request, insights);
      case 'monitoring':
        return this.generateMonitoringConfiguration(request, insights);
      default:
        return this.generateGenericDevOpsCode(request, insights);
    }
  }

  /**
   * Analyze containerization best practices
   */
  private async analyzeContainerization(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<ContainerizationAnalysis> {
    const analysis: ContainerizationAnalysis = {
      dockerBestPractices: {
        multiStageBuilds: this.checkMultiStageBuilds(code),
        layerOptimization: this.checkLayerOptimization(code),
        securityHardening: this.checkSecurityHardening(code),
        imageSizeOptimization: this.checkImageSizeOptimization(code),
        healthChecks: this.checkHealthChecks(code),
        score: 0,
      },
      imageCompliance: {
        baseImageSecurity: this.checkBaseImageSecurity(code),
        vulnerabilityScanning: this.checkVulnerabilityScanning(code),
        minimalImages: this.checkMinimalImages(code),
        tagStrategy: this.checkTagStrategy(code),
        score: 0,
      },
      buildOptimization: {
        cacheStrategy: this.checkCacheStrategy(code),
        buildContext: this.checkBuildContext(code),
        argumentsUsage: this.checkArgumentsUsage(code),
        secretsManagement: this.checkSecretsManagement(code),
        score: 0,
      },
      overall: 0,
      recommendations: [],
    };

    // Calculate scores
    analysis.dockerBestPractices.score = this.calculateBooleanScore(analysis.dockerBestPractices);
    analysis.imageCompliance.score = this.calculateBooleanScore(analysis.imageCompliance);
    analysis.buildOptimization.score = this.calculateBooleanScore(analysis.buildOptimization);
    analysis.overall =
      (analysis.dockerBestPractices.score +
        analysis.imageCompliance.score +
        analysis.buildOptimization.score) /
      3;

    // Generate recommendations
    analysis.recommendations = this.generateContainerizationRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze orchestration patterns
   */
  private async analyzeOrchestration(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<OrchestrationAnalysis> {
    const analysis: OrchestrationAnalysis = {
      kubernetesPatterns: {
        resourceManagement: this.checkResourceManagement(code),
        configurationManagement: this.checkConfigurationManagement(code),
        securityPolicies: this.checkSecurityPolicies(code),
        networkPolicies: this.checkNetworkPolicies(code),
        monitoringSetup: this.checkMonitoringSetup(code),
        score: 0,
      },
      deploymentStrategies: {
        rollingUpdates: this.checkRollingUpdates(code),
        blueGreenDeployment: this.checkBlueGreenDeployment(code),
        canaryDeployment: this.checkCanaryDeployment(code),
        rollbackStrategy: this.checkRollbackStrategy(code),
        score: 0,
      },
      scalingPatterns: {
        horizontalPodAutoscaling: this.checkHorizontalPodAutoscaling(code),
        verticalPodAutoscaling: this.checkVerticalPodAutoscaling(code),
        clusterAutoscaling: this.checkClusterAutoscaling(code),
        resourceLimits: this.checkResourceLimits(code),
        score: 0,
      },
      overall: 0,
      recommendations: [],
    };

    // Calculate scores
    analysis.kubernetesPatterns.score = this.calculateBooleanScore(analysis.kubernetesPatterns);
    analysis.deploymentStrategies.score = this.calculateBooleanScore(analysis.deploymentStrategies);
    analysis.scalingPatterns.score = this.calculateBooleanScore(analysis.scalingPatterns);
    analysis.overall =
      (analysis.kubernetesPatterns.score +
        analysis.deploymentStrategies.score +
        analysis.scalingPatterns.score) /
      3;

    // Generate recommendations
    analysis.recommendations = this.generateOrchestrationRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze CI/CD pipeline optimization
   */
  private async analyzeCICD(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<CICDAnalysis> {
    const analysis: CICDAnalysis = {
      pipelineOptimization: {
        parallelization: this.checkParallelization(code),
        caching: this.checkPipelineCaching(code),
        artifactManagement: this.checkArtifactManagement(code),
        testingStrategy: this.checkTestingStrategy(code),
        deploymentAutomation: this.checkDeploymentAutomation(code),
        score: 0,
      },
      securityIntegration: {
        secretsManagement: this.checkCICDSecretsManagement(code),
        vulnerabilityScanning: this.checkCICDVulnerabilityScanning(code),
        codeQualityGates: this.checkCodeQualityGates(code),
        complianceChecking: this.checkComplianceChecking(code),
        score: 0,
      },
      monitoringIntegration: {
        deploymentTracking: this.checkDeploymentTracking(code),
        performanceMonitoring: this.checkCICDPerformanceMonitoring(code),
        errorTracking: this.checkErrorTracking(code),
        alerting: this.checkCICDAlerting(code),
        score: 0,
      },
      overall: 0,
      recommendations: [],
    };

    // Calculate scores
    analysis.pipelineOptimization.score = this.calculateBooleanScore(analysis.pipelineOptimization);
    analysis.securityIntegration.score = this.calculateBooleanScore(analysis.securityIntegration);
    analysis.monitoringIntegration.score = this.calculateBooleanScore(
      analysis.monitoringIntegration
    );
    analysis.overall =
      (analysis.pipelineOptimization.score +
        analysis.securityIntegration.score +
        analysis.monitoringIntegration.score) /
      3;

    // Generate recommendations
    analysis.recommendations = this.generateCICDRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze infrastructure patterns
   */
  private async analyzeInfrastructure(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<InfrastructureAnalysis> {
    const analysis: InfrastructureAnalysis = {
      iacPatterns: {
        declarativeConfiguration: this.checkDeclarativeConfiguration(code),
        versionControl: this.checkInfraVersionControl(code),
        modularization: this.checkInfraModularization(code),
        testing: this.checkInfraTesting(code),
        documentation: this.checkInfraDocumentation(code),
        score: 0,
      },
      securityHardening: {
        accessControl: this.checkInfraAccessControl(code),
        networkSecurity: this.checkNetworkSecurity(code),
        encryption: this.checkInfraEncryption(code),
        auditLogging: this.checkAuditLogging(code),
        complianceFrameworks: this.checkComplianceFrameworks(code),
        score: 0,
      },
      costOptimization: {
        resourceRightSizing: this.checkResourceRightSizing(code),
        autoScaling: this.checkInfraAutoScaling(code),
        scheduledShutdown: this.checkScheduledShutdown(code),
        spotInstances: this.checkSpotInstances(code),
        score: 0,
      },
      overall: 0,
      recommendations: [],
    };

    // Calculate scores
    analysis.iacPatterns.score = this.calculateBooleanScore(analysis.iacPatterns);
    analysis.securityHardening.score = this.calculateBooleanScore(analysis.securityHardening);
    analysis.costOptimization.score = this.calculateBooleanScore(analysis.costOptimization);
    analysis.overall =
      (analysis.iacPatterns.score +
        analysis.securityHardening.score +
        analysis.costOptimization.score) /
      3;

    // Generate recommendations
    analysis.recommendations = this.generateInfrastructureRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze reliability patterns
   */
  private async analyzeReliability(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<ReliabilityAnalysis> {
    const analysis: ReliabilityAnalysis = {
      monitoringObservability: {
        metricsCollection: this.checkMetricsCollection(code),
        distributedTracing: this.checkDistributedTracing(code),
        logAggregation: this.checkLogAggregation(code),
        alerting: this.checkReliabilityAlerting(code),
        dashboards: this.checkDashboards(code),
        score: 0,
      },
      disasterRecovery: {
        backupStrategy: this.checkBackupStrategy(code),
        recoveryProcedures: this.checkRecoveryProcedures(code),
        failoverMechanisms: this.checkFailoverMechanisms(code),
        dataReplication: this.checkDataReplication(code),
        score: 0,
      },
      incidentResponse: {
        runbooks: this.checkRunbooks(code),
        escalationProcedures: this.checkEscalationProcedures(code),
        postmortemProcess: this.checkPostmortemProcess(code),
        automatedRecovery: this.checkAutomatedRecovery(code),
        score: 0,
      },
      overall: 0,
      recommendations: [],
    };

    // Calculate scores
    analysis.monitoringObservability.score = this.calculateBooleanScore(
      analysis.monitoringObservability
    );
    analysis.disasterRecovery.score = this.calculateBooleanScore(analysis.disasterRecovery);
    analysis.incidentResponse.score = this.calculateBooleanScore(analysis.incidentResponse);
    analysis.overall =
      (analysis.monitoringObservability.score +
        analysis.disasterRecovery.score +
        analysis.incidentResponse.score) /
      3;

    // Generate recommendations
    analysis.recommendations = this.generateReliabilityRecommendations(analysis);

    return analysis;
  }

  /**
   * Generate Dockerfile with best practices
   */
  private generateDockerfile(
    request: CodeGenerationRequest,
    _insights: TechnologyInsights
  ): string {
    const baseImage = this.selectOptimalBaseImage(request);
    const packages = this.determineRequiredPackages(request);

    return `# Multi-stage build for optimized production image
# Build stage
FROM ${baseImage} AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .
RUN npm run build

# Production stage
FROM ${baseImage.replace(':latest', ':alpine')} AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]`;
  }

  /**
   * Generate Kubernetes manifests with best practices
   */
  private generateKubernetesManifests(
    request: CodeGenerationRequest,
    _insights: TechnologyInsights
  ): string {
    const appName = this.extractAppName(request);

    return `---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}
  labels:
    app: ${appName}
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: ${appName}
  template:
    metadata:
      labels:
        app: ${appName}
        version: v1
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 2000
      containers:
      - name: ${appName}
        image: ${appName}:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL

---
apiVersion: v1
kind: Service
metadata:
  name: ${appName}-service
  labels:
    app: ${appName}
spec:
  selector:
    app: ${appName}
  ports:
  - port: 80
    targetPort: 3000
    name: http
  type: ClusterIP

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${appName}-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${appName}
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80`;
  }

  /**
   * Generate Terraform configuration with best practices
   */
  private generateTerraformConfiguration(
    _request: CodeGenerationRequest,
    _insights: TechnologyInsights
  ): string {
    return `# Configure Terraform and required providers
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "your-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "project_name" {
  description = "Project name"
  type        = string
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "\${var.project_name}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "\${var.project_name}-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.\${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "\${var.project_name}-public-\${count.index + 1}"
    Type = "public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "\${var.project_name}-private-\${count.index + 1}"
    Type = "private"
  }
}

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Security Group for Application
resource "aws_security_group" "app" {
  name_prefix = "\${var.project_name}-app-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for application"

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "\${var.project_name}-app-sg"
  }
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}`;
  }

  /**
   * Generate CI/CD pipeline configuration
   */
  private generateCICDPipeline(
    _request: CodeGenerationRequest,
    _insights: TechnologyInsights
  ): string {
    return `# GitHub Actions CI/CD Pipeline
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  test:
    name: Test and Quality Checks
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run type checking
      run: npm run type-check

    - name: Run tests
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        token: \${{ secrets.CODECOV_TOKEN }}

    - name: Security audit
      run: npm audit --audit-level=moderate

    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}

  build:
    name: Build and Push Image
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    permissions:
      contents: read
      packages: write

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: \${{ env.REGISTRY }}
        username: \${{ github.actor }}
        password: \${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: \${{ steps.meta.outputs.tags }}
        labels: \${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Run container security scan
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:main
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-west-2

    - name: Deploy to EKS
      run: |
        aws eks update-kubeconfig --region us-west-2 --name production-cluster
        kubectl set image deployment/app app=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:main
        kubectl rollout status deployment/app

    - name: Run smoke tests
      run: |
        kubectl wait --for=condition=available --timeout=300s deployment/app
        # Add your smoke tests here

    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: \${{ job.status }}
        channel: '#deployments'
        webhook_url: \${{ secrets.SLACK_WEBHOOK }}`;
  }

  // Helper methods for code analysis
  private checkMultiStageBuilds(code: string): boolean {
    return /FROM\s+\S+\s+AS\s+\w+/i.test(code);
  }

  private checkLayerOptimization(code: string): boolean {
    return /RUN\s+.*&&.*/.test(code) && !/apt-get\s+update.*apt-get\s+install/.test(code);
  }

  private checkSecurityHardening(code: string): boolean {
    return /USER\s+(?!root)/.test(code) && /adduser|addgroup/.test(code);
  }

  private checkImageSizeOptimization(code: string): boolean {
    return /alpine|distroless/.test(code) && /npm\s+ci/.test(code);
  }

  private checkHealthChecks(code: string): boolean {
    return /HEALTHCHECK/.test(code);
  }

  private calculateBooleanScore(obj: Record<string, any>): number {
    const values = Object.values(obj).filter(v => typeof v === 'boolean');
    const trueCount = values.filter(Boolean).length;
    return values.length > 0 ? (trueCount / values.length) * 100 : 0;
  }

  private calculateDevOpsScore(scores: number[]): number {
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  private detectDevOpsCodeType(description: string): string {
    const lower = description.toLowerCase();
    if (lower.includes('dockerfile') || lower.includes('docker')) return 'dockerfile';
    if (lower.includes('kubernetes') || lower.includes('k8s')) return 'kubernetes';
    if (lower.includes('terraform') || lower.includes('infrastructure')) return 'terraform';
    if (lower.includes('pipeline') || lower.includes('ci/cd')) return 'cicd';
    if (lower.includes('monitoring') || lower.includes('prometheus')) return 'monitoring';
    return 'generic';
  }

  private selectOptimalBaseImage(request: CodeGenerationRequest): string {
    const tech = request.techStack?.[0]?.toLowerCase() || 'node';
    if (tech.includes('node')) return 'node:18-alpine';
    if (tech.includes('python')) return 'python:3.11-alpine';
    if (tech.includes('java')) return 'openjdk:17-alpine';
    return 'alpine:latest';
  }

  private determineRequiredPackages(_request: CodeGenerationRequest): string[] {
    return ['curl', 'wget']; // Basic packages
  }

  private extractAppName(request: CodeGenerationRequest): string {
    return request.projectAnalysis?.project?.name || 'app';
  }

  // Placeholder implementations for analysis methods
  private checkBaseImageSecurity = (code: string) => /alpine|distroless/.test(code);
  private checkVulnerabilityScanning = (_code: string) => false; // Requires external tools
  private checkMinimalImages = (code: string) => /alpine|scratch|distroless/.test(code);
  private checkTagStrategy = (code: string) => !/latest/.test(code);
  private checkCacheStrategy = (code: string) => /COPY package.*json/.test(code);
  private checkBuildContext = (code: string) => /\.dockerignore/.test(code);
  private checkArgumentsUsage = (code: string) => /ARG/.test(code);
  private checkSecretsManagement = (code: string) => !/password|secret|key/.test(code);

  private checkResourceManagement = (code: string) => /resources:|limits:|requests:/.test(code);
  private checkConfigurationManagement = (code: string) => /ConfigMap|Secret/.test(code);
  private checkSecurityPolicies = (code: string) => /securityContext|PodSecurityPolicy/.test(code);
  private checkNetworkPolicies = (code: string) => /NetworkPolicy/.test(code);
  private checkMonitoringSetup = (code: string) => /prometheus|monitoring/.test(code);
  private checkRollingUpdates = (code: string) => /RollingUpdate/.test(code);
  private checkBlueGreenDeployment = (code: string) => /blue.*green|BlueGreen/.test(code);
  private checkCanaryDeployment = (code: string) => /canary|Canary/.test(code);
  private checkRollbackStrategy = (code: string) => /rollback|revisionHistoryLimit/.test(code);
  private checkHorizontalPodAutoscaling = (code: string) =>
    /HorizontalPodAutoscaler|hpa/.test(code);
  private checkVerticalPodAutoscaling = (code: string) => /VerticalPodAutoscaler|vpa/.test(code);
  private checkClusterAutoscaling = (code: string) => /cluster.autoscaler/.test(code);
  private checkResourceLimits = (code: string) => /limits:|requests:/.test(code);

  private checkParallelization = (code: string) => /parallel|matrix|strategy/.test(code);
  private checkPipelineCaching = (code: string) => /cache|actions\/cache/.test(code);
  private checkArtifactManagement = (code: string) => /artifacts|upload-artifact/.test(code);
  private checkTestingStrategy = (code: string) => /test|jest|mocha|pytest/.test(code);
  private checkDeploymentAutomation = (code: string) => /deploy|deployment/.test(code);
  private checkCICDSecretsManagement = (code: string) => /secrets\.|GITHUB_TOKEN/.test(code);
  private checkCICDVulnerabilityScanning = (code: string) => /snyk|trivy|security/.test(code);
  private checkCodeQualityGates = (code: string) => /sonar|codecov|quality/.test(code);
  private checkComplianceChecking = (code: string) => /compliance|audit/.test(code);
  private checkDeploymentTracking = (code: string) => /rollout|deployment/.test(code);
  private checkCICDPerformanceMonitoring = (code: string) => /performance|monitoring/.test(code);
  private checkErrorTracking = (code: string) => /sentry|error/.test(code);
  private checkCICDAlerting = (code: string) => /slack|notification|alert/.test(code);

  private checkDeclarativeConfiguration = (code: string) => /resource\s+"/.test(code);
  private checkInfraVersionControl = (code: string) => /terraform|version/.test(code);
  private checkInfraModularization = (code: string) => /module\s+"/.test(code);
  private checkInfraTesting = (code: string) => /test|terratest/.test(code);
  private checkInfraDocumentation = (code: string) => /description|variable/.test(code);
  private checkInfraAccessControl = (code: string) => /iam|role|policy/.test(code);
  private checkNetworkSecurity = (code: string) => /security_group|firewall/.test(code);
  private checkInfraEncryption = (code: string) => /encrypt|kms/.test(code);
  private checkAuditLogging = (code: string) => /cloudtrail|audit|log/.test(code);
  private checkComplianceFrameworks = (code: string) => /compliance|gdpr|hipaa/.test(code);
  private checkResourceRightSizing = (code: string) => /instance_type|size/.test(code);
  private checkInfraAutoScaling = (code: string) => /autoscaling|auto_scaling/.test(code);
  private checkScheduledShutdown = (code: string) => /schedule|cron/.test(code);
  private checkSpotInstances = (code: string) => /spot|preemptible/.test(code);

  private checkMetricsCollection = (code: string) => /prometheus|metrics|monitoring/.test(code);
  private checkDistributedTracing = (code: string) => /jaeger|zipkin|trace/.test(code);
  private checkLogAggregation = (code: string) => /elk|fluentd|log/.test(code);
  private checkReliabilityAlerting = (code: string) => /alert|notification/.test(code);
  private checkDashboards = (code: string) => /grafana|dashboard/.test(code);
  private checkBackupStrategy = (code: string) => /backup|snapshot/.test(code);
  private checkRecoveryProcedures = (code: string) => /recovery|restore/.test(code);
  private checkFailoverMechanisms = (code: string) => /failover|redundancy/.test(code);
  private checkDataReplication = (code: string) => /replication|replica/.test(code);
  private checkRunbooks = (code: string) => /runbook|procedure/.test(code);
  private checkEscalationProcedures = (code: string) => /escalation|oncall/.test(code);
  private checkPostmortemProcess = (code: string) => /postmortem|incident/.test(code);
  private checkAutomatedRecovery = (code: string) => /auto.*recover|self.*heal/.test(code);

  // Recommendation generators
  private generateContainerizationRecommendations(analysis: ContainerizationAnalysis): string[] {
    const recommendations: string[] = [];
    if (!analysis.dockerBestPractices.multiStageBuilds) {
      recommendations.push('Use multi-stage builds to reduce image size and improve security');
    }
    if (!analysis.dockerBestPractices.securityHardening) {
      recommendations.push('Run containers as non-root user for better security');
    }
    if (!analysis.dockerBestPractices.healthChecks) {
      recommendations.push('Add HEALTHCHECK instructions for better container monitoring');
    }
    return recommendations;
  }

  private generateOrchestrationRecommendations(analysis: OrchestrationAnalysis): string[] {
    const recommendations: string[] = [];
    if (!analysis.kubernetesPatterns.resourceManagement) {
      recommendations.push('Define resource requests and limits for all containers');
    }
    if (!analysis.kubernetesPatterns.securityPolicies) {
      recommendations.push('Implement Pod Security Standards for enhanced security');
    }
    if (!analysis.scalingPatterns.horizontalPodAutoscaling) {
      recommendations.push('Configure Horizontal Pod Autoscaler for automatic scaling');
    }
    return recommendations;
  }

  private generateCICDRecommendations(analysis: CICDAnalysis): string[] {
    const recommendations: string[] = [];
    if (!analysis.pipelineOptimization.parallelization) {
      recommendations.push('Parallelize pipeline jobs to reduce build time');
    }
    if (!analysis.securityIntegration.vulnerabilityScanning) {
      recommendations.push('Integrate security scanning tools in CI/CD pipeline');
    }
    if (!analysis.pipelineOptimization.caching) {
      recommendations.push('Implement caching strategies to speed up builds');
    }
    return recommendations;
  }

  private generateInfrastructureRecommendations(analysis: InfrastructureAnalysis): string[] {
    const recommendations: string[] = [];
    if (!analysis.iacPatterns.modularization) {
      recommendations.push('Modularize infrastructure code for better reusability');
    }
    if (!analysis.securityHardening.encryption) {
      recommendations.push('Enable encryption at rest and in transit');
    }
    if (!analysis.costOptimization.autoScaling) {
      recommendations.push('Implement auto-scaling to optimize costs');
    }
    return recommendations;
  }

  private generateReliabilityRecommendations(analysis: ReliabilityAnalysis): string[] {
    const recommendations: string[] = [];
    if (!analysis.monitoringObservability.distributedTracing) {
      recommendations.push('Implement distributed tracing for better observability');
    }
    if (!analysis.disasterRecovery.backupStrategy) {
      recommendations.push('Establish automated backup and recovery procedures');
    }
    if (!analysis.incidentResponse.runbooks) {
      recommendations.push('Create comprehensive runbooks for incident response');
    }
    return recommendations;
  }

  private generateGenericDevOpsCode(
    _request: CodeGenerationRequest,
    _insights: TechnologyInsights
  ): string {
    return `# DevOps Configuration
# This is a generic DevOps configuration template
# Please customize based on your specific requirements

version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:`;
  }

  private generateMonitoringConfiguration(
    _request: CodeGenerationRequest,
    _insights: TechnologyInsights
  ): string {
    return `# Prometheus Configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: /metrics
    scrape_interval: 5s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

---
# Alert Rules
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected

      - alert: HighMemoryUsage
        expr: (process_resident_memory_bytes / node_memory_MemTotal_bytes) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High memory usage detected`;
  }

  /**
   * Analyze DevOps-optimized quality
   */
  private async analyzeDevOpsQuality(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<QualityAnalysis> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check for hardcoded values
    if (code.includes('password') || code.includes('secret')) {
      issues.push('Potential hardcoded secrets detected');
      score -= 20;
    }

    // Check for best practices
    if (!code.includes('FROM') && !code.includes('apiVersion')) {
      suggestions.push('Consider using standard DevOps configuration formats');
    }

    return {
      score: Math.max(score, 0),
      issues,
      suggestions,
    };
  }

  /**
   * Analyze DevOps maintainability
   */
  private async analyzeDevOpsMaintainability(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<MaintainabilityAnalysis> {
    let score = 80;
    const suggestions: string[] = [];

    // Check for documentation
    if (!code.includes('#') && !code.includes('description')) {
      suggestions.push('Add comments and documentation');
      score -= 10;
    }

    // Check for modularity
    if (code.length > 1000 && !code.includes('module') && !code.includes('---')) {
      suggestions.push('Consider breaking into smaller, modular components');
      score -= 10;
    }

    return {
      score: Math.max(score, 0),
      complexity: code.split('\n').length > 100 ? 8 : 5,
      readability: code.includes('#') || code.includes('description') ? 8 : 6,
      testability: code.includes('test') || code.includes('check') ? 7 : 5,
      suggestions,
    };
  }

  /**
   * Analyze DevOps performance
   */
  private async analyzeDevOpsPerformance(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<PerformanceAnalysis> {
    const bottlenecks: string[] = [];
    const optimizations: string[] = [];
    let score = 85;

    // Check for performance issues
    if (code.includes('apt-get update') && !code.includes('--no-cache')) {
      bottlenecks.push('Package manager cache not optimized');
      optimizations.push('Use --no-cache flag for package installations');
      score -= 10;
    }

    if (code.includes('COPY . .') && !code.includes('.dockerignore')) {
      bottlenecks.push('Large build context may slow builds');
      optimizations.push('Add .dockerignore file to reduce build context');
      score -= 5;
    }

    return {
      score: Math.max(score, 0),
      bottlenecks,
      optimizations,
    };
  }

  /**
   * Analyze DevOps security
   */
  private async analyzeDevOpsSecurity(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<SecurityAnalysis> {
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];
    let score = 90;

    // Check for security issues
    if (code.includes('USER root') || !code.includes('USER ')) {
      vulnerabilities.push('Running as root user');
      recommendations.push('Create and use non-root user');
      score -= 15;
    }

    if (code.includes('password') || code.includes('secret')) {
      vulnerabilities.push('Potential hardcoded secrets');
      recommendations.push('Use secret management systems');
      score -= 20;
    }

    if (!code.includes('securityContext') && code.includes('apiVersion')) {
      recommendations.push('Add security context to Kubernetes resources');
      score -= 5;
    }

    return {
      score: Math.max(score, 0),
      vulnerabilities,
      recommendations,
      compliance: ['DevOps Security Best Practices'],
    };
  }

  /**
   * Optimize Dockerfile for production
   */
  private optimizeDockerfile(code: string): string {
    let optimized = code;

    // Add multi-stage build if not present
    if (!optimized.includes('AS ') && optimized.includes('FROM ')) {
      optimized = optimized.replace(/FROM (.+)/, 'FROM $1 AS builder');
    }

    // Add non-root user if not present
    if (!optimized.includes('USER ') && !optimized.includes('adduser')) {
      const lines = optimized.split('\n');
      const insertIndex = lines.findIndex(
        line => line.startsWith('EXPOSE') || line.startsWith('CMD')
      );
      if (insertIndex > 0) {
        lines.splice(
          insertIndex,
          0,
          '',
          '# Create non-root user',
          'RUN adduser -D -s /bin/sh appuser',
          'USER appuser'
        );
        optimized = lines.join('\n');
      }
    }

    return optimized;
  }

  /**
   * Optimize Kubernetes manifests for production
   */
  private optimizeKubernetesManifests(code: string): string {
    let optimized = code;

    // Add resource limits if not present
    if (!optimized.includes('resources:') && optimized.includes('containers:')) {
      optimized = optimized.replace(
        /containers:\s*\n(\s*)-\s*name:/,
        `containers:
$1- name:
$1  resources:
$1    requests:
$1      memory: "64Mi"
$1      cpu: "250m"
$1    limits:
$1      memory: "128Mi"
$1      cpu: "500m"`
      );
    }

    // Add security context if not present
    if (!optimized.includes('securityContext:') && optimized.includes('spec:')) {
      optimized = optimized.replace(
        /spec:\s*\n(\s*)(containers:|replicas:)/,
        `spec:
$1securityContext:
$1  runAsNonRoot: true
$1  runAsUser: 1001
$1$2`
      );
    }

    return optimized;
  }
}
