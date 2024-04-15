import React, { useState } from 'react';
import { Box, Switch, Button } from '@mui/joy';
import FileTree from './FileTree';

const Sidebar = ({ fileList, updateFileList, readFile }) => {
  const [asciiMode, setAsciiMode] = useState(false);

  return (
    <Box sx={{ width: 320, bgcolor: 'background.surface', borderRight: '1px solid', borderColor: 'divider', overflow: 'scroll' }}>
      <Box sx={{ p: 2 }}>
        <Switch
          label="ASCII Mode"
          endDecorator="ASCII Mode"
          checked={asciiMode}
          onChange={(event) => setAsciiMode(event.target.checked)}
        />
      </Box>
      <FileTree
        fileList={fileList}
        updateFileList={updateFileList}
        readFile={readFile}
        asciiMode={asciiMode}
      />
    </Box>
  );
};

export default Sidebar;