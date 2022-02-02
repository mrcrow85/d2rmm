import { app, ipcMain } from 'electron';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs';
import path from 'path';

export function getAppPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, '../')
    : path.join(__dirname, '../../');
}

function copyDirSync(src: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });
  entries.forEach((entry) => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    entry.isDirectory()
      ? copyDirSync(srcPath, destPath)
      : copyFileSync(srcPath, destPath);
  });
}

export function createAPI(): void {
  ipcMain.on('getAppPath', (event, localPath) => {
    console.log('API.getAppPath', localPath);

    event.returnValue = getAppPath();
  });

  ipcMain.on('createDirectory', (event, filePath) => {
    console.log('API.createDirectory', filePath);

    try {
      if (!existsSync(filePath)) {
        mkdirSync(filePath, { recursive: true });
        event.returnValue = true;
      } else {
        event.returnValue = false;
      }
    } catch (e) {
      console.error('API.createDirectory', e);
      event.returnValue = null;
    }
  });

  ipcMain.on('readDirectory', (event, filePath) => {
    console.log('API.readDirectory', filePath);

    try {
      if (existsSync(filePath)) {
        const entries = readdirSync(filePath, { withFileTypes: true });
        event.returnValue = entries.map((entry) => [
          entry.name,
          entry.isDirectory(),
        ]);
      } else {
        event.returnValue = null;
      }
    } catch (e) {
      console.error('API.readDirectory', e);
      event.returnValue = null;
    }
  });

  ipcMain.on('readFile', (event, filePath) => {
    console.log('API.readFile', filePath);

    try {
      if (existsSync(filePath)) {
        event.returnValue = readFileSync(filePath, {
          encoding: 'utf-8',
          flag: 'r',
        });
      } else {
        event.returnValue = null;
      }
    } catch (e) {
      console.error('API.readFile', e);
      event.returnValue = null;
    }
  });

  ipcMain.on('writeFile', (event, [filePath, data]) => {
    console.log('API.writeFile', filePath);

    try {
      writeFileSync(filePath, data, {
        encoding: 'utf-8',
        flag: 'w',
      });
      event.returnValue = true;
    } catch (e) {
      console.error('API.writeFile', e);
      event.returnValue = null;
    }
  });

  ipcMain.on('deleteFile', (event, filePath) => {
    console.log('API.deleteFile', filePath);

    try {
      if (existsSync(filePath)) {
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
          rmSync(filePath, { recursive: true, force: true });
        } else {
          rmSync(filePath, { force: true });
        }
        event.returnValue = true;
      } else {
        event.returnValue = false;
      }
    } catch (e) {
      console.error('API.deleteFile', e);
      event.returnValue = null;
    }
  });

  ipcMain.on('copyFile', (event, [fromPath, toPath, overwrite]) => {
    console.log('API.copyFile', [fromPath, toPath, overwrite]);

    try {
      if (existsSync(fromPath) && (overwrite || !existsSync(toPath))) {
        const stat = statSync(fromPath);
        if (stat.isDirectory()) {
          copyDirSync(fromPath, toPath);
        } else {
          mkdirSync(path.dirname(toPath), { recursive: true });
          copyFileSync(fromPath, toPath);
        }
        event.returnValue = true;
      } else {
        event.returnValue = false;
      }
    } catch (e) {
      console.error('API.copyFile', e);
      event.returnValue = null;
    }
  });
}
