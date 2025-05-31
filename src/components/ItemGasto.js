import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const ItemGasto = ({
  gasto,
  aoPressionar,
  aoPressionarLongo,
  obterIconeCategoria,
  obterCorCategoria,
}) => {
  const formatarMoeda = (valor) => {
    if (typeof valor !== "number") return "R$ 0,00";
    return `R$ ${valor.toFixed(2).replace(".", ",")}`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => aoPressionar(gasto)}
      onLongPress={() => aoPressionarLongo(gasto.id)}
    >
      <View
        style={[
          styles.icone,
          { backgroundColor: obterCorCategoria(gasto.categoria) },
        ]}
      >
        <Icon
          name={obterIconeCategoria(gasto.categoria)}
          size={20}
          color="white"
        />
      </View>

      <View style={styles.informacoes}>
        <Text style={styles.titulo}>{gasto.titulo || "Sem título"}</Text>
        {gasto.descricao && (
          <Text style={styles.descricao}>{gasto.descricao}</Text>
        )}
        {gasto.categoria && (
          <Text style={styles.categoria}>{gasto.categoria}</Text>
        )}
      </View>

      <View style={styles.valor}>
        <Text style={styles.textoValor}>{formatarMoeda(gasto.valor)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  icone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  informacoes: {
    flex: 1,
  },
  titulo: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  descricao: {
    color: "#CCCCCC",
    fontSize: 14,
    marginBottom: 2,
  },
  categoria: {
    color: "#4D8FAC",
    fontSize: 12,
    fontStyle: "italic",
  },
  valor: {
    alignItems: "flex-end",
  },
  textoValor: {
    color: "#4D8FAC",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ItemGasto;
