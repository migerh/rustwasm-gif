const path = require('path');

module.exports = {
  entry: "./src/index.ts",
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.wasm$/,
        type: "webassembly/experimental"
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.wasm']
  },
  mode: "development"
};
