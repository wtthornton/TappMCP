const { IntentParser } = require('./dist/vibe/core/IntentParser.js');

async function debugVerbosity() {
  const parser = new IntentParser();

  const testCases = [
    'just show me the summary',
    'show project status',
    'check code quality',
    'create a todo app'
  ];

  for (const input of testCases) {
    console.log(`\n=== Testing: "${input}" ===`);
    try {
      const intent = await parser.parseIntent(input);
      console.log('Intent type:', intent.type);
      console.log('Verbosity:', intent.parameters.verbosity);
      console.log('Confidence:', intent.confidence);
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

debugVerbosity().catch(console.error);
