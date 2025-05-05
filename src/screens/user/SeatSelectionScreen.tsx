import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const SEAT_SIZE = 30;
const SEAT_MARGIN = 5;
const SEATS_PER_ROW = 8;

type Seat = {
  id: string;
  row: string;
  number: number;
  status: "available" | "booked" | "selected";
  type: "standard" | "premium" | "vip";
  price: number;
};

const SeatSelectionScreen = ({ route, navigation }: any) => {
  const { movieId, showtimeId } = route.params;
  const [movie, setMovie] = useState<any>(null);
  const [showtime, setShowtime] = useState<any>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch movie data
        const movieDoc = await getDoc(doc(db, "movies", movieId));
        if (movieDoc.exists()) {
          setMovie({ id: movieDoc.id, ...movieDoc.data() });
        }

        // Fetch showtime data
        const showtimeDoc = await getDoc(doc(db, "showtimes", showtimeId));
        if (showtimeDoc.exists()) {
          setShowtime({ id: showtimeDoc.id, ...showtimeDoc.data() });
        }

        // Fetch seats data
        const seatsQuery = query(
          collection(db, "seats"),
          where("showtimeId", "==", showtimeId)
        );

        const seatsSnapshot = await getDocs(seatsQuery);
        const seatsData = seatsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Seat[];

        setSeats(seatsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId, showtimeId]);

  useEffect(() => {
    // Calculate total price
    const price = selectedSeats.reduce((total, seat) => total + seat.price, 0);
    setTotalPrice(price);
  }, [selectedSeats]);

  const handleSeatPress = (seat: Seat) => {
    if (seat.status === "booked") return;

    const isSelected = selectedSeats.some((s) => s.id === seat.id);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      Alert.alert("Error", "Please select at least one seat");
      return;
    }

    navigation.navigate("Payment", {
      movieId,
      showtimeId,
      selectedSeats: selectedSeats.map((seat) => seat.id),
      totalPrice,
    });
  };

  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    let seatStyle;
    let seatTextStyle;

    if (seat.status === "booked") {
      seatStyle = styles.bookedSeat;
      seatTextStyle = styles.bookedSeatText;
    } else if (isSelected) {
      seatStyle = styles.selectedSeat;
      seatTextStyle = styles.selectedSeatText;
    } else {
      switch (seat.type) {
        case "premium":
          seatStyle = styles.premiumSeat;
          break;
        case "vip":
          seatStyle = styles.vipSeat;
          break;
        default:
          seatStyle = styles.standardSeat;
      }
      seatTextStyle = styles.availableSeatText;
    }

    return (
      <TouchableOpacity
        key={seat.id}
        style={[styles.seat, seatStyle]}
        onPress={() => handleSeatPress(seat)}
        disabled={seat.status === "booked"}
      >
        <Text style={[styles.seatText, seatTextStyle]}>{seat.number}</Text>
      </TouchableOpacity>
    );
  };

  const renderSeats = () => {
    if (seats.length === 0) return null;

    // Group seats by row
    const seatsByRow: { [key: string]: Seat[] } = {};
    seats.forEach((seat) => {
      if (!seatsByRow[seat.row]) {
        seatsByRow[seat.row] = [];
      }
      seatsByRow[seat.row].push(seat);
    });

    // Sort rows alphabetically
    const rows = Object.keys(seatsByRow).sort();

    return rows.map((row) => (
      <View key={row} style={styles.row}>
        <Text style={styles.rowLabel}>{row}</Text>
        <View style={styles.seatsRow}>
          {seatsByRow[row]
            .sort((a, b) => a.number - b.number)
            .map((seat) => renderSeat(seat))}
        </View>
      </View>
    ));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!movie || !showtime) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Data not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff' }}
      edges={['top']}
    >
      <View style={styles.header}>
        {/* <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Seats</Text>
        <View style={styles.placeholder} /> */}
      </View>

      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{movie.title}</Text>
        <Text style={styles.showtimeInfo}>
          {showtime.date} • {showtime.time} • Screen {showtime.screen}
        </Text>
      </View>

      <View style={styles.screenContainer}>
        <View style={styles.screen} />
        <Text style={styles.screenText}>SCREEN</Text>
      </View>

      <ScrollView style={styles.seatsContainer}>
        <View style={styles.seatsContent}>{renderSeats()}</View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.standardSeat]} />
          <Text style={styles.legendText}>Standard</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.premiumSeat]} />
          <Text style={styles.legendText}>Premium</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.vipSeat]} />
          <Text style={styles.legendText}>VIP</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.bookedSeat]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.selectedSeat]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {selectedSeats.length}{" "}
            {selectedSeats.length === 1 ? "Seat" : "Seats"} Selected
          </Text>
          <Text style={styles.priceText}>${totalPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedSeats.length === 0 && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={selectedSeats.length === 0}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 24,
  },
  movieInfo: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  showtimeInfo: {
    fontSize: 14,
    color: "#666",
  },
  screenContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  screen: {
    width: width * 0.8,
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
  },
  screenText: {
    fontSize: 12,
    color: "#666",
  },
  seatsContainer: {
    flex: 1,
  },
  seatsContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  rowLabel: {
    width: 20,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  seatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    justifyContent: "center",
    alignItems: "center",
    margin: SEAT_MARGIN,
    borderRadius: 5,
  },
  standardSeat: {
    backgroundColor: "#ddd",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  premiumSeat: {
    backgroundColor: "#B8D8EB",
    borderWidth: 1,
    borderColor: "#9ECAE1",
  },
  vipSeat: {
    backgroundColor: "#FFD700",
    borderWidth: 1,
    borderColor: "#E6C200",
  },
  bookedSeat: {
    backgroundColor: "#999",
    borderWidth: 1,
    borderColor: "#888",
  },
  selectedSeat: {
    backgroundColor: "#E50914",
    borderWidth: 1,
    borderColor: "#C50812",
  },
  seatText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  availableSeatText: {
    color: "#333",
  },
  bookedSeatText: {
    color: "#fff",
  },
  selectedSeatText: {
    color: "#fff",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  legendSeat: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 16,
    color: "#333",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  continueButton: {
    backgroundColor: "#E50914",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SeatSelectionScreen;
