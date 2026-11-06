# LeiBox source

The complete Vanilla package for `sailing-toc` was retrieved from the live LeiBox directory for this project. Its original files are retained in `sailing-toc/`.

- Documentation: https://leibox.pantoria.cn/docs/animations/sailing-toc
- Design reference: https://x.com/emirayaz/status/2113414926911881647/video/1
- Design author: Emir Ayaz
- Source notice: retain source notices and design-reference attribution; the catalogue assigns no blanket licence.

`public/assets/contents.js` adapts the package's active-section tracking and damped position-following for server-rendered blog articles. It replaces the demonstration article and nautical drawing with real article headings and a bookmark, respects reduced motion, and stops when settled or hidden. The original demo and bundled fonts are not shipped to readers.

## Soft Action Wheel

The complete Vanilla package is retained in `soft-action-wheel/`, including `SOURCE.json` with the download URL, source notice and original usage.

- Documentation: https://leibox.pantoria.cn/docs/animations/soft-action-wheel
- Design reference: https://x.com/withAnimationUI/status/2110643020890849625/video/1
- Design author: withAnimation
- LeiBox implementation: independent native radial-menu reconstruction; original design licence was not supplied or independently verified.

`src/reading-tools.js` imports the downloaded `SoftActionWheel.ts` entry. It replaces the six demo actions with article-link copying, top-of-article navigation, the archive, appearance switching, RSS and printing. Local demo status messages are removed. Blog colours, Chinese labels and shared icons are applied inside the component's Shadow DOM. The controller is destroyed on page exit and remounted on back/forward-cache restoration. There are no runtime dependencies.

During bundling, `scripts/build-components.mjs` moves the package's inline stylesheet into `reading-tools-base.css` and removes the demo's inline colour attributes, so the blog retains `style-src 'self'`. The downloaded source files remain intact.

## Tactile Push Button

The complete Vanilla package is retained in `tactile-push-button/`, including `SOURCE.json`.

- Documentation: https://leibox.pantoria.cn/docs/animations/tactile-push-button
- Source and design author: 少荃 (Douyin: 宝龙体育优品小铺)
- Source notice: community submission; no separate licence was supplied.

The package explicitly separates its demo layout from the reusable `.tactile-button` CSS. `scripts/build-components.mjs` extracts that complete component CSS without executing the engine. Server-rendered links/buttons use its original nested span structure; the blog adjusts size, colour, focus and reduced-motion treatment in `style.css`. This preserves native links and no-JavaScript reading without mounting a demo button.
