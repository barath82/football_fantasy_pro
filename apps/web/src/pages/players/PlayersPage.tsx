import { useEffect, useState } from 'react';
import { Badge, Group, Stack, Text, Title } from '@mantine/core';
import { usePlayers } from '../../hooks/usePlayers';
import { useGameweekStore } from '../../store/gameweek.store';
import type { FilterState } from './PlayerFilters';
import { PlayerFilters } from './PlayerFilters';
import { PlayersTable } from './PlayersTable';

const PAGE_SIZE = 25;

export function PlayersPage() {
  const { selectedGameweek } = useGameweekStore();

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    positionId: undefined,
    teamId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });

  const [sortBy, setSortBy] = useState('totalPoints');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);

  // Reset to page 1 when filters or gameweek change
  useEffect(() => {
    setPage(1);
  }, [filters, selectedGameweek]);

  const { data, isLoading, isFetching } = usePlayers({
    gameweek: selectedGameweek ?? undefined,
    positionId: filters.positionId,
    teamId: filters.teamId,
    search: filters.search || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy,
    sortOrder,
    page,
    pageSize: PAGE_SIZE,
  });

  function handleSort(col: string) {
    if (col === sortBy) {
      setSortOrder((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'));
    } else {
      setSortBy(col);
      setSortOrder('DESC');
    }
    setPage(1);
  }

  const isGwMode = selectedGameweek != null;

  return (
    <Stack gap="sm">
      <Group align="baseline" gap="sm">
        <Title order={2}>Player Explorer</Title>
        {isGwMode ? (
          <Badge color="violet" variant="light" size="lg">
            Gameweek {selectedGameweek}
          </Badge>
        ) : (
          <Text c="dimmed" size="sm">Full season · 2025–26</Text>
        )}
      </Group>

      <PlayerFilters value={filters} onChange={setFilters} />

      <PlayersTable
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        sort={{ sortBy, sortOrder }}
        page={page}
        pageSize={PAGE_SIZE}
        isGwMode={isGwMode}
        onSort={handleSort}
        onPageChange={setPage}
      />
    </Stack>
  );
}
