import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // vai pra tela de login dps de 2 segundos
    const cronometro = setTimeout(() => {
      navigation.replace("Login");
    }, 2000);

    return () => clearTimeout(cronometro);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />

      <View style={styles.splashContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.nomeApp}>Gastômetro</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2E",
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E2E",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2A2A3C",
  },
  nomeApp: {
    marginTop: 15,
    fontSize: 24,
    color: "white",
    fontWeight: "600",
  },
});

export default SplashScreen;
