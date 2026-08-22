import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useCurrentGameweek, useGameweeks } from '../../hooks/useGameweeks';
import { useDeadline } from '../hooks/useDeadline';
import { GameweekSwitcher } from '../components/GameweekSwitcher';
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
import { trackEvent } from '../../lib/analytics';

export function Challenges() {
  usePageTitle('Weekly Challenges - FantasyBrahma');

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { current } = useCurrentGameweek();
  const { data: gameweeks } = useGameweeks();

  // The gameweek being viewed/edited — defaults to the live current one, but
  // the switcher below lets you step to a locked past week (read-only) or
  // ahead to a future one (the backend already accepts picks for any
  // gameweek whose own deadline hasn't passed, not just "the" current one).
  const [selectedGwFplId, setSelectedGwFplId] = useState<number | null>(null);
  const [initialHydrationDone, setInitialHydrationDone] = useState(false);
  // Set when a login-redirect draft just populated the form directly, so the
  // gameweek-change effect below doesn't immediately re-fetch and clobber it.
  const skipNextGwFetch = useRef(false);

  const gameweekFplId = selectedGwFplId ?? current?.fplId ?? 1;
  // Transfer Guru needs a prior gameweek's squad to judge the swing against —
  // there isn't one yet in Gameweek 1, so it's shown but disabled.
  const isGameweekOne = gameweekFplId === 1;
  const selectedGw = gameweeks?.find((gw) => gw.fplId === gameweekFplId);
  // Live-ticking — flips the instant the deadline passes, no refresh needed.
  const { expired: deadlinePassed } = useDeadline(selectedGw?.deadlineTime ?? null);

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

  async function hydrateFromIds(ids: Omit<PickDraft, 'gameweekFplId'>) {
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
  }

  // Runs once: restores a pending draft (just came back from login), or —
  // once the live current gameweek resolves — just points the switcher at it.
  useEffect(() => {
    if (authLoading || initialHydrationDone) return;

    const draft = readDraft();
    if (draft) {
      hydrateFromIds(draft)
        .catch(() => setSubmitError('Could not restore your picks - please re-pick.'))
        .finally(() => {
          clearDraft();
          skipNextGwFetch.current = true;
          setSelectedGwFplId(draft.gameweekFplId);
          setInitialHydrationDone(true);
        });
      return;
    }

    if (!current) return; // wait for the live gameweek before defaulting to it
    setSelectedGwFplId(current.fplId);
    setInitialHydrationDone(true);
  }, [authLoading, current, initialHydrationDone]);

  // Runs on every gameweek change after the initial load (i.e. prev/next) —
  // resets the form, then loads whatever pick already exists for that week.
  useEffect(() => {
    if (!initialHydrationDone || selectedGwFplId == null) return;
    if (skipNextGwFetch.current) {
      skipNextGwFetch.current = false;
      return;
    }

    setTransferIn(null);
    setTransferOut(null);
    setDifferentialSucceed(null);
    setDifferentialBlank(null);
    setFormation('4-3-3');
    setCaptain(null);
    setChipPick(null);
    setCsSucceedTeamId(null);
    setCsFailTeamId(null);
    setSubmitted(false);
    setSubmitError(null);

    if (!isAuthenticated) return;

    api
      .get('/picks/me', { params: { gameweek: selectedGwFplId } })
      .then(({ data: pick }) => {
        if (!pick) return;
        return hydrateFromIds(pick).then(() => setSubmitted(true));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrateFromIds closes over setters only, stable across renders
  }, [selectedGwFplId, initialHydrationDone, isAuthenticated]);

  // Chip Guru is optional - not everyone has a chip worth playing every week -
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
      // Picks are allowed without an account - only submitting requires one.
      // Draft survives the round trip through login and comes back here.
      saveDraft(draft);
      navigate('/signup?returnTo=/challenges');
      return;
    }

    const isEdit = submitted;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post('/picks', draft);
      setSubmitted(true);
      // My Picks reads /picks/mine via React Query - without this it keeps
      // showing whatever was cached from before this submit (up to 5 min
      // stale), not the pick that was just made.
      await queryClient.invalidateQueries({ queryKey: ['picks', 'mine'] });
      trackEvent({
        name: 'picks_submitted',
        props: {
          gameweek: gameweekFplId,
          is_edit: isEdit,
          chip_picked: !!chipPick,
          chip: chipPick ?? undefined,
          formation,
        },
      });
    } catch (err: any) {
      // Surfaces the real message for the deadline-just-passed edge case
      // (local clock ticked to "open" a beat before the server's did).
      const message = err.response?.data?.message ?? 'Could not submit - please try again.';
      setSubmitError(message);
      trackEvent({ name: 'picks_submit_failed', props: { reason: message } });
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
    <div className="pt-[15.23px] pb-32 sm:pt-[24.37px]">
      <GameweekSwitcher gameweeks={gameweeks} selectedFplId={gameweekFplId} onChange={setSelectedGwFplId} />
      <h1 className="mt-2 text-3xl sm:text-4xl">Your picks</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
        {deadlinePassed
          ? 'The deadline has passed - picks are locked for this gameweek.'
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
              ? 'Picks are locked - the deadline has passed.'
              : "Not applicable for Gameweek 1 - there's no prior squad yet to judge a transfer against."
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
          disabledNote="Picks are locked - the deadline has passed."
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
          disabledNote="Picks are locked - the deadline has passed."
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
          description="Right chip, right week. Optional - tap again to clear."
          disabled={deadlinePassed}
          disabledNote="Picks are locked - the deadline has passed."
        >
          <ChipPicker value={chipPick} onChange={setChipPick} disabled={deadlinePassed} />
        </ChallengeBlock>

        <ChallengeBlock
          icon={CSGuruIcon}
          title="CS Guru"
          description="Some walls hold. Some don't."
          disabled={deadlinePassed}
          disabledNote="Picks are locked - the deadline has passed."
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
