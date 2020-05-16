import AsyncStorage from '@react-native-community/async-storage';

export default class CacheFetcher {

    fetcher;
    uniqueName: string;

    constructor(fetcher, uniqueName) {
        this.fetcher = fetcher;
        this.uniqueName = uniqueName;
    }

    async getItems(forceNewData) {
        if (!forceNewData) {
            const cached = await AsyncStorage.getItem(this.uniqueName);
            if (cached != null) {
                const cacheObject = JSON.parse(cached);
                if (!cacheTooOld(cacheObject.timeStamp)) {
                    return cacheObject.items;
                }
            }
        }
        const items = await this.fetcher.getItems();
        await AsyncStorage.setItem(this.uniqueName, JSON.stringify({items, timestamp: currentTime()}));
        return items;
    }
}

function currentTime() {
    return new Date().getTime();
}

function cacheTooOld(oldTime) {
    return currentTime() > oldTime + 60 * 60 * 1000;
}
