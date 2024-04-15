import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/joy';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import CodeDisplay from './components/CodeDisplay';

const App = () => {
  const [fileList, setFileList] = useState([]);
  const [currentDirectory, setCurrentDirectory] = useState('');

  useEffect(() => {
    const fetchInitialFileList = async () => {
      const initialFileList = await window.api.getFileList();
      setFileList(initialFileList);

      const initialWorkingDirectory = await window.api.getWorkingDirectory();
      setCurrentDirectory(initialWorkingDirectory);
    };

    fetchInitialFileList();

    const handleFileListChanges = (updatedFileList) => {
      setFileList(updatedFileList);
    };

      // Note that the source of truth for the fileList is in the main process.
      // setFileList should only be passed as a callback to subscribeToFileListChanges
      // and never called directly in the UI
      window.api.subscribeToFileListChanges(handleFileListChanges);
  }, []);

  const updateFileList = async (updatedFileList) => {
    await window.api.updateFileList(updatedFileList);
  };

  const handleSelectWorkingDirectory = async () => {
    const selectedDirectory = await window.api.selectWorkingDirectory();
    if (selectedDirectory) {
      setCurrentDirectory(selectedDirectory);
      window.api.setWorkingDirectory(selectedDirectory);
    }
  }

  return (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
    <TopBar
      currentDirectory={currentDirectory}
      onSelectWorkingDirectory={handleSelectWorkingDirectory}
    />
    <Box sx={{ display: 'flex', flex: 1 }}>
      <Sidebar
        fileList={fileList}
        updateFileList={updateFileList}
        readFile={window.api.readFile}
      />
      <Box sx={{ flex: 1, p: 2 }}>
        <Typography level="h1">CodeConcatenator</Typography>
        <CodeDisplay fileList={fileList} />
      </Box>
    </Box>
  </Box>
);
};

export default App;