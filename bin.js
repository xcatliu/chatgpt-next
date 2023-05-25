#!/usr/bin/env node

const { spawn } = require('child_process');

// 获取命令行参数
const args = process.argv.slice(2);

spawn('npm', ['start', ...args], {
  stdio: 'inherit',
  cwd: __dirname,
});
