* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #050509;
  --bg-soft: #0d0d15;
  --bg-elevated: #161623;
  --accent1: #9d00ff;
  --accent2: #00ff85;
  --accent-soft: rgba(157, 0, 255, 0.25);
  --text: #ffffff;
  --text-soft: #b0b0b0;
  --border-soft: #252537;
  --danger: #ff4d6a;
  --radius-lg: 18px;
  --radius-md: 12px;
  --radius-pill: 999px;
  --shadow-soft: 0 18px 40px rgba(0, 0, 0, 0.6);
  --shadow-neon: 0 0 18px rgba(0, 255, 133, 0.6);
  --duration-fast: 0.18s;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  background: radial-gradient(circle at top left, #201b3f 0, #050509 45%)
    fixed;
  color: var(--text);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: stretch;
}

#app {
  width: 100%;
  max-width: 480px;
  min-height: 100vh;
  background: linear-gradient(145deg, #050509 0%, #090919 55%, #050509 100%);
  border-radius: 0;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.app-header {
  padding: 16px 18px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(120deg, var(--accent1), var(--accent2));
  -webkit-background-clip: text;
  color: transparent;
}

.app-subtitle {
  font-size: 11px;
  color: var(--text-soft);
  margin-top: 3px;
}

.header-btn {
  border: none;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: background var(--duration-fast), transform var(--duration-fast),
    box-shadow var(--duration-fast);
}

.header-btn.ghost {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.18);
}

.header-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 12px rgba(157, 0, 255, 0.4);
}

main {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 72px;
}

.screen {
  display: none;
}

.screen.active {
  display: block;
}

.next-event-card {
  margin-top: 6px;
  padding: 16px 16px 14px;
  border-radius: 20px;
  background: linear-gradient(
      135deg,
      rgba(157, 0, 255, 0.16),
      rgba(0, 255, 133, 0.08)
    ),
    radial-gradient(circle at top right, #1e1435 0, #0a0a14 50%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: var(--shadow-neon);
  position: relative;
  overflow: hidden;
}

.next-event-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.06), transparent 55%);
  opacity: 0.7;
  pointer-events: none;
}

.next-event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.next-event-header h2 {
  font-size: 15px;
  font-weight: 600;
}

.pill {
  font-size: 11px;
  padding: 4px 9px;
  border-radius: var(--radius-pill);
}

.pill-soft {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-soft);
}

.next-event-body {
  position: relative;
  z-index: 1;
}

.next-event-body.empty {
  color: var(--text-soft);
  font-size: 13px;
}

.next-event-title {
  font-size: 16px;
  font-weight: 650;
  margin-bottom: 6px;
}

.next-event-time {
  font-size: 13px;
  color: #e5e5ff;
  margin-bottom: 2px;
}

.next-event-remain {
  font-size: 12px;
  color: var(--accent2);
}

.today-list {
  margin-top: 18px;
  padding: 14px 13px 12px;
  border-radius: var(--radius-lg);
  background: rgba(8, 8, 18, 0.96);
  border: 1px solid var(--border-soft);
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 6px;
}

.section-header h2 {
  font-size: 14px;
  font-weight: 600;
}

.section-caption {
  font-size: 11px;
  color: var(--text-soft);
}

.event-list {
  list-style: none;
  margin-top: 6px;
}

.event-item {
  padding: 8px 10px 7px;
  border-radius: 10px;
  background: rgba(19, 19, 32, 0.9);
  border-left: 3px solid rgba(0, 255, 133, 0.7);
  margin-bottom: 6px;
  cursor: pointer;
  transition: background var(--duration-fast), transform var(--duration-fast),
    box-shadow var(--duration-fast);
}

.event-item:hover {
  background: rgba(29, 29, 52, 0.98);
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.55);
}

.event-title {
  font-size: 13px;
  font-weight: 500;
}

.event-meta {
  font-size: 11px;
  color: var(--text-soft);
  margin-top: 2px;
}

.empty-state {
  font-size: 12px;
  color: var(--text-soft);
  padding: 6px 2px 4px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
  padding-bottom: 6px;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border-radius: var(--radius-pill);
  background: rgba(10, 10, 20, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.month-nav span {
  font-size: 13px;
}

.nav-btn {
  border: none;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  font-size: 16px;
  padding: 2px 4px;
}

.calendar-wrapper {
  background: rgba(7, 7, 16, 0.98);
  border-radius: 18px;
  padding: 10px 10px 8px;
  border: 1px solid var(--border-soft);
}

.view-toggle {
  display: inline-flex;
  border-radius: var(--radius-pill);
  background: rgba(0, 0, 0, 0.35);
  padding: 2px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 6px;
}

.view-btn {
  border: none;
  background: transparent;
  color: var(--text-soft);
  font-size: 11px;
  padding: 4px 9px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast),
    transform var(--duration-fast);
}

.view-btn.active {
  background: linear-gradient(
    120deg,
    rgba(157, 0, 255, 0.9),
    rgba(0, 255, 133, 0.9)
  );
  color: #050509;
  font-weight: 500;
}

.multi-select-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
}

.small-btn {
  font-size: 10px;
  padding: 4px 10px;
}

.calendar-grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 10px;
  color: var(--text-soft);
  margin-bottom: 4px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.calendar-day {
  position: relative;
  padding: 6px 0;
  text-align: center;
  font-size: 12px;
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-soft);
  background: rgba(10, 10, 20, 0.9);
  border: 1px solid transparent;
  transition: background var(--duration-fast), color var(--duration-fast),
    border-color var(--duration-fast), transform var(--duration-fast),
    box-shadow var(--duration-fast);
}

.calendar-day.empty {
  background: transparent;
  border: none;
  cursor: default;
}

.calendar-day span {
  position: relative;
  z-index: 1;
}

.calendar-day.today {
  border-color: rgba(157, 0, 255, 0.7);
}

.calendar-day.selected {
  background: linear-gradient(
    135deg,
    rgba(157, 0, 255, 0.9),
    rgba(0, 255, 133, 0.9)
  );
  color: #050509;
  box-shadow: var(--shadow-neon);
}

.calendar-day.multi-selected:not(.selected) {
  background: rgba(0, 255, 133, 0.1);
  border-color: rgba(0, 255, 133, 0.7);
}

.calendar-day.has-events::after {
  content: "";
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent2);
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
}

.calendar-day:hover:not(.empty) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 255, 255, 0.12);
}

.selected-day-panel {
  margin-top: 10px;
  padding: 11px 12px 10px;
  background: rgba(7, 7, 16, 0.98);
  border-radius: 18px;
  border: 1px solid var(--border-soft);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.panel-title-wrap h2 {
  font-size: 14px;
  margin-bottom: 2px;
}

.primary-btn {
  border: none;
  border-radius: var(--radius-pill);
  padding: 8px 14px;
  font-size: 12px;
  background: linear-gradient(
    135deg,
    rgba(157, 0, 255, 0.95),
    rgba(0, 255, 133, 0.95)
  );
  color: #050509;
  cursor: pointer;
  font-weight: 600;
  box-shadow: var(--shadow-neon);
  transition: transform var(--duration-fast), box-shadow var(--duration-fast),
    filter var(--duration-fast);
}

.primary-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
}

.secondary-btn {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: var(--radius-pill);
  padding: 7px 13px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-soft);
  cursor: pointer;
  transition: background var(--duration-fast), border-color var(--duration-fast),
    transform var(--duration-fast);
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-1px);
}

.fab-btn {
  position: fixed;
  right: 22px;
  bottom: 68px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: radial-gradient(circle at 10% 0, #ffffff 0, #ffceff 18%, #9d00ff 58%);
  color: #050509;
  font-size: 26px;
  line-height: 0;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  transition: transform var(--duration-fast), box-shadow var(--duration-fast);
}

.fab-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.85);
}

.bottom-nav {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 10px;
  width: 100%;
  max-width: 480px;
  padding: 4px 12px 6px;
  display: flex;
  justify-content: center;
  gap: 10px;
  backdrop-filter: blur(16px);
  background: linear-gradient(
    180deg,
    rgba(5, 5, 12, 0) 0,
    rgba(5, 5, 12, 0.96) 25%
  );
}

.bottom-nav-btn {
  flex: 1;
  border: none;
  border-radius: var(--radius-pill);
  padding: 8px 0;
  font-size: 12px;
  color: var(--text-soft);
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast),
    box-shadow var(--duration-fast), transform var(--duration-fast);
}

.bottom-nav-btn.active {
  background: linear-gradient(
    135deg,
    rgba(157, 0, 255, 0.9),
    rgba(0, 255, 133, 0.9)
  );
  color: #050509;
  box-shadow: var(--shadow-neon);
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(5, 5, 12, 0.82);
  display: none;
  align-items: flex-end;
  justify-content: center;
  padding: 0 0 8px;
  z-index: 50;
}

.modal.show {
  display: flex;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  background: rgba(12, 12, 24, 0.98);
  border-radius: 18px 18px 0 0;
  padding: 14px 16px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 -10px 28px rgba(0, 0, 0, 0.7);
}

.modal-content h2 {
  font-size: 15px;
  margin-bottom: 8px;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.field span {
  font-size: 11px;
  color: var(--text-soft);
  margin-bottom: 4px;
}

.field input,
.field select,
.field textarea {
  background: rgba(5, 5, 15, 0.95);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 7px 9px;
  color: var(--text);
  font-size: 12px;
  outline: none;
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast),
    background var(--duration-fast);
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: rgba(0, 255, 133, 0.8);
  box-shadow: 0 0 0 1px rgba(0, 255, 133, 0.5);
  background: rgba(8, 8, 20, 0.98);
}

.field-row {
  display: flex;
  gap: 8px;
}

.field-row .field {
  flex: 1;
}

textarea {
  resize: vertical;
  min-height: 60px;
  max-height: 120px;
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.modal-actions-right {
  display: flex;
  gap: 8px;
}

.danger-btn {
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 77, 106, 0.85);
  background: rgba(255, 77, 106, 0.1);
  color: var(--danger);
  padding: 7px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background var(--duration-fast), transform var(--duration-fast);
}

.danger-btn:hover {
  background: rgba(255, 77, 106, 0.2);
  transform: translateY(-1px);
}

.hidden {
  display: none !important;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 5, 12, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}

.spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.16);
  border-top-color: var(--accent2);
  animation: spin 0.8s linear infinite;
}

.overlay.hidden {
  display: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .app-header {
    padding-top: 12px;
  }
}
