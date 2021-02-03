import * as R from "ramda";
import moment from 'moment';
import { Parse, Day } from 'dayspan';
import { getLastScheduled, getNextScheduled, getScheduledNotifications } from '../services/time';

const ALLOW = "reprolib:terms/allow";
const ABOUT = "reprolib:terms/landingPage";
const ABOUT_CONTENT = "reprolib:terms/landingPageContent";
const ALT_LABEL = "http://www.w3.org/2004/02/skos/core#altLabel";
const AUDIO_OBJECT = "schema:AudioObject";
const AUTO_ADVANCE = "reprolib:terms/auto_advance";
const BACK_DISABLED = "reprolib:terms/disable_back";
const CONTENT_URL = "schema:contentUrl";
const DELAY = "reprolib:terms/delay";
const DESCRIPTION = "schema:description";
const DO_NOT_KNOW = "reprolib:terms/dont_know_answer";
const ENCODING_FORMAT = "schema:encodingFormat";
const FULL_SCREEN = "reprolib:terms/full_screen";
const IMAGE = "schema:image";
const IMAGE_OBJECT = "schema:ImageObject";
const INPUT_TYPE = "reprolib:terms/inputType";
const INPUTS = "reprolib:terms/inputs";
const IS_ABOUT = "reprolib:terms/isAbout";
const ITEM_LIST_ELEMENT = "schema:itemListElement";
const MAX_VALUE = "schema:maxValue";
const MEDIA = "reprolib:terms/media";
const MIN_VALUE = "schema:minValue";
const MULTIPLE_CHOICE = "reprolib:terms/multipleChoice";
const SCORING = "reprolib:terms/scoring";
const VALUE_TYPE = "reprolib:terms/valueType";
const NAME = "schema:name";
const PREAMBLE = "reprolib:terms/preamble";
const PREF_LABEL = "http://www.w3.org/2004/02/skos/core#prefLabel";
const QUESTION = "schema:question";
const REFUSE_TO_ANSWER = "reprolib:terms/refused_to_answer";
const REQUIRED_VALUE = "reprolib:terms/required";
const SCHEMA_VERSION = "schema:schemaVersion";
const SCORING_LOGIC = "reprolib:terms/scoringLogic";
const SHUFFLE = "reprolib:terms/shuffle";
const ISPRIZE = "reprolib:terms/isPrize";
const TIMER = "reprolib:terms/timer";
const TRANSCRIPT = "schema:transcript";
const URL = "schema:url";
const VALUE = "schema:value";
const PRICE = "schema:price";
const SCORE = "schema:score";
const CORRECT_ANSWER = "schema:correctAnswer";
const RESPONSE_OPTIONS = "reprolib:terms/responseOptions";
const VARIABLE_NAME = "reprolib:terms/variableName";
const JS_EXPRESSION = "reprolib:terms/jsExpression";
const VERSION = "schema:version";
const IS_VIS = "reprolib:terms/isVis";
const ADD_PROPERTIES = "reprolib:terms/addProperties";
const COMPUTE = "reprolib:terms/compute";
const SUBSCALES = "reprolib:terms/subScales";
const MESSAGES = "reprolib:terms/messages";
const MESSAGE = "reprolib:terms/message";
const LOOKUP_TABLE = "reprolib:terms/lookupTable";
const AGE = "reprolib:terms/age";
const RAW_SCORE = "reprolib:terms/rawScore";
const SEX = "reprolib:terms/sex";
const T_SCORE = "reprolib:terms/tScore";
const OUTPUT_TYPE = "reprolib:terms/outputType";
const RESPONSE_ALERT = "reprolib:terms/responseAlert";
const RESPONSE_ALERT_MESSAGE = "reprolib:terms/responseAlertMessage";

export const ORDER = "reprolib:terms/order";

export const languageListToObject = (list) => {
  if (
    typeof list === "undefined" ||
    typeof list === "string" ||
    list.length === 0
  ) {
    return undefined;
  }
  return list.reduce(
    (obj, item) => ({
      ...obj,
      [item["@language"]]: item["@value"],
    }),
    {}
  );
};

export const listToObject = (list = []) =>
  list.reduce(
    (obj, item) => ({
      ...obj,
      [item["@index"]]: item["@value"],
    }),
    {}
  );

export const listToVisObject = (list = []) =>
  list.reduce(
    (obj, item) => ({
      ...obj,
      [item[VARIABLE_NAME][0]["@value"]]: item[IS_VIS] ? item[IS_VIS][0]["@value"] : true,
    }),
    {}
  );

export const listToValue = (list = []) =>
  list.length > 0 ? list[0]["@value"] : undefined;

export const flattenIdList = (list = []) => list.map((item) => item["@id"]);

export const flattenItemList = (list = []) =>
  list.map((item) => ({
    name: languageListToObject(item[NAME]),
    value: R.path([VALUE, 0, "@value"], item),
    price: R.path([PRICE, 0, "@value"], item),
    score: R.path([SCORE, 0, "@value"], item),
    description: R.path([DESCRIPTION, 0, "@value"], item),
    image: item[IMAGE],
    valueConstraints: item[RESPONSE_OPTIONS]
      ? flattenValueConstraints(R.path([RESPONSE_OPTIONS, 0], item))
      : undefined,
  }));

export const flattenValueConstraints = (vcObj) =>
  Object.keys(vcObj).reduce((accumulator, key) => {
    if (key === '@type') {
      return { ...accumulator, valueType: R.path([key, 0], vcObj) };
    }
    if (key === MAX_VALUE) {
      return { ...accumulator, maxValue: R.path([key, 0, "@value"], vcObj) };
    }
    if (key === MIN_VALUE) {
      return { ...accumulator, minValue: R.path([key, 0, "@value"], vcObj) };
    }
    if (key === MULTIPLE_CHOICE) {
      return {
        ...accumulator,
        multipleChoice: R.path([key, 0, "@value"], vcObj),
      };
    }
    if (key == SCORING) {
      return {
        ...accumulator,
        scoring: R.path([key, 0, "@value"], vcObj),
      };
    }
    if (key == RESPONSE_ALERT) {
      return {
        ...accumulator,
        responseAlert: R.path([key, 0, "@value"], vcObj),
      }
    }
    if (key == RESPONSE_ALERT_MESSAGE) {
      return {
        ...accumulator,
        responseAlertMessage: R.path([key, 0, "@value"], vcObj),
      }
    }
    if (key === VALUE_TYPE) {
      return {
        ...accumulator,
        valueType: R.path([key, 0, "@id"], vcObj),
      };
    }
    if (key === ITEM_LIST_ELEMENT) {
      const itemList = R.path([key], vcObj);
      return { ...accumulator, itemList: flattenItemList(itemList) };
    }
    if (key === REQUIRED_VALUE) {
      return { ...accumulator, required: R.path([key, 0, "@value"], vcObj) };
    }
    if (key === IMAGE) {
      return { ...accumulator, image: vcObj[key] };
    }
    return accumulator;
  }, {});

export const transformInputs = (inputs) =>
  inputs.reduce((accumulator, inputObj) => {
    const key = R.path([NAME, 0, "@value"], inputObj);
    let val = R.path([VALUE, 0, "@value"], inputObj);

    if (typeof val === "undefined" && inputObj[ITEM_LIST_ELEMENT]) {
      const itemList = R.path([ITEM_LIST_ELEMENT], inputObj);
      val = flattenItemList(itemList);
    }

    if (inputObj["@type"].includes(AUDIO_OBJECT)) {
      val = {
        contentUrl: languageListToObject(inputObj[CONTENT_URL]),
        transcript: languageListToObject(inputObj[TRANSCRIPT]),
      };
    }

    if (inputObj["@type"].includes(IMAGE_OBJECT)) {
      val = {
        contentUrl: languageListToObject(inputObj[CONTENT_URL]),
      };
    }

    return {
      ...accumulator,
      [key]: val,
    };
  }, {});

export const transformVariableMap = (variableAr) =>
  variableAr.reduce((accumulator, item) => {
    const val = R.path([VARIABLE_NAME, 0, "@value"], item);
    const key = R.path([IS_ABOUT, 0, "@id"], item);
    return {
      ...accumulator,
      [key]: val,
    };
  }, {});

export const flattenLookupTable = (lookupTable) => {
  if (!Array.isArray(lookupTable)) {
    return undefined;
  }

  const references = {
    [AGE]: 'age',
    [RAW_SCORE]: 'rawScore',
    [SEX]: 'sex',
    [T_SCORE]: 'tScore'
  };

  return R.map(row => Object.keys(references).reduce((previousValue, key) => {
    return {
      ...previousValue,
      [references[key]]: R.path([key, 0, "@value"], row)
    }
  }, {}), lookupTable)
}

export const transformMedia = (mediaObj) => {
  if (typeof mediaObj === "undefined") {
    return undefined;
  }

  const keys = Object.keys(mediaObj);
  return keys.map((key) => {
    const media = mediaObj[key];
    return {
      contentUrl: R.path([0, CONTENT_URL, 0, "@value"], media),
      transcript: R.path([0, TRANSCRIPT, 0, "@value"], media),
      encodingType: R.path([0, ENCODING_FORMAT, 0, "@value"], media),
      name: R.path([0, NAME, 0, "@value"], media),
    };
  });
};

export const isSkippable = (allowList) => {
  if (allowList.includes(REFUSE_TO_ANSWER)) {
    return true;
  }
  if (allowList.includes(DO_NOT_KNOW)) {
    return true;
  }
  return false;
};

export const itemTransformJson = (itemJson) => {
  // For items, 'skippable' is undefined if there's no ALLOW prop
  const allowList = flattenIdList(R.path([ALLOW, 0, "@list"], itemJson));
  const skippable = isSkippable(allowList) ? true : undefined;

  const valueConstraintsObj = R.pathOr({}, [RESPONSE_OPTIONS, 0], itemJson);
  const valueConstraints = flattenValueConstraints(valueConstraintsObj);

  const inputs = R.pathOr([], [INPUTS], itemJson);
  const inputsObj = transformInputs(inputs);

  const media = transformMedia(R.path([MEDIA, 0], itemJson));

  const res = {
    id: itemJson._id,
    description: languageListToObject(itemJson[DESCRIPTION]),
    correctAnswer: languageListToObject(itemJson[CORRECT_ANSWER]),
    schemaVersion: languageListToObject(itemJson[SCHEMA_VERSION]),
    version: languageListToObject(itemJson[VERSION]),
    altLabel: languageListToObject(itemJson[ALT_LABEL]),
    inputType: listToValue(itemJson[INPUT_TYPE]),
    question: languageListToObject(itemJson[QUESTION]),
    preamble: languageListToObject(itemJson[PREAMBLE]),
    timer: R.path([TIMER, 0, "@value"], itemJson),
    delay: R.path([DELAY, 0, "@value"], itemJson),
    valueConstraints,
    skippable,
    fullScreen: allowList.includes(FULL_SCREEN),
    backDisabled: allowList.includes(BACK_DISABLED),
    autoAdvance: allowList.includes(AUTO_ADVANCE),
    inputs: inputsObj,
    media,
  };

  return res;
};

export const itemAttachExtras = (
  transformedItem,
  schemaUri,
  addProperties = {},
) => ({
  ...transformedItem,
  schema: schemaUri,
  variableName: R.path([0, "@value"], addProperties[VARIABLE_NAME]),
  visibility: R.path([0, "@value"], addProperties[IS_VIS]),
});

const SHORT_PREAMBLE_LENGTH = 90;

export const attachPreamble = (preamble, items) => {
  const text = preamble ? preamble.en : "";
  if (text && text.length > SHORT_PREAMBLE_LENGTH) {
    return R.prepend(
      {
        inputType: "markdownMessage",
        preamble,
      },
      items
    );
  }
  if (text && items.length > 0) {
    return R.assocPath([0, "preamble"], preamble, items);
  }
  return items;
};

export const activityTransformJson = (activityJson, itemsJson) => {
  const allowList = flattenIdList(
    R.pathOr([], [ALLOW, 0, "@list"], activityJson)
  );
  const scoringLogic = activityJson[SCORING_LOGIC]; // TO DO
  const notification = {}; // TO DO
  const info = languageListToObject(activityJson.info); // TO DO
  const addProperties = activityJson[ADD_PROPERTIES];

  const preamble = languageListToObject(activityJson[PREAMBLE]);
  const order = (activityJson[ORDER] && flattenIdList(activityJson[ORDER][0]["@list"])) || [];
  let itemIndex = -1;
  let itemData;

  const mapItems = R.map((itemKey) => {
    itemIndex += 1;
    itemData = itemsJson[itemKey];

    if (!itemData) {
      console.warn(
        `Item ID "${itemKey}" defined in 'reprolib:terms/order' was not found`
      );
      return null;
    }

    const item = itemTransformJson(itemsJson[itemKey]);
    return itemAttachExtras(item, itemKey, addProperties[itemIndex]);
  });
  const nonEmptyItems = R.filter(item => item, mapItems(order));
  const items = attachPreamble(preamble, nonEmptyItems);
  const compute = activityJson[COMPUTE] && R.map((item) => {
    return {
      jsExpression: R.path([JS_EXPRESSION, 0, "@value"], item),
      variableName: R.path([VARIABLE_NAME, 0, "@value"], item)
    }
  }, activityJson[COMPUTE]);
  const subScales = activityJson[SUBSCALES] && R.map((subScale) => {
    return {
      jsExpression: R.path([JS_EXPRESSION, 0, "@value"], subScale),
      variableName: R.path([VARIABLE_NAME, 0, "@value"], subScale),
      lookupTable: flattenLookupTable(subScale[LOOKUP_TABLE])
    }
  }, activityJson[SUBSCALES])
  const messages = activityJson[MESSAGES] && R.map((item) => {
    return {
      message: R.path([MESSAGE, 0, "@value"], item),
      jsExpression: R.path([JS_EXPRESSION, 0, "@value"], item),
      outputType: R.path([OUTPUT_TYPE, 0, "@value"], item),
    }
  }, activityJson[MESSAGES]);

  return {
    id: activityJson._id,
    name: languageListToObject(activityJson[PREF_LABEL]),
    description: languageListToObject(activityJson[DESCRIPTION]),
    schemaVersion: languageListToObject(activityJson[SCHEMA_VERSION]),
    version: languageListToObject(activityJson[VERSION]),
    altLabel: languageListToObject(activityJson[ALT_LABEL]),
    shuffle: R.path([SHUFFLE, 0, "@value"], activityJson),
    image: languageListToObject(activityJson[IMAGE]),
    skippable: isSkippable(allowList),
    backDisabled: allowList.includes(BACK_DISABLED),
    fullScreen: allowList.includes(FULL_SCREEN),
    autoAdvance: allowList.includes(AUTO_ADVANCE),
    isPrize: R.path([ISPRIZE, 0, "@value"], activityJson) || false,
    compute,
    subScales,
    messages,
    preamble,
    scoringLogic,
    notification,
    info,
    items,
  };
};

export const appletTransformJson = (appletJson) => {
  const res = {
    id: appletJson._id,
    groupId: appletJson.groups,
    schema: appletJson.url || appletJson[URL],
    name: languageListToObject(appletJson[PREF_LABEL]),
    description: languageListToObject(appletJson[DESCRIPTION]),
    about: languageListToObject(appletJson[ABOUT]),
    aboutContent: languageListToObject(appletJson[ABOUT_CONTENT]),
    schemaVersion: languageListToObject(appletJson[SCHEMA_VERSION]),
    version: languageListToObject(appletJson[VERSION]),
    altLabel: languageListToObject(appletJson[ALT_LABEL]),
    visibility: listToVisObject(appletJson[ADD_PROPERTIES]),
    image: appletJson[IMAGE],
    order: flattenIdList(appletJson[ORDER][0]["@list"]),
    schedule: appletJson.schedule,
    responseDates: appletJson.responseDates,
    shuffle: R.path([SHUFFLE, 0, "@value"], appletJson),
  };
  if (appletJson.encryption && Object.keys(appletJson.encryption).length) {
    res.encryption = appletJson.encryption;
  }
  return res;
};

export const transformApplet = (payload) => {
  const activities = Object.keys(payload.activities).map((key) => {
    const activity = activityTransformJson(
      payload.activities[key],
      payload.items,
    );
    activity.schema = key;
    return activity;
  });
  const applet = appletTransformJson(payload.applet);
  // Add the items and activities to the applet object
  applet.activities = activities;
  applet.groupId = payload.groups;
  return applet;
};

export const dateParser = (schedule) => {
  const output = {};
  Object.keys(schedule.events).forEach(key => {
    const e = schedule.events[key];
    const uri = e.data.URI;

    if (!output[uri]) {
      output[uri] = {
        notificationDateTimes: [],
        id: e.id,
      };
    }

    const eventSchedule = Parse.schedule(e.schedule);
    const now = Day.fromDate(new Date());

    const lastScheduled = getLastScheduled(eventSchedule, now);
    const nextScheduled = getNextScheduled(eventSchedule, now);
    const notifications = R.pathOr([], ['data', 'notifications'], e);
    const dateTimes = getScheduledNotifications(eventSchedule, now, notifications);

    let lastScheduledResponse = lastScheduled;
    let {
      lastScheduledTimeout, lastTimedActivity, extendedTime, id, completion
    } = output[uri];

    if (lastScheduledResponse) {
      lastScheduledTimeout = e.data.timeout;
      lastTimedActivity = e.data.timedActivity;
      completion = e.data.completion;
      id = e.id;
      extendedTime = e.data.extendedTime;
    }

    if (output[uri].lastScheduledResponse && lastScheduled) {
      lastScheduledResponse = moment.max(
        moment(output[uri].lastScheduledResponse),
        moment(lastScheduled),
      );
      if (lastScheduledResponse === output[uri].lastScheduledResponse) {
        lastScheduledTimeout = output[uri].lastScheduledTimeout;
        lastTimedActivity = output[uri].lastTimedActivity;
        id = output[uri].id;
        completion = output[uri].completion;
        extendedTime = output[uri].extendedTime;
      }
    }

    let nextScheduledResponse = nextScheduled;
    let { nextScheduledTimeout, nextTimedActivity } = output[uri];

    if (nextScheduledResponse) {
      nextScheduledTimeout = e.data.timeout;
      nextTimedActivity = e.data.timedActivity;
    }

    if (output[uri].nextScheduledResponse && nextScheduled) {
      nextScheduledResponse = moment.min(
        moment(output[uri].nextScheduledResponse),
        moment(nextScheduled),
      );
      if (nextScheduledResponse === output[uri].nextScheduledResponse) {
        nextScheduledTimeout = output[uri].nextScheduledTimeout;
        nextTimedActivity = output[uri].nextTimedActivity;
      }
    }

    output[uri] = {
      lastScheduledResponse: lastScheduledResponse || output[uri].lastScheduledResponse,
      nextScheduledResponse: nextScheduledResponse || output[uri].nextScheduledResponse,
      lastTimedActivity,
      nextTimedActivity,
      extendedTime,
      id,
      lastScheduledTimeout,
      nextScheduledTimeout,
      completion,
      // TODO: only append unique datetimes when multiple events scheduled for same activity/URI
      notificationDateTimes: output[uri].notificationDateTimes.concat(dateTimes),
    };
  });

  return output;
};

export const parseAppletActivities = (applet, responseSchedule) => {
  let scheduledDateTimesByActivity = {};
  // applet.schedule, if defined, has an events key.
  // events is a list of objects.
  // the events[idx].data.URI points to the specific activity's schema.
  if (applet.schedule) {
    scheduledDateTimesByActivity = dateParser(applet.schedule);
  }

  const extraInfoActivities = applet.activities.map((act) => {
    const scheduledDateTimes = scheduledDateTimesByActivity[act.schema];
    const nextScheduled = R.pathOr(null, ['nextScheduledResponse'], scheduledDateTimes);
    const lastScheduled = R.pathOr(null, ['lastScheduledResponse'], scheduledDateTimes);
    const nextTimedActivity = R.pathOr(null, ['nextTimedActivity'], scheduledDateTimes);
    const lastTimedActivity = R.pathOr(null, ['lastTimedActivity'], scheduledDateTimes);
    const oneTimeCompletion = R.pathOr(null, ['completion'], scheduledDateTimes);
    const lastTimeout = R.pathOr(null, ['lastScheduledTimeout'], scheduledDateTimes);
    const nextTimeout = R.pathOr(null, ['nextScheduledTimeout'], scheduledDateTimes);
    const id = R.pathOr(null, ['id'], scheduledDateTimes);
    const extendedTime = R.pathOr(null, ['extendedTime'], scheduledDateTimes);
    const lastResponse = R.path([applet.id, act.id, 'lastResponse'], responseSchedule);

    let nextAccess = false;
    let prevTimeout = null;
    let scheduledTimeout = null;
    let invalid = true;

    if (applet.schedule.data) {
      Object.keys(applet.schedule.data).forEach(date => {
        const event = applet.schedule.data[date].find(ele => ele.id === id);

        if (moment().isSame(moment(date), 'day') && event) {
          invalid = event.valid;
        }
      })
    } else if (applet.schedule.valid !== undefined) {
      invalid = applet.schedule.valid;
    }

    if (lastTimeout) {
      prevTimeout = ((lastTimeout.day * 24 + lastTimeout.hour) * 60 + lastTimeout.minute) * 60000;
    }
    if (nextTimeout) {
      nextAccess = nextTimeout.access;
      scheduledTimeout = ((nextTimeout.day * 24 + nextTimeout.hour) * 60 + nextTimeout.minute) * 60000;
    }

    return {
      ...act,
      appletId: applet.id,
      appletShortName: applet.name,
      appletName: applet.name,
      appletSchema: applet.schema,
      appletSchemaVersion: applet.schemaVersion,
      lastScheduledTimestamp: lastScheduled,
      lastResponseTimestamp: lastResponse,
      nextScheduledTimestamp: nextScheduled,
      oneTimeCompletion: oneTimeCompletion || false,
      lastTimeout: prevTimeout,
      nextTimeout: scheduledTimeout,
      nextTimedActivity,
      lastTimedActivity,
      currentTime: new Date().getTime(),
      invalid,
      extendedTime,
      nextAccess,
      isOverdue: lastScheduled && moment(lastResponse) < moment(lastScheduled),

      // also add in our parsed notifications...
      notification: R.prop('notificationDateTimes', scheduledDateTimes),
    };
  });

  return {
    ...applet,
    activities: extraInfoActivities,
  };
};
