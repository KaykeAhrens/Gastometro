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
  const { currentUser } = useAuth(); // pega o usuario logado
  const [gastos, setGastos] = useState([]); // lista de gastos do usuário
  const [categorias, setCategorias] = useState([]); // lista de categorias cadastradas
  const [saldoAtual, setSaldoAtual] = useState(0); // saldo atual calculado
  const [loading, setLoading] = useState(true); // pra fazer animação de carregamento

  // buscar categorias cadastradas
  const buscarCategorias = async () => {
    if (!currentUser) return;

    try {
      const categoriasQuery = query(
        collection(db, "categorias"), // coleção de categorias no Firestore
        where("userId", "==", currentUser.uid) // filtra por usuário logado  onde userId é o ID do usuário logado
      );

      const resultado = await getDocs(categoriasQuery);
      const categoriasEncontradas = [];

      // percorre cada categoria adiciona ao array de categorias encontradas, incluindo também o ID de cada documento do Firestore.
      resultado.forEach((doc) => {
        const data = doc.data();
        categoriasEncontradas.push({
          id: doc.id,
          ...data, // operador spread (...) para incluir todos os campos da categoria (id, nome, icone, cor, etc.)
        });
      });

      setCategorias(categoriasEncontradas);
    } catch (erro) {
      //console.log("Erro ao buscar categorias:");
    }
  };

  // buscar os gastos do usuario logado
  const buscarGastos = async () => {
    if (!currentUser) return;

    try {
      //console.log("Buscando gastos para o usuário:", currentUser.uid);

      const gastosQuery = query(
        collection(db, "gastos"), // coleção de gastos no Firestore
        where("userId", "==", currentUser.uid) // filtra por usuário logado  onde userId é o ID do usuário logado
      );

      const resultado = await getDocs(gastosQuery);
      //console.log("Documentos encontrados:", resultado.size);

      const gastosEncontrados = [];
      let total = 0;

      resultado.forEach((doc) => {
        const data = doc.data();
        const gasto = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt || new Date(), // busca o createdAt do gasto no firestore ou define como a data atual se não existir
        };
        //console.log("Gasto encontrado:", gasto);
        gastosEncontrados.push(gasto);
        total += gasto.valor || 0; // soma o valor do gasto ao total, se gasto.valor for null, soma 0.
      });

      // ordena por data de criação (mais recente primeiro)
      // o campo createdAt vem como Timestamp do Firebase ent o código verifica se o campo createdAt tem o método .toDate() (o que indica que é um Timestamp do Firebase).
      // se existir, converte corretamente usando .toDate();
      // caso contrário, assume que já é uma data ou string válida e usa new Date().
      gastosEncontrados.sort((a, b) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt);
        return dateB - dateA;
      });

      setGastos(gastosEncontrados);
      setSaldoAtual(total);
      setLoading(false);
    } catch (erro) {
      Alert.alert("Erro", "Erro ao carregar gastos");
      setLoading(false);
    }
  };

  // pega o ícone da categoria
  const obterIconeCategoria = (nomeCategoria) => {
    if (!nomeCategoria) return "folder"; // icone padrão pra "outros"

    const categoria = categorias.find((cat) => cat.nome === nomeCategoria);
    return categoria ? categoria.icone : "folder";
  };

  // pega a cor da categoria
  const obterCorCategoria = (nomeCategoria) => {
    if (!nomeCategoria) return "#666"; // cor padrão pra "outros"

    const categoria = categorias.find((cat) => cat.nome === nomeCategoria);
    return categoria ? categoria.cor : "#666";
  };

  useEffect(() => {
    if (!currentUser) return;

    buscarCategorias();
    buscarGastos();

    const gastosQuery = query(
      collection(db, "gastos"), // coleção de gastos no Firestore
      where("userId", "==", currentUser.uid) // filtra por usuário logado  onde userId é o ID do usuário logado
    );

    // atualizacao em tempo real dos gastos
    const atualizarGastos = onSnapshot(
      gastosQuery,
      (resultado) => {
        const gastosEncontrados = [];
        let total = 0;

        // percorre cada gasto retornado pelo snapshot
        resultado.forEach((doc) => {
          const data = doc.data();
          const gasto = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt || new Date(),
          };
          gastosEncontrados.push(gasto);
          total += gasto.valor || 0;
        });

        // ordena por data de criação
        gastosEncontrados.sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt);
          return dateB - dateA;
        });

        setGastos(gastosEncontrados);
        setSaldoAtual(total);
        setLoading(false);
      },
      (erro) => {
        Alert.alert("Erro", "Erro ao carregar gastos em tempo real");
        setLoading(false);
      }
    );

    const categoriasQuery = query(
      collection(db, "categorias"), // coleção de categorias no Firestore
      where("userId", "==", currentUser.uid) // filtra por usuário logado  onde userId é o ID do usuário logado
    );

    // atualizacao em tempo real das categorias
    // onSnapshot em Firestore serve para criar um ouvinte (listener) que permite receber atualizações em tempo real de dados em uma coleção ou documento sem ter q fzr varias consultas
    const atualizarCategorias = onSnapshot(categoriasQuery, (resultado) => {
      const categoriasEncontradas = [];
      resultado.forEach((doc) => {
        categoriasEncontradas.push({ id: doc.id, ...doc.data() });
      });
      setCategorias(categoriasEncontradas);
    });

    return () => {
      atualizarGastos();
      atualizarCategorias();
    };
  }, [currentUser]);

  // recarregar dados quando a tela aparecer
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (currentUser) {
        buscarCategorias();
        buscarGastos();
      }
    });

    return unsubscribe;
  }, [navigation, currentUser]);

  const realizarLogout = async () => {
    try {
      await signOut(auth); // executa o logout usando o Firebase Auth
    } catch (erro) {
      Alert.alert("Erro", "Erro ao fazer logout");
    }
  };

  const deletarGasto = async (gastoId) => {
    Alert.alert("Confirmar", "Tem certeza que deseja excluir este gasto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            // deleta o gasto no Firestore pelo ID
            await deleteDoc(doc(db, "gastos", gastoId));
            Alert.alert("Sucesso", "Gasto excluído com sucesso!");
          } catch (erro) {
            Alert.alert("Erro", "Erro ao excluir gasto");
          }
        },
      },
    ]);
  };

  const editarGasto = (gasto) => {
    // navega para a tela "EditarGasto" enviando o gasto selecionado como parâmetro
    navigation.navigate("EditarGasto", { gasto });
  };

  const formatCurrency = (value) => {
    // formata número para moeda brasileira
    if (typeof value !== "number") return "R$ 0,00";
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const renderGastoItem = ({ item }) => (
    <ItemGasto
      gasto={item}
      aoPressionar={editarGasto}
      aoPressionarLongo={deletarGasto}
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
          aoPressionar={realizarLogout}
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
