import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../contexts/AuthContext";
import { View, Text } from "react-native";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import PerfilScreen from "../screens/PerfilScreen";
import DashboardScreen from "../screens/DashboardScreen";
import CategoriasScreen from "../screens/CategoriasScreen";
import AdicionarGastoScreen from "../screens/AdicionarGastoScreen";
import EditarGastoScreen from "../screens/EditarGastoScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Ícone customizado para as abas
const TabIcon = ({ focused, name }) => {
  const getIconStyle = () => {
    switch (name) {
      case "Home":
        return { backgroundColor: focused ? "#4D8FAC" : "#666" };
      case "Dashboard":
        return { backgroundColor: focused ? "#4D8FAC" : "#666" };
      case "Categorias":
        return { backgroundColor: focused ? "#4D8FAC" : "#666" };
      case "Perfil":
        return { backgroundColor: focused ? "#4D8FAC" : "#666" };
      default:
        return { backgroundColor: "#666" };
    }
  };

  const getIconContent = () => {
    switch (name) {
      case "Home":
        return "🏠";
      case "Dashboard":
        return "📊";
      case "Categorias":
        return "📂";
      case "Perfil":
        return "👤";
      default:
        return "•";
    }
  };

  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        ...getIconStyle(),
      }}
    >
      <Text style={{ fontSize: 12 }}>{getIconContent()}</Text>
    </View>
  );
};

// Navegador de abas principais
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} name={route.name} />
        ),
        tabBarStyle: {
          backgroundColor: "#2A2A3C",
          borderTopColor: "#3A3A4C",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarActiveTintColor: "#4D8FAC",
        tabBarInactiveTintColor: "#666",
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Início",
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Relatórios",
        }}
      />
      <Tab.Screen
        name="Categorias"
        component={CategoriasScreen}
        options={{
          tabBarLabel: "Categorias",
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarLabel: "Perfil",
        }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={currentUser ? "MainTabs" : "Splash"}
        screenOptions={{ headerShown: false }}
      >
        {currentUser ? (
          // Telas autenticadas
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
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
