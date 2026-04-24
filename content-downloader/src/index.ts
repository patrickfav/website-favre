#!/usr/bin/env node
import {cli} from "./cli";

console.log(`
   ____                _____    ___ 
  / __/__ __  ______  / ___/___/ _ \\
 / _// _ \`/ |/ / __/ / /__/___/ // /
/_/  \\_,_/|___/_/    \\___/   /____/                            

Starting at ${new Date().toISOString()}
`)

void cli(process.argv);
