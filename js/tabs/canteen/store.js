import AsyncStorage from '@react-native-async-storage/async-storage';

import { canteenApiKey } from '../../../env.js';
import fetchCanteenData from './helpers';

export async function fetchCanteenDataFromWeb() {
  let dayPlans = null;
  try {
    const canteenUrl = `https://www.swfr.de/index.php?id=1400&type=98&&tx_swfrspeiseplan_pi1[apiKey]=${canteenApiKey}&tx_swfrspeiseplan_pi1[ort]=677`;
    const response = await fetch(canteenUrl);
    const responseBody = await response.text();
    dayPlans = fetchCanteenData(responseBody);
  } catch (e) {
    return 'networkError';
  }
  return dayPlans;
}

export async function loadCanteenDataFromStore() {
  const data = await AsyncStorage.getItem('canteen');
  return JSON.parse(data);
}

export function saveCanteenDataToStore(data) {
  AsyncStorage.setItem('canteen', JSON.stringify(data));
}
