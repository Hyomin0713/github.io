export const cap = typeof window !== "undefined" ? window.Capacitor : null
export const ln =
  cap && cap.Plugins && cap.Plugins.LocalNotifications
    ? cap.Plugins.LocalNotifications
    : null
