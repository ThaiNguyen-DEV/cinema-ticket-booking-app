"use client";

import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  StatusBar,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, radii, shadow } from "../../theme";
import AppHeadbar from "../../components/AppHeadbar";

type RootStackParamList = {
  PaymentMethods: undefined;
  Notifications: undefined;
  ChangePassword: undefined;
  // Add other routes as needed
};

type ProfileScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const { user, updateDisplayName } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const handleSaveProfile = () => {
    updateDisplayName(displayName.trim() || "Guest");
    Alert.alert("Saved", "Guest profile updated for this session.");
    setIsEditing(false);
  };

  const showGuestMode = () => {
    Alert.alert(
      "Guest mode",
      "Firebase auth is disabled right now, so the app opens as a local guest."
    );
  };

  // Add handlers for the settings items
  const handlePaymentMethods = () => {
    navigation.navigate("PaymentMethods");
  };

  const handleNotifications = () => {
    navigation.navigate("Notifications");
  };

  const handleChangePassword = () => {
    navigation.navigate("ChangePassword");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AppHeadbar
        eyebrow="ACCOUNT"
        title="Profile"
        subtitle="Local guest settings and fake preferences"
        rightIcon="person-circle-outline"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : "U"}
              </Text>
            </View>
            {!isEditing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your name"
                />
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    setDisplayName(user?.displayName || "");
                    setIsEditing(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.displayName || "User"}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          )}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Experience</Text>

          <TouchableOpacity style={styles.settingItem} onPress={showGuestMode}>
            <View style={styles.settingIcon}>
              <Ionicons name="sparkles-outline" size={24} color="#E50914" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>AI Preferences</Text>
              <Text style={styles.settingDescription}>
                Mock mood, snack, and seat tuning
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={showGuestMode}>
            <View style={styles.settingIcon}>
              <Ionicons name="heart-outline" size={24} color="#E50914" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Watchlist</Text>
              <Text style={styles.settingDescription}>
                6 fake saved movies for later
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={showGuestMode}>
            <View style={styles.settingIcon}>
              <Ionicons name="ribbon-outline" size={24} color="#E50914" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Rewards</Text>
              <Text style={styles.settingDescription}>
                420 mock points and 2 perks
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handlePaymentMethods}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="card-outline" size={24} color="#E50914" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Payment Methods</Text>
              <Text style={styles.settingDescription}>
                Manage your payment methods
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleNotifications}
          >
            <View style={styles.settingIcon}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#E50914"
              />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Manage your notification preferences
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={showGuestMode}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="lock-closed-outline" size={24} color="#E50914" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Change Password</Text>
              <Text style={styles.settingDescription}>
                Update your password
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#E50914"
              />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>App Version</Text>
              <Text style={styles.settingDescription}>1.0.0</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#E50914"
              />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="shield-outline" size={24} color="#E50914" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={showGuestMode}>
            <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.logoutText}>Guest Mode Active</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBg,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: colors.background,
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#333",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: colors.muted,
  },
  editForm: {
    width: "100%",
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: radii.md,
    padding: 12,
    fontSize: 16,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f9f9f9",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  settingsSection: {
    backgroundColor: colors.card,
    padding: 20,
    marginTop: 15,
    marginBottom: 15,
    borderRadius: radii.lg,
    marginHorizontal: 15,
    ...shadow,
  },
  aboutSection: {
    backgroundColor: colors.card,
    padding: 20,
    marginBottom: 15,
    borderRadius: radii.lg,
    marginHorizontal: 15,
    ...shadow,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(229, 9, 20, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  logoutSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 30,
    borderRadius: 10,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#E50914",
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: 10,
  },
});

export default ProfileScreen;
