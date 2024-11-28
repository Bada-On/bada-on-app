import { useRef, useCallback } from "react";
import { Alert, Platform, PermissionsAndroid } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import type { WebView } from "react-native-webview";

interface LocationData {
  type: "location";
  payload: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: number;
  };
}

interface GeolocationError {
  type: "location_error";
  payload: {
    code: number;
    message: string;
  };
}

export const useGeolocation = () => {
  const webViewRef = useRef<WebView | null>(null);

  const requestLocationPermission = async () => {
    if (Platform.OS === "ios") {
      return new Promise<boolean>((resolve) => {
        Geolocation.requestAuthorization(
          () => resolve(true),
          (error) => {
            console.error("iOS 위치 권한 오류:", error);
            resolve(false);
          }
        );
      });
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "위치 정보 권한",
          message: "현재 위치 정보를 확인하기 위해 권한이 필요합니다.",
          buttonNeutral: "다음에 묻기",
          buttonNegative: "거부",
          buttonPositive: "허용",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error("권한 요청 오류:", err);
      return false;
    }
  };

  const handleGeolocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      const error: GeolocationError = {
        type: "location_error",
        payload: {
          code: 1,
          message: "위치 정보 권한이 거부되었습니다.",
        },
      };
      webViewRef.current?.postMessage(JSON.stringify(error));
      Alert.alert("권한 오류", "위치 정보 권한이 필요합니다.");
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          type: "location",
          payload: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          },
        };
        webViewRef.current?.postMessage(JSON.stringify(locationData));
      },
      (error) => {
        console.error("위치 정보 오류:", error);
        const errorData: GeolocationError = {
          type: "location_error",
          payload: {
            code: error.code,
            message: error.message,
          },
        };
        webViewRef.current?.postMessage(JSON.stringify(errorData));
        Alert.alert("위치 정보 오류", "위치 정보를 가져오는데 실패했습니다.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }, []);

  const handleMessage = useCallback(
    (event: any) => {
      console.log("event", event);
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "GET_LOCATION") {
          handleGeolocation();
        }
      } catch (error) {
        console.error("메시지 처리 오류:", error);
      }
    },
    [handleGeolocation]
  );

  return {
    webViewRef,
    handleMessage,
  };
};
