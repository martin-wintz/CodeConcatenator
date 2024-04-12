const { app, BrowserWindow, ipcMain, dialog } = require('electron/main');
const path = require('path');
const fs = require('fs');
const ignore = require('ignore');
const { glob } = require('glob');


const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      sandbox: false,
    }
  });
  
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
};

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Load the .gitignore file and create an ignore instance
const gitignorePath = path.join(process.cwd(), '.gitignore');
const ignoreInstance = ignore();

if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  ignoreInstance.add(gitignoreContent);
}


// --------------------- FILE WATCHING LOGIC ---------------------

let currentWorkingDirectory = process.cwd();
let fileWatcher = null;

// Handle the getFileList IPC channel
ipcMain.handle('getFileList', async (event) => {
  const fileList = await fetchAndUpdateFileList(currentWorkingDirectory);
  startWatching(currentWorkingDirectory);
  return fileList;
});

// Handle the setWorkingDirectory IPC channel
ipcMain.handle('selectWorkingDirectory', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (filePaths && filePaths.length > 0) {
    return filePaths[0];
  }

  return null;
});

ipcMain.on('setWorkingDirectory', (event, directory) => {
  currentWorkingDirectory = directory;  // Update the current working directory globally
  startWatching(directory);
  fetchAndUpdateFileList(directory);  // Fetch and update file list immediately on directory change
});

function startWatching(directory) {
  stopWatching();
  fileWatcher = fs.watch(directory, { recursive: true }, (eventType, filename) => {
    if (eventType === 'change' || eventType === 'rename') {
      fetchAndUpdateFileList(directory);  // Use centralized logic to update file list
    }
  });
}

async function fetchAndUpdateFileList(directory) {
  try {
    let files = await glob('**', { cwd: directory, mark: true });
    files = files.filter(file => file !== './');
    const filteredFiles = ignoreInstance.filter(files);
    const fileList = buildFileTree(filteredFiles);
    BrowserWindow.getAllWindows()[0].webContents.send('fileListChanged', fileList);
    return fileList;
  } catch (err) {
    console.error('Error updating file list:', err);
    throw err;
  }
}

function stopWatching(fileWatcher) {
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }
}

// Function to build the file tree structure from the filtered file list
function buildFileTree(files) {
  const fileTree = [];
  const fileMap = new Map();

  // Create file and directory objects and store them in the map
  files.forEach((file) => {
    const parsedPath = path.parse(file);
    const pathParts = parsedPath.dir.split(path.sep).filter(Boolean);

    const fileItem = {
      name: parsedPath.base,
      path: path.join(currentWorkingDirectory, file),
      checked: false,
      content: null,
    };

    if (file.endsWith('/')) {
      fileItem.collapsed = true;
      fileItem.children = [];
    }

    fileMap.set(file, fileItem);
  });

  // Build the file tree by connecting parent and child nodes
  files.forEach((file) => {
    const parsedPath = path.parse(file);
    const pathParts = parsedPath.dir.split(path.sep).filter(Boolean);

    if (pathParts.length === 0) {
      fileTree.push(fileMap.get(file));
    } else {
      const parentPath = `${pathParts.join('/')}/`;
      const parentItem = fileMap.get(parentPath);
      const childItem = fileMap.get(file);

      if (parentItem && childItem) {
        parentItem.children.push(childItem);
      }
    }
  });

  return fileTree;
}