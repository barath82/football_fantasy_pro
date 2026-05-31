import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Box,
  Center,
  Group,
  Loader,
  Pagination,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import type { PlayerRow, PlayersResponse } from '../../hooks/usePlayers';

const STATUS_COLOR: Record<string, string> = {
  a: 'green',
  d: 'yellow',
  i: 'red',
  s: 'orange',
  u: 'gray',
  n: 'gray',
};

const POS_COLOR: Record<string, string> = {
  GKP: 'yellow',
  DEF: 'cyan',
  MID: 'green',
  FWD: 'orange',
};

interface SortState {
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  gwOnly?: boolean;
  seasonOnly?: boolean;
  align?: 'left' | 'right' | 'center';
  render?: (row: PlayerRow) => ReactNode;
}

const COLUMNS: Column[] = [
  {
    key: 'webName',
    label: 'Player',
    sortable: true,
    align: 'left',
    render: (r) => (
      <Group gap={6} wrap="nowrap">
        {r.status !== 'a' && (
          <Tooltip label={r.news ?? r.status} withArrow>
            <Box
              w={8}
              h={8}
              style={{
                borderRadius: '50%',
                background: `var(--mantine-color-${STATUS_COLOR[r.status] ?? 'gray'}-5)`,
                flexShrink: 0,
              }}
            />
          </Tooltip>
        )}
        <Box>
          <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
            {r.webName}
          </Text>
          <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
            {r.firstName[0]}. {r.secondName}
          </Text>
        </Box>
      </Group>
    ),
  },
  {
    key: 'team',
    label: 'Team',
    align: 'center',
    render: (r) => (
      <Text size="sm" c="dimmed">
        {r.team.shortName}
      </Text>
    ),
  },
  {
    key: 'position',
    label: 'Pos',
    align: 'center',
    render: (r) => (
      <Badge
        size="xs"
        color={POS_COLOR[r.position.short] ?? 'gray'}
        variant="light"
      >
        {r.position.short}
      </Badge>
    ),
  },
  {
    key: 'nowCost',
    label: 'Price',
    sortable: true,
    align: 'right',
    render: (r) =>
      r.nowCost != null ? (
        <Text size="sm">£{(r.nowCost / 10).toFixed(1)}m</Text>
      ) : (
        <Text size="sm" c="dimmed">—</Text>
      ),
  },
  {
    key: 'selectedByPercent',
    label: 'Own%',
    sortable: true,
    align: 'right',
    render: (r) =>
      r.selectedByPercent != null ? (
        <Text size="sm">{Number(r.selectedByPercent).toFixed(1)}%</Text>
      ) : (
        <Text size="sm" c="dimmed">—</Text>
      ),
  },
  {
    key: 'totalPoints',
    label: 'Pts',
    sortable: true,
    align: 'right',
    render: (r) => (
      <Text size="sm" fw={700} c="violet">
        {r.totalPoints}
      </Text>
    ),
  },
  {
    key: 'form',
    label: 'Form',
    sortable: true,
    seasonOnly: true,
    align: 'right',
    render: (r) =>
      r.form != null ? (
        <Text size="sm">{Number(r.form).toFixed(1)}</Text>
      ) : (
        <Text size="sm" c="dimmed">—</Text>
      ),
  },
  {
    key: 'goalsScored',
    label: 'G',
    sortable: true,
    align: 'right',
    render: (r) => <Text size="sm">{r.goalsScored}</Text>,
  },
  {
    key: 'assists',
    label: 'A',
    sortable: true,
    align: 'right',
    render: (r) => <Text size="sm">{r.assists}</Text>,
  },
  {
    key: 'cleanSheets',
    label: 'CS',
    sortable: true,
    align: 'right',
    render: (r) => <Text size="sm">{r.cleanSheets}</Text>,
  },
  {
    key: 'minutes',
    label: 'Min',
    sortable: true,
    align: 'right',
    render: (r) => <Text size="sm">{r.minutes}</Text>,
  },
  {
    key: 'bonus',
    label: 'Bon',
    sortable: true,
    align: 'right',
    render: (r) => <Text size="sm">{r.bonus}</Text>,
  },
  {
    key: 'costChangeStart',
    label: '±Price',
    sortable: false,
    seasonOnly: true,
    align: 'right',
    render: (r) => {
      if (r.costChangeStart == null) return <Text size="sm" c="dimmed">—</Text>;
      const change = r.costChangeStart / 10;
      if (change === 0) return <Text size="sm" c="dimmed">—</Text>;
      return (
        <Text size="sm" fw={500} c={change > 0 ? 'green' : 'red'}>
          {change > 0 ? '+' : ''}{change.toFixed(1)}
        </Text>
      );
    },
  },
  {
    key: 'valueScore',
    label: 'pts/£',
    sortable: false,
    seasonOnly: true,
    align: 'right',
    render: (r) => {
      if (!r.nowCost || r.nowCost === 0) return <Text size="sm" c="dimmed">—</Text>;
      const val = r.totalPoints / (r.nowCost / 10);
      return <Text size="sm">{val.toFixed(1)}</Text>;
    },
  },
  {
    key: 'ictIndex',
    label: 'ICT',
    sortable: true,
    seasonOnly: true,
    align: 'right',
    render: (r) =>
      r.ictIndex != null ? (
        <Text size="sm">{Number(r.ictIndex).toFixed(1)}</Text>
      ) : (
        <Text size="sm" c="dimmed">—</Text>
      ),
  },
];

interface PlayersTableProps {
  data: PlayersResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  sort: SortState;
  page: number;
  pageSize: number;
  isGwMode: boolean;
  onSort: (col: string) => void;
  onPageChange: (p: number) => void;
}

export function PlayersTable({
  data,
  isLoading,
  isFetching,
  sort,
  page,
  pageSize,
  isGwMode,
  onSort,
  onPageChange,
}: PlayersTableProps) {
  const navigate = useNavigate();
  const visibleCols = COLUMNS.filter((c) => {
    if (isGwMode && c.seasonOnly) return false;
    return true;
  });

  const sortIcon = (col: string) => {
    if (sort.sortBy !== col) return <Text span c="dimmed" size="xs"> ⇅</Text>;
    return (
      <Text span c="violet" size="xs">
        {sort.sortOrder === 'DESC' ? ' ↓' : ' ↑'}
      </Text>
    );
  };

  if (isLoading) {
    return (
      <Center h={300}>
        <Loader size="lg" />
      </Center>
    );
  }

  const rows = data?.data ?? [];
  const total = data?.totalPages ?? 1;

  return (
    <Box pos="relative">
      {isFetching && !isLoading && (
        <Box
          pos="absolute"
          top={0}
          right={0}
          p="xs"
          style={{ zIndex: 10 }}
        >
          <Loader size="xs" />
        </Box>
      )}

      <Box style={{ overflowX: 'auto' }}>
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          style={{ minWidth: 800 }}
        >
          <Table.Thead>
            <Table.Tr>
              {visibleCols.map((col) => (
                <Table.Th
                  key={col.key}
                  ta={col.align ?? 'left'}
                  style={{
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => col.sortable && onSort(col.key)}
                >
                  {col.label}
                  {col.sortable && sortIcon(col.key)}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {rows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={visibleCols.length}>
                  <Center py="xl">
                    <Text c="dimmed">No players match the current filters.</Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              rows.map((row) => (
                <Table.Tr
                  key={row.id}
                  onClick={() => navigate(`/players/${row.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {visibleCols.map((col) => (
                    <Table.Td key={col.key} ta={col.align ?? 'left'}>
                      {col.render ? col.render(row) : null}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Box>

      <Group justify="space-between" mt="md" align="center">
        <Text size="sm" c="dimmed">
          {data
            ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, data.total)} of ${data.total} players`
            : ''}
        </Text>
        <Pagination
          total={total}
          value={page}
          onChange={onPageChange}
          size="sm"
          siblings={1}
          boundaries={1}
        />
      </Group>
    </Box>
  );
}
