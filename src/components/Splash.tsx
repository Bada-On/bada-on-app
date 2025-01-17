import { View, Text } from "react-native";

export default function Splash() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1764BE",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "white",
          fontFamily: "Pretendard-Bold",
          fontSize: 28,
          fontWeight: "700",
        }}
      >
        바다온
      </Text>
    </View>
  );
}
