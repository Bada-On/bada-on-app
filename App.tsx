import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useGeolocation } from "./src/hooks/useGeolocation";
import { useWebView } from "./src/hooks/useWebView";
import {
  SafeAreaProvider,
  SafeAreaInsetsContext,
} from "react-native-safe-area-context";
import { useFCMToken } from "./src/hooks/useFCMToken";
import * as SplashScreen from "expo-splash-screen";
import Splash from "./src/components/Splash";
import * as Sentry from "@sentry/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUri } from "./src/hooks/useUri";

Sentry.init({
  dsn: "https://aa10b1982b82743fd65161af43c96ad7@o4508425511567360.ingest.us.sentry.io/4508439167893504",

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // enableSpotlight: __DEV__,
});

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { uri } = useUri();

  const {
    webViewRef,
    isWebViewReady,
    webViewError,
    webViewKey,
    handleLoadStart,
    handleLoadEnd,
    handleError,
    sendToWeb,
  } = useWebView();

  const { handleMessage: handleGeolocationMessage } = useGeolocation(sendToWeb);

  useFCMToken();

  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "GET_LOCATION") {
        handleGeolocationMessage(event);
      } else if (data.type === "POST_ACTIVITY") {
        try {
          await AsyncStorage.setItem("activity", data.activity);
        } catch (error) {
          console.error("Activity 저장 중 오류 발생:", error);
        }
      }
    } catch (error) {
      console.error("Message handling error:", error);
    }
  };

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.hideAsync(); // 기본 스플래시 스크린 즉시 숨기기
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 로딩 시간 시뮬레이션
      } finally {
        setIsLoading(false);
      }
    }

    prepare();
  }, []);

  if (isLoading) {
    return <Splash />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaInsetsContext.Consumer>
        {(insets) => {
          const injectsScript = `
            window.safeAreaInsets = ${JSON.stringify({
              top: insets?.top || 0,
              right: insets?.right || 0,
              bottom: insets?.bottom || 0,
              left: insets?.left || 0,
            })};
            true; 
          `;

          return (
            <View style={styles.container}>
              {uri && (
                <WebView
                  ref={webViewRef}
                  style={styles.webview}
                  source={{ uri }}
                  onError={handleError}
                  onHttpError={handleError}
                  onLoadStart={handleLoadStart}
                  onLoadEnd={handleLoadEnd}
                  onMessage={handleMessage}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  originWhitelist={["*"]}
                  scalesPageToFit={true}
                  mixedContentMode="compatibility"
                  key={webViewKey}
                  injectedJavaScriptBeforeContentLoaded={injectsScript}
                />
              )}
              {webViewError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{webViewError}</Text>
                </View>
              )}
            </View>
          );
        }}
      </SafeAreaInsetsContext.Consumer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
