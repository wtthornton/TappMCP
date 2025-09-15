import { spawn } from 'child_process';

console.log('🧪 Manual MCP Server Test');
console.log('========================');

const server = spawn('node', ['working-mcp-server.js'], {
    cwd: 'C:\\cursor\\TappMCP',
    stdio: ['pipe', 'pipe', 'pipe']
});

// Send list tools request
const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
};

console.log('📤 Sending request:', JSON.stringify(request, null, 2));

server.stdin.write(JSON.stringify(request) + '\n');

server.stdout.on('data', (data) => {
    console.log('📥 Response:', data.toString());
});

server.stderr.on('data', (data) => {
    console.error('❌ Error:', data.toString());
});

server.on('close', (code) => {
    console.log(`📊 Server exited with code: ${code}`);
});

setTimeout(() => {
    console.log('⏰ Test completed, stopping server...');
    server.kill();
}, 5000);
