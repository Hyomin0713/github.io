import { state } from "./state.js"
import { dom } from "./dom.js"
import { fmtD, fmtT, sameD, fmtEta } from "./utils.js"
import { getTypeById } from "./types.js"
import { evByD, hasEv, nextOcc, isCompletedOn, setCompleted } from "./events.js"

const hooks = { showMd: null }

export function setRenderHooks({ showMd } = {}) {
  if (showMd) hooks.showMd = showMd
}

function mkItem(ev, ctxDate) {
  const li = document.createElement("li")
  li.className = "event-item"

  const dCtx = ctxDate instanceof Date ? ctxDate : new Date(ev.startTime)
  const done = isCompletedOn(ev, dCtx)
  if (done) li.classList.add("completed")

  const tp = getTypeById(ev.typeId)
  const c =
    tp && typeof tp.color === "string" && tp.color.trim() && tp.color.trim() !== "undefined"
      ? tp.color.trim()
      : "#00ff85"
  li.style.setProperty("--type-color", c)

  const checkBtn = document.createElement("button")
  checkBtn.type = "button"
  checkBtn.className = "event-check-btn"
  const checkOuter = document.createElement("span")
  checkOuter.className = "event-check"
  const checkInner = document.createElement("span")
  checkInner.className = "event-check-inner"
  checkOuter.appendChild(checkInner)
  checkBtn.appendChild(checkOuter)

  const content = document.createElement("div")
  content.className = "event-content"

  const tRow = document.createElement("div")
  tRow.className = "event-title-row"

  const iconSpan = document.createElement("span")
  iconSpan.className = "event-type-icon"
  iconSpan.textContent = tp.icon || ""

  const dot = document.createElement("span")
  dot.className = "event-type-dot"

  const t = document.createElement("span")
  t.className = "event-title"
  t.textContent = ev.title

  tRow.appendChild(iconSpan)
  tRow.appendChild(dot)
  tRow.appendChild(t)

  const tm = document.createElement("div")
  tm.className = "event-time"
  const base = new Date(ev.startTime)
  let rep = ""
  switch (ev.repeat) {
    case "daily":
      rep = "매일 "
      break
    case "weekly":
      rep = "매주 "
      break
    case "monthly":
      rep = "매월 "
      break
    case "yearly":
      rep = "매년 "
      break
  }
  tm.textContent = rep + fmtT(base)

  content.appendChild(tRow)
  content.appendChild(tm)

  li.appendChild(checkBtn)
  li.appendChild(content)

  checkBtn.addEventListener("click", e => {
    e.stopPropagation()
    const newVal = !isCompletedOn(ev, dCtx)
    setCompleted(ev, dCtx, newVal)
  })

  li.addEventListener("contextmenu", e => {
    e.preventDefault()
    const newVal = !isCompletedOn(ev, dCtx)
    setCompleted(ev, dCtx, newVal)
  })

  let consumedByLongPress = false
  let touchActive = false
  let tTimer = null

  li.addEventListener(
    "touchstart",
    () => {
      touchActive = true
      tTimer = setTimeout(() => {
        consumedByLongPress = true
        const newVal = !isCompletedOn(ev, dCtx)
        setCompleted(ev, dCtx, newVal)
        tTimer = null
      }, 450)
    },
    { passive: true }
  )

  ;["touchend", "touchcancel", "touchmove"].forEach(tn => {
    li.addEventListener(
      tn,
      () => {
        touchActive = false
        if (tTimer) {
          clearTimeout(tTimer)
          tTimer = null
        }
      },
      { passive: true }
    )
  })

  let lpTimer = null
  li.addEventListener("pointerdown", () => {
    if (touchActive) return
    lpTimer = setTimeout(() => {
      consumedByLongPress = true
      const newVal = !isCompletedOn(ev, dCtx)
      setCompleted(ev, dCtx, newVal)
      lpTimer = null
    }, 450)
  })
  ;["pointerup", "pointercancel", "pointerleave"].forEach(tn => {
    li.addEventListener(tn, () => {
      if (lpTimer) {
        clearTimeout(lpTimer)
        lpTimer = null
      }
    })
  })

  li.addEventListener("click", () => {
    if (consumedByLongPress) {
      consumedByLongPress = false
      return
    }
    if (hooks.showMd) hooks.showMd(ev, dCtx)
  })

  return li
}

export function drawHome() {
  if (!dom.elNextBody || !dom.elTodayList) return
  const now = new Date()
  let best = null
  state.evs.forEach(ev => {
    const o = nextOcc(ev, now)
    if (!o) return
    if (!best || o < best.occ) best = { ev, occ: o }
  })

  dom.elNextBody.innerHTML = ""
  if (!best) {
    dom.elNextBody.classList.add("empty")
    const p = document.createElement("p")
    p.textContent = "앞으로 예정된 일정이 없습니다."
    dom.elNextBody.appendChild(p)
  } else {
    dom.elNextBody.classList.remove("empty")
    const tEl = document.createElement("div")
    tEl.className = "next-event-title"
    tEl.textContent = best.ev.title
    const tmEl = document.createElement("div")
    tmEl.className = "next-event-time"
    tmEl.textContent = best.occ.toLocaleDateString() + " " + fmtT(best.occ)
    const rmEl = document.createElement("div")
    rmEl.className = "next-event-remain"
    const diffMs = best.occ.getTime() - now.getTime()
    rmEl.textContent = diffMs <= 0 ? "곧 시작됩니다." : fmtEta(now.getTime(), best.occ.getTime()) + " 후 시작"

    dom.elNextBody.appendChild(tEl)
    dom.elNextBody.appendChild(tmEl)
    dom.elNextBody.appendChild(rmEl)
  }

  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const today = evByD(todayDate)
  dom.elTodayList.innerHTML = ""
  if (!today.length) {
    const li = document.createElement("li")
    li.textContent = "오늘 일정이 없습니다. ☕ 조금 쉬어가도 좋아요."
    li.className = "empty-state"
    dom.elTodayList.appendChild(li)
  } else {
    today.forEach(ev => dom.elTodayList.appendChild(mkItem(ev, todayDate)))
  }
}

export function drawCal() {
  if (!dom.elMonth || !dom.elGrid) return
  const y = state.mCur.getFullYear()
  const m = state.mCur.getMonth()
  dom.elMonth.textContent = y + "년 " + (m + 1) + "월"
  dom.elGrid.innerHTML = ""
  const first = new Date(y, m, 1)
  const wk = first.getDay()
  const days = new Date(y, m + 1, 0).getDate()
  for (let i = 0; i < wk; i++) {
    const empty = document.createElement("div")
    empty.className = "calendar-day empty"
    dom.elGrid.appendChild(empty)
  }
  const today = new Date()
  for (let d = 1; d <= days; d++) {
    const cd = new Date(y, m, d)
    const cell = document.createElement("div")
    cell.className = "calendar-day"
    const key = fmtD(cd)
    if (sameD(cd, today)) cell.classList.add("today")
    if (state.dSel && sameD(cd, state.dSel)) cell.classList.add("selected")
    if (state.msSet.has(key)) cell.classList.add("multi-selected")
    if (hasEv(cd)) cell.classList.add("has-events")
    const sp = document.createElement("span")
    sp.textContent = d
    cell.appendChild(sp)
    cell.addEventListener("click", () => {
      if (state.msOn) {
        if (state.msSet.has(key)) state.msSet.delete(key)
        else state.msSet.add(key)
      } else {
        state.msSet.clear()
        state.msSet.add(key)
        state.dSel = cd
      }
      drawCal()
      drawSel()
    })
    dom.elGrid.appendChild(cell)
  }
}

export function drawSel() {
  if (!dom.elSelLbl || !dom.elSelList) return
  if (!state.dSel) state.dSel = new Date()
  if (state.msOn && state.msSet.size > 1) dom.elSelLbl.textContent = fmtD(state.dSel) + " 포함 " + state.msSet.size + "일"
  else dom.elSelLbl.textContent = fmtD(state.dSel) + " 일정"

  const list = evByD(state.dSel)
  dom.elSelList.innerHTML = ""
  if (!list.length) {
    const li = document.createElement("li")
    li.textContent = "등록된 일정이 없습니다."
    li.className = "empty-state"
    dom.elSelList.appendChild(li)
  } else {
    list.forEach(ev => dom.elSelList.appendChild(mkItem(ev, state.dSel)))
  }
}

export function drawAll() {
  drawHome()
  drawCal()
  drawSel()
}
