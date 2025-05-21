import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      // Login bem-sucedido, navegar para a tela Home
      // Por enquanto só mostraremos um alerta, já que não temos a Home ainda
      alert("Sucesso", "Login realizado com sucesso!");
      // Quando você criar a tela Home, poderá usar:
      // navigation.navigate('Home');
    } catch (error) {
      let errorMessage = "Falha no login";

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "E-mail ou senha incorretos";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "E-mail inválido";
      }

      alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />

      <View style={styles.loginContainer}>
        <View style={styles.loginHeader}>
          <View style={styles.logoLoginContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoSmall}
            />
            <Text style={styles.logoText}>Gastrômetro</Text>
          </View>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Entre em Sua Conta</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#666"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.forgotPasswordText}>
              Não tem uma conta? Cadastre-se
            </Text>
          </TouchableOpacity>
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
  loginContainer: {
    flex: 1,
    backgroundColor: "#1E1E2E",
  },
  loginHeader: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: "center",
  },
  logoLoginContainer: {
    backgroundColor: "#2A2A3C",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: "center",
  },
  logoSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4D8FAC",
  },
  logoText: {
    marginTop: 5,
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    paddingHorizontal: 30,
    marginTop: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "white",
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#2A2A3C",
    borderRadius: 10,
    padding: 15,
    color: "white",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4D8FAC",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPassword: {
    marginTop: 20,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#4D8FAC",
    fontSize: 14,
  },
});

export default LoginScreen;
