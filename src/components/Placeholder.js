import React from 'react';
import { Box, Typography } from '@mui/joy';
import { ArrowUpwardRounded } from '@mui/icons-material';  
import { keyframes } from '@emotion/react';

const pulsate = keyframes`
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
`;

const Placeholder = () => (
  <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  }}>
    <Box sx={{ position: 'absolute', top: '200px', textAlign: 'center' }}>
        <Typography level="h2">
            No working directory selected. 
        </Typography>
        <Typography level="h4">
            Use the button on the top right of the screen to choose a directory.
        </Typography>
    </Box>
    <Box
      sx={{
        position: 'absolute',
        right: 25,
        top: 8,
        animation: `${pulsate} 2s infinite ease-in-out`
      }}
    >
    <ArrowUpwardRounded fontSize="large" color="primary"/>
    </Box>
  </Box>
);

export default Placeholder;
