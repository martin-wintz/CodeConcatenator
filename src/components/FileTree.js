import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Checkbox } from '@mui/joy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const FileTree = ({ fileList, setFileList, readFile }) => {

  const handleToggleExpand = (directory) => {
    directory.collapsed = !directory.collapsed;
    setFileList([...fileList]);
  };

  const handleCheckChange = async (file) => {
    file.checked = !file.checked;
    if (file.checked && !file.content) {
      file.content = readFile(file.path);
    }
    setFileList([...fileList]);
  };

  const renderFileTree = (files, level = 0) => {
    return files.map((file, index) => (
      <Box key={index}>
        {file.children ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', ml: level * 2 }}>
              <IconButton onClick={() => handleToggleExpand(file)}>
                {file.collapsed ? <ChevronRightIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <Typography>{file.name}</Typography>
            </Box>
            {!file.collapsed && renderFileTree(file.children, level + 1)}
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: (level + 1) * 2 }}>
            <Checkbox
              style={{ marginRight: 8}}
              checked={file.checked || false}
              onChange={() => handleCheckChange(file)}
            />
            <Typography>{file.name}</Typography>
          </Box>
        )}
      </Box>
    ));
  };

  return <Box sx={{ p: 2 }}>{renderFileTree(fileList)}</Box>;
};

export default FileTree;