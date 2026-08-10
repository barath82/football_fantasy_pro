import { useState } from 'react';
import { GameweekBadge } from '../components/GameweekBadge';
import { ChallengeBlock } from '../components/ChallengeBlock';
import { PlayerPicker } from '../components/PlayerPicker';
import { SquadPicker } from '../components/SquadPicker';
import { FormationPicker } from '../components/FormationPicker';
import type { PlayerRow } from '../../hooks/usePlayers';
import type { SquadPlayer } from '../mock/presetSquad';

export function Challenges() {
  const [transferIn, setTransferIn] = useState<PlayerRow | null>(null);
  const [transferOut, setTransferOut] = useState<SquadPlayer | null>(null);
  const [differentialSucceed, setDifferentialSucceed] = useState<PlayerRow | null>(null);
  const [differentialBlank, setDifferentialBlank] = useState<PlayerRow | null>(null);
  const [formation, setFormation] = useState('4-3-3');
  const [captain, setCaptain] = useState<SquadPlayer | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const picksMade = [transferIn, transferOut, differentialSucceed, differentialBlank, formation, captain].filter(
    Boolean,
  ).length;

  return (
    <div className="py-4 pb-20">
      <GameweekBadge />
      <h1 className="mt-2 text-[1.2375rem]">Your picks</h1>

      <div className="mt-6">
        <ChallengeBlock title="Transfer Guru" description="One in, one out. We track the net points.">
          <PlayerPicker label="Transfer in" value={transferIn} onChange={setTransferIn} placeholder="Search for a player" />
          <SquadPicker label="Transfer out" value={transferOut} onChange={setTransferOut} />
        </ChallengeBlock>

        <ChallengeBlock title="Differential Guru" description="Read the crowd.">
          <PlayerPicker
            label="Low-owned pick to succeed (<10%)"
            value={differentialSucceed}
            onChange={setDifferentialSucceed}
            maxOwnership={10}
            placeholder="Search for a differential"
          />
          <PlayerPicker
            label="Popular pick to blank (>20%)"
            value={differentialBlank}
            onChange={setDifferentialBlank}
            minOwnership={20}
            placeholder="Search for a popular pick"
          />
        </ChallengeBlock>

        <ChallengeBlock title="Strategy Guru" description="Structure and armband.">
          <div>
            <p className="mb-1.5 text-xs font-medium" style={{ color: 'var(--pw-fg-muted)' }}>
              Formation
            </p>
            <FormationPicker value={formation} onChange={setFormation} />
          </div>
          <SquadPicker label="Captain" value={captain} onChange={setCaptain} />
        </ChallengeBlock>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-20"
        style={{ background: 'var(--pw-surface)', borderTop: '1px solid var(--pw-border)' }}
      >
        <div
          className="mx-auto flex max-w-[560px] items-center justify-between px-5 pt-3.5"
          style={{ paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))' }}
        >
          <span className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            {picksMade}/6 picks made
          </span>
          <button
            type="button"
            disabled={picksMade < 6 || submitted}
            onClick={() => setSubmitted(true)}
            className="pw-focus rounded-full px-5 py-2 text-sm font-medium disabled:opacity-40"
            style={{
              background: submitted ? 'var(--pw-surface-2)' : 'var(--pw-accent)',
              color: submitted ? 'var(--pw-fg-muted)' : 'var(--pw-accent-fg)',
            }}
          >
            {submitted ? 'Locked in' : 'Submit picks'}
          </button>
        </div>
      </div>
    </div>
  );
}
