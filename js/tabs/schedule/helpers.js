import ICAL from 'ical.js';
import { addDays, startOfToday, format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function getLecturesFromiCalData(iCalendarData) {
  const jcalData = ICAL.parse(iCalendarData);
  const comp = new ICAL.Component(jcalData);

  // get timezone contained in iCal Data and register with TimezoneService
  const timezoneComp = comp.getFirstSubcomponent('vtimezone');
  if (!timezoneComp) {
    return [];
  }
  const tzid = timezoneComp.getFirstPropertyValue('tzid');
  const timezone = new ICAL.Timezone({
    component: timezoneComp,
    tzid,
  });
  ICAL.TimezoneService.register(tzid, timezone);

  const vevents = comp.getAllSubcomponents('vevent');

  // process events
  const events = [];

  if (vevents != null) {
    // get all recurrence exceptions (events that have been part of a recurrence  )
    // MS exchange generates iCal data having incomplete RECURRENCE-IDs for
    // VEVENTs that are recurrence exceptions (individual events as part of
    // a recurrence that have been changed (e.g. day,time or even title)).
    // In the iCal data, for RECURRENCE-IDs, the time part is missing.  Thus
    // iCal.js and other calendars (iOS, android) differ from course web calendars
    // see https://tools.ietf.org/html/rfc5545#section-3.8.4.4
    // and look for RECURRENCE-IDs in iCal data generated by exchange
    const recurrenceExceptions = _getRecurrenceExceptions(vevents);
    // TODO: in case this bug gets fixed in MS exchange, we need to ignore
    // the recurrence exceptions in the loop below to avoid duplicate entries

    for (let i = 0, total = vevents.length; i < total; i++) {
      const event = new ICAL.Event(vevents[i]);
      if (event.isRecurring()) {
        let next = null;
        const iterator = event.iterator();
        while ((next = iterator.next())) {
          // next is a ICAL.Time object
          const recurrenceEvent =
            event.getOccurrenceDetails(next).item;
          // Skip all occurences that actually are in our list of exceptions.
          // Those actual events will be added to the result anyway.
          // Without this workaround for the MS exchange iCal bug we could use
          // event.getOccurrenceDetails(next) to get the recurrence exception.
          if (
            recurrenceExceptions[event.uid] &&
            recurrenceExceptions[event.uid].indexOf(
              next.toJSDate().toDateString()
            ) >= 0
          ) {
            continue;
          }
          events.push({
            description: recurrenceEvent.summary,
            startDate: next.toJSDate(),
            startTime: next.toJSDate().getTime(),
            endDate: next.toJSDate(),
            endTime: recurrenceEvent.endDate.toJSDate().getTime(),
            location: recurrenceEvent.location,
          });
        }
      } else if (event.duration.days > 1) {
        // if event lasts longer than one day add an extra event for each day
        // start and end time for each day are determined by
        // start time of first day and end time of last day
        for (let day = 0; day <= event.duration.days; day++) {
          const startDate = event.startDate.toJSDate();
          startDate.setDate(startDate.getDate() + day);
          events.push({
            description: event.summary,
            startDate: startDate,
            startTime: event.startDate.toJSDate().getTime(),
            endDate: event.endDate.toJSDate(),
            endTime: event.endDate.toJSDate().getTime(),
            location: event.location,
          });
        }
      } else {
        events.push({
          description: event.summary,
          startDate: event.startDate.toJSDate(),
          startTime: event.startDate.toJSDate().getTime(),
          endDate: event.endDate.toJSDate(),
          endTime: event.endDate.toJSDate().getTime(),
          location: event.location,
        });
      }
    }
  }

  // get events for next and previous 6 months
  const rangeStart = addDays(startOfToday(), -180);
  const rangeEnd = addDays(startOfToday(), 180);

  const filteredEvents = events.filter(function (filterEvent) {
    return (
      filterEvent.startTime >= rangeStart.getTime() &&
      filterEvent.endDate <= rangeEnd // use end date because of recurring events
    );
  });

  filteredEvents.sort(function (event1, event2) {
    if (event1.startDate < event2.startDate) return -1;
    if (event1.startDate > event2.startDate) return 1;
    return 0;
  });

  return filteredEvents.map((event, i) => {
    const startTime = format(event.startTime, 'HH:mm');
    const endTime = format(event.endTime, 'HH:mm');
    return {
      key: i,
      title: event.description,
      startDate: event.startDate,
      startTime: startTime,
      endTime: endTime,
      location: event.location,
      equals: (otherItem) =>
        event.description === otherItem.title &&
        startTime === otherItem.startTime &&
        endTime === otherItem.endTime,
    };
  });
}

function _getRecurrenceExceptions(vevents) {
  // result: for all recurrences with exceptions, we map the event's uid
  // to the days of the occurring exceptions
  const result = {};
  for (let i = 0, total = vevents.length; i < total; i++) {
    const event = new ICAL.Event(vevents[i]);
    if (event.isRecurrenceException()) {
      if (!result[event.uid]) {
        result[event.uid] = [];
      }
      result[event.uid].push(
        event.recurrenceId.toJSDate().toDateString()
      );
    }
  }
  return result;
}
