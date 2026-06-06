"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii } from "../../theme";
import { getDemoMovie, getDemoSeats, getDemoShowtime } from "../../data/demoData";

const PaymentScreen = ({ route, navigation }: any) => {
  const { movieId, showtimeId, selectedSeats, totalPrice } = route.params;
  const { user } = useAuth();
  const [movie, setMovie] = useState<any>(null);
  const [showtime, setShowtime] = useState<any>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | null>(
    null
  );

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    setLoading(true);
    setMovie(getDemoMovie(movieId));
    setShowtime(getDemoShowtime(movieId, showtimeId));
    setSeats(getDemoSeats(showtimeId).filter((seat) => selectedSeats.includes(seat.id)));
    setLoading(false);
  }, [movieId, showtimeId, selectedSeats]);

  const handlePaymentMethodSelect = (method: "card" | "paypal") => {
    setPaymentMethod(method);
  };

  const validateCardDetails = () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      Alert.alert("Error", "Please fill in all card details");
      return false;
    }

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      Alert.alert("Error", "Invalid card number");
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      Alert.alert("Error", "Invalid expiry date (MM/YY)");
      return false;
    }

    if (cvv.length !== 3) {
      Alert.alert("Error", "Invalid CVV");
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    if (paymentMethod === "card" && !validateCardDetails()) {
      return;
    }

    try {
      setProcessing(true);

      // In a real app, you would process the payment with Stripe/Braintree here
      // For this demo, we'll simulate a successful payment

      const booking = {
        userId: user?.uid,
        movieId,
        showtimeId,
        seats: selectedSeats,
        totalPrice,
        paymentMethod,
        status: "confirmed",
        createdAt: new Date(),
        // Generate a random booking reference
        reference: Math.random().toString(36).substring(2, 10).toUpperCase(),
      };
      console.log("Mock booking confirmed:", booking);

      // Show success message
      Alert.alert("Payment Successful", "Your booking has been confirmed!", [
        {
          text: "View My Tickets",
          onPress: () => {
            // Fixed navigation - navigate to UserTabs first, then to My Tickets tab
            navigation.navigate("UserTabs", { screen: "My Tickets" });
          },
        },
      ]);
    } catch (error) {
      console.error("Error processing payment:", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.substring(0, 19);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!movie || !showtime || seats.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Data not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.lightBg }}>
      <View style={styles.header}>
        {/* <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} /> */}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Movie</Text>
            <Text style={styles.summaryValue}>{movie.title}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Date & Time</Text>
            <Text style={styles.summaryValue}>
              {showtime.date} • {showtime.time}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Screen</Text>
            <Text style={styles.summaryValue}>{showtime.screen}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Seats</Text>
            <Text style={styles.summaryValue}>
              {seats.map((seat) => `${seat.row}${seat.number}`).join(", ")}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.paymentMethodsContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.paymentMethodItem,
              paymentMethod === "card" && styles.selectedPaymentMethod,
            ]}
            onPress={() => handlePaymentMethodSelect("card")}
          >
            <Ionicons
              name="card"
              size={24}
              color={paymentMethod === "card" ? "#E50914" : "#666"}
            />
            <Text
              style={[
                styles.paymentMethodText,
                paymentMethod === "card" && styles.selectedPaymentMethodText,
              ]}
            >
              Credit/Debit Card
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodItem,
              paymentMethod === "paypal" && styles.selectedPaymentMethod,
            ]}
            onPress={() => handlePaymentMethodSelect("paypal")}
          >
            <Ionicons
              name="logo-paypal"
              size={24}
              color={paymentMethod === "paypal" ? "#E50914" : "#666"}
            />
            <Text
              style={[
                styles.paymentMethodText,
                paymentMethod === "paypal" && styles.selectedPaymentMethodText,
              ]}
            >
              PayPal
            </Text>
          </TouchableOpacity>
        </View>

        {paymentMethod === "card" && (
          <View style={styles.cardDetailsContainer}>
            <Text style={styles.sectionTitle}>Card Details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={cardName}
                onChangeText={setCardName}
              />
            </View>

            <View style={styles.rowInputs}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}
              >
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        )}

        {paymentMethod === "paypal" && (
          <View style={styles.paypalContainer}>
            <Text style={styles.paypalText}>
              You will be redirected to PayPal to complete your payment.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!paymentMethod || processing) && styles.disabledButton,
          ]}
          onPress={handlePayment}
          disabled={!paymentMethod || processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay ${totalPrice.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderBottomColor: "#ddd",
    backgroundColor: colors.card,
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
  content: {
    flex: 1,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  paymentMethodsContainer: {
    backgroundColor: colors.card,
    padding: 20,
    marginBottom: 10,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: radii.md,
    marginBottom: 10,
  },
  selectedPaymentMethod: {
    borderColor: colors.primary,
    backgroundColor: "rgba(229, 9, 20, 0.06)",
  },
  paymentMethodText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  selectedPaymentMethodText: {
    color: colors.primary,
    fontWeight: "500",
  },
  cardDetailsContainer: {
    backgroundColor: colors.card,
    padding: 20,
    marginBottom: 10,
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
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: radii.md,
    padding: 12,
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: "row",
  },
  paypalContainer: {
    backgroundColor: colors.card,
    padding: 20,
    marginBottom: 10,
    alignItems: "center",
  },
  paypalText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  footer: {
    padding: 20,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    padding: 15,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PaymentScreen;
