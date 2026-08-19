import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds `users` and `picks`. Trimmed by hand from the raw `migration:generate`
 * output — TypeORM's generator also wanted to drop and recreate every FK
 * constraint on 7 unrelated tables (fixtures, player_gameweek_stats,
 * ownership_snapshots, price_history, players, teams, gameweeks), purely
 * because their constraint names don't match TypeORM's naming convention
 * (they were hand-authored in the original migration). Functionally a no-op
 * either way, but needless churn/risk on tables this change has nothing to
 * do with — left untouched.
 */
export class AddUsersAndPicks1787124466534 implements MigrationInterface {
    name = 'AddUsersAndPicks1787124466534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider" character varying(20) NOT NULL, "provider_id" character varying NOT NULL, "display_name" character varying NOT NULL, "email" character varying, "avatar_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9c126dfdc9977c5a43780494471" UNIQUE ("provider", "provider_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "picks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "gameweek_id" integer NOT NULL, "transfer_in_player_id" integer, "transfer_out_mock_id" character varying, "differential_succeed_player_id" integer, "differential_blank_player_id" integer, "formation" character varying, "captain_mock_id" character varying, "submitted_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ea0b441d74862c6098a02fb97c5" UNIQUE ("user_id", "gameweek_id"), CONSTRAINT "PK_3e9953ba017bf0d7b7cdde41718" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "picks" ADD CONSTRAINT "FK_a2040fde049a1c569e835b9409b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "picks" ADD CONSTRAINT "FK_bdbf9d348ce4fdfde49f44303b4" FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "picks" ADD CONSTRAINT "FK_016389f9bc94baf4d07ca52fc7b" FOREIGN KEY ("transfer_in_player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "picks" ADD CONSTRAINT "FK_ed0cb44b44cd7bf57ce9d9de9ac" FOREIGN KEY ("differential_succeed_player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "picks" ADD CONSTRAINT "FK_59e754f8d106e728eb43308fc0a" FOREIGN KEY ("differential_blank_player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "picks" DROP CONSTRAINT "FK_59e754f8d106e728eb43308fc0a"`);
        await queryRunner.query(`ALTER TABLE "picks" DROP CONSTRAINT "FK_ed0cb44b44cd7bf57ce9d9de9ac"`);
        await queryRunner.query(`ALTER TABLE "picks" DROP CONSTRAINT "FK_016389f9bc94baf4d07ca52fc7b"`);
        await queryRunner.query(`ALTER TABLE "picks" DROP CONSTRAINT "FK_bdbf9d348ce4fdfde49f44303b4"`);
        await queryRunner.query(`ALTER TABLE "picks" DROP CONSTRAINT "FK_a2040fde049a1c569e835b9409b"`);
        await queryRunner.query(`DROP TABLE "picks"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
