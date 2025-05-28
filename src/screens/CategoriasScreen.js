import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
 
const { width } = Dimensions.get("window");

const CategoriasScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    orcamento: "",
    icone: "💰",
    cor: "#4D8FAC",
  });

  const icones = [
    "💰",
    "🏠",
    "🚗",
    "🍔",
    "👕",
    "🎮",
    "📱",
    "⚡",
    "🏥",
    "🎓",
    "🎬",
    "🛒",
  ];
  const cores = [
    "#4D8FAC",
    "#E74C3C",
    "#27AE60",
    "#F39C12",
    "#9B59B6",
    "#E67E22",
    "#1ABC9C",
    "#34495E",
  ];

  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeCategorias;
    let unsubscribeGastos;

    // Listener para categorias
    const categoriasQuery = query(
      collection(db, "categorias"),
      where("userId", "==", currentUser.uid)
    );

    unsubscribeCategorias = onSnapshot(categoriasQuery, (snapshot) => {
      const categoriasData = [];
      snapshot.forEach((doc) => {
        categoriasData.push({ id: doc.id, ...doc.data() });
      });
      setCategorias(categoriasData);
    });

    // Listener para gastos
    const gastosQuery = query(
      collection(db, "gastos"),
      where("userId", "==", currentUser.uid)
    );

    unsubscribeGastos = onSnapshot(gastosQuery, (snapshot) => {
      const gastosData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        gastosData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      setGastos(gastosData);
      setLoading(false);
    });

    return () => {
      if (unsubscribeCategorias) unsubscribeCategorias();
      if (unsubscribeGastos) unsubscribeGastos();
    };
  }, [currentUser]);

  // Recarregar quando a tela ganha foco
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("Tela Categorias ganhou foco");
      // Os listeners já estão cuidando da atualização em tempo real
    });

    return unsubscribe;
  }, [navigation]);

  const calcularGastosPorCategoria = () => {
    const gastosPorCategoria = {};

    // Primeiro, inicializar todas as categorias com 0
    categorias.forEach((categoria) => {
      gastosPorCategoria[categoria.nome] = 0;
    });

    // Adicionar categoria "Outros" se não existir
    gastosPorCategoria["Outros"] = 0;

    // Somar os gastos por categoria
    gastos.forEach((gasto) => {
      const categoria = gasto.categoria || "Outros";
      if (!gastosPorCategoria[categoria]) {
        gastosPorCategoria[categoria] = 0;
      }
      gastosPorCategoria[categoria] += gasto.valor || 0;
    });

    return gastosPorCategoria;
  };

  const handleSaveCategoria = async () => {
    if (!formData.nome.trim()) {
      Alert.alert("Erro", "Nome da categoria é obrigatório");
      return;
    }

    if (!formData.orcamento || isNaN(parseFloat(formData.orcamento))) {
      Alert.alert("Erro", "Orçamento deve ser um valor válido");
      return;
    }

    try {
      const categoriaData = {
        nome: formData.nome.trim(),
        orcamento: parseFloat(formData.orcamento),
        icone: formData.icone,
        cor: formData.cor,
        userId: currentUser.uid,
        createdAt: new Date(),
      };

      if (editingCategoria) {
        await setDoc(doc(db, "categorias", editingCategoria.id), {
          ...categoriaData,
          createdAt: editingCategoria.createdAt,
        });
        Alert.alert("Sucesso", "Categoria atualizada com sucesso!");
      } else {
        const newDocRef = doc(collection(db, "categorias"));
        await setDoc(newDocRef, categoriaData);
        Alert.alert("Sucesso", "Categoria criada com sucesso!");
      }

      setModalVisible(false);
      setEditingCategoria(null);
      setFormData({ nome: "", orcamento: "", icone: "💰", cor: "#4D8FAC" });
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      Alert.alert("Erro", "Erro ao salvar categoria");
    }
  };

  const handleEditCategoria = (categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nome: categoria.nome,
      orcamento: categoria.orcamento.toString(),
      icone: categoria.icone,
      cor: categoria.cor,
    });
    setModalVisible(true);
  };

  const handleDeleteCategoria = (categoria) => {
    Alert.alert("Confirmar", "Tem certeza que deseja excluir esta categoria?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "categorias", categoria.id));
            Alert.alert("Sucesso", "Categoria excluída com sucesso!");
          } catch (error) {
            console.error("Erro ao excluir categoria:", error);
            Alert.alert("Erro", "Erro ao excluir categoria");
          }
        },
      },
    ]);
  };

  const formatCurrency = (value) => {
    if (typeof value !== "number") return "R$ 0,00";
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const calcularPercentual = (gasto, orcamento) => {
    if (orcamento === 0) return 0;
    return Math.min((gasto / orcamento) * 100, 100);
  };

  const getCorProgresso = (percentual) => {
    if (percentual < 50) return "#27AE60";
    if (percentual < 80) return "#F39C12";
    return "#E74C3C";
  };

  const gastosPorCategoria = calcularGastosPorCategoria();

  const renderCategoriaItem = (categoria) => {
    const gastoAtual = gastosPorCategoria[categoria.nome] || 0;
    const percentual = calcularPercentual(gastoAtual, categoria.orcamento);
    const corProgresso = getCorProgresso(percentual);
    const restante = Math.max(categoria.orcamento - gastoAtual, 0);

    return (
      <TouchableOpacity
        key={categoria.id}
        style={[styles.categoriaItem, { borderLeftColor: categoria.cor }]}
        onPress={() => handleEditCategoria(categoria)}
        onLongPress={() => handleDeleteCategoria(categoria)}
      >
        <View style={styles.categoriaHeader}>
          <View style={styles.categoriaIconContainer}>
            <Text style={styles.categoriaIcon}>{categoria.icone}</Text>
          </View>
          <View style={styles.categoriaInfo}>
            <Text style={styles.categoriaNome}>{categoria.nome}</Text>
            <Text style={styles.categoriaOrcamento}>
              Orçamento: {formatCurrency(categoria.orcamento)}
            </Text>
          </View>
          <View style={styles.categoriaValores}>
            <Text style={styles.categoriaGasto}>
              {formatCurrency(gastoAtual)}
            </Text>
            <Text style={styles.categoriaRestante}>
              Resta: {formatCurrency(restante)}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percentual}%`,
                  backgroundColor: corProgresso,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{percentual.toFixed(1)}%</Text>
        </View>

        {percentual > 100 && (
          <View style={styles.alertContainer}>
            <Text style={styles.alertText}>⚠️ Orçamento excedido!</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Renderizar categoria "Outros" se houver gastos sem categoria específica
  const renderOutrosCategoria = () => {
    const gastoOutros = gastosPorCategoria["Outros"] || 0;

    if (gastoOutros === 0) return null;

    return (
      <View style={[styles.categoriaItem, { borderLeftColor: "#666" }]}>
        <View style={styles.categoriaHeader}>
          <View style={styles.categoriaIconContainer}>
            <Text style={styles.categoriaIcon}>📂</Text>
          </View>
          <View style={styles.categoriaInfo}>
            <Text style={styles.categoriaNome}>Outros</Text>
            <Text style={styles.categoriaOrcamento}>
              Sem orçamento definido
            </Text>
          </View>
          <View style={styles.categoriaValores}>
            <Text style={styles.categoriaGasto}>
              {formatCurrency(gastoOutros)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando categorias...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />

      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity> */}
        <Text style={styles.tituloHeader}>Categorias</Text>
        <TouchableOpacity style={styles.botaoAdicionar} onPress={() => setModalVisible(true)}>
          <Text style={styles.textoBotaoAdicionar}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Resumo */}
      <View style={styles.resumoContainer}>
        <Text style={styles.resumoTitle}>Resumo dos Orçamentos</Text>
        <View style={styles.resumoStats}>
          <View style={styles.resumoStat}>
            <Text style={styles.resumoStatLabel}>Categorias</Text>
            <Text style={styles.resumoStatValue}>{categorias.length}</Text>
          </View>
          <View style={styles.resumoStat}>
            <Text style={styles.resumoStatLabel}>Orçamento Total</Text>
            <Text style={styles.resumoStatValue}>
              {formatCurrency(
                categorias.reduce((acc, cat) => acc + cat.orcamento, 0)
              )}
            </Text>
          </View>
          <View style={styles.resumoStat}>
            <Text style={styles.resumoStatLabel}>Gasto Total</Text>
            <Text style={styles.resumoStatValue}>
              {formatCurrency(
                Object.values(gastosPorCategoria).reduce(
                  (acc, val) => acc + val,
                  0
                )
              )}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {categorias.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma categoria criada</Text>
            <Text style={styles.emptySubtext}>
              Toque no + para criar sua primeira categoria
            </Text>
          </View>
        ) : (
          <>
            {categorias.map(renderCategoriaItem)}
            {renderOutrosCategoria()}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal para criar/editar categoria */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategoria ? "Editar Categoria" : "Nova Categoria"}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome da Categoria</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.nome}
                  onChangeText={(text) =>
                    setFormData({ ...formData, nome: text })
                  }
                  placeholder="Ex: Alimentação, Transporte..."
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Orçamento Mensal</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.orcamento}
                  onChangeText={(text) =>
                    setFormData({ ...formData, orcamento: text })
                  }
                  placeholder="0,00"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ícone</Text>
                <View style={styles.iconGrid}>
                  {icones.map((icone) => (
                    <TouchableOpacity
                      key={icone}
                      style={[
                        styles.iconOption,
                        formData.icone === icone && styles.iconOptionSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, icone })}
                    >
                      <Text style={styles.iconOptionText}>{icone}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cor</Text>
                <View style={styles.colorGrid}>
                  {cores.map((cor) => (
                    <TouchableOpacity
                      key={cor}
                      style={[
                        styles.colorOption,
                        { backgroundColor: cor },
                        formData.cor === cor && styles.colorOptionSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, cor })}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveCategoria}
              >
                <Text style={styles.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: "#2A2A3C",
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#4D8FAC",
    fontSize: 18,
    fontWeight: "bold",
  },
  tituloHeader: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  botaoAdicionar: {
    justifyContent: "center",
    alignItems: "center",
  },
  textoBotaoAdicionar: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  resumoContainer: {
    backgroundColor: "#2A2A3C",
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  resumoTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  resumoStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resumoStat: {
    alignItems: "center",
    flex: 1,
  },
  resumoStatLabel: {
    color: "#CCCCCC",
    fontSize: 12,
    marginBottom: 5,
    textAlign: "center",
  },
  resumoStatValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#CCCCCC",
    fontSize: 16,
  },
  categoriaItem: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  categoriaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  categoriaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3A3A4C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoriaIcon: {
    fontSize: 20,
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
  categoriaValores: {
    alignItems: "flex-end",
  },
  categoriaGasto: {
    color: "#4D8FAC",
    fontSize: 16,
    fontWeight: "bold",
  },
  categoriaRestante: {
    color: "#CCCCCC",
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#3A3A4C",
    borderRadius: 3,
    marginRight: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    color: "#CCCCCC",
    fontSize: 12,
    fontWeight: "600",
    width: 40,
    textAlign: "right",
  },
  alertContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#E74C3C20",
    borderRadius: 6,
  },
  alertText: {
    color: "#E74C3C",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#CCCCCC",
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
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
    width: width - 40,
    maxHeight: "80%",
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#3A3A4C",
    borderRadius: 8,
    padding: 12,
    color: "white",
    fontSize: 16,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconOption: {
    backgroundColor: "#3A3A4C",
    padding: 12,
    borderRadius: 8,
    width: 50,
    alignItems: "center",
  },
  iconOptionSelected: {
    backgroundColor: "#4D8FAC",
  },
  iconOptionText: {
    fontSize: 20,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: "white",
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#3A3A4C",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#CCCCCC",
    fontSize: 16,
    fontWeight: "600",
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: "#4D8FAC",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  modalSaveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CategoriasScreen;
