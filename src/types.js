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
      if (Array.isArray(d.eventTypes) && d.eventTypes.length === 3) {
        state.evTypes = d.eventTypes.map((t, i) => ({
          id: t.id || DEFAULT_TYPES[i].id,
          name: t.name || DEFAULT_TYPES[i].name,
          color: t.color || DEFAULT_TYPES[i].color,
          icon: t.icon || DEFAULT_TYPES[i].icon
        }))
      }
    } else {
      await fb.setDoc(r, { eventTypes: state.evTypes }, { merge: true })
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

  const titleEl = editor.querySelector("#type-editor-row-title")
  if (titleEl) titleEl.textContent = `종류 ${idx + 1}`

  const nameInput = row.querySelector(".type-name-input")
  if (nameInput) nameInput.value = tp.name

  const iconInput = row.querySelector(".type-icon-input")
  if (iconInput) iconInput.value = tp.icon || ""

  const colorInput = row.querySelector(".type-color-input")
  if (colorInput) colorInput.value = tp.color

  row.querySelectorAll(".type-icon-btn").forEach(b => {
    b.classList.toggle("selected", (b.dataset.icon || "") === (tp.icon || ""))
  })
}

export function openTypeEditor() {
  const editor = getEditor()
  if (!editor) return

  applyTypesToSelect()

  const selType = $("event-type")
  const curTypeId = selType?.value
  let idx = 0
  if (curTypeId) {
    const found = state.evTypes.findIndex(t => t.id === curTypeId)
    if (found >= 0) idx = found
  }

  const selEditor = getEditorSelect()
  if (selEditor) selEditor.value = String(idx)

  syncTypeEditorFromTypes()
  editor.style.display = "block"
  editor.classList.add("show")
}

export function closeTypeEditor() {
  const ed = getEditor()
  if (!ed) return
  ed.classList.remove("show")
  ed.style.display = "none"
}

export function bindTypeEditor(drawAll) {
  const btnOpen = $("btn-edit-types")
  const btnClose = $("btn-type-editor-close")
  const editor = getEditor()
  const selEditor = getEditorSelect()

  safeAddListener(btnOpen, "click", () => openTypeEditor())
  safeAddListener(btnClose, "click", () => closeTypeEditor())

  safeAddListener(selEditor, "change", () => {
    syncTypeEditorFromTypes()
  })

  safeAddListener(editor, "input", e => {
    const idx = getSelectedIndex()
    const tp = state.evTypes[idx]
    if (!tp) return
    const t = e.target
    if (!t?.classList) return

    if (t.classList.contains("type-name-input")) {
      tp.name = t.value || DEFAULT_TYPES[idx].name
      saveSettings()
      applyTypesToSelect()
      syncTypeEditorFromTypes()
      if (typeof drawAll === "function") drawAll()
      return
    }

    if (t.classList.contains("type-icon-input")) {
      tp.icon = (t.value || "").trim()
      saveSettings()
      applyTypesToSelect()
      syncTypeEditorFromTypes()
      if (typeof drawAll === "function") drawAll()
      return
    }

    if (t.classList.contains("type-color-input")) {
      tp.color = t.value
      saveSettings()
      applyTypesToSelect()
      syncTypeEditorFromTypes()
      if (typeof drawAll === "function") drawAll()
    }
  })

  safeAddListener(editor, "click", e => {
    const btn = e.target.closest(".type-icon-btn")
    if (!btn) return
    const idx = getSelectedIndex()
    const tp = state.evTypes[idx]
    if (!tp) return
    tp.icon = btn.dataset.icon || ""
    saveSettings()
    applyTypesToSelect()
    syncTypeEditorFromTypes()
    if (typeof drawAll === "function") drawAll()
  })
}
