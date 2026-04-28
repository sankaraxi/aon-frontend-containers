import { useEffect, useRef } from 'react';
import axios from 'axios';

const HEARTBEAT_INTERVAL_MS = 10000; // send heartbeat every 10 seconds
const BACKEND = import.meta.env.VITE_BACKEND_API_URL;

/**
 * Maintains a single-tab lock for an assessment session.
 *
 * - Sends a heartbeat immediately on mount and every 10 s thereafter.
 * - Sends a heartbeat on visibilitychange only when the tab becomes VISIBLE
 *   (foreground) — NOT on 'hidden', to avoid racing with the release on close.
 * - On eviction, tries to re-claim once before actually navigating away
 *   (guards against false-positive stale detection).
 * - Releases the slot via fetch({ keepalive: true }) on both beforeunload AND
 *   pagehide (deduplicated) so the slot is freed reliably for both tab close
 *   and full browser-window close. Does NOT fire for React Router navigation.
 */
export function useTabClaim({ launchTokenId, tabId, enabled = true, onEvicted }) {
  const heartbeatRef = useRef(null);
  const onEvictedRef = useRef(onEvicted);
  onEvictedRef.current = onEvicted;

  useEffect(() => {
    if (!enabled || !launchTokenId || !tabId) return;

    let aborted = false;

    const sendHeartbeat = async () => {
      if (aborted) return;
      try {
        const res = await axios.post(`${BACKEND}/aon/tab-heartbeat`, {
          launchTokenId,
          tabId,
        });
        if (res.data?.status === 'evicted') {
          // Before logging out, try to re-claim the slot.
          // This handles false-positive stale detection caused by
          // browser background-tab throttling.
          try {
            const reclaimRes = await axios.post(`${BACKEND}/aon/claim-tab`, {
              launchTokenId,
              tabId,
            });
            if (reclaimRes.data?.status === 'allowed') {
              return; // Successfully re-claimed — stay in assessment
            }
          } catch (_) {
            // Ignore re-claim network errors
          }
          // Another tab genuinely holds the slot
          if (!aborted) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
            onEvictedRef.current?.();
          }
        }
      } catch (e) {
        // Network hiccup — keep trying on next interval
        console.warn('Tab heartbeat failed:', e.message);
      }
    };

    // Fire immediately on mount so the timestamp is fresh
    sendHeartbeat();

    // Periodic heartbeat
    heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    // Only send a heartbeat when the tab becomes VISIBLE (foreground).
    // We intentionally do NOT heartbeat on the 'hidden' transition because
    // visibilitychange(hidden) fires BEFORE beforeunload/pagehide on window
    // close — refreshing the heartbeat at that point races with the release
    // beacon and can leave the slot looking alive if the beacon fails.
    // The 10 s periodic heartbeat already keeps the slot fresh enough (<<60 s
    // timeout) to block any competing tab attempting to claim it.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Release the slot when the tab/window is actually closed.
    // NOTE: beforeunload / pagehide do NOT fire for in-app React Router navigation.
    //
    // Strategy:
    //  1. fetch({ keepalive: true }) — outlives the page, works for full browser close.
    //  2. sendBeacon (JSON Blob) — fallback if keepalive fetch is unavailable.
    //  3. releaseSent flag deduplicates the two listeners (beforeunload + pagehide).
    let releaseSent = false;
    const sendRelease = () => {
      if (releaseSent) return;
      releaseSent = true;
      const body = JSON.stringify({ launchTokenId: String(launchTokenId), tabId });
      try {
        // keepalive: true lets the browser complete the request even after the
        // page has been unloaded / the window is closing.
        fetch(`${BACKEND}/aon/release-tab`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        });
      } catch (_) {
        // Final fallback: sendBeacon with a JSON Blob so express.json() parses it.
        try {
          navigator.sendBeacon(
            `${BACKEND}/aon/release-tab`,
            new Blob([body], { type: 'application/json' }),
          );
        } catch (_) {
          // Ignore — best-effort only
        }
      }
    };

    // beforeunload: fires for tab close AND window/browser close.
    window.addEventListener('beforeunload', sendRelease);
    // pagehide: fires more reliably than beforeunload on full browser close
    // and on mobile browser backgrounding. Acts as a backup.
    window.addEventListener('pagehide', sendRelease);

    return () => {
      aborted = true;
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', sendRelease);
      window.removeEventListener('pagehide', sendRelease);
    };
  }, [enabled, launchTokenId, tabId]);
}
