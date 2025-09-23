// Test Google Vision API key with a real image
const https = require('https');

const API_KEY = 'AIzaSyAqh3nCYNKJYbwPuzF09cfejbsZV5sEfog';

// Test with a small test image base64
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function testVisionAPI() {
  console.log('Testing Google Vision API with key...');

  const url = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

  const requestBody = {
    requests: [
      {
        image: {
          content: testImageBase64
        },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 10 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 5 }
        ]
      }
    ]
  };

  const postData = JSON.stringify(requestBody);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(url, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);

        if (res.statusCode === 200) {
          console.log('✅ API Key is VALID and working!');
          console.log('Status Code:', res.statusCode);
          console.log('Response:', JSON.stringify(result, null, 2));
        } else {
          console.log('❌ API Error - Status:', res.statusCode);
          console.log('Error details:', JSON.stringify(result, null, 2));

          // Check specific error types
          if (result.error) {
            if (result.error.message.includes('API key not valid')) {
              console.log('\n⚠️  The API key is invalid or not activated');
              console.log('Please check:');
              console.log('1. The API key is correct');
              console.log('2. Vision API is enabled in Google Cloud Console');
              console.log('3. The API key has Vision API permissions');
            } else if (result.error.message.includes('billing')) {
              console.log('\n⚠️  Billing is not enabled for this project');
            }
          }
        }
      } catch (e) {
        console.log('Failed to parse response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e);
  });

  req.write(postData);
  req.end();
}

testVisionAPI();