'use client';

import { useEffect } from 'react';
import { MAXIMUM_HOSTILITY } from '@/data/maximumHostility';

interface UseMaximumHeartbeatPulseOptions {
  active?: boolean;
  onPulse: (strength: number) => void;
}

export function useMaximumHeartbeatPulse({ active = true, onPulse }: UseMaximumHeartbeatPulseOptions) {
  useEffect(() => {
    if (!active) return;
    const base = setInterval(() => {
      onPulse(MAXIMUM_HOSTILITY.heartbeat.baseStrength);
    }, MAXIMUM_HOSTILITY.heartbeat.intervalMs);
    const spike = setInterval(() => {
      onPulse(MAXIMUM_HOSTILITY.heartbeat.spikeStrength);
    }, MAXIMUM_HOSTILITY.heartbeat.spikeIntervalMs);
    return () => {
      clearInterval(base);
      clearInterval(spike);
    };
  }, [active, onPulse]);
}

export default useMaximumHeartbeatPulse;
