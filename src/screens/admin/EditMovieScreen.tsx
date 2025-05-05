"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../config/firebase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

const EditMovieScreen = ({ route, navigation }: any) => {
  const { movieId, isNew = false } = route.params || {};

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [movie, setMovie] = useState({
    title: "",
    genre: "",
    duration: "",
    synopsis: "",
    director: "",
    cast: "",
    rating: "",
    trailerUrl: "",
    posterUrl: "",
    releaseDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default to 1 month after release
  });

  const [posterImage, setPosterImage] = useState<any>(null);
  const [showReleaseDatePicker, setShowReleaseDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchMovie();
    }
  }, [movieId, isNew]);

  const fetchMovie = async () => {
    try {
      setLoading(true);

      const movieDoc = await getDoc(doc(db, "movies", movieId));
      if (movieDoc.exists()) {
        const movieData = movieDoc.data();

        // Convert Firestore timestamps to Date objects
        const releaseDate = movieData.releaseDate
          ? movieData.releaseDate instanceof Timestamp
            ? movieData.releaseDate.toDate()
            : new Date(movieData.releaseDate)
          : new Date();

        const endDate = movieData.endDate
          ? movieData.endDate instanceof Timestamp
            ? movieData.endDate.toDate()
            : new Date(movieData.endDate)
          : new Date(new Date().setMonth(new Date().getMonth() + 1));

        setMovie({
          ...movie,
          ...movieData,
          releaseDate,
          endDate,
        });
      }
    } catch (error) {
      console.error("Error fetching movie:", error);
      Alert.alert("Error", "Failed to load movie details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setMovie({
      ...movie,
      [field]: value,
    });
  };

  const handleDateChange = (
    event: any,
    selectedDate: Date | undefined,
    dateType: "releaseDate" | "endDate"
  ) => {
    if (Platform.OS === "android") {
      setShowReleaseDatePicker(false);
      setShowEndDatePicker(false);
    }

    if (selectedDate) {
      setMovie({
        ...movie,
        [dateType]: selectedDate,
      });
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "You need to grant permission to access your photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPosterImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadPoster = async () => {
    if (!posterImage) return movie.posterUrl;

    try {
      // Convert URI to blob
      const response = await fetch(posterImage.uri);
      const blob = await response.blob();

      // Generate a unique filename
      const filename = `posters/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}`;
      const storageRef = ref(storage, filename);

      // Upload image
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error("Error uploading poster:", error);
      throw new Error("Failed to upload poster");
    }
  };

  const validateForm = () => {
    if (!movie.title.trim()) {
      Alert.alert("Error", "Title is required");
      return false;
    }

    if (!movie.genre.trim()) {
      Alert.alert("Error", "Genre is required");
      return false;
    }

    if (!movie.duration.trim()) {
      Alert.alert("Error", "Duration is required");
      return false;
    }

    if (!movie.synopsis.trim()) {
      Alert.alert("Error", "Synopsis is required");
      return false;
    }

    if (!movie.posterUrl && !posterImage) {
      Alert.alert("Error", "Poster image is required");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Upload poster if a new one was selected
      let posterUrl = movie.posterUrl;
      if (posterImage) {
        posterUrl = await uploadPoster();
      }

      // Ensure dates are properly formatted for Firestore
      const movieData = {
        ...movie,
        posterUrl,
        duration: Number.parseInt(movie.duration, 10) || 0,
        rating: Number.parseFloat(movie.rating) || 0,
        // Make sure dates are stored as Firestore timestamps
        releaseDate: movie.releaseDate,
        endDate: movie.endDate,
      };

      if (isNew) {
        // Add new movie
        await addDoc(collection(db, "movies"), movieData);
        Alert.alert("Success", "Movie added successfully");
      } else {
        // Update existing movie
        await updateDoc(doc(db, "movies", movieId), movieData);
        Alert.alert("Success", "Movie updated successfully");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error saving movie:", error);
      Alert.alert("Error", "Failed to save movie");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff' }}
      edges={['top']}
    >
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isNew ? "Add Movie" : "Edit Movie"}
        </Text>
        <View style={styles.placeholder} />
      </View> */}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content}>
          <View style={styles.formContainer}>
            <View style={styles.posterContainer}>
              <TouchableOpacity style={styles.posterUpload} onPress={pickImage}>
                {posterImage ? (
                  <Image
                    source={{ uri: posterImage.uri }}
                    style={styles.posterPreview}
                    resizeMode="cover"
                  />
                ) : movie.posterUrl ? (
                  <Image
                    source={{ uri: movie.posterUrl }}
                    style={styles.posterPreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.posterPlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#ccc" />
                    <Text style={styles.posterPlaceholderText}>
                      Upload Poster
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={movie.title}
                onChangeText={(text) => handleInputChange("title", text)}
                placeholder="Enter movie title"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Genre</Text>
              <TextInput
                style={styles.input}
                value={movie.genre}
                onChangeText={(text) => handleInputChange("genre", text)}
                placeholder="Enter genre (e.g. Action, Comedy)"
              />
            </View>

            <View style={styles.rowInputs}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}
              >
                <Text style={styles.inputLabel}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={movie.duration.toString()}
                  onChangeText={(text) => handleInputChange("duration", text)}
                  placeholder="120"
                  keyboardType="number-pad"
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Rating (0-10)</Text>
                <TextInput
                  style={styles.input}
                  value={movie.rating.toString()}
                  onChangeText={(text) => handleInputChange("rating", text)}
                  placeholder="8.5"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Synopsis</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={movie.synopsis}
                onChangeText={(text) => handleInputChange("synopsis", text)}
                placeholder="Enter movie synopsis"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Director</Text>
              <TextInput
                style={styles.input}
                value={movie.director}
                onChangeText={(text) => handleInputChange("director", text)}
                placeholder="Enter director name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cast</Text>
              <TextInput
                style={styles.input}
                value={movie.cast}
                onChangeText={(text) => handleInputChange("cast", text)}
                placeholder="Enter cast names (separated by commas)"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Trailer URL (YouTube)</Text>
              <TextInput
                style={styles.input}
                value={movie.trailerUrl}
                onChangeText={(text) => handleInputChange("trailerUrl", text)}
                placeholder="https://www.youtube.com/watch?v=..."
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Release Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowReleaseDatePicker(true)}
              >
                <Text>
                  {movie.releaseDate instanceof Date
                    ? movie.releaseDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "Select date"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>

              {showReleaseDatePicker && (
                <DateTimePicker
                  value={movie.releaseDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) =>
                    handleDateChange(event, date, "releaseDate")
                  }
                  onTouchCancel={() => setShowReleaseDatePicker(false)}
                />
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>End Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text>
                  {movie.endDate instanceof Date
                    ? movie.endDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "Select date"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>

              {showEndDatePicker && (
                <DateTimePicker
                  value={movie.endDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) =>
                    handleDateChange(event, date, "endDate")
                  }
                  onTouchCancel={() => setShowEndDatePicker(false)}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Movie</Text>
          )}
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  posterContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  posterUpload: {
    width: 150,
    height: 225,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  posterPreview: {
    width: "100%",
    height: "100%",
  },
  posterPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  posterPlaceholderText: {
    marginTop: 10,
    color: "#666",
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  rowInputs: {
    flexDirection: "row",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
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

export default EditMovieScreen;
