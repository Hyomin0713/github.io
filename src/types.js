import { DEFAULT_TYPES } from "./config.js"
import { db, fb } from "./firebase.js"
import { state } from "./state.js"
import { safeAddListener } from "./utils.js"

const $ = id => document.getElementById(id)

export function getTypeById(id) {
  return state.evTypes.find(t => t.id === id) || state.evTypes[0]
}

function getEditor() {
  return $("type-editor")
}

function getEditorSelect() {
  return $("type-editor-select")
}

function getSelectedIndex() {
  const sel = getEditorSelect()
  const v = Number(sel?.value)
  return Number.isFinite(v) ? v : 0
}

export function applyTypesToSelect() {
  const selType = $("event-type")
  if (selType) {
    const opts = selType.options
    for (let i = 0; i < state.evTypes.length && i < opts.length; i++) {
      opts[i].value = state.evTypes[i].id
      const ic = state.evTypes[i].icon ? state.evTypes[i].icon + " " : ""
      opts[i].textContent = ic + state.evTypes[i].name
    }
  }

  const selEditor = getEditorSelect()
  if (selEditor) {
    const opts = selEditor.options
    for (let i = 0; i < state.evTypes.length && i < opts.length; i++) {
      const ic = state.evTypes[i].icon ? state.evTypes[i].icon + " " : ""
      opts[i].value = String(i)
      opts[i].textContent = ic + state.evTypes[i].name
    }
  }
}

export async function loadSettings() {
  if (!state.u) return
  try {
    const r = fb.doc(db, "users", state.u.uid, "settings")
    const s = await fb.getDoc(r)
    if (s.exists()) {
      const d = s.data()
      if (Array.isArray(d.eventTypes)) {
        state.evTypes = d.eventTypes.map((t, i) => ({
          id: t.id || DEFAULT_TYPES[i].id,
          name: t.name || DEFAULT_TYPES[i].name,
          color: t.color || DEFAULT_TYPES[i].color,
          icon: t.icon || DEFAULT_TYPES[i].icon
        }))
      }
    }
  } catch {}
  applyTypesToSelect()
}

export async function saveSettings() {
  if (!state.u) return
  try {
    const r = fb.doc(db, "users", state.u.uid, "settings")
    await fb.setDoc(r, { eventTypes: state.evTypes }, { merge: true })
  } catch {}
}

export function syncTypeEditorFromTypes() {
  const idx = getSelectedIndex()
  const tp = state.evTypes[idx]
  const editor = getEditor()
  if (!editor || !tp) return

  const row = editor.querySelector(".type-editor-row")
  if (!row) return

  row.querySelector(".type-name-input").value = tp.name
  row.querySelector(".type-icon-input").value = tp.icon || ""
  row.querySelector(".type-color-input").value = tp.color

  row.querySelectorAll(".type-icon-btn").forEach(b => {
    b.classList.toggle("selected", b.dataset.icon === tp.icon)
  })
}

export function openTypeEditor() {
  applyTypesToSelect()
  syncTypeEditorFromTypes()
  const ed = getEditor()
  if (ed) {
    ed.style.display = "block"
    ed.classList.add("show")
  }
}

export function closeTypeEditor() {
  const ed = getEditor()
  if (ed) {
    ed.classList.remove("show")
    ed.style.display = "none"
  }
}

export function bindTypeEditor(drawAll) {
  safeAddListener($("btn-edit-types"), "click", openTypeEditor)
  safeAddListener($("btn-type-editor-close"), "click", closeTypeEditor)

  safeAddListener(getEditorSelect(), "change", () => {
    syncTypeEditorFromTypes()
  })

  safeAddListener(getEditor(), "input", e => {
    const idx = getSelectedIndex()
    const tp = state.evTypes[idx]
    if (!tp) return

    if (e.target.classList.contains("type-name-input")) {
      tp.name = e.target.value
    }

    if (e.target.classList.contains("type-icon-input")) {
      tp.icon = e.target.value.trim()
    }

    if (e.target.classList.contains("type-color-input")) {
      tp.color = e.target.value
    }

    saveSettings()
    applyTypesToSelect()
    drawAll()
  })

  safeAddListener(getEditor(), "click", e => {
    const btn = e.target.closest(".type-icon-btn")
    if (!btn) return
    const idx = getSelectedIndex()
    const tp = state.evTypes[idx]
    if (!tp) return
    tp.icon = btn.dataset.icon
    saveSettings()
    applyTypesToSelect()
    syncTypeEditorFromTypes()
    drawAll()
  })
}
