import { EventEmitter } from "events";
import TypedEventEmitter from "typed-emitter";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFunction = (...args: any[]) => any;

type QueueEvents<T extends TFunction> = {
  added: (...args: Parameters<T>) => void;
  started: (...args: Parameters<T>) => void;
  finished: (ret: ReturnType<T>, ...args: Parameters<T>) => void;
  idle: () => void;
  paused: () => void;
  resumed: () => void;
};

class Queue<T extends TFunction> extends (EventEmitter as new <
  T extends TFunction
>() => TypedEventEmitter<QueueEvents<T>>)<T> {
  queue: Parameters<T>[] = [];
  #callback: T;
  paused: boolean = false;
  idle: boolean = true;

  constructor(callback: T) {
    super();

    this.#callback = callback;
  }

  get length() {
    return this.queue.length;
  }

  add(...args: Parameters<T>) {
    this.queue.push(args);
    this.emit("added", ...args);
    if (!this.paused && this.idle) this.#run();
  }

  async #run() {
    if (!this.queue.length || this.paused) return;

    this.idle = false;
    const args = this.queue.shift() as Parameters<T>;
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
