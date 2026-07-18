import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

export default function MediaCard({ item, onPress }) {
  const { token } = useAuth();

  const previewSource = {
    uri: `${API_BASE_URL}${item.previewUrl}`,
    headers: { Authorization: `Bearer ${token}` },
  };

  let statusLabel = "Locked";
  let statusColor = "#c0392b";

  if (item.isOwner) {
    statusLabel = "Your Media";
    statusColor = "#2980b9";
  } else if (item.isUnlocked) {
    statusLabel = "Unlocked";
    statusColor = "#27ae60";
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={previewSource} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.creator}>by {item.creator?.name || "Unknown"}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>{item.unlockPrice} coins</Text>
          <View style={[styles.badge, { backgroundColor: statusColor }]}>
            <Text style={styles.badgeText}>{statusLabel}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#eee",
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  creator: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});