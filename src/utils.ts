import { join } from "node:path"
import { JS_MINIFY_OPTIONS } from "./const"
import { minify } from "terser"
import { readdir, stat } from "node:fs/promises"
import { readFile } from "node:fs/promises"

export async function* filesIterate(
  files: string[],
  accepted = [".js", ".css", ".html"]
): AsyncGenerator<[string, string]> {
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

export async function walkdir(root: string) {
  const stack = [root]
  const files: string[] = []

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) continue

    const entries = await readdir(current)
    for (const entry of entries) {
      const fullPath = join(current, entry)
      const _stat = await stat(fullPath)
      if (_stat.isDirectory()) {
        stack.push(fullPath)
      } else if (_stat.isFile()) {
        files.push(fullPath)
      }
    }
  }

  files.sort()
  return files
}

export async function dirSize(path: string) {
  let total = 0
  const stack = [path]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) continue

    const _stat = await stat(current)
    if (_stat.isDirectory()) {
      const entries = await readdir(current)
      for (const entry of entries) {
        stack.push(join(current, entry))
      }
    } else if (_stat.isFile()) {
      total += _stat.size
    }
  }

  return total
}
