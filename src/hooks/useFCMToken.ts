import { useEffect, useCallback, useState } from "react";
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";

interface UseFCMTokenProps {
  onTokenReceived?: (token: string) => void;
  serverUrl?: string;
}

export const useFCMToken = ({
  onTokenReceived,
  serverUrl = "https://badaon.shop/api/v1/fcm/token",
}: UseFCMTokenProps = {}) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const sendTokenToServer = useCallback(
    async (token: string) => {
      try {
        const response = await fetch(serverUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            device: Platform.OS,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send token to server");
        }

        const data = await response.json();
        console.log("Token successfully sent to server:", data);
        return data;
      } catch (error) {
        console.error("Error sending token to server:", error);
        throw error;
      }
    },
    [serverUrl]
  );

  const requestUserPermission = useCallback(async () => {
    if (Platform.OS === "ios") {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      return enabled;
    }
    return true;
  }, []);

  const getFCMToken = useCallback(async () => {
    try {
      const hasPermission = await requestUserPermission();
      if (!hasPermission) {
        throw new Error("No permission for push notifications");
      }

      const token = await messaging().getToken();
      console.log("FCM Token:", token);
      setFcmToken(token);
      onTokenReceived?.(token);

      await sendTokenToServer(token);
      return token;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      throw error;
    }
  }, [onTokenReceived, sendTokenToServer]);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await getFCMToken();
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // 토큰 리프레시 리스너
    const unsubscribe = messaging().onTokenRefresh(async (token) => {
      console.log("FCM Token refreshed:", token);
      setFcmToken(token);
      onTokenReceived?.(token);
      try {
        await sendTokenToServer(token);
      } catch (error) {
        console.error("Error sending refreshed token to server:", error);
      }
    });

    return () => unsubscribe();
  }, [getFCMToken, onTokenReceived, sendTokenToServer]);

  return {
    fcmToken,
    loading,
    error,
    getFCMToken,
    sendTokenToServer,
  };
};
