#!/usr/bin/env node

/**
 * Test 3: High Complexity - Full-Stack API with Database
 * Difficulty: HIGH
 * Expected: Should struggle, might fail or produce incomplete code
 */

const fs = require('fs');
const path = require('path');

async function test3HighFullstack() {
  console.log('🧪 Test 3: High Complexity - Full-Stack API with Database');
  console.log('=========================================================');
  console.log('📝 Difficulty: HIGH');
  console.log('🎯 Expected: Should struggle, might fail or produce incomplete code');
  console.log('');

  const prompt = "create a complete REST API for a blog system with Express.js, MongoDB, authentication, CRUD operations for posts and comments, file upload for images, pagination, search functionality, and rate limiting";
  const expectedFeatures = [
    "Express.js server setup with TypeScript",
    "MongoDB connection and schema definitions",
    "User authentication with JWT tokens",
    "Password hashing with bcrypt",
    "CRUD operations for blog posts",
    "CRUD operations for comments",
    "File upload middleware for images",
    "Pagination for posts and comments",
    "Search functionality with text indexing",
    "Rate limiting middleware",
    "Input validation with Joi or Zod",
    "Error handling middleware",
    "CORS configuration",
    "Environment variable configuration",
    "Database models with Mongoose",
    "API route organization",
    "Middleware for authentication",
    "Image storage and serving",
    "API documentation comments",
    "Testing setup with Jest"
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
      projectName: "test3-high-fullstack",
      projectType: "api",
      description: "Complete blog API with authentication, database, and file upload"
    });

    const projectId = projectResult.data.projectId;
    console.log('✅ Project created with ID:', projectId);

    // Import and call smart_write
    const { handleSmartWrite } = await import('./dist/tools/smart_write.js');
    const result = await handleSmartWrite({
      projectId: projectId,
      featureDescription: prompt,
      targetRole: 'developer',
      codeType: 'api',
      techStack: ['Node.js', 'Express', 'MongoDB', 'TypeScript', 'JWT', 'Multer']
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
        hasExpressSetup: codeFiles.some(file => file.content.includes('express') || file.content.includes('app.listen')),
        hasMongoDB: codeFiles.some(file => file.content.includes('mongoose') || file.content.includes('MongoDB')),
        hasAuthentication: codeFiles.some(file => file.content.includes('jwt') || file.content.includes('auth') || file.content.includes('login')),
        hasPasswordHashing: codeFiles.some(file => file.content.includes('bcrypt') || file.content.includes('hash')),
        hasCRUDPosts: codeFiles.some(file => file.content.includes('posts') && (file.content.includes('create') || file.content.includes('update'))),
        hasCRUDComments: codeFiles.some(file => file.content.includes('comments') && (file.content.includes('create') || file.content.includes('update'))),
        hasFileUpload: codeFiles.some(file => file.content.includes('multer') || file.content.includes('upload')),
        hasPagination: codeFiles.some(file => file.content.includes('page') || file.content.includes('limit') || file.content.includes('skip')),
        hasSearch: codeFiles.some(file => file.content.includes('search') || file.content.includes('find') || file.content.includes('query')),
        hasRateLimiting: codeFiles.some(file => file.content.includes('rate') || file.content.includes('limit')),
        hasValidation: codeFiles.some(file => file.content.includes('joi') || file.content.includes('zod') || file.content.includes('validate')),
        hasErrorHandling: codeFiles.some(file => file.content.includes('error') || file.content.includes('catch') || file.content.includes('middleware')),
        hasCORS: codeFiles.some(file => file.content.includes('cors') || file.content.includes('CORS')),
        hasEnvConfig: codeFiles.some(file => file.content.includes('process.env') || file.content.includes('dotenv')),
        hasModels: codeFiles.some(file => file.content.includes('Schema') || file.content.includes('Model')),
        hasRoutes: codeFiles.some(file => file.content.includes('router') || file.content.includes('routes')),
        hasMiddleware: codeFiles.some(file => file.content.includes('middleware') || file.content.includes('app.use')),
        hasImageStorage: codeFiles.some(file => file.content.includes('image') || file.content.includes('static')),
        hasDocumentation: codeFiles.some(file => file.content.includes('/**') || file.content.includes('@param')),
        hasTesting: codeFiles.some(file => file.content.includes('jest') || file.content.includes('test') || file.content.includes('describe')),
        totalFiles: codeFiles.length,
        totalLines: codeFiles.reduce((total, file) => total + file.content.split('\n').length, 0)
      };

      console.log('✅ Has Express Setup:', analysis.hasExpressSetup);
      console.log('✅ Has MongoDB:', analysis.hasMongoDB);
      console.log('✅ Has Authentication:', analysis.hasAuthentication);
      console.log('✅ Has Password Hashing:', analysis.hasPasswordHashing);
      console.log('✅ Has CRUD Posts:', analysis.hasCRUDPosts);
      console.log('✅ Has CRUD Comments:', analysis.hasCRUDComments);
      console.log('✅ Has File Upload:', analysis.hasFileUpload);
      console.log('✅ Has Pagination:', analysis.hasPagination);
      console.log('✅ Has Search:', analysis.hasSearch);
      console.log('✅ Has Rate Limiting:', analysis.hasRateLimiting);
      console.log('✅ Has Validation:', analysis.hasValidation);
      console.log('✅ Has Error Handling:', analysis.hasErrorHandling);
      console.log('✅ Has CORS:', analysis.hasCORS);
      console.log('✅ Has Env Config:', analysis.hasEnvConfig);
      console.log('✅ Has Models:', analysis.hasModels);
      console.log('✅ Has Routes:', analysis.hasRoutes);
      console.log('✅ Has Middleware:', analysis.hasMiddleware);
      console.log('✅ Has Image Storage:', analysis.hasImageStorage);
      console.log('✅ Has Documentation:', analysis.hasDocumentation);
      console.log('✅ Has Testing:', analysis.hasTesting);
      console.log('📁 Total Files:', analysis.totalFiles);
      console.log('📏 Total Lines:', analysis.totalLines);

      // Calculate quality score
      const qualityScore = Object.values(analysis).filter(Boolean).length * 4.5; // 22 features max = 100%
      console.log('\n📈 Quality Score:', Math.min(qualityScore, 100), '/100');

      // Save generated code
      const outputDir = path.join(__dirname, 'test-results', 'test3');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      codeFiles.forEach((file, index) => {
        const filename = `blog-api-${index + 1}-${Date.now()}.${file.type === 'typescript' ? 'ts' : 'js'}`;
        const filePath = path.join(outputDir, filename);
        fs.writeFileSync(filePath, file.content);
        console.log(`💾 Generated file saved: ${filename}`);
      });

      console.log('\n🎯 Test 3 Result: PARTIAL PASS ⚠️');
      console.log('Expected: Complete full-stack API with all features');
      console.log('Actual: Generated partial API code - complexity may be too high');

      return { success: true, qualityScore, analysis, filePath: outputDir };
    }

    console.log('\n❌ Test 3 Result: FAILED');
    return { success: false, error: 'No full-stack API code generated' };

  } catch (error) {
    console.log('\n❌ Test 3 Result: ERROR');
    console.log('Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Export the function for the master test runner
module.exports = { test3HighFullstack };

// Run the test if called directly
if (require.main === module) {
  test3HighFullstack().catch(console.error);
}
