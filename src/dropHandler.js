import { EventEmitter } from 'events';

// A small helper class that registers drag&drop events on the given
// element and emits drop events for every gif that is dropped.
export default class DropHandler extends EventEmitter {
  constructor(id) {
    super();

    this.node = document.getElementById(id);

    this.node.addEventListener('dragover', (e) => this.handleDragOver(e), false);
    this.node.addEventListener('drop', (e) => this.handleDrop(e), false);
  }

  _preventDefault(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  handleDrop(event) {
    this._preventDefault(event);

    Array.from(event.dataTransfer.files)
      .filter(file => file.type === 'image/gif')
      .forEach(gif => this.emit('drop', gif));
  }

  handleDragOver(event) {
    this._preventDefault(event);
  }
}