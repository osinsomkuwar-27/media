import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import apiClient, { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

export default function MediaDetailsScreen({ route }) {
  const { mediaId } = route.params;
  const { refreshUser } = useAuth();
  const [media, setMedia] = useState(null);
  const [accessUrl, setAccessUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  async function loadMedia() {
    try {
      const res = await apiClient.get(`/media/${mediaId}`);
      const fetchedMedia = res.data.data.media;
      setMedia(fetchedMedia);
      setImageLoadError(false);

      if (fetchedMedia.isOwner || fetchedMedia.isUnlocked) {
        await loadAccessUrl();
      } else {
        setAccessUrl(null);
      }
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadAccessUrl() {
    try {
      const res = await apiClient.get(`/media/${mediaId}/access-url`);
      setAccessUrl(res.data.data.accessUrl);
    } catch (err) {
      // If this fails, we simply fall back to showing the preview below.
      setAccessUrl(null);
    }
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadMedia();
    }, [mediaId])
  );

  function confirmUnlock() {
    Alert.alert(
      "Unlock Media",
      `Spend ${media.unlockPrice} coins to unlock "${media.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Unlock", onPress: handleUnlock },
      ]
    );
  }

  async function handleUnlock() {
    setUnlocking(true);
    try {
      await apiClient.post(`/media/${mediaId}/unlock`);
      await refreshUser();
      await loadMedia();
    } catch (err) {
      Alert.alert("Unlock failed", getErrorMessage(err));
    } finally {
      setUnlocking(false);
    }
  }

  if (loading || !media) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2980b9" />
      </SafeAreaView>
    );
  }

  const canSeeOriginal = (media.isOwner || media.isUnlocked) && accessUrl;

  const imageSource = canSeeOriginal
    ? { uri: `${API_BASE_URL}${accessUrl}` }
    : { uri: `${API_BASE_URL}${media.previewUrl}` };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {imageLoadError ? (
          <View style={[styles.image, styles.imageErrorBox]}>
            <Text style={styles.imageErrorText}>Image failed to load</Text>
          </View>
        ) : (
          <Image
            source={imageSource}
            style={styles.image}
            onError={() => setImageLoadError(true)}
          />
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{media.title}</Text>
          {media.description ? (
            <Text style={styles.description}>{media.description}</Text>
          ) : null}
          <Text style={styles.creator}>by {media.creator?.name}</Text>
          <Text style={styles.price}>Unlock price: {media.unlockPrice} coins</Text>

          {media.isOwner && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>This is your media</Text>
            </View>
          )}

          {!media.isOwner && media.isUnlocked && (
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedBadgeText}>Unlocked — you own this content</Text>
            </View>
          )}

          {!media.isOwner && !media.isUnlocked && (
            <TouchableOpacity
              style={styles.unlockButton}
              onPress={confirmUnlock}
              disabled={unlocking}
            >
              {unlocking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.unlockButtonText}>
                  Unlock for {media.unlockPrice} coins
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  image: { width: "100%", height: 320, backgroundColor: "#eee" },
  imageErrorBox: { justifyContent: "center", alignItems: "center" },
  imageErrorText: { color: "#999" },
  body: { padding: 20 },
  title: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
  description: { fontSize: 14, color: "#555", marginTop: 8 },
  creator: { fontSize: 14, color: "#666", marginTop: 8 },
  price: { fontSize: 15, fontWeight: "600", color: "#333", marginTop: 10 },
  unlockButton: {
    backgroundColor: "#2980b9",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 20,
  },
  unlockButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  ownerBadge: {
    backgroundColor: "#eaf4fb",
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  ownerBadgeText: { color: "#2980b9", fontWeight: "600", textAlign: "center" },
  unlockedBadge: {
    backgroundColor: "#eafbf0",
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  unlockedBadgeText: { color: "#27ae60", fontWeight: "600", textAlign: "center" },
});