import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// 1️⃣ Process & compress file
export const processMediaFile = async (mediaFile) => {
  try {
    const { uri, type, base64 } = mediaFile;
    const fileName = uri.split('/').pop();
    let mimeType = type || (uri.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg');

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    // For images, compress and resize before upload
    if (mimeType.startsWith('image/')) {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Generate base64 for the manipulated image
      let newBase64 = base64;
      try {
        newBase64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (error) {
        console.warn('(NOBRIDGE) WARN Failed to generate base64 for manipulated image:', error);
        newBase64 = base64;
      }

      return {
        uri: manipulatedImage.uri,
        name: fileName,
        type: 'image/jpeg',
        size: fileInfo.size,
        base64: newBase64 // Preserve or generate base64
      };
    }

    // For videos, return original info 
    return {
      uri,
      name: fileName,
      type: mimeType,
      size: fileInfo.size,
    };
  } catch (error) {
    console.error('(NOBRIDGE) ERROR Error processing media file:', error);
    throw new Error('Failed to process media file');
  }
};

// 2️⃣ Prepare FormData
export const prepareMediaFormData = (formData, mediaFiles) => {
  if (!mediaFiles || !Array.isArray(mediaFiles) || mediaFiles.length === 0) {
    console.warn('(NOBRIDGE) WARN No media files to append to FormData');
    return formData;
  }

  mediaFiles.forEach((file) => {
    let mimeType = file.type;
    if (!mimeType || mimeType === 'image') mimeType = 'image/jpeg';
    if (mimeType === 'video') mimeType = 'video/mp4';

    console.log('(NOBRIDGE) LOG Appending media file to FormData:', JSON.stringify(file, null, 2));
    formData.append('media', {
      uri: file.uri,
      name: file.name,
      type: mimeType,
      ...(mimeType.startsWith('image/') && file.base64 && { base64: file.base64 }) // Include base64 only for images
    });
  });

  return formData;
};

// 3️⃣ Validate size
export const validateMediaFile = (file) => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  if (!file.uri) {
    throw new Error('Invalid file: Missing URI');
  }

  if (file.size && file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }

  return true;
};
