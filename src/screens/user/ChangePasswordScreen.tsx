import { StyleSheet, Text, TouchableOpacity, View, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadow } from "../../theme";

const ChangePasswordScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed-outline" size={42} color={colors.primary} />
        </View>
        <Text style={styles.title}>Guest mode is active</Text>
        <Text style={styles.body}>
          Firebase authentication is disabled for now, so password changes are
          unavailable until auth is restored.
        </Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.goBack()}>
          <Text style={styles.actionText}>Back to Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 22,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 52,
    left: 22,
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 24,
    alignItems: "center",
    ...shadow,
  },
  iconWrap: {
    width: 82,
    height: 82,
    borderRadius: radii.lg,
    backgroundColor: "rgba(229, 9, 20, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textDark,
    marginBottom: 10,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.mutedDark,
    textAlign: "center",
    marginBottom: 22,
  },
  actionButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  actionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
});

export default ChangePasswordScreen;
