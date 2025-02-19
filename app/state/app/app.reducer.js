import APP_CONSTANTS from './app.constants';
import config from '../../config';

export const initialState = {
  /**
   * The URL to the HTTP API server.
   *
   * @type {string}
   */
  apiHost: config.defaultApiHost,

  /**
   * The current skin (theme) for the app.
   *
   * @type {object}
   * @property {string} name the name of the skin.
   * @property {object} colors the current colors.
   * @property {string} colors.primary the primary color.
   * @property {string} colors.secondary the secondary color.
   */
  skin: config.defaultSkin,

  /**
   * The ID of the current applet.
   *
   * @type {string}
   */
  currentApplet: null,

  /**
   * The ID of the current activity.
   *
   * @type {string}
   */
  currentActivity: null,

  /**
   * The ID of the current activity.
   *
   * @type {string}
   */
  currentEvent: null,

  /**
   * Whether the applet cards are disabled.
   *
   * @type {boolean}.
   */
  appletSelectionDisabled: false,

  /**
   * Whether the activity cards are disabled.
   *
   * @type {boolean}.
   */
  activitySelectionDisabled: false,

  /**
   * If false, applet data will only be downloaded using Wi-Fi.
   *
   * @type {boolean}
   */
  mobileDataAllowed: true,

  /**
   * True if the application is in the foreground, false otherwise.
   *
   * @type {boolean}
   */
  appStatus: true,

  /**
   * timestamp for app was open last time
   *
   * @type {Number}
   */
  lastActive: new Date().getTime(),

  /**
   * app language code
   *
   * @type {string}
   */
  appLanguage: 'en',

  /**
   * Maps applet IDs to the last time the schedule was fetched for that applet.
   *
   * @type {object}
   */
  lastUpdatedTime: {},

  /**
   * Times activities started
   *
   * @type {object}
   */
  startedTimes: {},

  /**
   * Times activities finished
   *
   * @type {object}
   */
  finishedTimes: {},

  /**
   * Connection status
   *
   * @type {boolean}
   */
  isConnected: true,

  /**
   * A/BTrails tutorial status
   *
   * @type {number}
   */
  isTutorial: 1,

  /**
   * A/BTrails tutorial index
   *
   * @type {number}
   */
  tutorialIndex: 0,

  /**
   * A/BTrails timer id
   *
   * @type {number}
   */
  trailsTimerId: null,

  /**
   * Completed events
   *
   * @type {object}
   */
  finishedEvents: {},
  activities: [],
  tcpConnectionHistory: {},
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case APP_CONSTANTS.SET_API_HOST:
      return {
        ...state,
        apiHost: action.payload,
      };
    case APP_CONSTANTS.SET_CONNECTION:
      return {
        ...state,
        isConnected: action.payload,
      }
    case APP_CONSTANTS.SET_TRAILS_TIMER_ID:
      return {
        ...state,
        trailsTimerId: action.payload,
      }
    case APP_CONSTANTS.SET_TUTORIAL_INDEX:
      return {
        ...state,
        tutorialIndex: action.payload,
      }
    case APP_CONSTANTS.SET_TUTORIAL_STATUS:
      return {
        ...state,
        isTutorial: action.payload,
      }
    case APP_CONSTANTS.SET_UPDATED_TIME:
      return {
        ...state,
        lastUpdatedTime: action.payload,
      };
    case APP_CONSTANTS.RESET_API_HOST:
      return {
        ...state,
        apiHost: initialState.apiHost,
      };
    case APP_CONSTANTS.SET_ACTIVITY_END_TIME:
      return {
        ...state,
        finishedTimes: {
          ...state.finishedTimes,
          [action.payload]: Date.now()
        },
      };
    case APP_CONSTANTS.SET_ACTIVITY_START_TIME:
      return {
        ...state,
        startedTimes: {
          ...state.startedTimes,
          [action.payload]: Date.now()
        },
      };
    case APP_CONSTANTS.CLEAR_ACTIVITY_START_TIME:
      return {
        ...state,
        startedTimes: {
          ...state.startedTimes,
          [action.payload]: "",
        },
      }
    case APP_CONSTANTS.SET_APP_STATUS:
      return {
        ...state,
        appStatus: action.payload,
      };
    case APP_CONSTANTS.SET_LAST_ACTIVE_TIME:
      return {
        ...state,
        lastActive: action.payload,
      }
    case APP_CONSTANTS.SET_SKIN:
      return {
        ...state,
        skin: action.payload,
      };
    case APP_CONSTANTS.SET_CLOSED_EVENT:
      return {
        ...state,
        finishedEvents: {
          ...state.finishedEvents,
          ...action.payload
        }
      }
    case APP_CONSTANTS.SET_CURRENT_APPLET:
      return {
        ...state,
        currentApplet: action.payload,
      };
    case APP_CONSTANTS.SET_CURRENT_ACTIVITY:
      return {
        ...state,
        currentActivity: action.payload,
      };
    case APP_CONSTANTS.SET_CURRENT_EVENT:
      return {
        ...state,
        currentEvent: action.payload,
      };
    case APP_CONSTANTS.SET_APPLET_SELECTION_DISABLED:
      return {
        ...state,
        appletSelectionDisabled: action.payload,
      };
    case APP_CONSTANTS.SET_ACTIVITY_SELECTION_DISABLED:
      return {
        ...state,
        activitySelectionDisabled: action.payload,
      };
    case APP_CONSTANTS.TOGGLE_MOBILE_DATA_ALLOWED:
      return {
        ...state,
        mobileDataAllowed: !state.mobileDataAllowed,
      };
    case APP_CONSTANTS.SET_APP_LANGUAGE:
      return {
        ...state,
        appLanguage: action.payload,
      };
    case APP_CONSTANTS.SET_TCP_CONNECTION_HISTORY:
      return {
        ...state,
        tcpConnectionHistory: action.payload
      }
    default:
      return state;
  }
};
