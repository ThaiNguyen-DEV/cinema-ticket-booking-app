"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface NotificationSettings {
  promotions: boolean;
  newReleases: boolean;
  bookingReminders: boolean;
  priceAlerts: boolean;
  appUpdates: boolean;
}

const NotificationsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    promotions: true,
    newReleases: true,
    bookingReminders: true,
    priceAlerts: false,
    appUpdates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
  }, [user]);

  const fetchNotificationSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists() && userDoc.data().notificationSettings) {
        setSettings(userDoc.data().notificationSettings);
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      Alert.alert("Error", "Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (setting: keyof NotificationSettings) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Get current user data
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Update existing document
        await updateDoc(userRef, {
          notificationSettings: settings,
        });
      } else {
        // Create new document with settings
        await setDoc(userRef, {
          notificationSettings: settings,
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date(),
        });
      }

      Alert.alert("Success", "Notification settings updated");
    } catch (error) {
      console.error("Error saving notification settings:", error);
      Alert.alert("Error", "Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E50914" />

      <LinearGradient colors={["#E50914", "#B71C1C"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingTitleContainer}>
                  <Ionicons
                    name="megaphone-outline"
                    size={22}
                    color="#E50914"
                    style={styles.settingIcon}
                  />
                  <Text style={styles.settingTitle}>Promotions</Text>
                </View>
                <Text style={styles.settingDescription}>
                  Receive notifications about special offers and promotions
                </Text>
              </View>
              <Switch
                value={settings.promotions}
                onValueChange={() => handleToggle("promotions")}
                trackColor={{ false: "#ccc", true: "rgba(229, 9, 20, 0.3)" }}
                thumbColor={settings.promotions ? "#E50914" : "#fff"}
                ios_backgroundColor="#ccc"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingTitleContainer}>
                  <Ionicons
                    name="film-outline"
                    size={22}
                    color="#E50914"
                    style={styles.settingIcon}
                  />
                  <Text style={styles.settingTitle}>New Releases</Text>
                </View>
                <Text style={styles.settingDescription}>
                  Get notified when new movies are released
                </Text>
              </View>
              <Switch
                value={settings.newReleases}
                onValueChange={() => handleToggle("newReleases")}
                trackColor={{ false: "#ccc", true: "rgba(229, 9, 20, 0.3)" }}
                thumbColor={settings.newReleases ? "#E50914" : "#fff"}
                ios_backgroundColor="#ccc"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingTitleContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={22}
                    color="#E50914"
                    style={styles.settingIcon}
                  />
                  <Text style={styles.settingTitle}>Booking Reminders</Text>
                </View>
                <Text style={styles.settingDescription}>
                  Receive reminders about your upcoming bookings
                </Text>
              </View>
              <Switch
                value={settings.bookingReminders}
                onValueChange={() => handleToggle("bookingReminders")}
                trackColor={{ false: "#ccc", true: "rgba(229, 9, 20, 0.3)" }}
                thumbColor={settings.bookingReminders ? "#E50914" : "#fff"}
                ios_backgroundColor="#ccc"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingTitleContainer}>
                  <Ionicons
                    name="pricetag-outline"
                    size={22}
                    color="#E50914"
                    style={styles.settingIcon}
                  />
                  <Text style={styles.settingTitle}>Price Alerts</Text>
                </View>
                <Text style={styles.settingDescription}>
                  Get notified about ticket price changes
                </Text>
              </View>
              <Switch
                value={settings.priceAlerts}
                onValueChange={() => handleToggle("priceAlerts")}
                trackColor={{ false: "#ccc", true: "rgba(229, 9, 20, 0.3)" }}
                thumbColor={settings.priceAlerts ? "#E50914" : "#fff"}
                ios_backgroundColor="#ccc"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingTitleContainer}>
                  <Ionicons
                    name="refresh-outline"
                    size={22}
                    color="#E50914"
                    style={styles.settingIcon}
                  />
                  <Text style={styles.settingTitle}>App Updates</Text>
                </View>
                <Text style={styles.settingDescription}>
                  Receive notifications about app updates and new features
                </Text>
              </View>
              <Switch
                value={settings.appUpdates}
                onValueChange={() => handleToggle("appUpdates")}
                trackColor={{ false: "#ccc", true: "rgba(229, 9, 20, 0.3)" }}
                thumbColor={settings.appUpdates ? "#E50914" : "#fff"}
                ios_backgroundColor="#ccc"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={saveSettings}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Settings</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  settingsContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  settingIcon: {
    marginRight: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    paddingLeft: 30,
  },
  saveButton: {
    backgroundColor: "#E50914",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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

export default NotificationsScreen;
