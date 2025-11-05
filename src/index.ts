import { app } from './server';
import { config } from './config';
import { AuditService } from './services/audit.service';

const auditService = new AuditService();

async function startServer() {
  try {
    const server = app.listen(config.server.port, () => {
      console.log(`🚀 Scraping Guardrails server running on port ${config.server.port}`);
      console.log(`📊 Environment: ${config.server.env}`);
      console.log(`🔍 Health check: http://localhost:${config.server.port}/health`);
      console.log(`🌐 API endpoint: http://localhost:${config.server.port}/scrape`);
      console.log(`📈 Audit logs: http://localhost:${config.server.port}/audit/logs`);
      console.log(`📊 Audit stats: http://localhost:${config.server.port}/audit/stats`);
    });

    // Schedule cleanup of old audit logs (daily at 2 AM)
    setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 2 && now.getMinutes() === 0) {
        console.log('🧹 Running scheduled cleanup of old audit logs...');
        await auditService.cleanupOldLogs();
      }
    }, 60 * 60 * 1000); // Check every hour

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});