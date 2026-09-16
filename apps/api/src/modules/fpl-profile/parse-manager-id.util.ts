import { BadRequestException } from '@nestjs/common';

/** Shared by every FPL-profile service that needs the linked manager id from `User.fplTeamId`. */
export function parseManagerId(fplTeamId: string | null): number {
  if (!fplTeamId) {
    throw new BadRequestException('Link your FPL team ID first.');
  }
  const id = parseInt(fplTeamId, 10);
  if (!Number.isFinite(id) || id <= 0) {
    throw new BadRequestException('Invalid FPL team ID.');
  }
  return id;
}
