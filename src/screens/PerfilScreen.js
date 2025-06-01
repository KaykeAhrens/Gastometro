import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Modal } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BotaoAcao from "../components/BotaoAcao";
import BotaoSimples from "../components/BotaoSimples";
import CampoInput from "../components/CampoInput";

const PerfilScreen = () => {
  const { currentUser, logout } = useAuth(); // pega o usuario logado e a função de logout
  const [saldoAtual, setSaldoAtual] = useState(""); // valor digitado do saldo
  const [saldosMensais, setSaldosMensais] = useState([]); // lista de saldos salvos
  const [editandoPerfil, setEditandoPerfil] = useState(false); // muda entre visualização e edição do perfil
  const [perfilUsuario, setPerfilUsuario] = useState({
    nome: "",
    telefone: "",
    dataNascimento: "",
    profissao: "",
  }); // informações do perfil do usuário

  // puxa os dados salvos no AsyncStorage
  useEffect(() => {
    carregarDados();
  }, []);

  // carrega o perfil e os saldos salvos localmente, com base no uid (userId) q vem do firebase
  const carregarDados = async () => {
    try {
      // o AsyncStorage só salva strings, por isso usamos JSON.stringify ao salvar objetos e JSON.parse ao ler
      const saldosSalvos = await AsyncStorage.getItem(
        `saldos_${currentUser?.uid}` // verifica se o usuario está logado (nao é null), pega o uid e concatena com a string "saldos_"
      );
      const perfilSalvo = await AsyncStorage.getItem(
        `perfil_${currentUser?.uid}` // verifica se o usuario está logado (nao é null), pega o uid e concatena com a string "perfil_"
      );

      // se achar os dados, atualiza o estado da tela
      if (saldosSalvos) {
        setSaldosMensais(JSON.parse(saldosSalvos));
      }
      if (perfilSalvo) {
        setPerfilUsuario(JSON.parse(perfilSalvo));
      }
    } catch (erro) {
      //console.log("Erro ao carregar dados");
    }
  };

  const obterMesAnoAtual = () => {
    const agora = new Date();
    return `${agora.getMonth() + 1}/${agora.getFullYear()}`; // + 1 pq os meses em js comeca do 0 (jan)
  };

  // salva um novo saldo para o mês atual, validando o q foi digitado
  const salvarSaldoMensal = async () => {
    if (!saldoAtual.trim())
      return Alert.alert("Erro", "Por favor, insira um valor para o saldo.");

    const valorSaldo = parseFloat(saldoAtual.replace(",", "."));
    if (isNaN(valorSaldo))
      return Alert.alert("Erro", "Insira um valor numérico válido.");

    const mesAno = obterMesAnoAtual();
    const novoSaldo = {
      id: Date.now().toString(), // gera um ID único com base na hora atual
      mesAno,
      valor: valorSaldo,
      dataRegistro: new Date().toLocaleDateString("pt-BR"),
    };

    const saldoExistente = saldosMensais.find((s) => s.mesAno === mesAno); // procura e retorna o saldo se o mesAno for igual ao mesAno atual ou null se n tiver nenhum
    let novosSaldos;

    if (saldoExistente) {
      // se já existe um saldo para o mês, pergunta se quer substituir
      Alert.alert(
        "Saldo Existente",
        `Já existe um saldo de R$ ${saldoExistente.valor.toFixed(
          2
        )} para ${mesAno}. Deseja substituir?`,
        [
          // botões do alert
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
      // se n existe, cria um novo array com os saldos antigos e o novo saldo, depois ordena por data decrescente.
      // pra ordenar, convertemos a string mesAno ("MM/YYYY") em Date
      // separamos a string pelo "/" -> ["MM", "YYYY"]
      // reverse para inverter a ordem -> ["YYYY", "MM"]
      // Junta com "-" -> "YYYY-MM", um formato reconhecido pelo Date
      // subtrai as datas para ordenar
      novosSaldos = [...saldosMensais, novoSaldo].sort(
        (a, b) =>
          new Date(b.mesAno.split("/").reverse().join("-")) -
          new Date(a.mesAno.split("/").reverse().join("-"))
      );
      atualizarSaldos(novosSaldos);
    }
  };

  // atualiza a lista de saldos no estado e no armazenamento local
  const atualizarSaldos = async (novosSaldos) => {
    try {
      setSaldosMensais(novosSaldos);
      await AsyncStorage.setItem(
        `saldos_${currentUser?.uid}`,
        JSON.stringify(novosSaldos)
      );
      setSaldoAtual("");
      Alert.alert("Sucesso", "Saldo mensal salvo com sucesso!");
    } catch (erro) {
      Alert.alert("Erro", "Erro ao salvar saldo mensal.");
      //console.log("Erro ao atualizar saldos");
    }
  };

  // valida se a data de nascimento está no formato correto e é uma data real
  const dataValida = (data) => {
    const partes = data.split("/");
    if (partes.length !== 3) return false;

    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]);
    const ano = parseInt(partes[2]);

    if (
      isNaN(dia) ||
      isNaN(mes) ||
      isNaN(ano) ||
      dia < 1 ||
      dia > 31 ||
      mes < 1 ||
      mes > 12 ||
      ano < 1900 // algm tem mais que 125 anos hoje em dia? 😅
    ) {
      return false;
    }

    // se a data for inválida, o objeto Date vai corrigir
    const dataObj = new Date(ano, mes - 1, dia); // mes - 1 pq em js os meses começam do 0 (jan = 0))
    return (
      dataObj.getFullYear() === ano &&
      dataObj.getMonth() === mes - 1 &&
      dataObj.getDate() === dia
    );
  };

  // salva as informações do perfil do usuário no armazenamento local
  const salvarPerfilUsuario = async () => {
    const { dataNascimento } = perfilUsuario;

    if (!dataValida(dataNascimento)) {
      return Alert.alert("Erro", "Data de nascimento inválida.");
    }

    try {
      await AsyncStorage.setItem(
        `perfil_${currentUser?.uid}`,
        JSON.stringify(perfilUsuario)
      );
      setEditandoPerfil(false);
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (erro) {
      Alert.alert("Erro", "Erro ao salvar perfil.");
    }
  };

  // exclui um saldo mensal com base no ID
  const excluirSaldo = async (id) => {
    const novosSaldos = saldosMensais.filter((s) => s.id !== id); // filtra os saldos, removendo o que tem o ID igual ao passado
    try {
      setSaldosMensais(novosSaldos);
      await AsyncStorage.setItem(
        `saldos_${currentUser?.uid}`,
        JSON.stringify(novosSaldos)
      );
      Alert.alert("Sucesso", "Saldo excluído com sucesso!");
    } catch (erro) {
      Alert.alert("Erro", "Erro ao excluir saldo.");
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
    const apenasNumeros = text.replace(/\D/g, ""); // /\D/ é uma expressão regular (valeu celso <3) que remove qqr caractere que n seja um numero e g aplica tudo q for encontrado
    let formatado = "";
    if (apenasNumeros.length > 0)
      formatado = `(${apenasNumeros.substring(0, 2)}`; // pega os dois primeiros numeros e coloca entre parenteses
    if (apenasNumeros.length > 2)
      formatado += `) ${apenasNumeros.substring(2, 7)}`; // pega os proximos 5 numeros e coloca um espaço depois do parenteses
    if (apenasNumeros.length > 7)
      formatado += `-${apenasNumeros.substring(7, 11)}`; // pega os proximos 4 numeros e coloca um traço antes
    return formatado;
  };

  const formatarData = (text) => {
    const apenasNumeros = text.replace(/\D/g, "");
    let formatado = "";
    if (apenasNumeros.length > 0) formatado = apenasNumeros.substring(0, 2); // dois primeiros digitos como dia
    if (apenasNumeros.length > 2)
      formatado += `/${apenasNumeros.substring(2, 4)}`; // dois proximos digitos como mes
    if (apenasNumeros.length > 4)
      formatado += `/${apenasNumeros.substring(4, 8)}`; // quatro proximos digitos como ano
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
          {currentUser?.metadata?.creationTime // a data vem do Firebase Authentication (metadata é uma propriedade do currentUser)
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
