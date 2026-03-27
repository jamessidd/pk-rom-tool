import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLocalStatus, fetchLocalSoulLink, fetchLocalParty, fetchLocalTrainer, fetchLocalEnemy } from '../utils/api';
import { isMockEnabled, generateMockLocalData, generateMockEnemyParty } from '../utils/mockData';

function sameSerialized(ref, value) {
  const next = JSON.stringify(value ?? null);
  if (ref.current === next) return true;
  ref.current = next;
  return false;
}

function useMockTracker() {
  const [mockData] = useState(() => generateMockLocalData());
  const [enemyParty, setEnemyParty] = useState([]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'b' || e.key === 'B') {
        setEnemyParty(prev => prev.length > 0 ? [] : generateMockEnemyParty());
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return {
    connected: true,
    status: mockData.status,
    soulLink: mockData.soulLink,
    party: mockData.party,
    trainerInfo: mockData.trainerInfo,
    enemyParty,
    refresh: () => {},
  };
}

function useRealTracker(localUrl) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus]       = useState(null);
  const [soulLink, setSoulLink]   = useState(null);
  const [party, setParty]         = useState([]);
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [enemyParty, setEnemyParty] = useState([]);
  const intervalRef = useRef(null);
  const detailRef = useRef(null);
  const enemyRef = useRef(null);
  const inBattleRef = useRef(false);
  const hiddenRef = useRef(typeof document !== 'undefined' ? document.visibilityState === 'hidden' : false);
  const statusReqRef = useRef(false);
  const detailReqRef = useRef(false);
  const enemyReqRef = useRef(false);
  const statusSigRef = useRef('');
  const soulSigRef = useRef('');
  const partySigRef = useRef('');
  const trainerSigRef = useRef('');
  const enemySigRef = useRef('');
  const [isHidden, setIsHidden] = useState(hiddenRef.current);

  const restartDetailPollingRef = useRef(() => {});

  const poll = useCallback(async () => {
    if (!localUrl || statusReqRef.current) return;
    statusReqRef.current = true;
    try {
      const [s, sl] = await Promise.all([
        fetchLocalStatus(localUrl),
        fetchLocalSoulLink(localUrl),
      ]);
      if (!sameSerialized(statusSigRef, s)) setStatus(s);
      if (!sameSerialized(soulSigRef, sl)) setSoulLink(sl);
      setConnected(true);
    } catch {
      setConnected(false);
    } finally {
      statusReqRef.current = false;
    }
  }, [localUrl]);

  const pollEnemy = useCallback(async () => {
    if (!localUrl || enemyReqRef.current) return;
    enemyReqRef.current = true;
    try {
      const ep = await fetchLocalEnemy(localUrl);
      const arr = Array.isArray(ep) ? ep : [];
      if (!sameSerialized(enemySigRef, arr)) setEnemyParty(arr);

      const nowInBattle = arr.length > 0;
      if (nowInBattle !== inBattleRef.current) {
        inBattleRef.current = nowInBattle;
        restartDetailPollingRef.current();
        pollDetailsRef.current();
      }
    } catch { /* keep previous */ }
    finally {
      enemyReqRef.current = false;
    }
  }, [localUrl]);

  const pollDetails = useCallback(async () => {
    if (!localUrl || detailReqRef.current) return;
    detailReqRef.current = true;
    try {
      const [p, t] = await Promise.all([
        fetchLocalParty(localUrl),
        fetchLocalTrainer(localUrl).catch(() => null),
      ]);
      const partyData = Array.isArray(p) ? p : [];
      if (!sameSerialized(partySigRef, partyData)) setParty(partyData);
      if (t && !sameSerialized(trainerSigRef, t)) setTrainerInfo(t);
    } catch {
      /* keep previous details */
    } finally {
      detailReqRef.current = false;
    }
  }, [localUrl]);

  const pollDetailsRef = useRef(pollDetails);
  pollDetailsRef.current = pollDetails;

  useEffect(() => {
    function handleVisibilityChange() {
      const hidden = document.visibilityState === 'hidden';
      hiddenRef.current = hidden;
      setIsHidden(hidden);
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const statusInterval = isHidden ? 5000 : 1500;
    const detailInterval = isHidden ? 10000 : (inBattleRef.current ? 1000 : 5000);
    const enemyInterval = isHidden ? 2000 : 500;

    restartDetailPollingRef.current = () => {
      clearInterval(detailRef.current);
      const nextDetailInterval = hiddenRef.current ? 10000 : (inBattleRef.current ? 1000 : 5000);
      detailRef.current = setInterval(pollDetailsRef.current, nextDetailInterval);
    };

    poll();
    pollDetails();
    pollEnemy();
    intervalRef.current = setInterval(poll, statusInterval);
    detailRef.current = setInterval(pollDetails, detailInterval);
    enemyRef.current = setInterval(pollEnemy, enemyInterval);
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(detailRef.current);
      clearInterval(enemyRef.current);
    };
  }, [poll, pollDetails, pollEnemy, isHidden]);

  return { connected, status, soulLink, party, trainerInfo, enemyParty, refresh: poll };
}

export default function useLocalTracker(localUrl) {
  const mock = isMockEnabled();
  const mockResult = useMockTracker();
  const realResult = useRealTracker(mock ? '' : localUrl);
  return mock ? mockResult : realResult;
}
