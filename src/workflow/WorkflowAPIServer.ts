/**
 * Workflow API Server
 *
 * Express server for hosting workflow visualization API endpoints.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import express from 'express';
import cors from 'cors';
import { WorkflowDataService } from './WorkflowDataService.js';

/**
 * Workflow API Server
 *
 * Express server that provides REST API endpoints for workflow visualization.
 *
 * @example
 * ```typescript
 * const server = new WorkflowAPIServer(workflowDataService);
 * await server.start(3003);
 * ```
 *
 * @since 2.0.0
 */
export class WorkflowAPIServer {
  private app: express.Application;
  private server: any = null;
  private workflowDataService: WorkflowDataService;

  constructor(workflowDataService: WorkflowDataService) {
    this.workflowDataService = workflowDataService;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Starts the API server
   *
   * @param port - Port to listen on
   * @returns Promise resolving when server starts
   *
   * @example
   * ```typescript
   * await server.start(3003);
   * ```
   */
  async start(port: number = 3003): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(port, () => {
          console.log(`Workflow API server running on port ${port}`);
          resolve();
        });

        this.server.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use`);
            reject(new Error(`Port ${port} is already in use`));
          } else {
            console.error('Workflow API server error:', error);
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stops the API server
   *
   * @returns Promise resolving when server stops
   *
   * @example
   * ```typescript
   * await server.stop();
   * ```
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Workflow API server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Gets the Express app instance
   *
   * @returns Express app
   *
   * @example
   * ```typescript
   * const app = server.getApp();
   * ```
   */
  getApp(): express.Application {
    return this.app;
  }

  private setupMiddleware(): void {
    // CORS middleware
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // JSON parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });

    // Error handling middleware
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('API Error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date(),
          service: 'workflow-api'
        }
      });
    });

    // API info endpoint
    this.app.get('/api/info', (req, res) => {
      res.json({
        success: true,
        data: {
          name: 'TappMCP Workflow API',
          version: '2.0.0',
          description: 'REST API for workflow visualization and data management',
          endpoints: {
            graphs: '/api/workflows/graphs',
            timelines: '/api/workflows/timelines',
            statistics: '/api/workflows/statistics',
            search: '/api/workflows/search',
            filter: '/api/workflows/filter'
          }
        }
      });
    });

    // Mount workflow API routes
    const graphAPI = this.workflowDataService.getGraphAPI();
    this.app.use('/api/workflows', graphAPI.getRouter());

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.method} ${req.originalUrl} not found`
        }
      });
    });
  }
}
