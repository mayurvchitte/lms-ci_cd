import { useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { serverUrl } from '../App';

const useScreenshotPrevention = (lectureId = null) => {
  useEffect(() => {
    const reportViolation = async (violationType) => {
      if (lectureId) {
        try {
          const res = await axios.post(`${serverUrl}/api/live/report-violation`, {
            lectureId,
            violationType
          }, { withCredentials: true });
          return res
        } catch (error) {
          console.error('Failed to report violation:', error);
          throw error
        }
      }
    };

    const showWarning = async (message, violationType = null) => {
      toast.error(message, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Report violation to server if lectureId is provided
      if (violationType) {
        try {
          await reportViolation(violationType);

          // After successful server logging, force client logout so the
          // user is immediately kicked out even if they don't make
          // further API calls. Add a tiny delay so the toast is visible.
          setTimeout(async () => {
            try {
              await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
            } catch (e) {
              // ignore logout errors
            }
            // Redirect to login page to clear frontend state
            window.location.replace('/');
          }, 1400);
        } catch (err) {
          // reporting failed; still log error but don't force logout
          console.error('Error reporting violation before logout:', err);
        }
      }
    };

    const logoutWithoutWarning = async (violationType) => {
      // Report violation to server if lectureId is provided
      if (violationType) {
        try {
          await reportViolation(violationType);

          // Force client logout without warning
          setTimeout(async () => {
            try {
              await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
            } catch (e) {
              // ignore logout errors
            }
            // Redirect to login page to clear frontend state
            window.location.replace('/');
          }, 1400);
        } catch (err) {
          // reporting failed; still log error but don't force logout
          console.error('Error reporting violation before logout:', err);
        }
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      // Prevent Print Screen
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        navigator.clipboard.writeText('').catch(() => {});
        lastScreenshotKeyPressTs = Date.now();
        showWarning('Screenshots are disabled on this page.', 'screenshot');
      }
      // Prevent Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        showWarning('Printing is disabled.');
      }
      // Prevent Ctrl+S (Save Page)
      // if (e.ctrlKey && e.key === 's') {
      //   e.preventDefault();
      //   showWarning('Saving is disabled.');
      // }
      // // Prevent Ctrl+U (View Source)
      // if (e.ctrlKey && e.key === 'u') {
      //   e.preventDefault();
      //   showWarning('Viewing source is disabled.');
      // }
      // // Prevent Ctrl+Shift+I (Inspect Element)
      // if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      //   e.preventDefault();
      //   showWarning('Inspecting elements is disabled.');
      // }
      // Prevent F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        showWarning('Developer tools are disabled.');
      }
      // Prevent Alt+PrintScreen
      if (e.altKey && e.key === 'PrintScreen') {
        e.preventDefault();
        lastScreenshotKeyPressTs = Date.now();
        showWarning('Screenshots are disabled on this page.', 'screenshot');
      }
      // Prevent Windows+Shift+S (Snip & Sketch)
      if (e.shiftKey && e.key === 'S' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        lastScreenshotKeyPressTs = Date.now();
        console.log('Snip tool detected', e);
        logoutWithoutWarning('screenshot');
      }
      // Prevent Ctrl+Shift+S (Snip tool alternative)
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        lastScreenshotKeyPressTs = Date.now();
        showWarning('Screen recordings are disabled on this page.', 'screenshot');
      }
      // Prevent Alt+Shift+S (Another snip variant)
      if (e.altKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        lastScreenshotKeyPressTs = Date.now();
        showWarning('Screenshots are disabled on this page.', 'screenshot');
      }
      // Prevent Shift+S
      if (e.shiftKey && e.key === 'S' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        console.log('Shift+S pressed', e);
        logoutWithoutWarning('screenshot');
        showWarning('Screenshots are disabled on this page.', 'screenshot');
      }
      // Prevent Windows+S
      if (e.metaKey && e.key === 'S' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        console.log('Windows+S pressed', e);
        logoutWithoutWarning('screenshot');
        showWarning('Screenshots are disabled on this page.', 'screenshot');
      }
      // Prevent Windows+Shift
      if (e.metaKey && e.key === 'Shift' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        console.log('Windows+Shift pressed', e);
        logoutWithoutWarning('screenshot');
        showWarning('Screenrecordings are disabled on this page.', 'screen recording');
      }
    };

    const handleKeyUp = (e) => {
      // Catch Print Screen on keyup as well
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        lastScreenshotKeyPressTs = Date.now();
        showWarning('Screenshots are disabled on this page.', 'screenshot');
      }
    };

    const handleSelectStart = (e) => {
      e.preventDefault();
    };

    const handleCopy = (e) => {
      e.preventDefault();
      showWarning('Copying is disabled.');
    };

    const handleDragStart = (e) => {
      e.preventDefault();
    };

    // Add event listeners to window for better capture
    //window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('dragstart', handleDragStart);

    // NOTE: Browsers do not provide a reliable way to detect external
    // screen recording. Previously we used the window 'blur' event which
    // created false positives when users switched tabs or focused another
    // app. To avoid that, we listen for explicit custom events that
    // the application can dispatch when it starts/stops a display-capture
    // MediaStream (i.e. when calling getDisplayMedia). This keeps
    // warnings accurate and under the app's control.

    let displayCaptureActive = false;
  let lastScreenshotKeyPressTs = 0;

  const RECENT_KEY_WINDOW = 2000; // ms; if visibilitychange happens within this window after a keypress, treat as screenshot

    const handleDisplayCaptureStarted = (e) => {
      displayCaptureActive = true;
      // Show a warning immediately when the app starts display capture
      // If you prefer a different UX (e.g., a persistent banner), replace
      // this toast with your UI component.
      showWarning('Screen recording is active. Capturing or sharing the screen is not allowed.', 'screen_recording');
    };

    const handleDisplayCaptureStopped = (e) => {
      displayCaptureActive = false;
    };

    // When the page becomes hidden (e.g., user opened Snip tool), check if
    // this happened immediately after a screenshot-like keypress. Many
    // snipping tools trigger a visibilitychange without delivering a usable
    // keydown to the page; this heuristic reduces false positives while
    // catching snip usage in most browsers.
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const now = Date.now();
        const recentKey = (now - lastScreenshotKeyPressTs) <= RECENT_KEY_WINDOW;
        // If the user recently pressed a screenshot/snipping key, treat this
        // as a screenshot/snipping action even if display-capture is also
        // active. This avoids classifying a snip (Win+Shift+S) as a
        // screen-recording event.
        if (recentKey) {
          showWarning('Screenshots are disabled on this page.', 'screenshot');
        } else if (displayCaptureActive) {
          showWarning('Screen recording is active. Capturing or sharing the screen is not allowed.', 'screen_recording');
        }
      }
    };

  document.addEventListener('visibilitychange', handleVisibilityChange);

    window.addEventListener('display-capture-started', handleDisplayCaptureStarted);
    window.addEventListener('display-capture-stopped', handleDisplayCaptureStopped);

    // Cleanup on unmount
    return () => {
      //window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('display-capture-started', handleDisplayCaptureStarted);
      window.removeEventListener('display-capture-stopped', handleDisplayCaptureStopped);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};

export default useScreenshotPrevention;
