#!/bin/sh

set -e

# Clean up previous builds
git rm -rf dist/
rm -rf target/

# Build Rust into a wasm module
cargo build --target wasm32-unknown-unknown --release
wasm-bindgen target/wasm32-unknown-unknown/release/gif.wasm --target bundler --out-dir ./pkg

# Build the application
./node_modules/.bin/webpack --output-path dist/
cp public/* dist/

git add dist/

# Leave a hint what to do now
echo All done. Commit the contents of the dist/ folder and then push them to
echo GitHub Pages with
echo
echo   git subtree push --prefix dist gh gh-pages
echo
