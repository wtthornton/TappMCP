const request = {
  jsonrpc: '2.0',
  method: 'tools/call',
  params: {
    name: 'smart_vibe',
    arguments: {
      command: 'check the quality of this project',
      options: {
        role: 'developer',
        quality: 'standard',
        verbosity: 'standard'
      }
    }
  },
  id: 1
};

console.log('🎯 Calling smart_vibe to check project quality...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

fetch('http://localhost:8080/tools', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Smart Vibe Response:');
  console.log('==================');
  if (data.result && data.result.content) {
    data.result.content.forEach(content => {
      if (content.type === 'text') {
        console.log(content.text);
      }
    });
  } else if (data.error) {
    console.log('❌ Error:', data.error.message);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
})
.catch(error => {
  console.error('❌ Network Error:', error.message);
});
