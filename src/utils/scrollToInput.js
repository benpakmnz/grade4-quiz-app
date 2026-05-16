// Utility function to scroll input into view when keyboard opens on mobile
export const scrollToInput = (inputElement) => {
  if (!inputElement) return;
  
  // Small delay to let the keyboard open first
  setTimeout(() => {
    inputElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }, 300);
};

// Hook to automatically scroll when input is focused
export const useAutoScrollOnFocus = (inputRef) => {
  const handleFocus = () => {
    if (inputRef.current) {
      scrollToInput(inputRef.current);
    }
  };

  return handleFocus;
};
