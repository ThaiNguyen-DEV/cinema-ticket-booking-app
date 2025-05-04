import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { Ionicons } from "@expo/vector-icons";

const ManagePromotionsScreen = ({ navigation }: any) => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPromotions = async () => {
    try {
      setLoading(true);

      const promotionsQuery = query(
        collection(db, "promotions"),
        orderBy("createdAt", "desc")
      );

      const promotionsSnapshot = await getDocs(promotionsQuery);
      const promotionsData = promotionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPromotions(promotionsData);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      Alert.alert("Error", "Failed to load promotions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPromotions();

    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener("focus", () => {
      fetchPromotions();
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPromotions();
  };

  const handleDeletePromotion = (promotionId: string, articleId: string) => {
    Alert.alert(
      "Delete Promotion",
      "Are you sure you want to delete this promotion?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete promotion
              await deleteDoc(doc(db, "promotions", promotionId));

              // Delete associated article
              if (articleId) {
                await deleteDoc(doc(db, "articles", articleId));
              }

              setPromotions(
                promotions.filter((promo) => promo.id !== promotionId)
              );
              Alert.alert("Success", "Promotion deleted successfully");
            } catch (error) {
              console.error("Error deleting promotion:", error);
              Alert.alert("Error", "Failed to delete promotion");
            }
          },
        },
      ]
    );
  };

  const renderPromotionItem = ({ item }: any) => {
    // Format date
    const createdDate =
      item.createdAt && item.createdAt.seconds
        ? new Date(item.createdAt.seconds * 1000)
        : new Date();

    const formattedDate = createdDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return (
      <View style={styles.promotionCard}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.promotionImage}
          resizeMode="cover"
        />

        <View style={styles.promotionInfo}>
          <Text style={styles.promotionTitle}>{item.title}</Text>
          <Text style={styles.promotionDate}>Created: {formattedDate}</Text>

          <View style={styles.promotionActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() =>
                navigation.navigate("Article", { articleId: item.articleId })
              }
            >
              <Ionicons name="eye-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() =>
                navigation.navigate("EditPromotion", { promotionId: item.id })
              }
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeletePromotion(item.id, item.articleId)}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Promotions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("EditPromotion", { isNew: true })}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : (
        <FlatList
          data={promotions}
          renderItem={renderPromotionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.promotionsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>No promotions available</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  promotionsList: {
    padding: 15,
  },
  promotionCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promotionImage: {
    width: "100%",
    height: 150,
  },
  promotionInfo: {
    padding: 15,
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  promotionDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  promotionActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 2,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 5,
  },
  viewButton: {
    backgroundColor: "#4CAF50",
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
});

export default ManagePromotionsScreen;
