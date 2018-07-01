import { v4 } from 'uuid';
import { EventEmitter } from 'events';

import FileConverter from './fileConverter';
import Worker from 'worker-loader!./processing.worker';

export class GifReverser {
  private _jobs: GifReversalJob[];
  private _jobsWaitingForWorker: GifReversalJob[];
  private _numberOfWorkers: number = navigator.hardwareConcurrency || 2;
  private _workers: Worker[];
  private _availableWorkers: Worker[];
  private _busyWorkers: Worker[];

  constructor() {
    this._jobs = [];
    this._jobsWaitingForWorker = [];

    this._workers = Array.from(Array(this._numberOfWorkers).keys()).map(() => new Worker());
    this._workers.forEach(w => w.onmessage = this._handleMessage.bind(this));
    this._workers.forEach(w => w.onerror = this._handleError.bind(this));

    this._availableWorkers = [...this._workers];
    this._busyWorkers = [];
  }

  private _findJobById(id: string): GifReversalJob {
    return this._jobs.find(j => j.id === id);
  }

  private _removeJobById(id: string) {
    this._jobs = this._jobs.filter(j => j.id !== id);
  }

  private _getNextWorker(): Worker {
    const worker = this._availableWorkers.pop();
    this._busyWorkers.push(worker);

    return worker;
  }

  private _getNextJob(): GifReversalJob {
    const job = this._jobsWaitingForWorker.shift();
    this._jobs.push(job);

    return job;
  }

  private _makeWorkerAvailable(worker: Worker) {
    this._busyWorkers = this._busyWorkers.filter(w => w !== worker);
    this._availableWorkers.push(worker);
  }

  private _assignJobToWorker(job: GifReversalJob, worker: Worker) {
    worker.postMessage(job.getMessageForWorker());
  }

  private _distributeJobs() {
    const numberOfAvailableWorkers = this._availableWorkers.length,
      numberOfWaitingJobs = this._jobsWaitingForWorker.length,
      jobsToDistribute = Math.min(numberOfAvailableWorkers, numberOfWaitingJobs);

    for (let i = 0; i < jobsToDistribute; ++i) {
      this._assignJobToWorker(this._getNextJob(), this._getNextWorker());
    }
  }

  private _handleMessage(event: MessageEvent) {
    const data = <MessageEventData>event.data,
      id = data.id,
      job = this._findJobById(id);

    switch (data.type) {
      case 'register_progress':
        job.numberOfFrames = data.numberOfFrames;
        break;
      case 'report_progress':
        job.emit('progress', <ProgressEvent>{ ...data, numberOfFrames: job.numberOfFrames });
        break;
      case 'finished':
        this._removeJobById(id);
        this._makeWorkerAvailable(<Worker>event.target);
        this._distributeJobs();
        job.emit('finished', <ReversedGif>data);
        break;
    }
  }

  // todo: route errors to the right job
  private _handleError(event: ErrorEvent) {
    event.preventDefault();
    console.error('An error occurred initializing the worker:', event.message, event.error);
  }

  async process(file: File): Promise<GifReversalJob> {
    const buffer = await FileConverter.readAsByteArray(file),
      { name } = file,
      id = v4(),
      job = new GifReversalJob(id, name, buffer);

    this._jobsWaitingForWorker.push(job);
    this._distributeJobs();

    return job;
  }
}

export default GifReverser;

export class GifReversalJob extends EventEmitter {
  public numberOfFrames: number;

  constructor(public id: string, public name: string, public buffer: Uint8Array) {
    super();
  }

  public getMessageForWorker() {
    const {id, name, buffer} = this;
    return {id, name, buffer};
  }
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

export class ProgressEvent {
  id: string;
  name: string;
  currentFrame: number;
  numberOfFrames: number;
}

export class ReversedGif {
  id: string;
  name: string;
  buffer: Uint8Array;
  reversedBuffer: Uint8Array;
}