import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
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

const AdicionarGastoScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Novos estados para data
  const [dataGasto, setDataGasto] = useState(new Date());
  const [modalDataVisible, setModalDataVisible] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Buscar categorias do usuário
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
      const categoriasSnapshot = await getDocs(categoriasQuery);
      const categoriasData = [];
      categoriasSnapshot.forEach((doc) => {
        categoriasData.push({ id: doc.id, ...doc.data() });
      });
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const handleCriarGasto = async () => {
    console.log("Iniciando criação de gasto...");
    console.log("Dados:", {
      titulo,
      descricao,
      valor,
      categoria,
      dataGasto,
      userId: currentUser?.uid,
    });

    if (!titulo.trim() || !valor.trim()) {
      Alert.alert("Erro", "Por favor, preencha pelo menos o título e o valor");
      return;
    }

    const valorNumerico = parseFloat(valor.replace(",", "."));
    console.log("Valor numérico:", valorNumerico);

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
      console.log("Enviando para Firebase...");
      const docRef = await addDoc(collection(db, "gastos"), {
        titulo: titulo.trim(),
        descricao: descricao.trim() || "",
        valor: valorNumerico,
        categoria: categoria || "Outros",
        userId: currentUser.uid,
        createdAt: Timestamp.fromDate(dataGasto), // Usando a data selecionada
        updatedAt: serverTimestamp(),
      });

      console.log("Documento criado com ID:", docRef.id);

      // Limpar os campos
      setTitulo("");
      setDescricao("");
      setValor("");
      setCategoria("");
      setDataGasto(new Date()); // Reset para data atual

      // Navegar automaticamente de volta
      console.log("Navegando de volta automaticamente...");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao criar gasto:", error);
      Alert.alert("Erro", `Erro ao criar gasto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategoria = (categoriaSelecionada) => {
    setCategoria(categoriaSelecionada.nome);
    setModalVisible(false);
  };

  // Funções para o seletor de data
  const formatarData = (data) => {
    return data.toLocaleDateString("pt-BR");
  };

  const handleConfirmarData = () => {
    setDataGasto(tempDate);
    setModalDataVisible(false);
  };

  const handleCancelarData = () => {
    setTempDate(dataGasto);
    setModalDataVisible(false);
  };

  // Componente DatePicker
  const DatePickerModal = () => {
    const anos = [];
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual; i >= anoAtual - 5; i--) {
      anos.push(i);
    }

    const meses = [
      { nome: "Janeiro", valor: 0 },
      { nome: "Fevereiro", valor: 1 },
      { nome: "Março", valor: 2 },
      { nome: "Abril", valor: 3 },
      { nome: "Maio", valor: 4 },
      { nome: "Junho", valor: 5 },
      { nome: "Julho", valor: 6 },
      { nome: "Agosto", valor: 7 },
      { nome: "Setembro", valor: 8 },
      { nome: "Outubro", valor: 9 },
      { nome: "Novembro", valor: 10 },
      { nome: "Dezembro", valor: 11 },
    ];

    const obterDiasDoMes = (ano, mes) => {
      const diasNoMes = new Date(ano, mes + 1, 0).getDate();
      const dias = [];
      for (let i = 1; i <= diasNoMes; i++) {
        dias.push(i);
      }
      return dias;
    };

    const dias = obterDiasDoMes(tempDate.getFullYear(), tempDate.getMonth());

    const alterarAno = (ano) => {
      const novaData = new Date(tempDate);
      novaData.setFullYear(ano);
      setTempDate(novaData);
    };

    const alterarMes = (mes) => {
      const novaData = new Date(tempDate);
      novaData.setMonth(mes);
      setTempDate(novaData);
    };

    const alterarDia = (dia) => {
      const novaData = new Date(tempDate);
      novaData.setDate(dia);
      setTempDate(novaData);
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalDataVisible}
        onRequestClose={handleCancelarData}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dateModalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancelarData}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Selecionar Data</Text>
              <TouchableOpacity onPress={handleConfirmarData}>
                <Text style={styles.modalConfirmText}>OK</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
              {/* Seletor de Ano */}
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnTitle}>Ano</Text>
                <ScrollView style={styles.dateScroll}>
                  {anos.map((ano) => (
                    <TouchableOpacity
                      key={ano}
                      style={[
                        styles.dateOption,
                        tempDate.getFullYear() === ano &&
                          styles.dateOptionSelected,
                      ]}
                      onPress={() => alterarAno(ano)}
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          tempDate.getFullYear() === ano &&
                            styles.dateOptionTextSelected,
                        ]}
                      >
                        {ano}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Seletor de Mês */}
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnTitle}>Mês</Text>
                <ScrollView style={styles.dateScroll}>
                  {meses.map((mes) => (
                    <TouchableOpacity
                      key={mes.valor}
                      style={[
                        styles.dateOption,
                        tempDate.getMonth() === mes.valor &&
                          styles.dateOptionSelected,
                      ]}
                      onPress={() => alterarMes(mes.valor)}
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          tempDate.getMonth() === mes.valor &&
                            styles.dateOptionTextSelected,
                        ]}
                      >
                        {mes.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Seletor de Dia */}
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnTitle}>Dia</Text>
                <ScrollView style={styles.dateScroll}>
                  {dias.map((dia) => (
                    <TouchableOpacity
                      key={dia}
                      style={[
                        styles.dateOption,
                        tempDate.getDate() === dia && styles.dateOptionSelected,
                      ]}
                      onPress={() => alterarDia(dia)}
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          tempDate.getDate() === dia &&
                            styles.dateOptionTextSelected,
                        ]}
                      >
                        {dia}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.datePreview}>
              <Text style={styles.datePreviewText}>
                Data selecionada: {formatarData(tempDate)}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderCategoriaItem = (cat) => (
    <TouchableOpacity
      key={cat.id}
      style={[styles.categoriaOption, { borderLeftColor: cat.cor }]}
      onPress={() => handleSelectCategoria(cat)}
    >
      <View style={styles.categoriaOptionContent}>
        <View style={styles.categoriaIconContainer}>
          <Text style={styles.categoriaIcon}>{cat.icone}</Text>
        </View>
        <View style={styles.categoriaInfo}>
          <Text style={styles.categoriaNome}>{cat.nome}</Text>
          <Text style={styles.categoriaOrcamento}>
            Orçamento: R$ {cat.orcamento.toFixed(2).replace(".", ",")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: McDonald's"
            placeholderTextColor="#666"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={50}
          />
        </View>

        {/* Campo Descrição */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: 2 combo Big Mac, grande + sundae de chocolate"
            placeholderTextColor="#666"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Campo Valor */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Valor *</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            placeholderTextColor="#666"
            value={valor}
            onChangeText={setValor}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        {/* Campo Data */}
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
            <Text style={styles.selectorArrow}>📅</Text>
          </TouchableOpacity>
          <Text style={styles.dateHint}>
            Selecione a data em que o gasto foi realizado
          </Text>
        </View>

        {/* Campo Categoria */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Categoria</Text>
          <TouchableOpacity
            style={[styles.input, styles.categoriaSelector]}
            onPress={() => setModalVisible(true)}
          >
            <Text
              style={[
                styles.categoriaText,
                !categoria && styles.placeholderText,
              ]}
            >
              {categoria || "Selecionar categoria"}
            </Text>
            <Text style={styles.selectorArrow}>›</Text>
          </TouchableOpacity>
          {categoria && (
            <TouchableOpacity
              style={styles.clearCategoriaButton}
              onPress={() => setCategoria("")}
            >
              <Text style={styles.clearCategoriaText}>Limpar seleção</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botão Criar */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCriarGasto}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Criar Gasto</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Modal do DatePicker */}
      <DatePickerModal />

      {/* Modal para selecionar categoria */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Categoria</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Opção "Outros" */}
              <TouchableOpacity
                style={[styles.categoriaOption, { borderLeftColor: "#666" }]}
                onPress={() =>
                  handleSelectCategoria({
                    nome: "Outros",
                    icone: "📂",
                    cor: "#666",
                  })
                }
              >
                <View style={styles.categoriaOptionContent}>
                  <View style={styles.categoriaIconContainer}>
                    <Text style={styles.categoriaIcon}>📂</Text>
                  </View>
                  <View style={styles.categoriaInfo}>
                    <Text style={styles.categoriaNome}>Outros</Text>
                    <Text style={styles.categoriaOrcamento}>
                      Categoria padrão
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Categorias criadas pelo usuário */}
              {categorias.map(renderCategoriaItem)}

              {categorias.length === 0 && (
                <View style={styles.emptyCategorias}>
                  <Text style={styles.emptyCategoriaText}>
                    Nenhuma categoria criada
                  </Text>
                  <TouchableOpacity
                    style={styles.createCategoriaButton}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate("Categorias");
                    }}
                  >
                    <Text style={styles.createCategoriaText}>
                      Criar primeira categoria
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  // Estilos para o seletor de data
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

  // Estilos para o modal de data
  dateModalContainer: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    width: "95%",
    maxHeight: "80%",
  },
  datePickerContainer: {
    flexDirection: "row",
    height: 200,
    paddingHorizontal: 10,
  },
  dateColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateColumnTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A4C",
  },
  dateScroll: {
    flex: 1,
  },
  dateOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  dateOptionSelected: {
    backgroundColor: "#4D8FAC",
    borderRadius: 6,
    marginVertical: 2,
  },
  dateOptionText: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  dateOptionTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  datePreview: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#3A3A4C",
    alignItems: "center",
  },
  datePreviewText: {
    color: "#4D8FAC",
    fontSize: 16,
    fontWeight: "600",
  },
  modalCancelText: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: "600",
  },
  modalConfirmText: {
    color: "#4D8FAC",
    fontSize: 16,
    fontWeight: "600",
  },

  categoriaSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoriaText: {
    color: "white",
    fontSize: 16,
  },
  placeholderText: {
    color: "#666",
  },
  selectorArrow: {
    color: "#4D8FAC",
    fontSize: 20,
    fontWeight: "bold",
  },
  clearCategoriaButton: {
    marginTop: 8,
  },
  clearCategoriaText: {
    color: "#E74C3C",
    fontSize: 14,
  },
  createButton: {
    backgroundColor: "#4D8FAC",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 30,
  },
  createButtonDisabled: {
    backgroundColor: "#3A3A4C",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
    width: "90%",
    maxHeight: "70%",
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
  categoriaOption: {
    backgroundColor: "#3A3A4C",
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  categoriaOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  categoriaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A2A3C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoriaIcon: {
    fontSize: 18,
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
  emptyCategorias: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyCategoriaText: {
    color: "#CCCCCC",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  createCategoriaButton: {
    backgroundColor: "#4D8FAC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createCategoriaText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default AdicionarGastoScreen;
