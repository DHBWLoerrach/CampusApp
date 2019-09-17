import ICAL from 'ical.js';
import { startOfToday, format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function getLecturesFromiCalData(iCalendarData) {
  var jcalData = ICAL.parse(iCalendarData);
  var comp = new ICAL.Component(jcalData);

  // get timezone contained in iCal Data and register with TimezoneService
  var timezoneComp = comp.getFirstSubcomponent('vtimezone');
  if (!timezoneComp) {
    return {};
  }
  var tzid = timezoneComp.getFirstPropertyValue('tzid');
  var timezone = new ICAL.Timezone({
    component: timezoneComp,
    tzid
  });
  ICAL.TimezoneService.register(tzid, timezone);

  var vevents = comp.getAllSubcomponents('vevent');

  // process events
  var events = [];

  if (vevents != null) {
    // get all recurrence exceptions (events that have been part of a recurrence  )
    // MS exchange generates iCal data having incomplete RECURRENCE-IDs for
    // VEVENTs that are recurrence exceptions (individual events as part of
    // a recurrence that have been changed (e.g. day,time or even title)).
    // In the iCal data, for RECURRENCE-IDs, the time part is missing.  Thus
    // iCal.js and other calendars (iOS, android) differ from course web calendars
    // see https://tools.ietf.org/html/rfc5545#section-3.8.4.4
    // and look for RECURRENCE-IDs in iCal data generated by exchange
    var recurrenceExceptions = _getRecurrenceExceptions(vevents);
    // TODO: in case this bug gets fixed in MS exchange, we need to ignore
    // the recurrence exceptions in the loop below to avoid duplicate entries

    for (var i = 0, total = vevents.length; i < total; i++) {
      var event = new ICAL.Event(vevents[i]);
      if (event.isRecurring()) {
        var next = null;
        var iterator = event.iterator();
        while ((next = iterator.next())) {
          // next is a ICAL.Time object
          var recurrenceEvent = event.getOccurrenceDetails(next).item;
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
            location: recurrenceEvent.location
          });
        }
      } else {
        events.push({
          description: event.summary,
          startDate: event.startDate.toJSDate(),
          startTime: event.startDate.toJSDate().getTime(),
          endDate: event.endDate.toJSDate(),
          endTime: event.endDate.toJSDate().getTime(),
          location: event.location
        });
        // if event lasts longer than one day add an extra event for each day
        for (var day = 1; day < event.duration.days; day++) {
          var startDate = event.startDate.toJSDate();
          startDate.setDate(startDate.getDate() + 1);
          events.push({
            description: event.summary,
            startDate: startDate,
            startTime: event.startDate.toJSDate().getTime(),
            endDate: event.endDate.toJSDate(),
            endTime: event.endDate.toJSDate().getTime(),
            location: event.location
          });
        }
      }
    }
  }

  var range = 180; // get events for next 6 months
  var rangeStart = startOfToday();
  var rangeEnd = new Date().setDate(rangeStart.getDate() + range);

  var filteredEvents = events.filter(function(filterEvent) {
    return (
      filterEvent.startTime >= rangeStart.getTime() &&
      filterEvent.endDate <= rangeEnd
    );
  });

  filteredEvents.sort(function(event1, event2) {
    if (event1.startDate < event2.startDate) {
      return -1;
    }

    if (event1.startDate > event2.startDate) {
      return 1;
    }
    return 0;
  });

  // prepare lectures for rendering in SectionList
  // TODO: combine with above legacy iterate/sort/filter actions
  let currentKey = 1;
  const result = filteredEvents.reduce((lectures, event) => {
    const day = format(event.startDate, 'EEEE dd.MM.yy', {
      locale: de
    });

    const lecture = {
      key: currentKey,
      title: event.description,
      startTime: format(event.startTime, 'HH:mm'),
      endTime: format(event.endTime, 'HH:mm'),
      location: event.location
    };

    const index = lectures.findIndex(
      dayItem => dayItem.title === day
    );
    if (index >= 0) {
      lectures[index].data.push(lecture);
    } else {
      lectures.push({ title: day, data: [lecture] });
    }
    currentKey += 1;
    return lectures;
  }, []);
  return result;
}

function _getRecurrenceExceptions(vevents) {
  // result: for all recurrences with exceptions, we map the event's uid
  // to the days of the occurring exceptions
  var result = {};
  for (var i = 0, total = vevents.length; i < total; i++) {
    var event = new ICAL.Event(vevents[i]);
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
