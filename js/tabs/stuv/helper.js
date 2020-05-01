import moment from "moment";

export async function loadEvents() {
    const body = await load("https://00e9e64bacb0936dd797aa643313c3107487777904f069e3d5-apidata.googleusercontent.com/download/storage/v1/b/stuv-data/o/serverResponseEvents.json?qk=AD5uMEv4tb3FUKJ7Rqf3yAfGfCSKxKT2cQNlCHXS5jw87mWMHqrwVMOQ6UOGTsXP2iwff77TwYBFKDQnC6hTDKhbJ4lI8K68gfulCTwl2m8dCM3-Z5WVOw1iuT1OQSgHjaGmgR7SzkduyD-HnTlJYHGwhG5r3JQa9LXnb9Wp0IvHzBztxxv632c9cCtK8qZe8AOexiN8rayEWBpoanjqPK9G5q3lrQOdaTwPR1MNMlmpwE5bWnP1PNPT7XbStgli3U76Z-BF73ATowRENqmXGXZQTmPukOOYyzbYYwZu5yNvWuSkulbCPSX--yvlrzEwEoo1foZG7fe6JCRB0KbGpGKjhXkz0NUhfdZlJJFjTsW-WwiI8gb178git7U02umEWY50d9690KcWDybrJp1aqqgFi4MlRMSafb4URNiHnYWk-t_WhKnWsSet2l_Ki0VvYu_4iV80jeaNwnTqBFDdVNhCEYXJfO8UXp_b2GaCelfxt3pBjw4CvNmGqVsSqnZ_N1lqUlrxj9nxGaEbhj14wTwq6ULYlDfajbynf7rw3eLEYCk6bEIaqEQHzyiQ6Xu6L7IBdotmWo3kiqIgRPRoM2vW_bFOnTsI7ozL1m3ZXvzy4KN30QgIMsmlS7EOoeeHzz5yvsCOaa-nZ4j_MTMGaGU5Zj1cwoLIoc5zkRPsumCDzFwMr5JJr32e11bR_2PiFWSeN_sMCBOdOjcvAMcYxafRTmMMyXL0u9mZySZ6vONGCk1OlpNf9SJk0idQZ8ZEDJ3xjYxpqsSui7ySSah3vi2EkWTwxIjGYmBFievFGcAk6garD8sE26VFXjqgODbq5La-CMrD9-us&isca=1");
    return body.response;
}

export async function loadNews() {
    const body = await load("https://storage.googleapis.com/stuv-data/serverResponseNews.json");
    return body.response;
}

async function load(url) {
    const response = await fetch(url);
    if (!response.ok) {
        return null;
    }
    return await response.json();
}

export function shortString(text, maxLength) {
    if (text.length > maxLength) {
        return text.substr(0, maxLength-3) + "...";
    } else {
        return text;
    }
}

export function unixTimeToDateText(time) {
    const date = moment(time*1000);
    return date.format('DD.MM.Y');
}

export function unixTimeToTimeText(time) {
    const date = moment(time*1000);
    return date.format('HH:mm');
}
