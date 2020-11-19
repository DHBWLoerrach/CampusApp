import AsyncStorage from '@react-native-community/async-storage';

export default class CacheFetcher {
  fetcher;
  uniqueName;
  maxCacheTime;

  constructor(fetcher, uniqueName, maxCacheTime = 60 * 60 * 1000) {
    this.fetcher = fetcher;
    this.uniqueName = uniqueName;
    this.maxCacheTime = maxCacheTime;
  }

  async getItems(forceNewData, params) {
    if (!forceNewData) {
      const cached = await this.getCachedItems();
      if (cached !== null) {
        return cached.items;
      }
    }
    const items = await this.fetcher.getItems(params);
    this.setCachedItems(items, params);
    return items;
  }

  async getNewItems() {
    const cached = await this.getCachedItems(false);
    const items = await this.fetcher.getItems(cached.params);
    const newItems = items.filter(
      (item) =>
        cached.items.filter((cache) => item.equals(cache)).length ===
        0
    );
    const removedItems = cached.items.filter(
      (cache) =>
        items.filter((item) => item.equals(cache)).length === 0
    );
    this.setCachedItems(items, cached.params);
    return { newItems, removedItems };
  }

  async getCachedItems(checkAge = true) {
    const cached = await AsyncStorage.getItem(this.uniqueName);
    if (cached != null) {
      const cacheObject = JSON.parse(cached);
      if (!checkAge || !this.isCacheTooOld(cacheObject.timestamp)) {
        return {
          items: cacheObject.items,
          params: cacheObject.params,
        };
      }
    }
    return null;
  }

  setCachedItems(items, params) {
    AsyncStorage.setItem(
      this.uniqueName,
      JSON.stringify({ items, params, timestamp: currentTime() })
    );
  }

  isCacheTooOld(oldTime) {
    return currentTime() > oldTime + this.maxCacheTime;
  }
}

function currentTime() {
  return new Date().getTime();
}
