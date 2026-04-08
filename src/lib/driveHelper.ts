/**
 * Google Drive helper — full CRUD for appDataFolder.
 * Uses Google Identity Services (GIS) + fetch-based Drive API.
 * 
 * File naming convention:
 *   - "preferences" — user preferences (one file)
 *   - "entries_batch_{id}" — batched files containing up to 100 entries each
 *   - "0" / "1" — legacy files from old app (read-only for migration)
 */

const CLIENT_ID = '577206274010-9oung4hgd77fij9e50kjbc32tlviai4e.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const BOUNDARY = '-------314159265358979323846';

let _accessToken: string | null = null;
let _tokenClient: any = null;

// ─── Auth ──────────────────────────────────────────────

function loadGisScript(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (typeof window === 'undefined') return reject('Not in browser');
		if ((window as any).google?.accounts?.oauth2) return resolve();
		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.onload = () => resolve();
		script.onerror = () => reject('Failed to load Google Identity Services');
		document.head.appendChild(script);
	});
}

const SIGNED_IN_KEY = 'tally-diary-signed-in';

/**
 * Prompt the user to sign in and obtain an access token.
 */
export async function authenticate(): Promise<string | null> {
	if (_accessToken) return _accessToken;

	await loadGisScript();

	return new Promise((resolve) => {
		_tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
			client_id: CLIENT_ID,
			scope: SCOPES,
			callback: (response: any) => {
				if (response.access_token) {
					_accessToken = response.access_token;
					localStorage.setItem(SIGNED_IN_KEY, 'true');
					resolve(response.access_token);
				} else {
					resolve(null);
				}
			},
			error_callback: () => resolve(null),
		});
		_tokenClient.requestAccessToken({ prompt: '' });
	});
}

/**
 * Try to silently re-authenticate without showing any popup.
 * Only works if the user has previously signed in and granted consent.
 * Returns the token or null if silent auth fails.
 */
export async function trySilentAuth(): Promise<string | null> {
	if (_accessToken) return _accessToken;
	if (typeof window === 'undefined') return null;

	// Only attempt if user has previously signed in
	if (!localStorage.getItem(SIGNED_IN_KEY)) return null;

	await loadGisScript();

	return new Promise((resolve) => {
		const timeoutId = setTimeout(() => resolve(null), 5000);

		_tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
			client_id: CLIENT_ID,
			scope: SCOPES,
			callback: (response: any) => {
				clearTimeout(timeoutId);
				if (response.access_token) {
					_accessToken = response.access_token;
					resolve(response.access_token);
				} else {
					resolve(null);
				}
			},
			error_callback: () => {
				clearTimeout(timeoutId);
				resolve(null);
			},
		});
		_tokenClient.requestAccessToken({ prompt: 'none' });
	});
}

/** Get the cached access token, or null if not signed in. */
export function getToken(): string | null {
	return _accessToken;
}

/** Check if the user is currently signed in. */
export function isSignedIn(): boolean {
	return !!_accessToken;
}

/** Check if user has previously signed in (persisted). */
export function hasSignedInBefore(): boolean {
	if (typeof window === 'undefined') return false;
	return !!localStorage.getItem(SIGNED_IN_KEY);
}

/** Sign out — revoke the token. */
export function signOut(): void {
	if (_accessToken) {
		(window as any).google?.accounts?.oauth2?.revoke?.(_accessToken);
	}
	_accessToken = null;
	localStorage.removeItem(SIGNED_IN_KEY);
}

// ─── Helpers ──────────────────────────────────────────

async function driveRequest(path: string, token: string, options: RequestInit = {}): Promise<Response> {
	const resp = await fetch(path, {
		...options,
		headers: {
			Authorization: `Bearer ${token}`,
			...options.headers,
		},
	});

	if (resp.status === 401) {
		// Token expired — clear it
		_accessToken = null;
		throw new Error('Token expired');
	}

	return resp;
}

// ─── Read ──────────────────────────────────────────────

/** Search for a file by name in appDataFolder. Returns the file ID or null. */
export async function getFileId(fileName: string, token: string): Promise<string | null> {
	const params = new URLSearchParams({
		q: `name='${fileName}'`,
		spaces: 'appDataFolder',
		fields: 'files(id,name)',
		pageSize: '10',
	});

	const resp = await driveRequest(`${DRIVE_API}/files?${params}`, token);
	if (!resp.ok) return null;

	const data = await resp.json();
	return data.files?.[0]?.id ?? null;
}

/** Read a file's content by its Drive file ID. */
export async function getFileContent(fileId: string, token: string): Promise<any | null> {
	const resp = await driveRequest(`${DRIVE_API}/files/${fileId}?alt=media`, token);
	if (!resp.ok) return null;
	return resp.json();
}

/** Read a file from appDataFolder by name. Returns parsed JSON or null. */
export async function readFile(fileName: string, token: string): Promise<any | null> {
	const fileId = await getFileId(fileName, token);
	if (!fileId) return null;
	return getFileContent(fileId, token);
}

/** List all entry files (name starts with "entries_batch_") in appDataFolder. */
export async function listBatchFiles(token: string): Promise<{ id: string; name: string }[]> {
	const allFiles: { id: string; name: string }[] = [];
	let pageToken: string | undefined;

	do {
		const params = new URLSearchParams({
			q: "name contains 'entries_batch_'",
			spaces: 'appDataFolder',
			fields: 'nextPageToken, files(id, name)',
			pageSize: '100',
		});
		if (pageToken) params.set('pageToken', pageToken);

		const resp = await driveRequest(`${DRIVE_API}/files?${params}`, token);
		if (!resp.ok) break;

		const data = await resp.json();
		if (data.files) {
			allFiles.push(...data.files);
		}
		pageToken = data.nextPageToken;
	} while (pageToken);

	return allFiles;
}

/** Load all entries from all batch files. Returns combined array. */
export async function loadAllEntries(token: string): Promise<any[]> {
	const files = await listBatchFiles(token);
	const results: any[] = [];

	// Load in parallel (batches of 10 to avoid rate limits)
	for (let i = 0; i < files.length; i += 10) {
		const batch = files.slice(i, i + 10);
		const batchResults = await Promise.all(
			batch.map(async (file) => {
				const content = await getFileContent(file.id, token);
				if (Array.isArray(content)) {
					return content;
				}
				return [];
			})
		);
		for (const arr of batchResults) {
			results.push(...arr);
		}
	}

	return results;
}

// ─── Write ──────────────────────────────────────────────

/** Create a new file in appDataFolder. Returns the file ID. */
export async function createFile(fileName: string, data: any, token: string): Promise<string | null> {
	const metadata = {
		name: fileName,
		mimeType: 'application/json',
		parents: ['appDataFolder'],
	};

	const body = buildMultipartBody(metadata, data);

	const resp = await driveRequest(`${UPLOAD_API}/files?uploadType=multipart`, token, {
		method: 'POST',
		headers: { 'Content-Type': `multipart/related; boundary="${BOUNDARY}"` },
		body,
	});

	if (!resp.ok) {
		console.warn('[Drive] Failed to create file:', resp.status, await resp.text());
		return null;
	}

	const result = await resp.json();
	return result.id ?? null;
}

/** Update an existing file's content by its Drive file ID. */
export async function updateFile(fileId: string, data: any, token: string): Promise<boolean> {
	const metadata = { mimeType: 'application/json' };
	const body = buildMultipartBody(metadata, data);

	const resp = await driveRequest(`${UPLOAD_API}/files/${fileId}?uploadType=multipart`, token, {
		method: 'PATCH',
		headers: { 'Content-Type': `multipart/related; boundary="${BOUNDARY}"` },
		body,
	});

	if (!resp.ok) {
		console.warn('[Drive] Failed to update file:', resp.status);
		return false;
	}
	return true;
}

/** writeBatch handles creating or updating a batch file reliably. */
export async function writeBatch(batchId: string, entries: any[], token: string): Promise<boolean> {
	const fileName = `entries_batch_${batchId}`;
	const fileId = await getFileId(fileName, token);
	if (fileId) {
		return updateFile(fileId, entries, token);
	} else {
		return (await createFile(fileName, entries, token)) !== null;
	}
}

/** Delete a file by its Drive file ID. */
export async function deleteFile(fileId: string, token: string): Promise<boolean> {
	const resp = await driveRequest(`${DRIVE_API}/files/${fileId}`, token, {
		method: 'DELETE',
	});

	if (!resp.ok && resp.status !== 404) {
		console.warn('[Drive] Failed to delete file:', resp.status);
		return false;
	}
	return true;
}

/** Utility to clean up old single entries. */
export async function deleteAllSingleEntryFiles(token: string): Promise<void> {
	let pageToken: string | undefined;
	do {
		const params = new URLSearchParams({
			q: "name contains 'entry_' and not name contains 'entries_batch_'",
			spaces: 'appDataFolder',
			fields: 'nextPageToken, files(id)',
			pageSize: '100',
		});
		if (pageToken) params.set('pageToken', pageToken);

		const resp = await driveRequest(`${DRIVE_API}/files?${params}`, token);
		if (!resp.ok) break;

		const data = await resp.json();
		if (data.files) {
			for (const file of data.files) {
				await deleteFile(file.id, token);
			}
		}
		pageToken = data.nextPageToken;
	} while (pageToken);
}

/** Build a multipart request body for Drive upload. */
function buildMultipartBody(metadata: any, data: any): string {
	const delimiter = `\r\n--${BOUNDARY}\r\n`;
	const closeDelimiter = `\r\n--${BOUNDARY}--`;

	return (
		delimiter +
		'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
		JSON.stringify(metadata) +
		delimiter +
		'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
		JSON.stringify(data) +
		closeDelimiter
	);
}

// ─── Preferences ──────────────────────────────────────────

/** Read preferences from Drive. */
export async function readPreferences(token: string): Promise<any | null> {
	return readFile('preferences', token);
}

/** Write preferences to Drive (create or update). */
export async function writePreferences(prefs: any, token: string): Promise<void> {
	const fileId = await getFileId('preferences', token);
	if (fileId) {
		await updateFile(fileId, prefs, token);
	} else {
		await createFile('preferences', prefs, token);
	}
}

// ─── Legacy (migration) ──────────────────────────────────

/** Read old diary entries (file "1") from Google Drive. */
export async function readOldEntries(token: string): Promise<any[] | null> {
	const data = await readFile('1', token);
	if (Array.isArray(data)) return data;
	return null;
}

/** Read old user preferences (file "0") from Google Drive. */
export async function readOldPreferences(token: string): Promise<any | null> {
	return readFile('0', token);
}
