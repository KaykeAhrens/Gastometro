import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import GraficoBarras from "../components/GraficoBarras";
import BotaoAcao from "../components/BotaoAcao";

const DashboardScreen = ({ navigation }) => {
  const { currentUser } = useAuth(); // pega o usuario logado
  const [gastos, setGastos] = useState([]); // lista de gastos do usuário
  const [loading, setLoading] = useState(true); // pra fazer animação de carregamento
  const [estatisticas, setEstatisticas] = useState({
    totalGastos: 0,
    gastoMedio: 0,
    maiorGasto: 0,
    menorGasto: 0,
    totalItens: 0,
  }); // estatísticas calculadas dos gastos
  const [gastosPorMes, setGastosPorMes] = useState([]); // dados dos gastos agrupados por mês para o gráfico
  const [topGastos, setTopGastos] = useState([]); // top 5 maiores gastos

  // useRef é um hook do React que permite criar e manipular referências a valores que podem ser alterados sem causar uma rerenderização do componente
  // controlar os intervalos de auto refresh
  const intervalo = useRef(null);
  const timeout = useRef(null);

  // carrega dados quando a tela é exibida
  useFocusEffect(
    React.useCallback(() => {
      if (currentUser) {
        buscarDadosDash();
        iniciarAutoRefresh();
      }

      // para o refresh quando n tá mais na tela
      return () => {
        pararAutoRefresh();
      };
    }, [currentUser])
  );

  useEffect(() => {
    return () => {
      pararAutoRefresh();
    };
  }, []);

  const iniciarAutoRefresh = () => {
    pararAutoRefresh();

    // configura auto refresh a cada 30 segundos
    intervalo.current = setInterval(() => {
      buscarDadosDash(false); // false para não mostrar loading
    }, 30000); // 30 segundos

    //console.log("Auto refresh iniciado - atualizações a cada 30 segundos");
  };

  const pararAutoRefresh = () => {
    if (intervalo.current) {
      clearInterval(intervalo.current);
      intervalo.current = null;
    }
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  };

  // buscar dados do dashboard (gastos do usuário logado)
  const buscarDadosDash = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) {
        setLoading(true);
      }

      const gastosQuery = query(
        collection(db, "gastos"), // coleção de gastos no Firestore
        where("userId", "==", currentUser.uid) // filtra por usuário logado onde userId é o ID do usuário logado
      );

      const resultado = await getDocs(gastosQuery);
      const gastosEncontrados = [];

      // percorre cada gasto retornado pela consulta
      resultado.forEach((doc) => {
        const data = doc.data();
        gastosEncontrados.push({
          id: doc.id,
          ...data, // operador spread (...) para incluir todos os campos do gasto
          createdAt: data.createdAt?.toDate() || new Date(), // busca o createdAt do gasto no firestore ou define como a data atual se não existir
        });
      });

      setGastos(gastosEncontrados); // atualiza o estado com os gastos encontrados
      calcularEstatisticas(gastosEncontrados); // calcula estatísticas baseadas nos gastos encontrados
      processarGastosPorMes(gastosEncontrados); // agrupa gastos por mês para o gráfico
      processarTopGastos(gastosEncontrados); // pega os 5 maiores gastos

      if (mostrarLoading) {
        setLoading(false);
      }

      //console.log("Dashboard atualizado");
    } catch (erro) {
      //console.log("Erro ao buscar dados:");
      if (mostrarLoading) {
        setLoading(false);
      }
    }
  };

  const refreshManual = () => {
    // para o auto refresh temporariamente
    pararAutoRefresh();

    // faz refresh imediato
    buscarDadosDash(true);

    // reinicia auto refresh após 2 segundos
    timeout.current = setTimeout(() => {
      iniciarAutoRefresh();
    }, 2000);
  };

  // calcular estatísticas dos gastos (total, média, maior, menor)
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

    const valores = dados.map((g) => g.valor); // extrai apenas os valores dos gastos
    const total = valores.reduce((acc, val) => acc + val, 0); // soma todos os valores (O reduce() em React, como no JavaScript, é usado para iterar sobre um array e acumular um valor único a partir dos seus elementos)
    const maior = Math.max(...valores); // encontra o maior valor
    const menor = Math.min(...valores); // encontra o menor valor
    const medio = total / valores.length; // calcula a média

    setEstatisticas({
      totalGastos: total,
      gastoMedio: medio,
      maiorGasto: maior,
      menorGasto: menor,
      totalItens: dados.length,
    });
  };

  // processar gastos agrupados por mês para exibir no gráfico
  const processarGastosPorMes = (dados) => {
    const gastosPorMesObj = {};

    // percorre cada gasto e agrupa por mês/ano
    dados.forEach((gasto) => {
      const data = gasto.createdAt;
      const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`; // formato MM/YYYY

      if (!gastosPorMesObj[mesAno]) {
        gastosPorMesObj[mesAno] = 0;
      }
      gastosPorMesObj[mesAno] += gasto.valor; // soma os gastos do mesmo mês
    });

    // converte objeto em array e ordena por data
    const gastosPorMesArray = Object.entries(gastosPorMesObj)
      .map(([mes, valor]) => ({ mes, valor }))
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split("/");
        const [mesB, anoB] = b.mes.split("/");
        return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
      });

    setGastosPorMes(gastosPorMesArray);
  };

  // processar top 5 maiores gastos
  const processarTopGastos = (dados) => {
    const gastosOrdenados = [...dados]
      .sort((a, b) => b.valor - a.valor) // ordena por valor decrescente
      .slice(0, 5); // pega apenas os 5 primeiros
    setTopGastos(gastosOrdenados);
  };

  const formatCurrency = (value) => {
    // formata número para moeda brasileira
    if (typeof value !== "number") return "R$ 0,00";
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const obterMesAtual = () => {
    const agora = new Date();
    return `${agora.getMonth() + 1}/${agora.getFullYear()}`;
  };

  // filtra gastos do mês atual
  const gastosDoMesAtual = gastos.filter((gasto) => {
    const dataGasto = gasto.createdAt;
    const mesAnoGasto = `${
      dataGasto.getMonth() + 1
    }/${dataGasto.getFullYear()}`;
    return mesAnoGasto === obterMesAtual();
  });

  // calcula total gasto no mês atual
  const totalMesAtual = gastosDoMesAtual.reduce(
    (acc, gasto) => acc + gasto.valor,
    0
  );

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
          <Text style={styles.headerTitle}>Relatório</Text>
        </View>
        <TouchableOpacity onPress={refreshManual}>
          <Icon name="refresh" size={22} color="#FFF" />
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
        <BotaoAcao
          titulo="Ver Todos os Gastos"
          aoPressionar={() => navigation.navigate("Home")}
          estilo={styles.verTodosButton}
        />

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
    marginHorizontal: 15,
  },
});

export default DashboardScreen;
