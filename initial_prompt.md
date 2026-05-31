Here’s the updated prompt with the architecture shifted to:

* React web app
* PWA support
* no React Native for now
* future mobile compatibility kept in mind

This version is much more aligned with your current MVP goal.

You are a senior full-stack architect and lead engineer.

We are building the MVP of a fantasy football intelligence platform focused ONLY on English Premier League (EPL) Fantasy Premier League (FPL) data.

IMPORTANT CONTEXT
This is NOT a fantasy team builder app.
This is NOT a betting app.
This is NOT a social network initially.

The goal is to build:

* a fantasy analytics + intelligence dashboard
* similar in spirit to FantasyPros
* optimized for EPL fantasy users
* focused on structured stats, filtering, comparisons, weekly insights, trends, and eventually expert recommendation scoring.

This MVP is mainly for:

1. exploring what is possible with the public FPL API
2. understanding data availability and limitations
3. building a scalable modular architecture
4. enabling rapid iteration before professional UI/UX design
5. creating a strong backend data model for future fantasy intelligence features

====================================================
TECH STACK
==========

Frontend:

* React web application
* Typescript mandatory
* PWA support mandatory
* Mobile responsive design mandatory
* Use modern scalable React architecture
* Use component-driven design

Backend:

* NestJS
* Typescript mandatory

Database:

* PostgreSQL

Architecture:

* Monorepo preferred
* Frontend + backend in single project/repository
* Modular architecture mandatory

====================================================
IMPORTANT FRONTEND REQUIREMENT
==============================

DO NOT build a mobile native app right now.

This first version is:

* Web-first
* Desktop-first for heavy dashboards/tables
* PWA-enabled
* Mobile responsive

Future versions MAY include:

* React Native mobile apps
* Native mobile-specific experiences

Therefore:

* frontend architecture should be future-friendly
* business logic should be reusable
* avoid frontend decisions that tightly couple us to desktop-only assumptions

====================================================
CORE PRODUCT IDEA
=================

The platform should function as a fantasy intelligence dashboard.

Users should be able to:

* browse EPL fantasy players
* filter and sort players extensively
* inspect weekly performance
* inspect trends
* compare players
* simulate weekly fantasy views
* analyze historical data
* understand what happened in a specific gameweek

The UI should initially focus on:

* highly usable tables
* rich filtering
* dashboards
* cards
* charts
* sortable metrics
* fast navigation

DO NOT focus heavily on final polished UI/UX yet.
This phase is mainly about:

* data exploration
* API understanding
* dashboard experimentation
* backend design
* scalability

====================================================
VERY IMPORTANT SEASON REQUIREMENT
=================================

The current EPL season is over.

We need to simulate live weekly operation using historical season data.

Use:

* 2025-26 season data
  OR latest fully available season from FPL API

The app MUST support:

* Gameweek selector
* Week-by-week simulation

Example:

* Gameweek 1
* Gameweek 2
* Gameweek 3
  etc.

When selecting a gameweek:

* all dashboards
* tables
* rankings
* stats
  must update as if the app was operating live during that week.

This is CRITICAL.

We are effectively creating:
"a replayable fantasy season dashboard."

====================================================
DATA SOURCE
===========

Primary API:
Official public FPL API

We want to explore ALL possible useful data available from:

* bootstrap-static
* fixtures
* event/{id}/live
* element-summary/{player_id}
  and any other relevant endpoints.

The backend should:

* fetch
* normalize
* cache
* store
  all relevant data into PostgreSQL.

DO NOT directly connect frontend to FPL API.

====================================================
IMPORTANT ARCHITECTURAL REQUIREMENTS
====================================

Build EVERYTHING modularly.

We expect:

* features to change frequently
* dashboards to evolve
* filters to change
* metrics to change
* cards/widgets to be added/removed
* future paid APIs to replace free APIs

Therefore:

1. Strong separation of concerns required
2. Avoid tight coupling
3. Build reusable services
4. Build reusable UI components
5. Build reusable query/filter systems
6. Build reusable stat-card architecture
7. Use config-driven approaches wherever possible

====================================================
CONFIGURATION REQUIREMENTS
==========================

As much as possible:

* avoid hardcoded values
* use config files
* use enums/constants
* use metadata-driven configuration

Examples:

* stat definitions
* table columns
* filters
* chart configs
* gameweek configs
* ranking weights
* feature toggles

should ideally be configurable.

====================================================
FUTURE SCALABILITY REQUIREMENTS
===============================

The architecture should be future-proof for:

* expert recommendation engine
* expert rankings
* consensus picks
* captain recommendations
* differential rankings
* AI-generated summaries
* premium dashboards
* API provider replacement
* multiple leagues
* cricket support later
* advanced stats providers later
* user accounts
* saved filters
* subscriptions

Do NOT implement these now.
But architecture should not block future implementation.

====================================================
DATABASE REQUIREMENTS
=====================

Design normalized PostgreSQL schema for:

* players
* teams
* fixtures
* gameweeks
* player gameweek stats
* player historical stats
* ownership
* transfers
* injuries if available
* player price history if possible
* derived metrics
* cached API payloads

Need proper indexing strategy.

====================================================
BACKEND REQUIREMENTS
====================

NestJS backend should include:

* modular architecture
* scheduled sync jobs
* API normalization layer
* caching layer
* data ingestion services
* transformation services
* REST APIs for frontend
* pagination
* filtering
* sorting
* query optimization

Need recommendation on:

* cron jobs
* caching strategy
* background jobs
* queueing if needed
* API rate limiting protection

====================================================
FRONTEND REQUIREMENTS
=====================

Build an initial fantasy dashboard web app.

Important:
This is NOT final UI design.

We want:

* functional
* modern
* clean
* modular
* responsive
* easy to iterate

Use modern React ecosystem best practices.

Need recommendations for:

* routing
* state management
* API data fetching
* caching
* table libraries
* chart libraries
* responsive dashboard architecture
* PWA implementation
* lazy loading
* performance optimization

Features to include:

* Player explorer table
* Team explorer
* Gameweek explorer
* Weekly stats dashboard
* Filters
* Sorting
* Search
* Player detail page
* Fixture difficulty views
* Ownership trends
* Transfer trends
* Comparison views

Possible filters:

* gameweek
* team
* position
* ownership %
* price
* points
* form
* minutes
* goals
* assists
* transfers in/out
* fixture difficulty
* clean sheets
* bonus points
  etc.

====================================================
IMPORTANT MVP PHILOSOPHY
========================

DO NOT over-engineer visually.

Focus on:

1. data understanding
2. backend architecture
3. modularity
4. maintainability
5. speed of iteration
6. scalable foundations

We first want to understand:

* what data exists
* what insights are possible
* what filters are useful
* what dashboards are valuable

Professional UI/UX comes later.

====================================================
DELIVERABLES REQUIRED
=====================

I want you to generate:

1. Complete project architecture
2. Monorepo folder structure
3. PostgreSQL schema design
4. NestJS module structure
5. API ingestion architecture
6. FPL API mapping strategy
7. Backend API design
8. React frontend component hierarchy
9. Config-driven architecture recommendations
10. Weekly historical replay architecture
11. Suggested reusable table/filter architecture
12. Recommended state management
13. Recommended caching strategy
14. PWA architecture recommendations
15. Local development setup
16. Docker setup if useful
17. Environment configuration strategy
18. Example implementations for critical modules
19. Initial MVP screen list
20. Initial dashboard ideas
21. Suggestions for future scalability

IMPORTANT:
Provide actual implementation-level guidance and starter code structure.
Not just high-level theory.

Also:
Clearly explain:

* which parts should be abstracted
* which parts should be configurable
* which parts may become bottlenecks later
* which parts may need refactoring in future

Finally:
Recommend the BEST starting sequence of implementation so we can begin development immediately.

