import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const ModalSelecaoData = ({
  visivel,
  dataTemp,
  definirDataTemp,
  aoCancelar,
  aoConfirmar,
}) => {
  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 6 }, (_, i) => anoAtual - i);
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
    return Array.from({ length: diasNoMes }, (_, i) => i + 1);
  };

  const dias = obterDiasDoMes(dataTemp.getFullYear(), dataTemp.getMonth());

  const alterarData = (tipo, valor) => {
    const novaData = new Date(dataTemp);
    if (tipo === "ano") novaData.setFullYear(valor);
    if (tipo === "mes") novaData.setMonth(valor);
    if (tipo === "dia") novaData.setDate(valor);
    definirDataTemp(novaData);
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visivel}
      onRequestClose={aoCancelar}
    >
      <View style={styles.fundoModal}>
        <View style={styles.container}>
          <View style={styles.cabecalho}>
            <TouchableOpacity onPress={aoCancelar}>
              <Text style={styles.botaoCancelar}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.titulo}>Selecionar Data</Text>
            <TouchableOpacity onPress={aoConfirmar}>
              <Text style={styles.botaoConfirmar}>OK</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.seletores}>
            {[
              { label: "Ano", dados: anos, tipo: "ano" },
              { label: "Mês", dados: meses.map((m) => m.nome), tipo: "mes" },
              { label: "Dia", dados: dias, tipo: "dia" },
            ].map(({ label, dados, tipo }, idx) => (
              <View key={idx} style={styles.coluna}>
                <Text style={styles.tituloColuna}>{label}</Text>
                <ScrollView style={styles.scroll}>
                  {dados.map((item, i) => {
                    const valor = tipo === "mes" ? i : item;
                    const selecionado =
                      (tipo === "ano" && dataTemp.getFullYear() === valor) ||
                      (tipo === "mes" && dataTemp.getMonth() === valor) ||
                      (tipo === "dia" && dataTemp.getDate() === valor);
                    return (
                      <TouchableOpacity
                        key={valor}
                        style={[
                          styles.opcao,
                          selecionado && styles.opcaoSelecionada,
                        ]}
                        onPress={() => alterarData(tipo, valor)}
                      >
                        <Text
                          style={[
                            styles.textoOpcao,
                            selecionado && styles.textoSelecionado,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ))}
          </View>

          <View style={styles.previaData}>
            <Text style={styles.textoPrevia}>
              Data selecionada: {dataTemp.toLocaleDateString("pt-BR")}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    width: "95%",
    maxHeight: "80%",
  },
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A4D",
  },
  titulo: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  botaoCancelar: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: "600",
  },
  botaoConfirmar: {
    color: "#4D8FAC",
    fontSize: 16,
    fontWeight: "600",
  },
  seletores: {
    flexDirection: "row",
    height: 200,
    paddingHorizontal: 10,
  },
  coluna: {
    flex: 1,
    marginHorizontal: 5,
  },
  tituloColuna: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A4C",
  },
  scroll: {
    flex: 1,
  },
  opcao: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  opcaoSelecionada: {
    backgroundColor: "#4D8FAC",
    borderRadius: 6,
    marginVertical: 2,
  },
  textoOpcao: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  textoSelecionado: {
    color: "white",
    fontWeight: "600",
  },
  previaData: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#3A3A4C",
    alignItems: "center",
  },
  textoPrevia: {
    color: "#4D8FAC",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ModalSelecaoData;
