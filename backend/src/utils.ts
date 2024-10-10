const fs = require('fs').promises;

export async function forceDir(dir: string) {
  try {
    await fs.access(dir);
  } catch (err) {
    await fs.mkdir(dir); // Create dir in case not found
  }
}

export async function forceFileDel(file: string) {
  try {
    await fs.unlink(file);
  } catch (err) {
    // не получилось удалить, да и хрен с ним
  }
}
