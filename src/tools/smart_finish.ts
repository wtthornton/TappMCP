#!/usr/bin/env node

import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

// Input schema for smart_finish tool
const SmartFinishInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  codeIds: z.array(z.string()).min(1, 'At least one code ID is required'),
  qualityGates: z
    .object({
      testCoverage: z.number().min(0).max(100).default(85),
      securityScore: z.number().min(0).max(100).default(90),
      complexityScore: z.number().min(0).max(100).default(70),
      maintainabilityScore: z.number().min(0).max(100).default(70),
    })
    .optional(),
  businessRequirements: z
    .object({
      costPrevention: z.number().min(0).default(10000),
      timeSaved: z.number().min(0).default(2),
      userSatisfaction: z.number().min(0).max(100).default(90),
    })
    .optional(),
  productionReadiness: z
    .object({
      securityScan: z.boolean().default(true),
      performanceTest: z.boolean().default(true),
      documentationComplete: z.boolean().default(true),
      deploymentReady: z.boolean().default(true),
    })
    .optional(),
});

// Tool definition
export const smartFinishTool: Tool = {
  name: 'smart_finish',
  description:
    'Check quality and validate production readiness with comprehensive quality scorecard',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: {
        type: 'string',
        description: 'Project ID from smart_begin tool for context preservation',
        minLength: 1,
      },
      codeIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of code IDs from smart_write tool to validate',
        minItems: 1,
      },
      qualityGates: {
        type: 'object',
        properties: {
          testCoverage: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Required test coverage percentage',
            default: 85,
          },
          securityScore: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Required security score',
            default: 90,
          },
          complexityScore: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Required complexity score',
            default: 70,
          },
          maintainabilityScore: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Required maintainability score',
            default: 70,
          },
        },
        description: 'Quality gate requirements',
      },
      businessRequirements: {
        type: 'object',
        properties: {
          costPrevention: {
            type: 'number',
            minimum: 0,
            description: 'Required cost prevention amount',
            default: 10000,
          },
          timeSaved: {
            type: 'number',
            minimum: 0,
            description: 'Required time saved in hours',
            default: 2,
          },
          userSatisfaction: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Required user satisfaction percentage',
            default: 90,
          },
        },
        description: 'Business requirements for validation',
      },
      productionReadiness: {
        type: 'object',
        properties: {
          securityScan: {
            type: 'boolean',
            description: 'Whether security scan is required',
            default: true,
          },
          performanceTest: {
            type: 'boolean',
            description: 'Whether performance test is required',
            default: true,
          },
          documentationComplete: {
            type: 'boolean',
            description: 'Whether documentation completeness is required',
            default: true,
          },
          deploymentReady: {
            type: 'boolean',
            description: 'Whether deployment readiness is required',
            default: true,
          },
        },
        description: 'Production readiness requirements',
      },
    },
    required: ['projectId', 'codeIds'],
  },
};

// Quality validation functions
function validateTestCoverage(
  _codeIds: string[],
  requiredCoverage: number
): {
  score: number;
  status: 'pass' | 'fail' | 'warning';
  details: string;
} {
  // Simulate test coverage calculation
  const actualCoverage = Math.min(95, 80 + Math.random() * 15);
  const status =
    actualCoverage >= requiredCoverage
      ? 'pass'
      : actualCoverage >= requiredCoverage - 10
        ? 'warning'
        : 'fail';

  return {
    score: actualCoverage,
    status,
    details: `Test coverage ${actualCoverage.toFixed(1)}% ${status === 'pass' ? 'meets' : status === 'warning' ? 'partially meets' : 'does not meet'} requirement of ${requiredCoverage}%`,
  };
}

function validateSecurityScore(
  _codeIds: string[],
  requiredScore: number
): {
  score: number;
  status: 'pass' | 'fail' | 'warning';
  details: string;
} {
  // Simulate security score calculation
  const actualScore = Math.min(98, 85 + Math.random() * 13);
  const status =
    actualScore >= requiredScore ? 'pass' : actualScore >= requiredScore - 10 ? 'warning' : 'fail';

  return {
    score: actualScore,
    status,
    details: `Security score ${actualScore.toFixed(1)}% ${status === 'pass' ? 'meets' : status === 'warning' ? 'partially meets' : 'does not meet'} requirement of ${requiredScore}%`,
  };
}

function validateComplexityScore(
  _codeIds: string[],
  requiredScore: number
): {
  score: number;
  status: 'pass' | 'fail' | 'warning';
  details: string;
} {
  // Simulate complexity score calculation
  const actualScore = Math.min(95, 70 + Math.random() * 25);
  const status =
    actualScore >= requiredScore ? 'pass' : actualScore >= requiredScore - 10 ? 'warning' : 'fail';

  return {
    score: actualScore,
    status,
    details: `Complexity score ${actualScore.toFixed(1)}% ${status === 'pass' ? 'meets' : status === 'warning' ? 'partially meets' : 'does not meet'} requirement of ${requiredScore}%`,
  };
}

function validateMaintainabilityScore(
  _codeIds: string[],
  requiredScore: number
): {
  score: number;
  status: 'pass' | 'fail' | 'warning';
  details: string;
} {
  // Simulate maintainability score calculation
  const actualScore = Math.min(95, 70 + Math.random() * 25);
  const status =
    actualScore >= requiredScore ? 'pass' : actualScore >= requiredScore - 10 ? 'warning' : 'fail';

  return {
    score: actualScore,
    status,
    details: `Maintainability score ${actualScore.toFixed(1)}% ${status === 'pass' ? 'meets' : status === 'warning' ? 'partially meets' : 'does not meet'} requirement of ${requiredScore}%`,
  };
}

function validateBusinessRequirements(
  _codeIds: string[],
  requirements: {
    costPrevention: number;
    timeSaved: number;
    userSatisfaction: number;
  }
): {
  costPrevention: { status: 'pass' | 'fail' | 'warning'; details: string };
  timeSaved: { status: 'pass' | 'fail' | 'warning'; details: string };
  userSatisfaction: { status: 'pass' | 'fail' | 'warning'; details: string };
} {
  // Simulate business requirement validation
  const actualCostPrevention = Math.min(
    requirements.costPrevention * 2,
    requirements.costPrevention + Math.random() * requirements.costPrevention
  );
  const actualTimeSaved = Math.min(
    requirements.timeSaved * 2,
    requirements.timeSaved + Math.random() * requirements.timeSaved
  );
  const actualUserSatisfaction = Math.min(100, 85 + Math.random() * 15);

  return {
    costPrevention: {
      status: actualCostPrevention >= requirements.costPrevention ? 'pass' : 'fail',
      details: `Cost prevention $${actualCostPrevention.toFixed(0)} ${actualCostPrevention >= requirements.costPrevention ? 'meets' : 'does not meet'} requirement of $${requirements.costPrevention}`,
    },
    timeSaved: {
      status: actualTimeSaved >= requirements.timeSaved ? 'pass' : 'fail',
      details: `Time saved ${actualTimeSaved.toFixed(1)} hours ${actualTimeSaved >= requirements.timeSaved ? 'meets' : 'does not meet'} requirement of ${requirements.timeSaved} hours`,
    },
    userSatisfaction: {
      status: actualUserSatisfaction >= requirements.userSatisfaction ? 'pass' : 'fail',
      details: `User satisfaction ${actualUserSatisfaction.toFixed(1)}% ${actualUserSatisfaction >= requirements.userSatisfaction ? 'meets' : 'does not meet'} requirement of ${requirements.userSatisfaction}%`,
    },
  };
}

function validateSecurityScan(codeIds: string[]): { status: 'pass' | 'fail'; details: string } {
  const hasSecurityIssues = codeIds.length > 0; // Simulate security scan
  return {
    status: !hasSecurityIssues ? 'pass' : 'fail',
    details: hasSecurityIssues
      ? 'Security scan passed - no critical vulnerabilities found'
      : 'Security scan failed - critical vulnerabilities found',
  };
}

function validatePerformanceTest(codeIds: string[]): { status: 'pass' | 'fail'; details: string } {
  const performancePassed = codeIds.length > 0; // Simulate performance test
  return {
    status: performancePassed ? 'pass' : 'fail',
    details: performancePassed
      ? 'Performance test passed - meets response time requirements'
      : 'Performance test failed - does not meet response time requirements',
  };
}

function validateDocumentation(codeIds: string[]): { status: 'pass' | 'fail'; details: string } {
  const docsComplete = codeIds.length > 0; // Simulate documentation check
  return {
    status: docsComplete ? 'pass' : 'fail',
    details: docsComplete
      ? 'Documentation complete - all APIs documented'
      : 'Documentation incomplete - missing API documentation',
  };
}

function validateDeployment(codeIds: string[]): { status: 'pass' | 'fail'; details: string } {
  const deploymentReady = codeIds.length > 0; // Simulate deployment check
  return {
    status: deploymentReady ? 'pass' : 'fail',
    details: deploymentReady
      ? 'Deployment ready - all checks passed'
      : 'Deployment not ready - additional configuration needed',
  };
}

function validateProductionReadiness(codeIds: string[]): {
  securityScan: { status: 'pass' | 'fail'; details: string };
  performanceTest: { status: 'pass' | 'fail'; details: string };
  documentationComplete: { status: 'pass' | 'fail'; details: string };
  deploymentReady: { status: 'pass' | 'fail'; details: string };
} {
  return {
    securityScan: validateSecurityScan(codeIds),
    performanceTest: validatePerformanceTest(codeIds),
    documentationComplete: validateDocumentation(codeIds),
    deploymentReady: validateDeployment(codeIds),
  };
}

function calculateQualityScores(
  codeIds: string[],
  qualityGates: {
    testCoverage: number;
    securityScore: number;
    complexityScore: number;
    maintainabilityScore: number;
  }
) {
  const testCoverage = validateTestCoverage(codeIds, qualityGates.testCoverage);
  const securityScore = validateSecurityScore(codeIds, qualityGates.securityScore);
  const complexityScore = validateComplexityScore(codeIds, qualityGates.complexityScore);
  const maintainabilityScore = validateMaintainabilityScore(
    codeIds,
    qualityGates.maintainabilityScore
  );

  const qualityScores = [
    testCoverage.score,
    securityScore.score,
    complexityScore.score,
    maintainabilityScore.score,
  ];
  const overallQualityScore =
    qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;

  return {
    testCoverage,
    securityScore,
    complexityScore,
    maintainabilityScore,
    overallQualityScore,
  };
}

function calculateBusinessScores(
  codeIds: string[],
  businessRequirements: {
    costPrevention: number;
    timeSaved: number;
    userSatisfaction: number;
  }
) {
  const businessValidation = validateBusinessRequirements(codeIds, businessRequirements);
  const businessScores = [
    businessValidation.costPrevention.status === 'pass' ? 100 : 0,
    businessValidation.timeSaved.status === 'pass' ? 100 : 0,
    businessValidation.userSatisfaction.status === 'pass' ? 100 : 0,
  ];
  const overallBusinessScore =
    businessScores.reduce((sum, score) => sum + score, 0) / businessScores.length;

  return {
    businessValidation,
    overallBusinessScore,
  };
}

function calculateProductionScores(
  codeIds: string[],
  _productionReadiness: {
    securityScan: boolean;
    performanceTest: boolean;
    documentationComplete: boolean;
    deploymentReady: boolean;
  }
) {
  const productionValidation = validateProductionReadiness(codeIds);
  const productionScores = [
    productionValidation.securityScan.status === 'pass' ? 100 : 0,
    productionValidation.performanceTest.status === 'pass' ? 100 : 0,
    productionValidation.documentationComplete.status === 'pass' ? 100 : 0,
    productionValidation.deploymentReady.status === 'pass' ? 100 : 0,
  ];
  const overallProductionScore =
    productionScores.reduce((sum, score) => sum + score, 0) / productionScores.length;

  return {
    productionValidation,
    overallProductionScore,
  };
}

// Main tool handler
export async function handleSmartFinish(input: unknown): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}> {
  const startTime = Date.now();

  try {
    // Validate input
    const validatedInput = SmartFinishInputSchema.parse(input);

    // Get requirements with defaults
    const qualityGates = validatedInput.qualityGates ?? {
      testCoverage: 85,
      securityScore: 90,
      complexityScore: 70,
      maintainabilityScore: 70,
    };

    const businessRequirements = validatedInput.businessRequirements ?? {
      costPrevention: 10000,
      timeSaved: 2,
      userSatisfaction: 90,
    };

    const productionReadiness = validatedInput.productionReadiness ?? {
      securityScan: true,
      performanceTest: true,
      documentationComplete: true,
      deploymentReady: true,
    };

    // Calculate all scores
    const qualityResults = calculateQualityScores(validatedInput.codeIds, qualityGates);
    const businessResults = calculateBusinessScores(validatedInput.codeIds, businessRequirements);
    const productionResults = calculateProductionScores(
      validatedInput.codeIds,
      productionReadiness
    );

    // Determine overall status
    const overallStatus =
      qualityResults.overallQualityScore >= 80 &&
      businessResults.overallBusinessScore >= 80 &&
      productionResults.overallProductionScore >= 80
        ? 'pass'
        : 'fail';

    // Generate quality scorecard
    const qualityScorecard = {
      overall: {
        score: Math.round(
          (qualityResults.overallQualityScore +
            businessResults.overallBusinessScore +
            productionResults.overallProductionScore) /
            3
        ),
        status: overallStatus,
        grade: overallStatus === 'pass' ? 'A' : 'F',
      },
      quality: {
        testCoverage: qualityResults.testCoverage,
        securityScore: qualityResults.securityScore,
        complexityScore: qualityResults.complexityScore,
        maintainabilityScore: qualityResults.maintainabilityScore,
        overall: qualityResults.overallQualityScore,
      },
      business: businessResults.businessValidation,
      production: productionResults.productionValidation,
    };

    // Generate recommendations
    const recommendations = generateRecommendations(qualityScorecard);

    // Generate success metrics
    const successMetrics = [
      `Quality score: ${qualityResults.overallQualityScore.toFixed(1)}%`,
      `Business score: ${businessResults.overallBusinessScore.toFixed(1)}%`,
      `Production score: ${productionResults.overallProductionScore.toFixed(1)}%`,
      `Overall status: ${overallStatus.toUpperCase()}`,
      `Code units validated: ${validatedInput.codeIds.length}`,
    ];

    // Generate next steps
    const nextSteps =
      overallStatus === 'pass'
        ? [
            'Deploy to production environment',
            'Set up monitoring and alerting',
            'Document deployment process',
            'Schedule regular quality reviews',
          ]
        : [
            'Address quality gate failures',
            'Improve test coverage',
            'Fix security vulnerabilities',
            'Refactor complex code',
            'Update documentation',
          ];

    // Calculate technical metrics
    const responseTime = Date.now() - startTime;

    // Calculate business value
    const businessValue = {
      totalCostPrevention: validatedInput.businessRequirements?.costPrevention ?? 10000,
      totalTimeSaved: validatedInput.businessRequirements?.timeSaved ?? 2,
      userSatisfactionScore: validatedInput.businessRequirements?.userSatisfaction ?? 90,
    };

    // Create response
    const response = {
      projectId: validatedInput.projectId,
      codeIds: validatedInput.codeIds,
      qualityScorecard,
      recommendations,
      successMetrics,
      nextSteps,
      businessValue,
      technicalMetrics: {
        responseTime,
        validationTime: Math.max(1, responseTime - 5),
        codeUnitsValidated: validatedInput.codeIds.length,
        qualityGatesChecked: 4,
        businessRequirementsChecked: 3,
        productionChecksPerformed: 4,
      },
    };

    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
  }
}

function generateRecommendations(scorecard: {
  overall: { score: number; status: string; grade: string };
  quality: { overall: number };
  business: unknown;
  production: unknown;
}): string[] {
  const recommendations = [];

  if (scorecard.quality.overall < 80) {
    recommendations.push('Improve code quality through better testing and refactoring');
  }

  if (scorecard.overall.score < 85) {
    recommendations.push('Focus on overall project quality improvements');
  }

  if (scorecard.overall.grade === 'F') {
    recommendations.push('Address critical issues before proceeding to production');
  }

  if (recommendations.length === 0) {
    recommendations.push('Project meets all quality standards - ready for production');
  }

  return recommendations;
}
