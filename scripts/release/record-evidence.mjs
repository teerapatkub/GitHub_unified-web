import fs from 'node:fs';
import path from 'node:path';

const outputDirectory = process.env.RUNNER_TEMP;
const commit = process.env.GITHUB_SHA;
if (!outputDirectory || !/^[a-f0-9]{40}$/i.test(commit || '')) {
  throw new Error('Release evidence requires RUNNER_TEMP and a full candidate commit');
}

const imageId = fs.readFileSync(path.join(outputDirectory, 'image-id.txt'), 'utf8').trim();
const archiveChecksum = fs.readFileSync(path.join(outputDirectory, 'image-archive.sha256'), 'utf8').trim();
const readiness = JSON.parse(fs.readFileSync(path.join(outputDirectory, 'release-ready.json'), 'utf8'));
if (!/^sha256:[a-f0-9]{64}$/i.test(imageId)
  || !/^[a-f0-9]{64}$/i.test(archiveChecksum)
  || readiness.status !== 'ready'
  || !/^\d{12,20}$/.test(String(readiness.migrationVersion || ''))) {
  throw new Error('Image ID or migration readiness evidence is missing');
}

const evidence = {
  candidateCommit: commit,
  imageConfigDigest: imageId,
  imageArchiveSha256: archiveChecksum,
  migrationVersion: String(readiness.migrationVersion),
  environmentClass: 'disposable-ci',
  checks: [
    'repository-and-history-scan',
    'production-dependency-audit',
    'client-and-server-lint',
    'client-and-server-tests',
    'fresh-database-migrations',
    'production-image-build-and-scan',
    'container-readiness-and-failure-modes',
    'persistent-uploads',
  ],
  recordedAt: new Date().toISOString(),
};

fs.writeFileSync(path.join(outputDirectory, 'release-evidence.json'),
  `${JSON.stringify(evidence, null, 2)}\n`, { mode: 0o600 });
console.log('Release evidence recorded for candidate commit and disposable CI environment.');
