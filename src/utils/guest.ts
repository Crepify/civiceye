/** Guest view helpers — guests may browse and review, never mutate. */
export function isGuest(): boolean {
  try {
    return window.localStorage.getItem('civiceye-guest') === '1';
  } catch {
    return false;
  }
}

/** Stable pseudo-id so a guest's reviews stay theirs for the session/device. */
export function guestId(): string {
  try {
    let id = window.localStorage.getItem('civiceye-guest-id');
    if (!id) {
      id = `guest-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem('civiceye-guest-id', id);
    }
    return id;
  } catch {
    return 'guest-anonymous';
  }
}
