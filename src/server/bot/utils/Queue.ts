import { EventEmitter } from "node:events";
import { nanoid } from "nanoid";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFunction = (...args: any[]) => any;

type QueueEvents<T extends TFunction> = {
  added: (id: string) => void;
  removed: (id: string) => void;
  started: (id: string) => void;
  finished: (ret: ReturnType<T>, id: string) => void;
  idle: () => void;
  paused: () => void;
  resumed: () => void;
};

class Queue<T extends TFunction> extends (EventEmitter as new <
  T extends TFunction,
>() => TypedEventEmitter<QueueEvents<T>>)<T> {
  queue: { id: string; args: Parameters<T> }[] = [];
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
    const id = nanoid();
    this.queue.push({ id, args });
    this.emit("added", id);
    if (!this.paused && this.idle) this.#run();
  }

  remove(id: string) {
    this.queue = this.queue.filter((item) => item.id !== id);
    this.emit("removed", id);
  }

  async #run() {
    if (!this.queue.length || this.paused) return;

    this.idle = false;
    const item = this.queue.shift()!;
    this.emit("started", item.id);
    const ret = await this.#callback(...item.args);
    this.emit("finished", ret, item.id);

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
