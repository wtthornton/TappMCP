
# Deployed MCP Server Execution Report - Real Captured Data

## 📊 Test Run Summary
- **Test ID:** deployed_test_1757048052351
- **Start Time:** 2025-09-05T04:54:12.351Z
- **End Time:** 2025-09-05T04:54:12.735Z
- **Duration:** 384ms
- **Function Calls:** 1
- **Responses:** 0
- **Errors:** 1
- **Generated Files:** 0

## 📞 Actual Function Calls to Deployed MCP Server


### 1. smart_begin
- **Input Parameters:** {
  "projectName": "deployed-html-test",
  "projectType": "web",
  "description": "Test project for deployed MCP HTML generation"
}
- **Duration:** nullms
- **Start Time:** 2025-09-05T04:54:12.356Z
- **End Time:** 1970-01-01T00:00:00.000Z
- **Response Size:** 0 characters
- **Error:** None


## 🧠 AI Reasoning Captured from Deployed Server



## 📊 Quality Metrics from Deployed Server



## 📁 Generated Files from Deployed Server



## ❌ Errors from Deployed Server


### Error 1
- **Function:** testDeployedHTMLGeneration
- **Timestamp:** 2025-09-05T04:54:12.734Z
- **Message:** MCP server exited with code 1: node:events:502
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
    at Server.setupListenHandle [as _listen2] (node:net:1908:16)
    at listenInCluster (node:net:1965:12)
    at doListen (node:net:2139:7)
    at process.processTicksAndRejections (node:internal/process/task_queues:83:21)
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:1944:8)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
  code: 'EADDRINUSE',
  errno: -98,
  syscall: 'listen',
  address: '0.0.0.0',
  port: 3000
}

Node.js v20.19.5

- **Stack:** Error: MCP server exited with code 1: node:events:502
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
    at Server.setupListenHandle [as _listen2] (node:net:1908:16)
    at listenInCluster (node:net:1965:12)
    at doListen (node:net:2139:7)
    at process.processTicksAndRejections (node:internal/process/task_queues:83:21)
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:1944:8)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
  code: 'EADDRINUSE',
  errno: -98,
  syscall: 'listen',
  address: '0.0.0.0',
  port: 3000
}

Node.js v20.19.5

    at ChildProcess.<anonymous> (C:\cursor\TappMCP\test-deployed-mcp-real.js:69:16)
    at ChildProcess.emit (node:events:518:28)
    at maybeClose (node:internal/child_process:1101:16)
    at ChildProcess._handle.onexit (node:internal/child_process:304:5)


## 📈 Performance Analysis
- **Total Function Calls:** 1
- **Average Call Duration:** 0ms
- **Total Test Duration:** 384ms
- **Success Rate:** 0%
