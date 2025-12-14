import { db, fb } from "./firebase.js"
import { state } from "./state.js"
import { fnLd } from "./ui_common.js"
import { fmtD, parseD, sameD } from "./utils.js"
import { flushPendingNotiAutoComplete } from "./notifications.js"

const hooks = {
  onAfterLoad: null,
  onAfterChange: null
}

export function setEventsHooks({ onAfterLoad, onAfterChange } = {}) {
  hooks.onAfterLoad = onAfterLoad || hooks.onAfterLoad
  hooks.onAfterChange = onAfterChange || hooks.onAfterChange
}

export function isCompletedOn(ev, d) {
  if (!ev.completedDates) return false
  const key = fmtD(d)
  return ev.completedDates.indexOf(key) !== -1
}

export async function setCompleted(ev, d, done) {
  if (!state.u) return
  const key = fmtD(d)
  const arr = Array.isArray(ev.completedDates) ? ev.completedDates.slice() : []
  const idx = arr.indexOf(key)
  if (done && idx === -1) arr.push(key)
  if (!done && idx !== -1) arr.splice(idx, 1)
  ev.completedDates = arr
  try {
    const r = fb.doc(db, "users", state.u.uid, "events", ev.id)
    await fb.updateDoc(r, { completedDates: arr, updatedAt: fb.serverTimestamp() })
  } catch (e) {}
  if (hooks.onAfterChange) hooks.onAfterChange()
}

export async function completeByIdAndDate(evId, dateStr) {
  const ev = state.evs.find(e => e.id === evId)
  if (!ev) return false
  const d = parseD(dateStr)
  if (isCompletedOn(ev, d)) return true
  await setCompleted(ev, d, true)
  return true
}

export function mtEv(ev, d) {
  const base = new Date(ev.startTime)
  if (d < new Date(base.getFullYear(), base.getMonth(), base.getDate())) return false
  const dd = d.getDate()
  switch (ev.repeat) {
    case "none":
      return sameD(base, d)
    case "daily":
      return true
    case "weekly":
      return d.getDay() === base.getDay()
    case "monthly":
      return dd === base.getDate()
    case "yearly":
      return d.getMonth() === base.getMonth() && dd === base.getDate()
    default:
      return false
  }
}

export function evByD(d) {
  return state.evs
    .filter(e => mtEv(e, d))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
}

export function hasEv(d) {
  return evByD(d).length > 0
}

export function nextOcc(ev, from) {
  const base = new Date(ev.startTime)
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate(), base.getHours(), base.getMinutes(), 0, 0)
  if (ev.repeat === "none") {
    if (base >= from) return base
    return null
  }
  for (let i = 0; i < 366; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i, base.getHours(), base.getMinutes(), 0, 0)
    if (!mtEv(ev, date)) continue
    if (date >= from) return date
  }
  return null
}

export async function loadEv() {
  if (!state.u) return
  fnLd(true)
  try {
    const r = fb.collection(db, "users", state.u.uid, "events")
    const qRef = fb.query(r, fb.orderBy("startTime", "asc"))
    const s = await fb.getDocs(qRef)
    const arr = []
    s.forEach(d => {
      const dt = d.data()
      if (dt.deleted) return
      arr.push({
        id: d.id,
        title: dt.title,
        startTime: dt.startTime,
        remindMinutes: dt.remindMinutes ?? 0,
        repeat: dt.repeat || "none",
        notes: dt.notes || "",
        timezone: dt.timezone || "Asia/Seoul",
        typeId: dt.typeId || "type1",
        completedDates: Array.isArray(dt.completedDates) ? dt.completedDates : [],
        groupId: dt.groupId || "",
        rangeStart: dt.rangeStart || "",
        rangeEnd: dt.rangeEnd || ""
      })
    })
    state.evs = arr
    flushPendingNotiAutoComplete(completeByIdAndDate)
  } finally {
    fnLd(false)
  }
  if (hooks.onAfterLoad) await hooks.onAfterLoad()
  if (hooks.onAfterChange) hooks.onAfterChange()
}

function dateStrToDate(s) {
  const p = String(s || "").split("-").map(Number)
  if (p.length !== 3) return new Date()
  return new Date(p[0], p[1] - 1, p[2])
}

function daysBetweenInclusive(aStr, bStr) {
  const a = dateStrToDate(aStr)
  const b = dateStrToDate(bStr)
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate())
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate())
  const out = []
  if (end < start) return out
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(fmtD(d))
  }
  return out
}

function normRange(date, endDate) {
  if (!endDate) return { start: date, end: "" }
  const a = dateStrToDate(date)
  const b = dateStrToDate(endDate)
  if (b < a) return { start: endDate, end: date }
  return { start: date, end: endDate }
}

function genGroupId() {
  return "g_" + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function saveEvFromForm({ id, groupId, title, date, endDate, time, repeat, remindMinutes, notes, typeId }) {
  if (!state.u) return
  if (!title || !date || !time) return

  const colRef = fb.collection(db, "users", state.u.uid, "events")
  fnLd(true)
  try {
    const rng = normRange(date, endDate)
    const isRange = !!rng.end && rng.start !== rng.end

    if (!id && !groupId) {
      if (state.msOn && state.msSet && state.msSet.size > 1 && !endDate) {
        const arr = Array.from(state.msSet.values()).sort()
        if (arr.length) {
          rng.start = arr[0]
          rng.end = arr[arr.length - 1]
        }
      }
    }

    const wantRange = !!rng.end && rng.start !== rng.end
    const gid = groupId || (wantRange ? genGroupId() : "")

    if (!id && !groupId) {
      if (wantRange) {
        const dates = daysBetweenInclusive(rng.start, rng.end)
        const tasks = dates.map(dStr => {
          const local = new Date(dStr + "T" + time)
          const iso = local.toISOString()
          return fb.addDoc(colRef, {
            title,
            startTime: iso,
            remindMinutes,
            repeat,
            notes,
            timezone: "Asia/Seoul",
            typeId,
            completedDates: [],
            deleted: false,
            groupId: gid,
            rangeStart: rng.start,
            rangeEnd: rng.end,
            createdAt: fb.serverTimestamp(),
            updatedAt: fb.serverTimestamp()
          })
        })
        await Promise.all(tasks)
      } else {
        const local = new Date(date + "T" + time)
        const iso = local.toISOString()
        await fb.addDoc(colRef, {
          title,
          startTime: iso,
          remindMinutes,
          repeat,
          notes,
          timezone: "Asia/Seoul",
          typeId,
          completedDates: [],
          deleted: false,
          groupId: "",
          rangeStart: "",
          rangeEnd: "",
          createdAt: fb.serverTimestamp(),
          updatedAt: fb.serverTimestamp()
        })
      }
      await loadEv()
      return
    }

    if (groupId) {
      const dates = wantRange ? daysBetweenInclusive(rng.start, rng.end) : [rng.start]
      const existing = state.evs.filter(e => e.groupId === groupId && !e.deleted)
      const existingMap = new Map()
      for (const e of existing) existingMap.set(fmtD(new Date(e.startTime)), e)

      const keepSet = new Set(dates)

      const writes = []

      for (const e of existing) {
        const dStr = fmtD(new Date(e.startTime))
        const ref = fb.doc(db, "users", state.u.uid, "events", e.id)
        if (!keepSet.has(dStr)) {
          writes.push(fb.updateDoc(ref, { deleted: true, updatedAt: fb.serverTimestamp() }))
        } else {
          const local = new Date(dStr + "T" + time)
          const iso = local.toISOString()
          writes.push(
            fb.updateDoc(ref, {
              title,
              startTime: iso,
              remindMinutes,
              repeat,
              notes,
              typeId,
              groupId,
              rangeStart: wantRange ? rng.start : "",
              rangeEnd: wantRange ? rng.end : "",
              updatedAt: fb.serverTimestamp()
            })
          )
        }
      }

      for (const dStr of dates) {
        if (existingMap.has(dStr)) continue
        const local = new Date(dStr + "T" + time)
        const iso = local.toISOString()
        writes.push(
          fb.addDoc(colRef, {
            title,
            startTime: iso,
            remindMinutes,
            repeat,
            notes,
            timezone: "Asia/Seoul",
            typeId,
            completedDates: [],
            deleted: false,
            groupId,
            rangeStart: wantRange ? rng.start : "",
            rangeEnd: wantRange ? rng.end : "",
            createdAt: fb.serverTimestamp(),
            updatedAt: fb.serverTimestamp()
          })
        )
      }

      await Promise.all(writes)
      await loadEv()
      return
    }

    const local = new Date(date + "T" + time)
    const iso = local.toISOString()
    const ref = fb.doc(db, "users", state.u.uid, "events", id)
    await fb.updateDoc(ref, {
      title,
      startTime: iso,
      remindMinutes,
      repeat,
      notes,
      typeId,
      updatedAt: fb.serverTimestamp()
    })
    await loadEv()
  } finally {
    fnLd(false)
  }
}

export async function delEvByIdexport async function delEvById(id) {
  if (!state.u || !id) return
  fnLd(true)
  try {
    const ref = fb.doc(db, "users", state.u.uid, "events", id)
    await fb.updateDoc(ref, { deleted: true, updatedAt: fb.serverTimestamp() })
    await loadEv()
  } finally {
    fnLd(false)
  }
}


export async function delGroupById(groupId) {
  if (!state.u || !groupId) return
  fnLd(true)
  try {
    const r = fb.collection(db, "users", state.u.uid, "events")
    const qRef = fb.query(r, fb.where("groupId", "==", groupId))
    const s = await fb.getDocs(qRef)
    const tasks = []
    s.forEach(d => {
      const ref = fb.doc(db, "users", state.u.uid, "events", d.id)
      tasks.push(fb.updateDoc(ref, { deleted: true, updatedAt: fb.serverTimestamp() }))
    })
    await Promise.all(tasks)
    await loadEv()
  } finally {
    fnLd(false)
  }
}
