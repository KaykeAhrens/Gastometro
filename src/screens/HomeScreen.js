import React, { useState, useEffect } from "react";
import {View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, FlatList, Alert, } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, getDocs, } from "firebase/firestore";
import { ScrollView } from "react-native-web";

const HomeScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [gastos, setGastos] = useState([]);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!currentUser) return;

    // Buscar dados iniciais
    fetchGastos();

    // Configurar listener para atualizações em tempo real
    const gastosQuery = query(
      collection(db, "gastos"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
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

    return () => unsubscribe();
  }, [currentUser]);

  // Recarregar dados quando a tela ganha foco
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("Tela HomeScreen ganhou foco - recarregando dados");
      if (currentUser) {
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

  const formatCurrency = (value) => {
    if (typeof value !== "number") return "R$ 0,00";
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const renderGastoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gastoItem}
      onPress={() => navigation.navigate("EditarGasto", { gasto: item })}
      onLongPress={() => handleDeleteGasto(item.id)}
    >
      <View style={styles.gastoIcon}>
        <Text style={styles.gastoIconText}>$</Text>
      </View>
      <View style={styles.gastoInfo}>
        <Text style={styles.gastoTitle}>{item.titulo || "Sem título"}</Text>
        {item.descricao ? (
          <Text style={styles.gastoDescription}>{item.descricao}</Text>
        ) : null}
      </View>
      <View style={styles.gastoValue}>
        <Text style={styles.gastoValueText}>{formatCurrency(item.valor)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {/* <View style={styles.logo} /> */}
          <Text style={styles.textoHeader}>Início</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Saldo Atual */}
      <View style={styles.saldoContainer}>
        <Text style={styles.saldoLabel}>Total de Gastos</Text>
        <Text style={styles.saldoValue}>{formatCurrency(saldoAtual)}</Text>
      </View>

      {/* Gastos Mensais */}
      <View style={styles.gastosSection}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.sectionTitle}>
            Gastos Mensais ({gastos.length})
          </Text>
          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={() => navigation.navigate("AdicionarGasto")}
          >
            <Text style={styles.textoBotaoAdicionarGasto}>+</Text>
          </TouchableOpacity>
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
                  Toque no botão + para adicionar seu primeiro gasto
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
  logoutButton: {
    backgroundColor: "#2A2A3C",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: "#4D8FAC",
    fontSize: 14,
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
  listaGastos: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    color: "#CCCCCC",
    fontSize: 16,
  },
  gastoItem: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  gastoIcon: {
    backgroundColor: "#4D8FAC",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  gastoIconText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  gastoInfo: {
    flex: 1,
  },
  gastoTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  gastoDescription: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  gastoValue: {
    alignItems: "flex-end",
  },
  gastoValueText: {
    color: "#4D8FAC",
    fontSize: 16,
    fontWeight: "600",
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
  botaoAdicionar: {
    right: 20,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  textoBotaoAdicionarGasto: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
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

export default HomeScreen;
