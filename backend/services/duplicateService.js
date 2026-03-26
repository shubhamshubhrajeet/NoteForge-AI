import crypto from 'crypto';
import fs from 'fs';

/**
 * Computes SHA-256 hash of a file for duplicate detection.
 * Two files with the same hash are guaranteed to be identical.
 */
export function computeFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}
