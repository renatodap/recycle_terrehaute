const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Test images
const TEST_IMAGES = {
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
  plastic_bottle: 'https://images.unsplash.com/photo-1536939459926-301728717817?w=400&q=80',
  cardboard: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'
};

// Download image from URL
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const base64 = buffer.toString('base64');
        resolve(base64);
      });
      response.on('error', reject);
    });
  });
}

// Test local API with an image
async function testImageRecognition(name, imageUrl) {
  console.log(`\n📷 Testing ${name}...`);
  console.log('=' .repeat(50));

  try {
    // Download image
    const imageBase64 = await downloadImage(imageUrl);
    console.log('✅ Image downloaded');

    // Test API
    const response = await fetch('http://localhost:3006/api/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Recognition successful!');
      console.log(`   📦 Item: ${data.item?.name}`);
      console.log(`   ♻️  Recyclable: ${data.item?.is_recyclable ? 'Yes' : 'No'}`);
      console.log(`   🗑️  Bin: ${data.item?.bin_color}`);
      console.log(`   📋 Category: ${data.item?.category}`);
      console.log(`   🏷️  Material: ${data.item?.material}`);
      console.log(`   💯 Confidence: ${data.confidence}`);
      console.log(`   🤖 Vision API: ${data.services?.vision}`);
      console.log(`   🧠 AI Interpreter: ${data.services?.interpreter}`);

      if (data.item?.special_instructions) {
        console.log(`   ⚠️  Instructions: ${data.item.special_instructions}`);
      }

      if (data.vision_labels && data.vision_labels.length > 0) {
        console.log(`   🏷️  Labels detected: ${data.vision_labels.map(l => l.name).join(', ')}`);
      }
    } else {
      console.log('❌ Recognition failed:', data.error || 'Unknown error');
    }

    return data;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Recycling App - Image Recognition Test Suite');
  console.log('=' .repeat(50));
  console.log('Testing with OpenAI Vision API as primary service');

  // Check if server is running
  try {
    const health = await fetch('http://localhost:3006/api/identify');
    const healthData = await health.json();
    console.log('\n✅ API Health Check:');
    console.log(`   - Status: ${healthData.status}`);
    console.log(`   - Vision Primary: ${healthData.services?.vision_primary}`);
    console.log(`   - Vision Fallback: ${healthData.services?.vision_fallback}`);
    console.log(`   - AI Interpreter: ${healthData.services?.ai_interpreter}`);
  } catch (error) {
    console.error('❌ Server not responding on port 3006');
    console.log('   Please run: npm run dev');
    return;
  }

  // Test each image
  const results = [];

  for (const [name, url] of Object.entries(TEST_IMAGES)) {
    const result = await testImageRecognition(name, url);
    results.push({ name, result });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));

  let successCount = 0;
  for (const { name, result } of results) {
    if (result && result.success) {
      successCount++;
      console.log(`✅ ${name}: ${result.item?.name} (${result.item?.category})`);
    } else {
      console.log(`❌ ${name}: Failed`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log(`Total: ${successCount}/${results.length} tests passed`);

  if (successCount === results.length) {
    console.log('🎉 All tests passed! Image recognition is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }
}

// Run tests
runTests().catch(console.error);