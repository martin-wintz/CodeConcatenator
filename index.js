const { app, BrowserWindow, ipcMain, dialog } = require('electron/main');
const path = require('path');
const fs = require('fs');
const ignore = require('ignore');
const { glob } = require('glob');


const gitignorePath = path.join(process.cwd(), '.gitignore');
const ignoreInstance = ignore();
let currentWorkingDirectory = null;
let fileWatcher = null;
let fileList = [];


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
  currentWorkingDirectory = process.cwd();
  fileList = fetchFileList();
  fileWatcher = startWatching();

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

// --------------------- FILE WATCHING LOGIC ---------------------


ipcMain.handle('getFileList', async (event) => {
  return fileList;
});

ipcMain.handle('updateFileList', async (event, updatedFileList) => {
  fileList = updatedFileList;
  BrowserWindow.getAllWindows()[0].webContents.send('fileListChanged', fileList);
});

ipcMain.handle('selectWorkingDirectory', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (filePaths && filePaths.length > 0) {
    return filePaths[0];
  }

  return null;
});

ipcMain.on('setWorkingDirectory', async (event, directory) => {
  stopWatching();

  currentWorkingDirectory = directory;  // Update the current working directory globally
  fileList = await fetchFileList();
  BrowserWindow.getAllWindows()[0].webContents.send('fileListChanged', fileList);

  startWatching();
});

// Load the .gitignore file and create an ignore instance
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  ignoreInstance.add(gitignoreContent);
}

function startWatching() {
  fileWatcher = fs.watch(currentWorkingDirectory, { recursive: true }, async (eventType, filename) => {
    if (eventType === 'change' || eventType === 'rename') {
      const newFileList = await fetchFileList();
      fileList = updateFileList(fileList, newFileList);
      BrowserWindow.getAllWindows()[0].webContents.send('fileListChanged', fileList);
    }
  });
}

async function fetchFileList() {
  try {
    let files = await glob('**', { cwd: currentWorkingDirectory, mark: true });
    files = files.filter(file => file !== './');
    const filteredFiles = ignoreInstance.filter(files);
    return buildFileTree(filteredFiles);
  } catch (err) {
    console.error('Error updating file list:', err);
    throw err;
  }
}

function updateFileList(fileList, updatedFileList) {
    fileList = mergeFileLists(fileList, updatedFileList);
    updateFileContents(fileList);
    return fileList;
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

// Function to merge file lists while maintaining checked state
function mergeFileLists(oldList, newList) {
  const oldItemsMap = new Map(oldList.map(item => [item.path, item]));
  return newList.map(newItem => {
    const oldItem = oldItemsMap.get(newItem.path);
    if (oldItem) {
      newItem.checked = oldItem.checked;
      newItem.collapsed = oldItem.collapsed;
      if (oldItem.children && newItem.children) {
        newItem.children = mergeFileLists(oldItem.children, newItem.children);
      }
    }
    return newItem;
  });
}

// Function to update the contents of checked files
function updateFileContents(fileList) {
  const updateContent = (file) => {
    if (file.checked) {
      file.content = fs.readFileSync(file.path, 'utf-8');
    }
    if (file.children) {
      file.children.forEach(updateContent);
    }
  };

  fileList.forEach(updateContent);
}

