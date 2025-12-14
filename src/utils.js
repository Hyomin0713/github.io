export function fmtD(d) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  )
}

export function parseD(s) {
  const p = String(s || "").split("-").map(Number)
  if (p.length !== 3) return new Date()
  return new Date(p[0], p[1] - 1, p[2])
}

export function fmtT(d) {
  return (
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  )
}

export function sameD(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function safeAddListener(el, type, fn, opts) {
  if (!el || !el.addEventListener) return
  el.addEventListener(type, fn, opts)
}
