import { nanoid } from "nanoid";
import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(() => /* @__PURE__ */ new Date()),
	updatedAt: timestamp("updated_at").$defaultFn(() => /* @__PURE__ */ new Date()),
});

// ----------------------
// RECIPES
// ----------------------
export const recipes = pgTable("recipes", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text('title').notNull(),
  description: text("description"),
  servings: integer("servings"),
	time: integer("time"), // in minutes
	heroImage: text("hero_image"), // URL to image
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ----------------------
// RECIPE RATINGS
// ----------------------
export const recipeRatings = pgTable("recipe_ratings", {
	id: text("id").primaryKey().$defaultFn(() => nanoid()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	recipeId: text("recipe_id")
		.notNull()
		.references(() => recipes.id, { onDelete: "cascade" }),
	rating: integer("rating").notNull(), // e.g., 1 to 5
});

// ----------------------
// RECIPE INGREDIENT GROUPS
// ----------------------
export const ingredientGroups = pgTable("ingredient_groups", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  name: text('name'), // e.g., "Cake Batter", "Frosting"
  sortOrder: integer("sort_order").default(0),
});

// ----------------------
// INGREDIENTS
// ----------------------
export const ingredients = pgTable("ingredients", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
	groupId: text("group_id")
		.notNull()
		.references(() => ingredientGroups.id, { onDelete: "cascade" }),
  description: text('description').notNull(),
	sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ----------------------
// RECIPE STEPS
// ----------------------
export const recipeSteps = pgTable("recipe_steps", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").default(0),
});