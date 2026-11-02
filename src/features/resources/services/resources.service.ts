import { environment } from '@/shared/config/env';

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${environment.resourcesApiUrl}${path}`, {
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
      // Keep the status-based message.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export const resourcesService = {
  getTree(spaceKey?: string, signal?: AbortSignal) {
    const query = spaceKey ? `?spaceKey=${encodeURIComponent(spaceKey)}` : '';
    return request<ResourceTreeNode[]>(`/atlassian/v2/folders${query}`, { signal });
  },
  getPage(pageId: string, signal?: AbortSignal) {
    return request<ResourcePage>(`/atlassian/v2/pages/${encodeURIComponent(pageId)}`, { signal });
  },
  updatePage(pageId: string, title: string, body: string, parentId?: string, signal?: AbortSignal) {
    return request<ResourcePage>(`/atlassian/v2/pages/${encodeURIComponent(pageId)}`, {
      method: 'PUT',
      body: JSON.stringify({ title, body, ...(parentId ? { parentId } : {}) }),
      signal,
    });
  },
  createPage(title: string, spaceKey: string, parentId?: string, body = '<p><br /></p>') {
    return request<ResourcePage>('/atlassian/v2/pages', {
      method: 'POST',
      body: JSON.stringify({ title, spaceKey, parentId, body }),
    });
  },
  deletePage(pageId: string) {
    return request<{ success: boolean; message: string }>(`/atlassian/v2/pages/${encodeURIComponent(pageId)}`, {
      method: 'DELETE',
    });
  },
};

export function flattenResourcePages(nodes: ResourceTreeNode[]): ResourceTreeNode[] {
  const pages: ResourceTreeNode[] = [];
  const visit = (node: ResourceTreeNode) => {
    if (node.type === 'page') pages.push(node);
    node.children?.forEach(visit);
  };
  nodes.forEach(visit);
  return pages;
}
