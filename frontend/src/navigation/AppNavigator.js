import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthScreen from "../screens/AuthScreen";
import FeedScreen from "../screens/FeedScreen";
import UploadScreen from "../screens/UploadScreen";
import MediaDetailsScreen from "../screens/MediaDetailsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!token ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Feed" component={FeedScreen} options={{ title: "Media Feed" }} />
            <Stack.Screen name="Upload" component={UploadScreen} options={{ title: "Upload Media" }} />
            <Stack.Screen
              name="MediaDetails"
              component={MediaDetailsScreen}
              options={{ title: "Media Details" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}