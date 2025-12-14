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

export function fmtEta(fromMs, toMs) {
  const diff = Math.max(0, toMs - fromMs)
  const totalMin = Math.floor(diff / 60000)

  const MIN_H = 60
  const MIN_D = 60 * 24
  const MIN_W = MIN_D * 7
  const MIN_MO = MIN_D * 30

  let m = totalMin
  const mo = Math.floor(m / MIN_MO); m %= MIN_MO
  const w = Math.floor(m / MIN_W);  m %= MIN_W
  const d = Math.floor(m / MIN_D);  m %= MIN_D
  const h = Math.floor(m / MIN_H);  m %= MIN_H
  const mi = m

  return `${mo}달 ${w}주 ${d}일 ${h}시간 ${mi}분`
}
