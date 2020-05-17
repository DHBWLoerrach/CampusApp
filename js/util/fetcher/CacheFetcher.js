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
            const cached = this.getCachedItems();
            if (cached != null) {
                return cached;
            }
        }
        const items = await this.fetcher.getItems();
        this.setCachedItems(items);
        return items;
    }

    async getNewItems() {
        const cached = await this.getCachedItems(false);
        const items = await this.fetcher.getItems();
        const newItems = items.filter(item => cached.filter(cache => item.equals(cache)).length !== 0);
        const removedItems = cached.filter(cache => items.filter(item => item.equals(cache)).length !== 0);
        this.setCachedItems(items);
        return {newItems, removedItems};
    }

    async getCachedItems(checkAge = true) {
        const cached = await AsyncStorage.getItem(this.uniqueName);
        if (cached != null) {
            const cacheObject = JSON.parse(cached);
            if (!checkAge || !cacheTooOld(cacheObject.timeStamp)) {
                return cacheObject.items;
            }
        }
        return null;
    }

    async setCachedItems(items) {
        await AsyncStorage.setItem(this.uniqueName, JSON.stringify({items, timestamp: currentTime()}));
    }
}

function currentTime() {
    return new Date().getTime();
}

function cacheTooOld(oldTime) {
    return currentTime() > oldTime + 60 * 60 * 1000;
}
