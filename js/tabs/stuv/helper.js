import moment from "moment";

export async function loadEvents() {
    const body = await load("https://00e9e64bacb0936dd797aa643313c3107487777904f069e3d5-apidata.googleusercontent.com/download/storage/v1/b/stuv-data/o/serverResponseEvents.json?qk=AD5uMEv4tb3FUKJ7Rqf3yAfGfCSKxKT2cQNlCHXS5jw87mWMHqrwVMOQ6UOGTsXP2iwff77TwYBFKDQnC6hTDKhbJ4lI8K68gfulCTwl2m8dCM3-Z5WVOw1iuT1OQSgHjaGmgR7SzkduyD-HnTlJYHGwhG5r3JQa9LXnb9Wp0IvHzBztxxv632c9cCtK8qZe8AOexiN8rayEWBpoanjqPK9G5q3lrQOdaTwPR1MNMlmpwE5bWnP1PNPT7XbStgli3U76Z-BF73ATowRENqmXGXZQTmPukOOYyzbYYwZu5yNvWuSkulbCPSX--yvlrzEwEoo1foZG7fe6JCRB0KbGpGKjhXkz0NUhfdZlJJFjTsW-WwiI8gb178git7U02umEWY50d9690KcWDybrJp1aqqgFi4MlRMSafb4URNiHnYWk-t_WhKnWsSet2l_Ki0VvYu_4iV80jeaNwnTqBFDdVNhCEYXJfO8UXp_b2GaCelfxt3pBjw4CvNmGqVsSqnZ_N1lqUlrxj9nxGaEbhj14wTwq6ULYlDfajbynf7rw3eLEYCk6bEIaqEQHzyiQ6Xu6L7IBdotmWo3kiqIgRPRoM2vW_bFOnTsI7ozL1m3ZXvzy4KN30QgIMsmlS7EOoeeHzz5yvsCOaa-nZ4j_MTMGaGU5Zj1cwoLIoc5zkRPsumCDzFwMr5JJr32e11bR_2PiFWSeN_sMCBOdOjcvAMcYxafRTmMMyXL0u9mZySZ6vONGCk1OlpNf9SJk0idQZ8ZEDJ3xjYxpqsSui7ySSah3vi2EkWTwxIjGYmBFievFGcAk6garD8sE26VFXjqgODbq5La-CMrD9-us&isca=1");
    return body.response;
}

export async function loadNews() {
    const body = await load("https://00e9e64baccfb6dcb17422af42bcc8c0c8eb16aacc92c0a6e2-apidata.googleusercontent.com/download/storage/v1/b/stuv-data/o/serverResponseNews.json?qk=AD5uMEutxMd9QLG9rlt886ClprrYz9FCLZ0fPuWwQtqVMKy8RL1OJydS8BvIsbp7SuW8ZZJBKjvV34130M451toYE-PMMDi6FOHZl_plwKRr2DxcNZmJFoTfKi2hTsfU8nSYt7v94xhhuwOcCL42onU93kg8_dMSAGqCo12JCKemFTBjLFv3rInTOrAioTtAKQGf6U-OuH1449q8xOqy8icc_yUtAJc6CMGlAf4Lc7buN1F4D3nSLhMBmCFz4XAn8ujhj3h1uFVBJ5-eoUrn2s09dx78JN0DAWAz1G3_iwcPHz5gYd7kh2PDLVJnDW1DRPiW3FpsNRmr_FAKRsW4Qt8MnB9_89NNdGwimJy89TFej7P2dJEKcpDyRIL9svt5VYuBCYQCYLalWwLFjdQ5xsxm_olNUM_lTxttGJikQ3qcK4OT38V35dmlnoGVvrs706AOomG5YIYbJfZ3ZMGhYA3KWawYhmpSlMss5pSbHkPXNqe8zZQJUkVyqklXfLRXyZaJ0-9OCEAILZFb8C-LcSlMrK57U-tnXLlaCHWwNcnf30A3Pz9am1C7oK90Z05eiHzm5gnXkz4gvqW6Clfc75GweGfB31-mDYdqp9KQDtcxBLlWdReERiONVMi9EuxHKKkvlAFfGzhj04krzywfc626iQFZ1Xt1pKdKL_okHm7xIv-t9vLBb-U1-xIBMOVXynnXnw45dOwQU0UP69WXLXGYtJAqcS_2FoVjcOUPLdPi47TkHBINp6C-4sbGlDSMcPewu4wHJq4paInSv_y4Fl-9DnErz_tumSH6Y-5bsT6R9VVhRUyf2SM&isca=1");
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
