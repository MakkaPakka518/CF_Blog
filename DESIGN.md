---
name: "Worker D1 Blog — Vellum Indigo"
description: "A flat, indigo publication frame for mixed technical and personal writing, with native Markdown administration."
colors:
  color-paper: "oklch(96% 0.012 240)"
  color-paper-2: "oklch(92% 0.018 245)"
  color-ink: "oklch(24% 0.035 265)"
  color-ink-2: "oklch(33% 0.028 265)"
  color-muted: "oklch(47% 0.026 265)"
  color-rule: "oklch(77% 0.02 250)"
  color-accent: "oklch(43% 0.17 268)"
  color-accent-deep: "oklch(35% 0.15 268)"
  color-accent-ink: "oklch(95% 0.02 82)"
  color-focus: "oklch(50% 0.18 268)"
  color-field: "oklch(43% 0.17 268)"
  color-field-ink: "oklch(97% 0.012 245)"
  color-field-muted: "oklch(89% 0.035 252)"
  color-error: "oklch(52% 0.19 27)"
  color-success: "oklch(50% 0.12 150)"
  color-soft-shadow: "oklch(24% 0.025 265 / 0.06)"
  color-paper-dark: "oklch(19% 0.018 265)"
  color-paper-2-dark: "oklch(23% 0.022 265)"
  color-ink-dark: "oklch(93% 0.012 240)"
  color-ink-2-dark: "oklch(85% 0.020 245)"
  color-muted-dark: "oklch(73% 0.020 250)"
  color-rule-dark: "oklch(42% 0.022 265)"
  color-accent-dark: "oklch(76% 0.11 268)"
  color-accent-deep-dark: "oklch(83% 0.08 268)"
  color-accent-ink-dark: "oklch(20% 0.025 265)"
  color-focus-dark: "oklch(78% 0.12 268)"
  color-field-dark: "oklch(36% 0.12 268)"
  color-error-dark: "oklch(78% 0.12 25)"
  color-success-dark: "oklch(77% 0.11 155)"
  color-soft-shadow-dark: "oklch(12% 0.01 265 / 0.16)"
typography:
  display:
    fontFamily: '"Grenze Gotisch", "Noto Serif SC", "Noto Serif CJK SC", "Songti SC", "STSong", Georgia, serif'
    fontSize: "clamp(2.3rem, 4.4vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.22
    letterSpacing: "-0.01em"
  headline:
    fontFamily: '"Grenze Gotisch", "Noto Serif SC", "Noto Serif CJK SC", "Songti SC", "STSong", Georgia, serif'
    fontSize: "clamp(1.85rem, 3.1vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.28
    letterSpacing: "-0.01em"
  article-title:
    fontFamily: '"Grenze Gotisch", "Noto Serif SC", "Noto Serif CJK SC", "Songti SC", "STSong", Georgia, serif'
    fontSize: "clamp(2rem, 4vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  section:
    fontFamily: '"Grenze Gotisch", "Noto Serif SC", "Noto Serif CJK SC", "Songti SC", "STSong", Georgia, serif'
    fontSize: "1.953rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: '"Hanken Grotesk", "PingFang SC", "Microsoft YaHei", ui-sans-serif, sans-serif'
    fontSize: "1.5625rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0"
  body:
    fontFamily: '"Hanken Grotesk", "PingFang SC", "Microsoft YaHei", ui-sans-serif, sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  reading:
    fontFamily: '"Hanken Grotesk", "PingFang SC", "Microsoft YaHei", ui-sans-serif, sans-serif'
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.9
  lead:
    fontFamily: '"Hanken Grotesk", "PingFang SC", "Microsoft YaHei", ui-sans-serif, sans-serif'
    fontSize: "clamp(1.125rem, 0.35vw + 1rem, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: '"Hanken Grotesk", "PingFang SC", "Microsoft YaHei", ui-sans-serif, sans-serif'
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.55
  button:
    fontFamily: '"Hanken Grotesk", "PingFang SC", "Microsoft YaHei", ui-sans-serif, sans-serif'
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.2
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  radius-card: "2px"
  radius-pill: "2px"
  radius-tactile: "0.75rem"
spacing:
  space-2xs: "4px"
  space-xs: "8px"
  space-sm: "12px"
  space-md: "16px"
  space-lg: "24px"
  space-xl: "40px"
  space-2xl: "64px"
  space-3xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.color-accent}"
    textColor: "{colors.color-accent-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.radius-pill}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.color-accent-deep}"
    textColor: "{colors.color-accent-ink}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.color-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.radius-pill}"
    padding: "12px 24px"
  button-quiet-hover:
    backgroundColor: "{colors.color-paper-2}"
    textColor: "{colors.color-ink}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.color-ink-2}"
    padding: "8px 0"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.color-ink}"
    rounded: "{rounded.radius-pill}"
    width: "44px"
    height: "44px"
  input:
    backgroundColor: "{colors.color-paper}"
    textColor: "{colors.color-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.radius-card}"
    padding: "12px 16px"
  navigation:
    textColor: "{colors.color-ink}"
    padding: "12px 0"
  tag:
    textColor: "{colors.color-muted}"
  feature-story:
    backgroundColor: "{colors.color-field}"
    textColor: "{colors.color-field-ink}"
    padding: "24px"
  article-row:
    textColor: "{colors.color-ink}"
    padding: "40px 0"
  contents-bookmark:
    textColor: "{colors.color-accent}"
    width: "16px"
    height: "16px"
---

# Design System: Worker D1 Blog — Vellum Indigo

## Overview

**Creative North Star: "The Vellum Indigo Reading Index"**

A cool-paper publication frame pairs ink-blue fields with measured rules and generous reading margins. The independent-bookshop character comes from typography, dated writing and a marginal bookmark. It accommodates technical notes and personal essays without assigning a fictional identity to the owner.

Public pages prioritize comprehension; the private writing workspace uses the same materials at a denser, task-oriented scale. Display lettering frames the publication while sans-serif controls and native Markdown editing keep work direct. Motion reports reading position or a control state; the page has no decorative ambient animation.

**Key Characteristics:**
- Cool paper, dark ink and one indigo accent family in light and dark appearances.
- Chinese serif display, Latin blackletter display, sans-serif reading and controls, code-only monospace including Markdown source.
- Flat publication surfaces, hairline separators and double-rule framing.
- Dated article rows, a leading article field and a section-following marginal bookmark.
- Editable identity, clearly disclosed local examples and truthful empty states.

### Authority and scope

This is a built-system handoff. Token definitions come from `public/assets/tokens.css`; `public/assets/base.css` supplies the foundation and `public/assets/style.css` supplies the final cascade. Markup and route behavior come from `src/views.js`, `src/worker.js`, `src/content.js` and `src/store.js`; enhancements come from `public/assets/app.js`, `admin.js` and `contents.js` in the same asset directory. Font loading is defined in `public/assets/fonts/fonts.css`.

Frontmatter owns the color, typography, corner, spacing and component primitives. `.impeccable/design.json` uses schema version 2: its token-bearing extensions record actual shadow, motion and breakpoint values, with live-bound component specimens and matching narrative. Its eight-step tonal ramps are synthesized display aids, not additional shipped CSS tokens. The snippets represent component appearance and CSS states; application actions and spring tracking remain in the source modules.

Visual evidence: `.impeccable/review/desktop.png`, `home-375.png`, `home-dark-1440.png`, `article-desktop.png`, `article-mobile.png`, `admin-desktop.png`, `editor-desktop.png`, `editor-mobile.png` and `empty-desktop.png`. These show the publication frame, CJK display, stacked mobile reading/editor layouts and the actual empty-content presentation. The screenshots include local demonstration and browser-check text; their titles, dates, article counts and authorless masthead are not owner-approved material.

The supplied finish verdict records both opening fixes resolved in the hero review and both material fixes resolved in the independent final review, with **ship at the fix-pass scope**. The durable interaction outcomes are status-preserving Enter submission and field-local, associated errors that reveal the relevant editing panel. This handoff records that verdict and the current implementation; it is not a new runtime or deployment review.

### Route application

The mode authority remains `.impeccable/surfaces/src-worker-js.md`; the following maps its Read/Operate split to the built routes.

| Route | Mode and composition |
| --- | --- |
| `/` | Read: short introduction, first result as a leading article, then dated rows. Featured posts precede chronological posts; this is not a guarantee that the lead is always the newest article. Empty content renders an honest first-article state. |
| `/archive`, `/search` | Read: heading, GET search, text category filters, chronological rows, counts and pagination. Query keys are `q`, `category`, `tag` and `page`. |
| `/posts/:slug` | Read: title, date/category, optional deck/cover, Markdown prose, chapter index when there are at least two H2/H3 headings, article-end metadata and up to two related entries. |
| `/about` | Read: configurable introduction and Markdown biography; missing biography is stated plainly. |
| `/admin/login` | Operate: narrow password form and recovery-oriented feedback. |
| `/admin` | Operate: article table, `全部` / `草稿` / `已发布` / `回收站` status navigation, search, edit/preview/trash/restore and export. |
| `/admin/posts/new`, `/admin/posts/:id` | Operate: title, Markdown/preview, publishing settings and explicit save/publication actions. |
| `/admin/settings` | Operate: editable name, description, byline, biography and links. |
| `/admin/preview/:id` | Read within authenticated administration: article composition, admin frame and a private-preview notice; admin heading typography follows the sans-serif override. |
| `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/admin/export` | Data endpoints, not additional visual modes. Export is an authenticated download. |

### Owner-material boundary

`个人博客` is the configurable title fallback, not a confirmed brand. `技术与生活的记录。` is fallback description copy. Name, byline, biography, genuine articles, imagery, domain, repository and deployment account remain owner-supplied decisions per `PRODUCT.md`. The local demo banner says `当前为本地演示内容，不代表作者的真实文章。`; retain it wherever demonstration content is shown. With no published content, show `第一篇文章，还在路上。`; with no biography, show `作者尚未添加自我介绍。` Do not infer a career, history or content inventory from fixtures.

## Colors

The palette is cool vellum and blue-black ink, with a concentrated indigo field rather than a multicolor brand system. OKLCH values in the frontmatter preserve the CSS source format.

### Primary

- `--color-accent`: publication indigo for primary actions, active text, prose links and the bookmark.
- `--color-accent-deep`: primary hover fill; the dark-theme value is lighter, despite the inherited name.
- `--color-accent-ink`: text on primary buttons.
- `--color-field`, `--color-field-ink`, `--color-field-muted`: leading-article background, text and quieter metadata. In light mode the field aliases `var(--color-accent)`; its frontmatter entry records that resolved value. In dark mode it has an independent, darker indigo fill. Field text and field metadata keep their light-mode values in both themes.
- `--color-focus`: keyboard outline. Inside the leading article it is locally rebound to `var(--color-field-ink)` so focus remains visible against indigo.

### Neutral

- `--color-paper`: page and input ground; `--color-paper-2`: code, preview, publishing settings, recovery messages and quiet hover surfaces.
- `--color-ink`: primary text and double rules; `--color-ink-2`: supporting excerpts and text actions; `--color-muted`: dates, help, labels and secondary navigation.
- `--color-rule`: row separators, table rules and inactive underlines.
- `--color-soft-shadow`: alpha tint used only by the transient notice shadow.
- `--color-clear` is `transparent`, used for unfilled buttons and tap-highlight suppression; it is not a hue swatch.

### Semantic feedback and appearance

`--color-error` marks validation text and invalid borders; `--color-success` marks published status and successful settings feedback. These are status colors, not additional decorative accents. Status always has a text label.

Frontmatter keys match CSS custom-property names without the initial `--`. A `-dark` suffix records the value of that same property under `:root[data-theme="dark"]`; it is a documentation key, not a new CSS variable. Properties without a dark entry retain their base value. Component previews bind to the real CSS properties, so they follow the active theme.

The early theme script reads `blog-theme` from local storage or uses the system preference. The toggle's accessible label names the destination appearance; system changes are followed when no explicit preference is stored. Without JavaScript the default is light. Under `prefers-contrast: more`, `--color-rule` becomes `var(--color-muted)`. Text selection uses `color-mix(in oklab, var(--color-accent) 22%, transparent)` with ink text.

**The Field Contrast Rule.** Keep field text, field metadata and field focus on their dedicated inverse tokens; ordinary muted ink does not belong on the indigo leading article.

Existing `.impeccable/review/contrast.json` records light/dark ratios of 14.68/15.02 for body text, 7.83/10.22 for field text, 6.16/8.04 for field metadata and 6.08/7.73 for row dates. Those sampled pairs are evidence, not a blanket accessibility certification.

## Typography

### Families and delivery

The `--font-display`, `--font-body` and `--font-outlier` stacks are reproduced exactly in frontmatter `typography.display.fontFamily`, `typography.body.fontFamily` and `typography.code.fontFamily` respectively. Display is **Grenze Gotisch** for supported Latin glyphs and self-hosted **Noto Serif SC** for Chinese, then the listed CJK serif fallbacks. Body and controls use **Hanken Grotesk** with PingFang SC / Microsoft YaHei and sans-serif fallbacks. Monospace is reserved for inline code, code blocks and the Markdown source textarea.

`fonts/fonts.css` self-hosts Grenze Gotisch at weight 600, Hanken Grotesk at weights 400–600, and Unicode-subset Noto Serif SC at weight 600; all use `font-display: swap`. Body and headings disable synthetic font styles with `font-synthesis: none`. `--display-weight` is `600`; `--tracking-display` is `-0.01em`. Admin H1–H3 use the body stack and zero tracking; the masthead and footer wordmarks retain display type.

### Hierarchy and source tokens

Frontmatter roles describe final rendered roles, not unused foundation defaults. The source scale is approximately 1.25× from `--text-md` upward; small text and fluid display roles are separately tuned.

| CSS token | Actual value | Application |
| --- | --- | --- |
| `--text-sm` | `0.875rem` | Dates, metadata, navigation, help, labels and code blocks. |
| `--text-md` | `1rem` | Body/UI baseline, inputs, buttons, mobile prose and Markdown source. |
| `--text-lg` | `1.25rem` | Prose subheads and mobile index titles. |
| `--text-xl` | `1.5625rem` | Index titles, title input, footer name and mobile wordmark/admin heading. |
| `--text-2xl` | `1.953rem` | Desktop wordmark, section labels, prose H1/H2 and desktop admin heading. |
| `--text-display-s` | `clamp(2.25rem, 4vw + 0.5rem, 3.75rem)` | Archive/about/search headings, empty/error headings and login. |
| `--text-lead` | `clamp(1.125rem, 0.35vw + 1rem, 1.375rem)` | Article deck, feature excerpt and page introduction. |
| `--text-display` | `clamp(2.75rem, 5vw + 1rem, 5.25rem)` | Foundation H1 fallback; named page selectors override it. |
| `--text-section` | `clamp(2rem, 2.5vw + 1rem, 3.5rem)` | Foundation H2 fallback; named sections override it. |
| `--text-title` | `clamp(1.25rem, 0.75vw + 0.875rem, 1.625rem)` | Foundation H3 fallback; index/prose/admin selectors override it. |

- Display, leading-article headline, article title, section and index-title roles use the exact final sizes in frontmatter. The first three are selector-level values, not new CSS custom properties.
- Heading measures: introduction and article title (24ch), leading-article title (36ch). Headings balance and wrap; article links retain full titles on phones.
- Article prose uses the `reading` role on desktop and the mobile override below. Paragraphs normally cap at 65ch; prose caps at 70ch within the reading column. Feature excerpts cap at 62ch, decks at 65ch.
- Prose H1/H2 use the section size with line height 1.45; H3/H4 use `--text-lg`, weight 600 and line height 1.5. Major heading spacing is `--space-2xl` before / `--space-lg` after; subhead spacing is `--space-xl` before / `--space-md` after.
- Metadata is body-family, weight 400; field labels are weight 500 and primary navigation is weight 600. Dates and counts use tabular numerals, never the code face.
- Inline code is `.875em`; fenced code uses the `code` role. Markdown source is `--text-md` with line height 1.9, so editing is not forced into the smaller code-block size.

**The Two Reading Voices Rule.** Use display type to frame public writing and sans-serif to read, scan and operate; reserve monospace for code and Markdown source.

## Layout

### Frame and rhythm

| CSS token | Actual value | Use |
| --- | --- | --- |
| `--container` | `1360px` | Border-box outer maximum, centered and full-width below the cap. |
| `--gutter` | `64px` | Desktop inline container padding. |
| `--gap-columns` | `32px` | Date/content gap in article rows. |
| `--reading-width` | `42rem` | Main article column and article-end maximum. |
| `--control-height` | `44px` | Input/button minimum and square icon-button dimensions. |

At a 1440px viewport, the capped frame has 40px outside margins plus the gutter, placing primary content at x=104px. Masthead, article rows and the footer double rule share those inner alignment guides; the footer rule is inset by `--gutter`. The masthead remains in document flow. Dates align with the first title baseline on multi-column rows. Related-post heading rules span the section width. In the writing interface, table metadata aligns with the article-title baseline, and the editor title shares a baseline with its save state beneath the back link.

The reused spacing steps are in frontmatter; their keys map directly to the `--space-*` properties. Fine spacing serves labels/tags, middle steps serve controls and panels, and larger steps separate index rows and reading sections. `--space-3xl` supplies `html` scroll padding. No viewport-height promotional hero is imposed.

Article rows use `minmax(0, 1fr) minmax(0, 3fr)`. Reading uses `minmax(0, var(--reading-width)) minmax(18rem, 1fr)` with a `--space-2xl` gap, preserving the reading tools' touch targets and labels on narrower desktops. The reading sidebar sticks at `--space-xl`, with internal scroll height capped at `calc(100dvh - var(--space-2xl))`; its chapter index has a `min(50dvh, 28rem)` cap and the reading tools sit below it. The editor uses `minmax(0, 1fr) minmax(14rem, 19rem)` and a `--space-xl` gap. Search caps at 42rem, settings at 46rem and login at 28rem. Prose code and tables scroll internally on overflow.

### Responsive changes

Breakpoints are `max-width` media queries in rem; pixel equivalents below assume a 16px root.

| At or below | Built change |
| --- | --- |
| `60rem` (960px) | `--gutter: 24px`; desktop navigation becomes native details navigation. Reading becomes one column, with a nonsticky chapter index before the prose, a hairline left rule and a 16rem internal height cap. Editor settings move below writing and use two equal columns. |
| `40rem` (640px) | `--gutter: 16px`; `--gap-columns: 16px`. Article dates stack above content; row padding becomes `--space-lg`. Wordmark and admin heading use `--text-xl`; index titles use `--text-lg`. Footer stacks and wraps links. Publishing settings become one column. Admin table rows become two-column blocks with actions spanning both columns; the header row is visually removed. Search fills the row. Editor feedback/actions stack, while the two action buttons share a row equally. |

Phone typography overrides: introduction `2.35rem`; leading-article heading `--text-2xl`; feature excerpt `--text-md`; article title `2.2rem`; prose `--text-md` / line height 1.95. At the phone breakpoint code/editor padding becomes `--space-md`, and Markdown/preview minimum height changes from 34rem to 28rem. The featured article keeps `--space-lg` internal padding. Controls are not scaled down with the headings.

Print removes masthead, footer, chapter navigation, copy controls and related posts, then switches the reading layout to a full-width block. This is a print simplification, not a separate visual theme.

The foundation also declares unused palette, spacing, timing and texture hooks. Their presence does not establish additional current components or effects: notably `--fibre` does not create a paper texture, and the unused `[data-slot]` photo treatment is not applied to the actual cover elements. This handoff catalogs the reused system rather than promoting those hooks into new design requirements.

## Elevation & Depth

The publication is flat. Indigo fields, a second paper tone, hairlines and double rules establish hierarchy; articles and controls do not float. `--shadow-card: none` records the foundation's flat-card intent. The one actual floating shadow belongs to the transient notice: `0 4px 12px var(--color-soft-shadow)`. The editor's selected tab uses `inset 0 -2px var(--color-accent)` as an underline, not physical elevation.

Implemented layer uses are `--z-dropdown: 100` for mobile navigation and `--z-toast: 500` for notices and the skip link. The sticky chapter panel does not use a z-index token. Other declared z-index tiers do not imply a modal or tooltip component exists.

**The Flat Publication Rule.** Separate reading surfaces with tone and rules; reserve the floating shadow for transient notices.

## Shapes

The form language is nearly square. Both `--radius-card` and the historically named `--radius-pill` map to the frontmatter radius steps: the latter does not mean a capsule. Inputs, buttons, code blocks, notices and supplied covers use those small corners. The large leading-article field has no border radius or shadow.

`--rule-hair: 1px` supplies row/table borders, fields and quiet dividers. `--rule-double: 4px` supplies the double-line masthead, major index divider, article-end and colophon. Blockquotes have a hairline indigo leading border. Tags are plain text links, not pills. Icons are outlined SVGs from `public/assets/icons.svg`, normally 20×20px with a 1.5-unit stroke; the moving bookmark is 16×16px. Native disclosure markers remain on cover settings.

## Components

### LeiBox reading interactions

Public article pages additionally mount the retained Vanilla **Soft Action Wheel** package through `src/reading-tools.js`. Its six labelled actions perform link copying, heading focus/scroll, archive navigation, appearance switching, RSS navigation and printing. The closed control reads “工具”; the expanded control reads “收起”. The component uses the blog's paper, ink, rule and focus tokens, Chinese labels and shared outlined SVG icons rather than demo actions. Desktop places it below the chapter index in a scrollable sticky sidebar; narrow layouts place the index before the prose and the tools after it. The entire wheel is hidden in print and without JavaScript. Source attribution is recorded in `vendor/leibox/README.md`.

The original wheel uses a 960px design coordinate system, scaled to a 288–320px surface at the supported 320px-and-up viewport sizes. Its 40px source labels therefore render at 12–13.33px; action circles render at 60–66.67px. Each icon and label shares its button's horizontal centre. The tactile controls use the documented `radius-tactile` geometry.

The leading article's “阅读全文” link and the article-end “复制文章链接” button use **Tactile Push Button**'s submitted nested surface structure and CSS. They are small rounded controls with restrained paper-tone surface shading, solid ink text and the existing focus ring; the original large silver demo and gradient lettering are not used. Press feedback affects the inner surface, not the hit target. Reduced motion removes transitions and press scaling; no-JavaScript navigation remains native. These two component surfaces are exceptions to the original flat-control treatment below; the article rows and reading typography retain their existing roles.

### Publication navigation and colophon

Display wordmark, concise text destinations and a double-rule frame. Public destinations are `文章`, `归档`, `关于`, plus search and theme controls; administration substitutes `文章`, `写文章`, `站点设置`, `查看博客`. Current desktop destinations have `aria-current="page"` and an accent underline offset by .5em. Mobile uses a native `details`/`summary`, a 12rem-wide paper-2 menu, `--space-sm` padding and a hairline border. With enhancement, Escape closes the menu and returns focus to its summary; outside click closes it. Footer links include the archive, RSS and writing backend; byline and contact appear only when configured.

### Leading article and dated index

A single indigo field introduces the first result, with a display title link, date/category, optional excerpt, `阅读全文` and optional owner-supplied cover. It uses `feature-story` frontmatter colors/padding and inverse focus. Below it, rows use a date column, sans-serif title, optional excerpt and text taxonomy. Thin dividers separate entries; rows are not repeated cards. An index row shows the category and at most three tags; an article's ending can show all tags. Featured ordering is explicit in the home query; archive/search remain chronological.

### Buttons and links

- **Primary:** compact rectangular indigo action, `button-primary` primitives, minimum `--control-height`, hairline accent border and `--space-xs` icon gap. Hover uses `button-primary-hover`.
- **Quiet:** the same geometry with transparent fill, ink text and muted border; hover adds paper-2. Secondary publication actions use it according to the saved status.
- **Text:** unfilled, underlined action with `--space-xs` block padding and a .2em underline offset; hover becomes accent.
- **Icon:** `--control-height` square, unfilled at rest, paper-2/accent on hover. Each icon-only control has an accessible name.
- **Feedback:** links and enabled buttons use opacity .8 when pressed; disabled buttons use opacity .55 and a not-allowed cursor. Pending submit buttons are disabled and carry `aria-busy="true"`; their busy cursor is progress. Link-color and primary-background transitions use `--dur-micro: 120ms` with `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`.
- **Focus:** the effective global outline is `2px solid var(--color-focus)` with `4px` offset. `style.css` overrides the foundation's smaller offset. Preserve the local inverse focus token on indigo.

### Inputs, search and validation

Fields are native inputs/textareas with paper fill, ink text, a muted hairline border, `input` frontmatter padding and a small corner. Placeholder text remains muted at full opacity. Inputs/selects have a 44px minimum; textarea resizing is vertical. Labels remain visible except explicitly visually hidden search/body labels; placeholder text is not the label.

Enhanced validation inserts a `field-error` paragraph immediately after the invalid field, gives it `role="alert"`, sets `aria-invalid="true"`, and associates it through `aria-describedby`. Existing descriptions are preserved; an explicit `aria-labelledby` keeps a wrapped label's error text out of its name. Errors in Markdown switch back from preview; errors inside closed cover details open the disclosure. Focus moves to the field and the containing area scrolls instantly into view. General/non-field errors stay in form feedback, which can receive focus. Invalid field borders and error text use `--color-error`.

Without JavaScript, forms still submit natively and server responses retain editor values and show form-level feedback; panel-revealing adjacent-error enhancement requires JavaScript. Required and length constraints remain on the relevant native controls. A successful result, not the click itself, drives saved/published feedback.

### Article prose and section-following bookmark

Markdown renders server-side with raw HTML disabled. H2/H3 headings receive stable, unique anchors and populate the chapter index when at least two exist. The index is a labelled navigation landmark with real hash links; it remains useful without JavaScript. Prose supports headings, lists, links, quotes, code, tables and images. Code/table overflow stays inside the reading column. Enhanced copy-code and copy-link controls announce success or failure through the shared polite notice, displayed for 3200ms.

The bookmark adapts LeiBox **SailingToc** section-following behavior, credited to Emir Ayaz in `public/assets/contents.js`; reference: <https://leibox.pantoria.cn/docs/animations/sailing-toc>, with original package/notices under `vendor/leibox/sailing-toc`. Its native module follows the current section rather than reproducing a decorative scene.

- Active links carry `aria-current="location"` and accent text. The last heading above a 150px viewport threshold is selected; within 4px of the document end, the last section is selected.
- A 16px outlined bookmark translates on the Y axis to `link.offsetTop + link.offsetHeight / 2 - 8`. It is decorative to assistive technology and never takes pointer events.
- The spring has a critically damped feel: unit mass, stiffness 220 and damping 30 (damping ratio approximately 1.01). Integration caps each step at .032 seconds; it settles below .1px displacement and .2px/s velocity. Retargeting preserves the current position and velocity rather than restarting a timed animation.
- First placement, resize, re-entry and reduced-motion changes snap to the target. Animation stops when the document is hidden, the contents are offscreen or the spring settles. Observers/listeners are cleaned up on page exit and mounted again after back/forward-cache restoration.
- Arrow Up/Down and Home/End move focus among chapter links without hijacking normal link activation. An overflowing index scrolls its active link into view.

Under `prefers-reduced-motion: reduce`, the spring snaps; the base stylesheet reduces transition/animation durations to .01ms, limits iteration count to one and restores auto scroll behavior. No ambient loop, parallax or decorative entrance animation is part of this system.

### Markdown administration

The article list is a table on desktop and a compact stacked row presentation on phones. State words remain explicit: `草稿`, `已发布`, `回收站`. Published state adds success color; draft/trash use muted text. Row operations preserve a reversible trash/restore model, and enhanced removal returns focus to the next entry or the new-article action.

The editor is a native title field and monospace Markdown textarea, with a task-focused paper-2 publishing panel for slug, excerpt, category, tags, home priority and optional cover. Markdown/preview use `tablist`, `tab`, `tabpanel`, selection state and controlled panel IDs. Left/Right arrows move between tabs. Preview reports loading, empty body and errors, and superseded requests cannot replace newer preview content. Without JavaScript, the write form remains available and the enhancement tabs are hidden.

**The Explicit Publication Rule.** Enter and the first save action preserve the current publication status; only the explicit publication action publishes or withdraws a post.

For drafts, the first button is quiet `保存草稿` (`action=save`) and the second is primary `发布文章` (`action=publish`). For published articles, the first is primary `更新文章` (`action=save`) and the second is quiet `撤回为草稿` (`action=draft`). A hidden status field stores the last confirmed status and is updated from the save response. Submission without an explicit publication action uses that status.

Save state distinguishes unsaved, saving, saved/published and failed. Edits made while a save is pending remain dirty after its response. A per-window session-storage backup is debounced by 400ms; matching-version recovery restores fields, while an older version offers comparison/copy instead of overwriting current content. This is recovery assistance, not durable server autosave. Recoverable errors retain the text; dirty navigation triggers the native leave-page prompt.

### Empty states and owner images

Empty public content, no search results, missing biography, empty admin list/trash and blank preview each have their own explanation and relevant next action. The empty home preserves the masthead, introduction and footer without manufacturing an article, count or portrait.

Covers render only when configured, at full width with a 38rem maximum height, `object-fit: cover`, the small card radius and markup dimensions 1200×800. Cover descriptions come from the owner's image-description field; inline Markdown images use their authored alt text and lazy/async loading. No stock image or generated biography substitutes for missing owner material, and no image filter is applied to these cover elements. Real image selection, crop suitability and authored descriptions await supplied assets.

### Accessibility across components

Documents declare `lang="zh-CN"`; the skip link targets focusable `#main`. Header/footer/contents navigation have accessible names, decorative SVGs are hidden from assistive technology, and semantic headings, time elements, links and native forms carry the structure. Current page, chapter, tab, publication and validation states have text or ARIA meaning beyond color. Body reading and normal public navigation work without JavaScript; theme, copying, spring tracking and enhanced form recovery are progressive enhancements. The existing captures cover desktop, phone and a dark home; they do not establish a new screen-reader, all-route dark-mode or print test result.

## Do's and Don'ts

### Do:
- **Do** preserve cool-paper/ink roles across themes and use dedicated inverse tokens on the indigo article field.
- **Do** use the shared frame, spacing steps and nearly square controls; let full article titles wrap on phones.
- **Do** keep display type in the publication frame and sans-serif in reading, metadata and administration.
- **Do** retain real anchors, native forms, visible focus and field-associated feedback with panel reveal.
- **Do** preserve publication status on Enter and report only the server-confirmed save result.
- **Do** label local demonstration content and let missing owner material produce honest empty states.

### Don't:
- **Don't** treat `个人博客`, fixture titles, sample dates or browser-check text as confirmed owner identity or history.
- **Don't** replace the article index with repeated raised cards or pad the opening into a promotional full-screen hero.
- **Don't** turn the `radius-pill` token into capsule geometry or use monospace for dates and navigation.
- **Don't** add decorative ambient animation; the bookmark moves only to explain reading position.
- **Don't** hide errors in the other editing panel or change publication state through an implicit save.
- **Don't** infer imagery, texture, crop treatment or additional components from unused foundation hooks.
