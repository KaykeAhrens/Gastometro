import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

const BotaoAcao = ({
  titulo,
  aoPressionar,
  carregando,
  corFundo = "#4D8FAC",
  estilo,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.botao,
        { backgroundColor: corFundo },
        estilo,
        carregando && styles.desabilitado,
      ]}
      onPress={aoPressionar}
      disabled={carregando}
    >
      {carregando ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.texto}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  botao: {
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  desabilitado: {
    opacity: 0.7,
  },
  texto: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BotaoAcao;
