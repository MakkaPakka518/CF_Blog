# LeiBox source

The complete Vanilla package for `sailing-toc` was retrieved from the live LeiBox directory for this project. Its original files are retained in `sailing-toc/`.

- Documentation: https://leibox.pantoria.cn/docs/animations/sailing-toc
- Design reference: https://x.com/emirayaz/status/2113414926911881647/video/1
- Design author: Emir Ayaz
- Source notice: retain source notices and design-reference attribution; the catalogue assigns no blanket licence.

`public/assets/contents.js` adapts the package's active-section tracking and damped position-following for server-rendered blog articles. It replaces the demonstration article and nautical drawing with real article headings and a bookmark, respects reduced motion, and stops when settled or hidden. The original demo and bundled fonts are not shipped to readers.
