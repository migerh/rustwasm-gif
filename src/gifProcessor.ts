import FileConverter from './fileConverter';
import {v4} from 'uuid';
import {Progress, ProgressItem} from './progress';
const gifModule = import('gif');

export class Dimension {
  constructor(
    public width: number,
    public height: number) {}
}

export default class GifProcessor {
  static async process(file: File): Promise<Dimension> {
    const gif = await gifModule;

    const buffer = await FileConverter.readAsByteArray(file);

    const dim = gif.get_dimension(buffer);
    const dimension = new Dimension(dim.width, dim.height);
    dim.free();

    const progress = Progress.getInstance();
    progress.on('progress', (item: ProgressItem) => {
      console.log(`${item.name}: ${item.framesFinished} done of ${item.numberOfFrames} total.`);
    });

    const id = v4();
    const reversedBuffer = gif.reverse_gif(id, file.name, buffer);
    const reversedGifData = await FileConverter.convertToDataUrl(reversedBuffer);

    const originalGifData = await FileConverter.readAsDataUrl(file);
    document.getElementById('original-gif').setAttribute('src', originalGifData);
    document.getElementById('reversed-gif').setAttribute('src', reversedGifData);

    return dimension;
  }
}