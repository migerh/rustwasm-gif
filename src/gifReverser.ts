import { v4 } from 'uuid';
import { EventEmitter } from 'events';

import FileConverter from './fileConverter';
import Progress from './progress';
import Worker from 'worker-loader!./processing.worker';

export class GifReverser extends EventEmitter {
  private _worker: Worker;

  constructor() {
    super();

    this._worker = new Worker();

    this._worker.onmessage = this._handleMessage.bind(this);
    this._worker.onerror = this._handleError.bind(this);
  }

  private _handleMessage(event: MessageEvent) {
    const progress = Progress.getInstance();
    const data = <MessageEventData> event.data;

    switch (data.type) {
      case 'register_progress':
        progress.addItem(data.id, data.name, data.numberOfFrames);
        break;
      case 'report_progress':
        progress.report(data.id, data.currentFrame);
        break;
      case 'finished':
        this.emit('finished', <GifProcessingResult> data);
        break;
    }
  }

  private _handleError(event: ErrorEvent) {
    this.emit('error', event);
  }

  async process(file: File): Promise<GifReversalJob> {
    const buffer = await FileConverter.readAsByteArray(file),
      { name } = file,
      id = v4();

    // send the file to the web worker to start processing
    this._worker.postMessage({ id, name, buffer });

    return new GifReversalJob(id, name);
  }
}

export default GifReverser;

export class GifReversalJob {
  constructor(public id: string, public name: string)
  {}
}

type RegisterProgressEventData = {
  type: 'register_progress';
  id: string;
  name: string;
  numberOfFrames: number;
}

type ReportProgressEventData = {
  type: 'report_progress';
  id: string;
  name: string;
  currentFrame: number;
}

type FinishedEventData = {
  type: 'finished';
  id: string;
  name: string;
  buffer: Uint8Array;
  reversedBuffer: Uint8Array;
}

type MessageEventData = RegisterProgressEventData | ReportProgressEventData | FinishedEventData;

export class GifProcessingResult {
  id: string;
  name: string;
  buffer: Uint8Array;
  reversedBuffer: Uint8Array;
}