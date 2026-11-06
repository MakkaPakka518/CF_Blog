import { mountSailingToc, type SailingTocOptions } from "./SailingTocEngine.js";
import type { MotionController } from "./motion-runtime";

/** Mount into any DOM node. Call update() for options and destroy() on removal. */
export function mount(target: HTMLElement, options: SailingTocOptions = {}): MotionController {
  return mountSailingToc(target, options);
}
export type { SailingTocOptions };
