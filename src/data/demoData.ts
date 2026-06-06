import { format } from "date-fns";

export type DemoMovie = {
  id: string;
  title: string;
  genre: string;
  duration: number;
  rating: number;
  releaseDate: string;
  endDate: string;
  posterUrl: string;
  backdropUrl: string;
  synopsis: string;
  cast: string;
  director: string;
  trailerUrl?: string;
};

export type DemoShowtime = {
  id: string;
  movieId: string;
  date: string;
  time: string;
  screen: string;
};

export type DemoSeat = {
  id: string;
  row: string;
  number: number;
  status: "available" | "booked";
  type: "standard" | "premium" | "vip";
  price: number;
};

const today = new Date();
const inDays = (days: number) => {
  const date = new Date(today);
  date.setDate(today.getDate() + days);
  return format(date, "yyyy-MM-dd");
};

export const demoMovies: DemoMovie[] = [
  {
    id: "demo-movie-1",
    title: "Midnight Premiere",
    genre: "Thriller",
    duration: 128,
    rating: 8.7,
    releaseDate: inDays(-14),
    endDate: inDays(21),
    posterUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    backdropUrl:
      "https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=1200&q=80",
    synopsis:
      "A late-night film festival turns into a tense race through the city when a missing reel reveals a secret everyone wants buried.",
    cast: "Maya Tran, Lucas Reed, Anika Stone",
    director: "Nolan Pierce",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "demo-movie-2",
    title: "Neon Skies",
    genre: "Sci-Fi",
    duration: 141,
    rating: 9.1,
    releaseDate: inDays(-4),
    endDate: inDays(28),
    posterUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    backdropUrl:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    synopsis:
      "A pilot, a cartographer, and a rogue AI cross a luminous frontier to find the last habitable station above Earth.",
    cast: "Elliot Vale, Sana Imani, Theo Park",
    director: "Iris Chen",
  },
  {
    id: "demo-movie-3",
    title: "Table for Two",
    genre: "Romance",
    duration: 106,
    rating: 8.2,
    releaseDate: inDays(-8),
    endDate: inDays(18),
    posterUrl:
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80",
    backdropUrl:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    synopsis:
      "Two chefs compete for the same dream restaurant and discover that the best recipes are written together.",
    cast: "Clara Moore, Ben Adler, Sofia Kim",
    director: "Amelia Brooks",
  },
  {
    id: "demo-movie-4",
    title: "The Last Lighthouse",
    genre: "Adventure",
    duration: 119,
    rating: 8.5,
    releaseDate: inDays(10),
    endDate: inDays(45),
    posterUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    backdropUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    synopsis:
      "A cartographer returns to a remote island and follows a coded light signal toward a discovery that changes the coastline forever.",
    cast: "Jon Ellis, Priya Rao, Marcus Hale",
    director: "Rowan Hart",
  },
];

export const demoPromotions = [
  {
    id: "demo-promo-1",
    articleId: "demo-article-1",
    title: "Weekend Premiere Pass",
    imageUrl:
      "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "demo-promo-2",
    articleId: "demo-article-2",
    title: "Date Night Combo",
    imageUrl:
      "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=1200&q=80",
  },
];

export const demoArticles = [
  {
    id: "demo-article-1",
    title: "Weekend Premiere Pass",
    imageUrl:
      "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=1200&q=80",
    createdAt: { seconds: Math.floor(Date.now() / 1000) },
    content:
      "Enjoy a curated weekend lineup with priority seating, a large popcorn, and two signature drinks included. This mock promotion is available while the backend is being replaced.",
  },
  {
    id: "demo-article-2",
    title: "Date Night Combo",
    imageUrl:
      "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=1200&q=80",
    createdAt: { seconds: Math.floor(Date.now() / 1000) },
    content:
      "Book two premium seats and get a snack combo upgrade at checkout. This local article keeps the app previewable without Firebase.",
  },
];

export const getDemoArticle = (articleId: string) =>
  demoArticles.find((article) => article.id === articleId) ?? demoArticles[0];

export const demoPaymentMethods = [
  {
    id: "mock-card-1",
    cardNumber: "4242 4242 4242 4242",
    cardholderName: "Guest Customer",
    expiryDate: "12/29",
    isDefault: true,
  },
  {
    id: "mock-card-2",
    cardNumber: "5555 5555 5555 4444",
    cardholderName: "Guest Customer",
    expiryDate: "08/28",
    isDefault: false,
  },
];

export const getDemoMovie = (movieId: string) =>
  demoMovies.find((movie) => movie.id === movieId) ?? demoMovies[0];

export const getDemoShowtimes = (movieId: string, date: Date): DemoShowtime[] =>
  ["10:30", "13:45", "17:10", "20:30", "22:15"].map((time, index) => ({
    id: `demo-showtime-${movieId}-${format(date, "yyyyMMdd")}-${index}`,
    movieId,
    date: format(date, "yyyy-MM-dd"),
    time,
    screen: String((index % 4) + 1),
  }));

export const getDemoShowtime = (movieId: string, showtimeId: string) => {
  const dateToken = showtimeId.split("-").at(-2);
  const date =
    dateToken && dateToken.length === 8
      ? `${dateToken.slice(0, 4)}-${dateToken.slice(4, 6)}-${dateToken.slice(6)}`
      : inDays(0);
  return {
    id: showtimeId,
    movieId,
    date,
    time: "20:30",
    screen: "2",
  };
};

export const getDemoSeats = (showtimeId: string): DemoSeat[] => {
  const rows = ["A", "B", "C", "D", "E", "F"];
  return rows.flatMap((row, rowIndex) =>
    Array.from({ length: 8 }, (_, index) => {
      const number = index + 1;
      const type = rowIndex > 3 ? "vip" : rowIndex > 1 ? "premium" : "standard";
      return {
        id: `${showtimeId}-${row}${number}`,
        row,
        number,
        status: (rowIndex === 1 && number === 4) || (rowIndex === 3 && number === 7)
          ? "booked"
          : "available",
        type,
        price: type === "vip" ? 22 : type === "premium" ? 18 : 14,
      };
    })
  );
};

export const demoTickets = [
  {
    id: "demo-ticket-1",
    reference: "CINE2026",
    totalPrice: 36,
    createdAt: { seconds: Math.floor(Date.now() / 1000) },
    movie: demoMovies[0],
    showtime: {
      id: "demo-ticket-showtime",
      movieId: demoMovies[0].id,
      date: inDays(0),
      time: "20:30",
      screen: "2",
    },
    seats: [
      { id: "demo-seat-c4", row: "C", number: 4 },
      { id: "demo-seat-c5", row: "C", number: 5 },
    ],
  },
];
