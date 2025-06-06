import { $, file as readFile, write as writeFile } from "bun"
import { cssEncode, filesIterate, minifyJs } from "./utils"
import { HTML_MINIFY_OPTIONS } from "./const"
import { load } from "cheerio"
import { minify as htmlMinify } from "html-minifier-terser"
import { oklabToHex } from "./colors"
import { rename as moveFile, rm } from "node:fs/promises"
import path, { basename, dirname, join } from "node:path"
import type { AstroIntegration } from "astro"

export function IAmASurgeonPlugin(): AstroIntegration {
  return {
    name: "astro:i-am-a-surgeon",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const root = dir.pathname
        const files = (await $`find ${root} -type f`.text()).split("\n").filter(Boolean).sort()

        const size = await $`du -b dist | tail -n 1`.text().then(parseInt)

        await fontCleaner(root, files)
        await removeUnusedCssVariables(files)
        await compressCssClasses(files)
        await compressCssVariables(files)
        await convertOklabToHex(files)
        await stripErrorMessages(files)
        await extraTerseHtml(files)
        await leStupid(files)
        await extraTerse(files)

        await compressFileNames(files)

        const finalSize = await $`du -b dist | tail -n 1`.text().then(parseInt)

        console.log(size - finalSize, "bytes reduced")
      },
    },
  }
}

// ───────────────────────────────────────────────
// Change all font declarations to use woff2 instead of ttf
// Remove all unused fonts
async function fontCleaner(root: string, files: string[]) {
  for await (const [filepath, contents] of filesIterate(files, [".css"])) {
    const replacement = contents.replaceAll(".ttf", ".woff2")
    await writeFile(filepath, replacement)
  }

  const fontNames: string[] = []

  for await (const [_, contents] of filesIterate(files, [".css"])) {
    for (const [, name] of contents.matchAll(/@font-face{.*?font-family:([^;]+).*?src:url\(([^)]+)\).*?}/g)) {
      fontNames.push(name + ".ttf")
    }
  }

  const fonts = (await $`find ${root} -type f -name '*.ttf'`.text()).split("\n").filter(Boolean).sort()

  for await (const [filepath] of filesIterate(fonts, [".ttf"])) {
    const shouldInclude = fontNames.some(f => filepath.endsWith(f))
    if (shouldInclude) continue

    await rm(filepath).catch(() => {})
  }
}

// ───────────────────────────────────────────────
// Remove unused CSS variables
async function removeUnusedCssVariables(files: string[]) {
  const varMap = new Map<string, number>()
  let themeCss: string | null = null

  for await (const [filepath, contents] of filesIterate(files)) {
    const matches =
      (contents
        .match(/var\(--[\w-]+\)/g)
        ?.map(a => a.match(/--[\w-]+/)?.[0])
        .filter(Boolean) as string[]) ?? []

    if (contents.match(/:root[^}]*{[^}]+}/)) {
      themeCss = filepath
    }

    for (const m of matches) {
      varMap.set(m, (varMap.get(m) ?? 0) + 1)
    }
  }

  if (themeCss === null) return

  let contents = await readFile(themeCss).text()
  const rootBlocks = contents.match(/:root[^}]*{[^}]+}/g) ?? []

  for (const block of rootBlocks) {
    const keptVars = block.match(/--[\w-]+:[^;}]+/g)?.filter(v => {
      const name = v.replace(/:.+/, "")
      return (varMap.get(name) ?? 0) > 0
    })

    const cleaned = `${block.replace(/{[^}]+}/, "")}{${keptVars?.join(";")}}`
    contents = contents.replace(block, cleaned)
  }

  await writeFile(themeCss, contents)
}

// ───────────────────────────────────────────────
// Compress Svelte/Astro CSS classes
async function compressCssClasses(files: string[]) {
  let counter = -1
  const classesMap = new Map<string, string>()

  for await (const [_, contents] of filesIterate(files, [".css"])) {
    contents.match(/(?:svelte|astro)-[a-z0-9]+/g)?.forEach(match => {
      if (!classesMap.has(match)) {
        classesMap.set(match, cssEncode(++counter))
      }
    })
  }

  for await (const [filepath, contents] of filesIterate(files)) {
    let replacement = contents
    classesMap.forEach((renamed, original) => {
      replacement = replacement.replaceAll(original, renamed)
    })
    await writeFile(filepath, replacement)
  }
}

// ───────────────────────────────────────────────
// Convert OKlab to Hex
async function convertOklabToHex(files: string[]) {
  for await (const [filepath, contents] of filesIterate(files)) {
    const replacement = contents.replace(/(oklab|oklch)\([^)]+\)/g, match => oklabToHex(match) ?? match)

    await writeFile(filepath, replacement)
  }
}

// ───────────────────────────────────────────────
// Compress CSS variable names
async function compressCssVariables(files: string[]) {
  let counter = -1
  const varMap = new Map<string, string>()

  for await (const [_, contents] of filesIterate(files)) {
    const matches =
      (contents
        .match(/var\(--[\w-]+\)/g)
        ?.map(a => a.match(/--[\w-]+/)?.[0])
        .filter(Boolean) as string[]) ?? []

    for (const name of matches) {
      if (!varMap.has(name)) {
        varMap.set(name, "--" + cssEncode(++counter))
      }
    }
  }

  for await (const [filepath, contents] of filesIterate(files)) {
    let replacement = contents

    varMap.forEach((short, full) => {
      replacement = replacement.replaceAll(full + ")", short + ")")
      replacement = replacement.replaceAll(full + ":", short + ":")
    })
    await writeFile(filepath, replacement)
  }
}

// ───────────────────────────────────────────────
// Strip all Error messages
async function stripErrorMessages(files: string[]) {
  for await (const [filepath, contents] of filesIterate(files)) {
    const replacement = contents.replace(/throw new Error\([^)]+\)/g, 'throw""')

    await writeFile(filepath, replacement)
  }
}

// ───────────────────────────────────────────────
// Squeeze every last bit out of html files
async function extraTerseHtml(files: string[]) {
  for await (const [filepath, html] of filesIterate(files, [".html"])) {
    const $ = load(html)

    const islands: string[] = []

    $("astro-island").each((i, el) => {
      islands[i] = $.html(el)
      $(el).replaceWith(`🐈🐈__ASTRO_ISLAND_${i}__🐈🐈`)
    })

    const compact = await htmlMinify($.html(), HTML_MINIFY_OPTIONS)

    let final = compact
    for (let i = 0; i < islands.length; i++) {
      final = final.replace(`🐈🐈__ASTRO_ISLAND_${i}__🐈🐈`, islands[i]!)
    }

    if (final.length < html.length) {
      await writeFile(filepath, final)
    }
  }
}

// ───────────────────────────────────────────────
// Le stupid
async function leStupid(files: string[]) {
  for await (const [filepath, contents] of filesIterate(files)) {
    const replacement = contents
      .replaceAll("component-url", "a")
      .replaceAll('component-export=""', "b")
      .replaceAll("component-export", "b")
      .replaceAll("renderer-url", "c")
      .replaceAll("before-hydration-url", "d")
      .replaceAll("data-astro-template", "e")
      .replaceAll("ssr", "f")
      .replace(/\d:\w=>(new )?(BigInt|Uint8Array|Uint16Array|Uint32Array|RegExp|Date)\(\w\),/g, "")
      .replace(/astro-island\s*uid="[^"]+"/g, "astro-island")
      .replace(/opts="{[^}]+}"/g, "")
      .replaceAll('props="{}"', "")
      .replaceAll('await-children=""', "")
      .replaceAll("await-children", "g")
      .replaceAll("astro-island", "a-i")
      .replaceAll("astro-slot", "a-s")
      .replaceAll("astro-static-slot", "a-S")
      .replaceAll("astro:after-swap", "a:s")
      .replaceAll("astro:end", "E")
      .replaceAll("astro:hydrate", "a:h")
      .replaceAll("astro:load", "a:l")
      .replaceAll("astro:unmount", "a:u")
      .replaceAll("Component", "Cm")
      .replaceAll("enumerable", "en")
      .replaceAll("writable", "wr")
      .replaceAll("Astro", "At")
      .replaceAll("<unknown>", "<u>")
      .replaceAll("hydrator", "hy")
      .replaceAll("hydrate", "Hy")

    await writeFile(filepath, replacement)
  }
}

// ───────────────────────────────────────────────
// Uglify JS files once for all
async function extraTerse(files: string[]) {
  for await (const [filepath, code] of filesIterate(files, [".js"])) {
    const mini = await minifyJs(code)

    if (mini.length < code.length) {
      await writeFile(filepath, mini)
    }
  }

  for await (const [filepath, html] of filesIterate(files, [".html"])) {
    const $ = load(html)

    const scriptTags = $("script").toArray()

    for (const el of scriptTags) {
      const node = $(el)
      if (node.attr("src")) continue

      const original = node.html()
      if (!original?.trim()) continue

      const minified = await minifyJs(original)

      if (minified.length < original.length) {
        node.text(minified)
      }
    }

    if ($.html().length < html.length) {
      await writeFile(filepath, $.html())
    }
  }
}

// ───────────────────────────────────────────────
// Rename JS/CSS files and rewrite references
async function compressFileNames(files: string[]) {
  let counter = -1
  const renamed = new Map<string, string>()

  for await (const [file] of filesIterate(files, [".css", ".js"])) {
    const ext = path.extname(file).slice(1)
    const newName = join(dirname(file), `${(++counter).toString(36)}.${ext}`)

    renamed.set(file, newName)
  }

  for await (const [file, c] of filesIterate(files)) {
    let contents = c

    renamed.forEach((newPath, oldPath) => {
      contents = contents.replaceAll(basename(oldPath), basename(newPath))
    })

    await writeFile(file, contents)

    const newname = renamed.get(file)
    if (newname) {
      await moveFile(file, newname)
    }
  }
}
