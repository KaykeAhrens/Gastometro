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
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase";

const EditarGastoScreen = ({ navigation, route }) => {
  const { gasto } = route.params;
  const { currentUser } = useAuth();
  const [titulo, setTitulo] = useState(gasto.titulo || "");
  const [descricao, setDescricao] = useState(gasto.descricao || "");
  const [valor, setValor] = useState(
    gasto.valor ? gasto.valor.toString().replace(".", ",") : ""
  );
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);

  // Buscar categorias e definir categoria atual
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
      const snapshot = await getDocs(categoriasQuery);
      const categoriasData = [];

      snapshot.forEach((doc) => {
        categoriasData.push({ id: doc.id, ...doc.data() });
      });

      setCategorias(categoriasData);

      // Definir categoria atual baseada no gasto
      if (gasto.categoriaId) {
        const categoriaAtual = categoriasData.find(
          (cat) => cat.id === gasto.categoriaId
        );
        if (categoriaAtual) {
          setCategoriaSelecionada(categoriaAtual);
        }
      } else if (gasto.categoria && gasto.categoria !== "Outros") {
        const categoriaAtual = categoriasData.find(
          (cat) => cat.nome === gasto.categoria
        );
        if (categoriaAtual) {
          setCategoriaSelecionada(categoriaAtual);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const handleSalvarGasto = async () => {
    console.log("Iniciando atualização de gasto...");
    console.log("Dados:", {
      titulo,
      descricao,
      valor,
      categoria: categoriaSelecionada?.nome,
      gastoId: gasto.id,
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

    setLoading(true);
    try {
      console.log("Atualizando no Firebase...");
      await updateDoc(doc(db, "gastos", gasto.id), {
        titulo: titulo.trim(),
        descricao: descricao.trim() || "",
        valor: valorNumerico,
        categoria: categoriaSelecionada?.nome || "Outros",
        categoriaId: categoriaSelecionada?.id || null,
        updatedAt: serverTimestamp(),
      });

      console.log("Documento atualizado com sucesso");

      // Navegar automaticamente de volta
      console.log("Navegando de volta automaticamente...");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao atualizar gasto:", error);
      Alert.alert("Erro", `Erro ao atualizar gasto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirGasto = async () => {
    setLoading(true);
    try {
      console.log("Excluindo gasto do Firebase...");
      await deleteDoc(doc(db, "gastos", gasto.id));

      console.log("Gasto excluído com sucesso");
      Alert.alert("Sucesso", "Gasto excluído com sucesso!");

      // Navegar de volta automaticamente
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao excluir gasto:", error);
      Alert.alert("Erro", `Erro ao excluir gasto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoriaOption = (categoria) => (
    <TouchableOpacity
      key={categoria.id}
      style={styles.categoriaOption}
      onPress={() => {
        setCategoriaSelecionada(categoria);
        setModalCategoriaVisible(false);
      }}
    >
      <View style={styles.categoriaIconContainer}>
        <Text style={styles.categoriaIcon}>{categoria.icone}</Text>
      </View>
      <View style={styles.categoriaInfo}>
        <Text style={styles.categoriaNome}>{categoria.nome}</Text>
        <Text style={styles.categoriaOrcamento}>
          Orçamento: R$ {categoria.orcamento.toFixed(2).replace(".", ",")}
        </Text>
      </View>
      <View
        style={[
          styles.categoriaCorIndicator,
          { backgroundColor: categoria.cor },
        ]}
      />
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
        <Text style={styles.headerTitle}>Editar Gasto</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleExcluirGasto}
          disabled={loading}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Seleção de Categoria */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Categoria</Text>
          <TouchableOpacity
            style={[styles.input, styles.categoriaSelector]}
            onPress={() => setModalCategoriaVisible(true)}
          >
            {categoriaSelecionada ? (
              <View style={styles.categoriaSelecionadaContainer}>
                <Text style={styles.categoriaIconSelecionada}>
                  {categoriaSelecionada.icone}
                </Text>
                <Text style={styles.categoriaNomeSelecionada}>
                  {categoriaSelecionada.nome}
                </Text>
                <View
                  style={[
                    styles.categoriaCorSelecionada,
                    { backgroundColor: categoriaSelecionada.cor },
                  ]}
                />
              </View>
            ) : (
              <Text style={styles.categoriaSelectorPlaceholder}>
                Outros (sem categoria)
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionButtonsContainer}>
          {/* Botão Salvar */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSalvarGasto}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>

          {/* Botão Excluir */}
          <TouchableOpacity
            style={[
              styles.deleteButtonLarge,
              loading && styles.deleteButtonDisabled,
            ]}
            onPress={handleExcluirGasto}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.deleteButtonLargeText}>Excluir Gasto</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Modal de Seleção de Categoria */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCategoriaVisible}
        onRequestClose={() => setModalCategoriaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Categoria</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalCategoriaVisible(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Opção "Outros" */}
              <TouchableOpacity
                style={styles.categoriaOption}
                onPress={() => {
                  setCategoriaSelecionada(null);
                  setModalCategoriaVisible(false);
                }}
              >
                <View style={styles.categoriaIconContainer}>
                  <Text style={styles.categoriaIcon}>📂</Text>
                </View>
                <View style={styles.categoriaInfo}>
                  <Text style={styles.categoriaNome}>Outros</Text>
                  <Text style={styles.categoriaOrcamento}>
                    Sem orçamento definido
                  </Text>
                </View>
                <View
                  style={[
                    styles.categoriaCorIndicator,
                    { backgroundColor: "#666" },
                  ]}
                />
              </TouchableOpacity>

              {categorias.length === 0 ? (
                <View style={styles.emptyCategorias}>
                  <Text style={styles.emptyCategoriaText}>
                    Nenhuma categoria criada
                  </Text>
                </View>
              ) : (
                categorias.map(renderCategoriaOption)
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
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A2A3C",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 18,
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoriaSelecionadaContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoriaIconSelecionada: {
    fontSize: 20,
    marginRight: 10,
  },
  categoriaNomeSelecionada: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  categoriaCorSelecionada: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  categoriaSelectorPlaceholder: {
    color: "#666",
    fontSize: 16,
  },
  actionButtonsContainer: {
    marginTop: 20,
    gap: 15,
  },
  saveButton: {
    backgroundColor: "#4D8FAC",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#3A6D81",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButtonLarge: {
    backgroundColor: "#E74C3C",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButtonDisabled: {
    backgroundColor: "#A93226",
  },
  deleteButtonLargeText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#2A2A3C",
    width: "90%",
    maxHeight: "80%",
    borderRadius: 12,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A4D",
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    color: "#FFF",
    fontSize: 24,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  categoriaOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A4D",
  },
  categoriaIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4D8FAC20",
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
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  categoriaOrcamento: {
    color: "#BBB",
    fontSize: 12,
    marginTop: 2,
  },
  categoriaCorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },

  emptyCategorias: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyCategoriaText: {
    color: "#999",
    fontSize: 14,
  },
});

export default EditarGastoScreen;
