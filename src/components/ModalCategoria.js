import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import BotaoAcao from "./BotaoAcao";
import BotaoSimples from "./BotaoSimples";
import CampoInput from "./CampoInput";

const { width } = Dimensions.get("window");

const ModalCategoria = ({
  visivel,
  editandoCategoria,
  dadosFormulario,
  alterarDadosFormulario,
  aoFechar,
  aoSalvar,
  salvando,
}) => {
  const icones = [
    "attach-money",
    "home",
    "directions-car",
    "restaurant",
    "shopping-bag",
    "sports-esports",
    "phone-android",
    "flash-on",
    "local-hospital",
    "school",
    "movie",
    "shopping-cart",
    "work",
    "train",
    "fitness-center",
    "pets",
    "local-gas-station",
    "wifi",
    "music-note",
    "cake",
  ];

  const cores = [
    "#4D8FAC",
    "#E74C3C",
    "#27AE60",
    "#F39C12",
    "#9B59B6",
    "#E67E22",
    "#1ABC9C",
    "#34495E",
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visivel}
      onRequestClose={aoFechar}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editandoCategoria ? "Editar Categoria" : "Nova Categoria"}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={aoFechar}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <CampoInput
              rotulo="Nome da Categoria"
              valor={dadosFormulario.nome}
              aoAlterarTexto={(text) =>
                alterarDadosFormulario({ ...dadosFormulario, nome: text })
              }
              placeholder="Ex: Alimentação, Transporte..."
            />

            <CampoInput
              rotulo="Orçamento Mensal"
              valor={dadosFormulario.orcamento}
              aoAlterarTexto={(text) =>
                alterarDadosFormulario({ ...dadosFormulario, orcamento: text })
              }
              placeholder="0,00"
              keyboardType="numeric"
            />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ícone</Text>
              <View style={styles.iconGrid}>
                {icones.map((icone) => (
                  <TouchableOpacity
                    key={icone}
                    style={[
                      styles.iconOption,
                      dadosFormulario.icone === icone &&
                        styles.iconOptionSelected,
                    ]}
                    onPress={() =>
                      alterarDadosFormulario({ ...dadosFormulario, icone })
                    }
                  >
                    <Icon name={icone} size={20} color="white" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cor</Text>
              <View style={styles.colorGrid}>
                {cores.map((cor) => (
                  <TouchableOpacity
                    key={cor}
                    style={[
                      styles.colorOption,
                      { backgroundColor: cor },
                      dadosFormulario.cor === cor && styles.colorOptionSelected,
                    ]}
                    onPress={() =>
                      alterarDadosFormulario({ ...dadosFormulario, cor })
                    }
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <BotaoAcao
              titulo="Cancelar"
              aoPressionar={aoFechar}
              corFundo="#3A3A4C"
              estilo={styles.botaoCancelar}
            />
            <BotaoAcao
              titulo={editandoCategoria ? "Atualizar" : "Criar"}
              aoPressionar={aoSalvar}
              carregando={salvando}
              corFundo="#4D8FAC"
              estilo={styles.botaoSalvar}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    width: width - 40,
    maxHeight: "80%",
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconOption: {
    backgroundColor: "#3A3A4C",
    padding: 12,
    borderRadius: 8,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  iconOptionSelected: {
    backgroundColor: "#4D8FAC",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: "white",
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
  },
  botaoCancelar: {
    flex: 1,
  },
  botaoSalvar: {
    flex: 1,
  },
});

export default ModalCategoria;
