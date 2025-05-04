import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  DocumentData,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { Ionicons } from "@expo/vector-icons";

// Define interfaces for our data types
interface User {
  id: string;
  displayName?: string;
  email?: string;
}

interface Movie {
  id: string;
  title?: string;
}

interface Showtime {
  id: string;
  date?: string;
  time?: string;
  screen?: string;
}

interface Booking {
  id: string;
  movieId: string;
  showtimeId: string;
  userId: string;
  reference: string;
  status: string;
  totalPrice: number;
  seats?: any[];
  paymentMethod?: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  movie?: Movie;
  showtime?: Showtime;
  user?: User;
}

const ManageBookingsScreen = ({ navigation }: any) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const bookingsQuery = query(
        collection(db, "bookings"),
        orderBy("createdAt", "desc")
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsData = await Promise.all(
        bookingsSnapshot.docs.map(async (docSnapshot) => {
          // Use type assertion to tell TypeScript what properties to expect
          const bookingData = docSnapshot.data() as DocumentData;

          // Create booking object with required properties
          const booking: Booking = {
            id: docSnapshot.id,
            movieId: bookingData.movieId || "",
            showtimeId: bookingData.showtimeId || "",
            userId: bookingData.userId || "",
            reference: bookingData.reference || "",
            status: bookingData.status || "unknown",
            totalPrice: bookingData.totalPrice || 0,
            seats: bookingData.seats || [],
            paymentMethod: bookingData.paymentMethod,
            createdAt: bookingData.createdAt,
          };

          // Only fetch related data if IDs exist
          if (booking.movieId) {
            try {
              const movieDoc = await getDoc(doc(db, "movies", booking.movieId));
              if (movieDoc.exists()) {
                booking.movie = {
                  ...(movieDoc.data() as Movie),
                  id: movieDoc.id,
                };
              }
            } catch (error) {
              console.error("Error fetching movie:", error);
            }
          }

          if (booking.showtimeId) {
            try {
              const showtimeDoc = await getDoc(
                doc(db, "showtimes", booking.showtimeId)
              );
              if (showtimeDoc.exists()) {
                booking.showtime = {
                  ...(showtimeDoc.data() as Showtime),
                  id: showtimeDoc.id,
                };
              }
            } catch (error) {
              console.error("Error fetching showtime:", error);
            }
          }

          if (booking.userId) {
            try {
              const userDoc = await getDoc(doc(db, "users", booking.userId));
              if (userDoc.exists()) {
                booking.user = {
                  ...(userDoc.data() as User),
                  id: userDoc.id,
                };
              }
            } catch (error) {
              console.error("Error fetching user:", error);
            }
          }

          return booking;
        })
      );

      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(
        (booking) =>
          booking.reference
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.user?.email
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.movie?.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredBookings(filtered);
    }
  }, [searchQuery, bookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const toggleBookingDetails = (bookingId: string) => {
    if (selectedBooking === bookingId) {
      setSelectedBooking(null);
    } else {
      setSelectedBooking(bookingId);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await updateDoc(doc(db, "bookings", bookingId), {
                status: "cancelled",
              });

              // Update bookings list
              const updatedBookings = bookings.map((booking) => {
                if (booking.id === bookingId) {
                  return { ...booking, status: "cancelled" };
                }
                return booking;
              });

              setBookings(updatedBookings);
              setFilteredBookings(
                filteredBookings.map((booking) => {
                  if (booking.id === bookingId) {
                    return { ...booking, status: "cancelled" };
                  }
                  return booking;
                })
              );

              Alert.alert("Success", "Booking cancelled successfully");
            } catch (error) {
              console.error("Error cancelling booking:", error);
              Alert.alert("Error", "Failed to cancel booking");
            }
          },
        },
      ]
    );
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const isSelected = selectedBooking === item.id;

    // Format date from Firestore timestamp
    const bookingDate =
      item.createdAt && item.createdAt.seconds
        ? new Date(item.createdAt.seconds * 1000)
        : new Date();

    const formattedDate = bookingDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        style={[styles.bookingCard, isSelected && styles.selectedBookingCard]}
        onPress={() => toggleBookingDetails(item.id)}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingReference}>Ref: {item.reference}</Text>
            <Text style={styles.movieTitle}>
              {item.movie?.title || "Unknown Movie"}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              item.status === "confirmed"
                ? styles.confirmedBadge
                : styles.cancelledBadge,
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.bookingSubInfo}>
          <Text style={styles.bookingDate}>{formattedDate}</Text>
          <Text style={styles.bookingPrice}>${item.totalPrice.toFixed(2)}</Text>
        </View>

        {isSelected && (
          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer:</Text>
              <Text style={styles.detailValue}>
                {item.user?.displayName || "Unknown"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>
                {item.user?.email || "Unknown"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Showtime:</Text>
              <Text style={styles.detailValue}>
                {item.showtime?.date || "Unknown"} •{" "}
                {item.showtime?.time || "Unknown"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Screen:</Text>
              <Text style={styles.detailValue}>
                {item.showtime?.screen || "Unknown"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Seats:</Text>
              <Text style={styles.detailValue}>
                {item.seats?.length || 0} seats
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment:</Text>
              <Text style={styles.detailValue}>
                {item.paymentMethod || "Unknown"}
              </Text>
            </View>

            {item.status === "confirmed" && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelBooking(item.id)}
              >
                <Ionicons name="close-circle-outline" size={16} color="#fff" />
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Bookings</Text>
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
          placeholder="Search by reference, email or movie..."
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
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.bookingsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? "No bookings match your search"
                  : "No bookings available"}
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
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
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
  bookingsList: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedBookingCard: {
    borderColor: "#E50914",
    borderWidth: 1,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingReference: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  confirmedBadge: {
    backgroundColor: "#4CAF50",
  },
  cancelledBadge: {
    backgroundColor: "#F44336",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  bookingSubInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  bookingDate: {
    fontSize: 14,
    color: "#666",
  },
  bookingPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  bookingDetails: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
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

export default ManageBookingsScreen;
