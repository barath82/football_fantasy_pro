import {
  Badge,
  Box,
  Card,
  Center,
  Grid,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useGameweeks, useGameweekDetail, type GwSummary, type TopPlayer, type TransferMover } from '../../hooks/useGameweeks';
import { useGameweekStore } from '../../store/gameweek.store';

// ─── Season overview ──────────────────────────────────────────────────────────

function GwCard({ gw, selected, onClick }: {
  gw: GwSummary;
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
      <Group justify="space-between" mb={4}>
        <Text size="sm" fw={600}>GW {gw.fplId}</Text>
        {!gw.finished && (
          <Badge size="xs" color="gray" variant="light">Upcoming</Badge>
        )}
      </Group>
      <Text size="xs" c="dimmed" mb={6}>{gw.name}</Text>
      {gw.finished ? (
        <SimpleGrid cols={2} spacing={4}>
          <Box>
            <Text size="xs" c="dimmed">Avg</Text>
            <Text size="sm" fw={600}>{gw.averageEntryScore ?? '—'}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">Top</Text>
            <Text size="sm" fw={600}>{gw.highestScore ?? '—'}</Text>
          </Box>
        </SimpleGrid>
      ) : (
        <Text size="xs" c="dimmed">
          {gw.deadlineTime
            ? new Date(gw.deadlineTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
            : ''}
        </Text>
      )}
    </Card>
  );
}

function SeasonOverview({ onSelect }: { onSelect: (gw: number) => void }) {
  const { data: gameweeks = [], isLoading } = useGameweeks();
  const { selectedGameweek } = useGameweekStore();

  if (isLoading) return <Center h={200}><Loader /></Center>;

  return (
    <Stack gap="md">
      <Text c="dimmed" size="sm">
        Select a gameweek below or use the dropdown in the header.
      </Text>
      <SimpleGrid cols={{ base: 4, sm: 6, md: 8, lg: 10 }} spacing="xs">
        {gameweeks.map((gw) => (
          <GwCard
            key={gw.fplId}
            gw={gw}
            selected={selectedGameweek === gw.fplId}
            onClick={() => onSelect(gw.fplId)}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

// ─── GW detail ────────────────────────────────────────────────────────────────

const POS_COLOR: Record<string, string> = {
  GKP: 'yellow', DEF: 'cyan', MID: 'green', FWD: 'orange',
};

function SummaryCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card withBorder radius="md" p="md" style={{ textAlign: 'center' }}>
      <Text size="xl" fw={700} c="violet">{value}</Text>
      {sub && <Text size="xs" c="dimmed">{sub}</Text>}
      <Text size="xs" c="dimmed" mt={4}>{label}</Text>
    </Card>
  );
}

function TopScorersTable({ players }: { players: TopPlayer[] }) {
  return (
    <Card withBorder radius="md" p="md">
      <Text fw={600} mb="sm">Top Performers</Text>
      <Box style={{ overflowX: 'auto' }}>
        <Table striped withTableBorder withColumnBorders style={{ fontSize: 13, minWidth: 520 }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>#</Table.Th>
              <Table.Th>Player</Table.Th>
              <Table.Th>Team</Table.Th>
              <Table.Th>Pos</Table.Th>
              <Table.Th ta="right">Pts</Table.Th>
              <Table.Th ta="right">G</Table.Th>
              <Table.Th ta="right">A</Table.Th>
              <Table.Th ta="right">CS</Table.Th>
              <Table.Th ta="right">Bon</Table.Th>
              <Table.Th ta="right">Min</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {players.map((p, i) => (
              <Table.Tr key={p.id}>
                <Table.Td><Text size="sm" c="dimmed">{i + 1}</Text></Table.Td>
                <Table.Td><Text size="sm" fw={500}>{p.webName}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{p.team}</Text></Table.Td>
                <Table.Td>
                  <Badge size="xs" color={POS_COLOR[p.position] ?? 'gray'} variant="light">
                    {p.position}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" fw={700} c={p.totalPoints >= 9 ? 'violet' : undefined}>
                    {p.totalPoints}
                  </Text>
                </Table.Td>
                <Table.Td ta="right"><Text size="sm">{p.goals || '—'}</Text></Table.Td>
                <Table.Td ta="right"><Text size="sm">{p.assists || '—'}</Text></Table.Td>
                <Table.Td ta="right"><Text size="sm">{p.cleanSheets || '—'}</Text></Table.Td>
                <Table.Td ta="right"><Text size="sm">{p.bonus}</Text></Table.Td>
                <Table.Td ta="right"><Text size="sm">{p.minutes}</Text></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Card>
  );
}

function TransferTable({ title, players, direction }: {
  title: string;
  players: TransferMover[];
  direction: 'in' | 'out';
}) {
  const color = direction === 'in' ? 'green' : 'red';
  const arrow = direction === 'in' ? '▲' : '▼';

  if (!players.length) {
    return (
      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="sm">{title}</Text>
        <Text c="dimmed" size="sm">No transfer data for this gameweek.</Text>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="md">
      <Text fw={600} mb="sm">{title}</Text>
      <Stack gap={6}>
        {players.map((p, i) => (
          <Group key={p.id} justify="space-between">
            <Group gap="xs">
              <Text size="sm" c="dimmed" w={20} ta="right">{i + 1}</Text>
              <Box>
                <Text size="sm" fw={500}>{p.webName}</Text>
                <Text size="xs" c="dimmed">{p.team} · {p.position}</Text>
              </Box>
            </Group>
            <Text size="sm" fw={600} c={color}>
              {arrow} {p.value.toLocaleString()}
            </Text>
          </Group>
        ))}
      </Stack>
    </Card>
  );
}

function GwDetail({ gwFplId }: { gwFplId: number }) {
  const { data, isLoading } = useGameweekDetail(gwFplId);

  if (isLoading) return <Center h={300}><Loader size="lg" /></Center>;
  if (!data) return <Text c="dimmed">No data for this gameweek.</Text>;

  const { summary, topScorers, topTransferredIn, topTransferredOut } = data;
  const topChip = summary.chipPlays.sort((a, b) => b.count - a.count)[0];

  return (
    <Stack gap="lg">
      {/* Summary cards */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        <SummaryCard label="Average Score" value={summary.averageEntryScore ?? '—'} />
        <SummaryCard label="Highest Score" value={summary.highestScore ?? '—'} />
        <SummaryCard
          label="Total Transfers"
          value={summary.transfersMade ? summary.transfersMade.toLocaleString() : '—'}
        />
        <SummaryCard
          label="Most Used Chip"
          value={topChip?.name ?? '—'}
          sub={topChip ? topChip.count.toLocaleString() + ' played' : undefined}
        />
      </SimpleGrid>

      {/* Chip breakdown */}
      {summary.chipPlays.length > 0 && (
        <Group gap="sm">
          {summary.chipPlays
            .sort((a, b) => b.count - a.count)
            .map((c) => (
              <Tooltip key={c.name} label={`${c.count.toLocaleString()} managers`} withArrow>
                <Badge size="md" variant="light" color="violet">
                  {c.name}: {c.count.toLocaleString()}
                </Badge>
              </Tooltip>
            ))}
        </Group>
      )}

      {/* Top performers */}
      <TopScorersTable players={topScorers} />

      {/* Transfers */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TransferTable
            title="Most Transferred In"
            players={topTransferredIn}
            direction="in"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TransferTable
            title="Most Transferred Out"
            players={topTransferredOut}
            direction="out"
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function GameweeksPage() {
  const { selectedGameweek, setSelectedGameweek } = useGameweekStore();

  return (
    <Stack gap="md">
      <Group align="baseline" gap="sm">
        <Title order={2}>Gameweek Explorer</Title>
        {selectedGameweek && (
          <Badge color="violet" variant="light" size="lg">
            Gameweek {selectedGameweek}
          </Badge>
        )}
      </Group>

      {selectedGameweek == null ? (
        <SeasonOverview onSelect={setSelectedGameweek} />
      ) : (
        <Stack gap="md">
          <SeasonOverview onSelect={setSelectedGameweek} />
          <GwDetail gwFplId={selectedGameweek} />
        </Stack>
      )}
    </Stack>
  );
}
