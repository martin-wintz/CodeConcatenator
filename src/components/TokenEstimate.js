import React from 'react';
import { Box, Typography } from '@mui/joy';

const TokenEstimate = ({ content }) => {
  const avgCharsPerToken = 4; // Rough estimate for code in LLMs

  const estimateTokens = (content) => {
    const cleanedContent = content.replace(/\s+/g, '');
    const numChars = cleanedContent.length;
    const estimatedTokens = Math.ceil(numChars / avgCharsPerToken);
    return estimatedTokens;
  };

  const tokens = estimateTokens(content);

  return (
    <Box>
      <Typography>Token Estimate: {tokens}</Typography>
    </Box>
  );
};

export default TokenEstimate;