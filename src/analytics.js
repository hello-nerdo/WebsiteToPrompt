function drop_spaces(str) {
  return str.replace(/\s+/g, '');
}
function drop_space(str) {
  return str.replace(/\s+/g, '');
}

const GA_PART1 = drop_space(process.env.GA_PART1)
const GA_PART2 = process.env.GA_PART2
const GA_PART3 = drop_spaces(process.env.GA_PART3)
const GA_PART4 = drop_spaces(process.env.GA_PART4)
const GA_PART5 = process.env.GA_PART5
const GA_PART10 = drop_spaces(process.env.GA_PART10)

const PARTA = GA_PART1 + drop_spaces(GA_PART2) + GA_PART3 + GA_PART4 
const GA_PART6 = drop_space(process.env.GA_PART6)

// GA endpoint for sending events
const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

// Session settings
const SESSION_EXPIRATION_IN_MIN = 30;
const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100;

const GA_PART7 = drop_spaces(process.env.GA_PART7)
const GA_PART8 = drop_spaces(process.env.GA_PART8)
const GA_PART9 = process.env.GA_PART9
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
const PARTB = drop_spaces(GA_PART5) + GA_PART6 + drop_space(GA_PART7) + GA_PART8 + drop_spaces(GA_PART9) + drop_spaces(GA_PART10)

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
    if (GA_PART2.length > 0) {
      console.log('API_SECRET', GA_PART2);
      await fetch(`${GA_ENDPOINT}?measurement_id=${PARTA}&api_secret=${PARTB}`, {
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
