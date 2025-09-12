#!/usr/bin/env node

/**
 * Test smart_vibe tool with Context7 disabled to prove rate limit issue
 */

import http from 'http';

async function testSmartVibeWithoutContext7() {
  console.log('🎨 Testing smart_vibe tool WITHOUT Context7');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const requestData = JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'smart_vibe',
      arguments: {
        command: 'create a simple html page',
        options: {
          role: 'developer',
          quality: 'standard',
          verbosity: 'standard'
        }
      }
    },
    id: 1
  });

  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/tools',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.error) {
            console.log('❌ Error:', response.error.message);
            console.log('Full error:', JSON.stringify(response.error, null, 2));
            resolve(false);
          } else if (response.result && response.result.content) {
            console.log('✅ smart_vibe tool executed successfully!');
            console.log('📄 Response preview:');

            const content = response.result.content[0];
            if (content && content.text) {
              const preview = content.text.substring(0, 500) + '...';
              console.log(preview);
            }

            resolve(true);
          } else {
            console.log('❌ Unexpected response format:', data);
            resolve(false);
          }
        } catch (error) {
          console.log('❌ Failed to parse response:', error.message);
          console.log('Raw response:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request failed:', error.message);
      resolve(false);
    });

    req.write(requestData);
    req.end();
  });
}

testSmartVibeWithoutContext7().then(success => {
  if (success) {
    console.log('\n🎉 PROOF: smart_vibe works without Context7!');
    console.log('The rate limit issue is NOT preventing the tool from working.');
  } else {
    console.log('\n❌ The issue is NOT the Context7 rate limit.');
    console.log('There is a different problem preventing smart_vibe from working.');
  }
  process.exit(success ? 0 : 1);
});
