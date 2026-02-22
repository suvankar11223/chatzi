import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "../utils/network";

export const apiFetch = async (endpoint: string, options: any = {}) => {
  const apiUrl = await getApiUrl();
  const token = await AsyncStorage.getItem("token");

  const res = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const json = await res.json();
  return json;
};
