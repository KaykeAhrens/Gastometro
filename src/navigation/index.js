import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import AdicionarGastoScreen from "../screens/AdicionarGastoScreen";
import EditarGastoScreen from "../screens/EditarGastoScreen";

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={currentUser ? "Home" : "Splash"}
        screenOptions={{ headerShown: false }}
      >
        {currentUser ? (
          // Telas autenticadas
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="AdicionarGasto"
              component={AdicionarGastoScreen}
            />
            <Stack.Screen name="EditarGasto" component={EditarGastoScreen} />
          </>
        ) : (
          // Telas de autenticação
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
