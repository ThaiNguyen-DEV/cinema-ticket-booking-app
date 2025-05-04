import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import Carousel from "react-native-reanimated-carousel"; // Replace import

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [currentMovies, setCurrentMovies] = useState<any[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch promotions
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

      // Fetch current movies
      const now = new Date();
      const currentMoviesQuery = query(
        collection(db, "movies"),
        where("releaseDate", "<=", now),
        where("endDate", ">=", now),
        orderBy("releaseDate", "desc")
      );
      const currentMoviesSnapshot = await getDocs(currentMoviesQuery);
      const currentMoviesData = currentMoviesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCurrentMovies(currentMoviesData);

      // Fetch upcoming movies
      const upcomingMoviesQuery = query(
        collection(db, "movies"),
        where("releaseDate", ">", now),
        orderBy("releaseDate", "asc")
      );
      const upcomingMoviesSnapshot = await getDocs(upcomingMoviesQuery);
      const upcomingMoviesData = upcomingMoviesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUpcomingMovies(upcomingMoviesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderPromotionItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.carouselItem}
      onPress={() =>
        navigation.navigate("Article", { articleId: item.articleId })
      }
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.carouselImage}
        resizeMode="cover"
      />
      <View style={styles.carouselOverlay}>
        <Text style={styles.carouselTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMovieItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => navigation.navigate("MovieDetail", { movieId: item.id })}
    >
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
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate("Booking", { movieId: item.id })}
        >
          <Text style={styles.bookButtonText}>Book Ticket</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {user?.displayName || "Guest"}
          </Text>
          <Text style={styles.subGreeting}>
            What would you like to watch today?
          </Text>
        </View>

        {promotions.length > 0 && (
          <View style={styles.carouselContainer}>
            <Text style={styles.sectionTitle}>Promotions</Text>
            <Carousel
              width={width - 40}
              height={180}
              data={promotions}
              renderItem={renderPromotionItem}
              loop
              autoPlay
              autoPlayInterval={5000}
            />
          </View>
        )}

        <View style={styles.moviesContainer}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>
          {upcomingMovies.length > 0 ? (
            <FlatList
              data={upcomingMovies}
              renderItem={renderMovieItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moviesList}
            />
          ) : (
            <Text style={styles.noMoviesText}>No upcoming movies</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subGreeting: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  carouselContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 10,
    color: "#333",
  },
  carouselItem: {
    width: width - 40,
    height: 180,
    borderRadius: 10,
    overflow: "hidden",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  carouselOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
  },
  carouselTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  moviesContainer: {
    marginBottom: 20,
  },
  moviesList: {
    paddingHorizontal: 10,
  },
  movieCard: {
    width: 160,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moviePoster: {
    width: "100%",
    height: 200,
  },
  movieInfo: {
    padding: 10,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  movieGenre: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  bookButton: {
    backgroundColor: "#E50914",
    borderRadius: 5,
    padding: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  noMoviesText: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
    marginHorizontal: 20,
  },
});

export default HomeScreen;
