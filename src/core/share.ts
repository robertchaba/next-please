export type ShareResult = 'shared' | 'cancelled' | 'copied' | 'manual';

/** Called directly from a user gesture; all fallbacks keep the exact current URL. */
export async function sharePage(data: ShareData & { url: string }): Promise<ShareResult> {
  try {
    if (typeof navigator.share === 'function'
      && (typeof navigator.canShare !== 'function' || navigator.canShare(data))) {
      await navigator.share(data);
      return 'shared';
    }
  } catch (error) {
    // Dismissing the system sheet must not unexpectedly overwrite the clipboard.
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
  }
  try {
    await navigator.clipboard.writeText(data.url);
    return 'copied';
  } catch {
    // Clipboard access can be absent or denied, including in embedded pages.
    return 'manual';
  }
}
