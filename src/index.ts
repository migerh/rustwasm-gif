import DropHandler from './dropHandler';
import {GifReverser, ReversedGif, ProgressEvent, ProcessingErrorEvent} from './gifReverser';
import FileConverter from './fileConverter';
import { GifDisplay } from './gifDisplay';

// This glues everything together. The Drophandler listens for drop events on
// the drop html element. Once a gif drops it will be passed over to the
// gif processor. Once the gif processor is finished reversing the gif we
// display it. To ensure that everything is properly initialized, we set
// everything up backwards.

// First we initialize the gif processor and…
const gifProcessor = new GifReverser(),
  rootNodeId = 'resultContainer';

// …define what happens when a job is finished.
const createJobFinishedHandler = (display: GifDisplay) => async function(data: ReversedGif) {
  const {name, buffer, reversedBuffer} = data;
  const originalGifData = await FileConverter.convertToDataUrl(buffer);
  const reversedGifData = await FileConverter.convertToDataUrl(reversedBuffer);

  display.showGifs(name, originalGifData, reversedGifData);
};

// Then we define what happens on a progress event.
const createJobProgressHandler = (display: GifDisplay) => (item: ProgressEvent) => {
  display.updateProgress(item.currentFrame, item.numberOfFrames);
};

const createErrorHandler = (display: GifDisplay) => (event: ProcessingErrorEvent) => {
  const {message, stack} = event;
  display.showError(message, stack);
};

// Finally we set up the trigger for everything above.
const dropHandler = new DropHandler('gif-file-drop');
dropHandler.on('drop', async function handleDrop(file: File) {

  const job = await gifProcessor.process(file),
    display = new GifDisplay(file.name, rootNodeId);

  job.on('progress', createJobProgressHandler(display));
  job.on('finished', createJobFinishedHandler(display));
  job.on('error', createErrorHandler(display));
});

