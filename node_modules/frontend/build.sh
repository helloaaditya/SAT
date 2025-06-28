#!/bin/bash

# Clean install to avoid Rollup issues
rm -rf node_modules package-lock.json
npm install

# Remove problematic optional dependencies
rm -rf node_modules/@rollup/rollup-linux-x64-gnu || true

# Build the project
npm run build 