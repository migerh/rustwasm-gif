const path = require('path');

module.exports = {
  experiments: {
    asyncWebAssembly: true,
  },
  entry: {
    main: './src/index.ts'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    globalObject: 'self',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.wasm']
  },
  mode: 'development'
};
