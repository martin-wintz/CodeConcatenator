import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/joy';
import { keyframes } from '@mui/system';
import TokenEstimate from './TokenEstimate';
import useCopyToClipboard from '../hooks/useCopyToClipboard';
import { fadeOut } from '../animations';

const CodeDisplay = ({ fileList }) => {
  const [copyMessage, copyToClipboard] = useCopyToClipboard();

  const getCheckedFiles = (files) => {
    const checkedFiles = [];

    files.forEach((file) => {
      if (file.children) {
        checkedFiles.push(...getCheckedFiles(file.children));
      } else if (file.checked) {
        checkedFiles.push(file);
      }
    });

    return checkedFiles;
  };

  const checkedFiles = getCheckedFiles(fileList);
  const content = checkedFiles.map((file) => file.path + '\n-----\n' + file.content).join('\n\n');

  const handleCopy = () => {
    copyToClipboard(content);
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button variant="solid" onClick={handleCopy}>
            Copy
          </Button>
          {copyMessage && (
            <Typography
              sx={{
                ml: 2,
                animation: `${fadeOut} 1s ease-in-out`,
                animationFillMode: 'forwards',
              }}
            >
              {copyMessage}
            </Typography>
          )}
        </Box>
        <TokenEstimate content={content} />
      </Box><Box component="textarea" sx={{ width: '100%', height: 760, mt: 2 }} value={content} readOnly />
    </Box>
  );
};

export default CodeDisplay;