import React from 'react';
import { Box, Typography, Switch } from '@mui/joy';
import FileTree from './FileTree';

const Sidebar = ({ fileList, setFileList, readFile }) => {
  return (
    <Box sx={{ width: 240, bgcolor: 'background.surface', borderRight: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ p: 2 }}>
        <Typography level="h6">Files</Typography>
        <Switch label="ASCII Mode" />
      </Box>
      <FileTree fileList={fileList} setFileList={setFileList} readFile={readFile} />
    </Box>
  );
};

export default Sidebar;