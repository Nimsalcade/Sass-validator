// Simple demonstration of the scraping guardrails API
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function demo() {
  console.log('🕷️  Scraping Guardrails Demo');
  console.log('============================\n');

  try {
    // Health check
    console.log('1. Health Check:');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Server is healthy:', healthResponse.data);
    console.log('');

    // Example 1: Basic scraping
    console.log('2. Basic Scraping:');
    const scrapeResponse = await axios.post(`${API_URL}/scrape`, {
      url: 'https://example.com',
      user: 'demo-user',
      project: 'demo-project'
    });
    console.log('Result:', {
      success: scrapeResponse.data.success,
      status: scrapeResponse.data.status,
      cached: scrapeResponse.data.cached,
      rateLimited: scrapeResponse.data.rateLimited,
      robotsAllowed: scrapeResponse.data.robotsAllowed,
      contentLength: scrapeResponse.data.content?.length || 0
    });
    console.log('');

    // Example 2: Same URL again (should use cache)
    console.log('3. Same URL (should use cache):');
    const cachedResponse = await axios.post(`${API_URL}/scrape`, {
      url: 'https://example.com',
      user: 'demo-user',
      project: 'demo-project'
    });
    console.log('Result:', {
      success: cachedResponse.data.success,
      status: cachedResponse.data.status,
      cached: cachedResponse.data.cached,
      rateLimited: cachedResponse.data.rateLimited,
      robotsAllowed: cachedResponse.data.robotsAllowed,
      contentLength: cachedResponse.data.content?.length || 0
    });
    console.log('');

    // Example 3: Get audit logs
    console.log('4. Audit Logs:');
    const auditResponse = await axios.get(`${API_URL}/audit/logs?userId=demo-user&limit=5`);
    console.log(`Found ${auditResponse.data.logs.length} audit entries`);
    auditResponse.data.logs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.url} - Status: ${log.status}, Cached: ${log.cached}, Rate Limited: ${log.rateLimited}`);
    });
    console.log('');

    // Example 4: Get statistics
    console.log('5. Statistics:');
    const statsResponse = await axios.get(`${API_URL}/audit/stats`);
    console.log('Stats:', statsResponse.data);
    console.log('');

    console.log('✅ Demo completed successfully!');
    console.log('\nKey features demonstrated:');
    console.log('- ✅ Robots.txt compliance');
    console.log('- ✅ Request caching');
    console.log('- ✅ Audit logging');
    console.log('- ✅ Rate limiting');
    console.log('- ✅ PII filtering (applied to content)');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running. Start it with: npm run dev');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

if (require.main === module) {
  demo();
}

module.exports = { demo };