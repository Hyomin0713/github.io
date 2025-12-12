import { DEFAULT_TYPES } from "./config.js"

export const state = {
  u: null,
  evs: [],
  evTypes: DEFAULT_TYPES.slice(),
  mCur: new Date(),
  dSel: new Date(),
  vCur: "month",
  msOn: false,
  msSet: new Set(),
  uiTimer: null,
  reloadTimer: null,
  pendingNotiActions: []
}
