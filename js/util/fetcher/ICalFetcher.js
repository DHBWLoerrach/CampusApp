import getLecturesFromiCalData from "../../tabs/schedule/helpers"

export default class ICalFetcher {

    async getItems(params) {
        let lectures = null;
        try {
            //const scheduleUrl = `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${params.course}@dhbw-loerrach.de/Kalender/calendar.ics`;
            const scheduleUrl = `http://diskstation.mineyannik.de/campusApp/${params.course}/calendar.ics`;
            console.log("Loading from " + scheduleUrl);
            const response = await fetch(scheduleUrl, {cache: "no-store"});
            const responseBody = await response.text();
            lectures = getLecturesFromiCalData(responseBody);
        } catch (error) {
            console.log(error);
            return 'networkError';
        }
        return lectures;
    }
}
