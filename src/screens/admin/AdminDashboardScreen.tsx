import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";

const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    // onAuthStateChanged sẽ tự xử lý chuyển về login
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};


const AdminDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMovies: 0,
    activeMovies: 0,
    upcomingMovies: 0,
    totalBookings: 0,
    recentBookings: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get current date
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const todayTimestamp = Timestamp.fromDate(today);

        // Fetch movies stats
        const moviesSnapshot = await getDocs(collection(db, "movies"));
        const moviesData = moviesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const activeMovies = moviesData.filter((movie: any) => {
          const releaseDate =
            movie.releaseDate instanceof Timestamp
              ? movie.releaseDate.toDate()
              : new Date(movie.releaseDate);
          const endDate =
            movie.endDate instanceof Timestamp
              ? movie.endDate.toDate()
              : new Date(movie.endDate);

          return releaseDate <= now && endDate >= now;
        });

        const upcomingMovies = moviesData.filter((movie: any) => {
          const releaseDate =
            movie.releaseDate instanceof Timestamp
              ? movie.releaseDate.toDate()
              : new Date(movie.releaseDate);

          return releaseDate > now;
        });

        // Fetch bookings stats
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));
        const bookingsData = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const totalRevenue = bookingsData.reduce(
          (sum: number, booking: any) => {
            return sum + (booking.totalPrice || 0);
          },
          0
        );

        // Fetch recent bookings (last 24 hours)
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayTimestamp = Timestamp.fromDate(yesterday);

        const recentBookingsQuery = query(
          collection(db, "bookings"),
          where("createdAt", ">=", yesterdayTimestamp),
          orderBy("createdAt", "desc")
        );

        const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
        const recentBookingsData = recentBookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch latest 5 bookings with movie details
        const latestBookingsQuery = query(
          collection(db, "bookings"),
          orderBy("createdAt", "desc"),
          limit(5)
        );

        const latestBookingsSnapshot = await getDocs(latestBookingsQuery);
        const latestBookingsData = await Promise.all(
          latestBookingsSnapshot.docs.map(async (doc) => {
            const booking = {
              id: doc.id,
              ...(doc.data() as { movieId: string;[key: string]: any }),
            };

            // Fetch movie data
            const movieDoc = await getDocs(
              query(
                collection(db, "movies"),
                where("__name__", "==", booking.movieId)
              )
            );

            const movie =
              movieDoc.docs.length > 0
                ? { id: movieDoc.docs[0].id, ...movieDoc.docs[0].data() }
                : null;

            return {
              ...booking,
              movie,
            };
          })
        );

        setStats({
          totalMovies: moviesData.length,
          activeMovies: activeMovies.length,
          upcomingMovies: upcomingMovies.length,
          totalBookings: bookingsData.length,
          recentBookings: recentBookingsData.length,
          totalRevenue: totalRevenue,
        });

        setRecentBookings(latestBookingsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    //no flex1 in containner
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff' }}
      edges={['top']}
    >
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greeting}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View >
              <Text style={styles.greetingText}>
                Welcome, {user?.displayName || "Admin"}
              </Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
            <TouchableOpacity onPress={logout}>
              <Ionicons name="log-out-outline" size={24} color="#E50914" />
            </TouchableOpacity>
          </View>
        </View>


        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate("Movies")}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "rgba(229, 9, 20, 0.1)" },
                ]}
              >
                <Ionicons name="film-outline" size={24} color="#E50914" />
              </View>
              <Text style={styles.statValue}>{stats.totalMovies}</Text>
              <Text style={styles.statLabel}>Total Movies</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate("Movies")}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "rgba(76, 175, 80, 0.1)" },
                ]}
              >
                <Ionicons
                  name="play-circle-outline"
                  size={24}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.statValue}>{stats.activeMovies}</Text>
              <Text style={styles.statLabel}>Active Movies</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate("Bookings")}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "rgba(33, 150, 243, 0.1)" },
                ]}
              >
                <Ionicons name="calendar-outline" size={24} color="#2196F3" />
              </View>
              <Text style={styles.statValue}>{stats.totalBookings}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate("Bookings")}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "rgba(255, 152, 0, 0.1)" },
                ]}
              >
                <Ionicons name="cash-outline" size={24} color="#FF9800" />
              </View>
              <Text style={styles.statValue}>
                ${stats.totalRevenue.toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Bookings")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingItem}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingMovie}>
                    {booking.movie?.title || "Unknown Movie"}
                  </Text>
                  <Text style={styles.bookingDetails}>
                    Ref: {booking.reference} • ${booking.totalPrice.toFixed(2)}
                  </Text>
                  <Text style={styles.bookingDate}>
                    {booking.createdAt && booking.createdAt.seconds
                      ? new Date(
                        booking.createdAt.seconds * 1000
                      ).toLocaleString()
                      : "Unknown date"}
                  </Text>
                </View>
                <View
                  style={[styles.bookingStatus, { backgroundColor: "#4CAF50" }]}
                >
                  <Text style={styles.bookingStatusText}>Confirmed</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No recent bookings</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("EditMovie", { isNew: true })}
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Add Movie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#2196F3" }]}
              onPress={() =>
                navigation.navigate("EditPromotion", { isNew: true })
              }
            >
              <Ionicons name="megaphone-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Add Promotion</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FF9800" }]}
              onPress={() => navigation.navigate("ManageShowtimes")}
            >
              <Ionicons name="time-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Manage Showtimes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  greeting: {
    padding: 10,
    backgroundColor: "#fff",
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  statsContainer: {
    padding: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#E50914",
  },
  bookingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  bookingInfo: {
    flex: 1,
  },
  bookingMovie: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 3,
  },
  bookingDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  bookingDate: {
    fontSize: 12,
    color: "#999",
  },
  bookingStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  bookingStatusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },
  noDataText: {
    textAlign: "center",
    color: "#666",
    padding: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: "#E50914",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    width: "30%",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 5,
    textAlign: "center",
  },
});

export default AdminDashboardScreen;
