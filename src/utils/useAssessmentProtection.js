import { useEffect, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';

/**
 * Request fullscreen on the document element.
 */
export function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) {
    return el.requestFullscreen();
  } else if (el.webkitRequestFullscreen) {
    return el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    return el.msRequestFullscreen();
  }
  return Promise.resolve();
}

/**
 * Check if currently in fullscreen mode.
 */
export function isFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

/**
 * Hook that detects tab switches during assessment and enforces fullscreen.
 *
 * - 1st tab switch: SweetAlert warning
 * - 2nd tab switch: auto-submit (code editor) or logout
 *
 * @param {Object} options
 * @param {Function} options.onAutoSubmit - Called on 2nd violation if on code editor page
 * @param {boolean} options.isCodeEditorPage - Whether current page is the code editor
 * @param {boolean} options.enabled - Whether protection is active (default: true)
 */
export function useAssessmentProtection({
  onAutoSubmit,
  isCodeEditorPage = false,
  enabled = true,
  redirectUrl = null,
} = {}) {
  // Dev mode: skip all tab-switch detection when VITE_DEV_MODE is "true"
  const devMode = import.meta.env.VITE_DEV_MODE === 'true';

  const isProcessingRef = useRef(false);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  // Tracks whether a fullscreen transition is currently underway.
  // Chrome fires visibilitychange:'hidden' during fullscreen enter/exit, which
  // must NOT be counted as a real tab switch.
  const fullscreenTransitionRef = useRef(false);
  const fullscreenTransitionTimerRef = useRef(null);

  // Keep the callback ref up to date without re-registering the listener
  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  const handleVisibilityChange = useCallback(() => {
    if (!enabled || devMode || isProcessingRef.current) return;
    // Ignore visibility events caused by the browser entering/exiting fullscreen.
    if (fullscreenTransitionRef.current) return;

    // If the page is being refreshed/navigated away, visibilitychange fires 'hidden'
    // just like a real tab switch. Skip counting in that case.
    if (sessionStorage.getItem('_isUnloading') === 'true') return;

    if (document.visibilityState === 'hidden') {
      const count =
        parseInt(sessionStorage.getItem('tabSwitchCount') || '0', 10) + 1;
      sessionStorage.setItem('tabSwitchCount', count.toString());

      if (count >= 2) {
        isProcessingRef.current = true;

        if (isCodeEditorPage && onAutoSubmitRef.current) {
          // Show a brief alert then auto-submit
          Swal.fire({
            icon: 'error',
            title: 'Assessment Auto-Submitted',
            text: 'You switched tabs again. Your assessment has been automatically submitted.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33',
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: 3000,
            timerProgressBar: true,
          });
          onAutoSubmitRef.current('tab_switch');
        } else {
          // Not on code editor – just logout
          // Capture destination BEFORE clearing sessionStorage
          const destination = redirectUrl || sessionStorage.getItem('redirectUrl') || '/';
          Swal.fire({
            icon: 'error',
            title: 'Session Terminated',
            text: 'You switched tabs again. You have been logged out.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33',
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: 3000,
            timerProgressBar: true,
          }).then(() => {
            // Clear only after Swal closes so no route guard sees a missing userRole
            sessionStorage.removeItem('userRole');
            sessionStorage.removeItem('examEndTime');
            sessionStorage.removeItem('launchToken');
            sessionStorage.removeItem('tabSwitchCount');
            sessionStorage.removeItem('assessmentFullscreen');
            window.location.replace(destination);
          });
        }
      }
    } else if (
      document.visibilityState === 'visible' &&
      !isProcessingRef.current
    ) {
      const count = parseInt(
        sessionStorage.getItem('tabSwitchCount') || '0',
        10
      );

      if (count === 1) {
        Swal.fire({
          icon: 'warning',
          title: 'Tab Switch Detected',
          html: `
            <p style="font-size: 15px; color: #555; margin-bottom: 8px;">
              Switching tabs or windows during the assessment is <strong>strictly prohibited</strong>.
            </p>
            <p style="font-size: 15px; color: #d33;">
              <strong>Warning:</strong> On the next tab switch, your assessment will be automatically submitted and you will be logged out.
            </p>
          `,
          confirmButtonText: 'I Understand',
          confirmButtonColor: '#7c3aed',
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          // Re-enter fullscreen after user acknowledges
          if (!isFullscreen()) {
            enterFullscreen().catch(() => {});
          }
        });
      }
    }
  }, [enabled, devMode, isCodeEditorPage]);

  useEffect(() => {
    if (!enabled || devMode) return;

    // After a refresh the page reloads fresh — clear the unload flag so
    // subsequent real tab switches are detected correctly.
    sessionStorage.removeItem('_isUnloading');

    // Suppress visibilitychange events that are caused by fullscreen transitions.
    // Chrome (and some other browsers) fire visibilitychange:'hidden' when the
    // page enters or exits fullscreen, which must not be treated as a tab switch.
    const handleFullscreenChange = () => {
      fullscreenTransitionRef.current = true;
      if (fullscreenTransitionTimerRef.current) {
        clearTimeout(fullscreenTransitionTimerRef.current);
      }
      fullscreenTransitionTimerRef.current = setTimeout(() => {
        fullscreenTransitionRef.current = false;
      }, 1000); // 1 s grace period — fullscreen transitions typically finish within 300 ms
    };

    // Try to maintain fullscreen on mount (works if triggered by prior user gesture)
    if (
      !isFullscreen() &&
      sessionStorage.getItem('assessmentFullscreen') === 'true'
    ) {
      // Mark that a fullscreen transition is starting BEFORE requesting fullscreen
      // so any immediately-fired visibilitychange is suppressed.
      handleFullscreenChange();
      enterFullscreen().catch(() => {});
    }

    // Mark the session as "unloading" on refresh/navigation so the
    // visibilitychange handler does not count it as a tab switch.
    const handleBeforeUnload = () => {
      sessionStorage.setItem('_isUnloading', 'true');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (fullscreenTransitionTimerRef.current) {
        clearTimeout(fullscreenTransitionTimerRef.current);
      }
    };
  }, [enabled, handleVisibilityChange]);
}
