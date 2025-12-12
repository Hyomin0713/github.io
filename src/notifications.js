import { ln } from "./capacitor.js"
import { state } from "./state.js"
import { fmtD, fmtT } from "./utils.js"
import { nextOcc } from "./events.js"

let pendingNotiActions = []

export function enqueueNotiAutoComplete(ex) {
  if (!ex || !ex.eventId || !ex.date) return
  pendingNotiActions.push({ eventId: ex.eventId, date: ex.date })
}

export async function flushPendingNotiAutoComplete(completeFn) {
  if (!pendingNotiActions.length) return
  const arr = pendingNotiActions.slice()
  pendingNotiActions = []
  for (const ex of arr) {
    try {
      await completeFn(ex.eventId, ex.date)
    } catch (e) {}
  }
}

export function queueNotiAction(ex) {
  enqueueNotiAutoComplete(ex)
}

export async function flushPendingNotiActions() {
  if (!pendingNotiActions.length) return
  const arr = pendingNotiActions.slice()
  pendingNotiActions = []
  for (const a of arr) {
    try {
      const mod = await import("./events.js")
      if (mod && typeof mod.completeByIdAndDate === "function") {
        await mod.completeByIdAndDate(a.eventId, a.date)
      }
    } catch (e) {}
  }
}

export async function initLocalNoti() {
  if (!ln) return
  try {
    const st = await ln.checkPermissions()
    if (!st || st.display !== "granted") await ln.requestPermissions()
  } catch (e) {}

  if (ln && ln.addListener) {
    ln.addListener("localNotificationActionPerformed", async info => {
      try {
        const n = info?.notification
        const ex = n?.extra
        if (!ex || !ex.eventId || !ex.date) return

        enqueueNotiAutoComplete(ex)

        if (state?.evs?.length) {
          const mod = await import("./events.js")
          if (mod?.completeByIdAndDate) {
            await mod.completeByIdAndDate(ex.eventId, ex.date)
          }
        }
      } catch (e) {}
    })
  }
}

export async function scheduleLocal(ev, occDate) {
  if (!ln) return
  const mins = Number(ev.remindMinutes || 0)
  if (mins <= 0) return
  const now = new Date()
  const trigger = new Date(occDate.getTime() - mins * 60000)
  if (trigger <= now) return

  try {
    const id = Math.floor(trigger.getTime() % 2147483647)
    await ln.schedule({
      notifications: [
        {
          id,
          title: "일정 알림",
          body:
            ev.title +
            " / " +
            occDate.toLocaleDateString() +
            " " +
            fmtT(occDate),
          schedule: { at: trigger },
          smallIcon: "ic_launcher",
          extra: { eventId: ev.id, date: fmtD(occDate) }
        }
      ]
    })
  } catch (e) {}
}

export async function scheduleLocalForEvent(ev) {
  if (!ln) return
  const now = new Date()
  let occ
  if (ev.repeat && ev.repeat !== "none") occ = nextOcc(ev, now)
  else {
    const base = new Date(ev.startTime)
    occ = base > now ? base : null
  }
  if (!occ) return
  await scheduleLocal(ev, occ)
}

export async function scheduleLocalForAll() {
  if (!ln) return
  for (const ev of state.evs) {
    await scheduleLocalForEvent(ev)
  }
}
