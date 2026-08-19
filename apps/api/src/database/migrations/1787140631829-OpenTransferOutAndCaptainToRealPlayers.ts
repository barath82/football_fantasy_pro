import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Transfer-out and captain move from the fictional mock-squad string ids to
 * real player FKs, matching transfer-in and the differential picks. Trimmed
 * by hand from the raw `migration:generate` output for the same reason as
 * the previous migration — TypeORM wants to drop/recreate every FK on 7
 * unrelated tables over a naming-convention mismatch with the hand-authored
 * initial migration. No real picks existed yet (checked before running),
 * so this is a plain column swap, no data migration needed.
 */
export class OpenTransferOutAndCaptainToRealPlayers1787140631829 implements MigrationInterface {
    name = 'OpenTransferOutAndCaptainToRealPlayers1787140631829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "picks" DROP COLUMN "transfer_out_mock_id"`);
        await queryRunner.query(`ALTER TABLE "picks" DROP COLUMN "captain_mock_id"`);
        await queryRunner.query(`ALTER TABLE "picks" ADD "transfer_out_player_id" integer`);
        await queryRunner.query(`ALTER TABLE "picks" ADD "captain_player_id" integer`);
        await queryRunner.query(`ALTER TABLE "picks" ADD CONSTRAINT "FK_19f9b5a31c8d55cccd4c85464fb" FOREIGN KEY ("transfer_out_player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "picks" ADD CONSTRAINT "FK_c91ebe17a1f32326af94bc4838f" FOREIGN KEY ("captain_player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "picks" DROP CONSTRAINT "FK_c91ebe17a1f32326af94bc4838f"`);
        await queryRunner.query(`ALTER TABLE "picks" DROP CONSTRAINT "FK_19f9b5a31c8d55cccd4c85464fb"`);
        await queryRunner.query(`ALTER TABLE "picks" DROP COLUMN "captain_player_id"`);
        await queryRunner.query(`ALTER TABLE "picks" DROP COLUMN "transfer_out_player_id"`);
        await queryRunner.query(`ALTER TABLE "picks" ADD "captain_mock_id" character varying`);
        await queryRunner.query(`ALTER TABLE "picks" ADD "transfer_out_mock_id" character varying`);
    }

}
