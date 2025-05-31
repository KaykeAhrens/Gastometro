import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";

// Importando os componentes
import BotaoSimples from "../components/BotaoSimples";
import ItemGasto from "../components/ItemGasto";

const HomeScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [loading, setLoading] = useState(true);

  // Função para buscar categorias
  const fetchCategorias = async () => {
    if (!currentUser) return;

    try {
      const categoriasQuery = query(
        collection(db, "categorias"),
        where("userId", "==", currentUser.uid)
      );

      const snapshot = await getDocs(categoriasQuery);
      const categoriasData = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        categoriasData.push({
          id: doc.id,
          ...data,
        });
      });

      setCategorias(categoriasData);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  // Função para buscar gastos
  const fetchGastos = async () => {
    if (!currentUser) return;

    try {
      console.log("Buscando gastos para o usuário:", currentUser.uid);

      const gastosQuery = query(
        collection(db, "gastos"),
        where("userId", "==", currentUser.uid)
      );

      const snapshot = await getDocs(gastosQuery);
      console.log("Documentos encontrados:", snapshot.size);

      const gastosData = [];
      let total = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const gasto = {
          id: doc.id,
          ...data,
          // Garantir que createdAt existe para ordenação
          createdAt: data.createdAt || new Date(),
        };
        console.log("Gasto encontrado:", gasto);
        gastosData.push(gasto);
        total += gasto.valor || 0;
      });

      // Ordenar por data de criação (mais recente primeiro)
      gastosData.sort((a, b) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt);
        return dateB - dateA;
      });

      setGastos(gastosData);
      setSaldoAtual(total);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar gastos:", error);
      Alert.alert("Erro", "Erro ao carregar gastos: " + error.message);
      setLoading(false);
    }
  };

  // Função para obter o ícone da categoria
  const obterIconeCategoria = (nomeCategoria) => {
    if (!nomeCategoria) return "folder"; // Ícone padrão para "Outros"

    const categoria = categorias.find((cat) => cat.nome === nomeCategoria);
    return categoria ? categoria.icone : "folder";
  };

  // Função para obter a cor da categoria
  const obterCorCategoria = (nomeCategoria) => {
    if (!nomeCategoria) return "#666"; // Cor padrão para "Outros"

    const categoria = categorias.find((cat) => cat.nome === nomeCategoria);
    return categoria ? categoria.cor : "#666";
  };

  useEffect(() => {
    if (!currentUser) return;

    // Buscar dados iniciais
    fetchCategorias();
    fetchGastos();

    // Configurar listener para atualizações em tempo real dos gastos
    const gastosQuery = query(
      collection(db, "gastos"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribeGastos = onSnapshot(
      gastosQuery,
      (snapshot) => {
        console.log("Snapshot recebido:", snapshot.size, "documentos");
        const gastosData = [];
        let total = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const gasto = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt || new Date(),
          };
          console.log("Gasto do snapshot:", gasto);
          gastosData.push(gasto);
          total += gasto.valor || 0;
        });

        // Ordenar por data de criação
        gastosData.sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt);
          return dateB - dateA;
        });

        setGastos(gastosData);
        setSaldoAtual(total);
        setLoading(false);
      },
      (error) => {
        console.error("Erro no listener:", error);
        Alert.alert("Erro", "Erro ao carregar gastos em tempo real");
        setLoading(false);
      }
    );

    // Configurar listener para atualizações em tempo real das categorias
    const categoriasQuery = query(
      collection(db, "categorias"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribeCategorias = onSnapshot(categoriasQuery, (snapshot) => {
      const categoriasData = [];
      snapshot.forEach((doc) => {
        categoriasData.push({ id: doc.id, ...doc.data() });
      });
      setCategorias(categoriasData);
    });

    return () => {
      unsubscribeGastos();
      unsubscribeCategorias();
    };
  }, [currentUser]);

  // Recarregar dados quando a tela ganha foco
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("Tela HomeScreen ganhou foco - recarregando dados");
      if (currentUser) {
        fetchCategorias();
        fetchGastos();
      }
    });

    return unsubscribe;
  }, [navigation, currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      Alert.alert("Erro", "Erro ao fazer logout");
    }
  };

  const handleDeleteGasto = async (gastoId) => {
    Alert.alert("Confirmar", "Tem certeza que deseja excluir este gasto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "gastos", gastoId));
            Alert.alert("Sucesso", "Gasto excluído com sucesso!");
          } catch (error) {
            console.error("Erro ao excluir gasto:", error);
            Alert.alert("Erro", "Erro ao excluir gasto");
          }
        },
      },
    ]);
  };

  const handleEditGasto = (gasto) => {
    navigation.navigate("EditarGasto", { gasto });
  };

  const formatCurrency = (value) => {
    if (typeof value !== "number") return "R$ 0,00";
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const renderGastoItem = ({ item }) => (
    <ItemGasto
      gasto={item}
      aoPressionar={handleEditGasto}
      aoPressionarLongo={handleDeleteGasto}
      obterIconeCategoria={obterIconeCategoria}
      obterCorCategoria={obterCorCategoria}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.textoHeader}>Início</Text>
        </View>
        <BotaoSimples
          titulo="Sair"
          aoPressionar={handleLogout}
          corTexto="#4D8FAC"
        />
      </View>

      {/* Saldo Atual */}
      <View style={styles.saldoContainer}>
        <Text style={styles.saldoLabel}>Total de Gastos</Text>
        <Text style={styles.saldoValue}>{formatCurrency(saldoAtual)}</Text>
      </View>

      {/* Gastos Mensais */}
      <View style={styles.gastosSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gastos ({gastos.length})</Text>
          <BotaoSimples
            titulo="+ Adicionar"
            aoPressionar={() => navigation.navigate("AdicionarGasto")}
            corTexto="white"
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando gastos...</Text>
          </View>
        ) : (
          <FlatList
            style={styles.listaGastos}
            data={gastos}
            renderItem={renderGastoItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.containerVazio}>
                <Text style={styles.textoVazio}>Nenhum gasto cadastrado</Text>
                <Text style={styles.assuntoVazio}>
                  Toque no botão "Adicionar" para criar seu primeiro gasto
                </Text>
              </View>
            }
          />
        )}
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
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textoHeader: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  saldoContainer: {
    backgroundColor: "#2A2A3C",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 15,
    alignItems: "flex-start",
  },
  saldoLabel: {
    color: "#CCCCCC",
    fontSize: 14,
    marginBottom: 5,
  },
  saldoValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  gastosSection: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  listaGastos: {
    marginBottom: 30,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    color: "#CCCCCC",
    fontSize: 16,
  },
  containerVazio: {
    alignItems: "center",
    marginTop: 50,
  },
  textoVazio: {
    color: "#CCCCCC",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 8,
  },
  assuntoVazio: {
    color: "#888",
    textAlign: "center",
    fontSize: 14,
  },
});

export default HomeScreen;
