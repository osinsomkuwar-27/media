import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import apiClient, { getErrorMessage } from "../api/client";

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TransactionRow({ item }) {
  const isCredit = item.amount > 0;
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.reason}>
          {item.type === "MEDIA_UNLOCK" && "Unlocked media"}
          {item.type === "MEDIA_SALE" && "Media sold"}
          {item.type === "INITIAL_CREDIT" && "Signup bonus"}
        </Text>
        {item.mediaTitle ? (
          <Text style={styles.mediaTitle} numberOfLines={1}>
            {item.mediaTitle}
          </Text>
        ) : null}
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={[styles.amount, { color: isCredit ? "#27ae60" : "#c0392b" }]}>
        {isCredit ? "+" : ""}
        {item.amount} coins
      </Text>
    </View>
  );
}

export default function WalletScreen() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadWallet() {
    try {
      const [walletRes, txRes] = await Promise.all([
        apiClient.get("/wallet"),
        apiClient.get("/wallet/transactions", { params: { page: 1, limit: 50 } }),
      ]);
      setBalance(walletRes.data.data.coinBalance);
      setTransactions(txRes.data.data.transactions);
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
      loadWallet();
    }, [])
  );

  function onRefresh() {
    setRefreshing(true);
    loadWallet();
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2980b9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>{balance} coins</Text>
      </View>

      <Text style={styles.sectionTitle}>Transaction History</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => <TransactionRow item={item} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No transactions yet.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  balanceCard: {
    backgroundColor: "#2980b9",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  balanceLabel: { color: "#eaf4fb", fontSize: 13, fontWeight: "600" },
  balanceValue: { color: "#fff", fontSize: 30, fontWeight: "800", marginTop: 6 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  reason: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  mediaTitle: { fontSize: 13, color: "#666", marginTop: 2 },
  date: { fontSize: 12, color: "#999", marginTop: 4 },
  amount: { fontSize: 15, fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 40, color: "#888" },
});