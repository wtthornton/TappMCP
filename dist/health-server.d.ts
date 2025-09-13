#!/usr/bin/env node
import { WebSocketServer } from './websocket/WebSocketServer.js';
import { WorkflowEvents } from './websocket/events/WorkflowEvents.js';
import { PerformanceEvents } from './websocket/events/PerformanceEvents.js';
import { MetricsBroadcaster } from './websocket/MetricsBroadcaster.js';
import { OrchestrationEngine } from './core/orchestration-engine.js';
declare const healthServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
declare let wsServer: WebSocketServer | null;
declare let workflowEvents: WorkflowEvents | null;
declare let performanceEvents: PerformanceEvents | null;
declare let metricsBroadcaster: MetricsBroadcaster | null;
declare let orchestrationEngine: OrchestrationEngine | null;
export { healthServer, wsServer, workflowEvents, performanceEvents, metricsBroadcaster, orchestrationEngine };
//# sourceMappingURL=health-server.d.ts.map