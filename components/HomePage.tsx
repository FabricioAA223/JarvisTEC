import React from "react";
import { View, Text } from "react-native";
import { RouteProp } from "@react-navigation/native";

type RootStackParamList = {
  "Registro Facial": undefined;
  HomePage: { name: string }; 
};

type HomePageProps = {
  route: RouteProp<RootStackParamList, "HomePage">; // Definiendo el tipo para los parámetros
};

const HomePage: React.FC<HomePageProps> = ({ route }) => {
  const { name } = route.params; // Accediendo a los parámetros

  return (
    <View>
      <Text>Bienvenido, {name}!</Text>
      {/* Aquí puedes agregar más contenido */}
    </View>
  );
};

export default HomePage;
