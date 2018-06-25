import DropHandler from './dropHandler';
import {GifReverser, GifProcessingResult} from './gifReverser';
import FileConverter from './fileConverter';
import {Progress, ProgressItem} from './progress';

// This glues everything together. The Drophandler listens for drop events on
// the drop html element. Once a gif drops it will be passed over to the
// gif processor. Once the gif processor is finished reversing the gif we
// display it. To ensure that everything is properly initialized, we set
// everything up backwards.

// First we initialize the gif processor and…
const gifProcessor = new GifReverser();

// …define what happens when it finishes…
gifProcessor.on('finished', async function(data: GifProcessingResult) {
  const {buffer, reversedBuffer} = data;
  const originalGifData = await FileConverter.convertToDataUrl(buffer);
  const reversedGifData = await FileConverter.convertToDataUrl(reversedBuffer);

  document.getElementById('original-gif').setAttribute('src', originalGifData);
  document.getElementById('reversed-gif').setAttribute('src', reversedGifData);
});

// …resp. what happens when an error occurs.
gifProcessor.on('error', (event: ErrorEvent) => {
  console.error(`An error occurred while processing a gif:\n${event.error}\n${event.message}`);
})

// Then we define what happens on a progress event.
const progress = Progress.getInstance();
progress.on('progress', (item: ProgressItem) => {
  const progressBar = <HTMLProgressElement> document.getElementById('gif-progress');
  progressBar.max = item.numberOfFrames;
  progressBar.value = item.framesFinished;
});

// Finally we set up the trigger for everything above.
const dropHandler = new DropHandler('gif-file-drop');
dropHandler.on('drop', async function handleDrop(file: File) {
  await gifProcessor.process(file);
});

