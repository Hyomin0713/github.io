import { dom } from "./dom.js"
import { state } from "./state.js"
import { parseD, fmtD, safeAddListener } from "./utils.js"
import { drawCal, drawSel, drawAll } from "./render.js"
import { showMd } from "./modal.js"

export function switchView(v) {
  state.vCur = v
  dom.elsViewBtn.forEach(btn => {
    if (btn.dataset.view === v) btn.classList.add("active")
    else btn.classList.remove("active")
  })
  const sections = document.querySelectorAll(".calendar-section")
  sections.forEach(s => {
    if (s.dataset.view === v) s.classList.add("show")
    else s.classList.remove("show")
  })
  drawAll()
}

export function bindNavigation() {
  safeAddListener(dom.btnAddHome, "click", () => showMd(null))
  safeAddListener(dom.btnAddCal, "click", () => showMd(null))

  safeAddListener(dom.btnPrev, "click", () => {
    state.mCur.setMonth(state.mCur.getMonth() - 1)
    drawCal()
  })

  safeAddListener(dom.btnNext, "click", () => {
    state.mCur.setMonth(state.mCur.getMonth() + 1)
    drawCal()
  })

  dom.elsViewBtn.forEach(btn => safeAddListener(btn, "click", () => switchView(btn.dataset.view)))

  safeAddListener(dom.btnMulti, "click", () => {
    state.msOn = !state.msOn
    if (!state.msOn) {
      const arr = Array.from(state.msSet.values())
      if (arr.length) {
        const d = parseD(arr[0])
        state.dSel = d
        state.msSet.clear()
        state.msSet.add(fmtD(d))
      }
    }
    dom.btnMulti.textContent = state.msOn ? "다중 선택: 켬" : "다중 선택: 끔"
    drawCal()
    drawSel()
  })

  safeAddListener(dom.btnCal, "click", () => {
    dom.elHome && dom.elHome.classList.remove("active")
    dom.elCal && dom.elCal.classList.add("active")
    dom.elsNav.forEach(b => b.classList.remove("active"))
    const t = document.querySelector('.bottom-nav-btn[data-screen="calendar-screen"]')
    if (t) t.classList.add("active")
  })

  safeAddListener(dom.btnBack, "click", () => {
    dom.elCal && dom.elCal.classList.remove("active")
    dom.elHome && dom.elHome.classList.add("active")
    dom.elsNav.forEach(b => b.classList.remove("active"))
    const t = document.querySelector('.bottom-nav-btn[data-screen="home-screen"]')
    if (t) t.classList.add("active")
  })

  dom.elsNav.forEach(btn => {
    safeAddListener(btn, "click", () => {
      const target = btn.dataset.screen
      dom.elsNav.forEach(b => b.classList.remove("active"))
      btn.classList.add("active")
      if (target === "home-screen") {
        dom.elHome && dom.elHome.classList.add("active")
        dom.elCal && dom.elCal.classList.remove("active")
      } else {
        dom.elHome && dom.elHome.classList.remove("active")
        dom.elCal && dom.elCal.classList.add("active")
      }
    })
  })
}
