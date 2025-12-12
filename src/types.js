import { DEFAULT_TYPES } from "./config.js"
import { db, fb } from "./firebase.js"
import { state } from "./state.js"
import { dom } from "./dom.js"
import { safeAddListener } from "./utils.js"
///////
export function getTypeById(id) {
  return state.evTypes.find(t => t.id === id) || state.evTypes[0]
}

export function applyTypesToSelect() {
  if (!dom.selType) return
  const opts = dom.selType.options
  for (let i = 0; i < state.evTypes.length && i < opts.length; i++) {
    opts[i].value = state.evTypes[i].id
    opts[i].textContent = state.evTypes[i].name
  }
}

export async function loadSettings() {
  if (!state.u) return
  try {
    const r = fb.doc(db, "users", state.u.uid, "settings")
    const s = await fb.getDoc(r)
    if (s.exists()) {
      const dt = s.data()
      if (Array.isArray(dt.eventTypes) && dt.eventTypes.length === 3) {
        state.evTypes = dt.eventTypes.map((t, i) => {
          const base = DEFAULT_TYPES[i]
          return {
            id: t.id || base.id,
            name: t.name || base.name,
            color: t.color || base.color,
            icon: t.icon || base.icon
          }
        })
      }
    } else {
      await fb.setDoc(fb.doc(db, "users", state.u.uid, "settings"), { eventTypes: state.evTypes }, { merge: true })
    }
  } catch (e) {}
  applyTypesToSelect()
}

export async function saveSettings() {
  if (!state.u) return
  try {
    const r = fb.doc(db, "users", state.u.uid, "settings")
    await fb.setDoc(r, { eventTypes: state.evTypes }, { merge: true })
  } catch (e) {}
}

export function syncTypeEditorFromTypes() {
  if (!dom.elTypeEditor) return
  const rows = dom.elTypeEditor.querySelectorAll(".type-editor-row")
  rows.forEach(row => {
    const idx = Number(row.dataset.index)
    const tp = state.evTypes[idx] || DEFAULT_TYPES[idx]
    if (!tp) return
    const nameInput = row.querySelector(".type-name-input")
    if (nameInput && nameInput.value !== tp.name) nameInput.value = tp.name
    row.querySelectorAll(".type-icon-btn").forEach(btn => {
      const ic = btn.dataset.icon
      btn.classList.toggle("selected", tp.icon === ic)
    })
    row.querySelectorAll(".type-color-btn").forEach(btn => {
      const c = btn.dataset.color
      btn.style.setProperty("--color", c)
      btn.classList.toggle("selected", tp.color === c)
    })
  })
}

export function openTypeEditor() {
  if (!dom.elTypeEditor) return
  syncTypeEditorFromTypes()
  dom.elTypeEditor.style.display = "block"
  dom.elTypeEditor.classList.add("show")
}

export function closeTypeEditor() {
  if (!dom.elTypeEditor) return
  dom.elTypeEditor.classList.remove("show")
  dom.elTypeEditor.style.display = "none"
}

export function bindTypeEditor(drawAll) {
  safeAddListener(dom.btnEditTypes, "click", () => {
    if (!dom.elTypeEditor) return
    if (dom.elTypeEditor.classList.contains("show")) closeTypeEditor()
    else openTypeEditor()
  })

  safeAddListener(dom.btnTypeEditorClose, "click", () => closeTypeEditor())

  if (dom.elTypeEditor) {
    safeAddListener(dom.elTypeEditor, "input", e => {
      const t = e.target
      if (!t || !t.classList || !t.classList.contains("type-name-input")) return
      const row = t.closest(".type-editor-row")
      if (!row) return
      const idx = Number(row.dataset.index)
      if (!state.evTypes[idx]) return
      state.evTypes[idx].name = t.value || DEFAULT_TYPES[idx].name
      applyTypesToSelect()
      saveSettings()
      drawAll()
    })

    safeAddListener(dom.elTypeEditor, "click", e => {
      const iconBtn = e.target.closest(".type-icon-btn")
      if (iconBtn) {
        const row = iconBtn.closest(".type-editor-row")
        const idx = Number(row.dataset.index)
        if (!state.evTypes[idx]) return
        state.evTypes[idx].icon = iconBtn.dataset.icon || ""
        saveSettings()
        syncTypeEditorFromTypes()
        drawAll()
        return
      }
      const colorBtn = e.target.closest(".type-color-btn")
      if (colorBtn) {
        const row = colorBtn.closest(".type-editor-row")
        const idx = Number(row.dataset.index)
        if (!state.evTypes[idx]) return
        state.evTypes[idx].color = colorBtn.dataset.color || state.evTypes[idx].color
        saveSettings()
        syncTypeEditorFromTypes()
        applyTypesToSelect()
        drawAll()
      }
    })
  }
  if (dom.elTypeEditor) {
    dom.elTypeEditor.classList.remove("show")
    dom.elTypeEditor.classList.remove("type-editor-floating")
    dom.elTypeEditor.style.display = "none"
  }

dom.elTypeEditor.addEventListener("input", e => {
  const el = e.target
  if (!el.classList.contains("type-color-input")) return

  const idx = Number(el.dataset.index)
  if (!Number.isFinite(idx) || !state.evTypes[idx]) return

  state.evTypes[idx].color = el.value
  saveSettings()
  drawAll()
})

}
