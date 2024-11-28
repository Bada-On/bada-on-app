import { useState } from "react";
import { StyleSheet, Alert, View } from "react-native";
import { WebView } from "react-native-webview";
import { useGeolocation } from "./src/hooks/useGeolocation";

export default function App() {
  const [ready, setReady] = useState(false);
  const [webviewKey, setWebviewKey] = useState(0);
  const { webViewRef, handleMessage } = useGeolocation();

  return (
    <View style={styles.container}>
      <WebView
        style={styles.webview}
        source={{ uri: "https://bada-on-fe.vercel.app/" }}
        onError={(event) => {
          console.error("WebView error:", event.nativeEvent);
          Alert.alert("오류 발생", "웹뷰 로딩 중 오류가 발생했습니다!");
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("HTTP error:", nativeEvent);
          Alert.alert("오류 발생", "웹뷰 로딩 중 오류가 발생했습니다!");
        }}
        ref={webViewRef}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={["*"]}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        key={webviewKey}
        onLoadStart={(e) => {
          const { nativeEvent } = e;
          if (nativeEvent.url === "about:blank" && !ready) {
            setWebviewKey(Date.now());
          }
        }}
        onLoadEnd={() => {
          if (!ready) {
            setWebviewKey(Date.now());
            setReady(true);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
