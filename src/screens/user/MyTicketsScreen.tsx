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
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { colors, radii, shadow } from "../../theme";
import { demoTickets } from "../../data/demoData";
import AppHeadbar from "../../components/AppHeadbar";

const MyTicketsScreen = ({ navigation }: any) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    setTickets(demoTickets);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

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
    <View style={styles.container}>
      <AppHeadbar
        eyebrow="WALLET"
        title="My Tickets"
        subtitle={`${tickets.length} mock booking${tickets.length === 1 ? "" : "s"} ready`}
        rightIcon="qr-code-outline"
      />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBg,
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
    paddingBottom: 18,
  },
  ticketCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    marginBottom: 15,
    overflow: "hidden",
    ...shadow,
  },
  selectedTicketCard: {
    borderColor: colors.primary,
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
    backgroundColor: colors.primary,
    borderRadius: radii.md,
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
