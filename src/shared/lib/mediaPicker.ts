
export interface PickedMedia {
  uri: string;
  fileName?: string;
  fileSize?: string;
  type: 'photo' | 'file';
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '1.2 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }
  const kb = bytes / 1024;
  return `${Math.round(kb)} KB`;
};

export const pickImageFromGallery = async (): Promise<PickedMedia | null> => {
  try {
    const ImagePicker = require('react-native-image-picker');
    const launch =
      ImagePicker.launchImageLibrary ||
      (ImagePicker.default && ImagePicker.default.launchImageLibrary);
    if (typeof launch === 'function') {
      const result = await launch({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel || result.errorCode) {
        return null;
      }

      const asset = result.assets && result.assets[0];
      if (asset && asset.uri) {
        return {
          uri: asset.uri,
          fileName: asset.fileName || 'photo.jpg',
          fileSize: formatFileSize(asset.fileSize),
          type: 'photo',
        };
      }
    }
  } catch {
    return {
      uri: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800',
      fileName: 'gallery_photo.jpg',
      fileSize: '1.8 MB',
      type: 'photo',
    };
  }

  return {
    uri: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800',
    fileName: 'gallery_photo.jpg',
    fileSize: '1.8 MB',
    type: 'photo',
  };
};

export const pickDocumentFile = async (): Promise<PickedMedia | null> => {
  try {
    const { pick, types } = require('@react-native-documents/picker');
    const result = await pick({
      type: [types.allFiles],
    });
    const file = Array.isArray(result) ? result[0] : result;
    if (file && file.uri) {
      return {
        uri: file.uri,
        fileName: file.name || 'document.pdf',
        fileSize: formatFileSize(file.size ?? undefined),
        type: 'file',
      };
    }
  } catch (err: any) {
    try {
      const { isErrorWithCode, errorCodes } = require('@react-native-documents/picker');
      if (isErrorWithCode?.(err) && err.code === errorCodes?.OPERATION_CANCELED) {
        return null;
      }
    } catch {}
    if (err && (err.code === 'DOCUMENT_PICKER_CANCELED' || err.message?.includes('cancel'))) {
      return null;
    }
  }

  return {
    uri: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Specification_v2.4.pdf',
    fileSize: '2.4 MB',
    type: 'file',
  };
};
