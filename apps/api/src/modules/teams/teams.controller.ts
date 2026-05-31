import { Controller, Get, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Team } from '../../database/entities/team.entity';
import { Season } from '../../database/entities/season.entity';
import { Player } from '../../database/entities/player.entity';

@Controller('teams')
export class TeamsController {
  constructor(
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    @InjectRepository(Season) private readonly seasonRepo: Repository<Season>,
    @InjectRepository(Player) private readonly playerRepo: Repository<Player>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  async findAll() {
    const season = await this.seasonRepo.findOneBy({ isCurrent: true });
    if (!season) return [];
    return this.teamRepo.find({
      where: { seasonId: season.id },
      order: { name: 'ASC' },
      select: ['id', 'fplId', 'name', 'shortName'],
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const season = await this.seasonRepo.findOneBy({ isCurrent: true });
    if (!season) throw new NotFoundException('No current season');

    const team = await this.teamRepo.findOne({
      where: { id, seasonId: season.id },
    });
    if (!team) throw new NotFoundException(`Team ${id} not found`);

    const [topPlayers, posBreakdown] = await Promise.all([
      this.playerRepo.find({
        where: { teamId: id, seasonId: season.id },
        relations: ['position'],
        order: { totalPoints: 'DESC' },
        take: 15,
      }),

      this.dataSource
        .createQueryBuilder()
        .select('pos.singular_name_short', 'position')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(p.total_points)', 'totalPoints')
        .from('players', 'p')
        .innerJoin('positions', 'pos', 'pos.id = p.position_id')
        .where('p.team_id = :id AND p.season_id = :seasonId', { id, seasonId: season.id })
        .groupBy('pos.singular_name_short')
        .orderBy('pos.singular_name_short', 'ASC')
        .getRawMany(),
    ]);

    return {
      team: {
        id: team.id,
        fplId: team.fplId,
        name: team.name,
        shortName: team.shortName,
        strengthOverallHome: team.strengthOverallHome,
        strengthOverallAway: team.strengthOverallAway,
      },
      topPlayers: topPlayers.map((p) => ({
        id: p.id,
        webName: p.webName,
        firstName: p.firstName,
        secondName: p.secondName,
        position: p.position?.singularNameShort,
        totalPoints: p.totalPoints,
        goalsScored: p.goalsScored,
        assists: p.assists,
        cleanSheets: p.cleanSheets,
        nowCost: p.nowCost,
        selectedByPercent: p.selectedByPercent ? Number(p.selectedByPercent) : null,
        minutes: p.minutes,
        form: p.form ? Number(p.form) : null,
        status: p.status,
      })),
      posBreakdown: posBreakdown.map((r) => ({
        position: r.position,
        count: Number(r.count),
        totalPoints: Number(r.totalPoints ?? 0),
      })),
    };
  }
}
