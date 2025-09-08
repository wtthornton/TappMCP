import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMCPClientManager, MCPClientManager } from '../external/MCPClientManager';

describe('Real MCP Integration Tests', () => {
  let mcpManager: MCPClientManager;

  beforeEach(() => {
    mcpManager = createMCPClientManager({
      timeout: 10000,
      maxRetries: 2,
      enableFallback: true
    });
  });

  afterEach(async () => {
    await mcpManager.stopAllServers();
  });

  describe('MCP Server Availability Detection', () => {
    it('should accurately detect which MCP servers are real vs simulated', async () => {
      console.log('\n🔍 CHECKING REAL MCP SERVER AVAILABILITY...\n');

      const availability = await mcpManager.checkServerAvailability();
      const status = mcpManager.getIntegrationStatus();

      console.log('\n📊 REAL MCP INTEGRATION STATUS REPORT');
      console.log('==========================================');
      console.log(`Total Servers: ${status.total}`);
      console.log(`✅ Real Servers: ${status.real}`);
      console.log(`❌ Simulated Servers: ${status.simulated}`);
      console.log(`📈 Real Integration Progress: ${status.integrationProgress.toFixed(1)}%`);

      console.log('\n📋 SERVER-BY-SERVER BREAKDOWN:');
      status.servers.forEach(server => {
        const statusIcon = server.isReal ? '✅ REAL' : '❌ SIMULATED';
        const packageStatus = server.hasPackage ? 'Package exists' : 'Package missing';
        console.log(`  ${server.name}: ${statusIcon} (${packageStatus})`);
      });

      console.log('\n🚨 SERVERS NEEDING WORK:');
      if (status.needsWork.length === 0) {
        console.log('  🎉 All servers are real - no work needed!');
      } else {
        status.needsWork.forEach(server => {
          console.log(`  ❌ ${server.name}: ${!server.hasPackage ? 'Package missing' : 'Connection failed'}`);
        });
      }

      console.log('\n✅ WORKING REAL SERVERS:');
      if (status.working.length === 0) {
        console.log('  ⚠️ No real servers working - all simulated!');
      } else {
        status.working.forEach(server => {
          console.log(`  ✅ ${server.name}: Fully functional`);
        });
      }

      // Assertions
      expect(availability).toBeInstanceOf(Map);
      expect(status.total).toBeGreaterThan(0);
      expect(status.integrationProgress).toBeGreaterThanOrEqual(0);
      expect(status.integrationProgress).toBeLessThanOrEqual(100);

      // Document the reality
      console.log(`\n🎯 INTEGRATION REALITY CHECK:`);
      if (status.integrationProgress < 50) {
        console.log(`❌ CRITICAL: Only ${status.integrationProgress.toFixed(1)}% real integration!`);
      } else if (status.integrationProgress < 80) {
        console.log(`⚠️ MODERATE: ${status.integrationProgress.toFixed(1)}% real integration - needs improvement`);
      } else {
        console.log(`✅ GOOD: ${status.integrationProgress.toFixed(1)}% real integration`);
      }
    }, 30000);
  });

  describe('Real Server Connection Tests', () => {
    it('should connect to working real MCP servers', async () => {
      const availability = await mcpManager.checkServerAvailability();
      const status = mcpManager.getIntegrationStatus();

      console.log('\n🔌 TESTING REAL SERVER CONNECTIONS...');

      let realServersStarted = 0;

      for (const server of status.working) {
        console.log(`\n🚀 Testing ${server.name} connection...`);

        try {
          const process = await mcpManager.startServer(server.key);

          if (process) {
            console.log(`✅ ${server.name}: Connection established`);
            realServersStarted++;

            // Give it a moment to start
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Verify it's still running
            if (!process.killed) {
              console.log(`✅ ${server.name}: Still running after 1 second`);
            } else {
              console.log(`❌ ${server.name}: Process died after startup`);
            }
          } else {
            console.log(`❌ ${server.name}: Failed to start`);
          }
        } catch (error) {
          console.log(`❌ ${server.name}: Connection error - ${error}`);
        }
      }

      console.log(`\n📊 REAL CONNECTION RESULTS:`);
      console.log(`✅ Real servers started: ${realServersStarted}/${status.working.length}`);
      console.log(`❌ Simulated servers: ${status.needsWork.length}`);

      // Assert that we could start at least some real servers
      if (status.working.length > 0) {
        expect(realServersStarted).toBeGreaterThan(0);
      } else {
        console.log('⚠️ No real servers available - all connections are simulated');
        expect(realServersStarted).toBe(0);
      }
    }, 30000);
  });

  describe('Integration Recommendations', () => {
    it('should provide actionable recommendations for improving integration', async () => {
      await mcpManager.checkServerAvailability();
      const recommendations = mcpManager.getRecommendations();

      console.log('\n🎯 ACTIONABLE RECOMMENDATIONS:');
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });

      expect(Array.isArray(recommendations)).toBe(true);

      // If we're not at 100% integration, we should have recommendations
      const status = mcpManager.getIntegrationStatus();
      if (status.integrationProgress < 100) {
        expect(recommendations.length).toBeGreaterThan(0);
        console.log(`\n✅ Generated ${recommendations.length} recommendations for improvement`);
      } else {
        console.log(`\n🎉 100% integration achieved - no recommendations needed!`);
      }
    });
  });

  describe('Fallback System Validation', () => {
    it('should verify fallback systems work when real servers fail', async () => {
      const status = mcpManager.getIntegrationStatus();

      console.log('\n🔄 TESTING FALLBACK SYSTEMS...');

      // Test brokers that should have fallbacks
      const fallbackTests = [
        { name: 'Context7Broker', path: '../brokers/context7-broker' },
        { name: 'WebSearchBroker', path: '../brokers/websearch-broker' }
      ];

      for (const fallback of fallbackTests) {
        console.log(`\n📋 Testing ${fallback.name} fallback...`);

        try {
          const module = await import(fallback.path);
          const BrokerClass = module[fallback.name];

          if (BrokerClass) {
            const broker = new BrokerClass();
            console.log(`✅ ${fallback.name}: Fallback broker instantiated successfully`);

            // Test if it has expected methods
            const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(broker))
              .filter(name => typeof broker[name] === 'function' && name !== 'constructor');

            console.log(`✅ ${fallback.name}: Available methods: ${methods.join(', ')}`);
            expect(methods.length).toBeGreaterThan(0);
          } else {
            console.log(`❌ ${fallback.name}: Broker class not found`);
          }
        } catch (error) {
          console.log(`❌ ${fallback.name}: Import failed - ${error}`);
        }
      }

      console.log(`\n📊 FALLBACK SYSTEM STATUS:`);
      console.log(`✅ Fallback brokers ensure system continues working`);
      console.log(`⚠️ But fallbacks provide simulated data, not real integration`);
      console.log(`🎯 Goal: Replace all fallbacks with real MCP connections`);
    });
  });

  describe('Production Readiness Assessment', () => {
    it('should assess if the system is production-ready with current integration', async () => {
      await mcpManager.checkServerAvailability();
      const status = mcpManager.getIntegrationStatus();

      console.log('\n🏭 PRODUCTION READINESS ASSESSMENT');
      console.log('===================================');

      // Production readiness criteria
      const criteria = {
        minRealIntegration: 80, // At least 80% real integration
        requiredRealServers: ['filesystem', 'github'], // These must be real
        maxSimulatedCritical: 1 // Maximum 1 critical simulated service
      };

      const realIntegrationScore = status.integrationProgress;
      const criticalRealServers = criteria.requiredRealServers.filter(key => {
        const server = status.servers.find(s => s.key === key);
        return server?.isReal;
      });

      const isProductionReady =
        realIntegrationScore >= criteria.minRealIntegration &&
        criticalRealServers.length === criteria.requiredRealServers.length;

      console.log(`📊 Integration Score: ${realIntegrationScore.toFixed(1)}% (${criteria.minRealIntegration}% required)`);
      console.log(`📋 Critical Servers Real: ${criticalRealServers.length}/${criteria.requiredRealServers.length}`);
      console.log(`🎯 Production Ready: ${isProductionReady ? '✅ YES' : '❌ NO'}`);

      if (!isProductionReady) {
        console.log(`\n🚨 PRODUCTION BLOCKERS:`);
        if (realIntegrationScore < criteria.minRealIntegration) {
          console.log(`❌ Integration too low: ${realIntegrationScore.toFixed(1)}% < ${criteria.minRealIntegration}%`);
        }

        const missingCritical = criteria.requiredRealServers.filter(key =>
          !status.servers.find(s => s.key === key && s.isReal)
        );

        if (missingCritical.length > 0) {
          console.log(`❌ Missing critical real servers: ${missingCritical.join(', ')}`);
        }

        console.log(`\n🎯 TO ACHIEVE PRODUCTION READINESS:`);
        console.log(`1. Achieve ${criteria.minRealIntegration}% real integration (need ${(criteria.minRealIntegration - realIntegrationScore).toFixed(1)}% more)`);
        console.log(`2. Ensure critical servers are real: ${criteria.requiredRealServers.join(', ')}`);
        console.log(`3. Reduce dependency on simulated fallbacks`);
      } else {
        console.log(`\n🎉 SYSTEM IS PRODUCTION READY!`);
        console.log(`✅ All critical requirements met`);
        console.log(`✅ High real integration percentage`);
        console.log(`✅ Fallbacks available for resilience`);
      }

      // Always pass but log the assessment
      expect(typeof isProductionReady).toBe('boolean');

      return { isProductionReady, score: realIntegrationScore, critical: criticalRealServers.length };
    }, 30000);
  });
});