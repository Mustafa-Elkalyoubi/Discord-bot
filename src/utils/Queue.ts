import { EventEmitter } from "events";
import TypedEventEmitter from "typed-emitter";

type QueueEvents<T extends any[], Q> = {
  added: (...args: T[]) => void;
  started: (...args: T[]) => void;
  finished: (ret: Q, ...args: T[]) => void;
  idle: () => void;
  paused: () => void;
  resumed: () => void;
};

class Queue<T extends any[], Q> extends (EventEmitter as new <
  T extends any[],
  Q
>() => TypedEventEmitter<QueueEvents<T, Q>>)<T, Q> {
  queue: T[] = [];
  #callback: (...args: T) => Promise<Q>;
  paused: boolean = false;
  idle: boolean = true;

  constructor(callback: (...args: T) => Promise<Q>) {
    super();

    this.#callback = callback;
  }

  get length() {
    return this.queue.length;
  }

  add(...args: T) {
    this.queue.push(args);
    this.emit("added", ...args);
    if (!this.paused && this.idle) this.#run();
  }

  async #run() {
    if (!this.queue.length || this.paused) return;

    this.idle = false;
    const args = this.queue.shift() as T;
    this.emit("started", ...args);
    const ret = await this.#callback(...args);
    this.emit("finished", ret, ...args);

    if (this.queue.length) this.#run();
    else {
      this.idle = true;
      this.emit("idle");
    }

    return ret;
  }

  pause() {
    this.paused = true;
    this.emit("paused");
  }

  resume() {
    this.paused = false;
    if (!this.idle) this.#run();
    this.emit("resumed");
  }
}

export default Queue;
