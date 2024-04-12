const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('api', {
  getFileList: () => ipcRenderer.invoke('getFileList'),
  subscribeToFileChanges: (callback) => {
    ipcRenderer.on('fileListChanged', (event, fileList) => {
      callback(fileList);
    });
  },
  unsubscribeToFileChanges: (callback) => {
    ipcRenderer.removeListener('fileListChanged', callback);
  },
  readFile: (filePath) => fs.readFileSync(filePath, 'utf-8'),
  selectWorkingDirectory: () => ipcRenderer.invoke('selectWorkingDirectory'),
  setWorkingDirectory: (directory) => ipcRenderer.send('setWorkingDirectory', directory),
});