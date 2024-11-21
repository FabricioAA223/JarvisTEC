import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  Text,
  ProgressBarAndroid,
  Alert,
  Platform,
  Linking,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";
import axios from "axios";

const VideoUploader = () => {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0); // Estado para el progreso de carga

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

  // Función para seleccionar un video
  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
      });
      console.log(result); // Ver qué datos devuelve
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const video = result.assets[0]; // Obtener el primer archivo
        setVideoUri(video.uri);
        console.log(video.uri);
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
    setUploadProgress(0); // Reiniciar progreso

    try {
      const response = await axios.post(
        "http://192.168.1.188:8000/process-video/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
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

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Button title="Seleccionar Video" onPress={pickVideo} />
      {videoUri && <Text>Video seleccionado: {videoUri}</Text>}

      <Button
        title={loading ? "Subiendo..." : "Subir Video"}
        onPress={uploadVideo}
        disabled={loading}
      />

      {/* Indicador de progreso */}
      {loading && (
        <View style={{ width: "100%", marginTop: 20 }}>
          {Platform.OS === "android" ? (
            <ProgressBarAndroid
              styleAttr="Horizontal"
              indeterminate={false}
              progress={uploadProgress / 100}
            />
          ) : (
            <Text>{uploadProgress}%</Text>
          )}
        </View>
      )}

      {/* Mostrar enlace de descarga */}
      {downloadLink && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ marginBottom: 10 }}>Video Procesado:</Text>
          <Button
            title="Descargar"
            onPress={() => {
              Linking.openURL(downloadLink);
            }}
          />
        </View>
      )}
    </View>
  );
};

export default VideoUploader;
