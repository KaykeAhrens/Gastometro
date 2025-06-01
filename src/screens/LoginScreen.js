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

  const realizarLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    setLoading(true); // pra fazer uma animaçãozinha basica de quando clica no cadastrar
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      // não precisa navegar manualmente, o AuthContext vai cuidar disso
    } catch (erro) {
      let msgErro = "Falha no login";
      // aqui tratamos os erros que podem acontecer no cadastro
      if (
        erro.code === "auth/user-not-found" ||
        erro.code === "auth/wrong-password" // o signInWithEmailAndPassword do firebase retorna uns padrões de erro, dxamos mais clean pro usuario
      ) {
        msgErro = "E-mail ou senha incorretos";
      } else if (erro.code === "auth/invalid-email") {
        msgErro = "E-mail inválido";
      } else if (erro.code === "auth/invalid-credential") {
        msgErro = "Credenciais inválidas";
      }

      Alert.alert("Erro", msgErro);
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
            <View />
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.logoText}>Gastômetro</Text>
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
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={realizarLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnCadastro}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.btnCadastroText}>
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
  buttonDisabled: {
    backgroundColor: "#3A3A4C",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  btnCadastro: {
    marginTop: 20,
    alignItems: "center",
  },
  btnCadastroText: {
    color: "#4D8FAC",
    fontSize: 14,
  },
});

export default LoginScreen;
