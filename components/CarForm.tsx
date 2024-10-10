import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { FormData } from '../constants/Types';

interface CarFormProps {
  onSubmit: (formData: any) => void;
}

export const modeloCoche = [
  { pregunta: "¿Cuál es la marca del coche?", parametro: "Make" },
  { pregunta: "¿Cuál es el modelo del coche?", parametro: "Model" },
  { pregunta: "¿Cuál es el año de fabricación del coche?", parametro: "Year" },
  { pregunta: "¿Qué tipo de combustible utiliza el motor?", parametro: "Engine_Fuel_Type" },
  { pregunta: "¿Cuántos caballos de fuerza tiene el motor?", parametro: "Engine_HP" },
  { pregunta: "¿Cuántos cilindros tiene el motor?", parametro: "Engine_Cylinders" },
  { pregunta: "¿Cuál es el tipo de transmisión del coche?", parametro: "Transmission_Type" },
  { pregunta: "¿El coche tiene tracción delantera, trasera o en las cuatro ruedas?", parametro: "Driven_Wheels" },
  { pregunta: "¿Cuántas puertas tiene el coche?", parametro: "Number_of_Doors" },
  { pregunta: "¿Cuál es el tamaño del coche?", parametro: "Vehicle_Size" },
  { pregunta: "¿Cuál es el estilo del coche?", parametro: "Vehicle_Style" },
  { pregunta: "¿Cuál es el rendimiento del coche en carretera en MPG (millas por galón)?", parametro: "Highway_MPG" },
  { pregunta: "¿Cuál es el rendimiento del coche en ciudad en MPG?", parametro: "City_MPG" },
  { pregunta: "¿Cuál es la popularidad del coche (en número de ventas o ranking)?", parametro: "Popularity" }
];

const CarForm: React.FC<CarFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    Make: '',
    Model: '',
    Year: 0,
    Engine_Fuel_Type: '',
    Engine_HP: 0,
    Engine_Cylinders: 0,
    Transmission_Type: '',
    Driven_Wheels: '',
    Number_of_Doors: 0,
    Vehicle_Size: '',
    Vehicle_Style: '',
    Highway_MPG: 0,
    City_MPG: 0,
    Popularity: 0  
  });

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = () => {
    const isValid = Object.values(formData).every((field) => field.trim() !== '');
    if (!isValid) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    const data = transformToListOfObjects(formData);
    onSubmit(data);
  };

  function transformToListOfObjects(data: any): Array<Record<any, any>> {
    return Object.keys(data).map(key => ({ [key]: data[key] }));
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Información del Coche</Text>
        {modeloCoche.map(({ pregunta, parametro }) => (
          <View key={parametro} style={styles.inputContainer}>
            <Text style={styles.label}>
              {pregunta}
            </Text>
            <TextInput
              style={styles.input}
              value={formData[parametro as keyof FormData].toString()}
              onChangeText={(value) => handleChange(parametro as keyof FormData, value)}
              placeholder={`Ingrese ${pregunta}`}
              keyboardType={['Year', 'Engine_HP', 'Engine_Cylinders', 'Number_of_Doors', 'Highway_MPG', 'City_MPG', 'Popularity'].includes(parametro) ? 'numeric' : 'default'}
              returnKeyType="next"
            />
          </View>
        ))}
        <Button title="Enviar" onPress={handleSubmit} color="#007BFF" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
});

export default CarForm;