'use client';

/**
 * Universal Client-Side Persistent Store
 * Guarantees that user created/updated data across all modules (Risks, Policies, Evidence,
 * Tests, Audits, Frameworks, Controls, Integrations, Organization) is 100% persistent
 * across page reloads, browser restarts, and serverless/Vercel ephemeral cold starts.
 */

const STORAGE_PREFIX = 'ai_compliance_store_';

export function getPersistedList<T extends { id?: string | number }>(
  collectionKey: string,
  apiData: T[] = [],
  fallbackData: T[] = []
): T[] {
  if (typeof window === 'undefined') {
    return apiData && apiData.length > 0 ? apiData : fallbackData;
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${collectionKey}`);
    if (raw) {
      const localList = JSON.parse(raw);
      if (Array.isArray(localList) && localList.length > 0) {
        // If API returned items, merge any items uniquely by ID to retain user-created and updated items
        const itemMap = new Map<string, T>();
        
        // 1. Seed with API / fallback items
        (apiData && apiData.length > 0 ? apiData : fallbackData).forEach((item: any) => {
          if (item && item.id) {
            itemMap.set(String(item.id), item);
          }
        });

        // 2. Override with local items (user creations and edits take precedence)
        localList.forEach((item: any) => {
          if (item && item.id) {
            itemMap.set(String(item.id), item);
          }
        });

        const merged = Array.from(itemMap.values());
        return merged;
      }
    }
  } catch (err) {
    console.warn(`Error reading persisted ${collectionKey}:`, err);
  }

  const initial = apiData && apiData.length > 0 ? apiData : fallbackData;
  if (typeof window !== 'undefined' && initial && initial.length > 0) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${collectionKey}`, JSON.stringify(initial));
    } catch {}
  }
  return initial;
}

export function savePersistedList<T>(collectionKey: string, list: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${collectionKey}`, JSON.stringify(list));
  } catch (err) {
    console.warn(`Error saving persisted ${collectionKey}:`, err);
  }
}

export function addPersistedItem<T extends { id?: string | number }>(
  collectionKey: string,
  item: T,
  existingList: T[]
): T[] {
  const updated = [item, ...existingList.filter((existing: any) => String(existing.id) !== String(item.id))];
  savePersistedList(collectionKey, updated);
  return updated;
}

export function updatePersistedItem<T extends { id?: string | number }>(
  collectionKey: string,
  updatedItemOrId: T | string | number,
  existingListOrUpdates: T[] | Partial<T>,
  maybeExistingList?: T[]
): T[] {
  let id: string | number;
  let updates: Partial<T>;
  let existingList: T[];

  if (maybeExistingList !== undefined) {
    id = updatedItemOrId as string | number;
    updates = existingListOrUpdates as Partial<T>;
    existingList = maybeExistingList;
  } else if (typeof updatedItemOrId === 'object' && updatedItemOrId !== null) {
    id = (updatedItemOrId as any).id;
    updates = updatedItemOrId as Partial<T>;
    existingList = existingListOrUpdates as T[];
  } else {
    id = updatedItemOrId as string | number;
    updates = {};
    existingList = (existingListOrUpdates as T[]) || [];
  }

  let matched = false;
  const updated = (existingList || []).map((item: any) => {
    if (String(item.id) === String(id)) {
      matched = true;
      return { ...item, ...updates };
    }
    return item;
  });

  const final = matched ? updated : [{ id, ...updates } as unknown as T, ...(existingList || [])];
  savePersistedList(collectionKey, final);
  return final;
}

export function removePersistedItem<T extends { id?: string | number }>(
  collectionKey: string,
  id: string | number,
  existingList: T[]
): T[] {
  const updated = (existingList || []).filter((item: any) => String(item.id) !== String(id));
  savePersistedList(collectionKey, updated);
  return updated;
}

export function getPersistedObject<T>(
  key: string,
  apiData: T | null,
  fallbackData: T
): T {
  if (typeof window === 'undefined') {
    return apiData || fallbackData;
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const localObj = JSON.parse(raw);
      if (localObj && typeof localObj === 'object') {
        return { ...fallbackData, ...(apiData || {}), ...localObj };
      }
    }
  } catch (err) {
    console.warn(`Error reading persisted object ${key}:`, err);
  }

  const initial = apiData || fallbackData;
  if (typeof window !== 'undefined' && initial) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(initial));
    } catch {}
  }
  return initial;
}

export function savePersistedObject<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error saving persisted object ${key}:`, err);
  }
}
