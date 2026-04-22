#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { cli } = require('./cli');

console.log(`
   ____                _____    ___ 
  / __/__ __  ______  / ___/___/ _ \\
 / _// _ \`/ |/ / __/ / /__/___/ // /
/_/  \\_,_/|___/_/    \\___/   /____/                            

Starting at ${new Date().toISOString()}
`)

cli(process.argv);
