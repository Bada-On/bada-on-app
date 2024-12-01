import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useGeolocation } from "./src/hooks/useGeolocation";
import { useWebView } from "./src/hooks/useWebView";
import {
  SafeAreaProvider,
  SafeAreaInsetsContext,
} from "react-native-safe-area-context";

export default function App() {
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

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "GET_LOCATION") {
        handleGeolocationMessage(event);
      }
    } catch (error) {
      console.error("Message handling error:", error);
    }
  };

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
              <WebView
                ref={webViewRef}
                style={styles.webview}
                source={{ uri: "http://192.168.200.199:5173" }}
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
