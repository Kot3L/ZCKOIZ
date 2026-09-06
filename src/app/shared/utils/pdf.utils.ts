export function dataUrlToBlobUrl(dataUrl: string): string {
  const [meta, b64] = dataUrl.split(',');
  const mime = meta.match(/data:([^;]+)/)?.[1] ?? 'application/octet-stream';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

export function revokeBlobUrl(url: string | null) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

export function fileNameFromUrl(url: string, fallback: string): string {
  try {
    const name = decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? '');
    return name || fallback;
  } catch {
    return fallback;
  }
}