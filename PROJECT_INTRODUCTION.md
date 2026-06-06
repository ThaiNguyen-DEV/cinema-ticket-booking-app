# Cinema Ticket Booking App

## Project Overview

**Cinema Ticket Booking App** is a mobile application prototype for browsing movies, booking cinema tickets, managing tickets, and reviewing cinema operations from an admin view.

The app is built with **Expo**, **React Native**, and **TypeScript**. It currently runs without a real backend and uses local mock data for movies, showtimes, seats, tickets, promotions, payment methods, admin statistics, and fake AI features.

The project originally used Firebase, but Firebase has been removed from the runtime app because the backend is planned to be replaced. The current version is designed to be easy to demo, test, and continue developing without backend errors.

## Main Purpose

The purpose of this project is to simulate a complete cinema ticket booking system on mobile.

It demonstrates:

- A customer-facing cinema app
- A booking and seat selection flow
- A mock payment process
- Ticket display with QR codes
- Fake AI interfaces for future smart features
- An admin dashboard and management screens
- A backend-independent mock data architecture

## Target Users

### Customers

Customers use the app to:

- Browse available movies
- View movie details
- Select dates and showtimes
- Choose seats
- Complete a mock payment
- View booked tickets
- Manage profile preferences
- Try mock AI recommendations

### Admins

Admins use the app to:

- View cinema dashboard statistics
- Review movie data
- Review promotions
- Review bookings
- Review generated showtimes
- Inspect mock operational data

## Current App Mode

The app currently runs in **local mock mode**.

This means:

- No Firebase authentication is required.
- No real backend is called.
- No real payment is processed.
- No real database writes happen.
- All customer and admin data comes from local mock data.

The main mock data file is:

```text
src/data/demoData.ts
```

## Main Features

### 1. Custom App Layout

The app uses a custom visual structure instead of default navigation headers.

Important UI elements:

- Custom app headbar
- Custom bottom navigation bar
- Dark cinema-themed header areas
- Card-based content sections
- Mock AI shortcut cards
- Admin dashboard cards

Main shared UI files:

```text
src/components/AppHeadbar.tsx
src/theme.ts
```

### 2. Customer Home Screen

The Home screen is the main entry point for customers.

It includes:

- Custom greeting header
- Mock cinema data notice
- Fake AI shortcut cards
- Promotion carousel
- Now Showing movie list
- Coming Soon movie list
- Movie cards with posters, genre, rating, and booking button

File:

```text
src/screens/user/HomeScreen.tsx
```

### 3. Fake AI Interface

The app includes a fake AI screen called **Cinema AI**.

This is a mock interface only. It does not connect to a real AI model yet.

Fake AI features include:

- Mood Matcher
- Snack AI
- Seat Genius
- Night Planner
- Quick action chips
- Mock chat response UI

This screen is useful for showing how future AI-powered features could work.

File:

```text
src/screens/user/AIAssistantScreen.tsx
```

### 4. Movie Detail Screen

The Movie Detail screen shows information about a selected movie.

It includes:

- Movie poster
- Movie title
- Rating
- Genre
- Duration
- Release date
- Synopsis
- Cast
- Director
- Trailer section
- Book Tickets button

File:

```text
src/screens/user/MovieDetailScreen.tsx
```

### 5. Booking Flow

The booking flow simulates the full customer ticket booking journey.

Steps:

1. Choose a movie
2. Select a date
3. Select a showtime
4. Choose seats
5. Continue to payment
6. Confirm mock booking

Files:

```text
src/screens/user/BookingScreen.tsx
src/screens/user/SeatSelectionScreen.tsx
src/screens/user/PaymentScreen.tsx
```

### 6. Seat Selection

The seat selection screen displays generated mock seats.

Seat types:

- Standard
- Premium
- VIP
- Booked
- Selected

The screen calculates the total price based on selected seats.

File:

```text
src/screens/user/SeatSelectionScreen.tsx
```

### 7. Mock Payment

The payment screen simulates payment without using a real gateway.

Supported mock payment methods:

- Credit/Debit Card
- PayPal

The card form performs basic validation, but no real payment is made.

File:

```text
src/screens/user/PaymentScreen.tsx
```

### 8. My Tickets

The My Tickets screen shows mock bookings.

Each ticket includes:

- Movie title
- Showtime date and time
- Booking reference
- Screen number
- Seats
- Amount paid
- Booking date
- QR code

File:

```text
src/screens/user/MyTicketsScreen.tsx
```

### 9. Profile

The Profile screen works in local guest mode.

It includes:

- Guest profile display
- Local display name editing
- Payment methods link
- Notification settings link
- Guest mode status
- Fake experience options:
  - AI Preferences
  - Watchlist
  - Rewards

File:

```text
src/screens/user/ProfileScreen.tsx
```

### 10. Payment Methods

The Payment Methods screen displays local mock cards.

Users can:

- View mock cards
- Add a local card
- Edit a local card
- Delete a local card
- Set a default card

No card data is stored on a server.

File:

```text
src/screens/user/PaymentMethodsScreen.tsx
```

### 11. Notifications

The Notifications screen allows local mock preference changes.

Settings include:

- Promotions
- New releases
- Booking reminders
- Price alerts
- App updates

File:

```text
src/screens/user/NotificationsScreen.tsx
```

### 12. Articles And Promotions

Promotion cards link to mock article pages.

Article pages include:

- Promotion image
- Title
- Date
- Article content

File:

```text
src/screens/user/ArticleScreen.tsx
```

## Admin Features

The app includes an Admin tab in the bottom navigation.

Admin features are also mock/local.

### 1. Admin Dashboard

The admin dashboard shows mock operational statistics.

It includes:

- Total movies
- Active movies
- Total bookings
- Revenue
- Quick admin actions
- Recent activity
- Live mock content summary

File:

```text
src/screens/admin/AdminDashboardScreen.tsx
```

### 2. Manage Movies

The Manage Movies screen displays local movie records.

Admins can:

- Search movies
- View movie details
- Open showtime management for a movie
- Remove a movie locally

File:

```text
src/screens/admin/ManageMoviesScreen.tsx
```

### 3. Manage Promotions

The Manage Promotions screen displays mock promotions.

Admins can:

- View promotion cards
- Open linked articles
- Remove promotions locally

File:

```text
src/screens/admin/ManagePromotionsScreen.tsx
```

### 4. Manage Bookings

The Manage Bookings screen displays local ticket bookings.

Admins can:

- Search bookings
- Expand booking details
- View customer/movie/showtime data
- Cancel a mock booking locally

File:

```text
src/screens/admin/ManageBookingsScreen.tsx
```

### 5. Manage Showtimes

The Manage Showtimes screen displays generated local showtimes.

Admins can:

- Select a movie
- View generated showtimes
- Remove a showtime locally

File:

```text
src/screens/admin/ManageShowtimesScreen.tsx
```

### 6. Edit Placeholders

The old Firebase-based edit screens have been replaced with placeholders.

These placeholders explain that create/edit actions are disabled until the replacement backend is connected.

Files:

```text
src/screens/admin/EditMovieScreen.tsx
src/screens/admin/EditPromotionScreen.tsx
```

## Navigation Structure

Navigation is handled by React Navigation.

The main bottom tabs are:

- Home
- AI
- My Tickets
- Profile
- Admin

Main navigation file:

```text
src/navigation/RootNavigator.tsx
```

The app uses:

- Bottom tab navigation for main sections
- Native stack navigation for deeper screens
- Custom headers instead of default tab headers

## Mock Data

The app uses local mock data for:

- Movies
- Promotions
- Articles
- Showtimes
- Seats
- Tickets
- Payment methods

Main file:

```text
src/data/demoData.ts
```

Important exported data/functions:

- `demoMovies`
- `demoPromotions`
- `demoArticles`
- `demoTickets`
- `demoPaymentMethods`
- `getDemoMovie`
- `getDemoArticle`
- `getDemoShowtimes`
- `getDemoShowtime`
- `getDemoSeats`

## Authentication Status

The app does not currently use real authentication.

Instead, it uses a local guest user through:

```text
src/context/AuthContext.tsx
```

The guest user allows screens to keep using `useAuth()` without requiring a backend.

Current behavior:

- App opens directly in guest mode.
- No login is required.
- No logout is required.
- Profile name can be changed locally.
- Admin tab is accessible directly for demo purposes.

## Backend Status

Firebase has been removed from runtime usage.

Current Firebase status:

- Firebase package removed from dependencies.
- Firebase SDK imports removed from source files.
- `src/config/firebase.ts` is only a placeholder.
- All app flows use local mock data.

This makes the app ready for a future backend replacement.

## Tech Stack

### Core

- **Expo SDK 54**
- **React Native 0.81.5**
- **React 19.1.0**
- **TypeScript 5.9**

### Navigation

- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`
- `react-native-screens`
- `react-native-safe-area-context`

### UI And Styling

- `@expo/vector-icons`
- `expo-linear-gradient`
- `expo-status-bar`
- Shared theme file: `src/theme.ts`
- Custom headbar: `src/components/AppHeadbar.tsx`

### Animation And Carousel

- `react-native-reanimated`
- `react-native-reanimated-carousel`
- `react-native-gesture-handler`
- `react-native-worklets`

### Data And Utilities

- `date-fns`
- Local mock data
- TypeScript types

### QR And Media

- `react-native-qrcode-svg`
- `react-native-svg`
- `react-native-webview`
- `expo-image-picker`

### Platform Support

- Android
- iOS
- Web through Expo/React Native Web

## Project Structure

```text
src/
  assets/
    cinema-logo.png
  components/
    AppHeadbar.tsx
  config/
    firebase.ts
  context/
    AuthContext.tsx
  data/
    demoData.ts
  navigation/
    RootNavigator.tsx
  screens/
    admin/
      AdminDashboardScreen.tsx
      ManageMoviesScreen.tsx
      ManagePromotionsScreen.tsx
      ManageBookingsScreen.tsx
      ManageShowtimesScreen.tsx
      EditMovieScreen.tsx
      EditPromotionScreen.tsx
    auth/
      LoginScreen.tsx
      RegisterScreen.tsx
    user/
      HomeScreen.tsx
      AIAssistantScreen.tsx
      ArticleScreen.tsx
      BookingScreen.tsx
      ChangePasswordScreen.tsx
      MovieDetailScreen.tsx
      MyTicketsScreen.tsx
      NotificationsScreen.tsx
      PaymentMethodsScreen.tsx
      PaymentScreen.tsx
      ProfileScreen.tsx
      SeatSelectionScreen.tsx
  theme.ts
```

## Main User Demo Flow

1. Open the app.
2. Start on the Home screen.
3. View fake AI shortcut cards.
4. Browse Now Showing movies.
5. Open a movie detail screen.
6. Press Book Tickets.
7. Select a date.
8. Select a showtime.
9. Choose seats.
10. Continue to payment.
11. Select a mock payment method.
12. Confirm booking.
13. View mock tickets with QR code.

## Main Admin Demo Flow

1. Open the Admin tab.
2. View admin dashboard statistics.
3. Open Movies to inspect movie records.
4. Open Promotions to inspect campaigns.
5. Open Bookings to inspect and cancel mock bookings.
6. Open Showtimes to inspect generated schedules.

## Current Limitations

- No real backend is connected.
- No real authentication is active.
- No real payment gateway is active.
- Admin create/edit actions are placeholders.
- Mock data resets when the app reloads.
- Fake AI responses are hardcoded.
- Ticket bookings are simulated, not persisted to a database.

## Future Improvements

Possible next steps:

- Connect a new backend API
- Add real authentication
- Add real admin role permissions
- Persist bookings and tickets
- Add real payment provider integration
- Connect real AI recommendation service
- Add movie search and filters
- Add cinema branch/location selection
- Add seat hold timers
- Add push notifications
- Add backend-powered promotion management
- Improve admin create/edit workflows

## Presentation Script

Hello everyone, today I would like to introduce my project: **Cinema Ticket Booking App**.

This is a mobile application built with Expo and React Native. The app simulates a complete cinema ticket booking experience for customers and also includes an admin area for cinema staff.

On the customer side, users can browse movies, view details, select showtimes, choose seats, complete a mock payment, and view their tickets with QR codes. The app also includes a fake AI assistant screen that demonstrates future smart features such as movie recommendations, snack suggestions, seat recommendations, and movie night planning.

On the admin side, the app includes a dashboard and management screens for movies, promotions, bookings, and showtimes. These admin screens currently use local mock data, which makes the project easy to demonstrate without depending on a backend.

The app previously used Firebase, but Firebase has been removed from the runtime because the backend is planned to be replaced. For now, the application uses local mock data and a guest user mode. This allows the UI and app flow to work smoothly without backend errors.

The main technology stack includes Expo SDK 54, React Native, React, TypeScript, React Navigation, Expo Vector Icons, Reanimated, and local mock data.

Overall, this project demonstrates a full mobile cinema booking prototype with customer features, admin features, fake AI interfaces, QR tickets, mock payments, and a clean custom UI.

## Closing Summary

Cinema Ticket Booking App is currently a complete frontend prototype. It focuses on user experience, navigation, UI structure, booking flow, ticket display, admin management, and future AI/backend readiness.

The project is ready to be connected to a new backend when the replacement system is available.
