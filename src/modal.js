import { dom } from "./dom.js"
import { state } from "./state.js"
import { fmtD, fmtT, sameD, safeAddListener } from "./utils.js"
import { saveEvFromForm, delEvById, delGroupById, deleteEventsByDates } from "./events.js"

export function showMd(ev) {
  if (!dom.elMd) return

  if (ev) {
    dom.elMdTit.textContent = "일정 수정"
    dom.inpId.value = ev.id || ""
    if (dom.inpGroupId) dom.inpGroupId.value = ev.groupId || ""
    const base = new Date(ev.startTime)
    dom.inpTitle.value = ev.title || ""
    dom.inpDate.value = fmtD(base)
    if (dom.inpEndDate) dom.inpEndDate.value = ev.rangeEnd || ""
    dom.inpTime.value = fmtT(base)
    dom.selRepeat.value = ev.repeat || "none"
    dom.inpRem.value = ev.remindMinutes ?? 0
    dom.inpNote.value = ev.notes || ""
    if (dom.selType) dom.selType.value = ev.typeId || "type1"
    dom.btnDel && dom.btnDel.classList.remove("hidden")
  } else {
    dom.elMdTit.textContent = "일정 추가"
    dom.inpId.value = ""
    if (dom.inpGroupId) dom.inpGroupId.value = ""
    const now = new Date()
    const d = state.dSel || now
    dom.inpTitle.value = ""
    dom.inpDate.value = fmtD(d)
    if (dom.inpEndDate) {
      let end = ""
      if (state.msOn && state.msSet && state.msSet.size > 1) {
        const arr = Array.from(state.msSet.values()).sort()
        dom.inpDate.value = arr[0]
        end = arr[arr.length - 1]
      }
      dom.inpEndDate.value = end
    }
    const baseTime = sameD(d, now) ? fmtT(now) : "09:00"
    dom.inpTime.value = baseTime
    dom.selRepeat.value = "none"
    dom.inpRem.value = 60
    dom.inpNote.value = ""
    if (dom.selType) dom.selType.value = state.evTypes[0]?.id || "type1"
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
  const groupId = dom.inpGroupId ? dom.inpGroupId.value || "" : ""
  const title = dom.inpTitle.value.trim()
  const date = dom.inpDate.value
  const endDate = dom.inpEndDate ? dom.inpEndDate.value || "" : ""
  const time = dom.inpTime.value
  const repeat = dom.selRepeat.value
  const remindMinutes = Number(dom.inpRem.value || 0)
  const notes = dom.inpNote.value.trim()
  const typeId = dom.selType ? dom.selType.value || "type1" : "type1"
  await saveEvFromForm({ id, groupId, title, date, endDate, time, repeat, remindMinutes, notes, typeId })
  hideMd()
}

async function onDelete() {
  const cnt = state.msSet ? state.msSet.size : 0
  let msg = ""
  if (cnt <= 1) {
    msg = "이 날짜의 일정이 삭제됩니다.\n계속할까요?"
  } else {
    msg = `선택한 ${cnt}개의 날짜에 포함된 일정이 모두 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.\n계속할까요?`
  }
  if (!confirm(msg)) return

  if (cnt > 1) {
    await deleteEventsByDates(state.msSet)
  } else {
    const groupId = dom.inpGroupId ? dom.inpGroupId.value || "" : ""
    const id = dom.inpId.value
    if (groupId) await delGroupById(groupId)
    else if (id) await delEvById(id)
  }
  hideMd()
}

export function bindModal() {
  safeAddListener(dom.btnCancel, "click", hideMd)
  safeAddListener(dom.btnDel, "click", onDelete)
  if (dom.fEv) safeAddListener(dom.fEv, "submit", onSubmit)
}
