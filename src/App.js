import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography } from '@mui/joy';
import Sidebar from './components/Sidebar';
import CodeDisplay from './components/CodeDisplay';

const App = () => {
  const [fileList, setFileList] = useState([]);
  const fileListRef = useRef([]);

  useEffect(() => {
    const fetchFileList = async () => {
      const list = await window.api.getFileList();
      setFileList(list);
      fileListRef.current = list;
    };

    fetchFileList();

    window.api.subscribeToFileChanges(handleFileChanges);
  }, []);

  useEffect(() => {
    fileListRef.current = fileList;
  }, [fileList]);

  const handleFileChanges = async (updatedFileList) => {
    const mergedFileList = mergeFileLists(fileListRef.current, updatedFileList);
    await updateFileContents(mergedFileList);
    setFileList(mergedFileList);
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

  const updateFileContents = async (fileList) => {
    const updateContent = async (file) => {
      if (file.checked) {
        file.content = await window.api.readFile(file.path);
      }
      if (file.children) {
        await Promise.all(file.children.map(updateContent));
      }
    };

    await Promise.all(fileList.map(updateContent));
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