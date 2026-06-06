"use client";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";
import { useAuth } from "../context/AuthContext";

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
import AIAssistantScreen from "../screens/user/AIAssistantScreen";
import ArticleScreen from "../screens/user/ArticleScreen";
import PaymentMethodsScreen from "../screens/user/PaymentMethodsScreen";
import NotificationsScreen from "../screens/user/NotificationsScreen";
import ChangePasswordScreen from "../screens/user/ChangePasswordScreen";

// Admin Screens
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import ManageMoviesScreen from "../screens/admin/ManageMoviesScreen";
import ManagePromotionsScreen from "../screens/admin/ManagePromotionsScreen";
import ManageBookingsScreen from "../screens/admin/ManageBookingsScreen";
import ManageShowtimesScreen from "../screens/admin/ManageShowtimesScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerOptions = {
  headerStyle: {
    backgroundColor: colors.background,
  },
  headerTintColor: colors.text,
  headerTitleAlign: "center" as const,
  headerShadowVisible: false,
};

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
      headerShown: false,
      tabBarActiveTintColor: colors.text,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: {
        height: 70,
        paddingTop: 8,
        paddingBottom: 8,
        paddingHorizontal: 8,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.14,
        shadowRadius: 14,
        elevation: 10,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: "900",
        marginTop: 2,
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === "Home") {
          iconName = focused ? "home" : "home-outline";
        } else if (route.name === "AI") {
          iconName = focused ? "sparkles" : "sparkles-outline";
        } else if (route.name === "My Tickets") {
          iconName = focused ? "ticket" : "ticket-outline";
        } else if (route.name === "Profile") {
          iconName = focused ? "person" : "person-outline";
        } else if (route.name === "Admin") {
          iconName = focused ? "grid" : "grid-outline";
        }

        return (
          <Ionicons
            name={iconName as any}
            size={focused ? size + 2 : size}
            color={focused ? colors.accent : color}
          />
        );
      },
      tabBarItemStyle: {
        borderRadius: 14,
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="AI" component={AIAssistantScreen} />
    <Tab.Screen name="My Tickets" component={MyTicketsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Admin" component={AdminStackNavigator} />
  </Tab.Navigator>
);

const AdminStackNavigator = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="Dashboard"
      component={AdminDashboardScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="Movies" component={ManageMoviesScreen} />
    <Stack.Screen name="Promotions" component={ManagePromotionsScreen} />
    <Stack.Screen name="Bookings" component={ManageBookingsScreen} />
    <Stack.Screen name="ManageShowtimes" component={ManageShowtimesScreen} />
    <Stack.Screen
      name="Article"
      component={ArticleScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// User Stack Navigator
const UserStackNavigator = () => (
  <Stack.Navigator screenOptions={headerOptions}>
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

// Root Navigator
const RootNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="UserRoot" component={UserStackNavigator} />
      ) : (
        <Stack.Screen name="AuthRoot" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
