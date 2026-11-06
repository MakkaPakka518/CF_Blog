import { mountSoftActionWheel, type SoftActionWheelOptions } from "./SoftActionWheelEngine.js";
import type { MotionController } from "./motion-runtime";

/** Mount into any DOM node. Call update() for options and destroy() on removal. */
export function mount(target: HTMLElement, options: SoftActionWheelOptions = {}): MotionController {
  return mountSoftActionWheel(target, options);
}
export type { SoftActionWheelOptions };
