import { handleClientApiRequest } from '@/lib/api/clientApi';

export async function defaultFetcher(url: string) {
  if (url.includes('/api/')) {
    return await handleClientApiRequest(url, { method: 'GET' });
  }

  const res = await fetch(url);
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const json = await res.json();
      if (json && json.error) errorMsg = json.error;
    } catch {}
    throw new Error(errorMsg);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Request failed');
  }
  return json;
}

export async function postFetcher(url: string, { arg }: { arg: any }) {
  if (url.includes('/api/')) {
    const res = await handleClientApiRequest(url, {
      method: 'POST',
      body: JSON.stringify(arg),
    });
    return res.data;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const json = await res.json();
      if (json && json.error) errorMsg = json.error;
    } catch {}
    throw new Error(errorMsg);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}

export async function patchFetcher(url: string, { arg }: { arg: any }) {
  if (url.includes('/api/')) {
    const res = await handleClientApiRequest(url, {
      method: 'PATCH',
      body: JSON.stringify(arg),
    });
    return res.data;
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const json = await res.json();
      if (json && json.error) errorMsg = json.error;
    } catch {}
    throw new Error(errorMsg);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}

export async function deleteFetcher(url: string, { arg }: { arg?: any } = {}) {
  if (url.includes('/api/')) {
    const res = await handleClientApiRequest(url, {
      method: 'DELETE',
      body: arg ? JSON.stringify(arg) : undefined,
    });
    return res.data;
  }

  const res = await fetch(url, {
    method: 'DELETE',
    headers: arg ? { 'Content-Type': 'application/json' } : undefined,
    body: arg ? JSON.stringify(arg) : undefined,
  });
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const json = await res.json();
      if (json && json.error) errorMsg = json.error;
    } catch {}
    throw new Error(errorMsg);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}
