"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Keyboard,
} from "react-native"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import { styles } from "./styles"
import ColorPalette from "../../../constants/ColorPalette"
import Button from '../../../components/button/Button'
export default function CreateTrendScreen({ navigation }) {
  const [text, setText] = useState("")
  const [image, setImage] = useState(null)
  const [location, setLocation] = useState(null)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    requestLocationPermission()
    requestMediaPermissions()

    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true))
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false))

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  // Function to request media permissions
  const requestMediaPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      alert("Sorry, we need camera and media library permissions to make this work!")
    }
  }

  // Function to request location permissions
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      alert("Permission to access location was denied")
    }
  }

  // Function to pick image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })

      if (!result.canceled) {
        setImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
    }
  }

  // Function to take photo with camera
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })

      if (!result.canceled) {
        setImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error taking photo:", error)
    }
  }

  // Function to get user location and reverse geocode it
  const fetchLocation = async () => {
    setLoadingLocation(true)
    try {
      const { coords } = await Location.getCurrentPositionAsync({})
      const address = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      })

      if (address.length > 0) {
        const { city, country } = address[0]
        setLocation(`${city}, ${country}`)
      } else {
        setLocation("Location not found")
      }
    } catch (error) {
      console.error(error)
      setLocation("Error fetching location")
    }
    setLoadingLocation(false)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowCancelModal(true)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.startButton}
          >
            <Text style={styles.startText}>Start trend</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Image
            source={{
              uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-66hk88GgIvR1nTmeu4WYoUFCOcdnlh.png",
            }}
            style={styles.avatar}
          />
          <TextInput
            style={styles.input}
            placeholder="What's happening?"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            multiline
            onChangeText={setText}
            value={text}
          />
        </View>

        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.bottomBar, keyboardVisible && styles.bottomBarWithKeyboard]}>
        <TouchableOpacity onPress={pickImage}>
          <MaterialIcons name="photo" size={24} color={ColorPalette.gradient_text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={takePhoto}>
          <MaterialIcons name="photo-camera" size={24} color={ColorPalette.gradient_text} />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="gif" size={24} color={ColorPalette.gradient_text} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="bar-chart-2" size={24} color={ColorPalette.gradient_text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={fetchLocation}>
          <Feather name="map-pin" size={24} color={ColorPalette.gradient_text} />
        </TouchableOpacity>
      </View>

      {loadingLocation ? (
        <ActivityIndicator size="small" color={ColorPalette.gradient_text} />
      ) : (
        location && (
          <Text style={[styles.locationText, keyboardVisible && styles.locationTextWithKeyboard]}>{location}</Text>
        )
      )}

      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Discard trend?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonNo]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonYes]} onPress={() => navigation.goBack()}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

