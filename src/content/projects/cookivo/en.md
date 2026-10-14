# about

**Cookivo** is my non-commercial side project: an app that works out your daily needs, plans meals for the whole week, takes allergies and your pantry into account, and then builds the shopping list.

The app is live at [cookivo.pl](https://cookivo.pl) and is **under active development**. Without an account you can browse the ingredient catalogue and use the needs calculator. Everything else requires an account.

# problem

Meal planning is usually spread across several tools: a calorie calculator, recipe notes, a separate shopping list, and remembering who in the household can't eat what. Cookivo turns this into a single flow:

1. A **goal**: daily needs calculated with an established equation.
2. **Recipes** with nutrition and allergens calculated automatically.
3. A **weekly plan** with portions for each household member.
4. A **shopping list**, minus what is already in the pantry.

Nutrition values are never typed in by hand. They follow from a recipe's ingredients, so changing an ingredient or an amount immediately updates calories, macros and the allergen list.

# features

- **Needs calculator**:
  - the Mifflin-St Jeor equation;
  - an activity factor from 1.2 to 1.9;
  - a goal: cut, mild cut, maintain or bulk;
  - a macronutrient split.
- **Recipes**:
  - public or private;
  - sub-recipes, e.g. a sauce used in several dishes;
  - nutrition and allergens calculated from the ingredients;
  - a step-by-step cooking mode;
  - photos.
- **Ingredient catalogue**: about 350 items with values per 100 g, the 14 EU allergens and kitchen unit conversions.
- **Weekly planner**: batch cooking and portions tailored to each household member.
- **Households**: invitations to plan together, with members' allergies taken into account in suggestions.
- **Pantry** with expiry dates.
- **Shopping lists** from the plan or from a single recipe, minus what is in the pantry.
- **Price lists** and shopping cost estimates.
- **Community**: ratings and recipe variants, content reports and a moderation queue.
- **Admin panel**: roles (guest, user, admin, super admin) and account blocking.
- **Privacy (GDPR)**: data export and account deletion.
- **Interface**:
  - Polish and English;
  - light and dark theme;
  - mobile-first, with bottom navigation on phones.

# architecture

## Frontend

Angular 22 in the modern model:

- standalone components;
- signals;
- zoneless change detection.

The UI is built with Angular Material 3 and a custom theme. Transloco handles the Polish and English translations.

## Backend

NestJS split into domain modules, including recipes, ingredients, planner, pantry, shopping, prices, households, moderation and accounts. Data access goes through Prisma, and the database is PostgreSQL. The schema evolves through versioned migrations.

## Environments

- **Locally**, Docker Compose runs PostgreSQL and Mailpit for testing email.
- **In production**:
  - the API runs as a Node.js application under `/api` on shared hosting;
  - the frontend is static files;
  - the database is managed PostgreSQL on Neon (Frankfurt region).

## Quality and deployment

- **Tests**:
  - unit tests with Vitest;
  - end-to-end tests with Playwright, with automated axe-core accessibility audits (WCAG AA).
- **GitHub Actions pipeline**:
  1. runs the database migrations;
  2. uploads the files over FTPS;
  3. restarts the Node.js application;
  4. finally checks that the deployed version responds (smoke test).

# challenges

## A database behind a blocked port

The hosting blocks outbound connections on port 5432, so the API cannot reach PostgreSQL the usual way.

The solution:

- in production, Prisma uses the Neon adapter, which connects to the database over WebSocket on port 443;
- locally and in tests, a plain TCP connection is used;
- an environment variable selects the driver, so the application code is shared.

## Nutrition data that matches EU labels

Ingredient nutrition comes from the public USDA FoodData Central database. The US standard differs from the European one, so a custom import tool converts the data to the EU food-label standard:

- carbohydrates exclude fibre;
- salt is derived from sodium.

On top of that come Polish names, categories, allergens and typical portion weights, such as pieces or tablespoons.

## Recipes made of recipes

A recipe can contain other recipes, so nutrition and allergens are calculated recursively. The backend:

- detects cycles, i.e. a recipe that indirectly contains itself;
- limits the nesting depth;
- converts kitchen units and volumes to grams.

## Account security

- **Tokens**:
  - a short-lived access token (15 minutes);
  - a rotating refresh token in an `httpOnly` cookie;
  - detection of a reused old refresh token.
- **Login protection**: a temporary account lock after 5 failed attempts.
- **Password policy**:
  - a password strength check;
  - a Have I Been Pwned breach check using k-anonymity (the password never leaves the server).
- **Photo privacy**: uploaded photos are re-encoded to WebP in three sizes, with metadata (including GPS location) stripped.
