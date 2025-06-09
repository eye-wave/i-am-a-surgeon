import { converter } from "culori"

export function oklabToHex(color: string) {
  const rgb = converter("rgb")
  const col = rgb(color)
  if (!col) return

  const channels = [col.r, col.g, col.b].map(
    c => (Math.min(Math.max(0.0, c), 1.0) * 255) | 0
  )
  const canBeShort = channels.every(c => compressChannel(c, 10).length === 1)

  const threshold = canBeShort ? 10 : -1
  const final = "#" + channels.map(c => compressChannel(c, threshold)).join("")

  return final
}

function compressChannel(value: number, threshold = 10) {
  const hex = value.toString(16).padStart(2, "0")
  const char = hex.charAt(0)
  const value2 = parseInt(char + char, 16)

  const diff = Math.abs(value - value2)

  if (diff > threshold) {
    return hex
  } else {
    return char
  }
}
