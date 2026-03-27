import { useEffect, useState } from 'react';
import { getHistory } from '../services/history';
import type { HistoryJob } from '../types';

async function findHistoryJob(jobId: string | null): Promise<HistoryJob | null> {
  if (!jobId) {
    return null;
  }

  const history = await getHistory();
  return history.find((job) => job.jobId === jobId) ?? null;
}

export function useHistoryJob(jobId: string | null) {
  const [historyJob, setHistoryJob] = useState<HistoryJob | null>(null);

  useEffect(() => {
    let active = true;

    void findHistoryJob(jobId).then((job) => {
      if (active) {
        setHistoryJob(job);
      }
    });

    return () => {
      active = false;
    };
  }, [jobId]);

  return historyJob;
}
