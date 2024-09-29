'use strict';
const { readdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const root = join(process.cwd(), 'lib');

cleanDir(root);

function cleanDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (let i = 0; i < entries.length; ++i) {
    const entry = entries[i];
    const path = join(entry.parentPath, entry.name);

    if (entry.isDirectory()) {
      cleanDir(path);
    } else if (path.endsWith('.d.ts')) {
      rmSync(path, { force: true });
    }
  }
}
