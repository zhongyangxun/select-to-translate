import { PERF } from './build-env.js';

export const markTiming = (name) => {
  if (!PERF) return;
  performance.mark(name);
};

export const measureMarkIntervals = () => {
  if (!PERF) return;

  const entries = performance.getEntriesByType('mark');

  return entries.map((entry, index) => {
    const markInterval = Math.round(
      entry.startTime - (entries?.[index - 1]?.startTime ?? 0),
    );

    return {
      name: entry.name,
      markInterval,
    };
  });
};

export const normalizeMarkEntries = (entries) => {
  return entries.map((entry) => {
    const { name, startTime } = entry;

    return {
      name,
      at: Math.round(startTime),
    };
  });
};

export const logMarks = () => {
  if (!PERF) return;

  const markEntries = performance.getEntriesByType('mark');

  performance.clearMarks();

  console.log(
    'mark entries',
    JSON.stringify(normalizeMarkEntries(markEntries), null, 2),
  );
};
