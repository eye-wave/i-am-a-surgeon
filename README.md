# i-am-a-surgeon

> [!WARNING]
> This was done as a half joke half serious attempt at squeezing every last bit out of a Astro + Svelte build. If it's not obvious already, **ITS NOT MEANT FOR PRODUCTION**

When Astro finishes bundling, this thing crawls through dist/ like a raccoon with ADHD, doing some or all of the following:

- **fontCleaner** - remove usused fonts
- **removeUnusedCssVariables** - if you have a large css theme and not using its full potential this one will help you a bit
- **compressCssClasses** - shortens ugly astro and svelte classes `svelte-x18sz2 → a`👍👍
- **compressCssVariables** - shortens every css variable to A,B,C, etc...
- **convertOklabToHex** - removes long and bulky oklab into hex (even 3 character version) if its the 6 digit version is similar enough to 3 digit
- **stripErrorMessages** - remove error messages, cause who needs to debug am i right
- **extraTerseHtml** - extra html minification ignoring the astro-island to
- **leStupid** - commits semantic crimes by shortening well established astro atrributes, events, elements etc...
- **extraTerse** - extra rounds of unsafe js terser
- **compressFileNames** - renames every js and css file to `a.js`,`b.css`,`c.js`,`d.js `etc...

All of these are enabled by default so you need to opt out in the plugin options if something breaks. And trust me, <i style="font-size:1.2rem">it will</i>.

Minification fails and you ship a broken site? — haha whoops 🐈

### Installation

⚠️ Don't.

But if you want anyways:

```
bun add -d github:eye-wave/i-am-a-surgeon
```

And oh, if you're not using bun or a unix operating system the it won't work 😸

### License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).
