"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { format } from "date-fns";

const BookingScreen = ({ route, navigation }: any) => {
  const { movieId } = route.params;
  const [movie, setMovie] = useState<any>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieDoc = await getDoc(doc(db, "movies", movieId));
        if (movieDoc.exists()) {
          setMovie({ id: movieDoc.id, ...movieDoc.data() });
        }
      } catch (error) {
        console.error("Error fetching movie:", error);
      }
    };

    const generateDates = () => {
      const today = new Date();
      const nextDates: Date[] = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        nextDates.push(date);
      }

      setDates(nextDates);
      setSelectedDate(nextDates[0]);
    };

    fetchMovie();
    generateDates();
  }, [movieId]);

  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!selectedDate) return;

      try {
        setLoading(true);

        // Format date to match Firestore date format (YYYY-MM-DD)
        const formattedDate = format(selectedDate, "yyyy-MM-dd");

        const showtimesQuery = query(
          collection(db, "showtimes"),
          where("movieId", "==", movieId),
          where("date", "==", formattedDate)
        );

        const showtimesSnapshot = await getDocs(showtimesQuery);
        const showtimesData = showtimesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setShowtimes(showtimesData);
      } catch (error) {
        console.error("Error fetching showtimes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [movieId, selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedShowtime(null);
  };

  const handleShowtimeSelect = (showtimeId: string) => {
    setSelectedShowtime(showtimeId);
  };

  const handleContinue = () => {
    if (!selectedShowtime) {
      Alert.alert("Error", "Please select a showtime");
      return;
    }

    navigation.navigate("SeatSelection", {
      movieId,
      showtimeId: selectedShowtime,
    });
  };

  const renderDateItem = ({ item }: { item: Date }) => {
    const isSelected =
      selectedDate &&
      selectedDate.getDate() === item.getDate() &&
      selectedDate.getMonth() === item.getMonth() &&
      selectedDate.getFullYear() === item.getFullYear();

    return (
      <TouchableOpacity
        style={[styles.dateItem, isSelected && styles.selectedDateItem]}
        onPress={() => handleDateSelect(item)}
      >
        <Text style={[styles.dateDay, isSelected && styles.selectedDateText]}>
          {format(item, "EEE")}
        </Text>
        <Text
          style={[styles.dateNumber, isSelected && styles.selectedDateText]}
        >
          {format(item, "d")}
        </Text>
        <Text style={[styles.dateMonth, isSelected && styles.selectedDateText]}>
          {format(item, "MMM")}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderShowtimeItem = ({ item }: any) => {
    const isSelected = selectedShowtime === item.id;

    return (
      <TouchableOpacity
        style={[styles.showtimeItem, isSelected && styles.selectedShowtimeItem]}
        onPress={() => handleShowtimeSelect(item.id)}
      >
        <Text
          style={[
            styles.showtimeText,
            isSelected && styles.selectedShowtimeText,
          ]}
        >
          {item.time}
        </Text>
        <Text
          style={[styles.screenText, isSelected && styles.selectedShowtimeText]}
        >
          Screen {item.screen}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!movie) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        {/* <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Showtime</Text>
        <View style={styles.placeholder} /> */}
      </View>

      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{movie.title}</Text>
        <Text style={styles.movieDetails}>
          {movie.genre} • {movie.duration} min
        </Text>
      </View>

      <View style={styles.dateContainer}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <FlatList
          data={dates}
          renderItem={renderDateItem}
          keyExtractor={(item) => item.toISOString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
        />
      </View>

      <View style={styles.showtimesContainer}>
        <Text style={styles.sectionTitle}>Select Showtime</Text>

        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            size="small"
            color="#E50914"
          />
        ) : showtimes.length > 0 ? (
          <FlatList
            data={showtimes}
            renderItem={renderShowtimeItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.showtimesList}
          />
        ) : (
          <Text style={styles.noShowtimesText}>
            No showtimes available for this date
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedShowtime && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedShowtime}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  movieDetails: {
    fontSize: 14,
    color: "#666",
  },
  dateContainer: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  dateList: {
    paddingVertical: 5,
  },
  dateItem: {
    width: 70,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedDateItem: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  dateDay: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  dateMonth: {
    fontSize: 14,
    color: "#666",
  },
  selectedDateText: {
    color: "#fff",
  },
  showtimesContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loader: {
    marginTop: 20,
  },
  showtimesList: {
    paddingVertical: 5,
  },
  showtimeItem: {
    flex: 1,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedShowtimeItem: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  showtimeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  screenText: {
    fontSize: 12,
    color: "#666",
  },
  selectedShowtimeText: {
    color: "#fff",
  },
  noShowtimesText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
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

export default BookingScreen;
