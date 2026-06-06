import { useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeadbar from "../../components/AppHeadbar";
import { colors, radii, shadow } from "../../theme";
import { demoPromotions } from "../../data/demoData";

const ManagePromotionsScreen = ({ navigation }: any) => {
  const [promotions, setPromotions] = useState(demoPromotions);

  return (
    <View style={styles.container}>
      <AppHeadbar
        eyebrow="ADMIN"
        title="Promotions"
        subtitle={`${promotions.length} local campaigns`}
        rightIcon="megaphone-outline"
      />
      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>Linked article: {item.articleId}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Article", { articleId: item.articleId })}>
                  <Ionicons name="eye-outline" size={15} color={colors.text} />
                  <Text style={styles.actionText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => setPromotions((current) => current.filter((promo) => promo.id !== item.id))}
                >
                  <Ionicons name="trash-outline" size={15} color={colors.text} />
                  <Text style={styles.actionText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg },
  list: { padding: 16, paddingBottom: 24 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: 16,
    ...shadow,
  },
  image: { width: "100%", height: 150 },
  info: { padding: 15 },
  title: { fontSize: 18, fontWeight: "900", color: colors.textDark },
  meta: { marginTop: 6, color: colors.mutedDark, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 8, marginTop: 14 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
  },
  deleteButton: { backgroundColor: colors.primary },
  actionText: { color: colors.text, fontWeight: "900", fontSize: 12 },
});

export default ManagePromotionsScreen;
