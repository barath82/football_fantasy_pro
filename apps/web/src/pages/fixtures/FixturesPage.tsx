import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useFdr, type FdrFixture, type TeamFdr } from '../../hooks/useFixtures';

// Official FPL-style difficulty colours
const FDR_STYLE: Record<number, { bg: string; color: string }> = {
  1: { bg: '#00cc57', color: '#003d1a' },
  2: { bg: '#01fc7a', color: '#003d1a' },
  3: { bg: '#9ba3b2', color: '#1a1b1e' },
  4: { bg: '#e05c00', color: '#fff' },
  5: { bg: '#cc0000', color: '#fff' },
};

const RANGES = [
  { label: 'GW 1–10',   start: 1,  end: 10 },
  { label: 'GW 11–20',  start: 11, end: 20 },
  { label: 'GW 21–30',  start: 21, end: 30 },
  { label: 'GW 31–38',  start: 31, end: 38 },
  { label: 'All 38',    start: 1,  end: 38 },
];

function avgDifficulty(team: TeamFdr, gws: number[]): number {
  const all = gws.flatMap((gw) => (team.fixtures[gw] ?? []).map((f) => f.difficulty));
  if (!all.length) return 3;
  return all.reduce((s, d) => s + d, 0) / all.length;
}

function FdrCell({ fixtures }: { fixtures: FdrFixture[] | undefined }) {
  if (!fixtures?.length) {
    return (
      <td
        style={{
          minWidth: 68,
          padding: '4px 2px',
          textAlign: 'center',
          background: '#1a1b1e',
          border: '1px solid #2C2E33',
        }}
      >
        <Text size="xs" c="dimmed">—</Text>
      </td>
    );
  }

  return (
    <td
      style={{
        minWidth: 68,
        padding: '2px',
        background: '#1a1b1e',
        border: '1px solid #2C2E33',
      }}
    >
      {fixtures.map((f, i) => {
        const style = FDR_STYLE[f.difficulty] ?? FDR_STYLE[3];
        return (
          <Tooltip
            key={i}
            label={`Difficulty: ${f.difficulty}/5`}
            withArrow
            position="top"
          >
            <Box
              style={{
                background: style.bg,
                color: style.color,
                borderRadius: 3,
                padding: '3px 4px',
                marginBottom: fixtures.length > 1 && i === 0 ? 2 : 0,
                textAlign: 'center',
                lineHeight: 1.2,
                cursor: 'default',
              }}
            >
              <Text size="xs" fw={700} style={{ color: style.color, fontSize: 11 }}>
                {f.opponent}
              </Text>
              <Text size="xs" style={{ color: style.color, fontSize: 9, opacity: 0.85 }}>
                {f.isHome ? 'H' : 'A'}
              </Text>
            </Box>
          </Tooltip>
        );
      })}
    </td>
  );
}

function AvgDifficultyCell({ avg }: { avg: number }) {
  const rounded = Math.round(avg * 10) / 10;
  const style = FDR_STYLE[Math.round(avg)] ?? FDR_STYLE[3];
  return (
    <td
      style={{
        minWidth: 52,
        padding: '4px 6px',
        textAlign: 'center',
        background: style.bg,
        border: '1px solid #2C2E33',
      }}
    >
      <Text size="xs" fw={700} style={{ color: style.color }}>
        {rounded.toFixed(1)}
      </Text>
    </td>
  );
}

export function FixturesPage() {
  const { data, isLoading } = useFdr();
  const [rangeIdx, setRangeIdx] = useState(4); // default: All 38
  const [sortByAvg, setSortByAvg] = useState(false);

  const range = RANGES[rangeIdx];
  const visibleGws = useMemo(
    () => (data?.gameweeks ?? []).filter((gw) => gw >= range.start && gw <= range.end),
    [data, range],
  );

  const sortedTeams = useMemo(() => {
    if (!data) return [];
    if (!sortByAvg) return data.teams;
    return [...data.teams].sort(
      (a, b) => avgDifficulty(a, visibleGws) - avgDifficulty(b, visibleGws),
    );
  }, [data, sortByAvg, visibleGws]);

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end">
        <Box>
          <Title order={2}>Fixture Difficulty Rating</Title>
          <Text c="dimmed" size="sm">2025–26 · all 20 teams</Text>
        </Box>
      </Group>

      {/* Controls */}
      <Group gap="sm" wrap="wrap">
        <Group gap={4}>
          {RANGES.map((r, i) => (
            <Button
              key={r.label}
              size="xs"
              variant={rangeIdx === i ? 'filled' : 'light'}
              color="violet"
              onClick={() => setRangeIdx(i)}
            >
              {r.label}
            </Button>
          ))}
        </Group>
        <Button
          size="xs"
          variant={sortByAvg ? 'filled' : 'outline'}
          color="teal"
          onClick={() => setSortByAvg((v) => !v)}
        >
          {sortByAvg ? '✓ Sorted by avg difficulty' : 'Sort by avg difficulty'}
        </Button>
      </Group>

      {/* Colour legend */}
      <Group gap="xs">
        <Text size="xs" c="dimmed">Difficulty:</Text>
        {[1, 2, 3, 4, 5].map((d) => {
          const s = FDR_STYLE[d];
          return (
            <Box
              key={d}
              style={{
                background: s.bg,
                color: s.color,
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {d}
            </Box>
          );
        })}
        <Text size="xs" c="dimmed">— 1 easiest · 5 hardest</Text>
      </Group>

      {/* FDR Grid */}
      <Box style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #2C2E33' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {/* Sticky team header */}
              <th
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  background: '#25262B',
                  padding: '8px 12px',
                  textAlign: 'left',
                  minWidth: 80,
                  border: '1px solid #2C2E33',
                  fontSize: 12,
                  color: '#909296',
                  fontWeight: 600,
                }}
              >
                Team
              </th>
              {visibleGws.map((gw) => (
                <th
                  key={gw}
                  style={{
                    background: '#25262B',
                    padding: '8px 4px',
                    textAlign: 'center',
                    minWidth: 68,
                    border: '1px solid #2C2E33',
                    fontSize: 11,
                    color: '#909296',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  GW{gw}
                </th>
              ))}
              <th
                style={{
                  background: '#25262B',
                  padding: '8px 6px',
                  textAlign: 'center',
                  minWidth: 52,
                  border: '1px solid #2C2E33',
                  fontSize: 11,
                  color: '#909296',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => setSortByAvg((v) => !v)}
              >
                Avg ↕
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team) => {
              const avg = avgDifficulty(team, visibleGws);
              return (
                <tr key={team.id}>
                  {/* Sticky team name cell */}
                  <td
                    style={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      background: '#1a1b1e',
                      padding: '6px 12px',
                      border: '1px solid #2C2E33',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Text size="sm" fw={600}>{team.shortName}</Text>
                  </td>
                  {visibleGws.map((gw) => (
                    <FdrCell key={gw} fixtures={team.fixtures[gw]} />
                  ))}
                  <AvgDifficultyCell avg={avg} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
    </Stack>
  );
}
