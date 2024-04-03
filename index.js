const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('path');
const fs = require('fs');


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

// Handle the getFileList IPC channel
ipcMain.handle('getFileList', () => {
  const fileList = getFileList(process.cwd());
  return fileList;
});

// Watch for file changes and send updates to the renderer process
const watchedDirectory = process.cwd();
fs.watch(watchedDirectory, { recursive: true }, (eventType, filename) => {
  if (eventType === 'change' || eventType === 'rename') {
    console.log('File change detected', filename, eventType)
    const fileList = getFileList(watchedDirectory);
    BrowserWindow.getAllWindows()[0].webContents.send('fileListChanged', fileList);
  }
});

// Function to get the file list in a tree structure
function getFileList(directory) {
  function traverseDirectory(currentDir, parentPath = '') {
    const files = fs.readdirSync(currentDir);
    const children = [];
    
    files.forEach((file) => {
      const filePath = path.join(currentDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        if (file.startsWith('.') || file === 'node_modules') {
          return;
        }
        const directory = {
          name: file,
          path: filePath,
          collapsed: true,
          children: traverseDirectory(filePath, filePath),
        };
        children.push(directory);
      } else {
        const fileItem = {
          name: file,
          path: filePath,
          checked: false,
          content: null,
        };
        children.push(fileItem);
      }
    });
    
    return children;
  }
  
  return traverseDirectory(directory);
}