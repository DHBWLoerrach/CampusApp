import getLecturesFromiCalData from "../../tabs/schedule/helpers";

export default class ICalFetcher {

    async getItems(forceNewData, params) {
        let lectures = null;
        try {
            const scheduleUrl = `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${params.course}@dhbw-loerrach.de/Kalender/calendar.ics`;
            console.log("Loading from " + scheduleUrl);
            const response = await fetch(scheduleUrl);
            const responseBody = await response.text();
            lectures = getLecturesFromiCalData(responseBody);
        } catch (error) {
            return 'networkError';
        }
        return lectures;
    }
}
