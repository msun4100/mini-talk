import React, { useState, useEffect } from "react";
import { Vibration, Platform } from "react-native";
import { ApolloProvider } from "react-apollo-hooks";
import * as Permissions from "expo-permissions";
import Constants from "expo-constants";
import { Notifications } from "expo";
import client from "./apollo";
import Chat from "./Chat";

export default function App() {
  const [notificationStatus, setStatus] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      let token = await Notifications.getExpoPushTokenAsync();
      console.log(token);
      setExpoPushToken(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }
    if (Platform.OS === "android") {
      Notifications.createChannelAndroidAsync("default", {
        name: "default",
        sound: true,
        priority: "max",
        vibrate: [0, 250, 250, 250],
      });
    }
  };
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <ApolloProvider client={client}>
      <Chat />
    </ApolloProvider>
  );
}
