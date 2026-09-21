import fs from 'fs';
import path from 'path';

// In-memory cache for serverless environments where filesystem is read-only
const memoryStore: Record<string, any> = {};

function getDataDir(): string {
  // Try local project data folder, fallback to /tmp on serverless environments like Vercel
  const localDir = path.resolve(process.cwd(), 'data');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    // Test write
    const testFile = path.join(localDir, '.write-test');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return localDir;
  } catch {
    const tmpDir = path.resolve('/tmp', 'ai-compliance-data');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {}
    }
    return tmpDir;
  }
}

export function getStoredData<T>(filename: string, defaultData: T): T {
  if (memoryStore[filename]) {
    return memoryStore[filename] as T;
  }

  try {
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      memoryStore[filename] = defaultData;
      try {
        if (defaultData && (!Array.isArray(defaultData) || (defaultData as any[]).length > 0)) {
          fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
        }
      } catch {}
      return defaultData;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content) as T;
    memoryStore[filename] = parsed;
    return parsed;
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    memoryStore[filename] = defaultData;
    return defaultData;
  }
}

export function saveStoredData<T>(filename: string, data: T): void {
  memoryStore[filename] = data;
  try {
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error saving ${filename}:`, err);
  }
}

