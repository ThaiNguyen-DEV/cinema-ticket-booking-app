import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

const ManageShowtimesScreen = ({ route, navigation }: any) => {
  const { movieId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [screen, setScreen] = useState("");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (movieId && movies.length > 0) {
      const movie = movies.find((m) => m.id === movieId);
      if (movie) {
        setSelectedMovie(movie);
      }
    }
  }, [movieId, movies]);

  useEffect(() => {
    if (selectedMovie) {
      fetchShowtimes();
    }
  }, [selectedMovie]);

  const fetchMovies = async () => {
    try {
      setLoading(true);

      const moviesSnapshot = await getDocs(collection(db, "movies"));
      const moviesData = moviesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMovies(moviesData);

      if (!movieId && moviesData.length > 0) {
        setSelectedMovie(moviesData[0]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      Alert.alert("Error", "Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimes = async () => {
    if (!selectedMovie) return;

    try {
      setLoading(true);

      const showtimesQuery = query(
        collection(db, "showtimes"),
        where("movieId", "==", selectedMovie.id)
      );

      const showtimesSnapshot = await getDocs(showtimesQuery);
      const showtimesData = showtimesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as {
          date: string;
          time: string;
          screen: string;
          price: number;
          totalSeats: number;
          availableSeats: number;
        }),
      }));

      // Sort showtimes by date and time
      showtimesData.sort((a, b) => {
        const dateA = a.date + " " + a.time;
        const dateB = b.date + " " + b.time;
        return dateA.localeCompare(dateB);
      });

      setShowtimes(showtimesData);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      Alert.alert("Error", "Failed to load showtimes");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (selectedTime) {
      setSelectedTime(selectedTime);
    }
  };

  const validateForm = () => {
    if (!selectedMovie) {
      Alert.alert("Error", "Please select a movie");
      return false;
    }

    if (!screen.trim()) {
      Alert.alert("Error", "Screen number is required");
      return false;
    }

    if (!price.trim()) {
      Alert.alert("Error", "Price is required");
      return false;
    }

    if (!seats.trim()) {
      Alert.alert("Error", "Total seats is required");
      return false;
    }

    return true;
  };

  const handleAddShowtime = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const formattedTime = format(selectedTime, "HH:mm");

      const showtimeData = {
        movieId: selectedMovie.id,
        date: formattedDate,
        time: formattedTime,
        screen,
        price: parseFloat(price),
        totalSeats: parseInt(seats, 10),
        availableSeats: parseInt(seats, 10),
      };

      await addDoc(collection(db, "showtimes"), showtimeData);

      // Create seats for this showtime
      const showtimesQuery = query(
        collection(db, "showtimes"),
        where("movieId", "==", selectedMovie.id),
        where("date", "==", formattedDate),
        where("time", "==", formattedTime)
      );

      const showtimesSnapshot = await getDocs(showtimesQuery);
      if (!showtimesSnapshot.empty) {
        const showtimeId = showtimesSnapshot.docs[0].id;

        // Create seats (simplified version - in a real app, you'd have a more complex seat map)
        const totalSeats = parseInt(seats, 10);
        const rows = Math.ceil(totalSeats / 8); // 8 seats per row

        for (let r = 0; r < rows; r++) {
          const rowLetter = String.fromCharCode(65 + r); // A, B, C, ...
          const seatsInRow = r === rows - 1 ? totalSeats % 8 || 8 : 8;

          for (let n = 1; n <= seatsInRow; n++) {
            await addDoc(collection(db, "seats"), {
              showtimeId,
              row: rowLetter,
              number: n,
              status: "available",
              type: r < 2 ? "standard" : r < 4 ? "premium" : "vip",
              price: parseFloat(price) * (r < 2 ? 1 : r < 4 ? 1.2 : 1.5),
            });
          }
        }
      }

      Alert.alert("Success", "Showtime added successfully");
      setModalVisible(false);
      fetchShowtimes();

      // Reset form
      setScreen("");
      setPrice("");
      setSeats("");
    } catch (error) {
      console.error("Error adding showtime:", error);
      Alert.alert("Error", "Failed to add showtime");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShowtime = (showtimeId: string) => {
    Alert.alert(
      "Delete Showtime",
      "Are you sure you want to delete this showtime?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete showtime
              await deleteDoc(doc(db, "showtimes", showtimeId));

              // Delete associated seats
              const seatsQuery = query(
                collection(db, "seats"),
                where("showtimeId", "==", showtimeId)
              );

              const seatsSnapshot = await getDocs(seatsQuery);
              const deletePromises = seatsSnapshot.docs.map((doc) =>
                deleteDoc(doc.ref)
              );

              await Promise.all(deletePromises);

              setShowtimes(showtimes.filter((st) => st.id !== showtimeId));
              Alert.alert("Success", "Showtime deleted successfully");
            } catch (error) {
              console.error("Error deleting showtime:", error);
              Alert.alert("Error", "Failed to delete showtime");
            }
          },
        },
      ]
    );
  };

  const renderShowtimeItem = ({ item }: any) => (
    <View style={styles.showtimeCard}>
      <View style={styles.showtimeInfo}>
        <Text style={styles.showtimeDate}>{item.date}</Text>
        <Text style={styles.showtimeTime}>{item.time}</Text>
        <Text style={styles.showtimeScreen}>Screen {item.screen}</Text>
        <Text style={styles.showtimeSeats}>
          {item.availableSeats} / {item.totalSeats} seats available
        </Text>
        <Text style={styles.showtimePrice}>${item.price.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteShowtime(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Showtimes</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.movieSelector}>
            <Text style={styles.sectionTitle}>Select Movie</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moviesList}
            >
              {movies.map((movie) => (
                <TouchableOpacity
                  key={movie.id}
                  style={[
                    styles.movieItem,
                    selectedMovie?.id === movie.id && styles.selectedMovieItem,
                  ]}
                  onPress={() => setSelectedMovie(movie)}
                >
                  <Image
                    source={{ uri: movie.posterUrl }}
                    style={styles.moviePoster}
                    resizeMode="cover"
                  />
                  <Text
                    style={[
                      styles.movieTitle,
                      selectedMovie?.id === movie.id &&
                        styles.selectedMovieTitle,
                    ]}
                    numberOfLines={1}
                  >
                    {movie.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.showtimesContainer}>
            <View style={styles.showtimesHeader}>
              <Text style={styles.sectionTitle}>Showtimes</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {showtimes.length > 0 ? (
              <FlatList
                data={showtimes}
                renderItem={renderShowtimeItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.showtimesList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>No showtimes available</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Showtime</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Movie</Text>
                <Text style={styles.selectedMovieText}>
                  {selectedMovie?.title}
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{format(selectedDate, "MMMM d, yyyy")}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Time</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text>{format(selectedTime, "h:mm a")}</Text>
                  <Ionicons name="time-outline" size={20} color="#666" />
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Screen</Text>
                <TextInput
                  style={styles.input}
                  value={screen}
                  onChangeText={setScreen}
                  placeholder="Enter screen number"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Price ($)</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="Enter ticket price"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Total Seats</Text>
                <TextInput
                  style={styles.input}
                  value={seats}
                  onChangeText={setSeats}
                  placeholder="Enter total number of seats"
                  keyboardType="number-pad"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={handleAddShowtime}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Add Showtime</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  movieSelector: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  moviesList: {
    paddingVertical: 5,
  },
  movieItem: {
    width: 100,
    marginRight: 15,
    alignItems: "center",
  },
  selectedMovieItem: {
    opacity: 1,
  },
  moviePoster: {
    width: 100,
    height: 150,
    borderRadius: 5,
    marginBottom: 5,
  },
  movieTitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#333",
  },
  selectedMovieTitle: {
    fontWeight: "bold",
    color: "#E50914",
  },
  showtimesContainer: {
    flex: 1,
    padding: 15,
  },
  showtimesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
  },
  showtimesList: {
    paddingBottom: 20,
  },
  showtimeCard: {
    flexDirection: "row",
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
  showtimeInfo: {
    flex: 1,
  },
  showtimeDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  showtimeTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  showtimeScreen: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  showtimeSeats: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  showtimePrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
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
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 15,
    maxHeight: 400,
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  selectedMovieText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#E50914",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ManageShowtimesScreen;
