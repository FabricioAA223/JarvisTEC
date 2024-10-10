import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Image, Alert, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FacialLogin from '../components/FacialLogin';
import HomePage from "../components/HomePage";
import CarForm, { modeloCoche } from "../components/CarForm";

const Stack = createStackNavigator();

const stringNumbers = [
  //Tradicional
  {string:'cero', number:0},
  {string:'uno', number:1},
  {string:'primero', number:1},
  {string:'dos', number:2},
  {string:'tres', number:3},
  {string:'cuatro', number:4},
  {string:'cinco', number:5},
  {string:'seis', number:6},
  {string:'siete', number:7},
  {string:'ocho', number:8},
  {string:'nueve', number:9},

  {string:'enero', number:1},
  {string:'febrero', number:2},
  {string:'marzo', number:3},
  {string:'abril', number:4},
  {string:'mayo', number:5},
  {string:'junio', number:6},
  {string:'julio', number:7},
  {string:'agosto', number:8},
  {string:'setiembre', number:9},
  {string:'septiembre', number:9},
  {string:'octubre', number:10},
  {string:'oktubre', number:10},
  {string:'noviembre', number:11},
  {string:'diciembre', number:12},

  //Adicional 
  {string:'mujer', number:0},
  {string:'rural', number:0},
  {string:'femenino', number:0},
  {string:'no amueblada', number:0},

  {string:'semi amueblada', number:2},


  {string:'hombre', number:1},
  {string:'urbana', number:1},
  {string:'masculino', number:1},
  {string:'amueblada', number:1},

  {string:'no', number:0},
  {string:'si', number:1},
  {string:'sí', number:1},
]

const isStringANumber = (str) => {
  if (!str.toLowerCase().includes("error")) {
    const matchedNumbers = stringNumbers.filter((e) => str.toLowerCase().includes(e.string));
    console.log("AFTER FILTER: ", matchedNumbers);
    if (matchedNumbers.length > 0) {
      return matchedNumbers[0].number;
    } else {
      return null; // No match found
    }
  }
  return null; // Error case
}

const modeloMasaCorporal = [
  {pregunta:"¿Cuál es tu peso actual en kilogramos?", parametro:"Weight"},
  {pregunta:"¿Cuál es la medida de la circunferencia de tu abdomen en centímetros, tomada a la altura del ombligo?", parametro:"Abdomen"},
  {pregunta:"¿Cuál es la medida de la circunferencia de tu muñeca en centímetros?", parametro:"Wrist"},
  {pregunta:"¿Cuál es la medida de la circunferencia de tu antebrazo en centímetros?", parametro:"Forearm"},
  {pregunta:"¿Cuál es la medida de la circunferencia de tu pecho en centímetros?", parametro:"Chest"},
  {pregunta:"¿Cuál es la medida de la circunferencia de tu cadera en centímetros?", parametro:"Hip"},
  {pregunta:"¿Cuál es la medida de la circunferencia de tu muslo en centímetros, tomada en su punto más ancho?", parametro:"Thigh"},
  {pregunta:"¿Cuál es la medida de la circunferencia de tu cuello en centímetros?", parametro:"Neck"},
  {pregunta:"¿Cuál es la medida de la circunferencia de tu rodilla en centímetros?", parametro:"Knee"},
]

const modeloAtaqueCardiaco = [
  {pregunta:"¿Cuál es tu género?", parametro:"gender"},
  {pregunta:"¿Cuál es tu edad?", parametro:"age"},
  {pregunta:"¿Tienes hipertensión?", parametro:"hypertension"},
  {pregunta:"¿Tienes alguna enfermedad cardíaca?", parametro:"heart_disease"},
  {pregunta:"¿Alguna vez has estado casado?", parametro:"ever_married"},
  {pregunta:"¿Vives en una zona urbana o rural?", parametro:"Residence_type"},
  {pregunta:"¿Cuál es tu nivel promedio de glucosa en sangre?", parametro:"avg_glucose_level"},
  {pregunta:"¿Cuál es tu índice de masa corporal?", parametro:"bmi"},
  {pregunta:"¿Has trabajado alguna vez?", parametro:"work_type_Never_worked"},
  {pregunta:"¿Trabajas en el sector privado?", parametro:"work_type_Private"},
  {pregunta:"¿Eres trabajador por cuenta propia?", parametro:"work_type_Self-employed"},
  {pregunta:"¿Eres un niño que aún no ha trabajado?", parametro:"work_type_children"},
  {pregunta:"¿Fumabas anteriormente?", parametro:"smoking_status_formerly smoked"},
  {pregunta:"¿Nunca has fumado?", parametro:"smoking_status_never smoked"},
  {pregunta:"¿Fumas actualmente?", parametro:"smoking_status_smokes"}
];

const modeloPrecioCasa = [
  {pregunta:"¿Cuál es el área total de la casa en pies cuadrados?", parametro:"area"},
  {pregunta:"¿Cuántos dormitorios tiene la casa?", parametro:"bedrooms"},
  {pregunta:"¿Cuántos baños tiene la casa?", parametro:"bathrooms"},
  {pregunta:"¿Cuántos pisos tiene la casa?", parametro:"stories"},
  {pregunta:"¿La casa tiene acceso directo a la carretera principal?", parametro:"mainroad"},
  {pregunta:"¿La casa cuenta con cuarto de huéspedes?", parametro:"guestroom"},
  {pregunta:"¿La casa tiene sótano?", parametro:"basement"},
  {pregunta:"¿La casa tiene calefacción de agua caliente?", parametro:"hotwaterheating"},
  {pregunta:"¿La casa cuenta con aire acondicionado?", parametro:"airconditioning"},
  {pregunta:"¿Cuántos espacios de estacionamiento tiene la casa?", parametro:"parking"},
  {pregunta:"¿La casa está en una zona preferencial?", parametro:"prefarea"},
  {pregunta:"¿La casa está amueblada o semi-amueblada?", parametro:"furnishingstatus"}
];

const modeloCirrosis = [
  {pregunta:"¿Cuántos días han pasado desde que fue diagnosticado?", parametro:"N_Days"},
  {pregunta:"¿Cuál es el estado actual del paciente? (0: con vida, 1: trasplante, 2: fallecido)", parametro:"Status"},
  {pregunta:"¿Cuál es la edad del paciente en días?", parametro:"Age"},
  {pregunta:"¿El paciente tiene ascitis?", parametro:"Ascites"},
  {pregunta:"¿El paciente presenta hepatomegalia (aumento del tamaño del hígado)?", parametro:"Hepatomegaly"},
  {pregunta:"¿El paciente presenta arañas vasculares?", parametro:"Spiders"},
  {pregunta:"¿El paciente tiene edema?", parametro:"Edema"},
  {pregunta:"¿Cuál es el nivel de bilirrubina del paciente?", parametro:"Bilirubin"},
  {pregunta:"¿Cuál es el nivel de albúmina en la sangre del paciente?", parametro:"Albumin"},
  {pregunta:"¿Cuál es el nivel de cobre en la sangre del paciente?", parametro:"Copper"},
  {pregunta:"¿Cuál es el nivel de fosfatasa alcalina en el paciente?", parametro:"Alk_Phos"},
  {pregunta:"¿Cuál es el nivel de aspartato aminotransferasa en el paciente?", parametro:"SGOT"},
  {pregunta:"¿Cuál es el nivel de triglicéridos en el paciente?", parametro:"Tryglicerides"},
  {pregunta:"¿Cuál es el recuento de plaquetas del paciente?", parametro:"Platelets"},
  {pregunta:"¿Cuál es el nivel de tiempo de protrombina en el paciente?", parametro:"Prothrombin"}
];

const modeloCambioProveedorTelefonia = [
  {pregunta:"¿El cliente es una persona mayor?", parametro:"SeniorCitizen"},
  {pregunta:"¿El cliente tiene pareja?", parametro:"Partner"},
  {pregunta:"¿El cliente tiene dependientes?", parametro:"Dependents"},
  {pregunta:"¿Cuántos meses lleva el cliente con el proveedor actual?", parametro:"tenure"},
  {pregunta:"¿Qué tipo de servicio de internet tiene el cliente? (0 para Ninguno, 1 para DSL, 2 para Fibra óptica)", parametro:"InternetService"},
  {pregunta:"¿El cliente tiene seguridad en línea? (0 para No disponible, 1 para No, 2 para Sí)", parametro:"OnlineSecurity"},
  {pregunta:"¿El cliente tiene respaldo en línea?", parametro:"OnlineBackup"},
  {pregunta:"¿El cliente tiene protección de dispositivos? (0 para No disponible, 1 para No, 2 para Sí)", parametro:"DeviceProtection"},
  {pregunta:"¿El cliente tiene soporte técnico? (0 para No disponible, 1 para No, 2 para Sí)", parametro:"TechSupport"},
  {pregunta:"¿Qué tipo de contrato tiene el cliente? (0 para Mes a mes, 1 para Un año, 2 para Dos años)", parametro:"Contract"},
  {pregunta:"¿El cliente tiene facturación sin papel?", parametro:"PaperlessBilling"},
  {pregunta:"¿Cuál es el método de pago del cliente? (0 para Cheque electrónico, 1 para Cheque bancario, 2 para Tarjeta de crédito, 3 para Transferencia bancaria)", parametro:"PaymentMethod"},
  {pregunta:"¿Cuánto paga el cliente mensualmente?", parametro:"MonthlyCharges"}
];

const modeloClasificacionVino = [
  {pregunta:"¿Cuál es la acidez volátil del vino?", parametro:"volatile acidity"},
  {pregunta:"¿Cuál es el nivel de ácido cítrico en el vino?", parametro:"citric acid"},
  {pregunta:"¿Cuál es el nivel de cloruros en el vino?", parametro:"chlorides"},
  {pregunta:"¿Cuál es el nivel total de dióxido de azufre en el vino?", parametro:"total sulfur dioxide"},
  {pregunta:"¿Cuál es la densidad del vino?", parametro:"density"},
  {pregunta:"¿Cuál es el nivel de sulfatos en el vino?", parametro:"sulphates"},
  {pregunta:"¿Cuál es el contenido de alcohol del vino?", parametro:"alcohol"}
];

const modeloPrediccionHepatitis = [
  {pregunta:"¿Cuál es el sexo del paciente?", parametro:"Sex"},
  {pregunta:"¿Cuál es el nivel de albúmina en gramos por litro del paciente?", parametro:"ALB"},
  {pregunta:"¿Cuál es el nivel de alanina aminotransferasa en unidades por litro del paciente?", parametro:"ALT"},
  {pregunta:"¿Cuál es el nivel de aspartato aminotransferasa en unidades por litro del paciente?", parametro:"AST"},
  {pregunta:"¿Cuál es el nivel de bilirrubina en micromoles por litro del paciente?", parametro:"BIL"},
  {pregunta:"¿Cuál es el nivel de colinesterasa en kilounidades por litro del paciente?", parametro:"CHE"},
  {pregunta:"¿Cuál es el nivel de colesterol en milimoles por litro del paciente?", parametro:"CHOL"},
  {pregunta:"¿Cuál es el nivel de creatinina en micromoles por litro del paciente?", parametro:"CREA"},
  {pregunta:"¿Cuál es el nivel de GGT (gamma-glutamil transferasa) en unidades por litro del paciente?", parametro:"GGT"}
];

const modeloBitcoin = [
  {pregunta:"¿En qué año desea predecir el precio del bitcoin?", parametro:"year"},
  {pregunta:"¿En qué mes desea predecir el precio del bitcoin?", parametro:"month"},
  {pregunta:"¿En qué día desea predecir el precio del bitcoin?", parametro:"day"},
]

const modeloAcciones = [
  {pregunta:"¿En qué año desea predecir el precio de las acciones?", parametro:"year"},
  {pregunta:"¿En qué mes desea predecir el precio de las acciones?", parametro:"month"},
  {pregunta:"¿En qué día desea predecir el precio de las acciones?", parametro:"day"},
]

const CATEGORIAS = [
  {
    keywords: ['qué puedes hacer', 'qué comandos', 'qué funciones', 'qué funcionalidades', 'qué sabes hacer'],
    nombre:'comandos'
  },
  {
    keywords: ['precedir el precio de un automovil', 'precio de un automóvil', 'predecir precio automóvil', 'precio automóvil', 'automóvil', 'precio auto', 'precio de un auto', 'auto'], 
    nombre:"Precio auto", 
    preguntas: modeloCoche,
    endPoint: 'predict_price_vehicle ',
    useForm: true
  }, 
  {
    keywords: ['predecir grasa corporal', 'grasa corporal'], 
    nombre:"grasa corporal", 
    preguntas: modeloMasaCorporal,
    endPoint: 'predict_bodyfat ',
    useForm: false
  },
  {
    keywords: ['predecir ataque cardíaco', 'predecir ataque corazón', 'paro cardíaco', 'ataque cardíaco', 'ataque corazón'], 
    nombre:"Ataque cardiaco", 
    preguntas: modeloAtaqueCardiaco,
    endPoint: 'predict_stroke ',
    useForm: false
  },
  {
    keywords: ['precedir el precio de una casa', 'precio de una casa', 'predecir precio casa', 'precio casa', 'casa'], 
    nombre:"Precio casa", 
    preguntas: modeloPrecioCasa,
    endPoint: 'predict_house_price ',
    useForm: false
  },
  {
    keywords: ['predecir la cirrosis', 'cirrosis'], 
    nombre:"Cirrosis", 
    preguntas: modeloCirrosis,
    endPoint: 'predict_cirrosis',
    useForm: false
  },
  {
    keywords: ['predecir cambio de proveedor', 'proveedor'], 
    nombre:"Proveedor telefonico", 
    preguntas: modeloCambioProveedorTelefonia,
    endPoint: 'predict_telephony',
    useForm: false
  },
  {
    keywords: ['predecir la calidad del vino', 'predecir la calidad de un vino', 'calidad del vino', 'predecir vino', 'vino'], 
    nombre:"Calidad del vino", 
    preguntas: modeloClasificacionVino,
    endPoint: 'classify_vino',
    useForm: false
  },
  {
    keywords: ['predecir la hepatitis', 'hepatitis'], 
    nombre:"Hepatitis", 
    preguntas: modeloPrediccionHepatitis,
    endPoint: 'predict_hepatitis',
    useForm: false
  },

  {
    keywords: ['predecir el precio del bitcoin', 'precio bitcoin', 'predecir bitcoin', 'bitcoin'], 
    nombre:"Predecir bitcoin", 
    preguntas: modeloBitcoin,
    endPoint: '/predict_bitcoin',
    useForm: false
  },
  {
    keywords: ['predecir el precio de las acciones', 'precio acciones','acciones'], 
    nombre:"Predecir acciones", 
    preguntas: modeloAcciones,
    endPoint: '/mercadoSP',
    useForm: false
  },
];

export default function App() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isListening = useRef(true); //inicia en true
  const transcriptionRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef(null);
  const isRecording = useRef(false); // Usar useRef para controlar el estado de grabación
  const categoryRef = useRef(null) //inicia en null
  const firstCall = useRef(true)
  const [showCarForm, setShowCarForm] = useState(false);

  const handleFormSubmit = (data) => {
    console.log('Datos del formulario:', data);
    callIAModel(data, 'predict_price_vehicle')
    setShowCarForm(false);
    startListening();
  };

  const startListening = async () => {
    isListening.current = true;

    console.log("Iniciando app");
    transcriptionRef.current = null
    setIsProcessing(false)
    recordingRef.current = null
    isRecording.current=false
    categoryRef.current = null

    if (isListening.current) {
      console.log('Listening for "Hey Jarvis"...');
      await startRecording();
    }
  };

  useEffect(() => {
    const requestPermissions = async () => {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        alert("Permiso de grabación denegado. Por favor, habilita los permisos desde la configuración.");
        return;
      }
      
      startListening();
    };
  
    requestPermissions();
  
    return () => {
      stopRecording();
    };
  }, [isListening]);



  const startRecording = async (period = 7000) => {
    console.log("Iniciando grabacion")
    if (isRecording.current) {
      console.log("Ya hay una grabacion en curso")
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
      }, isListening.current? 2500: period);

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
    if (!uri) {
      transcriptionRef.current = 'Error: Invalid URI provided.';
      setIsProcessing(false);
      return;
    }    
    setIsProcessing(true);
    transcriptionRef.current =null;
    const ERROR_MESSAGE = "Error: El audio no pudo ser entendido.";

    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    });

    try {
      const response = await fetch('https://swine-upright-possibly.ngrok-free.app/convert-and-transcribe/', {
        method: 'POST',
        body: formData,
        headers: {
          // 'Content-Type': 'multipart/form-data',
        },
        cache: 'no-cache', // Desactivar caché
      });

      if (!response.ok) {
        transcriptionRef.current = `Error del servidor: ${response.statusText}`;
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Server response:', result);

      // Verificamos si hay transcripción en la respuesta del servidor
      if (result && result.transcription && result.transcription !== ERROR_MESSAGE) {
        transcriptionRef.current = result.transcription;
        if(isListening.current){
          if (result.transcription.toLowerCase().includes('gracias') && !firstCall.current){
            await speakAndWait("Con gusto, si deseas predecir otras opciones no dudes en llamarme")
          }
          // Disparar acción si la transcripción contiene "jarvis"
          else if (result.transcription.toLowerCase().includes('jarvis')) {
            triggerJarvisAction();
          }
        } else {
          console.log("No está escuchando, buscando categoría")
          if (!categoryRef.current){
            const category = identificarCategoria(result.transcription);
            console.log("Retorno: ", category)
            if (category){

              // } else {
                makeQuestions(category.category);
              // }
            } else {
              await speakAndWait("Lo siento, no estoy entrenado para eso")
              isListening.current = true;
            }
          }
        }
      } else {
        transcriptionRef.current = 'Error: No transcription found.';
      }
    } catch (error) {
      if (retry > 0) {
        return sendAudioToBackend(uri, retry - 1);
      }
      console.error('Error sending file to backend:', error);
      transcriptionRef.current = 'Error enviando el archivo. Verifica tu conexión de red.';
    } finally {
      setIsProcessing(false);
    }
  };

  const callIAModel = async (data, endPoint) => {

    const combinedData = data.reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});
    console.log("Combined data: ",  combinedData)

    try {
      const response = await fetch(`http://172.24.65.76:8080/${endPoint}`, {
        method: 'POST',
        body: JSON.stringify(combinedData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('Server response:', result);
      if (!result.error){
        await speakAndWait("Analizando la información suministrada")
          
        // setTimeout(async() => {
          await speakAndWait(`Respuesta lista: ${result}`);
          isListening.current = true;
          startListening();
          // return;
        // }, 2000);
      }
      else{
        await speakAndWait("Ha ocurrido un error al procesar la información")
        isListening.current = true;
        startListening();
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    } finally {
      isListening.current = true;
    }
  };

  const triggerJarvisAction = () => {
    console.log('Hey Jarvis detected!');
    firstCall.current = false;
    isListening.current = false;
    stopRecording();
    speak("¿En qué puedo ayudarte?");
  };

  const speak = (text) => {
    setIsSpeaking(true);
    Speech.speak(text, {
      language: 'es-ES',
      onDone: () => {
        if(text == "¿En qué puedo ayudarte?"){
          startRecording()
        }
        setIsSpeaking(false)
      },
      onError: () => setIsSpeaking(false),
    });
  };

  const identificarCategoria = (trans) => {
    for (let categoria in CATEGORIAS) {
      const categoryObject = CATEGORIAS[categoria];
      for (let keyword of categoryObject.keywords) {
        if (trans.toLowerCase().includes(keyword.toLowerCase())) {
          categoryRef.current = categoryObject.nombre
          return {category: categoryObject};
        }
      }
    }
    return null
  };

  const makeQuestions = async (categoria) => {
    if(categoria.nombre === "comandos"){
      await speakAndWait("Actualmente estoy entrenado para: predecir el precio de un vehículo o de una casa,  predecir la grasa corporal de una persona, predecir si una persona le va a dar un ataque cardiaco, predecir si una persona padece de cirrosis o de hepatitis, predecir si una persona se va a cambiar de proveedor de telefonía, clasificar la calidad de un vino y para predecir el precio del bitcoin o de acciones")
      startListening();
      return;
    }
    if (categoria.useForm) {
      // setL
      setShowCarForm(true);
      return;
    }
    const questionsList = categoria.preguntas
    const responses = [];
    for (const pregunta of questionsList) {
      let giveANumber = true;
      
      await speakAndWait(pregunta.pregunta)
      // Iniciar la grabación y esperar la transcripción
      
      let transcription = await getTranscriptionFromRecording(4500);
      // Validar si la transcripción es un número
      while (giveANumber) {
        const extractedNumber = extractNumber(transcription); // Intentar extraer número
        if (extractedNumber !== null) {
          giveANumber = false;
          console.log("Agrego ", extractedNumber, " a la lista")
          responses.push({[pregunta.parametro] : extractedNumber});
        } else {
          const isNumberLessThanTen = isStringANumber(transcription)
          console.log("Numero menor a 10: ", isNumberLessThanTen)
          if (isNumberLessThanTen != null){
            giveANumber = false;
            console.log("Agrego ", isNumberLessThanTen, " a la lista")
            responses.push({[pregunta.parametro] : isNumberLessThanTen});
          }
          else {
            // Si no es un número, pedir al usuario que repita
            await speakAndWait("Número no reconocido, por favor repítalo");
            const newTranscription = await getTranscriptionFromRecording(4500); // Obtener nueva transcripción
            transcription = newTranscription;
          }
        }
      }
    }
    console.log("Respuestas recogidas para predicción de Bitcoin:", responses);
    callIAModel(responses, categoria.endPoint)
  };

  // Función para extraer un número de la transcripción
  const extractNumber = (text) => {
    const match = text.match(/-?\d+(\.\d+)?/); // Expresión regular para enteros o decimales
    return match ? parseFloat(match[0]) : null; // Convertir el primer número encontrado a float
  };

  // Función para manejar la grabación y esperar la transcripción
  const getTranscriptionFromRecording = async (period) => {
    transcriptionRef.current = null
    await startRecording(period); // Iniciar grabación y esperar el tiempo definido
    return new Promise((resolve) => {
      const checkTranscription = setInterval(() => {
        if (transcriptionRef.current) {
          clearInterval(checkTranscription);
          resolve(transcriptionRef.current); // Devolver la transcripción
        }
      }, 500); // Revisa cada 500ms si la transcripción ya está disponible
    });
  };

  const speakAndWait = (text) => {
    setIsSpeaking(true);
    return new Promise((resolve) => {
      Speech.speak(text, {
        language: 'es-ES',
        onDone: () => {
          if(text === "¿En qué puedo ayudarte?"){  // Use strict equality
            startRecording();
          }
          setIsSpeaking(false);
          resolve();  // Call resolve with parentheses
        },
        onError: () => {
          setIsSpeaking(false);
          resolve();  // Call resolve with parentheses
        }
      });
    });
  };

  return (

//     <NavigationContainer independent={true}>
//       <Stack.Navigator initialRouteName="Registro Facial">
//         <Stack.Screen name="Registro Facial" options={{ headerShown: false }}  component={FacialLogin} />
//         <Stack.Screen name="HomePage" options={{ headerShown: false }}  component={HomePage} />
//       </Stack.Navigator>
//     </NavigationContainer>

  <View style={styles.container}>
      <Image 
        source={isSpeaking ? require('../assets/Speaking.gif') : require('../assets/IA_BG2.jpg')} 
        style={{ width: '100%', height: 'auto', aspectRatio: '2/3' }} 
        resizeMode="contain"
      />
      <View style={styles.soundWavesContainer}>
        {(!isProcessing && !isSpeaking && transcriptionRef.current) && (
          <Image
            source={require('../assets/images/sound_waves.gif')} 
            style={{ width: '100%' }} 
            resizeMode="contain"
          />
        )}
      </View>
      <Modal
        visible={showCarForm}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCarForm(false)}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <CarForm onSubmit={handleFormSubmit} />
        </View>
      </Modal>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  soundWavesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 150,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 25,
    right: 25,
    backgroundColor: 'black',
    borderRadius: 50,
    padding: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});