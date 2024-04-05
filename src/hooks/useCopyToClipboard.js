import { useState } from 'react';

const useCopyToClipboard = () => {
  const [copyMessage, setCopyMessage] = useState('');

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage('Copied!');
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (err) {
      console.error('Failed to copy content: ', err);
      setCopyMessage('Failed to copy!');
      setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  return [copyMessage, copyToClipboard];
};

export default useCopyToClipboard;
