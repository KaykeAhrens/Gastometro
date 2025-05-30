import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PerfilScreen = () => {
  const { currentUser, logout } = useAuth();
  const [saldoAtual, setSaldoAtual] = useState("");
  const [saldosMensais, setSaldosMensais] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [perfilUsuario, setPerfilUsuario] = useState({
    nome: "",
    telefone: "",
    dataNascimento: "",
    profissao: "",
  });

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const saldosSalvos = await AsyncStorage.getItem(
        `saldos_${currentUser?.uid}`
      );
      const perfilSalvo = await AsyncStorage.getItem(
        `perfil_${currentUser?.uid}`
      );

      if (saldosSalvos) {
        setSaldosMensais(JSON.parse(saldosSalvos));
      }

      if (perfilSalvo) {
        setPerfilUsuario(JSON.parse(perfilSalvo));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const obterMesAnoAtual = () => {
    const agora = new Date();
    return `${agora.getMonth() + 1}/${agora.getFullYear()}`;
  };

  const salvarSaldoMensal = async () => {
    if (!saldoAtual.trim()) {
      Alert.alert("Erro", "Por favor, insira um valor para o saldo.");
      return;
    }

    const valorSaldo = parseFloat(saldoAtual.replace(",", "."));
    if (isNaN(valorSaldo)) {
      Alert.alert("Erro", "Por favor, insira um valor numérico válido.");
      return;
    }

    const mesAno = obterMesAnoAtual();
    const novoSaldo = {
      id: Date.now().toString(),
      mesAno,
      valor: valorSaldo,
      dataRegistro: new Date().toLocaleDateString("pt-BR"),
    };

    // Verificar se já existe saldo para este mês
    const saldoExistente = saldosMensais.find((s) => s.mesAno === mesAno);
    let novosSaldos;

    if (saldoExistente) {
      Alert.alert(
        "Saldo Existente",
        `Já existe um saldo de R$ ${saldoExistente.valor.toFixed(
          2
        )} para ${mesAno}. Deseja substituir?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Substituir",
            onPress: () => {
              novosSaldos = saldosMensais.map((s) =>
                s.mesAno === mesAno ? novoSaldo : s
              );
              atualizarSaldos(novosSaldos);
            },
          },
        ]
      );
    } else {
      novosSaldos = [...saldosMensais, novoSaldo].sort(
        (a, b) =>
          new Date(b.mesAno.split("/").reverse().join("-")) -
          new Date(a.mesAno.split("/").reverse().join("-"))
      );
      atualizarSaldos(novosSaldos);
    }
  };

  const atualizarSaldos = async (novosSaldos) => {
    try {
      setSaldosMensais(novosSaldos);
      await AsyncStorage.setItem(
        `saldos_${currentUser?.uid}`,
        JSON.stringify(novosSaldos)
      );
      setSaldoAtual("");
      Alert.alert("Sucesso", "Saldo mensal salvo com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar saldo mensal.");
      console.error(error);
    }
  };

  const salvarPerfilUsuario = async () => {
    try {
      await AsyncStorage.setItem(
        `perfil_${currentUser?.uid}`,
        JSON.stringify(perfilUsuario)
      );
      setEditandoPerfil(false);
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar perfil.");
      console.error(error);
    }
  };

  const excluirSaldo = async (id) => {
    const novosSaldos = saldosMensais.filter((s) => s.id !== id);
    try {
      setSaldosMensais(novosSaldos);
      await AsyncStorage.setItem(
        `saldos_${currentUser?.uid}`,
        JSON.stringify(novosSaldos)
      );
      Alert.alert("Sucesso", "Saldo excluído com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Erro ao excluir saldo.");
      console.error(error);
    }
  };

  const renderSaldoItem = ({ item }) => (
    <View style={styles.saldoItem}>
      <View style={styles.saldoInfo}>
        <Text style={styles.saldoMes}>{item.mesAno}</Text>
        <Text style={styles.saldoValor}>R$ {item.valor.toFixed(2)}</Text>
        <Text style={styles.saldoData}>Registrado em: {item.dataRegistro}</Text>
      </View>
      <TouchableOpacity
        style={styles.botaoExcluir}
        onPress={() => excluirSaldo(item.id)}
      >
        <Text style={styles.textoExcluir}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  // Função para formatar telefone
  const formatarTelefone = (text) => {
    const apenasNumeros = text.replace(/\D/g, "");

    let formatado = "";
    if (apenasNumeros.length > 0) {
      formatado = `(${apenasNumeros.substring(0, 2)}`;
    }
    if (apenasNumeros.length > 2) {
      formatado += `) ${apenasNumeros.substring(2, 7)}`;
    }
    if (apenasNumeros.length > 7) {
      formatado += `-${apenasNumeros.substring(7, 11)}`;
    }

    return formatado;
  };

  // Função para formatar data
  const formatarData = (text) => {
    const apenasNumeros = text.replace(/\D/g, "");

    let formatado = "";
    if (apenasNumeros.length > 0) {
      let dia = apenasNumeros.substring(0, 2);
      if (dia.length === 2) {
        const diaNum = parseInt(dia);
        if (diaNum < 1 || diaNum > 31) {
          dia = "31";
        }
      }
      formatado = dia;
    }
    if (apenasNumeros.length > 2) {
      let mes = apenasNumeros.substring(2, 4);
      if (mes.length === 2) {
        const mesNum = parseInt(mes);
        if (mesNum < 1 || mesNum > 12) {
          mes = "12";
        }
      }
      formatado += `/${mes}`;
    }
    if (apenasNumeros.length > 4) {
      let ano = apenasNumeros.substring(4, 8);
      if (ano.length >= 4) {
        const anoNum = parseInt(ano);
        const anoAtual = new Date().getFullYear();
        if (anoNum < 1900 || anoNum > anoAtual) {
          ano = anoAtual.toString();
        }
        ano = ano.substring(0, 4);
      }
      formatado += `/${ano}`;
    }

    return formatado;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho do Perfil */}
      <View style={styles.header}>
        <Text style={styles.title}>Perfil do Usuário</Text>
        <TouchableOpacity style={styles.botaoLogout} onPress={logout}>
          <Text style={styles.textoBotao}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Informações Básicas */}
      <View style={styles.secao}>
        <Text style={styles.subtitulo}>Informações Básicas</Text>
        <Text style={styles.userInfo}>Email: {currentUser?.email}</Text>
        <Text style={styles.userInfo}>
          Conta criada:{" "}
          {currentUser?.metadata?.creationTime
            ? new Date(currentUser.metadata.creationTime).toLocaleDateString(
                "pt-BR"
              )
            : "Data não disponível"}
        </Text>
      </View>

      {/* Perfil Detalhado */}
      <View style={styles.secao}>
        <View style={styles.headerSecao}>
          <Text style={styles.subtitulo}>Perfil Detalhado</Text>
          <TouchableOpacity
            style={styles.botaoEditar}
            onPress={() => setEditandoPerfil(!editandoPerfil)}
          >
            <Text style={styles.textoBotao}>
              {editandoPerfil ? "Cancelar" : "Editar"}
            </Text>
          </TouchableOpacity>
        </View>

        {editandoPerfil ? (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#8B8B8B"
              value={perfilUsuario.nome}
              onChangeText={(text) =>
                setPerfilUsuario({ ...perfilUsuario, nome: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              placeholderTextColor="#8B8B8B"
              value={perfilUsuario.telefone}
              onChangeText={(text) =>
                setPerfilUsuario({
                  ...perfilUsuario,
                  telefone: formatarTelefone(text),
                })
              }
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Data de nascimento (DD/MM/AAAA)"
              placeholderTextColor="#8B8B8B"
              value={perfilUsuario.dataNascimento}
              onChangeText={(text) =>
                setPerfilUsuario({
                  ...perfilUsuario,
                  dataNascimento: formatarData(text),
                })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Profissão"
              placeholderTextColor="#8B8B8B"
              value={perfilUsuario.profissao}
              onChangeText={(text) =>
                setPerfilUsuario({ ...perfilUsuario, profissao: text })
              }
            />
            <TouchableOpacity
              style={styles.botaoPrincipal}
              onPress={salvarPerfilUsuario}
            >
              <Text style={styles.textoBotaoPrincipal}>Salvar Perfil</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.userInfo}>
              Nome: {perfilUsuario.nome || "Não informado"}
            </Text>
            <Text style={styles.userInfo}>
              Telefone: {perfilUsuario.telefone || "Não informado"}
            </Text>
            <Text style={styles.userInfo}>
              Data de nascimento:{" "}
              {perfilUsuario.dataNascimento || "Não informado"}
            </Text>
            <Text style={styles.userInfo}>
              Profissão: {perfilUsuario.profissao || "Não informado"}
            </Text>
          </View>
        )}
      </View>

      {/* Seção de Saldo Mensal */}
      <View style={styles.secao}>
        <Text style={styles.subtitulo}>
          Saldo do Mês ({obterMesAnoAtual()})
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputSaldo}
            placeholder="Digite o saldo inicial deste mês"
            placeholderTextColor="#8B8B8B"
            value={saldoAtual}
            onChangeText={setSaldoAtual}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.botaoSalvar}
            onPress={salvarSaldoMensal}
          >
            <Text style={styles.textoBotao}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Histórico de Saldos */}
      <View style={styles.secao}>
        <View style={styles.headerSecao}>
          <Text style={styles.subtitulo}>Histórico de Saldos</Text>
          <TouchableOpacity
            style={styles.botaoVer}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.textoBotao}>
              Ver Todos ({saldosMensais.length})
            </Text>
          </TouchableOpacity>
        </View>

        {saldosMensais.length > 0 ? (
          <View>
            {saldosMensais.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.saldoItemResumido}>
                <Text style={styles.saldoMesResumido}>{item.mesAno}</Text>
                <Text style={styles.saldoValorResumido}>
                  R$ {item.valor.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.textoVazio}>Nenhum saldo registrado ainda</Text>
        )}
      </View>

      {/* Modal do Histórico Completo */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Histórico Completo de Saldos</Text>
            <TouchableOpacity
              style={styles.botaoFechar}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textoBotao}>Fechar</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={saldosMensais}
            renderItem={renderSaldoItem}
            keyExtractor={(item) => item.id}
            style={styles.lista}
            ListEmptyComponent={
              <Text style={styles.textoVazioModal}>
                Nenhum saldo registrado
              </Text>
            }
          />
        </View>
      </Modal>
    </ScrollView>
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  botaoLogout: {
    backgroundColor: "#2A2A3C",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secao: {
    backgroundColor: "#2A2A3E",
    margin: 15,
    marginTop: 5,
    padding: 20,
    borderRadius: 12,
  },
  headerSecao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  subtitulo: {
    color: "#3498DB",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  userInfo: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  input: {
    backgroundColor: "#3C3C54",
    color: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputSaldo: {
    flex: 1,
    backgroundColor: "#3C3C54",
    color: "white",
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    fontSize: 16,
  },
  botaoSalvar: {
    backgroundColor: "#3C3C54",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botaoEditar: {
    backgroundColor: "#3C3C54",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botaoVer: {
    backgroundColor: "#3C3C54",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botaoPrincipal: {
    backgroundColor: "#3C3C54",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  textoBotao: {
    color: "#4D8FAC",
    fontSize: 14,
  },
  textoBotaoPrincipal: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  saldoItemResumido: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#3C3C54",
  },
  saldoMesResumido: {
    color: "#BDC3C7",
    fontSize: 16,
  },
  saldoValorResumido: {
    color: "#27AE60",
    fontSize: 16,
    fontWeight: "bold",
  },
  textoVazio: {
    color: "#8B8B8B",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#1E1E2E",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#3C3C54",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  botaoFechar: {
    backgroundColor: "#2A2A3C",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  lista: {
    flex: 1,
    padding: 15,
  },
  saldoItem: {
    backgroundColor: "#2A2A3E",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saldoInfo: {
    flex: 1,
  },
  saldoMes: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  saldoValor: {
    color: "#27AE60",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  saldoData: {
    color: "#8B8B8B",
    fontSize: 12,
    marginTop: 3,
  },
  botaoExcluir: {
    backgroundColor: "#2A2A3C",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  textoExcluir: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  textoVazioModal: {
    color: "#8B8B8B",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});

export default PerfilScreen;
