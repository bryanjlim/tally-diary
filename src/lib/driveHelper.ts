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

import { Capacitor, registerPlugin } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';

/** Local Android plugin: silently re-authorizes the Drive scope (no UI) once granted. */
interface SilentAuthPlugin {
	authorize(): Promise<{ accessToken: string | null; needsAuth: boolean }>;
}
const SilentAuth = registerPlugin<SilentAuthPlugin>('SilentAuth');

let _accessToken: string | null = null;

// ─── Auth ──────────────────────────────────────────────

const SIGNED_IN_KEY = 'tally-diary-signed-in';
const CACHED_TOKEN_KEY = 'tally-diary-access-token';
const CACHED_TOKEN_EXPIRY = 'tally-diary-token-expiry';

/** Persist a fresh access token so quick relaunches can reuse it without any UI. */
function cacheToken(token: string) {
	_accessToken = token;
	localStorage.setItem(SIGNED_IN_KEY, 'true');
	localStorage.setItem(CACHED_TOKEN_KEY, token);
	localStorage.setItem(CACHED_TOKEN_EXPIRY, (Date.now() + 3500 * 1000).toString()); // ~1 hr minus buffer
}

function loadGisScript(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (typeof window === 'undefined') return reject(new Error('Not in browser'));
		if ((window as any).google?.accounts?.oauth2) return resolve();
		const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
		if (existingScript) {
			existingScript.addEventListener('load', () => resolve());
			existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')));
			return;
		}
		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
		document.head.appendChild(script);
	});
}

/**
 * Prompt the user to sign in and obtain an access token.
 */
export async function authenticate(): Promise<string | null> {
	if (_accessToken) return _accessToken;

	if (Capacitor.isNativePlatform()) {
		try {
			await GoogleSignIn.initialize({
				clientId: CLIENT_ID,
				scopes: [SCOPES]
			});
			const result = await GoogleSignIn.signIn();
			if (result.accessToken) {
				cacheToken(result.accessToken);
				return _accessToken;
			}
			return null;
		} catch (e: any) {
			console.error("[Auth] Google SignIn failed:", e);
			return null;
		}
	}

	// Web: Google Identity Services (GIS) token client popup
	try {
		await loadGisScript();
		return new Promise((resolve) => {
			const client = (window as any).google.accounts.oauth2.initTokenClient({
				client_id: CLIENT_ID,
				scope: SCOPES,
				callback: (response: any) => {
					if (response.access_token) {
						cacheToken(response.access_token);
						resolve(response.access_token);
					} else {
						if (response.error) {
							console.error("[Auth] GIS error:", response);
						}
						resolve(null);
					}
				},
				error_callback: (err: any) => {
					console.error("[Auth] GIS error callback:", err);
					resolve(null);
				}
			});
			client.requestAccessToken({ prompt: 'consent' });
		});
	} catch (e) {
		console.error("[Auth] Web Google SignIn failed:", e);
		return null;
	}
}

/**
 * Try to silently re-authenticate without showing any popup.
 * Returns the token or null if silent auth fails.
 */
export async function trySilentAuth(): Promise<string | null> {
	if (_accessToken) return _accessToken;
	if (typeof window === 'undefined') return null;

	// Reuse a recently cached access token on every platform — never shows UI.
	const cached = localStorage.getItem(CACHED_TOKEN_KEY);
	const expiry = localStorage.getItem(CACHED_TOKEN_EXPIRY);
	if (cached && expiry && Date.now() < parseInt(expiry, 10)) {
		_accessToken = cached;
		return _accessToken;
	}

	// Not a returning user — nothing to restore.
	if (!localStorage.getItem(SIGNED_IN_KEY)) return null;

	// Android: silently re-authorize the Drive scope with no UI via our native
	// SilentAuthPlugin. Works once the user has granted the scope through the
	// interactive sign-in; Google caches the grant so this needs no prompt.
	if (Capacitor.getPlatform() === 'android') {
		try {
			const res = await SilentAuth.authorize();
			if (res.accessToken) {
				cacheToken(res.accessToken);
				return _accessToken;
			}
		} catch (e) {
			console.warn('[Auth] Silent authorize failed:', e);
		}
		return null; // scope not granted yet — sidebar shows the sign-in button
	}

	// iOS: no silent-authorize method yet, and the sign-in plugin's signIn()
	// always shows UI, so don't prompt on launch. Runs in local mode until the
	// user taps sign-in; entries are always saved locally. The cached token above
	// still covers quick relaunches within the token's ~1 hr lifetime.
	if (Capacitor.isNativePlatform()) return null;

	// Web: silently request token without prompting for consent if Google session active
	try {
		await loadGisScript();
		return new Promise((resolve) => {
			const timeout = setTimeout(() => resolve(null), 5000);
			const client = (window as any).google.accounts.oauth2.initTokenClient({
				client_id: CLIENT_ID,
				scope: SCOPES,
				callback: (response: any) => {
					clearTimeout(timeout);
					if (response.access_token) {
						cacheToken(response.access_token);
						resolve(response.access_token);
					} else {
						resolve(null);
					}
				},
				error_callback: () => {
					clearTimeout(timeout);
					resolve(null);
				}
			});
			client.requestAccessToken({ prompt: '' });
		});
	} catch (e) {
		console.warn("[Auth] Web Google Silent SignIn failed:", e);
		return null;
	}
}

/** Get the cached access token, or null if not signed in. */
export function getToken(): string | null {
	return _accessToken;
}

/** Sign out — revoke the token. */
export async function signOut(): Promise<void> {
	if (_accessToken) {
		if (Capacitor.isNativePlatform()) {
			try {
				await GoogleSignIn.signOut();
			} catch (e) {
				console.warn("[Auth] Native Google SignOut warning:", e);
			}
		} else {
			try {
				(window as any).google?.accounts?.oauth2?.revoke?.(_accessToken, () => {});
			} catch(e) {}
		}
	}
	_accessToken = null;
	localStorage.removeItem(SIGNED_IN_KEY);
	localStorage.removeItem(CACHED_TOKEN_KEY);
	localStorage.removeItem(CACHED_TOKEN_EXPIRY);
}

// ─── Helpers ──────────────────────────────────────────

async function driveRequest(path: string, token: string, options: RequestInit = {}): Promise<Response> {
	const resp = await fetch(path, {
		cache: 'no-store', // Always bypass browser cache for Drive sync
		...options,
		headers: {
			Authorization: `Bearer ${token}`,
			...options.headers,
		},
	});

	if (resp.status === 401) {
		// Token expired — clear it
		_accessToken = null;
		localStorage.removeItem(CACHED_TOKEN_KEY);
		localStorage.removeItem(CACHED_TOKEN_EXPIRY);
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
	return listFiles(token, "name contains 'entries_batch_'");
}

/** List every file the app has created in appDataFolder (batches, preferences, legacy). */
export async function listAllFiles(token: string): Promise<{ id: string; name: string }[]> {
	return listFiles(token);
}

async function listFiles(token: string, q?: string): Promise<{ id: string; name: string }[]> {
	const allFiles: { id: string; name: string }[] = [];
	let pageToken: string | undefined;

	do {
		const params = new URLSearchParams({
			spaces: 'appDataFolder',
			fields: 'nextPageToken, files(id, name)',
			pageSize: '100',
		});
		if (q) params.set('q', q);
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
