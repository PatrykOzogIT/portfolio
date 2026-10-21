# about

**Cookivo** is my non-commercial side project: a full-stack app for planning meals and managing recipes, shopping and household stock. It works out your daily needs, plans meals, takes allergies and what’s in your fridge into account, and then builds the shopping list.

Ten features powered by large language models (LLMs) read recipes, receipts and labels from photos and build meal plans and cooking schedules — always as a draft the user approves.

The app is live at [cookivo.pl](https://cookivo.pl) and is **under active development**. Without an account you can browse public recipes, the ingredient catalogue and the needs calculator. Everything else requires an account.

# problem

Meal planning is usually spread across several tools: a calorie calculator, recipe notes, a separate shopping list, and remembering who in the household can't eat what. Cookivo turns this into a single flow:

1. A **goal**: daily needs calculated with an established equation.
2. **Recipes** with nutrition and allergens calculated automatically.
3. A **weekly plan** with portions for each household member.
4. A **shopping list**, minus what is already in the fridge.

Nutrition values are never typed in by hand. They follow from a recipe's ingredients, so changing an ingredient or an amount immediately updates calories, macros and the allergen list.

# features

## Planning, recipes and shopping

- **Needs calculator**:
  - the Mifflin-St Jeor equation;
  - an activity factor from 1.2 to 1.9;
  - a goal: cut, mild cut, maintain or bulk;
  - a macronutrient split.
- **Recipes**:
  - private, public, shared with the household or with selected friend groups;
  - sub-recipes, e.g. a sauce used in several dishes;
  - nutrition and allergens calculated from the ingredients;
  - a step-by-step cooking mode;
  - photos.
- **Ingredient catalogue**: over 580 items from the USDA and Ciqual databases, with values per 100 g, the 14 EU allergens and kitchen unit conversions; new ingredients are still being added.
- **Weekly planner**: batch cooking and portions tailored to each household member.
- **Households**: invitations to plan together, with members' allergies taken into account in suggestions.
- **Friend groups**: joining a group after its owner's approval and sharing recipes with selected groups.
- **Fridge (household stock)** with expiry dates.
- **Shopping lists** from the plan or from a single recipe, minus what is in the fridge; topped up with regularly bought products based on purchase history.
- **Price lists** with price history, and cost estimates per serving, recipe and plan.
- **Community**: ratings and recipe variants, content reports and a moderation queue.
- **Admin panel**: roles (guest, user, admin, super admin) and account blocking.
- **Privacy (GDPR)**: data export and account deletion.
- **Interface**:
  - Polish and English;
  - six colour themes, including high contrast;
  - mobile-first, with bottom navigation on phones.

## AI features (LLM)

- **Recipe import from photos** — 1–3 photos of a cookbook page, a handwritten note or a screenshot become an editable draft.
- **Receipts to fridge and price list** — receipt items go to household stock, the price list and price history once approved.
- **Ingredient from a label photo** — nutrition and allergens converted to per-100 g values, with a possible-duplicate warning.
- **Assistant** — plain-language requests routed to the right task; off-topic requests are declined.
- **Planner with preferences and budget** — a 1–7 day plan from the user’s recipes, with batch cooking and cost per serving.
- **Recipes from the fridge** — up to five suggestions, prioritising items close to their expiry date.
- **Recipe variants** — e.g. vegan, gluten-free or lighter, with each change explained.
- **Shopping list dictation** — speech or pasted text turned into list items.
- **“I don’t have it” substitutes** — 1–3 substitutes while cooking, using what’s in the fridge and avoiding flagged allergens.
- **Cooking schedule for several dishes** — one sequence of steps across multiple recipes.

# architecture

## Frontend

Angular 22 in the modern model:

- standalone components;
- signals;
- zoneless change detection.

The UI is built with Angular Material 3 and a custom theme. Transloco handles the Polish and English translations.

## Backend

NestJS split into domain modules, including recipes, ingredients, planner, fridge, shopping, prices, receipts, labels, assistant, households, groups, moderation and accounts. Data access goes through Prisma, and the database is PostgreSQL. The schema evolves through versioned migrations.

## AI architecture

All AI features share one Claude API integration layer, and the model is used where it adds real value: interpreting photos, text and preferences. It is not an agent — each task is a single model call, and deterministic application code does the rest.

- **Structured outputs + Zod** — every response follows an enforced schema; no free-form text parsing.
- **AI separated from business logic** — the model interprets and selects; the backend calculates prices, nutrition, schedule times and shopping lists, and persists the result.
- **Hallucination control** — the model picks existing recipe, step and unit codes, and the server rejects unknown ones; anything unreadable stays empty rather than guessed.
- **Human in the loop** — results land in editable drafts; the user saves plans, shopping lists, receipts and recipes.
- **Cost control** — Haiku for reading and selection, Sonnet for variants and scheduling, prompt caching for static context, image downscaling (sharp), daily and monthly limits and token tracking.
- **Receipt match memory** — user-approved item matches are remembered, so the same products don’t need to be recognised again.
- **Security** — user text and text in photos are treated as data only, with prompt-injection defenses.
- **Privacy and testing** — photos are stripped of metadata and never stored; calorie targets and allergens reach the model only with health-data consent; unit, integration and E2E tests run without paid model calls.

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

## Cooking several dishes at once

Cooking several dishes at once is a sequencing problem: what to start first, and what to do while something is in the oven. The model (Sonnet) proposes the order of all steps and the hands-on times, but **the server calculates the clock times**, enforcing rules the model might not keep:

- one person does one hands-on task at a time;
- a dish’s next step starts only after the previous step’s background time (baking, simmering);
- steps within each dish always follow the recipe order.

## Receipts: from photo to price list

The model reads the receipt lines, but the amounts are calculated in code: each line becomes “N packages × package size at a price”, in cents. Quantity, price and total mismatches, missing prices and missing package sizes are flagged for review. Lines are matched to the ingredient database with the help of the match memory, and approval writes the fridge, the price list and the price history in a single transaction.

## A database behind a blocked port

The hosting blocks outbound connections on port 5432, so the API cannot reach PostgreSQL the usual way.

The solution:

- in production, Prisma uses the Neon adapter, which connects to the database over WebSocket on port 443;
- locally and in tests, a plain TCP connection is used;
- an environment variable selects the driver, so the application code is shared.

## Nutrition data that matches EU labels

Ingredient nutrition comes from two public databases: the US USDA FoodData Central and the French ANSES Ciqual. Each has its own import tool, and the result must match the EU food-label standard:

- **USDA** follows the US standard, so the import converts the data: carbohydrates exclude fibre, salt is derived from sodium;
- **Ciqual** already uses the EU standard but contains non-numeric values (e.g. “traces”, “below the detection limit”), which the import maps by fixed rules — missing data stays missing, never zero.

On top of that come Polish names, categories, allergens and typical portion weights, such as pieces or tablespoons. The source is recorded for every ingredient, and the catalogue keeps growing in new batches.

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
