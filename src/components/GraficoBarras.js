import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const GraficoBarras = ({ dados, titulo = "Gastos por Mês" }) => {
  const formatarMoeda = (valor) => {
    if (typeof valor !== "number") return "R$ 0,00";
    return `R$ ${valor.toFixed(2).replace(".", ",")}`;
  };

  if (dados.length === 0) return null;

  const valorMaximo = Math.max(...dados.map((d) => d.valor));

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.barras}>
          {dados.map((item, index) => {
            const altura = (item.valor / valorMaximo) * 120;
            return (
              <View key={index} style={styles.containerBarra}>
                <View style={[styles.barra, { height: Math.max(altura, 5) }]} />
                <Text style={styles.rotuloBarra}>{item.mes}</Text>
                <Text style={styles.valorBarra}>
                  {formatarMoeda(item.valor)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2A2A3C",
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  titulo: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  barras: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 160,
    paddingBottom: 40,
  },
  containerBarra: {
    alignItems: "center",
    marginRight: 15,
    minWidth: 60,
  },
  barra: {
    backgroundColor: "#4D8FAC",
    width: 30,
    borderRadius: 4,
    marginBottom: 8,
  },
  rotuloBarra: {
    color: "#CCCCCC",
    fontSize: 10,
    textAlign: "center",
    marginBottom: 2,
  },
  valorBarra: {
    color: "white",
    fontSize: 9,
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default GraficoBarras;
