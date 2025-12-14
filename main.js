import { auth, authApi } from "./src/firebase.js"
import { state } from "./src/state.js"
import { fmtD } from "./src/utils.js"
import { loadSettings, bindTypeEditor, syncTypeEditorFromTypes } from "./src/types.js"
import { initLocalNoti, scheduleLocalForAll, flushPendingNotiActions } from "./src/notifications.js"
import { loadEv, setEventsHooks } from "./src/events.js"
import { drawAll, setRenderHooks } from "./src/render.js"
import { showMd, bindModal } from "./src/modal.js"
import { bindNavigation } from "./src/navigation.js"
import { startTimers } from "./src/timers.js"

setRenderHooks({ showMd })

setEventsHooks({
  onAfterLoad: async () => {
    await scheduleLocalForAll()
    await flushPendingNotiActions()
  },
  onAfterChange: () => {
    drawAll()
  }
})

bindModal()
bindNavigation()
bindTypeEditor(drawAll)

authApi.onAuthStateChanged(auth, async usr => {
  if (usr) {
    state.u = usr
    state.mCur = new Date()
    state.dSel = new Date()
    state.msSet.clear()
    state.msSet.add(fmtD(state.dSel))
    await loadSettings()
    syncTypeEditorFromTypes()
    await initLocalNoti()
    await loadEv()
    startTimers()
  } else {
    try {
      await authApi.signInAnonymously(auth)
    } catch (e) {}
  }
})
