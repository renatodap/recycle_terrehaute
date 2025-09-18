#!/usr/bin/env node

/**
 * Manual testing script for image detection
 * Tests the API with real images to verify detection accuracy
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_IMAGES = {
  plastic_bottle: {
    // Using a generic plastic bottle image URL for testing
    url: 'https://images.unsplash.com/photo-1581092160562-2c7a0b9b7b2e?w=400',
    expected: {
      material: 'Plastic',
      recyclable: true,
      binColor: 'Blue'
    }
  },
  apple: {
    // Using a generic apple image URL for testing
    url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    expected: {
      material: 'Organic',
      recyclable: false,
      binColor: 'Green'
    }
  },
  cardboard: {
    url: 'https://images.unsplash.com/photo-1607166452427-7e4477079c2f?w=400',
    expected: {
      material: 'Paper',
      recyclable: true,
      binColor: 'Blue'
    }
  },
  glass_bottle: {
    url: 'https://images.unsplash.com/photo-1551024506-0bccd14400b2?w=400',
    expected: {
      material: 'Glass',
      recyclable: true,
      binColor: 'Blue'
    }
  }
};

// Helper to download and convert image to base64
async function imageUrlToBase64(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const base64 = buffer.toString('base64');
        const mimeType = response.headers['content-type'] || 'image/jpeg';
        resolve(`data:${mimeType};base64,${base64}`);
      });
      response.on('error', reject);
    });
  });
}

// Helper to test the API
async function testDetection(imageName, imageData, expected) {
  console.log(`\\n🔍 Testing ${imageName}...`);

  try {
    const response = await fetch(`${API_URL}/api/identify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData })
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();

    // Check if detection was successful
    if (!result.success) {
      console.error(`❌ Detection failed: ${result.error}`);
      return false;
    }

    // Verify results
    console.log(`  📦 Item: ${result.item.name}`);
    console.log(`  🏷️  Material: ${result.item.material}`);
    console.log(`  ♻️  Recyclable: ${result.item.is_recyclable}`);
    console.log(`  🗑️  Bin: ${result.item.bin_color}`);
    console.log(`  📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`  ⚙️  Services: Vision=${result.services.vision}, AI=${result.services.interpreter}`);

    // Validate against expected results
    let passed = true;
    if (expected.material && result.item.material !== expected.material) {
      console.warn(`  ⚠️  Material mismatch: expected ${expected.material}, got ${result.item.material}`);
      passed = false;
    }
    if (expected.recyclable !== undefined && result.item.is_recyclable !== expected.recyclable) {
      console.warn(`  ⚠️  Recyclable mismatch: expected ${expected.recyclable}, got ${result.item.is_recyclable}`);
      passed = false;
    }
    if (expected.binColor && result.item.bin_color !== expected.binColor) {
      console.warn(`  ⚠️  Bin color mismatch: expected ${expected.binColor}, got ${result.item.bin_color}`);
      passed = false;
    }

    if (passed) {
      console.log(`  ✅ Test PASSED`);
    } else {
      console.log(`  ⚠️  Test PASSED with warnings`);
    }

    return passed;
  } catch (error) {
    console.error(`❌ Test FAILED: ${error.message}`);
    return false;
  }
}

// Test with local file
async function testLocalImage(filepath) {
  console.log(`\\n📁 Testing local file: ${filepath}`);

  if (!fs.existsSync(filepath)) {
    console.error(`❌ File not found: ${filepath}`);
    return false;
  }

  const imageBuffer = fs.readFileSync(filepath);
  const base64 = imageBuffer.toString('base64');
  const ext = path.extname(filepath).substring(1);
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const imageData = `data:${mimeType};base64,${base64}`;

  const filename = path.basename(filepath, path.extname(filepath));
  return await testDetection(`Local: ${filename}`, imageData, {});
}

// Main test runner
async function runTests() {
  console.log('🧪 Recycling Detection Test Suite');
  console.log('================================');
  console.log(`📍 API URL: ${API_URL}`);

  // Check if API is running
  try {
    const healthResponse = await fetch(`${API_URL}/api/identify`);
    const health = await healthResponse.json();
    console.log(`\\n✅ API is healthy`);
    console.log(`  Services configured:`);
    console.log(`  - Vision Primary: ${health.services.vision_primary}`);
    console.log(`  - Vision Fallback: ${health.services.vision_fallback}`);
    console.log(`  - AI Interpreter: ${health.services.ai_interpreter}`);
  } catch (error) {
    console.error(`❌ API is not responding: ${error.message}`);
    console.error(`   Make sure the server is running with: npm run dev`);
    process.exit(1);
  }

  let totalTests = 0;
  let passedTests = 0;

  // Test with predefined images
  console.log('\\n📸 Testing with sample images...');
  for (const [name, config] of Object.entries(TEST_IMAGES)) {
    try {
      console.log(`\\nDownloading ${name} image...`);
      const imageData = await imageUrlToBase64(config.url);
      totalTests++;
      if (await testDetection(name, imageData, config.expected)) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ Failed to test ${name}: ${error.message}`);
    }
  }

  // Test with local images if provided
  const args = process.argv.slice(2);
  if (args.length > 0) {
    console.log('\\n📁 Testing with local images...');
    for (const filepath of args) {
      totalTests++;
      if (await testLocalImage(filepath)) {
        passedTests++;
      }
    }
  }

  // Summary
  console.log('\\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\\n🎉 All tests passed!');
  } else {
    console.log(`\\n⚠️  ${totalTests - passedTests} tests failed or had warnings`);
  }
}

// Run tests
runTests().catch(console.error);

// Usage instructions
if (process.argv.includes('--help')) {
  console.log(`
Usage: node test-detection.js [image-file-1] [image-file-2] ...

This script tests the recycling detection API with sample images.

Options:
  --help     Show this help message

Examples:
  node test-detection.js                    # Test with default sample images
  node test-detection.js bottle.jpg         # Test with a local image
  node test-detection.js *.jpg              # Test with multiple local images

Environment Variables:
  API_URL    The URL of the API (default: http://localhost:3000)
`);
  process.exit(0);
}