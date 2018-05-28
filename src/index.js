import DropHandler from './dropHandler';
import FileReader from './fileReader';

const gifModule = import("../pkg");

// global/module level await is not supported yet :(
// that's why we need this
//    immediately invoked async function expression
// inside we can then use await instead of nested .then().
// this just initializes an drop handler and waits for
// drop events. For every gif that's dropped we check the
// image dimensions and report them to the console.
(async function () {
  const gif = await gifModule;

  async function handleDrop(file) {
    const buffer = await FileReader.read(file);
    const dim = gif.decode_gif(buffer);
    console.log(`dimensions: ${dim.width}x${dim.height}`);
    dim.free();
  }

  const dropHandler = new DropHandler('gif-file-drop');
  dropHandler.on('drop', handleDrop);
}()
.catch(console.error));
