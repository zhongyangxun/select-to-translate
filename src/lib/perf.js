import { PERF } from './build-env.js';

export const markTiming = (name) => {
  if (!PERF) return;
  performance.mark(name);
};

export const measureMarks = () => {
  if (!PERF) return;

  const entries = performance.getEntriesByType('mark');
  performance.clearMarks();

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

export const logMarks = () => {
  if (!PERF) return;

  const entries = measureMarks();
  console.log('mark entries', JSON.stringify(entries, null, 2));
};
