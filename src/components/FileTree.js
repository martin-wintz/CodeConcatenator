import React, { useState } from 'react';
import { Box, Button, Typography, IconButton, Checkbox } from '@mui/joy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import useCopyToClipboard from '../hooks/useCopyToClipboard';
import { fadeOut } from '../animations';

const FileTree = ({ fileList, updateFileList, readFile, asciiMode }) => {
  const [copyMessage, copyToClipboard] = useCopyToClipboard();

  const handleToggleExpand = (directory) => {
    directory.collapsed = !directory.collapsed;
    updateFileList([...fileList]);
  };

  const handleCheckChange = async (file) => {
    file.checked = !file.checked;
    if (file.checked && !file.content) {
      file.content = readFile(file.path);
    }
    updateFileList([...fileList]);
  };

  const renderAsciiTree = (files, level = 0) => {
    return files
      .map((file, index) => {
        const isLast = index === files.length - 1;
        const prefix = isLast ? '└── ' : '├── ';
        const checkbox = file.checked ? '[x] ' : '[ ] ';

        let line = '  '.repeat(level) + prefix + checkbox + file.name;

        if (file.children) {
          line += '/';
          const childLines = renderAsciiTree(file.children, level + 1);
          line += '\n' + childLines;
        }

        return line;
      })
      .join('\n');
  };

  const handleCopy = () => {
    copyToClipboard(renderAsciiTree(fileList));
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
              style={{ marginRight: 8 }}
              checked={file.checked || false}
              onChange={() => handleCheckChange(file)}
            />
            <Typography>{file.name}</Typography>
          </Box>
        )}
      </Box>
    ));
  };

  return (
    <Box sx={{ p: 2 }}>
      {asciiMode ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
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
          <Box
            component="textarea"
            sx={{ width: '100%', height: 400, fontFamily: 'monospace', whiteSpace: 'pre' }}
            value={renderAsciiTree(fileList)}
            readOnly
          />
        </>
      ) : (
        renderFileTree(fileList)
      )}
    </Box>
  );
};

export default FileTree;