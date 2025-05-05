"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { Ionicons } from "@expo/vector-icons";

interface Movie {
  id: string;
  title: string;
  genre: string;
  releaseDate: any; // Changed from string | Date to any to handle all possible types
  posterUrl: string;
}

const ManageMoviesScreen = ({ navigation }: any) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMovies = async () => {
    try {
      setLoading(true);

      const moviesSnapshot = await getDocs(collection(db, "movies"));
      const moviesData = moviesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Movie),
      }));

      // Sort movies by release date (newest first) with safer date handling
      moviesData.sort((a, b) => {
        // Safely convert to Date objects with fallbacks
        const getDateValue = (dateInput: any): number => {
          if (!dateInput) return 0;

          try {
            // Handle Firestore timestamp objects
            if (dateInput && typeof dateInput.toDate === "function") {
              return dateInput.toDate().getTime();
            }

            // Handle Date objects
            if (dateInput instanceof Date) {
              return dateInput.getTime();
            }

            // Handle string dates
            if (typeof dateInput === "string") {
              return new Date(dateInput).getTime();
            }

            // Handle numeric timestamps
            if (typeof dateInput === "number") {
              return dateInput;
            }

            return 0;
          } catch (error) {
            console.error("Date conversion error:", error);
            return 0;
          }
        };

        const dateAValue = getDateValue(a.releaseDate);
        const dateBValue = getDateValue(b.releaseDate);

        return dateBValue - dateAValue;
      });

      setMovies(moviesData);
      setFilteredMovies(moviesData);
    } catch (error) {
      console.error("Error fetching movies:", error);
      Alert.alert("Error", "Failed to load movies");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMovies();

    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener("focus", () => {
      fetchMovies();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMovies(filtered);
    }
  }, [searchQuery, movies]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMovies();
  };

  const handleDeleteMovie = (movieId: string) => {
    Alert.alert("Delete Movie", "Are you sure you want to delete this movie?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "movies", movieId));
            setMovies(movies.filter((movie) => movie.id !== movieId));
            setFilteredMovies(
              filteredMovies.filter((movie) => movie.id !== movieId)
            );
            Alert.alert("Success", "Movie deleted successfully");
          } catch (error) {
            console.error("Error deleting movie:", error);
            Alert.alert("Error", "Failed to delete movie");
          }
        },
      },
    ]);
  };

  const renderMovieItem = ({ item }: { item: Movie }) => {
    // Format release date with safer handling
    let formattedDate = "Unknown date";

    try {
      if (item.releaseDate) {
        // Handle Firestore timestamp
        if (typeof item.releaseDate.toDate === "function") {
          formattedDate = item.releaseDate
            .toDate()
            .toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
        }
        // Handle Date object
        else if (item.releaseDate instanceof Date) {
          formattedDate = item.releaseDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        }
        // Handle string date
        else if (typeof item.releaseDate === "string") {
          formattedDate = new Date(item.releaseDate).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          );
        }
      }
    } catch (error) {
      console.error("Date formatting error:", error);
      formattedDate = "Invalid date";
    }

    return (
      <View style={styles.movieCard}>
        <Image
          source={{ uri: item.posterUrl }}
          style={styles.moviePoster}
          resizeMode="cover"
        />

        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.movieGenre} numberOfLines={1}>
            {item.genre}
          </Text>
          <Text style={styles.movieDate}>Release: {formattedDate}</Text>

          <View style={styles.movieActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() =>
                navigation.navigate("EditMovie", { movieId: item.id })
              }
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.showtimesButton]}
              onPress={() =>
                navigation.navigate("ManageShowtimes", { movieId: item.id })
              }
            >
              <Ionicons name="time-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Showtimes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteMovie(item.id)}
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
        <Text style={styles.headerTitle}>Manage Movies</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("EditMovie", { isNew: true })}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : (
        <FlatList
          data={filteredMovies}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.moviesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="film-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? "No movies match your search"
                  : "No movies available"}
              </Text>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  moviesList: {
    padding: 15,
  },
  movieCard: {
    flexDirection: "row",
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
  moviePoster: {
    width: 100,
    height: 150,
  },
  movieInfo: {
    flex: 1,
    padding: 15,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  movieGenre: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  movieDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  movieActions: {
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
  editButton: {
    backgroundColor: "#2196F3",
  },
  showtimesButton: {
    backgroundColor: "#FF9800",
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

export default ManageMoviesScreen;
