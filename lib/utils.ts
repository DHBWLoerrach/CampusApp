import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { dhbwRed } from '@/constants/Colors';

export const openLink = async (url: string) => {
  if (!url) return;

  if (Platform.OS === 'web') {
    window.open(url, '_blank');
    return;
  }

  if (url.startsWith('http')) {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle:
        WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET, //iOS
      controlsColor: dhbwRed, // iOS
      createTask: false, // Android
      showTitle: false, // Android
    });
  } else {
    await Linking.openURL(url);
  }
};
