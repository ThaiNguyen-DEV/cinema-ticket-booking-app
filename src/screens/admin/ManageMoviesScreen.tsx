import { useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeadbar from "../../components/AppHeadbar";
import { colors, radii, shadow } from "../../theme";
import { demoMovies } from "../../data/demoData";

const ManageMoviesScreen = ({ navigation }: any) => {
  const [movies, setMovies] = useState(demoMovies);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMovies = useMemo(
    () =>
      movies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [movies, searchQuery]
  );

  return (
    <View style={styles.container}>
      <AppHeadbar
        eyebrow="ADMIN"
        title="Movies"
        subtitle={`${movies.length} local mock records`}
        rightIcon="add-outline"
      />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.mutedDark} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search mock movies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredMovies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.posterUrl }} style={styles.poster} />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.meta}>{item.genre} • {item.duration} min</Text>
              <Text style={styles.meta}>Rating {item.rating}/10</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("ManageShowtimes", { movieId: item.id })}>
                  <Ionicons name="time-outline" size={15} color={colors.text} />
                  <Text style={styles.actionText}>Times</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => setMovies((current) => current.filter((movie) => movie.id !== item.id))}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lightBorder,
  },
  searchInput: { flex: 1, height: 46, fontSize: 15 },
  list: { padding: 16, paddingTop: 8, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: 14,
    ...shadow,
  },
  poster: { width: 96, height: 142 },
  info: { flex: 1, padding: 14 },
  title: { fontSize: 17, fontWeight: "900", color: colors.textDark },
  meta: { marginTop: 5, color: colors.mutedDark, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 8, marginTop: 14 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
  },
  deleteButton: { backgroundColor: colors.primary },
  actionText: { color: colors.text, fontWeight: "900", fontSize: 12 },
});

export default ManageMoviesScreen;
