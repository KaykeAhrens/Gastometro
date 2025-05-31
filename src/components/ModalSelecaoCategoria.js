import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import Icone from "react-native-vector-icons/MaterialIcons";

const ModalSelecaoCategoria = ({
  visible,
  aoFechar,
  categorias,
  aoSelecionarCategoria,
  aoNavegarParaCategorias,
  exibirBotaoCriarCategoria = true,
}) => {
  const renderizarOpcaoCategoria = (categoria) => (
    <TouchableOpacity
      key={categoria.id}
      style={styles.opcaoCategoria}
      onPress={() => aoSelecionarCategoria(categoria)}
    >
      <View
        style={[
          styles.iconeCategoriaContainer,
          { backgroundColor: categoria.cor + "20" },
        ]}
      >
        <Icone name={categoria.icone} size={20} color={categoria.cor} />
      </View>
      <View style={styles.infoCategoria}>
        <Text style={styles.nomeCategoria}>{categoria.nome}</Text>
        <Text style={styles.orcamentoCategoria}>
          Orçamento: R$ {categoria.orcamento.toFixed(2).replace(".", ",")}
        </Text>
      </View>
      <View
        style={[
          styles.indicadorCorCategoria,
          { backgroundColor: categoria.cor },
        ]}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={aoFechar}
    >
      <View style={styles.fundoModal}>
        <View style={styles.containerModal}>
          <View style={styles.headerModal}>
            <Text style={styles.tituloModal}>Selecionar Categoria</Text>
            <TouchableOpacity
              style={styles.botaoFecharModal}
              onPress={aoFechar}
            >
              <Icone name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.conteudoModal}>
            {/* Opção "Outros" */}
            <TouchableOpacity
              style={styles.opcaoCategoria}
              onPress={() => aoSelecionarCategoria(null)}
            >
              <View
                style={[
                  styles.iconeCategoriaContainer,
                  { backgroundColor: "#66666620" },
                ]}
              >
                <Icone name="folder" size={20} color="#666" />
              </View>
              <View style={styles.infoCategoria}>
                <Text style={styles.nomeCategoria}>Outros</Text>
                <Text style={styles.orcamentoCategoria}>
                  Sem orçamento definido
                </Text>
              </View>
              <View
                style={[
                  styles.indicadorCorCategoria,
                  { backgroundColor: "#666" },
                ]}
              />
            </TouchableOpacity>

            {categorias.length === 0 ? (
              <View style={styles.categoriasVazias}>
                <Text style={styles.textoCategoriaVazia}>
                  Nenhuma categoria criada
                </Text>
                {exibirBotaoCriarCategoria && aoNavegarParaCategorias && (
                  <TouchableOpacity
                    style={styles.botaoCriarCategoria}
                    onPress={() => {
                      aoFechar();
                      aoNavegarParaCategorias();
                    }}
                  >
                    <Text style={styles.textoCriarCategoria}>
                      Criar primeira categoria
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              categorias.map(renderizarOpcaoCategoria)
            )}
          </ScrollView>
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
  containerModal: {
    backgroundColor: "#2A2A3C",
    width: "90%",
    maxHeight: "80%",
    borderRadius: 12,
    paddingBottom: 20,
  },
  headerModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A4D",
  },
  tituloModal: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  botaoFecharModal: {
    padding: 4,
  },
  conteudoModal: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  opcaoCategoria: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A4D",
  },
  iconeCategoriaContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoCategoria: {
    flex: 1,
  },
  nomeCategoria: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  orcamentoCategoria: {
    color: "#BBB",
    fontSize: 12,
    marginTop: 2,
  },
  indicadorCorCategoria: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  categoriasVazias: {
    paddingVertical: 20,
    alignItems: "center",
  },
  textoCategoriaVazia: {
    color: "#999",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  botaoCriarCategoria: {
    backgroundColor: "#4D8FAC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoCriarCategoria: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ModalSelecaoCategoria;
