import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import Icon from "react-native-vector-icons/MaterialIcons";
import ModalSelecaoCategoria from "../components/ModalSelecaoCategoria";
import BotaoAcao from "../components/BotaoAcao";
import CampoInput from "../components/CampoInput";
import ModalSelecaoData from "../components/ModalSelecaoData";

const AdicionarGastoScreen = ({ navigation }) => {
  const { currentUser } = useAuth(); // pega o usuario logado
  const [titulo, setTitulo] = useState(""); // título do gasto
  const [descricao, setDescricao] = useState(""); // descrição do gasto
  const [valor, setValor] = useState(""); // valor do gasto, deve ser um número
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null); // categoria selecionada para o gasto, pode ser null se não houver categoria
  const [categorias, setCategorias] = useState([]); // lista de categorias cadastradas
  const [loading, setLoading] = useState(false); // pra fazer animação de carregamento
  const [modalVisible, setModalVisible] = useState(false); // controle de visibilidade do modal de seleção de categoria
  const [dataGasto, setDataGasto] = useState(new Date()); // data do gasto, inicia com a data atual
  const [modalDataVisible, setModalDataVisible] = useState(false); // controle de visibilidade do modal de seleção de data
  const [tempDate, setTempDate] = useState(new Date()); // data temporária para manipulação antes de confirmar a seleção

  useEffect(() => {
    if (currentUser) buscarCategorias();
  }, [currentUser]);

  // buscar categorias cadastradas
  const buscarCategorias = async () => {
    try {
      const categoriasQuery = query(
        collection(db, "categorias"), // coleção de categorias no Firestore
        where("userId", "==", currentUser.uid) // filtra por usuário logado onde userId é o ID do usuário logado
      );
      const resultado = await getDocs(categoriasQuery);
      const categoriasEncontradas = [];

      // percorre cada categoria e adiciona ao array de categorias encontradas, incluindo também o ID de cada documento do Firestore.
      resultado.forEach((doc) => {
        const data = doc.data();
        categoriasEncontradas.push({
          id: doc.id,
          ...data, // operador spread (...) para incluir todos os campos da categoria (id, nome, icone, cor, etc.)
        });
      });
      setCategorias(categoriasEncontradas);
    } catch (erro) {
      //console.log("Erro ao buscar categorias");
    }
  };

  const criarGasto = async () => {
    if (!titulo.trim() || !valor.trim()) {
      Alert.alert("Erro", "Por favor, preencha pelo menos o título e o valor");
      return;
    }

    const valorNumerico = parseFloat(valor.replace(",", "."));
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
      // adiciona novo gasto na coleção "gastos" do Firestore
      await addDoc(collection(db, "gastos"), {
        titulo: titulo.trim(),
        descricao: descricao.trim() || "",
        valor: valorNumerico,
        categoria: categoriaSelecionada?.nome || "Outros", // usa nome da categoria selecionada ou "Outros" se não houver categoria
        categoriaId: categoriaSelecionada?.id || null, // usa ID da categoria selecionada ou null se não houver categoria
        userId: currentUser.uid, // associa o gasto ao usuário logado
        createdAt: Timestamp.fromDate(dataGasto), // converte a data selecionada para Timestamp do Firebase
        updatedAt: serverTimestamp(), // timestamp do servidor para controle de atualização
      });

      // limpa os campos após criar o gasto
      setTitulo("");
      setDescricao("");
      setValor("");
      setCategoriaSelecionada(null);
      setDataGasto(new Date());
      navigation.goBack(); // volta para a tela anterior
    } catch (erro) {
      Alert.alert("Erro", "Erro ao criar gasto");
    } finally {
      setLoading(false);
    }
  };

  const selecionarCategoria = (categoria) => {
    setCategoriaSelecionada(categoria);
    setModalVisible(false);
  };

  const navegarCategoriasScreen = () => {
    navigation.navigate("Categorias");
  };

  // formatar data para exibição no formato brasileiro
  const formatarData = (data) => data.toLocaleDateString("pt-BR");

  const cliqueConfirmarData = () => {
    setDataGasto(tempDate);
    setModalDataVisible(false);
  };

  const cancelarEscolhaData = () => {
    setTempDate(dataGasto);
    setModalDataVisible(false);
  };

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
        <CampoInput
          rotulo="Título *"
          valor={titulo}
          aoAlterarTexto={setTitulo}
          placeholder="Ex: McDonald's"
        />

        {/* Campo Descrição */}
        <CampoInput
          rotulo="Descrição"
          valor={descricao}
          aoAlterarTexto={setDescricao}
          placeholder="Ex: Detalhes do gasto"
          multiline
        />

        {/* Campo Valor */}
        <CampoInput
          rotulo="Valor *"
          valor={valor}
          aoAlterarTexto={setValor}
          placeholder="0,00"
          keyboardType="numeric"
        />

        {/* Seletor de Data */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Data do Gasto</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateSelector]}
            onPress={() => {
              setTempDate(dataGasto);
              setModalDataVisible(true);
            }}
          >
            <Text style={styles.dateText}>{formatarData(dataGasto)}</Text>
            <Icon name="calendar-today" size={20} color="#4D8FAC" />
          </TouchableOpacity>
          <Text style={styles.dateHint}>
            Selecione a data em que o gasto foi realizado
          </Text>
        </View>

        {/* Seletor de Categoria */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Categoria</Text>
          <TouchableOpacity
            style={[styles.input, styles.categoriaSelector]}
            onPress={() => setModalVisible(true)}
          >
            {categoriaSelecionada ? (
              // exibe categoria selecionada com ícone e cor
              <View style={styles.categoriaSelecionadaContainer}>
                <View
                  style={[
                    styles.categoriaIconSelecionada,
                    { backgroundColor: categoriaSelecionada.cor + "20" },
                  ]}
                >
                  <Icon
                    name={categoriaSelecionada.icone}
                    size={18}
                    color={categoriaSelecionada.cor}
                  />
                </View>
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
              // exibe placeholder quando nenhuma categoria está selecionada
              <View style={styles.categoriaSelecionadaContainer}>
                <View
                  style={[
                    styles.categoriaIconSelecionada,
                    { backgroundColor: "#66666620" },
                  ]}
                >
                  <Icon name="folder" size={18} color="#666" />
                </View>
                <Text style={styles.categoriaSelectorPlaceholder}>
                  Outros (sem categoria)
                </Text>
              </View>
            )}
            <Icon name="keyboard-arrow-down" size={24} color="#4D8FAC" />
          </TouchableOpacity>

          {/* Botão para limpar categoria selecionada */}
          {categoriaSelecionada && (
            <TouchableOpacity
              style={styles.limparCategoriaBotao}
              onPress={() => setCategoriaSelecionada(null)}
            >
              <Text style={styles.limparCategoriaTexto}>Limpar seleção</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botão para criar o gasto */}
        <BotaoAcao
          titulo="Criar Gasto"
          aoPressionar={criarGasto}
          carregando={loading}
        />

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Modal de Seleção de Data */}
      <ModalSelecaoData
        visivel={modalDataVisible}
        dataTemp={tempDate}
        definirDataTemp={setTempDate}
        aoCancelar={cancelarEscolhaData}
        aoConfirmar={cliqueConfirmarData}
      />

      {/* Modal de Seleção de Categoria */}
      <ModalSelecaoCategoria
        visible={modalVisible}
        aoFechar={() => setModalVisible(false)}
        categorias={categorias}
        aoSelecionarCategoria={selecionarCategoria}
        aoNavegarParaCategorias={navegarCategoriasScreen}
        exibirBotaoCriarCategoria={true}
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
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    color: "white",
    fontSize: 16,
  },
  dateHint: {
    color: "#999",
    fontSize: 12,
    marginTop: 5,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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
    marginRight: 8,
  },
  categoriaSelectorPlaceholder: {
    color: "#666",
    fontSize: 16,
    flex: 1,
  },
  limparCategoriaBotao: {
    marginTop: 8,
  },
  limparCategoriaTexto: {
    color: "#E74C3C",
    fontSize: 14,
  },
});

export default AdicionarGastoScreen;
