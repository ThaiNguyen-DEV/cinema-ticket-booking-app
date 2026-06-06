import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeadbar from "../../components/AppHeadbar";
import { colors, radii, shadow } from "../../theme";

const EditPromotionScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <AppHeadbar
        eyebrow="ADMIN MOCK"
        title="Promotion Editor"
        subtitle="Firebase editor removed for backend replacement"
        rightIcon="megaphone-outline"
      />
      <View style={styles.card}>
        <Ionicons name="construct-outline" size={44} color={colors.primary} />
        <Text style={styles.title}>Mock editor placeholder</Text>
        <Text style={styles.body}>
          Promotion create/edit actions are disabled until the replacement backend is connected.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back to Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg },
  card: {
    margin: 16,
    padding: 22,
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    ...shadow,
  },
  title: { marginTop: 14, fontSize: 22, fontWeight: "900", color: colors.textDark },
  body: { marginTop: 8, color: colors.mutedDark, textAlign: "center", lineHeight: 21, fontWeight: "600" },
  button: { marginTop: 20, paddingHorizontal: 18, paddingVertical: 13, backgroundColor: colors.primary, borderRadius: radii.md },
  buttonText: { color: colors.text, fontWeight: "900" },
});

export default EditPromotionScreen;
