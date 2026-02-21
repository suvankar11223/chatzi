// Simple test to verify server is accessible
const http = require('http');

const testConnection = (host, port) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: '/',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ success: true, status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      reject({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({ success: false, error: 'Connection timeout' });
    });

    req.end();
  });
};

const runTests = async () => {
  console.log('='.repeat(60));
  console.log('TESTING SERVER CONNECTIVITY');
  console.log('='.repeat(60));

  const hosts = [
    { name: 'localhost', host: 'localhost', port: 3000 },
    { name: '127.0.0.1', host: '127.0.0.1', port: 3000 },
    { name: 'Network IP', host: '172.25.252.100', port: 3000 },
  ];

  for (const { name, host, port } of hosts) {
    try {
      console.log(`\nTesting ${name} (${host}:${port})...`);
      const result = await testConnection(host, port);
      console.log(`✓ SUCCESS: ${result.status} - ${result.data}`);
    } catch (error) {
      console.log(`✗ FAILED: ${error.error}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETED');
  console.log('='.repeat(60));
};

runTests();
