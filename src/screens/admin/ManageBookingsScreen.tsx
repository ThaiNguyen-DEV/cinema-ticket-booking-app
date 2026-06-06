import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeadbar from "../../components/AppHeadbar";
import { colors, radii, shadow } from "../../theme";
import { demoTickets } from "../../data/demoData";

const ManageBookingsScreen = () => {
  const [bookings, setBookings] = useState(
    demoTickets.map((ticket) => ({ ...ticket, status: "confirmed" }))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [bookings, searchQuery]
  );

  return (
    <View style={styles.container}>
      <AppHeadbar
        eyebrow="ADMIN"
        title="Bookings"
        subtitle={`${bookings.length} mock reservations`}
        rightIcon="calendar-outline"
      />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.mutedDark} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bookings..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const expanded = selectedId === item.id;
          return (
            <TouchableOpacity
              style={[styles.card, expanded && styles.cardActive]}
              onPress={() => setSelectedId(expanded ? null : item.id)}
            >
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Text style={styles.reference}>Ref {item.reference}</Text>
                  <Text style={styles.title}>{item.movie.title}</Text>
                  <Text style={styles.meta}>{item.showtime.date} • {item.showtime.time}</Text>
                </View>
                <View style={[styles.status, item.status === "cancelled" && styles.cancelled]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              {expanded && (
                <View style={styles.details}>
                  <Text style={styles.detail}>Screen {item.showtime.screen}</Text>
                  <Text style={styles.detail}>Seats {item.seats.map((seat) => `${seat.row}${seat.number}`).join(", ")}</Text>
                  <Text style={styles.detail}>Total ${item.totalPrice.toFixed(2)}</Text>
                  {item.status !== "cancelled" && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() =>
                        setBookings((current) =>
                          current.map((booking) =>
                            booking.id === item.id ? { ...booking, status: "cancelled" } : booking
                          )
                        )
                      }
                    >
                      <Text style={styles.cancelText}>Cancel mock booking</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lightBorder,
  },
  searchInput: { flex: 1, height: 46, fontSize: 15 },
  list: { padding: 16, paddingTop: 8, paddingBottom: 24 },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 15, marginBottom: 14, ...shadow },
  cardActive: { borderWidth: 1, borderColor: colors.primary },
  row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  flex: { flex: 1 },
  reference: { color: colors.mutedDark, fontWeight: "800", marginBottom: 4 },
  title: { color: colors.textDark, fontSize: 17, fontWeight: "900" },
  meta: { color: colors.mutedDark, fontWeight: "600", marginTop: 5 },
  status: { backgroundColor: colors.success, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.sm },
  cancelled: { backgroundColor: colors.primary },
  statusText: { color: colors.text, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  details: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.lightBorder },
  detail: { color: colors.textDark, fontWeight: "700", marginBottom: 8 },
  cancelButton: { marginTop: 8, padding: 12, alignItems: "center", backgroundColor: colors.primary, borderRadius: radii.md },
  cancelText: { color: colors.text, fontWeight: "900" },
});

export default ManageBookingsScreen;
