import React from 'react';
import { Card, Box, IconButton, Typography, Tooltip } from '@mui/joy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

const TopBar = ({ currentDirectory, onSelectWorkingDirectory }) => {
  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Card sx={{ p: 1, borderRadius: 'md', width: '100%', position: 'relative', boxSizing:'border-box' }}>
        <Box sx={{ p: 0, display: 'flex', alignItems: 'center' }}>
          <Typography level="body-sm" sx={{ flexGrow: 1 }}>
            {currentDirectory}
          </Typography>
          <Tooltip title="Select Working Directory" placement='left'>
            <IconButton
              onClick={onSelectWorkingDirectory}
              variant="solid"
              color="primary"
              size="small"
            >
              <FolderOpenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>
    </Box>
  );
};

export default TopBar;