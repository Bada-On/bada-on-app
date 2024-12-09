import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useUri = () => {
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

  return { uri };
};
