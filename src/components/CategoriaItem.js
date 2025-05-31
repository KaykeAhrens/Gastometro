import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const CategoriaItem = ({
  categoria,
  gastoAtual,
  aoEditar,
  aoExcluir,
  formatCurrency,
}) => {
  const calcularPercentual = (gasto, orcamento) => {
    if (orcamento === 0) return 0;
    return Math.min((gasto / orcamento) * 100, 100);
  };

  const getCorProgresso = (percentual) => {
    if (percentual < 50) return "#27AE60";
    if (percentual < 80) return "#F39C12";
    return "#E74C3C";
  };

  const percentual = calcularPercentual(gastoAtual, categoria.orcamento);
  const corProgresso = getCorProgresso(percentual);
  const restante = Math.max(categoria.orcamento - gastoAtual, 0);

  return (
    <TouchableOpacity
      style={[styles.categoriaItem, { borderLeftColor: categoria.cor }]}
      onPress={() => aoEditar(categoria)}
      onLongPress={() => aoExcluir(categoria)}
    >
      <View style={styles.categoriaHeader}>
        <View style={styles.categoriaIconContainer}>
          <Icon name={categoria.icone} size={20} color="white" />
        </View>
        <View style={styles.categoriaInfo}>
          <Text style={styles.categoriaNome}>{categoria.nome}</Text>
          <Text style={styles.categoriaOrcamento}>
            Orçamento: {formatCurrency(categoria.orcamento)}
          </Text>
        </View>
        <View style={styles.categoriaValores}>
          <Text style={styles.categoriaGasto}>
            {formatCurrency(gastoAtual)}
          </Text>
          <Text style={styles.categoriaRestante}>
            Resta: {formatCurrency(restante)}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentual}%`,
                backgroundColor: corProgresso,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{percentual.toFixed(1)}%</Text>
      </View>

      {percentual > 100 && (
        <View style={styles.alertContainer}>
          <Text style={styles.alertText}>⚠️ Orçamento excedido!</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoriaItem: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  categoriaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  categoriaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3A3A4C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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
  categoriaValores: {
    alignItems: "flex-end",
  },
  categoriaGasto: {
    color: "#4D8FAC",
    fontSize: 16,
    fontWeight: "bold",
  },
  categoriaRestante: {
    color: "#CCCCCC",
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#3A3A4C",
    borderRadius: 3,
    marginRight: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    color: "#CCCCCC",
    fontSize: 12,
    fontWeight: "600",
    width: 40,
    textAlign: "right",
  },
  alertContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#E74C3C20",
    borderRadius: 6,
  },
  alertText: {
    color: "#E74C3C",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default CategoriaItem;
