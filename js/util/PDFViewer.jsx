import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

export default function PDFViewer({ source }) {
  const webViewRef = useRef();

  // make sure PDF is reloaded when screen is focused
  // (this makes sure PDF shows especially on Android)
  useFocusEffect(
    useCallback(() => {
      webViewRef.current.reload();
    }, [])
  );

  let pdfUrl = source;

  if (Platform.OS === 'android') {
    // on Android use embedded Google docs viewer for PDF (WebView won't work)
    // see https://github.com/facebook/react-native/issues/6488
    // route all PDF links through Google docs viewer
    pdfUrl = `https://docs.google.com/gview?embedded=true&url=${pdfUrl}`;
  }

  return (
    <WebView
      ref={(ref) => (webViewRef.current = ref)}
      source={{ uri: pdfUrl }}
    />
  );
}
