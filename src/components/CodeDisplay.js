import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/joy';
import { keyframes } from '@mui/system';
import TokenEstimate from './TokenEstimate';

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const CodeDisplay = ({ fileList }) => {
  const [copyMessage, setCopyMessage] = useState('');

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyMessage('Copied!');
      setTimeout(() => {
        setCopyMessage('');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy content: ', err);
    }
  };

  return (
    <Box>
      <Box component="textarea" sx={{ width: '100%', height: 400, mt: 2 }} value={content} readOnly />
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
      </Box>
    </Box>
  );
};

export default CodeDisplay;