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
        groupId: dt.groupId || null,
        rangeStart: dt.rangeStart || null,
        rangeEnd: dt.rangeEnd || null
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

export async function saveEvFromForm({ id, groupId, title, date, endDate, time, repeat, remindMinutes, notes, typeId }) {
  if (!state.u) return
  if (!title || !date || !time) return

  const colRef = fb.collection(db, "users", state.u.uid, "events")

  const normRange = (a, b) => {
    const da = parseD(a)
    const dbb = parseD(b)
    if (da > dbb) return [b, a]
    return [a, b]
  }

  const rangeDates = (s, e) => {
    const [ss, ee] = normRange(s, e)
    const a = parseD(ss)
    const b = parseD(ee)
    const out = []
    for (let d = new Date(a.getFullYear(), a.getMonth(), a.getDate()); d <= b; d.setDate(d.getDate() + 1)) {
      out.push(fmtD(d))
    }
    return out
  }

  fnLd(true)
  try {
    if (!id) {
      let sDate = date
      let eDate = endDate || date

      if (state.msOn && state.msSet && state.msSet.size > 0) {
        const arr = Array.from(state.msSet.values()).filter(Boolean)
        arr.push(date)
        arr.sort()
        sDate = arr[0]
        eDate = arr[arr.length - 1]
      } else {
        ;[sDate, eDate] = normRange(sDate, eDate)
      }

      const isRange = sDate !== eDate
      const gid = isRange ? (groupId || (String(Date.now()) + "-" + Math.random().toString(16).slice(2))) : null
      const dates = isRange ? rangeDates(sDate, eDate) : [date]

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
          rangeStart: isRange ? sDate : null,
          rangeEnd: isRange ? eDate : null,
          createdAt: fb.serverTimestamp(),
          updatedAt: fb.serverTimestamp()
        })
      })

      await Promise.all(tasks)
    } else {
      if (groupId && endDate) {
        let [sDate, eDate] = normRange(date, endDate)
        const desired = new Set(rangeDates(sDate, eDate))

        const q = fb.query(colRef, fb.where("groupId", "==", groupId))
        const snap = await fb.getDocs(q)

        const existing = new Map()
        snap.forEach(docu => {
          const dt = docu.data()
          if (dt.deleted) return
          const d = fmtD(new Date(dt.startTime))
          existing.set(d, { id: docu.id, data: dt })
        })

        const updates = []
        const adds = []

        for (const [dStr, obj] of existing.entries()) {
          if (!desired.has(dStr)) {
            const ref = fb.doc(db, "users", state.u.uid, "events", obj.id)
            updates.push(fb.updateDoc(ref, { deleted: true, updatedAt: fb.serverTimestamp() }))
          } else {
            const local = new Date(dStr + "T" + time)
            const iso = local.toISOString()
            const ref = fb.doc(db, "users", state.u.uid, "events", obj.id)
            updates.push(fb.updateDoc(ref, {
              title,
              startTime: iso,
              remindMinutes,
              repeat,
              notes,
              typeId,
              groupId,
              rangeStart: sDate,
              rangeEnd: eDate,
              updatedAt: fb.serverTimestamp()
            }))
          }
        }

        for (const dStr of desired.values()) {
          if (existing.has(dStr)) continue
          const local = new Date(dStr + "T" + time)
          const iso = local.toISOString()
          adds.push(fb.addDoc(colRef, {
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
            rangeStart: sDate,
            rangeEnd: eDate,
            createdAt: fb.serverTimestamp(),
            updatedAt: fb.serverTimestamp()
          }))
        }

        await Promise.all([...updates, ...adds])
      } else {
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
      }
    }

    await loadEv()
  } finally {
    fnLd(false)
  }
}

export async function delEvGroup(groupId) {
  if (!state.u || !groupId) return
  fnLd(true)
  try {
    const colRef = fb.collection(db, "users", state.u.uid, "events")
    const q = fb.query(colRef, fb.where("groupId", "==", groupId))
    const snap = await fb.getDocs(q)
    const tasks = []
    snap.forEach(d => {
      const dt = d.data()
      if (dt.deleted) return
      const ref = fb.doc(db, "users", state.u.uid, "events", d.id)
      tasks.push(fb.updateDoc(ref, { deleted: true, updatedAt: fb.serverTimestamp() }))
    })
    await Promise.all(tasks)
    await loadEv()
  } finally {
    fnLd(false)
  }
}

export async function delEvById(id) {
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
