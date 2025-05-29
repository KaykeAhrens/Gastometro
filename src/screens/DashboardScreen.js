import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const DashboardScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState({
    totalGastos: 0,
    gastoMedio: 0,
    maiorGasto: 0,
    menorGasto: 0,
    totalItens: 0,
  });
  const [gastosPorMes, setGastosPorMes] = useState([]);
  const [topGastos, setTopGastos] = useState([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());

  // Refs para controlar os intervalos
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Carrega dados quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      if (currentUser) {
        fetchDadosDashboard();
        iniciarAutoRefresh();
      }

      // Cleanup quando a tela perde foco
      return () => {
        pararAutoRefresh();
      };
    }, [currentUser])
  );

  // Cleanup quando o componente é desmontado
  useEffect(() => {
    return () => {
      pararAutoRefresh();
    };
  }, []);

  const iniciarAutoRefresh = () => {
    // Para qualquer intervalo existente
    pararAutoRefresh();

    // Configura auto refresh a cada 30 segundos
    intervalRef.current = setInterval(() => {
      fetchDadosDashboard(false); // false para não mostrar loading
    }, 30000); // 30 segundos

    console.log("Auto refresh iniciado - atualizações a cada 30 segundos");
  };

  const pararAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const fetchDadosDashboard = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) {
        setLoading(true);
      }

      const gastosQuery = query(
        collection(db, "gastos"),
        where("userId", "==", currentUser.uid)
      );

      const snapshot = await getDocs(gastosQuery);
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
      calcularEstatisticas(gastosData);
      processarGastosPorMes(gastosData);
      processarTopGastos(gastosData);
      setUltimaAtualizacao(new Date());

      if (mostrarLoading) {
        setLoading(false);
      }

      console.log(
        `Dashboard atualizado: ${gastosData.length} gastos encontrados`
      );
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      if (mostrarLoading) {
        setLoading(false);
      }
    }
  };

  const refreshManual = () => {
    // Para o auto refresh temporariamente
    pararAutoRefresh();

    // Faz refresh imediato
    fetchDadosDashboard(true);

    // Reinicia auto refresh após 2 segundos
    timeoutRef.current = setTimeout(() => {
      iniciarAutoRefresh();
    }, 2000);
  };

  const calcularEstatisticas = (dados) => {
    if (dados.length === 0) {
      setEstatisticas({
        totalGastos: 0,
        gastoMedio: 0,
        maiorGasto: 0,
        menorGasto: 0,
        totalItens: 0,
      });
      return;
    }

    const valores = dados.map((g) => g.valor);
    const total = valores.reduce((acc, val) => acc + val, 0);
    const maior = Math.max(...valores);
    const menor = Math.min(...valores);
    const medio = total / valores.length;

    setEstatisticas({
      totalGastos: total,
      gastoMedio: medio,
      maiorGasto: maior,
      menorGasto: menor,
      totalItens: dados.length,
    });
  };

  const processarGastosPorMes = (dados) => {
    const gastosPorMesObj = {};

    dados.forEach((gasto) => {
      const data = gasto.createdAt;
      const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;

      if (!gastosPorMesObj[mesAno]) {
        gastosPorMesObj[mesAno] = 0;
      }
      gastosPorMesObj[mesAno] += gasto.valor;
    });

    const gastosPorMesArray = Object.entries(gastosPorMesObj)
      .map(([mes, valor]) => ({ mes, valor }))
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split("/");
        const [mesB, anoB] = b.mes.split("/");
        return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
      });

    setGastosPorMes(gastosPorMesArray);
  };

  const processarTopGastos = (dados) => {
    const gastosOrdenados = [...dados]
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
    setTopGastos(gastosOrdenados);
  };

  const formatCurrency = (value) => {
    if (typeof value !== "number") return "R$ 0,00";
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const obterMesAtual = () => {
    const agora = new Date();
    return `${agora.getMonth() + 1}/${agora.getFullYear()}`;
  };

  const gastosDoMesAtual = gastos.filter((gasto) => {
    const dataGasto = gasto.createdAt;
    const mesAnoGasto = `${
      dataGasto.getMonth() + 1
    }/${dataGasto.getFullYear()}`;
    return mesAnoGasto === obterMesAtual();
  });

  const totalMesAtual = gastosDoMesAtual.reduce(
    (acc, gasto) => acc + gasto.valor,
    0
  );

  // Componente do gráfico de barras simples
  const GraficoBarras = ({ dados }) => {
    if (dados.length === 0) return null;

    const valorMaximo = Math.max(...dados.map((d) => d.valor));

    return (
      <View style={styles.graficoContainer}>
        <Text style={styles.graficoTitulo}>Gastos por Mês</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.graficoBarras}>
            {dados.map((item, index) => {
              const altura = (item.valor / valorMaximo) * 120;
              return (
                <View key={index} style={styles.barraContainer}>
                  <View
                    style={[styles.barra, { height: Math.max(altura, 5) }]}
                  />
                  <Text style={styles.barraLabel}>{item.mes}</Text>
                  <Text style={styles.barraValor}>
                    {formatCurrency(item.valor)}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshManual}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Gráfico de Gastos por Mês */}
        <GraficoBarras dados={gastosPorMes} />

        {/* Maiores e Menores Gastos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo dos Gastos</Text>
          <View style={styles.resumoContainer}>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Maior Gasto</Text>
              <Text style={[styles.resumoValor, { color: "#E74C3C" }]}>
                {formatCurrency(estatisticas.maiorGasto)}
              </Text>
            </View>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Menor Gasto</Text>
              <Text style={[styles.resumoValor, { color: "#27AE60" }]}>
                {formatCurrency(estatisticas.menorGasto)}
              </Text>
            </View>
          </View>
        </View>

        {/* Top 5 Gastos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 Maiores Gastos</Text>
          {topGastos.map((gasto, index) => (
            <View key={gasto.id} style={styles.topGastoItem}>
              <View style={styles.topGastoRank}>
                <Text style={styles.topGastoRankText}>{index + 1}</Text>
              </View>
              <View style={styles.topGastoInfo}>
                <Text style={styles.topGastoTitulo}>{gasto.titulo}</Text>
                {gasto.descricao && (
                  <Text style={styles.topGastoDescricao}>
                    {gasto.descricao}
                  </Text>
                )}
                <Text style={styles.topGastoData}>
                  {gasto.createdAt.toLocaleDateString("pt-BR")}
                </Text>
              </View>
              <Text style={styles.topGastoValor}>
                {formatCurrency(gasto.valor)}
              </Text>
            </View>
          ))}
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Insights</Text>
          <View style={styles.insightContainer}>
            {gastosDoMesAtual.length > 0 && (
              <Text style={styles.insightText}>
                • Você já gastou {formatCurrency(totalMesAtual)} este mês
              </Text>
            )}
            {estatisticas.totalItens > 0 && (
              <Text style={styles.insightText}>
                • Sua média de gastos é de{" "}
                {formatCurrency(estatisticas.gastoMedio)} por item
              </Text>
            )}
            {gastosPorMes.length > 1 && (
              <Text style={styles.insightText}>
                • Você tem dados de {gastosPorMes.length} meses diferentes
              </Text>
            )}
            {estatisticas.maiorGasto > estatisticas.gastoMedio * 3 && (
              <Text style={styles.insightText}>
                • Seu maior gasto foi{" "}
                {Math.round(estatisticas.maiorGasto / estatisticas.gastoMedio)}x
                maior que a média
              </Text>
            )}
          </View>
        </View>

        {/* Botão para ver todos os gastos */}
        <TouchableOpacity
          style={styles.verTodosButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.verTodosText}>Ver Todos os Gastos</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  refreshButton: {
    backgroundColor: "#2A2A3C",
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  refreshText: {
    color: "#4D8FAC",
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContainer: {
    flex: 1,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    gap: 10,
  },
  statCard: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    padding: 15,
    width: (width - 50) / 2,
    alignItems: "center",
  },
  statCardPrimary: {
    backgroundColor: "#4D8FAC",
  },
  statTitle: {
    color: "#CCCCCC",
    fontSize: 12,
    marginBottom: 5,
    textAlign: "center",
  },
  statValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  graficoContainer: {
    backgroundColor: "#2A2A3C",
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  graficoTitulo: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  graficoBarras: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 160,
    paddingBottom: 40,
  },
  barraContainer: {
    alignItems: "center",
    marginRight: 15,
    minWidth: 60,
  },
  barra: {
    backgroundColor: "#4D8FAC",
    width: 30,
    borderRadius: 4,
    marginBottom: 8,
  },
  barraLabel: {
    color: "#CCCCCC",
    fontSize: 10,
    textAlign: "center",
    marginBottom: 2,
  },
  barraValor: {
    color: "white",
    fontSize: 9,
    textAlign: "center",
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "#2A2A3C",
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  resumoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resumoItem: {
    alignItems: "center",
    flex: 1,
  },
  resumoLabel: {
    color: "#CCCCCC",
    fontSize: 14,
    marginBottom: 5,
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: "bold",
  },
  topGastoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A3A4C",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  topGastoRank: {
    backgroundColor: "#4D8FAC",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  topGastoRankText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  topGastoInfo: {
    flex: 1,
  },
  topGastoTitulo: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  topGastoDescricao: {
    color: "#CCCCCC",
    fontSize: 12,
    marginTop: 2,
  },
  topGastoData: {
    color: "#888",
    fontSize: 11,
    marginTop: 2,
  },
  topGastoValor: {
    color: "#4D8FAC",
    fontSize: 14,
    fontWeight: "bold",
  },
  insightContainer: {
    backgroundColor: "#3A3A4C",
    padding: 15,
    borderRadius: 8,
  },
  insightText: {
    color: "#CCCCCC",
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  verTodosButton: {
    backgroundColor: "#4D8FAC",
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  verTodosText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DashboardScreen;
