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
    const buffer = await FileConverter.read(file);

    const dim = gif.decode_gif(buffer);
    const dimension = new Dimension(dim.width, dim.height);
    dim.free();

    return dimension;
  }
}