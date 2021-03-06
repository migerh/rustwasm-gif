#!/bin/sh

# Clean up previous builds. webpack will generate a main.js, a <hash>.wasm
# module and one <hash>.worker.js.
git rm main.js
find . -maxdepth 1 -name '*.wasm' -exec git rm {} \;
find . -maxdepth 1 -name '*.worker.js' -exec git rm {} \;

# Rebuild the application
./node_modules/.bin/webpack-cli --output-path .

# Add the freshly built js/wasm modules
git add main.js
git add ./*.wasm
git add ./*.worker.js