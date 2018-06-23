import DropHandler from './dropHandler';
import GifProcessor from './gifProcessor';

// global/module level await is not supported yet :(
// that's why we need this
//    immediately invoked async function expression
// inside we can then use await instead of nested .then().
// this just initializes an drop handler and waits for
// drop events. For every gif that's dropped we check the
// image dimensions and report them to the console.
(async function () {

  async function handleDrop(file: File) {
    const dim = await GifProcessor.process(file);
    console.log(`Dimensions of ${file.name}: ${dim.width}x${dim.height}`);
  }

  const dropHandler = new DropHandler('gif-file-drop');
  dropHandler.on('drop', handleDrop);
}()
.catch(console.error));
