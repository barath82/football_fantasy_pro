import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useCurrentGameweek } from '../../hooks/useGameweeks';
import { GameweekBadge } from '../components/GameweekBadge';
import { ChallengeBlock } from '../components/ChallengeBlock';
import { PlayerPicker } from '../components/PlayerPicker';
import { FormationPicker } from '../components/FormationPicker';
import { DifferentialGuruIcon, StrategyGuruIcon, TransferGuruIcon } from '../components/guru-icons';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../hooks/useAuth';
import { readDraft, saveDraft, clearDraft, type PickDraft } from '../lib/pickDraft';
import type { PlayerRow } from '../../hooks/usePlayers';

export function Challenges() {
  usePageTitle('Weekly Challenges — FantasyBrahma');

  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { current } = useCurrentGameweek();
  const gameweekFplId = current?.fplId ?? 1;

  const [transferIn, setTransferIn] = useState<PlayerRow | null>(null);
  const [transferOut, setTransferOut] = useState<PlayerRow | null>(null);
  const [differentialSucceed, setDifferentialSucceed] = useState<PlayerRow | null>(null);
  const [differentialBlank, setDifferentialBlank] = useState<PlayerRow | null>(null);
  const [formation, setFormation] = useState('4-3-3');
  const [captain, setCaptain] = useState<PlayerRow | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore a pending draft (just came back from login) or an already-
  // submitted pick for this gameweek, so picks survive a refresh/login round trip.
  useEffect(() => {
    if (authLoading || hydrated) return;

    const hydrateFromIds = async (ids: Omit<PickDraft, 'gameweekFplId'>) => {
      const [inRes, outRes, succeedRes, blankRes, captainRes] = await Promise.all([
        api.get(`/players/${ids.transferInPlayerId}`),
        api.get(`/players/${ids.transferOutPlayerId}`),
        api.get(`/players/${ids.differentialSucceedPlayerId}`),
        api.get(`/players/${ids.differentialBlankPlayerId}`),
        api.get(`/players/${ids.captainPlayerId}`),
      ]);
      setTransferIn(inRes.data.player);
      setTransferOut(outRes.data.player);
      setDifferentialSucceed(succeedRes.data.player);
      setDifferentialBlank(blankRes.data.player);
      setCaptain(captainRes.data.player);
      setFormation(ids.formation);
    };

    const draft = readDraft();
    if (draft) {
      hydrateFromIds(draft)
        .catch(() => setSubmitError('Could not restore your picks — please re-pick.'))
        .finally(() => {
          clearDraft();
          setHydrated(true);
        });
      return;
    }

    if (isAuthenticated) {
      api
        .get('/picks/me', { params: { gameweek: gameweekFplId } })
        .then(({ data: pick }) => {
          if (!pick) return;
          return hydrateFromIds(pick).then(() => setSubmitted(true));
        })
        .catch(() => {})
        .finally(() => setHydrated(true));
      return;
    }

    setHydrated(true);
  }, [authLoading, isAuthenticated, gameweekFplId, hydrated]);

  const picksMade = [transferIn, transferOut, differentialSucceed, differentialBlank, formation, captain].filter(
    Boolean,
  ).length;

  async function handleSubmit() {
    if (!transferIn || !transferOut || !differentialSucceed || !differentialBlank || !captain) return;

    const draft: PickDraft = {
      gameweekFplId,
      transferInPlayerId: transferIn.id,
      transferOutPlayerId: transferOut.id,
      differentialSucceedPlayerId: differentialSucceed.id,
      differentialBlankPlayerId: differentialBlank.id,
      formation,
      captainPlayerId: captain.id,
    };

    if (!isAuthenticated) {
      // Picks are allowed without an account — only submitting requires one.
      // Draft survives the round trip through login and comes back here.
      saveDraft(draft);
      navigate('/signup?returnTo=/challenges');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post('/picks', draft);
      setSubmitted(true);
    } catch {
      setSubmitError('Could not submit — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const submitLabel = submitted
    ? 'Locked in'
    : submitting
      ? 'Submitting…'
      : !isAuthenticated && picksMade === 6
        ? 'Sign in to submit'
        : 'Submit picks';

  return (
    <div className="pt-10 pb-32 sm:pt-16">
      <GameweekBadge />
      <h1 className="mt-2 text-3xl sm:text-4xl">Your picks</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
        Six calls. About a minute.
      </p>

      <div className="mt-6">
        <ChallengeBlock icon={TransferGuruIcon} title="Transfer Guru" description="One in, one out. We track the net points.">
          <PlayerPicker label="Transfer in" value={transferIn} onChange={setTransferIn} placeholder="Search for a player" />
          <PlayerPicker label="Transfer out" value={transferOut} onChange={setTransferOut} placeholder="Search for a player" />
        </ChallengeBlock>

        <ChallengeBlock icon={DifferentialGuruIcon} title="Differential Guru" description="Read the crowd.">
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

        <ChallengeBlock icon={StrategyGuruIcon} title="Strategy Guru" description="Structure and armband.">
          <div>
            <p className="mb-1.5 text-xs font-medium" style={{ color: 'var(--pw-fg-muted)' }}>
              Formation
            </p>
            <FormationPicker value={formation} onChange={setFormation} />
          </div>
          <PlayerPicker label="Captain" value={captain} onChange={setCaptain} placeholder="Search for a player" />
        </ChallengeBlock>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-20"
        style={{ background: 'var(--pw-surface)', borderTop: '1px solid var(--pw-border)' }}
      >
        <div
          className="mx-auto flex max-w-[560px] flex-col px-5 pt-3.5"
          style={{ paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))' }}
        >
          {submitError && (
            <p className="mb-2 text-xs" style={{ color: 'var(--pw-negative)' }}>
              {submitError}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
              {picksMade}/6 picks made
            </span>
            <button
              type="button"
              disabled={picksMade < 6 || submitted || submitting}
              onClick={handleSubmit}
              className="pw-focus rounded-full px-5 py-2 text-sm font-medium disabled:opacity-40"
              style={{
                background: submitted ? 'var(--pw-surface-2)' : 'var(--pw-accent)',
                color: submitted ? 'var(--pw-fg-muted)' : 'var(--pw-accent-fg)',
              }}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
