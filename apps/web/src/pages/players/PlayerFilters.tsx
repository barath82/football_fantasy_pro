import { Group, NumberInput, Select, SegmentedControl, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useTeams } from '../../hooks/useTeams';

const POSITIONS = [
  { label: 'All', value: '' },
  { label: 'GKP', value: '1' },
  { label: 'DEF', value: '2' },
  { label: 'MID', value: '3' },
  { label: 'FWD', value: '4' },
];

export interface FilterState {
  positionId?: number;
  teamId?: number;
  search: string;
  minPrice?: number;
  maxPrice?: number;
}

interface PlayerFiltersProps {
  value: FilterState;
  onChange: (f: FilterState) => void;
}

export function PlayerFilters({ value, onChange }: PlayerFiltersProps) {
  const { data: teams = [] } = useTeams();
  const [searchInput, setSearchInput] = useState(value.search);
  const [debounced] = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    onChange({ ...value, search: debounced });
  }, [debounced]);

  const teamOptions = [
    { value: '', label: 'All teams' },
    ...teams.map((t) => ({ value: String(t.id), label: t.name })),
  ];

  return (
    <Group gap="sm" wrap="wrap" mb="md">
      <SegmentedControl
        size="sm"
        data={POSITIONS}
        value={value.positionId ? String(value.positionId) : ''}
        onChange={(v) => onChange({ ...value, positionId: v ? Number(v) : undefined })}
      />

      <Select
        placeholder="All teams"
        data={teamOptions}
        value={value.teamId ? String(value.teamId) : ''}
        onChange={(v) => onChange({ ...value, teamId: v ? Number(v) : undefined })}
        clearable
        searchable
        size="sm"
        w={160}
      />

      <TextInput
        placeholder="Search player..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.currentTarget.value)}
        size="sm"
        w={180}
      />

      <NumberInput
        placeholder="Min £"
        value={value.minPrice != null ? value.minPrice / 10 : ''}
        onChange={(v) =>
          onChange({ ...value, minPrice: v !== '' ? Math.round(Number(v) * 10) : undefined })
        }
        min={3.5}
        max={20}
        step={0.1}
        decimalScale={1}
        prefix="£"
        size="sm"
        w={95}
      />

      <NumberInput
        placeholder="Max £"
        value={value.maxPrice != null ? value.maxPrice / 10 : ''}
        onChange={(v) =>
          onChange({ ...value, maxPrice: v !== '' ? Math.round(Number(v) * 10) : undefined })
        }
        min={3.5}
        max={20}
        step={0.1}
        decimalScale={1}
        prefix="£"
        size="sm"
        w={95}
      />
    </Group>
  );
}
