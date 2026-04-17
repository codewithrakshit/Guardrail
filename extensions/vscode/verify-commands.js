#!/usr/bin/env node

/**
 * Verify Extension Commands
 * This script checks if all commands are properly declared
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying GuardRail AI Extension Commands\n');

// Read package.json
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Read compiled extension.js
const extensionPath = path.join(__dirname, 'out', 'extension.js');
const extensionJs = fs.readFileSync(extensionPath, 'utf8');

// Commands that should be declared
const requiredCommands = [
  'guardrailai.scanFile',
  'guardrailai.scanWorkspace',
  'guardrailai.clearResults',
  'guardrailai.openDashboard',
  'guardrailai.applyFix',
  'guardrailai.ignoreIssue'
];

console.log('📋 Checking package.json declarations:\n');

const declaredCommands = packageJson.contributes.commands.map(cmd => cmd.command);

requiredCommands.forEach(cmd => {
  const isDeclared = declaredCommands.includes(cmd);
  console.log(`  ${isDeclared ? '✅' : '❌'} ${cmd} ${isDeclared ? 'declared' : 'MISSING'}`);
});

console.log('\n📋 Checking extension.js registrations:\n');

requiredCommands.forEach(cmd => {
  const isRegistered = extensionJs.includes(`'${cmd}'`);
  console.log(`  ${isRegistered ? '✅' : '❌'} ${cmd} ${isRegistered ? 'registered' : 'MISSING'}`);
});

console.log('\n📋 Checking subscriptions:\n');

const hasSubscriptions = extensionJs.includes('context.subscriptions.push');
console.log(`  ${hasSubscriptions ? '✅' : '❌'} subscriptions.push found`);

const hasApplyFixInSubscriptions = extensionJs.match(/subscriptions\.push\([^)]*applyFixCommand/);
console.log(`  ${hasApplyFixInSubscriptions ? '✅' : '❌'} applyFixCommand in subscriptions`);

const hasIgnoreIssueInSubscriptions = extensionJs.match(/subscriptions\.push\([^)]*ignoreIssueCommand/);
console.log(`  ${hasIgnoreIssueInSubscriptions ? '✅' : '❌'} ignoreIssueCommand in subscriptions`);

console.log('\n📦 Extension Package Info:\n');

const vsixPath = path.join(__dirname, 'guardrail-ai-1.0.0.vsix');
if (fs.existsSync(vsixPath)) {
  const stats = fs.statSync(vsixPath);
  console.log(`  ✅ VSIX file exists: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`  📅 Last modified: ${stats.mtime.toLocaleString()}`);
} else {
  console.log(`  ❌ VSIX file not found`);
}

console.log('\n' + '='.repeat(60));

// Final verdict
const allDeclared = requiredCommands.every(cmd => declaredCommands.includes(cmd));
const allRegistered = requiredCommands.every(cmd => extensionJs.includes(`'${cmd}'`));
const inSubscriptions = hasApplyFixInSubscriptions && hasIgnoreIssueInSubscriptions;

if (allDeclared && allRegistered && inSubscriptions) {
  console.log('✅ ALL CHECKS PASSED - Extension should work!');
  console.log('\nNext steps:');
  console.log('  1. Run: ./reinstall-kiro.sh');
  console.log('  2. Reload Kiro IDE (Cmd+R)');
  console.log('  3. Test with test.js');
} else {
  console.log('❌ ISSUES FOUND:');
  if (!allDeclared) console.log('  - Some commands not declared in package.json');
  if (!allRegistered) console.log('  - Some commands not registered in extension.js');
  if (!inSubscriptions) console.log('  - Commands not added to subscriptions');
}

console.log('='.repeat(60) + '\n');
