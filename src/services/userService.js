import api from './apiService';
import { USER_ENDPOINTS,BASE_URL } from '../constants/ApiConstants';
import { getStoredTokens } from './tokenService';
import { updateUserData } from '../utils/userUtils';

export const updateProfile = async (formData, onProgress = null) => {
  try {
    const response = await fetch(`${BASE_URL}${USER_ENDPOINTS.UPDATE_PROFILE}`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${await getStoredTokens().then((tokens) => tokens.access)}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile.');
    }

    // Update AsyncStorage with new user data
    await updateUserData(data.user);

    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
