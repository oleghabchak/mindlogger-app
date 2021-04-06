import * as R from 'ramda';
import moment from 'moment';
import i18n from 'i18next';

const compareByNameAlpha = (a, b) => {
  const nameA = a.name.en.toUpperCase(); // ignore upper and lowercase
  const nameB = b.name.en.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
};

const compareByTimestamp = propName => (a, b) => moment(a[propName]) - moment(b[propName]);

export const getUnscheduled = (activityList, pastActivities, scheduledActivities) => {
  const unscheduledActivities = [];

  activityList.forEach(activity => {
    if (!activity.events.length || activity.availability) {
      unscheduledActivities.push({ ...activity });
    } else {
      activity.events.forEach(event => {
        const today = new Date();
        const { scheduledTime, data } = event;

        if (scheduledTime > today
          && !data.completion
          && !scheduledActivities.find(({ schema }) => schema === activity.schema)
          && !pastActivities.find(({ schema }) => schema === activity.schema)
          && !unscheduledActivities.find(({ schema }) => schema === activity.schema)
          && (data.timeout.access || moment().isSame(moment(activity.nextScheduledTimestamp), 'day'))) {
          unscheduledActivities.push({ ...activity });
        }
      });
    }
  });

  return unscheduledActivities;


  // activityList.filter(
  //   activity => (!activity.nextScheduledTimestamp
  //     || !moment().isSame(moment(activity.nextScheduledTimestamp), 'day'))
  //     && (!activity.oneTimeCompletion
  //       || !activity.lastResponseTimestamp
  //       || moment(activity.lastResponseTimestamp) < activity.lastScheduledTimestamp)
  //     && (!activity.lastResponseTimestamp
  //       || !moment().isSame(moment(activity.lastResponseTimestamp), 'day')
  //       || new Date(activity.lastResponseTimestamp).getTime() - activity.lastScheduledTimestamp
  //       > activity.lastTimeout
  //       || new Date(activity.lastResponseTimestamp).getTime() < activity.lastScheduledTimestamp)
  //     && (!activity.nextAccess || (activityAccess && activityAccess[appletId + activity.id]))
  //     && (!activity.lastScheduledTimestamp
  //       || ((((!activity.extendedTime || !activity.extendedTime.allow)
  //         && new Date().getTime() - activity.lastScheduledTimestamp > activity.lastTimeout)
  //         || (activity.extendedTime
  //           && activity.extendedTime.allow
  //           && new Date().getTime() - activity.lastScheduledTimestamp
  //           > activity.lastTimeout + activity.extendedTime.days * 86400000))
  //         && !moment().isSame(moment(activity.lastScheduledTimestamp), 'day')))
  //     && activity.invalid !== false,
  // );
}

export const getScheduled = (activityList, activityAccess) => {
  const scheduledActivities = [];

  activityList.forEach(activity => {
    activity.events.forEach(event => {
      const today = new Date();
      const { scheduledTime, data } = event;

      if (!activity.availability
        && scheduledTime > today
        && !data.completion
        && (data.timeout.access || moment().isSame(moment(scheduledTime), 'day'))) {
        const scheduledActivity = { ...activity };

        delete scheduledActivity.events;
        scheduledActivity.event = event;
        scheduledActivities.push(scheduledActivity);
      }
    })
  });

  return scheduledActivities;

  // activityList.filter(
  //   activity => activity.nextScheduledTimestamp
  //     && (!activity.lastScheduledTimestamp
  //       || new Date().getTime() - activity.lastScheduledTimestamp > activity.lastTimeout
  //       || moment(activity.lastResponseTimestamp) > activity.lastScheduledTimestamp
  //       || (endTimes && endTimes[appletId + activity.id] > activity.lastScheduledTimestamp))
  //     && (activity.nextAccess || moment().isSame(moment(activity.nextScheduledTimestamp), 'day'))
  //     && (!activityAccess || !activityAccess[appletId + activity.id]),
  // );
}

export const getPastdue = (activityList, appletId) => {
  const pastActivities = [];

  activityList.forEach(activity => {
    activity.events.forEach(event => {
      const today = new Date();
      const { scheduledTime, data } = event;
      const activityTimeout = data.timeout.day * 864000000
        + data.timeout.hour * 3600000
        + data.timeout.minute * 60000;

      if (!activity.availability
        && scheduledTime <= today
        && moment().isSame(moment(scheduledTime), 'day')
        && (!data.timeout.allow || today.getTime() - scheduledTime.getTime() < activityTimeout)) {
        const pastActivity = { ...activity };

        delete pastActivity.events;
        pastActivity.event = event;
        pastActivities.push(pastActivity);
      }
    })
  });

  return pastActivities;

  // return activityList.filter(
  //   activity => activity.lastScheduledTimestamp
  //     && activity.lastTimeout
  //     && (!endTimes || !endTimes[appletId + activity.id] || endTimes[appletId + activity.id] < activity.lastScheduledTimestamp)
  //     && (!activity.lastResponseTimestamp
  //       || moment(activity.lastResponseTimestamp) <= activity.lastScheduledTimestamp
  //       || ((!activity.extendedTime || !activity.extendedTime.allow)
  //         && new Date(activity.lastResponseTimestamp).getTime() - activity.lastScheduledTimestamp
  //         > activity.lastTimeout)
  //       || (activity.extendedTime
  //         && activity.extendedTime.allow
  //         && new Date(activity.lastResponseTimestamp).getTime() - activity.lastScheduledTimestamp
  //         > activity.extendedTime.days * 86400000))
  //     && ((activity.extendedTime
  //       && activity.extendedTime.allow
  //       && new Date().getTime() - activity.lastScheduledTimestamp
  //       <= activity.lastTimeout + activity.extendedTime.days * 86400000)
  //       || ((!activity.extendedTime || !activity.extendedTime.allow)
  //         && new Date().getTime() - activity.lastScheduledTimestamp <= activity.lastTimeout)),
  // );
}

const addSectionHeader = (array, headerText) => (array.length > 0 ? [{ isHeader: true, text: headerText }, ...array] : []);

const addProp = (key, val, arr) => arr.map(obj => R.assoc(key, val, obj));

// Sort the activities into categories and inject header labels, e.g. "In Progress",
// before the activities that fit into that category.
export default (appletId, activityList, inProgress, activityEndTimes, activityAccess) => {
  let notInProgress = [];
  let inProgressActivities = [];
  const inProgressKeys = Object.keys(inProgress);

  if (inProgressKeys) {
    activityList.forEach(activity => {
      const notInProgressEvents = [];

      if (activity.events.length) {
        activity.events.forEach(event => {
          if (!inProgressKeys.includes(activity.id + event.id)) {
            notInProgressEvents.push(event);
          } else {
            inProgressActivities.push({
              ...activity,
              event,
            });
          }
        });

        if (notInProgressEvents.length) {
          notInProgress.push({
            ...activity,
            events: notInProgressEvents,
          })
        }
      } else {
        if (inProgressKeys.includes(activity.id)) { 
          inProgressActivities.push({
            ...activity,
          });
        } else {
          notInProgress.push({ ...activity });
        }
      }
    })
  } else {
    notInProgress = activityList;
  }

  // Activities currently scheduled - or - previously scheduled and not yet completed.

  // Activities scheduled some time in the future.
  const pastdue = getPastdue(notInProgress, appletId)
    .sort(compareByTimestamp('lastScheduledTimestamp'))
    .reverse();

  const scheduled = getScheduled(notInProgress, activityAccess).sort(compareByTimestamp('nextScheduledTimestamp'));

  // Activities with no schedule.
  const unscheduled = getUnscheduled(notInProgress, pastdue, scheduled).sort(compareByNameAlpha);

  // Activities which have been completed and have no more scheduled occurrences.
  // const completed = getCompleted(notInProgress).reverse();

  return [
    ...addSectionHeader(addProp('status', 'pastdue', pastdue), i18n.t('additional:past_due')),
    ...addSectionHeader(
      addProp('status', 'in-progress', inProgressActivities),
      i18n.t('additional:in_progress'),
    ),
    ...addSectionHeader(
      addProp('status', 'unscheduled', unscheduled),
      i18n.t('additional:unscheduled'),
    ),
    ...addSectionHeader(addProp('status', 'scheduled', scheduled), i18n.t('additional:scheduled')),
  ];
};
