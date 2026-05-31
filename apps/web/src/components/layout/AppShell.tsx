import { ReactNode } from 'react';
import { AppShell as MantineAppShell, Burger, Group, NavLink, Text, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGameweekStore } from '../../store/gameweek.store';

const NAV_ITEMS = [
  { label: 'Players', path: '/players' },
  { label: 'Gameweeks', path: '/gameweeks' },
  { label: 'Teams', path: '/teams' },
  { label: 'Fixtures', path: '/fixtures' },
  { label: 'Compare', path: '/compare' },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedGameweek, setSelectedGameweek } = useGameweekStore();

  const gameweekOptions = Array.from({ length: 38 }, (_, i) => ({
    value: String(i + 1),
    label: `GW ${i + 1}`,
  }));

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="lg" c="violet">Fantasy Analytics</Text>
            <Text size="xs" c="dimmed">2025-26</Text>
          </Group>
          <Select
            placeholder="Select Gameweek"
            data={gameweekOptions}
            value={selectedGameweek ? String(selectedGameweek) : null}
            onChange={(v) => setSelectedGameweek(v ? Number(v) : null)}
            w={130}
            size="sm"
            clearable
          />
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="sm">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            label={item.label}
            active={location.pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
            mb={4}
          />
        ))}
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
