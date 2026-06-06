import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeadbar from "../../components/AppHeadbar";
import { colors, radii, shadow } from "../../theme";

const suggestions = [
  {
    id: "mood",
    icon: "color-wand-outline",
    title: "Mood Matcher",
    prompt: "Find me something tense but not too dark.",
    response:
      "Try Midnight Premiere at 20:30. It has thriller energy, strong reviews, and premium seats open in row C.",
  },
  {
    id: "snacks",
    icon: "fast-food-outline",
    title: "Snack AI",
    prompt: "Build a snack combo for two people.",
    response:
      "Large caramel popcorn, two iced teas, and one nacho tray. Estimated combo: $18. Best with romance or adventure sessions.",
  },
  {
    id: "seat",
    icon: "albums-outline",
    title: "Seat Genius",
    prompt: "Pick seats with the best screen angle.",
    response:
      "Rows C-D, seats 4-5 are the sweet spot: centered, not too close, and close to the main aisle.",
  },
  {
    id: "plan",
    icon: "calendar-clear-outline",
    title: "Night Planner",
    prompt: "Plan a full Friday movie night.",
    response:
      "Book Neon Skies at 19:15, arrive 25 minutes early, choose premium seats, then use the date-night combo.",
  },
];

const quickActions = ["Tonight", "For two", "Under $40", "Premium seats"];

const AIAssistantScreen = () => {
  const [selectedId, setSelectedId] = useState(suggestions[0].id);
  const selected = suggestions.find((item) => item.id === selectedId) ?? suggestions[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AppHeadbar
        eyebrow="FAKE AI LAB"
        title="Cinema AI"
        subtitle="Mock assistants for picks, snacks, and seats"
        rightIcon="hardware-chip-outline"
      />

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="sparkles" size={28} color={colors.accent} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Ask the fake concierge</Text>
          <Text style={styles.heroText}>
            These interfaces are local mockups, ready to connect to your real AI later.
          </Text>
        </View>
      </View>

      <View style={styles.quickRow}>
        {quickActions.map((action) => (
          <TouchableOpacity key={action} style={styles.quickChip}>
            <Text style={styles.quickText}>{action}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.agentList}
        renderItem={({ item }) => {
          const active = item.id === selectedId;
          return (
            <TouchableOpacity
              style={[styles.agentCard, active && styles.agentCardActive]}
              onPress={() => setSelectedId(item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={24}
                color={active ? colors.text : colors.primary}
              />
              <Text style={[styles.agentTitle, active && styles.agentTitleActive]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.chatCard}>
        <View style={styles.bubbleUser}>
          <Text style={styles.bubbleLabel}>You</Text>
          <Text style={styles.bubbleTextDark}>{selected.prompt}</Text>
        </View>
        <View style={styles.bubbleAi}>
          <Text style={styles.bubbleLabelAi}>Cinema AI</Text>
          <Text style={styles.bubbleText}>{selected.response}</Text>
        </View>
        <TouchableOpacity style={styles.primaryButton}>
          <Ionicons name="ticket-outline" size={18} color={colors.text} />
          <Text style={styles.primaryButtonText}>Use this recommendation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBg,
  },
  hero: {
    flexDirection: "row",
    margin: 18,
    padding: 18,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
    ...shadow,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 5,
  },
  heroText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 18,
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.lightBorder,
  },
  quickText: {
    color: colors.textDark,
    fontWeight: "800",
    fontSize: 13,
  },
  agentList: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
  },
  agentCard: {
    width: 132,
    minHeight: 108,
    borderRadius: radii.lg,
    padding: 14,
    backgroundColor: colors.card,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.lightBorder,
  },
  agentCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  agentTitle: {
    color: colors.textDark,
    fontWeight: "900",
    fontSize: 15,
  },
  agentTitleActive: {
    color: colors.text,
  },
  chatCard: {
    marginHorizontal: 18,
    padding: 18,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    ...shadow,
  },
  bubbleUser: {
    alignSelf: "flex-end",
    maxWidth: "86%",
    backgroundColor: colors.lightBg,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 12,
  },
  bubbleAi: {
    alignSelf: "flex-start",
    maxWidth: "90%",
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 16,
  },
  bubbleLabel: {
    color: colors.mutedDark,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 5,
  },
  bubbleLabelAi: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 5,
  },
  bubbleText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  bubbleTextDark: {
    color: colors.textDark,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  primaryButton: {
    height: 50,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 15,
  },
});

export default AIAssistantScreen;
