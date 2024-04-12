const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('api', {
  getFileList: () => ipcRenderer.invoke('getFileList'),
  updateFileList: (updatedFileList) => ipcRenderer.invoke('updateFileList', updatedFileList),
  subscribeToFileListChanges: (callback) => {
    ipcRenderer.on('fileListChanged', (event, fileList) => {
      callback(fileList);
    });
  },
  unsubscribeToFileListChanges: (callback) => {
    ipcRenderer.removeListener('fileListChanged', callback);
  },
  readFile: (filePath) => fs.readFileSync(filePath, 'utf-8'),
  selectWorkingDirectory: () => ipcRenderer.invoke('selectWorkingDirectory'),
  setWorkingDirectory: (directory) => ipcRenderer.send('setWorkingDirectory', directory),
});