import { DEFAULT_TYPES } from "./config.js"
import { db, fb } from "./firebase.js"
import { state } from "./state.js"
import { dom } from "./dom.js"
import { safeAddListener } from "./utils.js"

export function getTypeById(id) {
  return state.evTypes.find(t => t.id === id) || state.evTypes[0]
}

function getSelectedIndex() {
  if (dom.selTypeEditor) {
    const v = Number(dom.selTypeEditor.value)
    if (Number.isFinite(v)) return v
  }
  if (dom.elTypeEditor) {
    const v = Number(dom.elTypeEditor.dataset.selected)
    if (Number.isFinite(v)) return v
  }
  return 0
}

function setSelectedIndex(idx) {
  const v = String(idx)
  if (dom.selTypeEditor) dom.selTypeEditor.value = v
  if (dom.elTypeEditor) dom.elTypeEditor.dataset.selected = v
}

export function applyTypesToSelect() {
  if (!dom.selType) return

  const opts = dom.selType.options
  for (let i = 0; i < state.evTypes.length && i < opts.length; i++) {
    opts[i].value = state.evTypes[i].id
    const ic = state.evTypes[i].icon ? state.evTypes[i].icon + " " : ""
    opts[i].textContent = ic + state.evTypes[i].name
  }

  if (dom.selTypeEditor) {
    const eopts = dom.selTypeEditor.options
    for (let i = 0; i < state.evTypes.length && i < eopts.length; i++) {
      const ic = state.evTypes[i].icon ? state.evTypes[i].icon + " " : ""
      eopts[i].value = String(i)
      eopts[i].textContent = ic + state.evTypes[i].name
    }
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
      await fb.setDoc(
        fb.doc(db, "users", state.u.uid, "settings"),
        { eventTypes: state.evTypes },
        { merge: true }
      )
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

  const idx = getSelectedIndex()
  const tp = state.evTypes[idx] || DEFAULT_TYPES[idx]
  if (!tp) return

  const row = dom.elTypeEditor.querySelector(".type-editor-row")
  if (!row) return

  const titleEl = dom.elTypeEditor.querySelector("#type-editor-row-title")
  if (titleEl) titleEl.textContent = `종류 ${idx + 1}`

  const nameInput = row.querySelector(".type-name-input")
  if (nameInput && nameInput.value !== tp.name) nameInput.value = tp.name

  const iconInput = row.querySelector(".type-icon-input")
  if (iconInput && iconInput.value !== (tp.icon || "")) iconInput.value = tp.icon || ""

  const colorInput = row.querySelector(".type-color-input")
  if (colorInput && colorInput.value.toLowerCase() !== (tp.color || "").toLowerCase()) {
    colorInput.value = tp.color || "#ffffff"
  }

  row.querySelectorAll(".type-icon-btn").forEach(btn => {
    const ic = btn.dataset.icon
    btn.classList.toggle("selected", (tp.icon || "") === (ic || ""))
  })
}

export function openTypeEditor() {
  if (!dom.elTypeEditor) return

  applyTypesToSelect()

  const idxFromEventType = Math.max(
    0,
    state.evTypes.findIndex(t => t.id === dom.selType?.value)
  )
  setSelectedIndex(idxFromEventType)

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

  safeAddListener(dom.selTypeEditor, "change", e => {
    const v = Number(e.target.value)
    if (!Number.isFinite(v)) return
    setSelectedIndex(v)
    syncTypeEditorFromTypes()
  })

  if (!dom.elTypeEditor) return

  safeAddListener(dom.elTypeEditor, "input", e => {
    const t = e.target
    if (!t?.classList) return

    const idx = getSelectedIndex()
    if (!state.evTypes[idx]) return

    if (t.classList.contains("type-name-input")) {
      state.evTypes[idx].name = t.value || DEFAULT_TYPES[idx].name
      applyTypesToSelect()
      saveSettings()
      drawAll()
      return
    }

    if (t.classList.contains("type-icon-input")) {
      state.evTypes[idx].icon = (t.value || "").trim()
      applyTypesToSelect()
      saveSettings()
      syncTypeEditorFromTypes()
      drawAll()
      return
    }

    if (t.classList.contains("type-color-input")) {
      state.evTypes[idx].color = t.value
      saveSettings()
      syncTypeEditorFromTypes()
      applyTypesToSelect()
      drawAll()
    }
  })

  safeAddListener(dom.elTypeEditor, "click", e => {
    const idx = getSelectedIndex()
    if (!state.evTypes[idx]) return

    const iconBtn = e.target.closest(".type-icon-btn")
    if (iconBtn) {
      state.evTypes[idx].icon = iconBtn.dataset.icon || ""
      applyTypesToSelect()
      saveSettings()
      syncTypeEditorFromTypes()
      drawAll()
      return
    }
  })

  dom.elTypeEditor.classList.remove("show")
  dom.elTypeEditor.classList.remove("type-editor-floating")
  dom.elTypeEditor.style.display = "none"
  setSelectedIndex(0)
}
