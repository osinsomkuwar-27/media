import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import apiClient, { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import MediaCard from "../components/MediaCard";

export default function FeedScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadFeed() {
    try {
      const res = await apiClient.get("/media", { params: { page: 1, limit: 50 } });
      setItems(res.data.data.items);
      await refreshUser();
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadFeed();
    }, [])
  );

  function onRefresh() {
    setRefreshing(true);
    loadFeed();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.name}</Text>
          <Text style={styles.balance}>{user?.coinBalance} coins</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => navigation.navigate("Upload")}
      >
        <Text style={styles.uploadButtonText}>+ Upload New Media</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2980b9" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <Text style={styles.empty}>No media yet. Be the first to upload!</Text>
          }
          renderItem={({ item }) => (
            <MediaCard
              item={item}
              onPress={() => navigation.navigate("MediaDetails", { mediaId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greeting: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
  balance: { fontSize: 14, color: "#27ae60", fontWeight: "700", marginTop: 2 },
  logout: { color: "#c0392b", fontWeight: "600" },
  uploadButton: {
    backgroundColor: "#2980b9",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadButtonText: { color: "#fff", fontWeight: "700" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { textAlign: "center", marginTop: 40, color: "#888" },
});