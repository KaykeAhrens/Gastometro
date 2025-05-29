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
  ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (senha !== confirmaSenha) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
      navigation.navigate("Login");
    } catch (error) {
      let errorMessage = "Erro ao cadastrar usuário";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este e-mail já está em uso";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "E-mail inválido";
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />

      <View style={styles.loginContainer}>
        <View style={styles.loginHeader}>
          <View style={styles.logoLoginContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoSmall}
            />
            <Text style={styles.logoText}>Gastômetro</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Crie sua conta</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              placeholderTextColor="#666"
              value={nome}
              onChangeText={setNome}
            />
          </View>

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

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirmar Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirme sua senha"
              placeholderTextColor="#666"
              value={confirmaSenha}
              onChangeText={setConfirmaSenha}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginLinkText}>
              Já tem uma conta? Entre aqui
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 15,
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
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginLinkText: {
    color: "#4D8FAC",
    fontSize: 14,
  },
});

export default RegisterScreen;
