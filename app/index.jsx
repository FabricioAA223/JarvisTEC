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
export default function App() {

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="Registro Facial">
        <Stack.Screen name="Registro Facial" options={{ headerShown: false }}  component={FacialLogin} />
        <Stack.Screen name="HomePage" options={{ headerShown: false }}  component={HomePage} />
      </Stack.Navigator>
    </NavigationContainer>
);
}
