const { app, BrowserWindow, ipcMain } = require('electron/main');
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

// Handle the getFileList IPC channel
ipcMain.handle('getFileList', async (event) => {
  const files = (await glob('**', { mark: true })).filter(file => file !== './');
  const filteredFiles = ignoreInstance.filter(files);
  const fileList = buildFileTree(filteredFiles);
  return fileList;
});

// Watch for file changes and send updates to the renderer process
const watchedDirectory = process.cwd();
fs.watch(watchedDirectory, { recursive: true }, (eventType, filename) => {
  if (eventType === 'change' || eventType === 'rename') {
    glob('**', { mark: true }).then((files) => {
      files = files.filter(file => file !== './');
      const filteredFiles = ignoreInstance.filter(files);
      const fileList = buildFileTree(filteredFiles);
      BrowserWindow.getAllWindows()[0].webContents.send('fileListChanged', fileList);
    }).catch((err) => {
      throw err;
    });
  }
});

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
      path: path.join(process.cwd(), file),
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