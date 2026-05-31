import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Center,
  CloseButton,
  Combobox,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  useCombobox,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePlayers } from '../../hooks/usePlayers';
import { usePlayer, type PlayerDetail } from '../../hooks/usePlayer';

const PLAYER_COLORS = ['#7950F2', '#12B886', '#FF6B35'];
const MAX_PLAYERS = 3;

// ─── Player search combobox ───────────────────────────────────────────────────

function PlayerSearch({ onAdd, disabledIds }: {
  onAdd: (id: number, name: string) => void;
  disabledIds: number[];
}) {
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 300);
  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() });

  const { data, isFetching } = usePlayers({
    search: debounced || undefined,
    pageSize: 8,
    sortBy: 'totalPoints',
  });

  const options = (data?.data ?? []).filter((p) => !disabledIds.includes(p.id));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        const p = options.find((o) => String(o.id) === val);
        if (p) { onAdd(p.id, p.webName); setSearch(''); }
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <TextInput
          placeholder="Search player to add..."
          value={search}
          onChange={(e) => { setSearch(e.currentTarget.value); combobox.openDropdown(); }}
          onClick={() => combobox.openDropdown()}
          rightSection={isFetching && debounced ? <Loader size="xs" /> : null}
          w={260}
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length === 0 ? (
            <Combobox.Empty>{debounced ? 'No players found' : 'Type to search...'}</Combobox.Empty>
          ) : (
            options.map((p) => (
              <Combobox.Option key={p.id} value={String(p.id)}>
                <Group gap="xs">
                  <Text size="sm" fw={500}>{p.webName}</Text>
                  <Text size="xs" c="dimmed">{p.team.shortName} · {p.position.short}</Text>
                  <Text size="xs" c="violet" ml="auto">{p.totalPoints}pts</Text>
                </Group>
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

// ─── Stat card for one player ─────────────────────────────────────────────────

function PlayerCard({ detail, color, onRemove }: {
  detail: PlayerDetail;
  color: string;
  onRemove: () => void;
}) {
  const p = detail.player;
  return (
    <Card withBorder radius="md" p="md" style={{ borderColor: color, borderWidth: 2 }}>
      <Group justify="space-between" mb="xs">
        <Box style={{ borderLeft: `3px solid ${color}`, paddingLeft: 8 }}>
          <Text fw={700}>{p.webName}</Text>
          <Text size="xs" c="dimmed">{p.team?.name} · {p.position?.short}</Text>
        </Box>
        <CloseButton size="sm" onClick={onRemove} />
      </Group>
      <SimpleGrid cols={2} spacing={6}>
        {[
          { label: 'Total Pts',  value: p.totalPoints },
          { label: 'Pts/GW',    value: p.pointsPerGame?.toFixed(1) ?? '—' },
          { label: 'Form',      value: p.form?.toFixed(1) ?? '—' },
          { label: 'Price',     value: p.nowCost != null ? `£${(p.nowCost / 10).toFixed(1)}m` : '—' },
          { label: 'Own%',      value: p.selectedByPercent != null ? `${p.selectedByPercent.toFixed(1)}%` : '—' },
          { label: 'Goals',     value: p.goalsScored },
          { label: 'Assists',   value: p.assists },
          { label: 'CS',        value: p.cleanSheets },
          { label: 'Minutes',   value: p.minutes },
          { label: 'Bonus',     value: p.bonus },
        ].map(({ label, value }) => (
          <Box key={label} style={{ textAlign: 'center', padding: '4px 0' }}>
            <Text size="lg" fw={700} style={{ color }}>{String(value)}</Text>
            <Text size="xs" c="dimmed">{label}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Card>
  );
}

// ─── Overlaid points chart — data passed in, no hooks ────────────────────────

function CompareChart({ details, colors }: { details: PlayerDetail[]; colors: string[] }) {
  const gwData: Record<number, Record<string, number>> = {};

  details.forEach(({ player, history }) => {
    const key = player.webName;
    history.forEach((h) => {
      gwData[h.gameweek] ??= {};
      gwData[h.gameweek][key] = (gwData[h.gameweek][key] ?? 0) + h.totalPoints;
    });
  });

  const chartData = Array.from({ length: 38 }, (_, i) => ({
    gw: i + 1,
    ...(gwData[i + 1] ?? {}),
  }));

  return (
    <Card withBorder radius="md" p="md">
      <Text fw={600} mb="sm">Points per Gameweek</Text>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#373A40" vertical={false} />
          <XAxis dataKey="gw" tick={{ fontSize: 11, fill: '#909296' }} tickLine={false} axisLine={false} interval={3} />
          <YAxis tick={{ fontSize: 11, fill: '#909296' }} tickLine={false} axisLine={false} width={28} />
          <ChartTooltip
            contentStyle={{ background: '#25262B', border: '1px solid #373A40', borderRadius: 6 }}
            labelStyle={{ color: '#909296', fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {details.map(({ player }, i) => (
            <Line
              key={player.id}
              type="monotone"
              dataKey={player.webName}
              stroke={colors[i]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Head-to-head stats table — data passed in, no hooks ─────────────────────

const STAT_ROWS: { label: string; key: string; fmt?: (v: any) => string }[] = [
  { label: 'Total Points',  key: 'totalPoints' },
  { label: 'Points/GW',     key: 'pointsPerGame',     fmt: (v) => v?.toFixed(1) ?? '—' },
  { label: 'Form',          key: 'form',               fmt: (v) => v?.toFixed(1) ?? '—' },
  { label: 'Price',         key: 'nowCost',            fmt: (v) => v != null ? `£${(v / 10).toFixed(1)}m` : '—' },
  { label: 'Ownership',     key: 'selectedByPercent',  fmt: (v) => v != null ? `${v.toFixed(1)}%` : '—' },
  { label: 'Goals',         key: 'goalsScored' },
  { label: 'Assists',       key: 'assists' },
  { label: 'Clean Sheets',  key: 'cleanSheets' },
  { label: 'Minutes',       key: 'minutes' },
  { label: 'Bonus',         key: 'bonus' },
  { label: 'BPS',           key: 'bps' },
  { label: 'ICT Index',     key: 'ictIndex',           fmt: (v) => v?.toFixed(1) ?? '—' },
  { label: 'Transfers In',  key: 'transfersIn',        fmt: (v) => v?.toLocaleString() ?? '—' },
];

function StatsTable({ details, colors }: { details: PlayerDetail[]; colors: string[] }) {
  const players = details.map((d) => d.player);

  return (
    <Card withBorder radius="md" p="md">
      <Text fw={600} mb="sm">Head-to-Head Stats</Text>
      <Box style={{ overflowX: 'auto' }}>
        <Table withTableBorder withColumnBorders style={{ fontSize: 13 }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Stat</Table.Th>
              {players.map((p, i) => (
                <Table.Th key={p.id} ta="right" style={{ color: colors[i] }}>{p.webName}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {STAT_ROWS.map(({ label, key, fmt }) => {
              const vals = players.map((p) => (p as any)[key]);
              const numVals = vals.map((v) => Number(v ?? 0));
              const maxVal = Math.max(...numVals);
              return (
                <Table.Tr key={key}>
                  <Table.Td><Text size="sm" c="dimmed">{label}</Text></Table.Td>
                  {vals.map((v, i) => {
                    const isTop = numVals[i] === maxVal && maxVal > 0;
                    const display = fmt ? fmt(v) : String(v ?? '—');
                    return (
                      <Table.Td key={i} ta="right">
                        <Text size="sm" fw={isTop ? 700 : 400} c={isTop ? 'violet' : undefined}>
                          {display}
                        </Text>
                      </Table.Td>
                    );
                  })}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Box>
    </Card>
  );
}

// ─── Main page — all usePlayer hooks called here, always exactly 3 ────────────

export function ComparePage() {
  const [selected, setSelected] = useState<{ id: number; name: string }[]>([]);

  // Rules of hooks: always call exactly 3, use enabled:false for empty slots
  const q0 = usePlayer(selected[0]?.id ?? 0);
  const q1 = usePlayer(selected[1]?.id ?? 0);
  const q2 = usePlayer(selected[2]?.id ?? 0);

  const allQueries = [q0, q1, q2];
  const isAnyLoading = allQueries.slice(0, selected.length).some((q) => q.isLoading);
  const details = allQueries
    .slice(0, selected.length)
    .map((q) => q.data)
    .filter((d): d is PlayerDetail => d != null);

  const colors = selected.map((_, i) => PLAYER_COLORS[i]);
  const playerIds = selected.map((p) => p.id);

  function addPlayer(id: number, name: string) {
    if (selected.length >= MAX_PLAYERS) return;
    if (selected.some((p) => p.id === id)) return;
    setSelected((prev) => [...prev, { id, name }]);
  }

  function removePlayer(id: number) {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <Stack gap="lg">
      <Group align="baseline" gap="sm">
        <Title order={2}>Player Comparison</Title>
        <Text c="dimmed" size="sm">Compare up to 3 players side-by-side</Text>
      </Group>

      <Group gap="sm" align="center">
        {selected.length < MAX_PLAYERS && (
          <PlayerSearch onAdd={addPlayer} disabledIds={playerIds} />
        )}
        {selected.map((p, i) => (
          <Badge
            key={p.id}
            size="lg"
            variant="light"
            style={{ borderColor: PLAYER_COLORS[i], color: PLAYER_COLORS[i] }}
            rightSection={
              <ActionIcon size="xs" variant="transparent"
                onClick={() => removePlayer(p.id)}
                style={{ color: PLAYER_COLORS[i] }}>
                ×
              </ActionIcon>
            }
          >
            {p.name}
          </Badge>
        ))}
      </Group>

      {selected.length === 0 ? (
        <Center h={300}>
          <Stack align="center" gap="xs">
            <Text size="xl">⚡</Text>
            <Text c="dimmed">Search and add players above to compare them.</Text>
          </Stack>
        </Center>
      ) : isAnyLoading ? (
        <Center h={300}><Loader size="lg" /></Center>
      ) : (
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, sm: details.length }}>
            {details.map((detail, i) => (
              <PlayerCard
                key={detail.player.id}
                detail={detail}
                color={PLAYER_COLORS[i]}
                onRemove={() => removePlayer(detail.player.id)}
              />
            ))}
          </SimpleGrid>

          {details.length > 0 && <CompareChart details={details} colors={colors} />}
          {details.length > 0 && <StatsTable details={details} colors={colors} />}
        </Stack>
      )}
    </Stack>
  );
}
