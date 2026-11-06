import type { MotionOptions, MotionController } from "./motion-runtime";
export type TactilePushButtonOptions = MotionOptions;
export function mountTactilePushButton(target: HTMLElement, options?: TactilePushButtonOptions): MotionController;
