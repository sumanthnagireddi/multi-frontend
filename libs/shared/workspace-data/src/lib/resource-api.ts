import { getApiUrl } from './api-config';

export interface ResourceTreeNode {
  id: string;
  type: 'space' | 'folder' | 'page';
  title: string;
  spaceKey: string;
  parentId: string | null;
  children: ResourceTreeNode[];
}

export interface ResourcePage {
  id: string;
  title: string;
  spaceKey: string;
  parentId: string | null;
  body: string;
  version: number;
  lastModifiedBy: string;
  lastModifiedAt: string;
  url: string;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch {
      // Keep the status-based message when the response has no JSON body.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const resourceApi = {
  getTree(spaceKey?: string, signal?: AbortSignal) {
    const query = spaceKey ? `?spaceKey=${encodeURIComponent(spaceKey)}` : '';
    return requestJson<ResourceTreeNode[]>(`/atlassian/v2/folders${query}`, { signal });
  },

  getPage(pageId: string, signal?: AbortSignal) {
    return requestJson<ResourcePage>(`/atlassian/v2/pages/${encodeURIComponent(pageId)}`, {
      signal,
    });
  },

  updatePage(pageId: string, title: string, body: string) {
    return requestJson<ResourcePage>(`/atlassian/v2/pages/${encodeURIComponent(pageId)}`, {
      method: 'PUT',
      body: JSON.stringify({ title, body }),
    });
  },
};
