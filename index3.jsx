import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Image } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export default function App() {
  const isListening = useRef(true);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef(null);
  const isRecording = useRef(false); // Usar useRef para controlar el estado de grabación

  useEffect(() => {
    const startListening = async () => {
      console.log("Iniciando app");
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        alert("Permiso de grabación denegado. Por favor, habilita los permisos desde la configuración.");
        return;
      }

      if (isListening.current) {
        // console.log('Listening for "Hey Jarvis"...');
        await startRecording();
      }
    };

    startListening();

    return () => {
      stopRecording();
    };
  }, [isListening]);

  const startRecording = async () => {
    if (isRecording.current) {
      // console.log('Ya hay una grabación en curso.');
      return;
    }

    try {
      // console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording; // Almacenar en useRef
      isRecording.current = true; // Indicar que estamos grabando

      // Detener grabación después de un tiempo
      setTimeout(() => {
        stopRecording();
      }, 2500);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) {
      return; // No hacer nada si no hay grabación activa.
    }

    try {
      console.log('Stopping recording...');
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      recordingRef.current = null; // Restablecer el estado de grabación.
      isRecording.current = false; // Actualizar estado de grabación

      await sendAudioToBackend(uri, 2);

      // Reiniciar el ciclo de grabación si isListening sigue activo
      if (isListening.current) {
        console.log("Continua en el ciclo");
        startRecording(); // Volver a iniciar la grabación
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const sendAudioToBackend = async (uri, retry) => {
    setIsProcessing(true);
    setTranscription('');

    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    });

    try {
      const response = await fetch('http://192.168.192.11:8000/convert-and-transcribe/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        cache: 'no-cache', // Desactivar caché
      });

      if (!response.ok) {
        setTranscription(`Error del servidor: ${response.statusText}`);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Server response:', result);

      // Verificamos si hay transcripción en la respuesta del servidor
      if (result && result.transcription) {
        setTranscription(result.transcription);
        // Disparar acción si la transcripción contiene "jarvis"
        if (result.transcription.toLowerCase().includes('jarvis')) {
          triggerJarvisAction();
        }
      } else {
        setTranscription('Error: No transcription found.');
      }
    } catch (error) {
      if (retry > 0) {
        return sendAudioToBackend(uri, retry - 1);
      }
      console.error('Error sending file to backend:', error);
      setTranscription('Error enviando el archivo. Verifica tu conexión de red.');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerJarvisAction = () => {
    console.log('Hey Jarvis detected!');
    alert('¡Has dicho "Hey Jarvis"!');
    isListening.current = false;
    // Detener el ciclo de grabación
    stopRecording();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      <Text style={{ color: 'white' }}>{transcription || 'Esperando transcripción...'}</Text>
      {isProcessing && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
}
