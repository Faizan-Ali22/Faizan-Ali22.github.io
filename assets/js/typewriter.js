/**
 * Typewriter Animation for Hero Section
 * Optimised for smooth 60fps on mobile and desktop.
 *
 * Perf notes:
 *  - Uses requestAnimationFrame + timestamp deltas instead of setTimeout
 *    so the browser can batch DOM writes with its paint cycle.
 *  - Pauses automatically when the tab is hidden (Page Visibility API)
 *    to avoid pointless work on mobile backgrounded tabs.
 *  - Writes to textContent (no innerHTML parsing) and only when the
 *    displayed string actually changes → minimal layout recalcs.
 */
(function () {
  'use strict';

  /* ── Config ───────────────────────────────────────────────────── */
  var TYPING_SPEED   = 80;    // ms per character when typing
  var ERASING_SPEED  = 40;    // ms per character when erasing
  var PAUSE_TYPED    = 2000;  // ms to hold the completed word
  var PAUSE_ERASED   = 400;   // ms before typing next word

  /* ── DOM ──────────────────────────────────────────────────────── */
  var el = document.getElementById('typewriter-text');
  if (!el || !window.TYPEWRITER_ROLES || !window.TYPEWRITER_ROLES.length) return;

  var roles     = window.TYPEWRITER_ROLES;
  var roleIdx   = 0;
  var charIdx   = 0;
  var erasing   = false;
  var paused    = false;       // true while waiting (hold / gap)
  var pauseEnd  = 0;           // timestamp when the current pause expires
  var lastTick  = 0;           // timestamp of the last character change
  var hidden    = false;       // page visibility flag
  var rafId     = 0;

  /* ── Visibility ───────────────────────────────────────────────── */
  function onVisibility() {
    hidden = document.hidden;
    if (!hidden && !rafId) {
      // Tab came back — restart the loop from now so we don't
      // fast-forward through all missed frames.
      lastTick = 0;
      pauseEnd = 0;
      rafId = requestAnimationFrame(loop);
    }
  }
  document.addEventListener('visibilitychange', onVisibility);

  /* ── Core loop ────────────────────────────────────────────────── */
  function loop(now) {
    rafId = 0;

    // Don't run when the tab is hidden — saves CPU/battery.
    if (hidden) return;

    // Handle pause state (hold after type / gap after erase)
    if (paused) {
      if (now < pauseEnd) {
        rafId = requestAnimationFrame(loop);
        return;
      }
      paused = false;
    }

    // Rate-limit character changes to the configured speed
    var interval = erasing ? ERASING_SPEED : TYPING_SPEED;
    if (lastTick && now - lastTick < interval) {
      rafId = requestAnimationFrame(loop);
      return;
    }
    lastTick = now;

    var role = roles[roleIdx];

    if (!erasing) {
      charIdx++;
      el.textContent = role.substring(0, charIdx);

      if (charIdx >= role.length) {
        erasing   = true;
        paused    = true;
        pauseEnd  = now + PAUSE_TYPED;
      }
    } else {
      charIdx--;
      el.textContent = role.substring(0, charIdx);

      if (charIdx <= 0) {
        erasing  = false;
        roleIdx  = (roleIdx + 1) % roles.length;
        paused   = true;
        pauseEnd = now + PAUSE_ERASED;
      }
    }

    rafId = requestAnimationFrame(loop);
  }

  /* ── Kick off ─────────────────────────────────────────────────── */
  rafId = requestAnimationFrame(loop);
})();
