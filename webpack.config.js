module.exports = {
  //...
  experiments: {
    asyncWebAssembly: true, // for async modules
    // or
    // syncWebAssembly: true, // like webpack 4, but it's deprecated
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: "webassembly/async", // for async modules
        // or
        // type: "webassembly/sync", // like webpack 4, but it's deprecated
      },
      // other rules...
    ],
  },
  //...
};
