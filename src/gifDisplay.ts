export class GifDisplay {
  private _root: HTMLElement;
  private _container: HTMLDivElement;
  private _progress: HTMLProgressElement;
  private _title: HTMLHeadingElement;
  private _titleText: Text;
  private _originalGif: HTMLAnchorElement;
  private _reversedGif: HTMLAnchorElement;

  constructor(public name: string, root: string) {
    this._root = document.getElementById(root);

    this._progress = document.createElement('progress');
    this._progress.classList.add('gif-progress');

    this._title = document.createElement('h3');
    this._titleText = document.createTextNode(name);
    this._title.appendChild(this._titleText);

    this._container = document.createElement('div');
    this._container.appendChild(this._title);
    this._container.appendChild(this._progress);

    if (this._root.childNodes.length > 0) {
      this._root.insertBefore(this._container, this._root.childNodes[0]);
    } else {
      this._root.appendChild(this._container);
    }
  }

  public updateProgress(current: number, max: number) {
    this._progress.max = max;
    this._progress.value = current;
  }

  private _createImage(src: string, filename: string): HTMLAnchorElement {
    const image = document.createElement('img');
    image.src = src;

    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    link.appendChild(image);

    return link;
  }

  public showGifs(filename: string, original: string, reversed: string) {
    this._container.removeChild(this._progress);
    this._originalGif = this._createImage(original, filename);
    this._reversedGif = this._createImage(reversed, `${filename}-reversed.gif`);
    this._container.appendChild(this._originalGif);
    this._container.appendChild(this._reversedGif);
  }
}

export default GifDisplay;