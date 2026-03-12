/**
 * Upload Great Gatsby audiobook files to Vercel Blob storage.
 *
 * Usage:
 *   node scripts/upload-audiobook.mjs
 *
 * Requires BLOB_READ_WRITE_TOKEN in your .env.local file.
 */

import { put } from '@vercel/blob';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load .env.local manually (no dotenv dependency needed)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');

if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('ERROR: BLOB_READ_WRITE_TOKEN not found in .env.local');
  process.exit(1);
}

// ── Configure your audiobook folder path here ──────────────────────────────
const AUDIOBOOK_DIR =
  process.env.AUDIOBOOK_DIR ||
  'C:\\Users\\mayes\\OneDrive\\Desktop\\Interactive Classics\\Great Gatsby\\Audiobook';
// ────────────────────────────────────────────────────────────────────────────

const ALLOWED_EXTENSIONS = ['.mp3', '.json', '.aaf'];

function getMimeType(filename) {
  if (filename.endsWith('.mp3')) return 'audio/mpeg';
  if (filename.endsWith('.json')) return 'application/json';
  if (filename.endsWith('.aaf')) return 'application/octet-stream';
  return 'application/octet-stream';
}

async function uploadFile(filePath) {
  const filename = basename(filePath);
  const blobPath = `audiobooks/great-gatsby/${filename}`;
  const contentType = getMimeType(filename);

  console.log(`Uploading: ${filename} ...`);
  try {
    const fileBuffer = readFileSync(filePath);
    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      contentType,
      token,
    });
    console.log(`  ✓ ${filename}`);
    console.log(`    URL: ${blob.url}`);
    return { filename, url: blob.url, success: true };
  } catch (err) {
    console.error(`  ✗ ${filename}: ${err.message}`);
    return { filename, url: null, success: false };
  }
}

async function main() {
  if (!existsSync(AUDIOBOOK_DIR)) {
    console.error(`ERROR: Directory not found:\n  ${AUDIOBOOK_DIR}`);
    console.error('\nSet AUDIOBOOK_DIR env var or update the path in the script.');
    process.exit(1);
  }

  const files = readdirSync(AUDIOBOOK_DIR).filter(f =>
    ALLOWED_EXTENSIONS.some(ext => f.toLowerCase().endsWith(ext))
  );

  if (files.length === 0) {
    console.error('No .mp3, .json, or .aaf files found in directory.');
    process.exit(1);
  }

  console.log(`\nFound ${files.length} files to upload:\n`);
  files.forEach(f => console.log(`  ${f}`));
  console.log();

  const results = [];
  for (const file of files) {
    const result = await uploadFile(join(AUDIOBOOK_DIR, file));
    results.push(result);
  }

  const succeeded = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n── Summary ──────────────────────────────────────');
  console.log(`Uploaded: ${succeeded.length}/${results.length}`);

  if (succeeded.length > 0) {
    console.log('\nSuccessful uploads:');
    succeeded.forEach(r => console.log(`  ${r.filename}\n    ${r.url}`));
  }

  if (failed.length > 0) {
    console.log('\nFailed:');
    failed.forEach(r => console.log(`  ${r.filename}`));
    process.exit(1);
  }

  console.log('\nDone! Copy the URLs above into your app config.\n');
}

main();
