import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds `handle` (X's @username, null for Google) and `fpl_team_id`
 * (user-entered, no "connect your team" flow yet). Trimmed by hand from the
 * raw `migration:generate` output for the same reason as the previous two —
 * TypeORM wants to drop/recreate every FK on 7 unrelated tables over a
 * naming-convention mismatch with the hand-authored initial migration.
 */
export class AddUserHandleAndFplTeamId1787146115838 implements MigrationInterface {
    name = 'AddUserHandleAndFplTeamId1787146115838'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "handle" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "fpl_team_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "fpl_team_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "handle"`);
    }

}
