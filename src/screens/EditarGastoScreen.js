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
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
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

const EditarGastoScreen = ({ navigation, route }) => {
  const { gasto } = route.params; // recebe o gasto selecionado como parâmetro da navegação
  const { currentUser } = useAuth(); // pega o usuario logado
  const [titulo, setTitulo] = useState(gasto.titulo || ""); // inicializa o título do gasto com o valor recebido ou vazio se não houver
  const [descricao, setDescricao] = useState(gasto.descricao || ""); // inicializa a descrição do gasto com o valor recebido ou vazio se não houver
  const [valor, setValor] = useState(
    gasto.valor ? gasto.valor.toString().replace(".", ",") : "" // inicializa o valor do gasto com o valor recebido, convertendo para string e substituindo ponto por vírgula
  );
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null); // categoria selecionada para o gasto, inicialmente nula
  const [categorias, setCategorias] = useState([]); // lista de categorias cadastradas
  const [loading, setLoading] = useState(false); // pra fazer animação de carregamento
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false); // controla a visibilidade do modal de seleção de categoria

  // inicializa a data do gasto baseada nos dados recebidos
  const [dataGasto, setDataGasto] = useState(() => {
    // verifica se o campo createdAt tem o método .toDate() (o que indica que é um Timestamp do Firebase)
    if (gasto.createdAt && gasto.createdAt.toDate) {
      return gasto.createdAt.toDate(); // converte corretamente usando .toDate()
    } else if (gasto.createdAt && gasto.createdAt.seconds) {
      return new Date(gasto.createdAt.seconds * 1000); // converte timestamp em segundos para Date
    }
    return new Date(); // retorna data atual se não houver createdAt válido
  });
  const [modalDataVisible, setModalDataVisible] = useState(false); // controla a visibilidade do modal de seleção de data
  const [tempDate, setTempDate] = useState(new Date()); // data temporária para o modal de seleção de data

  useEffect(() => {
    if (currentUser) {
      buscarCategorias();
    }
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

      // busca e define a categoria atual do gasto
      if (gasto.categoriaId) {
        // primeiro tenta encontrar pela categoriaId
        const categoriaAtual = categoriasEncontradas.find(
          (cat) => cat.id === gasto.categoriaId
        );
        if (categoriaAtual) {
          setCategoriaSelecionada(categoriaAtual);
        }
      } else if (gasto.categoria && gasto.categoria !== "Outros") {
        // se der errado busca pelo nome da categoria
        const categoriaAtual = categoriasEncontradas.find(
          (cat) => cat.nome === gasto.categoria
        );
        if (categoriaAtual) {
          setCategoriaSelecionada(categoriaAtual);
        }
      }
    } catch (erro) {
      //console.log("Erro ao buscar categorias");
    }
  };

  const salvarGasto = async () => {
    if (!titulo.trim() || !valor.trim()) {
      Alert.alert("Erro", "Por favor, preencha pelo menos o título e o valor");
      return;
    }

    const valorNumerico = parseFloat(valor.replace(",", "."));

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert("Erro", "Por favor, insira um valor válido");
      return;
    }

    setLoading(true);
    try {
      // atualiza o gasto existente no Firestore
      await updateDoc(doc(db, "gastos", gasto.id), {
        titulo: titulo.trim(), // garante que o título não seja null
        descricao: descricao.trim() || "", // garante que a descrição não seja null
        valor: valorNumerico, // converte o valor para número
        categoria: categoriaSelecionada?.nome || "Outros", // usa nome da categoria selecionada ou "Outros" se não houver categoria
        categoriaId: categoriaSelecionada?.id || null, // usa ID da categoria selecionada ou null se não houver categoria
        createdAt: Timestamp.fromDate(dataGasto), // converte a data selecionada para Timestamp do Firebase
        updatedAt: serverTimestamp(), // timestamp do servidor para controle de atualização
      });

      navigation.goBack(); // volta para a tela anterior após salvar
    } catch (erro) {
      Alert.alert("Erro", "Erro ao atualizar gasto");
    } finally {
      setLoading(false);
    }
  };

  const excluirGasto = async () => {
    setLoading(true);
    try {
      // deleta o gasto no Firestore pelo ID
      await deleteDoc(doc(db, "gastos", gasto.id));
      Alert.alert("Sucesso", "Gasto excluído com sucesso!");
      navigation.goBack(); // volta para a tela anterior após excluir
    } catch (erro) {
      Alert.alert("Erro", "Erro ao excluir gasto");
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Editar Gasto</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
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
          placeholder="Detalhes do gasto"
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
          <Text style={styles.dateHint}>Selecione a data do gasto</Text>
        </View>

        {/* Seletor de Categoria */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Categoria</Text>
          <TouchableOpacity
            style={[styles.input, styles.categoriaSelector]}
            onPress={() => setModalCategoriaVisible(true)}
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
              <Text style={styles.categoriaSelectorPlaceholder}>
                Outros (sem categoria)
              </Text>
            )}
            <Icon name="keyboard-arrow-down" size={24} color="#4D8FAC" />
          </TouchableOpacity>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionButtonsContainer}>
          <BotaoAcao
            titulo="Salvar Alterações"
            aoPressionar={salvarGasto}
            carregando={loading}
          />

          <BotaoAcao
            titulo="Excluir Gasto"
            aoPressionar={excluirGasto}
            carregando={loading}
            corFundo="#E74C3C"
          />
        </View>
        <View style={{ height: 30 }} />
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
        visible={modalCategoriaVisible}
        aoFechar={() => setModalCategoriaVisible(false)}
        categorias={categorias}
        aoSelecionarCategoria={(categoria) => {
          setCategoriaSelecionada(categoria);
          setModalCategoriaVisible(false);
        }}
        aoNavegarParaCategorias={() => {
          setModalCategoriaVisible(false);
          navigation.navigate("CategoriasScreen");
        }}
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
  actionButtonsContainer: {
    marginTop: 20,
    gap: 15,
  },
});

export default EditarGastoScreen;
