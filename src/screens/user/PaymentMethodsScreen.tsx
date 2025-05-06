"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface PaymentMethod {
  id: string;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  isDefault: boolean;
}

const PaymentMethodsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );

  // Form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, [user]);

  const fetchPaymentMethods = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists() && userDoc.data().paymentMethods) {
        setPaymentMethods(userDoc.data().paymentMethods);
      } else {
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      Alert.alert("Error", "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = () => {
    setEditingMethod(null);
    setCardNumber("");
    setCardholderName("");
    setExpiryDate("");
    setModalVisible(true);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setCardNumber(method.cardNumber);
    setCardholderName(method.cardholderName);
    setExpiryDate(method.expiryDate);
    setModalVisible(true);
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");

    // Format as MM/YY
    if (cleaned.length > 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    } else {
      return cleaned;
    }
  };

  const validateForm = () => {
    if (!cardNumber.trim() || !cardholderName.trim() || !expiryDate.trim()) {
      Alert.alert("Error", "Please fill in all fields");
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

    // Validate month is between 01-12
    const month = Number.parseInt(expiryDate.substring(0, 2));
    if (month < 1 || month > 12) {
      Alert.alert("Error", "Invalid month in expiry date");
      return false;
    }

    return true;
  };

  const handleSaveMethod = async () => {
    if (!user || !validateForm()) return;

    try {
      setSaving(true);

      // Create a new payment method object
      const newMethod: PaymentMethod = {
        id: editingMethod ? editingMethod.id : Date.now().toString(),
        cardNumber: cardNumber,
        cardholderName: cardholderName,
        expiryDate: expiryDate,
        isDefault:
          paymentMethods.length === 0 ||
          (editingMethod ? editingMethod.isDefault : false),
      };

      const userRef = doc(db, "users", user.uid);

      if (editingMethod) {
        // Remove the old method first
        await updateDoc(userRef, {
          paymentMethods: arrayRemove(editingMethod),
        });
      }

      // Add the new/updated method
      await updateDoc(userRef, {
        paymentMethods: arrayUnion(newMethod),
      });

      // Refresh the list
      await fetchPaymentMethods();
      setModalVisible(false);
      Alert.alert(
        "Success",
        editingMethod ? "Payment method updated" : "Payment method added"
      );
    } catch (error) {
      console.error("Error saving payment method:", error);
      Alert.alert("Error", "Failed to save payment method");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMethod = async (method: PaymentMethod) => {
    if (!user) return;

    Alert.alert(
      "Delete Payment Method",
      "Are you sure you want to delete this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const userRef = doc(db, "users", user.uid);

              await updateDoc(userRef, {
                paymentMethods: arrayRemove(method),
              });

              // If the deleted method was the default and there are other methods,
              // set a new default
              if (method.isDefault && paymentMethods.length > 1) {
                const newDefault = paymentMethods.find(
                  (m) => m.id !== method.id
                );
                if (newDefault) {
                  const updatedDefault = { ...newDefault, isDefault: true };
                  await updateDoc(userRef, {
                    paymentMethods: arrayRemove(newDefault),
                  });
                  await updateDoc(userRef, {
                    paymentMethods: arrayUnion(updatedDefault),
                  });
                }
              }

              await fetchPaymentMethods();
              Alert.alert("Success", "Payment method deleted");
            } catch (error) {
              console.error("Error deleting payment method:", error);
              Alert.alert("Error", "Failed to delete payment method");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (method: PaymentMethod) => {
    if (!user || method.isDefault) return;

    try {
      setLoading(true);
      const userRef = doc(db, "users", user.uid);

      // Update all methods to not be default
      const updatedMethods = paymentMethods.map((m) => ({
        ...m,
        isDefault: m.id === method.id,
      }));

      // Remove all existing methods
      for (const m of paymentMethods) {
        await updateDoc(userRef, {
          paymentMethods: arrayRemove(m),
        });
      }

      // Add all updated methods
      for (const m of updatedMethods) {
        await updateDoc(userRef, {
          paymentMethods: arrayUnion(m),
        });
      }

      await fetchPaymentMethods();
      Alert.alert("Success", "Default payment method updated");
    } catch (error) {
      console.error("Error setting default payment method:", error);
      Alert.alert("Error", "Failed to update default payment method");
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => {
    // Mask the card number to show only last 4 digits
    const maskedNumber = `•••• •••• •••• ${item.cardNumber.slice(-4)}`;

    return (
      <View style={styles.methodCard}>
        <View style={styles.methodInfo}>
          <LinearGradient
            colors={["#E50914", "#B71C1C"]}
            style={styles.cardTypeIcon}
          >
            <Ionicons name="card" size={24} color="#fff" />
          </LinearGradient>
          <View style={styles.cardDetails}>
            <Text style={styles.cardNumber}>{maskedNumber}</Text>
            <Text style={styles.cardName}>{item.cardholderName}</Text>
            <Text style={styles.cardExpiry}>Expires: {item.expiryDate}</Text>
            {item.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
          </View>
        </View>
        <View style={styles.methodActions}>
          {!item.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetDefault(item)}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#4CAF50"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditMethod(item)}
          >
            <Ionicons name="create-outline" size={20} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteMethod(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
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
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : (
        <>
          <FlatList
            data={paymentMethods}
            renderItem={renderPaymentMethod}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.methodsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="card-outline" size={80} color="#ddd" />
                <Text style={styles.emptyText}>
                  No payment methods added yet
                </Text>
              </View>
            }
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAddMethod}>
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
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
                  value={cardholderName}
                  onChangeText={setCardholderName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Expiry Date (MM/YY)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={handleSaveMethod}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingMethod ? "Update" : "Add"} Payment Method
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  methodsList: {
    padding: 15,
    flexGrow: 1,
  },
  methodCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodInfo: {
    flexDirection: "row",
    marginBottom: 10,
  },
  cardTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardDetails: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  cardExpiry: {
    fontSize: 14,
    color: "#666",
  },
  defaultBadge: {
    marginTop: 5,
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  methodActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  actionButton: {
    padding: 8,
    marginLeft: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E50914",
    borderRadius: 10,
    padding: 15,
    margin: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    padding: 15,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#E50914",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
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

export default PaymentMethodsScreen;
