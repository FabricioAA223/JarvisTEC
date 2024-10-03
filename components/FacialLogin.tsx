import React, { useState, useRef, useEffect} from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  'Registro Facial': undefined; 
  "HomePage": { name: string };
};

type FacialLoginProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Registro Facial'>; 
};

const FacialLogin: React.FC<FacialLoginProps> = ({ navigation }) => {
  const [facing] = useState<CameraType>("front"); // Just frontal Cam
  const [permission, requestPermission] = useCameraPermissions(); //Ask for cam permission
  const cameraRef = useRef<CameraView>(null); // Cam reference
  const [loading, setLoading] = useState<boolean>(false); 
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem("isLogged");
        const storedName = await AsyncStorage.getItem("name");
        if (loggedIn === "true" && storedName) {
          setIsLogged(true);
          setName(storedName);
          navigation.navigate("HomePage", { name: storedName });
        }
      } catch (error) {
        console.error("Error checking login status", error);
      }
    };
    checkLoginStatus();
  }, []);

  if (!permission) {return <View />; }

  if (!permission.granted) {
    return (
      <View style={styles.containerPermission}>
        <Text style={styles.message}>
          Necesitamos acceso a los permisos de camara
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.messagePermission}>
            Brindar permisos
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: false, }); // Take photo
        if (photo && photo.uri) { // Verify photo integrity
          handleLogin(photo.uri); // Call the login function with the URI of the image.
        } else {
          Alert.alert("Error", "No se pudo tomar la foto. Inténtalo de nuevo.");
        }
      } catch (error) {
        Alert.alert("Error","Hubo un problema al tomar la foto. Asegúrate de que la cámara funcione correctamente.");
      }
    }
  };

  const handleLogin = async (imageUri: string) => {
    setLoading(true);
    if(isLogged==true){
      navigation.navigate("HomePage", { name: name });
      return;
    }
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri); // FileSystem to conver URI --> FILE
      if (!fileInfo.exists) { throw new Error("El archivo no existe en la ruta especificada.");}

      const formData = new FormData();
      // Create a blop using FileSystem.readAsStringAsync with base64
      const file = {
        uri: imageUri,
        type: "image/jpeg",
        name: "photo.jpg",
      };
      formData.append("image", file as any);

      const response = await fetch("https://face-recognition-aws-api.vercel.app/login", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      if (result.found) {
        // Store login status and navigate to HomePage
        await AsyncStorage.setItem("isLogged", "true");
        await AsyncStorage.setItem("name", result.name);
        setIsLogged(true);
        setName(result.name);
        navigation.navigate("HomePage", { name: result.name });
      } else {
        Alert.alert("Error", result.message || "Persona no registrada.");
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
              <Image source={require("../assets/Camera.png")} />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  containerPermission: {
    flex: 1,
    justifyContent: "flex-end",
  },
  permissionBtn:{
    backgroundColor: "cyan",
    color: "black",
    padding: 20
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  messagePermission: {
    textAlign: "center",
    fontWeight: "bold"
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    padding: 0,
    paddingBottom: 48,
    width: 100,
    alignSelf: "center",
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 30,
  },
});

export default FacialLogin;
