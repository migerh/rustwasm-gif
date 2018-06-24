import { EventEmitter } from "events";

export type ProgressItem = {
  id: string,
  name: string,
  numberOfFrames: number,
  framesFinished: number
}

export class Progress extends EventEmitter {
  private _items: Map<string, ProgressItem>;
  private static _instance: Progress | undefined;

  private constructor() {
    super();
    this._items = new Map<string, ProgressItem>();
  }

  public static getInstance(): Progress {
    if (this._instance === undefined) {
      this._instance = new Progress();
    }

    return this._instance;
  }

  public addItem(id: string, name: string, numberOfFrames: number) {
    this._items.set(id, {
      id,
      name,
      numberOfFrames,
      framesFinished: 0
    });
  }

  public report(id: string, currentFrame: number) {
    // if there is no entry for this id, we don't know how
    // many frames there are in total -> discard the report.
    if (!this._items.has(id)) {
      return;
    }

    const entry = this._items.get(id),
      updatedEntry = {
        ...entry,
        framesFinished: currentFrame
      };

    this._items.set(id, updatedEntry);

    this.emit('progress', updatedEntry);
  }
}

// wasm-bindgen does not support static members yet.
export const getProgress = () => Progress.getInstance();

export default Progress;