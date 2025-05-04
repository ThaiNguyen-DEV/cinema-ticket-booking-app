import React, { useState, useEffect } from "react";
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
import { doc, getDoc, addDoc, updateDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../config/firebase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const EditPromotionScreen = ({ route, navigation }: any) => {
  const { promotionId, isNew = false } = route.params || {};

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [promotion, setPromotion] = useState({
    title: "",
    imageUrl: "",
    articleId: "",
  });

  const [article, setArticle] = useState({
    title: "",
    content: "",
    imageUrl: "",
  });

  const [promotionImage, setPromotionImage] = useState<any>(null);
  const [articleImage, setArticleImage] = useState<any>(null);

  useEffect(() => {
    if (!isNew) {
      fetchPromotion();
    }
  }, [promotionId, isNew]);

  const fetchPromotion = async () => {
    try {
      setLoading(true);

      const promotionDoc = await getDoc(doc(db, "promotions", promotionId));
      if (promotionDoc.exists()) {
        const promotionData = promotionDoc.data();
        setPromotion({
          title: promotionData.title || "",
          imageUrl: promotionData.imageUrl || "",
          articleId: promotionData.articleId || "",
        });

        // Fetch associated article
        if (promotionData.articleId) {
          const articleDoc = await getDoc(
            doc(db, "articles", promotionData.articleId)
          );
          if (articleDoc.exists()) {
            const articleData = articleDoc.data();
            setArticle({
              title: articleData.title || "",
              content: articleData.content || "",
              imageUrl: articleData.imageUrl || "",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching promotion:", error);
      Alert.alert("Error", "Failed to load promotion details");
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionInputChange = (field: string, value: string) => {
    setPromotion({
      ...promotion,
      [field]: value,
    });
  };

  const handleArticleInputChange = (field: string, value: string) => {
    setArticle({
      ...article,
      [field]: value,
    });
  };

  const pickPromotionImage = async () => {
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
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPromotionImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const pickArticleImage = async () => {
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
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setArticleImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadImage = async (image: any, path: string) => {
    if (!image) return null;

    try {
      // Convert URI to blob
      const response = await fetch(image.uri);
      const blob = await response.blob();

      // Generate a unique filename
      const filename = `${path}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}`;
      const storageRef = ref(storage, filename);

      // Upload image
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const validateForm = () => {
    if (!promotion.title.trim()) {
      Alert.alert("Error", "Promotion title is required");
      return false;
    }

    if (!promotion.imageUrl && !promotionImage) {
      Alert.alert("Error", "Promotion image is required");
      return false;
    }

    if (!article.title.trim()) {
      Alert.alert("Error", "Article title is required");
      return false;
    }

    if (!article.content.trim()) {
      Alert.alert("Error", "Article content is required");
      return false;
    }

    if (!article.imageUrl && !articleImage) {
      Alert.alert("Error", "Article image is required");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Upload images if new ones were selected
      let promotionImageUrl = promotion.imageUrl;
      let articleImageUrl = article.imageUrl;

      if (promotionImage) {
        promotionImageUrl =
          (await uploadImage(promotionImage, "promotions")) || "";
      }

      if (articleImage) {
        articleImageUrl = (await uploadImage(articleImage, "articles")) || "";
      }

      let articleId = promotion.articleId;

      // Create or update article
      const articleData = {
        ...article,
        imageUrl: articleImageUrl,
        createdAt: new Date(),
      };

      if (isNew || !articleId) {
        // Create new article
        const articleRef = await addDoc(
          collection(db, "articles"),
          articleData
        );
        articleId = articleRef.id;
      } else {
        // Update existing article
        await updateDoc(doc(db, "articles", articleId), articleData);
      }

      // Create or update promotion
      const promotionData = {
        title: promotion.title,
        imageUrl: promotionImageUrl,
        articleId: articleId,
        createdAt: new Date(),
      };

      if (isNew) {
        // Create new promotion
        await addDoc(collection(db, "promotions"), promotionData);
        Alert.alert("Success", "Promotion added successfully");
      } else {
        // Update existing promotion
        await updateDoc(doc(db, "promotions", promotionId), promotionData);
        Alert.alert("Success", "Promotion updated successfully");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error saving promotion:", error);
      Alert.alert("Error", "Failed to save promotion");
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isNew ? "Add Promotion" : "Edit Promotion"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Promotion Details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={promotion.title}
                onChangeText={(text) =>
                  handlePromotionInputChange("title", text)
                }
                placeholder="Enter promotion title"
              />
            </View>

            <View style={styles.imageContainer}>
              <Text style={styles.inputLabel}>Promotion Banner</Text>
              <TouchableOpacity
                style={styles.imageUpload}
                onPress={pickPromotionImage}
              >
                {promotionImage ? (
                  <Image
                    source={{ uri: promotionImage.uri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                ) : promotion.imageUrl ? (
                  <Image
                    source={{ uri: promotion.imageUrl }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#ccc" />
                    <Text style={styles.imagePlaceholderText}>
                      Upload Banner Image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Article Details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Article Title</Text>
              <TextInput
                style={styles.input}
                value={article.title}
                onChangeText={(text) => handleArticleInputChange("title", text)}
                placeholder="Enter article title"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Article Content</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={article.content}
                onChangeText={(text) =>
                  handleArticleInputChange("content", text)
                }
                placeholder="Enter article content"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.imageContainer}>
              <Text style={styles.inputLabel}>Article Image</Text>
              <TouchableOpacity
                style={styles.imageUpload}
                onPress={pickArticleImage}
              >
                {articleImage ? (
                  <Image
                    source={{ uri: articleImage.uri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                ) : article.imageUrl ? (
                  <Image
                    source={{ uri: article.imageUrl }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#ccc" />
                    <Text style={styles.imagePlaceholderText}>
                      Upload Article Image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
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
            <Text style={styles.saveButtonText}>Save Promotion</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
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
    minHeight: 150,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageUpload: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: "#666",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 20,
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

export default EditPromotionScreen;
