import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

const MyTicketsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const fetchTickets = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Query bookings for the current user
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid)
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsData = bookingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch additional data for each booking
      const ticketsData = await Promise.all(
        bookingsData.map(async (booking) => {
          // Fetch movie data
          const movieDoc = await getDoc(doc(db, "movies", booking.movieId));
          const movie = movieDoc.exists()
            ? { id: movieDoc.id, ...movieDoc.data() }
            : null;

          // Fetch showtime data
          const showtimeDoc = await getDoc(
            doc(db, "showtimes", booking.showtimeId)
          );
          const showtime = showtimeDoc.exists()
            ? { id: showtimeDoc.id, ...showtimeDoc.data() }
            : null;

          // Fetch seats data
          const seatsData = [];
          for (const seatId of booking.seats) {
            const seatDoc = await getDoc(doc(db, "seats", seatId));
            if (seatDoc.exists()) {
              seatsData.push({ id: seatDoc.id, ...seatDoc.data() });
            }
          }

          return {
            ...booking,
            movie,
            showtime,
            seats: seatsData,
          };
        })
      );

      // Sort tickets by date (newest first)
      ticketsData.sort((a, b) => {
        return (
          new Date(b.createdAt.seconds * 1000).getTime() -
          new Date(a.createdAt.seconds * 1000).getTime()
        );
      });

      setTickets(ticketsData);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const toggleTicketDetails = (ticketId: string) => {
    if (selectedTicket === ticketId) {
      setSelectedTicket(null);
    } else {
      setSelectedTicket(ticketId);
    }
  };

  const renderTicketItem = ({ item }: any) => {
    const isSelected = selectedTicket === item.id;

    // Format date from Firestore timestamp
    const bookingDate =
      item.createdAt && item.createdAt.seconds
        ? new Date(item.createdAt.seconds * 1000)
        : new Date();

    const formattedDate = bookingDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return (
      <TouchableOpacity
        style={[styles.ticketCard, isSelected && styles.selectedTicketCard]}
        onPress={() => toggleTicketDetails(item.id)}
      >
        <View style={styles.ticketHeader}>
          <View style={styles.ticketInfo}>
            <Text style={styles.movieTitle}>
              {item.movie?.title || "Unknown Movie"}
            </Text>
            <Text style={styles.ticketDate}>
              {item.showtime?.date || "Unknown Date"} •{" "}
              {item.showtime?.time || "Unknown Time"}
            </Text>
          </View>
          <Ionicons
            name={isSelected ? "chevron-up" : "chevron-down"}
            size={24}
            color="#666"
          />
        </View>

        {isSelected && (
          <View style={styles.ticketDetails}>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Booking Reference</Text>
              <Text style={styles.ticketValue}>{item.reference}</Text>
            </View>

            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Screen</Text>
              <Text style={styles.ticketValue}>
                {item.showtime?.screen || "Unknown"}
              </Text>
            </View>

            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Seats</Text>
              <Text style={styles.ticketValue}>
                {item.seats
                  .map((seat: any) => `${seat.row}${seat.number}`)
                  .join(", ")}
              </Text>
            </View>

            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Amount Paid</Text>
              <Text style={styles.ticketValue}>
                ${item.totalPrice.toFixed(2)}
              </Text>
            </View>

            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Booking Date</Text>
              <Text style={styles.ticketValue}>{formattedDate}</Text>
            </View>

            <View style={styles.qrContainer}>
              <QRCode
                value={`TICKET:${item.id}:${item.reference}`}
                size={150}
                color="#333"
                backgroundColor="#fff"
              />
              <Text style={styles.scanText}>Scan at the cinema</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tickets</Text>
      </View>

      {tickets.length > 0 ? (
        <FlatList
          data={tickets}
          renderItem={renderTicketItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ticketsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="ticket-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No tickets found</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.browseButtonText}>Browse Movies</Text>
          </TouchableOpacity>
        </View>
      )}
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
  ticketsList: {
    padding: 15,
  },
  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedTicketCard: {
    borderColor: "#E50914",
    borderWidth: 1,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  ticketInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  ticketDate: {
    fontSize: 14,
    color: "#666",
  },
  ticketDetails: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  ticketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  ticketLabel: {
    fontSize: 14,
    color: "#666",
  },
  ticketValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "right",
  },
  qrContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  scanText: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: "#E50914",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    width: "80%",
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MyTicketsScreen;
