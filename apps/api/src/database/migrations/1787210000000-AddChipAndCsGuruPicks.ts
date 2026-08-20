import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Storage for the two new weekly calls (Chip Guru, CS Guru) — no scoring
 * logic yet, this just makes sure every pick is captured (see MEMORY.md).
 */
export class AddChipAndCsGuruPicks1787210000000 implements MigrationInterface {
  name = 'AddChipAndCsGuruPicks1787210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "picks" ADD "chip_pick" varchar`);
    await queryRunner.query(`ALTER TABLE "picks" ADD "cs_succeed_team_id" integer`);
    await queryRunner.query(`ALTER TABLE "picks" ADD "cs_fail_team_id" integer`);

    await queryRunner.query(`
      ALTER TABLE "picks" ADD CONSTRAINT "FK_picks_cs_succeed_team"
        FOREIGN KEY ("cs_succeed_team_id") REFERENCES "teams"("id")
    `);
    await queryRunner.query(`
      ALTER TABLE "picks" ADD CONSTRAINT "FK_picks_cs_fail_team"
        FOREIGN KEY ("cs_fail_team_id") REFERENCES "teams"("id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "picks" DROP CONSTRAINT "FK_picks_cs_fail_team"`);
    await queryRunner.query(`ALTER TABLE "picks" DROP CONSTRAINT "FK_picks_cs_succeed_team"`);
    await queryRunner.query(`ALTER TABLE "picks" DROP COLUMN "cs_fail_team_id"`);
    await queryRunner.query(`ALTER TABLE "picks" DROP COLUMN "cs_succeed_team_id"`);
    await queryRunner.query(`ALTER TABLE "picks" DROP COLUMN "chip_pick"`);
  }
}
