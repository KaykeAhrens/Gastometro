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

  const [dataGasto, setDataGasto] = useState(() => {
    if (gasto.createdAt && gasto.createdAt.toDate) {
      return gasto.createdAt.toDate();
    } else if (gasto.createdAt && gasto.createdAt.seconds) {
      return new Date(gasto.createdAt.seconds * 1000);
    }
    return new Date();
  });
  const [modalDataVisible, setModalDataVisible] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

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
      await updateDoc(doc(db, "gastos", gasto.id), {
        titulo: titulo.trim(),
        descricao: descricao.trim() || "",
        valor: valorNumerico,
        categoria: categoriaSelecionada?.nome || "Outros",
        categoriaId: categoriaSelecionada?.id || null,
        createdAt: Timestamp.fromDate(dataGasto),
        updatedAt: serverTimestamp(),
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", `Erro ao atualizar gasto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirGasto = async () => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "gastos", gasto.id));
      Alert.alert("Sucesso", "Gasto excluído com sucesso!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", `Erro ao excluir gasto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => data.toLocaleDateString("pt-BR");

  const handleConfirmarData = () => {
    setDataGasto(tempDate);
    setModalDataVisible(false);
  };

  const handleCancelarData = () => {
    setTempDate(dataGasto);
    setModalDataVisible(false);
  };

  return (
    <SafeAreaView style={estilos.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />

      <View style={estilos.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={estilos.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={estilos.headerTitle}>Editar Gasto</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={estilos.formContainer}
        showsVerticalScrollIndicator={false}
      >
        <CampoInput
          rotulo="Título *"
          valor={titulo}
          aoAlterarTexto={setTitulo}
          placeholder="Ex: McDonald's"
        />

        <CampoInput
          rotulo="Descrição"
          valor={descricao}
          aoAlterarTexto={setDescricao}
          placeholder="Detalhes do gasto"
          multiline
        />

        <CampoInput
          rotulo="Valor *"
          valor={valor}
          aoAlterarTexto={setValor}
          placeholder="0,00"
          keyboardType="numeric"
        />

        <View style={estilos.inputContainer}>
          <Text style={estilos.inputLabel}>Data do Gasto</Text>
          <TouchableOpacity
            style={[estilos.input, estilos.dateSelector]}
            onPress={() => {
              setTempDate(dataGasto);
              setModalDataVisible(true);
            }}
          >
            <Text style={estilos.dateText}>{formatarData(dataGasto)}</Text>
            <Icon name="calendar-today" size={20} color="#4D8FAC" />
          </TouchableOpacity>
          <Text style={estilos.dateHint}>Selecione a data do gasto</Text>
        </View>

        <View style={estilos.inputContainer}>
          <Text style={estilos.inputLabel}>Categoria</Text>
          <TouchableOpacity
            style={[estilos.input, estilos.categoriaSelector]}
            onPress={() => setModalCategoriaVisible(true)}
          >
            {categoriaSelecionada ? (
              <View style={estilos.categoriaSelecionadaContainer}>
                <View
                  style={[
                    estilos.categoriaIconSelecionada,
                    { backgroundColor: categoriaSelecionada.cor + "20" },
                  ]}
                >
                  <Icon
                    name={categoriaSelecionada.icone}
                    size={18}
                    color={categoriaSelecionada.cor}
                  />
                </View>
                <Text style={estilos.categoriaNomeSelecionada}>
                  {categoriaSelecionada.nome}
                </Text>
                <View
                  style={[
                    estilos.categoriaCorSelecionada,
                    { backgroundColor: categoriaSelecionada.cor },
                  ]}
                />
              </View>
            ) : (
              <Text style={estilos.categoriaSelectorPlaceholder}>
                Outros (sem categoria)
              </Text>
            )}
            <Icon name="keyboard-arrow-down" size={24} color="#4D8FAC" />
          </TouchableOpacity>
        </View>

        <View style={estilos.actionButtonsContainer}>
          <BotaoAcao
            titulo="Salvar Alterações"
            aoPressionar={handleSalvarGasto}
            carregando={loading}
          />

          <BotaoAcao
            titulo="Excluir Gasto"
            aoPressionar={handleExcluirGasto}
            carregando={loading}
            corFundo="#E74C3C"
          />
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      <ModalSelecaoData
        visivel={modalDataVisible}
        dataTemp={tempDate}
        definirDataTemp={setTempDate}
        aoCancelar={handleCancelarData}
        aoConfirmar={handleConfirmarData}
      />

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

const estilos = StyleSheet.create({
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
