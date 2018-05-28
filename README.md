# gif reverser

A small sample project about rust and wasm that can reverse gifs.

## Tech stuff

This is mostly an evaluation project and tech demo on how to integrate wasm
into a webpack project, establishing a rust->wasm toolchain and interact
with wasm from JS and vice versa.

Notable involved libraries:

* [gif][gif] for the heavy lifting
* [wasm-bindgen][wasm-bindgen] for the rust/js interface
* [wasm-pack][wasm-pack] to compile rust to an npm package
* [webpack][webpack] to bundle everything together

## Quickstart

### Setup the dev environment

To build this project you need rust/cargo and node/npm. The easiest way to
setup rust is with [rustup][rustup.rs]. See [nodejs.org][nodejs] for node/npm.

To check that everything is ready you can use these commands:

```sh
# Check if Rust is installed.
cargo --version

# Check if npm is installed.
npm --version
```

First you need to switch to the nightly channel and install wasm-pack with

```sh
# install & switch to the nightly channel
rustup install nightly
rustup default nightly

# install wasm-pack
cargo install wasm-pack
```

### Build the project

To build the project you have to compile the rust code to a wasm module,
install a few JavaScript tools and librarie and then you can start the webpack
dev server:

```sh
# compile rust code to a wasm module
wasm-pack init

# install javascript dependencies
npm install

# run dev server
npm run serve
```

Now you can open your browser and go to <http://localhost:8080>.

## License

This project is licensed under the MIT license.

[gif]: https://github.com/PistonDevelopers/image-gif
[nodejs]: https://nodejs.org/
[rustup.rs]: https://rustup.rs/
[wasm-bindgen]: https://github.com/rustwasm/wasm-bindgen
[wasm-pack]: https://github.com/rustwasm/wasm-pack
[webpack]: https://webpack.js.org/