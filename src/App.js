import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/joy';
import Sidebar from './components/Sidebar';
import CodeDisplay from './components/CodeDisplay';

const App = () => {
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const fetchFileList = async () => {
      const list = await window.api.getFileList();
      setFileList(list);
    };

    fetchFileList();

    window.api.subscribeToFileChanges(handleFileChanges);
  }, []);

  const handleFileChanges = async (updatedFileList) => {
    setFileList(currentFileList => {
      const mergedFileList = mergeFileLists(currentFileList, updatedFileList);
      updateFileContents(mergedFileList);
      return mergedFileList;
    });
  };

  const updateFileItem = (oldItem, newItem) => {
    newItem.checked = oldItem.checked;
    newItem.collapsed = oldItem.collapsed;
  };

  const mergeFileLists = (oldList, newList) => {
    const mergedList = [...newList];

    oldList.forEach((oldItem) => {
      const newItem = mergedList.find((item) => item.path === oldItem.path);
      if (newItem) {
        updateFileItem(oldItem, newItem);
        if (oldItem.children && newItem.children) {
          newItem.children = mergeFileLists(oldItem.children, newItem.children);
        }
      }
    });

    return mergedList;
  };

  const updateFileContents = (fileList) => {
    const updateContent = (file) => {
      if (file.checked) {
        file.content = window.api.readFile(file.path);
      }
      if (file.children) {
        file.children.forEach(updateContent);
      }
    };
  
    fileList.forEach(updateContent);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar fileList={fileList} setFileList={setFileList} readFile={window.api.readFile} />
      <Box sx={{ flex: 1, p: 2 }}>
        <Typography level="h1">CodeConcatenator</Typography>
        <CodeDisplay fileList={fileList} />
      </Box>
    </Box>
  );
};

export default App;