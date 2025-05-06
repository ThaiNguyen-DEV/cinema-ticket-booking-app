"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Share,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const MovieDetailScreen = ({ route, navigation }: any) => {
  const { movieId } = route.params;
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieDoc = await getDoc(doc(db, "movies", movieId));
        if (movieDoc.exists()) {
          setMovie({ id: movieDoc.id, ...movieDoc.data() });
        }
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  const handleShare = async () => {
    if (!movie) return;

    try {
      await Share.share({
        message: `Check out ${
          movie.title
        } at Cinema App! ${movie.synopsis.substring(0, 100)}...`,
        title: `${movie.title} - Cinema App`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Extract YouTube video ID from URL
  const getYoutubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#ccc" />
        <Text style={styles.errorText}>Movie not found</Text>
        <TouchableOpacity
          style={styles.backToHomeButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backToHomeText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const youtubeId = movie.trailerUrl ? getYoutubeId(movie.trailerUrl) : null;

  // Format release date
  const formatDate = (dateValue: any) => {
    try {
      let date;
      if (dateValue && typeof dateValue.toDate === "function") {
        date = dateValue.toDate();
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === "string") {
        date = new Date(dateValue);
      } else {
        return "Unknown date";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.posterContainer}>
          <Image
            source={{ uri: movie.posterUrl }}
            style={styles.poster}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.posterGradient}
          />
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{movie.title}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.rating}>{movie.rating}/10</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="film-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{movie.genre}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{movie.duration} min</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {formatDate(movie.releaseDate)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Synopsis</Text>
            <Text style={styles.synopsis}>{movie.synopsis}</Text>
          </View>

          {youtubeId && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trailer</Text>
              <View style={styles.trailerContainer}>
                <WebView
                  style={styles.trailer}
                  javaScriptEnabled={true}
                  source={{ uri: `https://www.youtube.com/embed/${youtubeId}` }}
                />
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <Text style={styles.castText}>{movie.cast}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Director</Text>
            <Text style={styles.directorText}>{movie.director}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate("Booking", { movieId: movie.id })}
        >
          <Text style={styles.bookButtonText}>Book Tickets</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
    marginBottom: 20,
  },
  backToHomeButton: {
    backgroundColor: "#E50914",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backToHomeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  posterContainer: {
    position: "relative",
    height: 450,
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  posterGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  backButtonContainer: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: 20,
    marginTop: -40,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  rating: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 5,
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginVertical: 5,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#E50914",
    paddingLeft: 10,
  },
  synopsis: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  trailerContainer: {
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  trailer: {
    flex: 1,
  },
  castText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  directorText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  footer: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  bookButton: {
    backgroundColor: "#E50914",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MovieDetailScreen;
