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
import { useAuth } from "../../context/AuthContext";
import Carousel from "react-native-reanimated-carousel";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, shadow } from "../../theme";
import { demoMovies, demoPromotions } from "../../data/demoData";
import AppHeadbar from "../../components/AppHeadbar";

const { width } = Dimensions.get("window");

const aiShortcuts = [
  { id: "pick", icon: "sparkles-outline", title: "AI Pick", text: "Find a movie for your mood" },
  { id: "seat", icon: "albums-outline", title: "Seat AI", text: "Best angle and comfort" },
  { id: "combo", icon: "fast-food-outline", title: "Snack AI", text: "Mock combo builder" },
];

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [currentMovies, setCurrentMovies] = useState<any[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMockData = () => {
    setPromotions(demoPromotions);
    setCurrentMovies(demoMovies.filter((movie) => new Date(movie.releaseDate) <= new Date()));
    setUpcomingMovies(demoMovies.filter((movie) => new Date(movie.releaseDate) > new Date()));
    setRefreshing(false);
  };

  useEffect(() => {
    loadMockData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMockData();
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
      >
        <LinearGradient
          colors={["transparent", "rgba(15,17,23,0.9)"]}
          style={styles.carouselGradient}
        >
          <Text style={styles.carouselTitle}>{item.title}</Text>
        </LinearGradient>
      </ImageBackground>
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
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <AppHeadbar
        title={`Hello, ${user?.displayName || "Guest"}`}
        subtitle="Pick a movie, ask the fake AI, or book a seat"
        rightIcon="person-outline"
        onRightPress={() => navigation.navigate("Profile")}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.offlineBanner}>
          <Ionicons name="sparkles-outline" size={18} color={colors.accent} />
          <Text style={styles.offlineText}>Mock cinema data is active while Firebase is being replaced</Text>
        </View>

        <View style={styles.aiRail}>
          {aiShortcuts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.aiCard}
              onPress={() => navigation.navigate("AI")}
            >
              <Ionicons name={item.icon as any} size={22} color={colors.accent} />
              <Text style={styles.aiTitle}>{item.title}</Text>
              <Text style={styles.aiText}>{item.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.lightBg,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingTop: 18,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  eyebrow: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: "800",
    marginBottom: 5,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
  },
  subGreeting: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
  profileButton: {
    padding: 5,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  carouselContainer: {
    marginBottom: 26,
  },
  carouselItem: {
    borderRadius: radii.lg,
    overflow: "hidden",
    marginHorizontal: 8,
    ...shadow,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  carouselGradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 18,
  },
  carouselTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
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
    fontWeight: "900",
    color: colors.textDark,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
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
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    overflow: "hidden",
    ...shadow,
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
    backgroundColor: "rgba(15,17,23,0.78)",
    borderRadius: 8,
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
    color: colors.textDark,
    marginBottom: 4,
  },
  movieGenre: {
    fontSize: 13,
    color: colors.mutedDark,
    marginBottom: 10,
  },
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
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
    color: colors.mutedDark,
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
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
  },
  offlineText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  aiRail: {
    flexDirection: "row",
    paddingHorizontal: 14,
    marginBottom: 20,
    gap: 10,
  },
  aiCard: {
    flex: 1,
    minHeight: 112,
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: 12,
    justifyContent: "space-between",
  },
  aiTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  aiText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },
});

export default HomeScreen;
