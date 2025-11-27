import {
  pgTable,
  uuid,
  text,
  doublePrecision,
  decimal,
  date,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const cinemas = pgTable("cinemas", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  brand: text("brand"), // CGV, 메가박스, 롯데시네마 등
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const watches = pgTable("watches", {
  id: uuid("id").primaryKey().defaultRandom(),
  cinemaId: uuid("cinema_id")
    .references(() => cinemas.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id"),
  movieTitle: text("movie_title").notNull(),
  genre: text("genre"),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  comment: text("comment"),
  posterUrl: text("poster_url"),
  watchedAt: date("watched_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cinemasRelations = relations(cinemas, ({ many }) => ({
  watches: many(watches),
}));

export const watchesRelations = relations(watches, ({ one }) => ({
  cinema: one(cinemas, {
    fields: [watches.cinemaId],
    references: [cinemas.id],
  }),
}));

export type Cinema = typeof cinemas.$inferSelect;
export type NewCinema = typeof cinemas.$inferInsert;
export type Watch = typeof watches.$inferSelect;
export type NewWatch = typeof watches.$inferInsert;
