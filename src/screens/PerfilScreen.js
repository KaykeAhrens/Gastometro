// PerfilScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BotaoAcao from "../components/BotaoAcao";
import BotaoSimples from "../components/BotaoSimples";
import CampoInput from "../components/CampoInput";

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

      if (saldosSalvos) setSaldosMensais(JSON.parse(saldosSalvos));
      if (perfilSalvo) setPerfilUsuario(JSON.parse(perfilSalvo));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const obterMesAnoAtual = () => {
    const agora = new Date();
    return `${agora.getMonth() + 1}/${agora.getFullYear()}`;
  };

  const salvarSaldoMensal = async () => {
    if (!saldoAtual.trim())
      return Alert.alert("Erro", "Por favor, insira um valor para o saldo.");

    const valorSaldo = parseFloat(saldoAtual.replace(",", "."));
    if (isNaN(valorSaldo))
      return Alert.alert("Erro", "Insira um valor numérico válido.");

    const mesAno = obterMesAnoAtual();
    const novoSaldo = {
      id: Date.now().toString(),
      mesAno,
      valor: valorSaldo,
      dataRegistro: new Date().toLocaleDateString("pt-BR"),
    };

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
      <TouchableOpacity onPress={() => excluirSaldo(item.id)}>
        <Text style={styles.textoExcluir}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const formatarTelefone = (text) => {
    const apenasNumeros = text.replace(/\D/g, "");
    let formatado = "";
    if (apenasNumeros.length > 0)
      formatado = `(${apenasNumeros.substring(0, 2)}`;
    if (apenasNumeros.length > 2)
      formatado += `) ${apenasNumeros.substring(2, 7)}`;
    if (apenasNumeros.length > 7)
      formatado += `-${apenasNumeros.substring(7, 11)}`;
    return formatado;
  };

  const formatarData = (text) => {
    const apenasNumeros = text.replace(/\D/g, "");
    let formatado = "";
    if (apenasNumeros.length > 0) formatado = apenasNumeros.substring(0, 2);
    if (apenasNumeros.length > 2)
      formatado += `/${apenasNumeros.substring(2, 4)}`;
    if (apenasNumeros.length > 4)
      formatado += `/${apenasNumeros.substring(4, 8)}`;
    return formatado;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil do Usuário</Text>
        <BotaoSimples titulo="Sair" aoPressionar={logout} />
      </View>

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

      <View style={styles.secao}>
        <View style={styles.headerSecao}>
          <Text style={styles.subtitulo}>Perfil Detalhado</Text>
          <BotaoSimples
            titulo={editandoPerfil ? "Cancelar" : "Editar"}
            aoPressionar={() => setEditandoPerfil(!editandoPerfil)}
          />
        </View>

        {editandoPerfil ? (
          <View>
            <CampoInput
              rotulo="Nome completo"
              valor={perfilUsuario.nome}
              aoAlterarTexto={(text) =>
                setPerfilUsuario({ ...perfilUsuario, nome: text })
              }
            />
            <CampoInput
              rotulo="Telefone"
              valor={perfilUsuario.telefone}
              aoAlterarTexto={(text) =>
                setPerfilUsuario({
                  ...perfilUsuario,
                  telefone: formatarTelefone(text),
                })
              }
              keyboardType="phone-pad"
            />
            <CampoInput
              rotulo="Data de nascimento"
              valor={perfilUsuario.dataNascimento}
              aoAlterarTexto={(text) =>
                setPerfilUsuario({
                  ...perfilUsuario,
                  dataNascimento: formatarData(text),
                })
              }
              placeholder="DD/MM/AAAA"
            />
            <CampoInput
              rotulo="Profissão"
              valor={perfilUsuario.profissao}
              aoAlterarTexto={(text) =>
                setPerfilUsuario({ ...perfilUsuario, profissao: text })
              }
            />
            <BotaoAcao
              titulo="Salvar Perfil"
              aoPressionar={salvarPerfilUsuario}
            />
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

      <View style={styles.secao}>
        <Text style={styles.subtitulo}>
          Saldo do Mês ({obterMesAnoAtual()})
        </Text>
        <CampoInput
          rotulo="Saldo atual"
          valor={saldoAtual}
          aoAlterarTexto={setSaldoAtual}
          placeholder="Digite o saldo inicial deste mês"
          keyboardType="numeric"
        />
        <BotaoAcao titulo="Salvar" aoPressionar={salvarSaldoMensal} />
      </View>
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
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  secao: {
    backgroundColor: "#2A2A3E",
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  headerSecao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  textoExcluir: {
    color: "#E74C3C",
    fontSize: 20,
    padding: 8,
  },
  saldoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#2A2A3E",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
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
  },
  saldoData: {
    color: "#999",
    fontSize: 14,
  },
});

export default PerfilScreen;
