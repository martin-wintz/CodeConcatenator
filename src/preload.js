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
  readFile: (filePath) => fs.readFileSync(filePath, 'utf-8'),
});