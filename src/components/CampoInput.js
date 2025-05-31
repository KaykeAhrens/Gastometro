import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

const CampoInput = ({
  rotulo,
  valor,
  aoAlterarTexto,
  placeholder,
  multiline,
  estiloInput,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        style={[styles.entrada, multiline && styles.areaTexto, estiloInput]}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={valor}
        onChangeText={aoAlterarTexto}
        multiline={multiline}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  rotulo: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  entrada: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    padding: 15,
    color: "white",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3A3A4C",
  },
  areaTexto: {
    height: 80,
    textAlignVertical: "top",
  },
});

export default CampoInput;
