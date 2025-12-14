import { DEFAULT_TYPES } from "./config.js"
import { db, fb } from "./firebase.js"
import { state } from "./state.js"
import { dom } from "./dom.js"
import { safeAddListener } from "./utils.js"

const $ = id => document.getElementById(id)

function elTypeEditor() {
  return dom.elTypeEditor || $("type-editor")
}

function selTypeEditor() {
  return dom.selTypeEditor || $("type-editor-select")
}

function btnTypeEditorClose() {
  return dom.btnTypeEditorClose || $("btn-type-editor-close")
}

function btnEditTypes() {
  return dom.btnEditTypes || $("btn-edit-types")
}

function getSelectedIndex() {
  const s = selTypeEditor()
  if (s) {
    const v = Number(s.value)
    if (Number.isFinite(v)) return v
  }
  const e = elTypeEditor()
  if (e) {
    const v = Number(e.dataset.selected)
    if (Number.isFinite(v)) return v
  }
  return 0
}

function setSelectedIndex(idx) {
  const v = String(idx)
  const s = selTypeEditor()
  if (s) s.value = v
  const e = elTypeEditor()
  if (e) e.dataset.selected = v
}

export function getTypeById(id) {
  return state.evTypes.find(t => t.id === id) || state.evTypes[0]
}

export function applyTypesToSelect() {
  if (dom.selType) {
    const opts = dom.selType.options
    for (let i = 0; i < state.evTypes.length && i < opts.length; i++) {
      opts[i].value = state.evTypes[i].id
      const ic = state.evTypes[i].icon ? state.evTypes[i].icon + " " : ""
      opts[i].textContent = ic + state.evTypes[i].name
    }
  }

  const s = selTypeEditor()
  if (s) {
    const eopts = s.options
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
  const editor = elTypeEditor()
  if (!editor) return

  const idx = getSelectedIndex()
  const tp = state.evTypes[idx] || DEFAULT_TYPES[idx]
  if (!tp) return

  const row = editor.querySelector(".type-editor-row")
  if (!row) return

  const titleEl = editor.querySelector("#type-editor-row-title")
  if (titleEl) titleEl.textContent = `종류 ${idx + 1}`

  const nameInput = row.querySelector(".type-name-input")
  if (nameInput && nameInput.value !== tp.name) nameInput.value = tp.name

  const iconInput = row.querySelector(".type-icon-input")
  if (iconInput && iconInput.value !== (tp.icon || "")) iconInput.value = tp.icon || ""

  const colorInput = row.querySelector(".type-color-input")
  if (colorInput) {
    const cur = (colorInput.value || "").toLowerCase()
    const nxt = (tp.color || "").toLowerCase()
    if (cur !== nxt && nxt) colorInput.value = tp.color
  }

  row.querySelectorAll(".type-icon-btn").forEach(btn => {
    const ic = btn.dataset.icon || ""
    btn.classList.toggle("selected", (tp.icon || "") === ic)
  })
}

export function openTypeEditor() {
  const editor = elTypeEditor()
  if (!editor) return

  applyTypesToSelect()

  const idxFromEventType = Math.max(
    0,
    state.evTypes.findIndex(t => t.id === dom.selType?.value)
  )

  setSelectedIndex(idxFromEventType)
  syncTypeEditorFromTypes()

  editor.style.display = "block"
  editor.classList.add("show")
}

export function closeTypeEditor() {
  const editor = elTypeEditor()
  if (!editor) return
  editor.classList.remove("show")
  editor.style.display = "none"
}

export function bindTypeEditor(drawAll) {
  const editBtn = btnEditTypes()
  const closeBtn = btnTypeEditorClose()
  const editor = elTypeEditor()
  const sel = selTypeEditor()

  safeAddListener(editBtn, "click", () => {
    const ed = elTypeEditor()
    if (!ed) return
    if (ed.classList.contains("show")) closeTypeEditor()
    else openTypeEditor()
  })

  safeAddListener(closeBtn, "click", () => closeTypeEditor())

  safeAddListener(sel, "change", e => {
    const v = Number(e.target.value)
    if (!Number.isFinite(v)) return
    setSelectedIndex(v)
    syncTypeEditorFromTypes()
  })

  if (!editor) return

  safeAddListener(editor, "input", e => {
    const t = e.target
    if (!t?.classList) return

    const idx = getSelectedIndex()
    if (!state.evTypes[idx]) return

    if (t.classList.contains("type-name-input")) {
      state.evTypes[idx].name = t.value || DEFAULT_TYPES[idx].name
      applyTypesToSelect()
      saveSettings()
      if (typeof drawAll === "function") drawAll()
      return
    }

    if (t.classList.contains("type-icon-input")) {
      state.evTypes[idx].icon = (t.value || "").trim()
      applyTypesToSelect()
      saveSettings()
      syncTypeEditorFromTypes()
      if (typeof drawAll === "function") drawAll()
      return
    }

    if (t.classList.contains("type-color-input")) {
      state.evTypes[idx].color = t.value
      saveSettings()
      syncTypeEditorFromTypes()
      applyTypesToSelect()
      if (typeof drawAll === "function") drawAll()
    }
  })

  safeAddListener(editor, "click", e => {
    const idx = getSelectedIndex()
    if (!state.evTypes[idx]) return

    const iconBtn = e.target.closest(".type-icon-btn")
    if (iconBtn) {
      state.evTypes[idx].icon = iconBtn.dataset.icon || ""
      applyTypesToSelect()
      saveSettings()
      syncTypeEditorFromTypes()
      if (typeof drawAll === "function") drawAll()
      return
    }
  })

  editor.classList.remove("show")
  editor.classList.remove("type-editor-floating")
  editor.style.display = "none"
  setSelectedIndex(0)
}
