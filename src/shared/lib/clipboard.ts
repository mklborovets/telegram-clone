let memoryClipboard = '';

export const copyToClipboard = (text: string): boolean => {
  memoryClipboard = text;
  try {
    const ClipboardModule = require('@react-native-clipboard/clipboard');
    const Clipboard = ClipboardModule.default || ClipboardModule;
    if (Clipboard && typeof Clipboard.setString === 'function') {
      Clipboard.setString(text);
      return true;
    }
  } catch {
    return true;
  }
  return true;
};

export const getClipboardText = async (): Promise<string> => {
  try {
    const ClipboardModule = require('@react-native-clipboard/clipboard');
    const Clipboard = ClipboardModule.default || ClipboardModule;
    if (Clipboard && typeof Clipboard.getString === 'function') {
      const nativeText = await Clipboard.getString();
      return nativeText || memoryClipboard;
    }
  } catch {
    return memoryClipboard;
  }
  return memoryClipboard;
};
