import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeadbar from "../../components/AppHeadbar";
import { colors, radii, shadow } from "../../theme";
import { demoMovies, demoPromotions, demoTickets } from "../../data/demoData";

const AdminDashboardScreen = ({ navigation }: any) => {
  const revenue = demoTickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0);
  const activeMovies = demoMovies.filter(
    (movie) => new Date(movie.releaseDate) <= new Date()
  ).length;

  const stats = [
    { label: "Movies", value: demoMovies.length, icon: "film-outline", color: colors.primary },
    { label: "Active", value: activeMovies, icon: "play-circle-outline", color: colors.success },
    { label: "Bookings", value: demoTickets.length, icon: "ticket-outline", color: "#3B82F6" },
    { label: "Revenue", value: `$${revenue.toFixed(0)}`, icon: "cash-outline", color: colors.accent },
  ];

  return (
    <View style={styles.container}>
      <AppHeadbar
        eyebrow="ADMIN MOCK"
        title="Control Room"
        subtitle="Local dashboard while Firebase is removed"
        rightIcon="grid-outline"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${item.color}22` }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Quick Actions</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.action} onPress={() => navigation.navigate("Movies")}>
              <Ionicons name="film-outline" size={22} color={colors.text} />
              <Text style={styles.actionText}>Movies</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={() => navigation.navigate("Promotions")}>
              <Ionicons name="megaphone-outline" size={22} color={colors.text} />
              <Text style={styles.actionText}>Promos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={() => navigation.navigate("Bookings")}>
              <Ionicons name="calendar-outline" size={22} color={colors.text} />
              <Text style={styles.actionText}>Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={() => navigation.navigate("ManageShowtimes")}>
              <Ionicons name="time-outline" size={22} color={colors.text} />
              <Text style={styles.actionText}>Times</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Recent Activity</Text>
          {demoTickets.map((ticket) => (
            <View key={ticket.id} style={styles.activityRow}>
              <View>
                <Text style={styles.activityTitle}>{ticket.movie.title}</Text>
                <Text style={styles.activityMeta}>Ref {ticket.reference} • Screen {ticket.showtime.screen}</Text>
              </View>
              <Text style={styles.activityPrice}>${ticket.totalPrice.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Live Mock Content</Text>
          <Text style={styles.panelMeta}>
            {demoPromotions.length} promotions, {demoMovies.length} movies, and generated showtimes are running locally.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg },
  content: { padding: 16, paddingBottom: 24 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  statCard: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 16,
    ...shadow,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: { fontSize: 24, fontWeight: "900", color: colors.textDark },
  statLabel: { marginTop: 4, fontSize: 13, fontWeight: "700", color: colors.mutedDark },
  panel: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 16,
    ...shadow,
  },
  panelTitle: { fontSize: 18, fontWeight: "900", color: colors.textDark, marginBottom: 12 },
  panelMeta: { color: colors.mutedDark, lineHeight: 21, fontWeight: "600" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  action: {
    width: "47%",
    minHeight: 72,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    padding: 12,
    justifyContent: "space-between",
  },
  actionText: { color: colors.text, fontWeight: "900" },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightBorder,
  },
  activityTitle: { color: colors.textDark, fontWeight: "900", marginBottom: 4 },
  activityMeta: { color: colors.mutedDark, fontSize: 12, fontWeight: "600" },
  activityPrice: { color: colors.primary, fontWeight: "900" },
});

export default AdminDashboardScreen;
