#!/usr/bin/env node

/**
 * Test 4: Extreme Complexity - Microservices Architecture
 * Difficulty: EXTREME
 * Expected: Will likely fail or produce very poor quality code
 */

const fs = require('fs');
const path = require('path');

async function test4ExtremeMicroservices() {
  console.log('🧪 Test 4: Extreme Complexity - Microservices Architecture');
  console.log('==========================================================');
  console.log('📝 Difficulty: EXTREME');
  console.log('🎯 Expected: Will likely fail or produce very poor quality code');
  console.log('');

  const prompt = "create a complete microservices architecture for an e-commerce platform with 8 services: user-service, product-service, order-service, payment-service, notification-service, inventory-service, recommendation-service, and analytics-service. Each service should have its own database, API gateway, service discovery, message queues, event sourcing, CQRS, distributed tracing, circuit breakers, load balancing, and Kubernetes deployment configurations";
  const expectedFeatures = [
    "8 separate microservices with independent databases",
    "API Gateway with routing and load balancing",
    "Service discovery with Consul or Eureka",
    "Message queues with RabbitMQ or Apache Kafka",
    "Event sourcing for all services",
    "CQRS (Command Query Responsibility Segregation)",
    "Distributed tracing with Jaeger or Zipkin",
    "Circuit breakers for fault tolerance",
    "Load balancing configuration",
    "Kubernetes deployment manifests",
    "Docker containers for each service",
    "Database per service pattern",
    "Event-driven architecture",
    "Saga pattern for distributed transactions",
    "API versioning and backward compatibility",
    "Health checks and monitoring",
    "Logging aggregation with ELK stack",
    "Security with OAuth2 and JWT",
    "Rate limiting and throttling",
    "Configuration management",
    "Service mesh with Istio",
    "Automated testing for each service",
    "CI/CD pipeline configuration",
    "Monitoring and alerting setup",
    "Documentation for each service"
  ];

  console.log('📋 Prompt:', prompt);
  console.log('🎯 Expected Features:');
  expectedFeatures.forEach((feature, index) => {
    console.log(`   ${index + 1}. ${feature}`);
  });
  console.log('');

  try {
    // Import and call smart_begin
    const { handleSmartBegin } = await import('./dist/tools/smart_begin.js');
    const projectResult = await handleSmartBegin({
      projectName: "test4-extreme-microservices",
      projectType: "microservices",
      description: "Complete e-commerce microservices architecture with 8 services"
    });

    const projectId = projectResult.data.projectId;
    console.log('✅ Project created with ID:', projectId);

    // Import and call smart_write
    const { handleSmartWrite } = await import('./dist/tools/smart_write.js');
    const result = await handleSmartWrite({
      projectId: projectId,
      featureDescription: prompt,
      targetRole: 'developer',
      codeType: 'architecture',
      techStack: ['Node.js', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Redis', 'RabbitMQ', 'TypeScript']
    });

    console.log('\n📊 Test Results:');
    console.log('================');
    console.log('Success:', result.success);
    console.log('Response Time:', result.data?.technicalMetrics?.responseTime, 'ms');
    console.log('Quality Score:', result.data?.qualityMetrics?.maintainability || 'N/A');
    console.log('Files Generated:', result.data?.technicalMetrics?.filesCreated || 0);

    // Analyze the generated code
    if (result.success && result.data?.generatedCode?.files) {
      const codeFiles = result.data.generatedCode.files;
      console.log('\n🔍 Code Analysis:');
      console.log('================');

      const analysis = {
        hasMicroservices: codeFiles.some(file => file.content.includes('service') || file.content.includes('microservice')),
        hasAPIGateway: codeFiles.some(file => file.content.includes('gateway') || file.content.includes('api-gateway')),
        hasServiceDiscovery: codeFiles.some(file => file.content.includes('consul') || file.content.includes('eureka') || file.content.includes('discovery')),
        hasMessageQueues: codeFiles.some(file => file.content.includes('rabbitmq') || file.content.includes('kafka') || file.content.includes('queue')),
        hasEventSourcing: codeFiles.some(file => file.content.includes('event') && file.content.includes('sourcing')),
        hasCQRS: codeFiles.some(file => file.content.includes('cqrs') || file.content.includes('command') && file.content.includes('query')),
        hasDistributedTracing: codeFiles.some(file => file.content.includes('jaeger') || file.content.includes('zipkin') || file.content.includes('tracing')),
        hasCircuitBreakers: codeFiles.some(file => file.content.includes('circuit') || file.content.includes('breaker')),
        hasLoadBalancing: codeFiles.some(file => file.content.includes('load') || file.content.includes('balance')),
        hasKubernetes: codeFiles.some(file => file.content.includes('kubernetes') || file.content.includes('k8s') || file.content.includes('deployment')),
        hasDocker: codeFiles.some(file => file.content.includes('docker') || file.content.includes('Dockerfile')),
        hasDatabasePerService: codeFiles.some(file => file.content.includes('database') && file.content.includes('service')),
        hasEventDriven: codeFiles.some(file => file.content.includes('event') && file.content.includes('driven')),
        hasSagaPattern: codeFiles.some(file => file.content.includes('saga') || file.content.includes('transaction')),
        hasAPIVersioning: codeFiles.some(file => file.content.includes('version') || file.content.includes('v1') || file.content.includes('v2')),
        hasHealthChecks: codeFiles.some(file => file.content.includes('health') || file.content.includes('ping')),
        hasLogging: codeFiles.some(file => file.content.includes('log') || file.content.includes('winston') || file.content.includes('bunyan')),
        hasSecurity: codeFiles.some(file => file.content.includes('oauth') || file.content.includes('jwt') || file.content.includes('auth')),
        hasRateLimiting: codeFiles.some(file => file.content.includes('rate') || file.content.includes('limit')),
        hasConfigManagement: codeFiles.some(file => file.content.includes('config') || file.content.includes('environment')),
        hasServiceMesh: codeFiles.some(file => file.content.includes('istio') || file.content.includes('mesh')),
        hasTesting: codeFiles.some(file => file.content.includes('test') || file.content.includes('jest') || file.content.includes('mocha')),
        hasCICD: codeFiles.some(file => file.content.includes('ci') || file.content.includes('cd') || file.content.includes('pipeline')),
        hasMonitoring: codeFiles.some(file => file.content.includes('monitor') || file.content.includes('prometheus') || file.content.includes('grafana')),
        hasDocumentation: codeFiles.some(file => file.content.includes('readme') || file.content.includes('docs') || file.content.includes('documentation')),
        totalFiles: codeFiles.length,
        totalLines: codeFiles.reduce((total, file) => total + file.content.split('\n').length, 0)
      };

      console.log('✅ Has Microservices:', analysis.hasMicroservices);
      console.log('✅ Has API Gateway:', analysis.hasAPIGateway);
      console.log('✅ Has Service Discovery:', analysis.hasServiceDiscovery);
      console.log('✅ Has Message Queues:', analysis.hasMessageQueues);
      console.log('✅ Has Event Sourcing:', analysis.hasEventSourcing);
      console.log('✅ Has CQRS:', analysis.hasCQRS);
      console.log('✅ Has Distributed Tracing:', analysis.hasDistributedTracing);
      console.log('✅ Has Circuit Breakers:', analysis.hasCircuitBreakers);
      console.log('✅ Has Load Balancing:', analysis.hasLoadBalancing);
      console.log('✅ Has Kubernetes:', analysis.hasKubernetes);
      console.log('✅ Has Docker:', analysis.hasDocker);
      console.log('✅ Has Database Per Service:', analysis.hasDatabasePerService);
      console.log('✅ Has Event Driven:', analysis.hasEventDriven);
      console.log('✅ Has Saga Pattern:', analysis.hasSagaPattern);
      console.log('✅ Has API Versioning:', analysis.hasAPIVersioning);
      console.log('✅ Has Health Checks:', analysis.hasHealthChecks);
      console.log('✅ Has Logging:', analysis.hasLogging);
      console.log('✅ Has Security:', analysis.hasSecurity);
      console.log('✅ Has Rate Limiting:', analysis.hasRateLimiting);
      console.log('✅ Has Config Management:', analysis.hasConfigManagement);
      console.log('✅ Has Service Mesh:', analysis.hasServiceMesh);
      console.log('✅ Has Testing:', analysis.hasTesting);
      console.log('✅ Has CI/CD:', analysis.hasCICD);
      console.log('✅ Has Monitoring:', analysis.hasMonitoring);
      console.log('✅ Has Documentation:', analysis.hasDocumentation);
      console.log('📁 Total Files:', analysis.totalFiles);
      console.log('📏 Total Lines:', analysis.totalLines);

      // Calculate quality score
      const qualityScore = Object.values(analysis).filter(Boolean).length * 4.0; // 25 features max = 100%
      console.log('\n📈 Quality Score:', Math.min(qualityScore, 100), '/100');

      // Save generated code
      const outputDir = path.join(__dirname, 'test-results', 'test4');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      codeFiles.forEach((file, index) => {
        const filename = `microservice-${index + 1}-${Date.now()}.${file.type === 'typescript' ? 'ts' : 'js'}`;
        const filePath = path.join(outputDir, filename);
        fs.writeFileSync(filePath, file.content);
        console.log(`💾 Generated file saved: ${filename}`);
      });

      console.log('\n🎯 Test 4 Result: LIKELY FAILED ❌');
      console.log('Expected: Complete microservices architecture with 25+ features');
      console.log('Actual: Generated partial code - extreme complexity likely too high');

      return { success: true, qualityScore, analysis, filePath: outputDir };
    }

    console.log('\n❌ Test 4 Result: FAILED');
    return { success: false, error: 'No microservices architecture code generated' };

  } catch (error) {
    console.log('\n❌ Test 4 Result: ERROR');
    console.log('Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Export the function for the master test runner
module.exports = { test4ExtremeMicroservices };

// Run the test if called directly
if (require.main === module) {
  test4ExtremeMicroservices().catch(console.error);
}
