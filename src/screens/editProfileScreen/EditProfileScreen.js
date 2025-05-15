import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ColorPalette from '../../constants/ColorPalette';
import { updateProfile } from '../../services/userService';
import { processMediaFile, prepareMediaFormData, validateMediaFile } from '../../utils/mediaUtils';
import ScreenLayout from '../../components/layout/ScreenLayout';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomAlert from '../../components/CustomAlert';

const EditProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    bio: '',
    profile_image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [date, setDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [datePickerStep, setDatePickerStep] = useState('year'); // 'year', 'month', 'day'
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [updatedUserData, setUpdatedUserData] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setFormData((prev) => ({ ...prev, profile_image: result.assets[0] }));
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  }, []);

  // Add years array for picker
  const years = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() - i
  );
  
  // Update months array to be simple strings
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Add days array
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleDateSelect = (year, month, day) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    handleInputChange('dob', date);
    setShowDateModal(false);
  };

  const renderDateModal = () => (
    <Modal
      visible={showDateModal}
      transparent
      animationType="slide"
      onRequestClose={() => {
        setShowDateModal(false);
        setDatePickerStep('year');
        setSelectedYear(null);
        setSelectedMonth(null);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.dateModalContent}>
          <View style={styles.dateModalHeader}>
            <Text style={styles.dateModalTitle}>
              {datePickerStep === 'year' ? 'Select Year' : 
               datePickerStep === 'month' ? 'Select Month' : 
               'Select Day'}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setShowDateModal(false);
                setDatePickerStep('year');
                setSelectedYear(null);
                setSelectedMonth(null);
              }}
            >
              <Ionicons name="close" size={24} color={ColorPalette.white} />
            </TouchableOpacity>
          </View>

          {datePickerStep === 'year' && (
            <ScrollView style={styles.datePickerContainer}>
              {years.map(year => (
                <TouchableOpacity
                  key={year}
                  style={styles.dateOption}
                  onPress={() => {
                    setSelectedYear(year);
                    setDatePickerStep('month');
                  }}
                >
                  <Text style={styles.dateOptionText}>{year}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {datePickerStep === 'month' && (
            <ScrollView style={styles.datePickerContainer}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={styles.dateOption}
                  onPress={() => {
                    setSelectedMonth(index);
                    setDatePickerStep('day');
                  }}
                >
                  <Text style={styles.dateOptionText}>{month}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {datePickerStep === 'day' && selectedYear && selectedMonth !== null && (
            <ScrollView style={styles.datePickerContainer}>
              {Array.from(
                { length: getDaysInMonth(selectedYear, selectedMonth) },
                (_, i) => i + 1
              ).map(day => (
                <TouchableOpacity
                  key={day}
                  style={styles.dateOption}
                  onPress={() => {
                    const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    handleInputChange('dob', formattedDate);
                    setShowDateModal(false);
                    setDatePickerStep('year');
                    setSelectedYear(null);
                    setSelectedMonth(null);
                  }}
                >
                  <Text style={styles.dateOptionText}>{day}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
          {datePickerStep !== 'year' && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                if (datePickerStep === 'day') {
                  setDatePickerStep('month');
                  setSelectedMonth(null);
                } else if (datePickerStep === 'month') {
                  setDatePickerStep('year');
                  setSelectedYear(null);
                }
              }}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  const showAlert = (type, message, duration = 3000) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
    
    if (type !== 'loading') {
      setTimeout(() => {
        setAlertVisible(false);
        if (type === 'success') {
          navigation.navigate('Profile', { updatedUser: updatedUserData });
        }
      }, duration);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    showAlert('loading', 'Updating profile...');
    
    try {
      // Step 1: Process and validate the profile image
      const processedFiles = [];
      if (formData.profile_image) {
        const processed = await processMediaFile(formData.profile_image);
        validateMediaFile(processed);
        processedFiles.push(processed);
      }

      // Step 2: Prepare FormData
      const data = new FormData();
      console.log('Form data:', formData);
      if (formData.first_name) data.append('first_name', formData.first_name);
      if (formData.last_name) data.append('last_name', formData.last_name);
      if (formData.dob) data.append('dob', formData.dob);
      if (formData.bio) data.append('bio', formData.bio);
      prepareMediaFormData(data, processedFiles);
      console.log('Prepared FormData:', data);

      // Step 3: Send the update request
      const response = await updateProfile(data, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });

      console.log('Profile updated successfully:', response.user); // Debugging log
      setUpdatedUserData(response.user); // Store the response data
      showAlert('success', response.message || 'Profile updated successfully');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenLayout backgroundColor={ColorPalette.main_black} statusBarStyle="light-content">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={ColorPalette.white} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.imagePickerContainer} onPress={handleSelectImage}>
          <View style={styles.imageWrapper}>
            {formData.profile_image ? (
              <Image source={{ uri: formData.profile_image.uri }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={32} color={ColorPalette.white} />
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Ionicons name="pencil" size={16} color={ColorPalette.white} />
            </View>
          </View>
          <Text style={styles.imagePickerText}>Change Profile Picture</Text>
        </TouchableOpacity>

        <View style={styles.inputsContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              placeholderTextColor={ColorPalette.grey_text}
              value={formData.first_name}
              onChangeText={(text) => handleInputChange('first_name', text)}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              placeholderTextColor={ColorPalette.grey_text}
              value={formData.last_name}
              onChangeText={(text) => handleInputChange('last_name', text)}
            />
          </View>

          <TouchableOpacity 
            style={styles.inputWrapper}
            onPress={() => setShowDateModal(true)}
          >
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <View style={styles.datePickerButton}>
              <Text style={[styles.dateText, !formData.dob && styles.placeholderText]}>
                {formData.dob || 'Select date of birth'}
              </Text>
              <Ionicons name="calendar" size={20} color={ColorPalette.grey_text} />
            </View>
          </TouchableOpacity>

          {/* Render custom date modal */}
          {renderDateModal()}
          
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about yourself"
              placeholderTextColor={ColorPalette.grey_text}
              value={formData.bio}
              onChangeText={(text) => handleInputChange('bio', text)}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={ColorPalette.white} />
            ) : (
              <Text style={styles.submitButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Replace CustomDialog with CustomAlert */}
      <CustomAlert 
        visible={alertVisible}
        type={alertType}
        message={alertMessage}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.main_black,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40, // Add extra padding at bottom
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.border_color,
    backgroundColor: ColorPalette.main_black, // Ensure header has background
    zIndex: 1, // Keep header above scroll content
  },
  headerText: {
    color: ColorPalette.white,
    fontSize: 18,
    fontFamily: 'CG-Bold',
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ColorPalette.card_bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: ColorPalette.green,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: ColorPalette.main_black,
  },
  imagePickerText: {
    color: ColorPalette.white,
    fontSize: 16,
    fontFamily: 'CG-Medium',
    marginTop: 8,
  },
  inputsContainer: {
    padding: 16,
    paddingBottom: 40, // Extra padding for keyboard
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    color: ColorPalette.white,
    fontSize: 14,
    fontFamily: 'CG-Medium',
    marginBottom: 8,
  },
  input: {
    backgroundColor: ColorPalette.card_bg,
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ColorPalette.card_bg,
    borderRadius: 8,
    paddingRight: 12,
    paddingVertical: 12,
  },
  dateText: {
    color: ColorPalette.white,
    fontSize: 16,
    fontFamily: 'CG-Regular',
    flex: 1,
    paddingLeft: 12,
    },
  placeholderText: {
    color: ColorPalette.grey_text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: ColorPalette.green,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: ColorPalette.white,
    fontSize: 16,
    fontFamily: 'CG-Medium',
  },
  disabledButton: {
    backgroundColor: ColorPalette.green + '80',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dateModalContent: {
    backgroundColor: ColorPalette.card_bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.border_color,
  },
  dateModalTitle: {
    color: ColorPalette.white,
    fontSize: 18,
    fontFamily: 'CG-Medium',
  },
  datePickerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.border_color,
  },
  dateOptionText: {
    color: ColorPalette.white,
    fontSize: 16,
    fontFamily: 'CG-Regular',
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: ColorPalette.border_color,
  },
  backButtonText: {
    color: ColorPalette.green,
    fontSize: 16,
    fontFamily: 'CG-Medium',
  },
});

export default EditProfileScreen;
