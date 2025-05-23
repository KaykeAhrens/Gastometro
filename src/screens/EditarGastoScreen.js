import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

const EditarGastoScreen = ({ navigation, route }) => {
  const { gasto } = route.params;
  const [titulo, setTitulo] = useState(gasto.titulo);
  const [descricao, setDescricao] = useState(gasto.descricao || "");
  const [valor, setValor] = useState(gasto.valor.toString().replace(".", ","));
  const [loading, setLoading] = useState(false);

  const handleAtualizarGasto = async () => {
    if (!titulo.trim() || !valor.trim()) {
      Alert.alert("Erro", "Por favor, preencha pelo menos o título e o valor");
      return;
    }

    const valorNumerico = parseFloat(valor.replace(",", "."));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert("Erro", "Por favor, insira um valor válido");
      return;
    }

    setLoading(true);
    try {
      const gastoRef = doc(db, "gastos", gasto.id);
      await updateDoc(gastoRef, {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        valor: valorNumerico,
        updatedAt: serverTimestamp(),
      });

      console.log("Gasto atualizado com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao atualizar gasto:", error);
      Alert.alert("Erro", "Erro ao atualizar gasto: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Gasto</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.formContainer}>
        {/* Campo Título */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: McDonald's"
            placeholderTextColor="#666"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={50}
          />
        </View>

        {/* Campo Descrição */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: 2 combo Big Mac, grande + sundae de chocolate"
            placeholderTextColor="#666"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Campo Valor */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Valor *</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            placeholderTextColor="#666"
            value={valor}
            onChangeText={setValor}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        {/* Botão Atualizar */}
        <TouchableOpacity
          style={[styles.updateButton, loading && styles.updateButtonDisabled]}
          onPress={handleAtualizarGasto}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.updateButtonText}>Atualizar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2E",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A3C",
  },
  backButton: {
    color: "#4D8FAC",
    fontSize: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    padding: 15,
    color: "white",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3A3A4C",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  updateButton: {
    backgroundColor: "#4D8FAC",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 30,
  },
  updateButtonDisabled: {
    backgroundColor: "#3A3A4C",
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#2A2A3C",
    paddingVertical: 15,
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    padding: 10,
  },
  navIcon: {
    width: 24,
    height: 24,
    backgroundColor: "#666",
    borderRadius: 4,
  },
});

export default EditarGastoScreen;
