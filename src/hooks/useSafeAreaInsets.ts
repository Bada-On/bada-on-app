import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { WebViewMessageEvent } from "react-native-webview";
import { useCallback, useContext, useEffect } from "react";

export const useSafeAreaInsets = (sendToWeb: (message: any) => void) => {
  const insets = useContext(SafeAreaInsetsContext);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === "GET_SAFE_AREA" && insets) {
          const safeAreaInsets = {
            sat: insets.top,
            sar: insets.right,
            sab: insets.bottom,
            sal: insets.left,
          };
          sendToWeb({ type: "updateSafeArea", payload: safeAreaInsets });
        }
      } catch (error) {
        console.error("Safe area message handling error:", error);
      }
    },
    [insets, sendToWeb]
  );

  return {
    handleMessage,
    insets,
  };
};
