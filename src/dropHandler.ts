import { EventEmitter } from 'events';

// A small helper class that registers drag&drop events on the given
// element and emits an event for every gif that is dropped.
export default class DropHandler extends EventEmitter {
  private _node: HTMLElement;

  constructor(id: string) {
    super();

    this._node = document.getElementById(id);

    this._node.addEventListener('dragover', (e) => this.handleDragOver(e), false);
    this._node.addEventListener('drop', (e) => this.handleDrop(e), false);
  }

  private _preventDefault(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
  }

  handleDrop(event: DragEvent) {
    this._preventDefault(event);

    Array.from(event.dataTransfer.files)
      .filter((file: File) => file.type === 'image/gif')
      .forEach((gif: File) => this.emit('drop', gif));
  }

  handleDragOver(event: DragEvent) {
    this._preventDefault(event);
  }
}