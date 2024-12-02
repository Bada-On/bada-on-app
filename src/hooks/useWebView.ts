import { useRef, useCallback, useState, useEffect } from "react";
import type { WebView } from "react-native-webview";

export const useWebView = () => {
  const webViewRef = useRef<WebView | null>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [webViewError, setWebViewError] = useState<string | null>(null);
  const [webViewKey, setWebViewKey] = useState(0);

  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage("message 전송");
    }
  }, [webViewRef]);

  const handleLoadStart = useCallback(
    (e: any) => {
      const { url } = e.nativeEvent;
      if (url === "about:blank" && !isWebViewReady) {
        setWebViewKey(Date.now());
      }
    },
    [isWebViewReady]
  );

  const handleLoadEnd = useCallback(() => {
    if (!isWebViewReady) {
      setWebViewKey(Date.now());
      setIsWebViewReady(true);
    }
    setWebViewError(null);
  }, [isWebViewReady]);

  const handleError = useCallback((e: any) => {
    const error = e.nativeEvent;
    console.error("WebView error:", error);
    setWebViewError(error.description || "알 수 없는 오류가 발생했습니다");
    setIsWebViewReady(false);
  }, []);

  const sendToWeb = useCallback(
    (data: any) => {
      if (!isWebViewReady) {
        console.error("WebView가 준비되지 않았습니다");
        return false;
      }

      try {
        // console.log("data", data);
        // console.log("webViewRef.current", webViewRef.current);
        webViewRef.current?.postMessage(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error("메시지 전송 실패:", error);
        return false;
      }
    },
    [isWebViewReady]
  );

  return {
    webViewRef,
    isWebViewReady,
    webViewError,
    webViewKey,
    handleLoadStart,
    handleLoadEnd,
    handleError,
    sendToWeb,
  };
};
