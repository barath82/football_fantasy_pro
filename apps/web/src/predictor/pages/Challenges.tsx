import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useCurrentGameweek } from '../../hooks/useGameweeks';
import { useDeadline } from '../hooks/useDeadline';
import { GameweekBadge } from '../components/GameweekBadge';
import { ChallengeBlock } from '../components/ChallengeBlock';
import { PlayerPicker } from '../components/PlayerPicker';
import { FormationPicker } from '../components/FormationPicker';
import { ChipPicker } from '../components/ChipPicker';
import { TeamPicker } from '../components/TeamPicker';
import {
  CSGuruIcon,
  ChipGuruIcon,
  DifferentialGuruIcon,
  StrategyGuruIcon,
  TransferGuruIcon,
} from '../components/guru-icons';
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
  // Transfer Guru needs a prior gameweek's squad to judge the swing against —
  // there isn't one yet in Gameweek 1, so it's shown but disabled.
  const isGameweekOne = gameweekFplId === 1;
  // Live-ticking — flips the instant the deadline passes, no refresh needed.
  const { expired: deadlinePassed } = useDeadline(current?.deadlineTime ?? null);

  const [transferIn, setTransferIn] = useState<PlayerRow | null>(null);
  const [transferOut, setTransferOut] = useState<PlayerRow | null>(null);
  const [differentialSucceed, setDifferentialSucceed] = useState<PlayerRow | null>(null);
  const [differentialBlank, setDifferentialBlank] = useState<PlayerRow | null>(null);
  const [formation, setFormation] = useState('4-3-3');
  const [captain, setCaptain] = useState<PlayerRow | null>(null);
  const [chipPick, setChipPick] = useState<string | null>(null);
  const [csSucceedTeamId, setCsSucceedTeamId] = useState<number | null>(null);
  const [csFailTeamId, setCsFailTeamId] = useState<number | null>(null);

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
        ids.transferInPlayerId ? api.get(`/players/${ids.transferInPlayerId}`) : Promise.resolve(null),
        ids.transferOutPlayerId ? api.get(`/players/${ids.transferOutPlayerId}`) : Promise.resolve(null),
        api.get(`/players/${ids.differentialSucceedPlayerId}`),
        api.get(`/players/${ids.differentialBlankPlayerId}`),
        api.get(`/players/${ids.captainPlayerId}`),
      ]);
      setTransferIn(inRes?.data.player ?? null);
      setTransferOut(outRes?.data.player ?? null);
      setDifferentialSucceed(succeedRes.data.player);
      setDifferentialBlank(blankRes.data.player);
      setCaptain(captainRes.data.player);
      setFormation(ids.formation);
      setChipPick(ids.chipPick ?? null);
      setCsSucceedTeamId(ids.csSucceedTeamId ?? null);
      setCsFailTeamId(ids.csFailTeamId ?? null);
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

  // Chip Guru is optional — not everyone has a chip worth playing every week —
  // so it's deliberately left out of the required-picks count/gating below.
  const requiredCount = isGameweekOne ? 6 : 8;
  const picksMade = [
    isGameweekOne ? null : transferIn,
    isGameweekOne ? null : transferOut,
    differentialSucceed,
    differentialBlank,
    formation,
    captain,
    csSucceedTeamId,
    csFailTeamId,
  ].filter(Boolean).length;

  async function handleSubmit() {
    if (deadlinePassed) return;
    if (!isGameweekOne && (!transferIn || !transferOut)) return;
    if (!differentialSucceed || !differentialBlank || !captain) return;
    if (!csSucceedTeamId || !csFailTeamId) return;

    const draft: PickDraft = {
      gameweekFplId,
      transferInPlayerId: isGameweekOne ? undefined : transferIn?.id,
      transferOutPlayerId: isGameweekOne ? undefined : transferOut?.id,
      differentialSucceedPlayerId: differentialSucceed.id,
      differentialBlankPlayerId: differentialBlank.id,
      formation,
      captainPlayerId: captain.id,
      chipPick: chipPick ?? undefined,
      csSucceedTeamId,
      csFailTeamId,
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
    } catch (err: any) {
      // Surfaces the real message for the deadline-just-passed edge case
      // (local clock ticked to "open" a beat before the server's did).
      setSubmitError(err.response?.data?.message ?? 'Could not submit — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const submitLabel = deadlinePassed
    ? 'Picks closed'
    : submitting
      ? 'Submitting…'
      : !isAuthenticated && picksMade === requiredCount
        ? 'Sign in to submit'
        : submitted
          ? 'Update picks'
          : 'Submit picks';

  return (
    <div className="pt-10 pb-32 sm:pt-16">
      <GameweekBadge />
      <h1 className="mt-2 text-3xl sm:text-4xl">Your picks</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
        {deadlinePassed
          ? 'The deadline has passed — picks are locked for this gameweek.'
          : isGameweekOne
            ? 'Six calls. About a minute. Edit anytime before the deadline.'
            : 'Eight calls. About a minute. Edit anytime before the deadline.'}
      </p>

      <div className="mt-6">
        <ChallengeBlock
          icon={TransferGuruIcon}
          title="Transfer Guru"
          description="One in, one out. We track the net points."
          disabled={isGameweekOne || deadlinePassed}
          disabledNote={
            deadlinePassed
              ? 'Picks are locked — the deadline has passed.'
              : "Not applicable for Gameweek 1 — there's no prior squad yet to judge a transfer against."
          }
        >
          <PlayerPicker
            label="Transfer in"
            value={transferIn}
            onChange={setTransferIn}
            placeholder="Search for a player"
            disabled={isGameweekOne || deadlinePassed}
          />
          <PlayerPicker
            label="Transfer out"
            value={transferOut}
            onChange={setTransferOut}
            placeholder="Search for a player"
            disabled={isGameweekOne || deadlinePassed}
          />
        </ChallengeBlock>

        <ChallengeBlock
          icon={DifferentialGuruIcon}
          title="Differential Guru"
          description="Read the crowd."
          disabled={deadlinePassed}
          disabledNote="Picks are locked — the deadline has passed."
        >
          <PlayerPicker
            label="Low-owned pick to succeed (<10%)"
            value={differentialSucceed}
            onChange={setDifferentialSucceed}
            maxOwnership={10}
            placeholder="Search for a differential"
            disabled={deadlinePassed}
          />
          <PlayerPicker
            label="Popular pick to blank (>20%)"
            value={differentialBlank}
            onChange={setDifferentialBlank}
            minOwnership={20}
            placeholder="Search for a popular pick"
            disabled={deadlinePassed}
          />
        </ChallengeBlock>

        <ChallengeBlock
          icon={StrategyGuruIcon}
          title="Strategy Guru"
          description="Structure and armband."
          disabled={deadlinePassed}
          disabledNote="Picks are locked — the deadline has passed."
        >
          <div>
            <p className="mb-1.5 text-xs font-medium" style={{ color: 'var(--pw-fg-muted)' }}>
              Formation
            </p>
            <FormationPicker value={formation} onChange={setFormation} disabled={deadlinePassed} />
          </div>
          <PlayerPicker
            label="Captain"
            value={captain}
            onChange={setCaptain}
            placeholder="Search for a player"
            disabled={deadlinePassed}
          />
        </ChallengeBlock>

        <ChallengeBlock
          icon={ChipGuruIcon}
          title="Chip Guru"
          description="Right chip, right week. Optional — tap again to clear."
          disabled={deadlinePassed}
          disabledNote="Picks are locked — the deadline has passed."
        >
          <ChipPicker value={chipPick} onChange={setChipPick} disabled={deadlinePassed} />
        </ChallengeBlock>

        <ChallengeBlock
          icon={CSGuruIcon}
          title="CS Guru"
          description="Some walls hold. Some don't."
          disabled={deadlinePassed}
          disabledNote="Picks are locked — the deadline has passed."
        >
          <TeamPicker
            label="Team to keep a clean sheet"
            value={csSucceedTeamId}
            onChange={setCsSucceedTeamId}
            excludeTeamId={csFailTeamId}
            disabled={deadlinePassed}
          />
          <TeamPicker
            label="Favored team to concede"
            value={csFailTeamId}
            onChange={setCsFailTeamId}
            excludeTeamId={csSucceedTeamId}
            disabled={deadlinePassed}
          />
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
              {deadlinePassed ? 'Picks closed' : `${picksMade}/${requiredCount} picks made`}
            </span>
            <button
              type="button"
              disabled={picksMade < requiredCount || submitting || deadlinePassed}
              onClick={handleSubmit}
              className="pw-focus rounded-full px-5 py-2 text-sm font-medium disabled:opacity-40"
              style={{
                background: deadlinePassed ? 'var(--pw-surface-2)' : 'var(--pw-accent)',
                color: deadlinePassed ? 'var(--pw-fg-muted)' : 'var(--pw-accent-fg)',
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
