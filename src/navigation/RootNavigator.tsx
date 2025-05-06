"use client";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// User Screens
import HomeScreen from "../screens/user/HomeScreen";
import MovieDetailScreen from "../screens/user/MovieDetailScreen";
import BookingScreen from "../screens/user/BookingScreen";
import SeatSelectionScreen from "../screens/user/SeatSelectionScreen";
import PaymentScreen from "../screens/user/PaymentScreen";
import MyTicketsScreen from "../screens/user/MyTicketsScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import ArticleScreen from "../screens/user/ArticleScreen";
import PaymentMethodsScreen from "../screens/user/PaymentMethodsScreen";
import NotificationsScreen from "../screens/user/NotificationsScreen";
import ChangePasswordScreen from "../screens/user/ChangePasswordScreen";

// Admin Screens
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import ManageMoviesScreen from "../screens/admin/ManageMoviesScreen";
import ManagePromotionsScreen from "../screens/admin/ManagePromotionsScreen";
import ManageBookingsScreen from "../screens/admin/ManageBookingsScreen";
import EditMovieScreen from "../screens/admin/EditMovieScreen";
import EditPromotionScreen from "../screens/admin/EditPromotionScreen";
import ManageShowtimesScreen from "../screens/admin/ManageShowtimesScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// User Tab Navigator
const UserTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === "Home") {
          iconName = focused ? "home" : "home-outline";
        } else if (route.name === "My Tickets") {
          iconName = focused ? "ticket" : "ticket-outline";
        } else if (route.name === "Profile") {
          iconName = focused ? "person" : "person-outline";
        }

        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="My Tickets" component={MyTicketsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// User Stack Navigator
const UserStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="UserTabs"
      component={UserTabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MovieDetail"
      component={MovieDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="Booking" component={BookingScreen} />
    <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen
      name="Article"
      component={ArticleScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PaymentMethods"
      component={PaymentMethodsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// Admin Tab Navigator
const AdminTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === "Dashboard") {
          iconName = focused ? "grid" : "grid-outline";
        } else if (route.name === "Movies") {
          iconName = focused ? "film" : "film-outline";
        } else if (route.name === "Promotions") {
          iconName = focused ? "megaphone" : "megaphone-outline";
        } else if (route.name === "Bookings") {
          iconName = focused ? "calendar" : "calendar-outline";
        }

        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
    <Tab.Screen name="Movies" component={ManageMoviesScreen} />
    <Tab.Screen name="Promotions" component={ManagePromotionsScreen} />
    <Tab.Screen name="Bookings" component={ManageBookingsScreen} />
  </Tab.Navigator>
);

// Admin Stack Navigator
const AdminStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AdminTabs"
      component={AdminTabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="EditMovie" component={EditMovieScreen} />
    <Stack.Screen name="EditPromotion" component={EditPromotionScreen} />
    <Stack.Screen name="ManageShowtimes" component={ManageShowtimesScreen} />
    <Stack.Screen name="Article" component={ArticleScreen} />
  </Stack.Navigator>
);

// Root Navigator
const RootNavigator = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : isAdmin ? (
        <Stack.Screen name="AdminRoot" component={AdminStackNavigator} />
      ) : (
        <Stack.Screen name="UserRoot" component={UserStackNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
