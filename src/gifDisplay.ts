export class GifDisplay {
  private _root: HTMLElement;
  private _container: HTMLDivElement;
  private _progress: HTMLProgressElement;

  constructor(public name: string, root: string) {
    this._root = document.getElementById(root);

    this._progress = document.createElement('progress');
    this._progress.classList.add('gif-progress');

    const title = document.createElement('h3'),
      titleText = document.createTextNode(name);
    title.appendChild(titleText);

    this._container = document.createElement('div');
    this._container.classList.add('single-result');
    this._container.appendChild(title);
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

    const originalGif = this._createImage(original, filename),
      reversedGif = this._createImage(reversed, `${filename}-reversed.gif`);

    this._container.appendChild(originalGif);
    this._container.appendChild(reversedGif);
  }

  public showError(message: string, stack: string) {
    this._container.removeChild(this._progress);
    const errorDisplay = document.createElement('div');

    errorDisplay.innerHTML = `
    <div class="error">
      It seems like I can't reverse that gif. Here are some details if you want to
      <a class="error" href="https://github.com/migerh/rustwasm-gif/issues/new">file an issue</a>:
    </div>
    <div class="error">
      ${message}
    </div>
    <div>
      ${stack.replace(/\n/g, '<br />')}
    </div>`;

    this._container.appendChild(errorDisplay);
  }
}

export default GifDisplay;