import { useCallback } from "react";
import { Alert, Platform } from "react-native";
import * as Location from "expo-location";
import * as Linking from "expo-linking";

interface LocationData {
  type: "location";
  payload: {
    latitude: number;
    longitude: number;
  };
}

interface GeolocationError {
  type: "location_error";
  payload: {
    code: number;
    message: string;
  };
}

// TODO: 위치 정보 구독 기능 추가
export const useGeolocation = (
  sendToWeb: (data: LocationData | GeolocationError) => boolean
) => {
  const requestLocationPermission = async () => {
    try {
      const { status: existingStatus } =
        await Location.getForegroundPermissionsAsync();

      // 권한 상태 구분
      if (existingStatus === "undetermined") {
        // 최초 권한 요청
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === "granted";
      }

      if (existingStatus === "denied") {
        // 이미 거부된 상태
        Alert.alert(
          "권한 거부됨",
          "위치 정보 권한이 필요합니다. 설정으로 이동하시겠습니까?",
          [
            {
              text: "취소",
              style: "cancel",
            },
            {
              text: "설정으로 이동",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return false;
      }

      return existingStatus === "granted";
    } catch (err) {
      console.error("권한 요청 오류:", err);
      return false;
    }
  };

  const handleGeolocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // console.log("location", location);

      const locationData: LocationData = {
        type: "location",
        payload: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };
      sendToWeb(locationData);
    } catch (error: any) {
      const errorData: GeolocationError = {
        type: "location_error",
        payload: {
          code: error.code || 0,
          message: error.message || "위��� 정보를 가져오는데 실패했습니다.",
        },
      };
      sendToWeb(errorData);
      Alert.alert("위치 정보 오류", "위치 정보를 가져오는데 실패했습니다.");
    }
  }, [sendToWeb]);

  const handleMessage = useCallback(
    (event: any) => {
      // Alert.alert("event", event.nativeEvent.data);
      try {
        const data = JSON.parse(event.nativeEvent.data);
        // console.log("data", data);
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
    handleMessage,
  };
};
