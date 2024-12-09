import { useEffect, useState } from "react";
import { StyleSheet, Alert, View, Text } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [ready, setReady] = useState(false);
  const [webkey, setWebkey] = useState(0);
  const [uri, setUri] = useState<string>("");

  useEffect(() => {
    const initializeUri = async () => {
      try {
        const storedValue = await AsyncStorage.getItem("activity");
        const baseUrl = "https://bada-on-fe.vercel.app";
        setUri(
          storedValue ? `${baseUrl}/home?selected=${storedValue}` : baseUrl
        );
      } catch (error) {
        setUri("https://bada-on-fe.vercel.app/");
      }
    };

    initializeUri();
  }, []);

  return (
    <View style={styles.container}>
      {uri && (
        <WebView
          style={styles.webview}
          source={{ uri }}
          onError={(event) => {
            console.error("WebView error:", event.nativeEvent);
            Alert.alert("오류 발생", "웹뷰 로딩 중 오류가 발생했습니다!");
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("HTTP error:", nativeEvent);
            Alert.alert("오류 발생", "웹뷰 로딩 중 오류가 발생했습니다!");
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          scalesPageToFit={true}
          mixedContentMode="compatibility"
          key={webkey}
          onLoadStart={(e) => {
            const { nativeEvent } = e;
            if (nativeEvent.url === "about:blank" && !ready) {
              setWebkey(Date.now());
            }
          }}
          onLoadEnd={() => {
            if (!ready) {
              setWebkey(Date.now());
              setReady(true);
            }
          }}
        />
      )}
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
