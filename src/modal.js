import { dom } from "./dom.js"
import { state } from "./state.js"
import { fmtD, fmtT, sameD, safeAddListener } from "./utils.js"
import { saveEvFromForm, delEvById } from "./events.js"

export function showMd(ev) {
  if (!dom.elMd) return
  if (ev) {
    dom.elMdTit.textContent = "일정 수정"
    dom.inpId.value = ev.id
    const base = new Date(ev.startTime)
    dom.inpTitle.value = ev.title
    dom.inpDate.value = fmtD(base)
    dom.inpTime.value = fmtT(base)
    dom.selRepeat.value = ev.repeat || "none"
    dom.inpRem.value = ev.remindMinutes ?? 0
    dom.inpNote.value = ev.notes || ""
    if (dom.selType) dom.selType.value = ev.typeId || "type1"
    dom.btnDel && dom.btnDel.classList.remove("hidden")
  } else {
    dom.elMdTit.textContent = "일정 추가"
    dom.inpId.value = ""
    const now = new Date()
    const d = state.dSel || now
    dom.inpTitle.value = ""
    dom.inpDate.value = fmtD(d)
    const baseTime = sameD(d, now) ? fmtT(now) : "09:00"
    dom.inpTime.value = baseTime
    dom.selRepeat.value = "none"
    dom.inpRem.value = 60
    dom.inpNote.value = ""
    if (dom.selType) dom.selType.value = state.evTypes[0].id
    dom.btnDel && dom.btnDel.classList.add("hidden")
  }
  dom.elMd.classList.add("show")
  dom.elMd.setAttribute("aria-hidden", "false")
}

export function hideMd() {
  if (!dom.elMd) return
  dom.elMd.classList.remove("show")
  dom.elMd.setAttribute("aria-hidden", "true")
}

async function onSubmit(e) {
  e.preventDefault()
  const id = dom.inpId.value || null
  const title = dom.inpTitle.value.trim()
  const date = dom.inpDate.value
  const time = dom.inpTime.value
  const repeat = dom.selRepeat.value
  const remindMinutes = Number(dom.inpRem.value || 0)
  const notes = dom.inpNote.value.trim()
  const typeId = dom.selType ? dom.selType.value || "type1" : "type1"
  await saveEvFromForm({ id, title, date, time, repeat, remindMinutes, notes, typeId })
  hideMd()
}

async function onDelete() {
  const id = dom.inpId.value
  if (!id) return
  await delEvById(id)
  hideMd()
}

export function bindModal() {
  safeAddListener(dom.btnCancel, "click", hideMd)
  safeAddListener(dom.btnDel, "click", onDelete)
  if (dom.fEv) safeAddListener(dom.fEv, "submit", onSubmit)
}
