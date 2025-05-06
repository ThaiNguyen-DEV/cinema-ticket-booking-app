"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  RefreshControl,
  StatusBar,
  ImageBackground,
} from "react-native";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import Carousel from "react-native-reanimated-carousel";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [currentMovies, setCurrentMovies] = useState<any[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Replace the fetchData function with this improved version that handles dates properly
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

      // Fetch all movies first
      const moviesSnapshot = await getDocs(collection(db, "movies"));
      const moviesData = moviesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get current date for comparison
      const now = new Date();

      // Helper function to safely convert any date format to a Date object
      const getDateObject = (dateValue: any): Date | null => {
        if (!dateValue) return null;

        try {
          // Handle Firestore timestamp
          if (dateValue && typeof dateValue.toDate === "function") {
            return dateValue.toDate();
          }
          // Handle Date object
          else if (dateValue instanceof Date) {
            return dateValue;
          }
          // Handle string date
          else if (typeof dateValue === "string") {
            return new Date(dateValue);
          }
          // Handle numeric timestamp
          else if (typeof dateValue === "number") {
            return new Date(dateValue);
          }
          return null;
        } catch (error) {
          console.error("Date conversion error:", error);
          return null;
        }
      };

      // Filter current movies (release date <= now <= end date)
      const currentMoviesData = moviesData.filter((movie: any) => {
        const releaseDate = getDateObject(movie.releaseDate);
        const endDate = getDateObject(movie.endDate);

        // If we can't determine the dates, don't include the movie
        if (!releaseDate || !endDate) return false;

        return releaseDate <= now && endDate >= now;
      });

      // Filter upcoming movies (release date > now)
      const upcomingMoviesData = moviesData.filter((movie: any) => {
        const releaseDate = getDateObject(movie.releaseDate);

        // If we can't determine the release date, don't include the movie
        if (!releaseDate) return false;

        return releaseDate > now;
      });

      setCurrentMovies(currentMoviesData);
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
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.carouselImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderMovieItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => navigation.navigate("MovieDetail", { movieId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.posterContainer}>
        <Image
          source={{ uri: item.posterUrl }}
          style={styles.moviePoster}
          resizeMode="cover"
        />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
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
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.displayName || "Guest"}
          </Text>
          <Text style={styles.subGreeting}>
            What would you like to watch today?
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.displayName
                ? user.displayName.charAt(0).toUpperCase()
                : "G"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {promotions.length > 0 && (
          <View style={styles.carouselContainer}>
            <Carousel
              width={width}
              height={200}
              data={promotions}
              renderItem={renderPromotionItem}
              loop
              autoPlay
              autoPlayInterval={5000}
              pagingEnabled
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 0.9,
                parallaxScrollingOffset: 50,
              }}
            />
          </View>
        )}

        <View style={styles.moviesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Now Showing</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {currentMovies.length > 0 ? (
            <FlatList
              data={currentMovies}
              renderItem={renderMovieItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moviesList}
            />
          ) : (
            <View style={styles.noMoviesContainer}>
              <Ionicons name="film-outline" size={50} color="#ccc" />
              <Text style={styles.noMoviesText}>
                No movies currently showing
              </Text>
            </View>
          )}
        </View>

        <View style={styles.moviesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Coming Soon</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

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
            <View style={styles.noMoviesContainer}>
              <Ionicons name="calendar-outline" size={50} color="#ccc" />
              <Text style={styles.noMoviesText}>No upcoming movies</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Cinema Ticket Booking App</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  subGreeting: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  profileButton: {
    padding: 5,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  carouselContainer: {
    marginVertical: 15,
  },
  carouselItem: {
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  carouselGradient: {
    height: "50%",
    justifyContent: "flex-end",
    padding: 15,
  },
  carouselTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#E50914",
    fontWeight: "600",
  },
  moviesContainer: {
    marginBottom: 25,
  },
  moviesList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  movieCard: {
    width: 160,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  posterContainer: {
    position: "relative",
  },
  moviePoster: {
    width: "100%",
    height: 220,
  },
  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  movieInfo: {
    padding: 12,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  movieGenre: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  bookButton: {
    backgroundColor: "#E50914",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  noMoviesContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  noMoviesText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#999",
    fontSize: 12,
  },
});

export default HomeScreen;
