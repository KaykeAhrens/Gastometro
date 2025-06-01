import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../contexts/AuthContext";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

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

// icone customizado para as abas
const TabIcon = ({ focused, name, color, size }) => {
  let nomeIcone;

  switch (name) {
    case "Home":
      nomeIcone = "home";
      break;
    case "Dashboard":
      nomeIcone = "dashboard";
      break;
    case "Categorias":
      nomeIcone = "folder";
      break;
    case "Perfil":
      nomeIcone = "person";
      break;
    default:
      nomeIcone = "help-outline";
  }

  return <Icon name={nomeIcone} size={size} color={color} />;
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon
            focused={focused}
            name={route.name}
            size={size}
            color={color}
          />
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
        options={{ tabBarLabel: "Início" }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: "Relatório" }}
      />
      <Tab.Screen
        name="Categorias"
        component={CategoriasScreen}
        options={{ tabBarLabel: "Categorias" }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ tabBarLabel: "Perfil" }}
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
