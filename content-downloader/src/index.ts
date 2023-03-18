#!/usr/bin/env node

import esm from "esm";

console.log(`
   ____                _____    ___ 
  / __/__ __  ______  / ___/___/ _ \\
 / _// _ \`/ |/ / __/ / /__/___/ // /
/_/  \\_,_/|___/_/    \\___/   /____/                            

Starting at ${new Date().toISOString()}
`)

require = esm(module /*, options*/);
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('../dist/cli').cli(process.argv);
