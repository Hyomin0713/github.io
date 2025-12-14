import { dom } from "./dom.js"
import { state } from "./state.js"
import { fmtD, fmtT, sameD, safeAddListener } from "./utils.js"
import { saveEvFromForm, delEvById, delEvGroup } from "./events.js"

export function showMd(ev) {
  if (!dom.elMd) return
  if (ev) {
    dom.elMdTit.textContent = "일정 수정"
    dom.inpId.value = ev.id
    const base = new Date(ev.startTime)
    dom.inpTitle.value = ev.title
    dom.inpDate.value = fmtD(base)
    dom.inpTime.value = fmtT(base)

    if (dom.inpGroupId) dom.inpGroupId.value = ev.groupId || ""
    if (dom.inpEndDate) {
      const wrap = dom.inpEndDate.closest(".field")
      const hasRange = !!ev.groupId && !!ev.rangeEnd
      if (wrap) wrap.style.display = hasRange ? "" : "none"
      dom.inpEndDate.value = hasRange ? ev.rangeEnd : ""
    }
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

    if (dom.inpGroupId) dom.inpGroupId.value = ""
    if (dom.inpEndDate) {
      const wrap = dom.inpEndDate.closest(".field")
      let show = false
      let s = fmtD(d)
      let e = ""
      if (state.msOn && state.msSet && state.msSet.size > 0) {
        const arr = Array.from(state.msSet.values()).filter(Boolean).sort()
        if (arr.length >= 2) {
          show = true
          s = arr[0]
          e = arr[arr.length - 1]
        }
      }
      dom.inpDate.value = s
      dom.inpEndDate.value = e
      if (wrap) wrap.style.display = show ? "" : "none"
    }

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
  const endDate = dom.inpEndDate ? dom.inpEndDate.value : ""
  const time = dom.inpTime.value
  const groupId = dom.inpGroupId ? dom.inpGroupId.value.trim() || null : null
  const repeat = dom.selRepeat.value
  const remindMinutes = Number(dom.inpRem.value || 0)
  const notes = dom.inpNote.value.trim()
  const typeId = dom.selType ? dom.selType.value || "type1" : "type1"
  await saveEvFromForm({ id, groupId, title, date, endDate, time, repeat, remindMinutes, notes, typeId })
  hideMd()
}

async function onDelete() {
  const id = dom.inpId.value
  const gid = dom.inpGroupId ? dom.inpGroupId.value.trim() : ""
  if (gid) {
    await delEvGroup(gid)
    hideMd()
    return
  }
  if (!id) return
  await delEvById(id)
  hideMd()
}

export function bindModal() {
  safeAddListener(dom.btnCancel, "click", hideMd)
  safeAddListener(dom.btnDel, "click", onDelete)
  if (dom.fEv) safeAddListener(dom.fEv, "submit", onSubmit)
}
