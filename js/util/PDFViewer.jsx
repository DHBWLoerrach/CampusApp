import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PDFViewer({ source }) {
  let pdfUrl = source;

  if (Platform.OS === 'android') {
    // on Android use embedded Google docs viewer for PDF (WebView won't work)
    // see https://github.com/facebook/react-native/issues/6488
    // route all PDF links through Google docs viewer
    pdfUrl = `https://docs.google.com/gview?embedded=true&url=${pdfUrl}`;
    console.log(pdfUrl);
  }

  return (
    <WebView
      source={{ uri: pdfUrl }}
      originWhitelist={['*']}
      style={{ flex: 1 }}
      scalesPageToFit={true}
    />
  );
}
