# i-am-a-surgeon

<center>

![license](https://img.shields.io/badge/license-GPLv3-blue?style=for-the-badge)
![breaks things](https://img.shields.io/badge/may_break-your_build-critical?style=for-the-badge)
![prod ready](https://img.shields.io/badge/production_ready-hell_no-critical?style=for-the-badge)
</center>


> [!WARNING]
> This was done as a half-joke, half-serious attempt at squeezing every last bit out of an Astro + Svelte build. If it’s not obvious already: **THIS IS NOT MEANT FOR PRODUCTION.**

When Astro finishes bundling, this thing crawls through `dist/` like a raccoon with ADHD, doing some or all of the following:

- **fontCleaner** – removes unused fonts
- **removeUnusedCssVariables** – if you’ve got a massive CSS theme and aren’t using most of it, this helps a bit
- **compressCssClasses** – shortens ugly Astro/Svelte classes like `svelte-x18sz2 → a` 👍👍
- **compressCssVariables** – turns every CSS variable into `--a`, `--b`, `--c`...
- **convertOklabToHex** – rewrites bulky OKLab values to short hex (3-digit when possible)
- **stripErrorMessages** – nukes error messages because who needs to debug, amirite
- **extraTerseHtml** – extra-aggressive HTML minification (Astro islands are spared... mostly)
- **leStupid** – commits semantic crimes by shortening well established syntax with Regular Expressions.
- **extraTerse** – more rounds of unsafe JS minification
- **compressFileNames** – renames every JS and CSS file to `a.js`, `b.css`, `c.js`, etc.

All of these are enabled by default, so you’ll need to opt out in the plugin options if something breaks. And trust me, <i style="font-size:1.2rem">it will</i>.

Minification fails and you ship a broken site? — haha whoops 🐈

---

### Installation

⚠️ Don’t.

But if you want anyways:

```sh
bun add -d github:eye-wave/i-am-a-surgeon
```

~~Oh, and if you’re not using **Bun** or a **Unix-based OS**, this won’t work 😸~~

It **should** be crossplatform and work on node, but i haven't tested yet 🙀.

---

### 🧾 License

Licensed under the **GNU General Public License v3.0 (GPL-3.0)**.
