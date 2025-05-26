import React, { useState, useEffect } from "react";
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
  ScrollView,
  Modal,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase";

const AdicionarGastoScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Buscar categorias do usuário
  useEffect(() => {
    if (currentUser) {
      fetchCategorias();
    }
  }, [currentUser]);

  const fetchCategorias = async () => {
    try {
      const categoriasQuery = query(
        collection(db, "categorias"),
        where("userId", "==", currentUser.uid)
      );
      const categoriasSnapshot = await getDocs(categoriasQuery);
      const categoriasData = [];
      categoriasSnapshot.forEach((doc) => {
        categoriasData.push({ id: doc.id, ...doc.data() });
      });
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const handleCriarGasto = async () => {
    console.log("Iniciando criação de gasto...");
    console.log("Dados:", {
      titulo,
      descricao,
      valor,
      categoria,
      userId: currentUser?.uid,
    });

    if (!titulo.trim() || !valor.trim()) {
      Alert.alert("Erro", "Por favor, preencha pelo menos o título e o valor");
      return;
    }

    const valorNumerico = parseFloat(valor.replace(",", "."));
    console.log("Valor numérico:", valorNumerico);

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert("Erro", "Por favor, insira um valor válido");
      return;
    }

    if (!currentUser) {
      Alert.alert("Erro", "Usuário não encontrado");
      return;
    }

    setLoading(true);
    try {
      console.log("Enviando para Firebase...");
      const docRef = await addDoc(collection(db, "gastos"), {
        titulo: titulo.trim(),
        descricao: descricao.trim() || "",
        valor: valorNumerico,
        categoria: categoria || "Outros",
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("Documento criado com ID:", docRef.id);

      // Limpar os campos
      setTitulo("");
      setDescricao("");
      setValor("");
      setCategoria("");

      Alert.alert("Sucesso", "Gasto criado com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            console.log("Navegando de volta...");
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Erro ao criar gasto:", error);
      Alert.alert("Erro", `Erro ao criar gasto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategoria = (categoriaSelecionada) => {
    setCategoria(categoriaSelecionada.nome);
    setModalVisible(false);
  };

  const renderCategoriaItem = (cat) => (
    <TouchableOpacity
      key={cat.id}
      style={[styles.categoriaOption, { borderLeftColor: cat.cor }]}
      onPress={() => handleSelectCategoria(cat)}
    >
      <View style={styles.categoriaOptionContent}>
        <View style={styles.categoriaIconContainer}>
          <Text style={styles.categoriaIcon}>{cat.icone}</Text>
        </View>
        <View style={styles.categoriaInfo}>
          <Text style={styles.categoriaNome}>{cat.nome}</Text>
          <Text style={styles.categoriaOrcamento}>
            Orçamento: R$ {cat.orcamento.toFixed(2).replace(".", ",")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Gasto</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.formContainer}>
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

        {/* Campo Categoria */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Categoria</Text>
          <TouchableOpacity
            style={[styles.input, styles.categoriaSelector]}
            onPress={() => setModalVisible(true)}
          >
            <Text
              style={[
                styles.categoriaText,
                !categoria && styles.placeholderText,
              ]}
            >
              {categoria || "Selecionar categoria"}
            </Text>
            <Text style={styles.selectorArrow}>›</Text>
          </TouchableOpacity>
          {categoria && (
            <TouchableOpacity
              style={styles.clearCategoriaButton}
              onPress={() => setCategoria("")}
            >
              <Text style={styles.clearCategoriaText}>Limpar seleção</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Debug Info */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            User ID: {currentUser?.uid || "Não encontrado"}
          </Text>
          <Text style={styles.debugText}>
            Categoria selecionada: {categoria || "Nenhuma"}
          </Text>
        </View>

        {/* Botão Criar */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCriarGasto}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Criar Gasto</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Modal para selecionar categoria */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Categoria</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Opção "Outros" */}
              <TouchableOpacity
                style={[styles.categoriaOption, { borderLeftColor: "#666" }]}
                onPress={() =>
                  handleSelectCategoria({
                    nome: "Outros",
                    icone: "📂",
                    cor: "#666",
                  })
                }
              >
                <View style={styles.categoriaOptionContent}>
                  <View style={styles.categoriaIconContainer}>
                    <Text style={styles.categoriaIcon}>📂</Text>
                  </View>
                  <View style={styles.categoriaInfo}>
                    <Text style={styles.categoriaNome}>Outros</Text>
                    <Text style={styles.categoriaOrcamento}>
                      Categoria padrão
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Categorias criadas pelo usuário */}
              {categorias.map(renderCategoriaItem)}

              {categorias.length === 0 && (
                <View style={styles.emptyCategorias}>
                  <Text style={styles.emptyCategoriaText}>
                    Nenhuma categoria criada
                  </Text>
                  <TouchableOpacity
                    style={styles.createCategoriaButton}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate("Categorias");
                    }}
                  >
                    <Text style={styles.createCategoriaText}>
                      Criar primeira categoria
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  categoriaSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoriaText: {
    color: "white",
    fontSize: 16,
  },
  placeholderText: {
    color: "#666",
  },
  selectorArrow: {
    color: "#4D8FAC",
    fontSize: 20,
    fontWeight: "bold",
  },
  clearCategoriaButton: {
    marginTop: 8,
  },
  clearCategoriaText: {
    color: "#E74C3C",
    fontSize: 14,
  },
  debugContainer: {
    backgroundColor: "#2A2A3C",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  debugText: {
    color: "#CCCCCC",
    fontSize: 12,
  },
  createButton: {
    backgroundColor: "#4D8FAC",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 30,
  },
  createButtonDisabled: {
    backgroundColor: "#3A3A4C",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    width: "90%",
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A4C",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    color: "#4D8FAC",
    fontSize: 24,
    fontWeight: "bold",
  },
  modalContent: {
    padding: 20,
  },
  categoriaOption: {
    backgroundColor: "#3A3A4C",
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  categoriaOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  categoriaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A2A3C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoriaIcon: {
    fontSize: 18,
  },
  categoriaInfo: {
    flex: 1,
  },
  categoriaNome: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  categoriaOrcamento: {
    color: "#CCCCCC",
    fontSize: 12,
  },
  emptyCategorias: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyCategoriaText: {
    color: "#CCCCCC",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  createCategoriaButton: {
    backgroundColor: "#4D8FAC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createCategoriaText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default AdicionarGastoScreen;
