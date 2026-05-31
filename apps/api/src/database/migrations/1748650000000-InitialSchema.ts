import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1748650000000 implements MigrationInterface {
  name = 'InitialSchema1748650000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "seasons" (
        "id" SERIAL PRIMARY KEY,
        "year" VARCHAR(9) NOT NULL UNIQUE,
        "fpl_season_id" INT,
        "is_current" BOOLEAN NOT NULL DEFAULT FALSE,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "positions" (
        "id" SERIAL PRIMARY KEY,
        "fpl_id" INT NOT NULL UNIQUE,
        "singular_name" VARCHAR(50) NOT NULL,
        "singular_name_short" VARCHAR(5) NOT NULL,
        "plural_name" VARCHAR(50) NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "teams" (
        "id" SERIAL PRIMARY KEY,
        "fpl_id" INT NOT NULL,
        "season_id" INT NOT NULL REFERENCES "seasons"("id"),
        "name" VARCHAR(100) NOT NULL,
        "short_name" VARCHAR(10) NOT NULL,
        "code" INT,
        "strength_overall_home" INT,
        "strength_overall_away" INT,
        "strength_attack_home" INT,
        "strength_attack_away" INT,
        "strength_defence_home" INT,
        "strength_defence_away" INT,
        UNIQUE ("fpl_id", "season_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "players" (
        "id" SERIAL PRIMARY KEY,
        "fpl_id" INT NOT NULL,
        "season_id" INT NOT NULL REFERENCES "seasons"("id"),
        "team_id" INT NOT NULL REFERENCES "teams"("id"),
        "position_id" INT NOT NULL REFERENCES "positions"("id"),
        "first_name" VARCHAR(100) NOT NULL,
        "second_name" VARCHAR(100) NOT NULL,
        "web_name" VARCHAR(100) NOT NULL,
        "code" INT,
        "status" VARCHAR(1) NOT NULL DEFAULT 'a',
        "news" TEXT,
        "now_cost" INT,
        "cost_change_start" INT,
        "cost_change_event" INT,
        "selected_by_percent" DECIMAL(6,2),
        "total_points" INT NOT NULL DEFAULT 0,
        "points_per_game" DECIMAL(6,2),
        "form" DECIMAL(6,2),
        "value_form" DECIMAL(6,2),
        "value_season" DECIMAL(6,2),
        "minutes" INT NOT NULL DEFAULT 0,
        "goals_scored" INT NOT NULL DEFAULT 0,
        "assists" INT NOT NULL DEFAULT 0,
        "clean_sheets" INT NOT NULL DEFAULT 0,
        "goals_conceded" INT NOT NULL DEFAULT 0,
        "own_goals" INT NOT NULL DEFAULT 0,
        "penalties_saved" INT NOT NULL DEFAULT 0,
        "penalties_missed" INT NOT NULL DEFAULT 0,
        "yellow_cards" INT NOT NULL DEFAULT 0,
        "red_cards" INT NOT NULL DEFAULT 0,
        "saves" INT NOT NULL DEFAULT 0,
        "bonus" INT NOT NULL DEFAULT 0,
        "bps" INT NOT NULL DEFAULT 0,
        "influence" DECIMAL(10,2),
        "creativity" DECIMAL(10,2),
        "threat" DECIMAL(10,2),
        "ict_index" DECIMAL(10,2),
        "transfers_in" INT NOT NULL DEFAULT 0,
        "transfers_out" INT NOT NULL DEFAULT 0,
        "transfers_in_event" INT NOT NULL DEFAULT 0,
        "transfers_out_event" INT NOT NULL DEFAULT 0,
        "dreamteam_count" INT NOT NULL DEFAULT 0,
        "in_dreamteam" BOOLEAN NOT NULL DEFAULT FALSE,
        UNIQUE ("fpl_id", "season_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "gameweeks" (
        "id" SERIAL PRIMARY KEY,
        "fpl_id" INT NOT NULL,
        "season_id" INT NOT NULL REFERENCES "seasons"("id"),
        "name" VARCHAR(50) NOT NULL,
        "deadline_time" TIMESTAMP,
        "average_entry_score" INT,
        "highest_score" INT,
        "highest_scoring_entry" INT,
        "finished" BOOLEAN NOT NULL DEFAULT FALSE,
        "data_checked" BOOLEAN NOT NULL DEFAULT FALSE,
        "is_current" BOOLEAN NOT NULL DEFAULT FALSE,
        "is_next" BOOLEAN NOT NULL DEFAULT FALSE,
        "is_previous" BOOLEAN NOT NULL DEFAULT FALSE,
        "chip_plays" JSONB,
        "most_selected" INT,
        "most_transferred_in" INT,
        "top_element" INT,
        "transfers_made" INT,
        UNIQUE ("fpl_id", "season_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "fixtures" (
        "id" SERIAL PRIMARY KEY,
        "fpl_id" INT NOT NULL UNIQUE,
        "season_id" INT NOT NULL REFERENCES "seasons"("id"),
        "gameweek_id" INT REFERENCES "gameweeks"("id"),
        "team_h_id" INT NOT NULL REFERENCES "teams"("id"),
        "team_a_id" INT NOT NULL REFERENCES "teams"("id"),
        "team_h_score" INT,
        "team_a_score" INT,
        "kickoff_time" TIMESTAMP,
        "finished" BOOLEAN NOT NULL DEFAULT FALSE,
        "finished_provisional" BOOLEAN NOT NULL DEFAULT FALSE,
        "started" BOOLEAN,
        "team_h_difficulty" INT,
        "team_a_difficulty" INT,
        "pulse_id" INT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "player_gameweek_stats" (
        "id" SERIAL PRIMARY KEY,
        "player_id" INT NOT NULL REFERENCES "players"("id"),
        "gameweek_id" INT NOT NULL REFERENCES "gameweeks"("id"),
        "fixture_id" INT REFERENCES "fixtures"("id"),
        "minutes" INT NOT NULL DEFAULT 0,
        "goals_scored" INT NOT NULL DEFAULT 0,
        "assists" INT NOT NULL DEFAULT 0,
        "clean_sheets" INT NOT NULL DEFAULT 0,
        "goals_conceded" INT NOT NULL DEFAULT 0,
        "own_goals" INT NOT NULL DEFAULT 0,
        "penalties_saved" INT NOT NULL DEFAULT 0,
        "penalties_missed" INT NOT NULL DEFAULT 0,
        "yellow_cards" INT NOT NULL DEFAULT 0,
        "red_cards" INT NOT NULL DEFAULT 0,
        "saves" INT NOT NULL DEFAULT 0,
        "bonus" INT NOT NULL DEFAULT 0,
        "bps" INT NOT NULL DEFAULT 0,
        "influence" DECIMAL(10,2),
        "creativity" DECIMAL(10,2),
        "threat" DECIMAL(10,2),
        "ict_index" DECIMAL(10,2),
        "total_points" INT NOT NULL DEFAULT 0,
        "value" INT,
        "transfers_balance" INT,
        "selected" INT,
        "transfers_in" INT,
        "transfers_out" INT,
        "round" INT,
        "was_home" BOOLEAN,
        UNIQUE ("player_id", "gameweek_id", "fixture_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ownership_snapshots" (
        "id" SERIAL PRIMARY KEY,
        "player_id" INT NOT NULL REFERENCES "players"("id"),
        "gameweek_id" INT NOT NULL REFERENCES "gameweeks"("id"),
        "selected_by_percent" DECIMAL(6,2),
        "transfers_in" INT,
        "transfers_out" INT,
        UNIQUE ("player_id", "gameweek_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "price_history" (
        "id" SERIAL PRIMARY KEY,
        "player_id" INT NOT NULL REFERENCES "players"("id"),
        "gameweek_id" INT NOT NULL REFERENCES "gameweeks"("id"),
        "price" INT,
        UNIQUE ("player_id", "gameweek_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "api_sync_log" (
        "id" SERIAL PRIMARY KEY,
        "endpoint" VARCHAR(200) NOT NULL,
        "status" VARCHAR(20) NOT NULL,
        "records_processed" INT,
        "error_message" TEXT,
        "duration_ms" INT,
        "synced_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Indexes for common query patterns
    await queryRunner.query(`CREATE INDEX "idx_players_team" ON "players"("team_id")`);
    await queryRunner.query(`CREATE INDEX "idx_players_position" ON "players"("position_id")`);
    await queryRunner.query(`CREATE INDEX "idx_players_season" ON "players"("season_id")`);
    await queryRunner.query(`CREATE INDEX "idx_players_total_points" ON "players"("total_points" DESC)`);
    await queryRunner.query(`CREATE INDEX "idx_players_form" ON "players"("form" DESC)`);
    await queryRunner.query(`CREATE INDEX "idx_pgs_gameweek" ON "player_gameweek_stats"("gameweek_id")`);
    await queryRunner.query(`CREATE INDEX "idx_pgs_player" ON "player_gameweek_stats"("player_id")`);
    await queryRunner.query(`CREATE INDEX "idx_fixtures_gameweek" ON "fixtures"("gameweek_id")`);
    await queryRunner.query(`CREATE INDEX "idx_fixtures_kickoff" ON "fixtures"("kickoff_time")`);
    await queryRunner.query(`CREATE INDEX "idx_ownership_player" ON "ownership_snapshots"("player_id")`);
    await queryRunner.query(`CREATE INDEX "idx_price_history_player" ON "price_history"("player_id")`);
    await queryRunner.query(`CREATE INDEX "idx_sync_log_endpoint" ON "api_sync_log"("endpoint", "synced_at" DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "api_sync_log"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "price_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ownership_snapshots"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "player_gameweek_stats"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fixtures"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gameweeks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "players"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "teams"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "positions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "seasons"`);
  }
}
