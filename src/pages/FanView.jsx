import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/askGemini';
import { buildQueuePredictionPrompt, buildGateInfoPrompt, buildRecapPrompt } from '../lib/prompts';
import { TABLES, NOTIFICATION_DISPLAY_LIMIT } from '../lib/constants';
import { useAsyncAction } from '../hooks/useAsyncAction';
import InlineNotice from '../components/InlineNotice';
import NavigationForm from '../components/fan/NavigationForm';
import PredictionResults from '../components/fan/PredictionResults';
import GateInfoCards from '../components/fan/GateInfoCards';
import MatchdayRecap from '../components/fan/MatchdayRecap';

export default function FanView() {
  // Core selection state
  const [gates, setGates] = useState([]);
  const [selectedGate, setSelectedGate] = useState('Gate 3');
  const [waitTime, setWaitTime] = useState(15);
  const [needsAccessibility, setNeedsAccessibility] = useState(false);

  // Feature results (the async loading/error state for each now lives in useAsyncAction)
  const [prediction, setPrediction] = useState(null);
  const [gateInfo, setGateInfo] = useState(null);
  const [recap, setRecap] = useState(null);
  const [sessionStats, setSessionStats] = useState({ predictions: 0, notificationsSeen: 0 });

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [dismissedNotifs, setDismissedNotifs] = useState(new Set());

  const prediction$ = useAsyncAction();
  const gateInfo$ = useAsyncAction();
  const recap$ = useAsyncAction();

  // Caches AI responses per gate so re-selecting a gate already viewed this
  // session returns instantly instead of firing a new Gemini call for
  // identical input — real, measurable savings in both time and API cost.
  const gateInfoCache = useRef(new Map());

  const targetGate = useMemo(
    () => gates.find((g) => g.gate_id === selectedGate) ?? null,
    [gates, selectedGate]
  );

  const fetchGates = useCallback(async () => {
    const { data, error } = await supabase.from(TABLES.STADIUM_STATE).select('*').order('gate_id');
    if (error) {
      console.error('Failed to fetch stadium_state:', error);
      return;
    }
    setGates(data ?? []);
  }, []);

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from(TABLES.NOTIFICATIONS)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(NOTIFICATION_DISPLAY_LIMIT);

    if (error) {
      console.error('Failed to fetch notifications:', error);
      return;
    }
    setNotifications(data ?? []);
    setSessionStats((prev) => ({ ...prev, notificationsSeen: data?.length ?? 0 }));
  }, []);

  // Live gate telemetry: load once, then subscribe instead of polling.
  useEffect(() => {
    fetchGates();
    const channel = supabase
      .channel('fan-stadium-state')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.STADIUM_STATE }, fetchGates)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchGates]);

  // Live organizer broadcasts: same subscribe-instead-of-poll pattern.
  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel('fan-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.NOTIFICATIONS }, fetchNotifications)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications]);

  // Prune dismissed notification ids once they've dropped out of the live feed.
  useEffect(() => {
    setDismissedNotifs((prev) => {
      const stillPresent = new Set(notifications.map((n) => n.id));
      const next = new Set([...prev].filter((id) => stillPresent.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [notifications]);

  const getGateInfo = useCallback(async () => {
    if (!targetGate) return;

    const cached = gateInfoCache.current.get(targetGate.gate_id);
    if (cached) {
      setGateInfo(cached);
      return;
    }

    await gateInfo$.run(
      () => askGemini(buildGateInfoPrompt({ context: targetGate.context })),
      {
        onSuccess: (result) => {
          gateInfoCache.current.set(targetGate.gate_id, result);
          setGateInfo(result);
        },
        errorMessage: "Couldn't load gate context — try again.",
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetGate]);

  useEffect(() => {
    if (targetGate) getGateInfo();
  }, [targetGate, getGateInfo]);

  const handleDismissNotif = (id) => {
    setDismissedNotifs((prev) => new Set(prev).add(id));
  };

  const handlePredict = () => {
    if (!targetGate) {
      prediction$.setError('No data available for this gate yet — try again shortly.');
      return;
    }
    prediction$.run(
      () => askGemini(buildQueuePredictionPrompt({ gateId: selectedGate, gate: targetGate, waitTime, needsAccessibility })),
      {
        onSuccess: (result) => {
          setPrediction(result);
          setSessionStats((prev) => ({ ...prev, predictions: prev.predictions + 1 }));
        },
        errorMessage: "Couldn't reach AI right now — try again.",
      }
    );
  };

  const handleGenerateRecap = () => {
    recap$.run(
      () => askGemini(buildRecapPrompt({ sessionStats, gateId: selectedGate, needsAccessibility })),
      {
        onSuccess: setRecap,
        errorMessage: "Couldn't generate your recap — try again.",
      }
    );
  };

  const visibleNotifications = useMemo(
    () => notifications.filter((n) => !dismissedNotifs.has(n.id)),
    [notifications, dismissedNotifs]
  );

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-slate-950 overflow-hidden text-slate-200 selection:bg-blue-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="p-6 max-w-4xl mx-auto space-y-6 relative z-10">
        {visibleNotifications.map((n) => (
          <InlineNotice key={n.id} tone="amber" onDismiss={() => handleDismissNotif(n.id)}>
            <strong className="text-amber-300 font-bold tracking-wide uppercase text-xs mr-2 border border-amber-500/30 px-2 py-0.5 rounded bg-amber-500/10">
              Broadcast
            </strong>
            {n.message}
          </InlineNotice>
        ))}

        {prediction$.error && <InlineNotice tone="red">{prediction$.error}</InlineNotice>}
        {gateInfo$.error && <InlineNotice tone="red">{gateInfo$.error}</InlineNotice>}
        {recap$.error && <InlineNotice tone="red">{recap$.error}</InlineNotice>}

        <NavigationForm
          gates={gates}
          selectedGate={selectedGate}
          onSelectGate={setSelectedGate}
          waitTime={waitTime}
          onSelectWaitTime={setWaitTime}
          needsAccessibility={needsAccessibility}
          onToggleAccessibility={setNeedsAccessibility}
          onPredict={handlePredict}
          loading={prediction$.loading}
        />

        <PredictionResults prediction={prediction} waitTime={waitTime} />

        <GateInfoCards gateInfo={gateInfo} loading={gateInfo$.loading} />

        <MatchdayRecap recap={recap} loading={recap$.loading} onGenerate={handleGenerateRecap} />
      </div>
    </div>
  );
}
