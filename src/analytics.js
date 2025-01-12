/* -----------------------------------------
   WebsiteToPrompt/analytics.js
   -----------------------------------------
   Helper functions to send Google Analytics 4 events via the Measurement Protocol.
   Replace MEASUREMENT_ID and API_SECRET with your real GA4 credentials.
------------------------------------------ */

const MEASUREMENT_ID = 'G-J2X33F3Z0N';
const API_SECRET = '';

// GA endpoint for sending events
const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

// Session settings
const SESSION_EXPIRATION_IN_MIN = 30;
const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100;

/**
 * Retrieve or generate a unique client_id for this user/browser
 * Store in chrome.storage.local so it persists across browser restarts.
 */
async function getOrCreateClientId() {
  const result = await chrome.storage.local.get('clientId');
  let clientId = result.clientId;
  if (!clientId) {
    clientId = self.crypto.randomUUID();
    await chrome.storage.local.set({ clientId });
  }
  return clientId;
}

/**
 * Retrieve or create a session_id for Realtime and standard GA4 reports.
 * We'll store it in chrome.storage.session so it resets if the browser is closed.
 */
async function getOrCreateSessionId() {
  let { sessionData } = await chrome.storage.session.get('sessionData');
  const currentTimeInMs = Date.now();

  if (sessionData && sessionData.timestamp) {
    const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
    if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
      // Expired session
      sessionData = null;
    } else {
      // Keep the current session alive
      sessionData.timestamp = currentTimeInMs;
      await chrome.storage.session.set({ sessionData });
    }
  }

  // Create a new session if none active
  if (!sessionData) {
    sessionData = {
      session_id: currentTimeInMs.toString(),
      timestamp: currentTimeInMs,
    };
    await chrome.storage.session.set({ sessionData });
  }

  return sessionData.session_id;
}

/**
 * Send a single GA4 event using the Measurement Protocol.
 *
 * @param {string} eventName - The event name, e.g. 'toggle_selection_mode'
 * @param {object} eventParams - Any key-value pairs you want to attach
 */
export async function trackEvent(eventName, eventParams = {}) {
  try {
    const clientId = await getOrCreateClientId();
    const sessionId = await getOrCreateSessionId();

    const payload = {
      client_id: clientId,
      events: [
        {
          name: eventName,
          params: {
            ...eventParams,
            session_id: sessionId,
            engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
          },
        },
      ],
    };

    // if API_SECRET is not empty, fetch else don't
    if (API_SECRET) {
      await fetch(`${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log(`[GA4] Event sent: ${eventName}`, eventParams);
    } else {
      console.warn('[GA4] API_SECRET is empty, skipping fetch');
    }
  } catch (error) {
    console.error(`[GA4] Error sending event: ${eventName}`, error);
  }
}
