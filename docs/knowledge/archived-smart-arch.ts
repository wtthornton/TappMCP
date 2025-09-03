import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Architecture Decision Record Schema
const ADRSchema = z.object({
  id: z.string().describe("Unique identifier for the ADR"),
  title: z.string().describe("Clear, descriptive title"),
  status: z.enum(["proposed", "accepted", "deprecated", "superseded"]).describe("Current status"),
  date: z.string().describe("Date in YYYY-MM-DD format"),
  deciders: z.array(z.string()).describe("List of decision makers"),
  technical_story: z.string().describe("Technical context and problem statement"),
  considered_options: z.array(z.object({
    option: z.string().describe("Option description"),
    pros: z.array(z.string()).describe("Advantages"),
    cons: z.array(z.string()).describe("Disadvantages"),
    consequences: z.string().describe("Expected outcomes")
  })).describe("Options that were considered"),
  decision_outcome: z.object({
    chosen_option: z.string().describe("Selected option"),
    rationale: z.string().describe("Reasoning for the decision"),
    positive_consequences: z.array(z.string()).describe("Expected benefits"),
    negative_consequences: z.array(z.string()).describe("Expected drawbacks"),
    implementation_notes: z.string().describe("Implementation guidance")
  }).describe("Final decision and rationale")
});

export const smart_arch_tool: Tool = {
  name: "smart_arch",
  description: "AI System Architect tool for system architecture design, ADR creation, API design, and architecture reviews",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["create_adr", "design_system", "design_api", "review_architecture", "analyze_technology"],
        description: "Architecture action to perform"
      },
      context: {
        type: "string",
        description: "Context and requirements for the architecture work"
      },
      system_name: {
        type: "string",
        description: "Name of the system (for system design and reviews)"
      },
      constraints: {
        type: "array",
        items: { type: "string" },
        description: "Technical, business, or operational constraints"
      },
      requirements: {
        type: "array",
        items: { type: "string" },
        description: "Functional and non-functional requirements"
      }
    },
    required: ["action", "context"]
  }
};

export async function handleSmartArch(input: any): Promise<any> {
  const { action, context, system_name, constraints = [], requirements = [] } = input;

  try {
    switch (action) {
      case "create_adr":
        return await createArchitectureDecisionRecord(context, constraints, requirements);
      
      case "design_system":
        return await designSystemArchitecture(system_name, context, constraints, requirements);
      
      case "design_api":
        return await designAPI(system_name, context, constraints, requirements);
      
      case "review_architecture":
        return await reviewArchitecture(system_name, context, constraints);
      
      case "analyze_technology":
        return await analyzeTechnologyStack(context, constraints, requirements);
      
      default:
        throw new Error(`Unknown architecture action: ${action}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    };
  }
}

async function createArchitectureDecisionRecord(
  context: string, 
  constraints: string[], 
  requirements: string[]
): Promise<any> {
  const adr = {
    id: `ADR-${Date.now()}`,
    title: "Architecture Decision Record",
    status: "proposed" as const,
    date: new Date().toISOString().split('T')[0],
    deciders: ["AI System Architect"],
    technical_story: context,
    considered_options: [
      {
        option: "Option 1",
        pros: ["Benefit 1", "Benefit 2"],
        cons: ["Drawback 1", "Drawback 2"],
        consequences: "Expected outcomes"
      }
    ],
    decision_outcome: {
      chosen_option: "Selected option",
      rationale: "Decision reasoning based on context and constraints",
      positive_consequences: ["Benefit 1", "Benefit 2"],
      negative_consequences: ["Drawback 1", "Drawback 2"],
      implementation_notes: "Implementation guidance and next steps"
    }
  };

  return {
    success: true,
    adr: ADRSchema.parse(adr),
    recommendations: [
      "Review and validate the proposed decision with stakeholders",
      "Update implementation plan based on decision",
      "Document any follow-up decisions needed"
    ],
    timestamp: new Date().toISOString()
  };
}

async function designSystemArchitecture(
  system_name: string,
  context: string,
  constraints: string[],
  requirements: string[]
): Promise<any> {
  const architecture = {
    system_name: system_name || "System",
    overview: context,
    components: [
      {
        name: "Core Service",
        type: "service" as const,
        description: "Main business logic service",
        interfaces: ["REST API", "Internal Events"],
        dependencies: ["Database", "Message Queue"],
        data_flow: ["Request Processing", "Data Persistence"]
      }
    ],
    technology_stack: {
      languages: ["TypeScript", "Node.js"],
      frameworks: ["Express.js", "MCP SDK"],
      databases: ["PostgreSQL", "Redis"],
      infrastructure: ["Docker", "GitHub Actions"],
      rationale: "Technology choices based on project requirements and constraints"
    }
  };

  return {
    success: true,
    architecture,
    recommendations: [
      "Validate architecture with development team",
      "Create detailed component specifications",
      "Plan implementation phases",
      "Set up monitoring and observability"
    ],
    timestamp: new Date().toISOString()
  };
}

async function designAPI(
  system_name: string,
  context: string,
  constraints: string[],
  requirements: string[]
): Promise<any> {
  const api = {
    api_name: system_name || "API",
    version: "1.0.0",
    purpose: context,
    endpoints: [
      {
        path: "/api/v1/health",
        method: "GET" as const,
        description: "Health check endpoint",
        parameters: [],
        request_schema: "N/A",
        response_schema: '{"status": "healthy", "timestamp": "string"}',
        error_codes: [
          { code: 500, description: "Internal server error" }
        ]
      }
    ],
    authentication: "Bearer token authentication",
    rate_limiting: "100 requests per minute per IP",
    versioning_strategy: "URL path versioning (/api/v1/)",
    documentation_standards: "OpenAPI 3.0 specification with examples"
  };

  return {
    success: true,
    api_design: api,
    recommendations: [
      "Generate OpenAPI specification",
      "Implement API versioning strategy",
      "Set up API documentation",
      "Plan API testing strategy"
    ],
    timestamp: new Date().toISOString()
  };
}

async function reviewArchitecture(
  system_name: string,
  context: string,
  constraints: string[]
): Promise<any> {
  const review = {
    review_id: `REV-${Date.now()}`,
    system_name: system_name || "System",
    review_date: new Date().toISOString().split('T')[0],
    reviewers: ["AI System Architect"],
    review_scope: context,
    findings: [
      {
        category: "security" as const,
        severity: "medium" as const,
        description: "Security finding example",
        impact: "Potential security risk",
        recommendation: "Implement recommended security measures",
        priority: "short-term" as const
      }
    ],
    recommendations: [
      "Address identified security concerns",
      "Improve performance optimization",
      "Enhance monitoring and observability"
    ],
    compliance_status: "partially-compliant" as const,
    next_review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  return {
    success: true,
    review,
    recommendations: [
      "Prioritize findings by severity and impact",
      "Create remediation plan",
      "Schedule follow-up review",
      "Update architecture documentation"
    ],
    timestamp: new Date().toISOString()
  };
}

async function analyzeTechnologyStack(
  context: string,
  constraints: string[],
  requirements: string[]
): Promise<any> {
  const analysis = {
    context: context,
    constraints: constraints,
    requirements: requirements,
    recommendations: [
      {
        category: "Backend",
        technologies: ["Node.js", "TypeScript", "Express.js"],
        rationale: "Strong typing, excellent ecosystem, good performance",
        alternatives: ["Python/Django", "Java/Spring", "Go/Gin"],
        trade_offs: "TypeScript provides better type safety than Python"
      },
      {
        category: "Database",
        technologies: ["PostgreSQL", "Redis"],
        rationale: "ACID compliance, excellent performance, caching support",
        alternatives: ["MongoDB", "MySQL", "SQLite"],
        trade_offs: "PostgreSQL offers better consistency than MongoDB"
      }
    ],
    decision_factors: [
      "Performance requirements",
      "Team expertise",
      "Ecosystem maturity",
      "Long-term maintainability"
    ]
  };

  return {
    success: true,
    analysis,
    recommendations: [
      "Validate technology choices with team",
      "Consider migration paths",
      "Plan technology adoption timeline",
      "Document technology decisions"
    ],
    timestamp: new Date().toISOString()
  };
}
