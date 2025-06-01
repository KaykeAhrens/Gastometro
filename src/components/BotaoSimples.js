import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const BotaoSimples = ({
  titulo,
  aoPressionar,
  corTexto = "#4D8FAC",
  estilo,
}) => {
  return (
    <TouchableOpacity onPress={aoPressionar} style={[styles.botao, estilo]}>
      <Text style={[styles.texto, { color: corTexto }]}>{titulo}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  botao: {
    backgroundColor: "#3C3C54",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  texto: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default BotaoSimples;
