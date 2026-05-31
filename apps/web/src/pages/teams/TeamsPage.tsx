import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Center,
  Grid,
  Group,
  Loader,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useTeams } from '../../hooks/useTeams';
import { useTeamDetail } from '../../hooks/useTeamDetail';

const POS_COLOR: Record<string, string> = {
  GKP: 'yellow', DEF: 'cyan', MID: 'green', FWD: 'orange',
};

const POS_ORDER = ['GKP', 'DEF', 'MID', 'FWD'];

function StrengthBar({ value, max = 1400 }: { value: number | null; max?: number }) {
  if (value == null) return null;
  const pct = Math.min(100, ((value - 900) / (max - 900)) * 100);
  return (
    <Group gap={6} align="center">
      <Progress value={pct} size="xs" color="violet" style={{ flex: 1 }} />
      <Text size="xs" c="dimmed" w={35}>{value}</Text>
    </Group>
  );
}

function TeamCard({ team, selected, onClick }: {
  team: { id: number; name: string; shortName: string };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderColor: selected ? 'var(--mantine-color-violet-5)' : undefined,
        background: selected ? 'var(--mantine-color-violet-9)' : undefined,
      }}
    >
      <Text fw={700} size="lg">{team.shortName}</Text>
      <Text size="xs" c="dimmed" lineClamp={1}>{team.name}</Text>
    </Card>
  );
}

function TeamDetail({ id }: { id: number }) {
  const { data, isLoading } = useTeamDetail(id);

  if (isLoading) return <Center h={300}><Loader /></Center>;
  if (!data) return null;

  const { team, topPlayers, posBreakdown } = data;
  const totalPts = posBreakdown.reduce((s, p) => s + p.totalPoints, 0);
  const sortedBreakdown = [...posBreakdown].sort(
    (a, b) => POS_ORDER.indexOf(a.position) - POS_ORDER.indexOf(b.position),
  );

  return (
    <Stack gap="md">
      {/* Team header */}
      <Box>
        <Title order={3}>{team.name}</Title>
        <Text c="dimmed" size="sm">Season total: {totalPts.toLocaleString()} pts across squad</Text>
      </Box>

      {/* Strength + squad breakdown */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card withBorder radius="md" p="md">
            <Text fw={600} mb="sm">Team Strength (FPL rating)</Text>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Home overall</Text>
                <StrengthBar value={team.strengthOverallHome} />
              </Group>
              <Group justify="space-between">
                <Text size="sm">Away overall</Text>
                <StrengthBar value={team.strengthOverallAway} />
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card withBorder radius="md" p="md">
            <Text fw={600} mb="sm">Squad by position</Text>
            <Stack gap="xs">
              {sortedBreakdown.map((pb) => (
                <Group key={pb.position} justify="space-between">
                  <Group gap="xs">
                    <Badge size="sm" color={POS_COLOR[pb.position] ?? 'gray'} variant="light">
                      {pb.position}
                    </Badge>
                    <Text size="sm" c="dimmed">{pb.count} players</Text>
                  </Group>
                  <Text size="sm" fw={600} c="violet">{pb.totalPoints.toLocaleString()} pts</Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Top players table */}
      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="sm">Top Players</Text>
        <Box style={{ overflowX: 'auto' }}>
          <Table striped withTableBorder withColumnBorders style={{ minWidth: 600, fontSize: 13 }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>Player</Table.Th>
                <Table.Th>Pos</Table.Th>
                <Table.Th ta="right">Pts</Table.Th>
                <Table.Th ta="right">G</Table.Th>
                <Table.Th ta="right">A</Table.Th>
                <Table.Th ta="right">CS</Table.Th>
                <Table.Th ta="right">Min</Table.Th>
                <Table.Th ta="right">Price</Table.Th>
                <Table.Th ta="right">Own%</Table.Th>
                <Table.Th ta="right">Form</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {topPlayers.map((p, i) => (
                <Table.Tr key={p.id}>
                  <Table.Td><Text size="sm" c="dimmed">{i + 1}</Text></Table.Td>
                  <Table.Td>
                    <Group gap={6}>
                      {p.status !== 'a' && (
                        <Box
                          w={7} h={7}
                          style={{
                            borderRadius: '50%',
                            background: p.status === 'i' ? 'var(--mantine-color-red-5)' : 'var(--mantine-color-yellow-5)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Text size="sm" fw={500}>{p.webName}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="xs" color={POS_COLOR[p.position] ?? 'gray'} variant="light">
                      {p.position}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={700} c="violet">{p.totalPoints}</Text>
                  </Table.Td>
                  <Table.Td ta="right"><Text size="sm">{p.goalsScored || '—'}</Text></Table.Td>
                  <Table.Td ta="right"><Text size="sm">{p.assists || '—'}</Text></Table.Td>
                  <Table.Td ta="right"><Text size="sm">{p.cleanSheets || '—'}</Text></Table.Td>
                  <Table.Td ta="right"><Text size="sm">{p.minutes}</Text></Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm">{p.nowCost != null ? `£${(p.nowCost / 10).toFixed(1)}m` : '—'}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm">{p.selectedByPercent != null ? `${p.selectedByPercent.toFixed(1)}%` : '—'}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm">{p.form != null ? p.form.toFixed(1) : '—'}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </Card>
    </Stack>
  );
}

export function TeamsPage() {
  const { data: teams = [], isLoading } = useTeams();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (isLoading) return <Center h={400}><Loader size="lg" /></Center>;

  return (
    <Stack gap="lg">
      <Group align="baseline" gap="sm">
        <Title order={2}>Team Explorer</Title>
        <Text c="dimmed" size="sm">2025–26 · {teams.length} clubs</Text>
      </Group>

      <SimpleGrid cols={{ base: 5, sm: 10 }} spacing="xs">
        {teams.map((t) => (
          <TeamCard
            key={t.id}
            team={t}
            selected={selectedId === t.id}
            onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
          />
        ))}
      </SimpleGrid>

      {selectedId != null ? (
        <Box>
          <Group mb="md">
            <ActionIcon variant="subtle" color="gray" onClick={() => setSelectedId(null)}>←</ActionIcon>
            <Text size="sm" c="dimmed">Click a team above to switch</Text>
          </Group>
          <TeamDetail id={selectedId} />
        </Box>
      ) : (
        <Text c="dimmed" size="sm" ta="center" py="xl">
          Select a team above to see their squad and stats.
        </Text>
      )}
    </Stack>
  );
}
