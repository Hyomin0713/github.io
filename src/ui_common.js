import { dom } from "./dom.js"

export function fnLd(v) {
  if (!dom.elOv) return
  dom.elOv.classList.toggle("hidden", !v)
}
