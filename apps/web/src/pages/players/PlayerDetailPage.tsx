import { useParams, useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Center,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePlayer, type GwHistory } from '../../hooks/usePlayer';

const POS_COLOR: Record<string, string> = {
  GKP: 'yellow',
  DEF: 'cyan',
  MID: 'green',
  FWD: 'orange',
};

const STATUS_LABEL: Record<string, string> = {
  a: 'Available',
  d: 'Doubtful',
  i: 'Injured',
  s: 'Suspended',
  u: 'Unavailable',
};

// Aggregate history into one entry per GW (handles double GWs)
function buildChartData(history: GwHistory[]) {
  const byGw = new Map<number, { pts: number; min: number; label: string; played: boolean }>();

  for (const h of history) {
    const existing = byGw.get(h.gameweek);
    const label = `${h.wasHome ? 'vs' : '@'}${h.opponent}`;
    if (existing) {
      existing.pts += h.totalPoints;
      existing.min += h.minutes;
      existing.label += `, ${label}`;
      if (h.minutes > 0) existing.played = true;
    } else {
      byGw.set(h.gameweek, {
        pts: h.totalPoints,
        min: h.minutes,
        label,
        played: h.minutes > 0,
      });
    }
  }

  return Array.from({ length: 38 }, (_, i) => {
    const gw = i + 1;
    const d = byGw.get(gw);
    return {
      gw,
      pts: d?.pts ?? 0,
      min: d?.min ?? 0,
      label: d?.label ?? '—',
      played: d?.played ?? false,
      blank: !d,
    };
  });
}

function buildPriceData(history: GwHistory[]) {
  const seen = new Set<number>();
  const result: { gw: number; price: number }[] = [];
  for (const h of history) {
    if (!seen.has(h.gameweek)) {
      seen.add(h.gameweek);
      result.push({ gw: h.gameweek, price: h.price / 10 });
    }
  }
  return result;
}

function buildTransferData(history: GwHistory[]) {
  const byGw = new Map<number, { in: number; out: number }>();
  for (const h of history) {
    const cur = byGw.get(h.gameweek);
    if (cur) {
      cur.in += h.transfersIn;
      cur.out += h.transfersOut;
    } else {
      byGw.set(h.gameweek, { in: h.transfersIn, out: h.transfersOut });
    }
  }
  return Array.from({ length: 38 }, (_, i) => {
    const gw = i + 1;
    const d = byGw.get(gw);
    return { gw, in: d?.in ?? 0, out: -(d?.out ?? 0) };
  }).filter((d) => d.in !== 0 || d.out !== 0);
}

const TransferTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Card withBorder shadow="sm" p="xs" radius="md">
      <Text size="xs" fw={600}>GW {d.gw}</Text>
      <Text size="xs" c="green">▲ In: {d.in.toLocaleString()}</Text>
      <Text size="xs" c="red">▼ Out: {Math.abs(d.out).toLocaleString()}</Text>
      <Text size="xs" c="dimmed">Net: {(d.in + d.out).toLocaleString()}</Text>
    </Card>
  );
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card withBorder radius="md" p="sm" style={{ textAlign: 'center' }}>
      <Text size="xl" fw={700} c="violet">{value}</Text>
      <Text size="xs" c="dimmed" mt={2}>{label}</Text>
    </Card>
  );
}

const PointsTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Card withBorder shadow="sm" p="xs" radius="md">
      <Text size="xs" fw={600}>GW {d.gw} — {d.label}</Text>
      <Text size="xs" c="violet">{d.pts} pts</Text>
      <Text size="xs" c="dimmed">{d.min} min</Text>
    </Card>
  );
};

const PriceTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Card withBorder shadow="sm" p="xs" radius="md">
      <Text size="xs" fw={600}>GW {d.gw}</Text>
      <Text size="xs" c="teal">£{d.price.toFixed(1)}m</Text>
    </Card>
  );
};

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = usePlayer(Number(id));

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!data) {
    return (
      <Center h={400}>
        <Text c="dimmed">Player not found.</Text>
      </Center>
    );
  }

  const { player, history } = data;
  const chartData = buildChartData(history);
  const priceData = buildPriceData(history);
  const transferData = buildTransferData(history);

  const totalPts = history.reduce((s, h) => s + h.totalPoints, 0);
  const gwPlayed = new Set(history.filter(h => h.minutes > 0).map(h => h.gameweek)).size;
  const avgPts = gwPlayed > 0 ? (totalPts / gwPlayed).toFixed(1) : '0.0';
  const goals = history.reduce((s, h) => s + h.goalsScored, 0);
  const assists = history.reduce((s, h) => s + h.assists, 0);
  const cleanSheets = new Set(
    history.filter(h => h.cleanSheets > 0 && h.minutes >= 60).map(h => h.gameweek)
  ).size;
  const bonus = history.reduce((s, h) => s + h.bonus, 0);

  const startPrice = priceData[0]?.price ?? player.nowCost! / 10;
  const currentPrice = player.nowCost != null ? player.nowCost / 10 : null;
  const priceChange = currentPrice != null ? currentPrice - startPrice : null;

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group gap="sm" align="flex-start">
        <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => navigate(-1)}>
          ←
        </ActionIcon>
        <Box>
          <Group gap="sm" align="center">
            <Title order={2}>{player.webName}</Title>
            <Badge color={POS_COLOR[player.position?.short ?? ''] ?? 'gray'} variant="light">
              {player.position?.short}
            </Badge>
            {player.status !== 'a' && (
              <Tooltip label={player.news ?? STATUS_LABEL[player.status]}>
                <Badge color="red" variant="light">{STATUS_LABEL[player.status]}</Badge>
              </Tooltip>
            )}
          </Group>
          <Text c="dimmed" size="sm">
            {player.firstName} {player.secondName} · {player.team?.name}
            {currentPrice != null && (
              <>
                {' · '}£{currentPrice.toFixed(1)}m
                {priceChange != null && priceChange !== 0 && (
                  <Text span c={priceChange > 0 ? 'green' : 'red'} size="sm">
                    {' '}({priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)})
                  </Text>
                )}
              </>
            )}
            {player.selectedByPercent != null && (
              <> · {player.selectedByPercent.toFixed(1)}% owned</>
            )}
          </Text>
        </Box>
      </Group>

      {/* Season stat cards */}
      <SimpleGrid cols={{ base: 3, sm: 6 }} spacing="sm">
        <StatCard label="Total Pts" value={totalPts} />
        <StatCard label="Avg Pts/GW" value={avgPts} />
        <StatCard label="Goals" value={goals} />
        <StatCard label="Assists" value={assists} />
        <StatCard label="Clean Sheets" value={cleanSheets} />
        <StatCard label="Bonus" value={bonus} />
      </SimpleGrid>

      {/* Points per GW chart */}
      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="sm">Points per Gameweek</Text>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="#373A40" vertical={false} />
            <XAxis
              dataKey="gw"
              tick={{ fontSize: 11, fill: '#909296' }}
              tickLine={false}
              axisLine={false}
              interval={3}
              label={{ value: 'GW', position: 'insideRight', offset: -5, fill: '#5C5F66', fontSize: 11 }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#909296' }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <ReferenceLine y={6} stroke="#5C5F66" strokeDasharray="4 4" />
            <ChartTooltip content={<PointsTooltip />} cursor={{ fill: '#25262B' }} />
            <Bar
              dataKey="pts"
              radius={[3, 3, 0, 0]}
              fill="#7950F2"
              label={false}
            />
          </BarChart>
        </ResponsiveContainer>
        <Text size="xs" c="dimmed" ta="center" mt={4}>
          Dashed line = 6 pts reference
        </Text>
      </Card>

      {/* Price trend */}
      {priceData.length > 1 && (
        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="sm">Price History</Text>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#373A40" vertical={false} />
              <XAxis
                dataKey="gw"
                tick={{ fontSize: 11, fill: '#909296' }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#909296' }}
                tickLine={false}
                axisLine={false}
                width={38}
                tickFormatter={(v) => `£${v.toFixed(1)}`}
                domain={['dataMin - 0.2', 'dataMax + 0.2']}
              />
              <ChartTooltip content={<PriceTooltip />} />
              <Line
                type="stepAfter"
                dataKey="price"
                stroke="#12B886"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#12B886' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Transfers in/out chart */}
      {transferData.length > 0 && (
        <Card withBorder radius="md" p="md">
          <Text fw={600} mb="sm">Transfer Activity per Gameweek</Text>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={transferData} barSize={10} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#373A40" vertical={false} />
              <XAxis
                dataKey="gw"
                tick={{ fontSize: 11, fill: '#909296' }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#909296' }}
                tickLine={false}
                axisLine={false}
                width={52}
                tickFormatter={(v) => Math.abs(v).toLocaleString()}
              />
              <ReferenceLine y={0} stroke="#5C5F66" />
              <ChartTooltip content={<TransferTooltip />} cursor={{ fill: '#25262B' }} />
              <Bar dataKey="in" radius={[3, 3, 0, 0]}>
                {transferData.map((_, i) => (
                  <Cell key={i} fill="#12B886" />
                ))}
              </Bar>
              <Bar dataKey="out" radius={[0, 0, 3, 3]}>
                {transferData.map((_, i) => (
                  <Cell key={i} fill="#FF6B6B" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <Group gap="lg" justify="center" mt={4}>
            <Group gap={4}><Box w={10} h={10} style={{ background: '#12B886', borderRadius: 2 }} /><Text size="xs" c="dimmed">Transfers in</Text></Group>
            <Group gap={4}><Box w={10} h={10} style={{ background: '#FF6B6B', borderRadius: 2 }} /><Text size="xs" c="dimmed">Transfers out</Text></Group>
          </Group>
        </Card>
      )}

      {/* GW breakdown table */}
      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="sm">Gameweek Breakdown</Text>
        <Box style={{ overflowX: 'auto' }}>
          <Table
            striped
            withTableBorder
            withColumnBorders
            style={{ minWidth: 700, fontSize: 13 }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>GW</Table.Th>
                <Table.Th>Opponent</Table.Th>
                <Table.Th ta="right">Pts</Table.Th>
                <Table.Th ta="right">Min</Table.Th>
                <Table.Th ta="right">G</Table.Th>
                <Table.Th ta="right">A</Table.Th>
                <Table.Th ta="right">CS</Table.Th>
                <Table.Th ta="right">GC</Table.Th>
                <Table.Th ta="right">YC</Table.Th>
                <Table.Th ta="right">Bon</Table.Th>
                <Table.Th ta="right">BPS</Table.Th>
                <Table.Th ta="right">Price</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {history.map((h, i) => (
                <Table.Tr key={i}>
                  <Table.Td>
                    <Text size="sm" c="dimmed">GW{h.gameweek}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {h.wasHome ? 'vs' : '@'} {h.opponent}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={700} c={h.totalPoints >= 6 ? 'violet' : undefined}>
                      {h.totalPoints}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" c={h.minutes === 0 ? 'dimmed' : undefined}>
                      {h.minutes}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right"><Text size="sm">{h.goalsScored || '—'}</Text></Table.Td>
                  <Table.Td ta="right"><Text size="sm">{h.assists || '—'}</Text></Table.Td>
                  <Table.Td ta="right"><Text size="sm">{h.cleanSheets || '—'}</Text></Table.Td>
                  <Table.Td ta="right"><Text size="sm">{h.goalsConceded}</Text></Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" c={h.yellowCards ? 'yellow' : undefined}>
                      {h.yellowCards || '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right"><Text size="sm">{h.bonus}</Text></Table.Td>
                  <Table.Td ta="right"><Text size="sm">{h.bps}</Text></Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm">£{(h.price / 10).toFixed(1)}m</Text>
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
