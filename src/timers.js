import { state } from "./state.js"
import { drawAll } from "./render.js"
import { loadEv } from "./events.js"

export function startTimers() {
  if (!state.uiTimer) {
    state.uiTimer = setInterval(() => {
      drawAll()
    }, 30000)
  }
  if (!state.reloadTimer) {
    state.reloadTimer = setInterval(() => {
      loadEv()
    }, 180000)
  }
}
