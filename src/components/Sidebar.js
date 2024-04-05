import React, { useState } from 'react';
import { Box, Typography, Switch } from '@mui/joy';
import FileTree from './FileTree';

const Sidebar = ({ fileList, setFileList, readFile }) => {
  const [asciiMode, setAsciiMode] = useState(false);

  return (
    <Box sx={{ width: 240, bgcolor: 'background.surface', borderRight: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ p: 2 }}>
        <Switch
          label="ASCII Mode"
          endDecorator="ASCII Mode"
          checked={asciiMode}
          onChange={(event) => setAsciiMode(event.target.checked)}
        />
      </Box>
      <FileTree fileList={fileList} setFileList={setFileList} readFile={readFile} asciiMode={asciiMode} />
    </Box>
  );
};

export default Sidebar;