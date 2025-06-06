import { readFile } from "node:fs/promises"
import { minify } from "terser"
import { JS_MINIFY_OPTIONS } from "./const"

export async function* filesIterate(files: string[], accepted = [".js", ".css", ".html"]) {
  for (const filepth of files) {
    const shouldInclude = accepted.some(ext => filepth.endsWith(ext))
    if (!shouldInclude) continue

    yield [filepth, await readFile(filepth, "utf8")]
  }
}

export async function minifyJs(code: string) {
  try {
    const result = await minify(code, JS_MINIFY_OPTIONS)

    if (result.code && result.code.length < code.length) {
      return result.code
    }
  } catch {}

  return code
}

export function cssEncode(n: number) {
  const chars = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"]
  let s = ""
  do {
    s = chars[n % chars.length] + s
    n = Math.floor(n / chars.length) - 1
  } while (n >= 0)
  return s
}
