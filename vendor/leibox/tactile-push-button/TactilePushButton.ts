import { mountTactilePushButton, type TactilePushButtonOptions } from "./TactilePushButtonEngine.js";
import type { MotionController } from "./motion-runtime";

/** Mount into any DOM node. Call update() for options and destroy() on removal. */
export function mount(target: HTMLElement, options: TactilePushButtonOptions = {}): MotionController {
  return mountTactilePushButton(target, options);
}
export type { TactilePushButtonOptions };
