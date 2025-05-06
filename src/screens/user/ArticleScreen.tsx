"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ArticleScreen = ({ route, navigation }: any) => {
  const { articleId } = route.params;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);

        const articleDoc = await getDoc(doc(db, "articles", articleId));
        if (articleDoc.exists()) {
          setArticle({ id: articleDoc.id, ...articleDoc.data() });
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Article not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.articleImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "transparent"]}
          style={styles.gradient}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.articleContent}>
          <Text style={styles.articleTitle}>{article.title}</Text>

          <Text style={styles.articleDate}>
            {article.createdAt && article.createdAt.seconds
              ? new Date(article.createdAt.seconds * 1000).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )
              : "Unknown date"}
          </Text>

          <Text style={styles.articleText}>{article.content}</Text>

          <View style={styles.shareContainer}>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social-outline" size={20} color="#fff" />
              <Text style={styles.shareText}>Share Article</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
  },
  imageContainer: {
    position: "relative",
    height: 250,
    width: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 100,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  articleImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  articleContent: {
    padding: 20,
    paddingTop: 30,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  articleDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    fontStyle: "italic",
  },
  articleText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#333",
    letterSpacing: 0.3,
  },
  shareContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E50914",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  shareText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
});

export default ArticleScreen;
