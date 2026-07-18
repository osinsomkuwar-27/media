import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import apiClient, { getErrorMessage } from "../api/client";

export default function UploadScreen({ navigation }) {
  const [imageAsset, setImageAsset] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unlockPrice, setUnlockPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your photo gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageAsset(result.assets[0]);
    }
  }

  async function handleUpload() {
    if (!imageAsset) {
      Alert.alert("Validation", "Please select an image first");
      return;
    }
    if (title.trim().length === 0) {
      Alert.alert("Validation", "Title is required");
      return;
    }
    const priceNum = Number(unlockPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert("Validation", "Unlock price must be a valid number >= 0");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      const uriParts = imageAsset.uri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      formData.append("image", {
        uri: imageAsset.uri,
        name: `upload.${fileType}`,
        type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
      });
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("unlockPrice", String(priceNum));

      await apiClient.post("/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Media uploaded successfully");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Upload failed", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Upload Media</Text>

        <TouchableOpacity style={styles.picker} onPress={pickImage}>
          {imageAsset ? (
            <Image source={{ uri: imageAsset.uri }} style={styles.previewImage} />
          ) : (
            <Text style={styles.pickerText}>Tap to select an image</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Unlock price (coins)"
          value={unlockPrice}
          onChangeText={setUnlockPrice}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Publish</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scroll: { padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: "#1a1a1a" },
  picker: {
    height: 200,
    backgroundColor: "#eee",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  pickerText: { color: "#888" },
  previewImage: { width: "100%", height: "100%" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#27ae60",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});