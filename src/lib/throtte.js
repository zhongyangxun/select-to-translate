export const throttle = (fn, delay) => {
  let canRun = true;

  return (...args) => {
    if (!canRun) return;

    canRun = false;
    fn(...args);

    setTimeout(() => {
      canRun = true;
    }, delay);
  };
};
