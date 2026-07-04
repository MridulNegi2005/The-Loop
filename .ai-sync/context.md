# AI Agent Context Log
> This file is shared between Claude Code, Codex, and Antigravity.
> Each agent appends entries below when syncing. Read this to understand what other agents did.

---

## [2026-07-04 23:06] — System
**Task:** Initialized cross-agent sync
**Changes:** Created .ai-sync/ directory structure and bridge files
**Status:** completed
**Notes:** Project is now ready for multi-agent collaboration.

---

## [2026-07-04 23:08] — Claude Code
**Task:** Bug-fix + QoL pass on The Loop (campus event aggregator, React+Vite / FastAPI). Branch: `fixes/bugs-and-qol` (4 commits, NOT pushed — awaiting security-review gate).
**Changes:**
- Backend (`main.py`): enforce carpool capacity (reject join once accepted members ≥ capacity → 400); stabilize carpool `members` response shape (always set, `None` for non-owners); normalize timestamps to local wall-clock (strip `Z` from seed events, `datetime.now` for chat/friend rows; JWT expiry stays UTC).
- Frontend time handling: added `parseLocalDate`/`toLocalDateKey` in `src/lib/utils.js`; applied in date/time formatting, ICS/Google calendar export, EventList day-grouping, MapView sort/filter. Fixes events showing +5:30 off and off-by-a-day buckets. Works for legacy `Z` DB rows too.
- New toast system `src/lib/toast.jsx` (dependency-free singleton + `<Toaster/>` in `main.jsx`); replaced ALL `alert()`/`window.confirm()` across CarpoolModal, useChatSystem, App, ProfilePage (styled delete-confirm modal), AdminPortal.
- Bug fixes: carpool join now refreshes list + shows errors; guarded non-JSON error bodies; `encodeURIComponent` on user search; "Remind Me" persists to localStorage; chat header shows real online/offline (not hardcoded "Active now").
- Cleanup: removed debug console.logs (incl. Google client-id leak in main.jsx); deleted dead `src/App_backup.jsx` + `src/App_v2.jsx` (2,274 lines).
- Refactor: new `src/config/interests.js`, `src/config/campus.js`, `src/lib/mapStyles.js`; deduped interests + campus bounds/venues + Google Maps styles across App/MapView/AdminPortal/ProfilePage/WelcomeOnboarding.
**Status:** completed (verified) — NOT yet pushed.
**Notes:** Verified end-to-end against local backend on :8123 — carpool capacity 400 PASS, members shape PASS, timezone renders 2:00 PM not 7:30 PM PASS, `npm run build` PASS. Dev SQLite DB (`event_aggregator.db`) still holds legacy `Z`-suffixed rows (seeding only runs on empty DB) — handled by `parseLocalDate`. Env note: default Python here was missing `passlib`/`python-jose` (now installed). Per user's global rule: push requires a passing security-review over the diff first; commits intentionally carry NO AI co-author trailer.

---
