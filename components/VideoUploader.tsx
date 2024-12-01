import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  Text,
  Alert,
  Platform,
  StyleSheet,
  Image,
} from "react-native";
// import { Bar } from "react-native-progress";
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Video } from "expo-av";
import axios from "axios";

const VideoUploader = () => {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [downloadedVideoUri, setDownloadedVideoUri] = useState<string | null>(
    null
  );

  // Ask for Storage Permission
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "No se puede acceder al almacenamiento."
        );
      }
    };

    requestPermissions();
  }, []);

  // Select a local video
  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
      });
      console.log(result); // Ver qué datos devuelve
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const video = result.assets[0]; // Obtener el primer archivo
        setVideoUri(video.uri);
        setDownloadLink(null);
        setDownloadedVideoUri(null)
      } else {
        Alert.alert(
          "Error",
          "No se seleccionó ningún video o se canceló la acción."
        );
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar el video.");
      console.error(error); // Imprime el error en caso de que haya alguno
    }
  };

  // Función para subir el video
  const uploadVideo = async () => {
    if (!videoUri) {
      Alert.alert("Error", "Por favor selecciona un video.");
      return;
    }

    const formData = new FormData();

    // Aquí se asegura de que el video se envíe correctamente en el FormData
    const videoFile = {
      uri: videoUri,
      type: "video/*",
      name: "video.mp4",
    };
    formData.append("file", videoFile);

    console.log("FormData: ", formData); // Verifica si el FormData está bien estructurado

    setLoading(true);

    try {
      const response = await axios.post(
        "http://192.168.1.188:8000/process-video/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.video_url) {
        setDownloadLink(response.data.video_url);
      } else {
        Alert.alert("Error", "No se obtuvo el enlace de descarga.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema al subir el video.");
    } finally {
      setLoading(false);
    }
  };

  const downloadAndDisplayVideo = async () => {
    if (!downloadLink) {
      Alert.alert("Error", "No hay enlace de descarga disponible.");
      return;
    }

    try {
      const fileUri = `${FileSystem.documentDirectory}processed-video.mp4`;
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadLink,
        fileUri
      );

      const { uri } = await downloadResumable.downloadAsync();
      setDownloadedVideoUri(uri);
    } catch (error) {
      Alert.alert("Error", "No se pudo descargar el video.");
      console.error(error);
    }
  };

  return (
    <View style={styles.generalContainer}>
    <Text style={styles.title}>Analizador de Videos</Text>
      <View style={styles.container}>

        <Button title="Seleccionar Video" onPress={pickVideo} />
        {videoUri && <Text style={{color:"white", marginTop: 20, marginBottom:20}}>Video seleccionado: {videoUri}</Text>}

        {videoUri && !downloadLink &&  (
          <Button
            title={loading ? "Subiendo..." : "Procesar el video"}
            onPress={uploadVideo}
            disabled={loading}
          />
        )}

        {loading && (
          <View>
            <Image
              source={require("../assets/Loader.gif")}
              style={{ width: 100, height: 100, marginTop:15, marginRight: "auto", marginLeft:"auto" }}
              resizeMode="contain"
            />
          </View>
        )}

        {downloadLink && !downloadedVideoUri && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ marginBottom: 10, color:"white" }}>Video Procesado:</Text>
            <Button
              title="Descargar y Mostrar"
              onPress={downloadAndDisplayVideo}
            />
          </View>
        )}

        {downloadedVideoUri && (
          <View style={{ marginTop: 20 }}>
            <Text style={{color:"white", marginTop: 20, marginBottom:10}}>Video Descargado:</Text>
            <Video
              source={{ uri: downloadedVideoUri }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  generalContainer: {
    backgroundColor: "#001f54",
    padding: 20,
    flex: 1,
    alignItems: "center",
  },
  container:{
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    height: 40,
    margin: 30,
    color: "white",
    fontWeight: "bold",
    justifyContent: "center",
    marginBottom: 20,
  },
  video: {
    width: 300,
    height: 400,
    backgroundColor: "#000",
  },
});

export default VideoUploader;
