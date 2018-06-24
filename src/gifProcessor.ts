import FileConverter from './fileConverter';
const gifModule = import('gif');

export class Dimension {
  constructor(
    public width: Number,
    public height: Number) {}
}

export default class GifProcessor {
  static async process(file: File): Promise<Dimension> {
    const gif = await gifModule;

    const buffer = await FileConverter.readAsByteArray(file);

    const dim = gif.get_dimension(buffer);
    const dimension = new Dimension(dim.width, dim.height);
    dim.free();

    const reversedBuffer = gif.reverse_gif(buffer);
    const reversedGifData = await FileConverter.convertToDataUrl(reversedBuffer);

    const originalGifData = await FileConverter.readAsDataUrl(file);
    document.getElementById('original-gif').setAttribute('src', originalGifData);
    document.getElementById('reversed-gif').setAttribute('src', reversedGifData);

    return dimension;
  }
}