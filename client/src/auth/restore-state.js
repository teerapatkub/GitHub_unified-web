export function createAuthRestorer({ fetchPlayer, onPlayer, onError, onReady }) {
  let sequence = 0;
  let stopped = false;

  const restore = async () => {
    const request = ++sequence;
    try {
      const player = await fetchPlayer();
      if (stopped || request !== sequence) return;
      onError('');
      onPlayer(player);
    } catch (error) {
      if (stopped || request !== sequence) return;
      onPlayer(null);
      onError(error.message);
    } finally {
      if (!stopped && request === sequence) onReady();
    }
  };

  const signedOut = () => {
    sequence += 1;
    onPlayer(null);
    onReady();
  };

  return { restore, signedOut, stop: () => { stopped = true; sequence += 1; } };
}
