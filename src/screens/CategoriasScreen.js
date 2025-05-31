import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
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
import Icon from "react-native-vector-icons/MaterialIcons";

// Importar os componentes personalizados
import BotaoAcao from "../components/BotaoAcao";
import BotaoSimples from "../components/BotaoSimples";
import CategoriaItem from "../components/CategoriaItem";
import ModalCategoria from "../components/ModalCategoria";

const CategoriasScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    orcamento: "",
    icone: "attach-money",
    cor: "#4D8FAC",
  });

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

  const handleNovaCategoria = () => {
    // Limpar todos os estados de edição
    setEditingCategoria(null);
    setFormData({
      nome: "",
      orcamento: "",
      icone: "attach-money",
      cor: "#4D8FAC",
    });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingCategoria(null);
    setFormData({
      nome: "",
      orcamento: "",
      icone: "attach-money",
      cor: "#4D8FAC",
    });
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

    setSalvando(true);

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

      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      Alert.alert("Erro", "Erro ao salvar categoria");
    } finally {
      setSalvando(false);
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

  const gastosPorCategoria = calcularGastosPorCategoria();

  // Renderizar categoria "Outros" se houver gastos sem categoria específica
  const renderOutrosCategoria = () => {
    const gastoOutros = gastosPorCategoria["Outros"] || 0;

    if (gastoOutros === 0) return null;

    return (
      <View style={[styles.categoriaItem, { borderLeftColor: "#666" }]}>
        <View style={styles.categoriaHeader}>
          <View style={styles.categoriaIconContainer}>
            <Icon name="folder" size={20} color="white" />
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
        <Text style={styles.tituloHeader}>Categorias</Text>
        <BotaoSimples
          titulo="Nova Categoria"
          aoPressionar={handleNovaCategoria}
          corTexto="white"
          estilo={styles.botaoNova}
        />
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
              Toque em "Nova" para criar sua primeira categoria
            </Text>
            <BotaoAcao
              titulo="Criar Primeira Categoria"
              aoPressionar={handleNovaCategoria}
              estilo={styles.botaoCriarPrimeira}
            />
          </View>
        ) : (
          <>
            {categorias.map((categoria) => (
              <CategoriaItem
                key={categoria.id}
                categoria={categoria}
                gastoAtual={gastosPorCategoria[categoria.nome] || 0}
                aoEditar={handleEditCategoria}
                aoExcluir={handleDeleteCategoria}
                formatCurrency={formatCurrency}
              />
            ))}
            {renderOutrosCategoria()}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal para criar/editar categoria */}
      <ModalCategoria
        visivel={modalVisible}
        editandoCategoria={editingCategoria}
        dadosFormulario={formData}
        alterarDadosFormulario={setFormData}
        aoFechar={handleCloseModal}
        aoSalvar={handleSaveCategoria}
        salvando={salvando}
      />
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
  tituloHeader: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  botaoNova: {
    backgroundColor: "#2A2A3C",
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    marginBottom: 20,
  },
  botaoCriarPrimeira: {
    marginTop: 10,
    width: 250,
  },
  // Estilos para o componente "Outros" que ficou inline
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
});

export default CategoriasScreen;
