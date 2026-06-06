import { useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeadbar from "../../components/AppHeadbar";
import { colors, radii, shadow } from "../../theme";
import { demoMovies, getDemoShowtimes } from "../../data/demoData";

const ManageShowtimesScreen = ({ route }: any) => {
  const initialMovieId = route.params?.movieId ?? demoMovies[0].id;
  const [selectedMovieId, setSelectedMovieId] = useState(initialMovieId);
  const [hiddenShowtimes, setHiddenShowtimes] = useState<string[]>([]);

  const selectedMovie = demoMovies.find((movie) => movie.id === selectedMovieId) ?? demoMovies[0];
  const showtimes = useMemo(
    () =>
      getDemoShowtimes(selectedMovie.id, new Date()).filter(
        (showtime) => !hiddenShowtimes.includes(showtime.id)
      ),
    [selectedMovie.id, hiddenShowtimes]
  );

  return (
    <View style={styles.container}>
      <AppHeadbar
        eyebrow="ADMIN"
        title="Showtimes"
        subtitle="Generated local schedule"
        rightIcon="time-outline"
      />
      <View style={styles.movieRail}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={demoMovies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.movieRailContent}
          renderItem={({ item }) => {
            const active = item.id === selectedMovieId;
            return (
              <TouchableOpacity
                style={[styles.moviePill, active && styles.moviePillActive]}
                onPress={() => setSelectedMovieId(item.id)}
              >
                <Image source={{ uri: item.posterUrl }} style={styles.poster} />
                <Text style={[styles.movieTitle, active && styles.movieTitleActive]} numberOfLines={1}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      <FlatList
        data={showtimes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.time}>{item.time}</Text>
              <Text style={styles.meta}>{item.date} • Screen {item.screen}</Text>
              <Text style={styles.meta}>64 seats • Mock price from $14</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setHiddenShowtimes((current) => [...current, item.id])}
            >
              <Ionicons name="trash-outline" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg },
  movieRail: { backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.lightBorder },
  movieRailContent: { padding: 14, gap: 10 },
  moviePill: {
    width: 116,
    padding: 8,
    borderRadius: radii.lg,
    backgroundColor: colors.lightBg,
    borderWidth: 1,
    borderColor: colors.lightBorder,
  },
  moviePillActive: { backgroundColor: colors.background, borderColor: colors.background },
  poster: { width: "100%", height: 120, borderRadius: radii.md, marginBottom: 8 },
  movieTitle: { color: colors.textDark, fontWeight: "900", fontSize: 12 },
  movieTitleActive: { color: colors.text },
  list: { padding: 16, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 12,
    ...shadow,
  },
  time: { color: colors.textDark, fontSize: 22, fontWeight: "900", marginBottom: 5 },
  meta: { color: colors.mutedDark, fontWeight: "600", marginTop: 3 },
  deleteButton: { width: 42, height: 42, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
});

export default ManageShowtimesScreen;
