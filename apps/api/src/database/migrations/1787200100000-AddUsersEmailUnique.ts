import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * One email = one account, regardless of provider — added so someone who
 * signed up via Google/X can't also register a separate email/password
 * account under the same email. Postgres allows multiple NULLs under a
 * UNIQUE constraint (X accounts have no email), so this only actually
 * constrains rows that do have one.
 */
export class AddUsersEmailUnique1787200100000 implements MigrationInterface {
  name = 'AddUsersEmailUnique1787200100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_email" UNIQUE ("email")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_users_email"`);
  }
}
