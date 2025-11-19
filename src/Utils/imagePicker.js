import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

export const pickImageFromGallery = async () => {
  return new Promise((resolve, reject) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (res) => {
        if (res.didCancel) return resolve(null);
        if (res.errorCode) return reject(res.errorMessage);
        resolve(res.assets?.[0]?.uri || null);
      }
    );
  });
};

export const takePhotoWithCamera = async () => {
  return new Promise((resolve, reject) => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (res) => {
        if (res.didCancel) return resolve(null);
        if (res.errorCode) return reject(res.errorMessage);
        resolve(res.assets?.[0]?.uri || null);
      }
    );
  });
};
