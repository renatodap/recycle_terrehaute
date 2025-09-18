#!/usr/bin/env node

/**
 * Security check script to detect exposed secrets
 * Run this before committing to ensure no credentials are exposed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns that indicate potential secrets
const SECRET_PATTERNS = [
  /AIzaSy[A-Za-z0-9_-]{33}/g,  // Google API Key pattern
  /sk-[A-Za-z0-9]{48}/g,        // OpenAI API Key pattern
  /[a-f0-9]{40}/g,              // Generic API key (40 char hex)
  /[a-f0-9]{64}/g,              // Generic API key (64 char hex)
  /"private_key":\s*"[^"]+"/g,  // Private key in JSON
  /-----BEGIN[\s\S]+?-----END/g, // PEM format keys
];

// Known safe patterns to ignore
const SAFE_PATTERNS = [
  'your_google_vision_api_key_here',
  'your_clarifai_pat_here',
  'sk-...your-key-here',
  'test-key',
  'mock',
  'example',
  'placeholder',
  'YOUR_',
  'your_',
];

// Files/directories to skip
const IGNORE_PATHS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '.env',
  '.env.local',
  '*.example',
];

function shouldIgnorePath(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);

  for (const ignorePath of IGNORE_PATHS) {
    if (ignorePath.includes('*')) {
      const pattern = ignorePath.replace('*', '.*');
      if (new RegExp(pattern).test(relativePath)) return true;
    } else if (relativePath.includes(ignorePath)) {
      return true;
    }
  }
  return false;
}

function checkFileForSecrets(filePath) {
  if (shouldIgnorePath(filePath)) return [];

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    for (const pattern of SECRET_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Check if it's a safe pattern
          const isSafe = SAFE_PATTERNS.some(safe =>
            match.toLowerCase().includes(safe.toLowerCase())
          );

          if (!isSafe && match.length > 20) {
            // Find line number
            const lines = content.split('\\n');
            let lineNum = 0;
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(match.substring(0, 20))) {
                lineNum = i + 1;
                break;
              }
            }

            issues.push({
              file: filePath,
              line: lineNum,
              match: match.substring(0, 20) + '...' + (match.length > 40 ? '...' : ''),
              type: detectSecretType(match)
            });
          }
        }
      }
    }

    return issues;
  } catch (error) {
    return [];
  }
}

function detectSecretType(secret) {
  if (secret.startsWith('AIzaSy')) return 'Google API Key';
  if (secret.startsWith('sk-')) return 'OpenAI API Key';
  if (secret.includes('BEGIN')) return 'Private Key (PEM)';
  if (secret.includes('private_key')) return 'Service Account Key';
  if (secret.length === 40 && /^[a-f0-9]+$/.test(secret)) return 'API Token (40-char)';
  if (secret.length === 64 && /^[a-f0-9]+$/.test(secret)) return 'API Token (64-char)';
  return 'Potential Secret';
}

function getGitFiles() {
  try {
    // Get list of files that would be committed
    const trackedFiles = execSync('git ls-files', { encoding: 'utf8' })
      .split('\\n')
      .filter(Boolean);

    // Get list of staged files
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\\n')
      .filter(Boolean);

    return [...new Set([...trackedFiles, ...stagedFiles])];
  } catch (error) {
    // If not a git repo, check all files
    return getAllFiles('.');
  }
}

function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);

    if (shouldIgnorePath(fullPath)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (stat.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function main() {
  console.log('🔍 Checking for exposed secrets...');
  console.log('================================\\n');

  const files = getGitFiles();
  let totalIssues = 0;
  const allIssues = [];

  for (const file of files) {
    const issues = checkFileForSecrets(file);
    if (issues.length > 0) {
      allIssues.push(...issues);
      totalIssues += issues.length;
    }
  }

  if (totalIssues > 0) {
    console.log('⚠️  POTENTIAL SECRETS DETECTED:\\n');

    for (const issue of allIssues) {
      console.log(`📄 ${issue.file}:${issue.line}`);
      console.log(`   Type: ${issue.type}`);
      console.log(`   Value: ${issue.match}`);
      console.log('');
    }

    console.log(`\\n❌ Found ${totalIssues} potential secret(s)`);
    console.log('\\nRecommendations:');
    console.log('1. Move secrets to .env.local file');
    console.log('2. Ensure .env.local is in .gitignore');
    console.log('3. Use environment variables in code');
    console.log('4. Never commit actual API keys or credentials');

    process.exit(1);
  } else {
    console.log('✅ No secrets detected in tracked files');
    console.log('\\n📋 Verified:');
    console.log(`   - Checked ${files.length} files`);
    console.log('   - No API keys found');
    console.log('   - No private keys found');
    console.log('   - No service account credentials found');
    console.log('\\n🎉 Safe to commit!');
  }
}

// Run the check
main();