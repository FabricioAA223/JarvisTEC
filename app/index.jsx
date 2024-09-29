import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Image } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

const CATEGORIAS = {
  predecirBitcoin: ['predecir el precio bitcoin', 'precio bitcoin', 'predecir bitcoin', 'bitcoin'],
  PredecirPrecioAuto: ['precedir el precio de un automovil', 'precio de un automóvil', 'predecir precio automóvil', 'precio automóvil', 'automóvil', 'precio auto', 'precio de un auto', 'auto'],
  PredecirPrecioCasa: ['precedir el precio de una casa', 'precio de una casa', 'predecir precio casa', 'precio casa', 'casa'],
  PredecirCalidadVino: ['predecir la calidad del vino', 'calidad del vino', 'predecir vino', 'vino'],
};

export default function App() {
  const [isSpeaking, setIsSpeaking] = useState(false);

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
    speak("¿En qué puedo ayudarte?")
  };

  const speak = (text) => {
    setIsSpeaking(true);

    Speech.speak(text || 'Hola, ¿cómo puedo ayudarte?', {
      language: 'es-ES',
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const identificarCategoria = (transcripcion) => {
    for (let categoria in CATEGORIAS) {
      for (let keyword of CATEGORIAS[categoria]) {
        if (transcripcion.toLowerCase().includes(keyword)) {
          return categoria;
        }
      }
    }
    return "no reconocido";
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      {!isListening.current &&
        <Button
          title={recordingRef.current ? 'Stop Recording' : 'Start Recording'}
          onPress={recordingRef.current ? stopRecording : startRecording}
        />
      }
      {/* {audioUri && (
        <Button
          title="Play the saved audio"
          onPress={() => {
            const sound = new Audio.Sound();
            try {
              sound.loadAsync({ uri: audioUri }, { shouldPlay: true });
            } catch (error) {
              console.log('Error loading sound', error);
            }
          }}
        />
      )} */}
      <Button title="Speak" onPress={() => speak(transcription)} />

      {/* {isProcessing ? (
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ color: 'white' }}>Processing transcription...</Text>
        </View>
      ) : transcription ? (
        <Text style={{ marginTop: 20, color: 'white' }}>{`Transcription: ${transcription}`}</Text>
      ) : (
        <Text style={{ marginTop: 20, color: 'white' }}>Waiting for transcription...</Text>
      )} */}

      <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: 150 }}>
        {(!recordingRef.current || isSpeaking) && (
          <Image
            source={require('../assets/images/sound_waves.gif')} 
            style={{ width: '100%' }} 
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );
}
