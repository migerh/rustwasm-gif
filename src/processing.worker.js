// Ideally, this file would be written in typescript as well but something is
// not working correctly. So for now at least this will be plain javascript.

// The next two functions `registerProgress` and `reportProgress` will be
// called from the rust wasm module. They have to be defined before importing
// the wasm module otherwise the import will fail.

// We just forward the data to the main thread. The main thread will add the
// gif to the progress module.
self.registerProgress = (id, name, numberOfFrames) => {
  self.postMessage({
    type: 'register_progress',
    id,
    name,
    numberOfFrames
  });
}

// This function will be called after every frame that was processed by the
// wasm module. All we do here is pass the information through to the main
// thread which will then update the progress bar.
self.reportProgress = (id, currentFrame) => {
  self.postMessage({
    type: 'report_progress',
    id,
    currentFrame
  });
}

// Import the wasm wrapper module generated by wasm-bindgen.
let gifModule = require("../pkg/gif");

// Once we get a message from the main thread we can start processing the gif.
self.addEventListener('message', async (event) => {
  try {
    const { id, name, buffer } = event.data;

    // Make sure the wasm module is fully initialized.
    const gif = await gifModule;

    // Reverse the gif.
    const reversedBuffer = gif.reverse_gif(id, name, buffer);

    // Tell the main thread that we're finished.
    self.postMessage({
      type: 'finished',
      id,
      name,
      buffer,
      reversedBuffer
    });
  } catch (e) {
    self.postMessage({
      type: 'error',
      id: event.data.id,
      name: event.data.name,
      message: e.message,
      stack: e.stack
    })
  }
});