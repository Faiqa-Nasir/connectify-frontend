import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Image, 
  Alert
} from 'react-native';
import React, { useState, useContext, useEffect, useCallback } from 'react';
import ColorPalette from '../../constants/ColorPalette';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/authSlice';
import ScreenLayout from '../../components/layout/ScreenLayout';
import Header, { HEADER_HEIGHT } from '../../components/Header';
import { fetchUserData } from '../../utils/userUtils';
import CustomDialog from '../../components/CustomDialog';

export default function AccountScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [orgData, setOrgData] = useState(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dispatch = useDispatch();
  
  // Update the fetchUserData implementation
  const loadUserData = useCallback(async () => {
    try {
      const user = await fetchUserData();
      if (user) {
        setUserData(user);
        return user;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    return null;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadUserData();
        const orgJSON = await AsyncStorage.getItem('organization');
        if (orgJSON) {
          setOrgData(JSON.parse(orgJSON));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    loadData();
  }, [loadUserData]);

  // Handle user logout
  const handleLogout = async () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    try {
      // Clear all data from AsyncStorage
      await AsyncStorage.clear();
      
      // Dispatch logout action to Redux
      dispatch(logoutUser());
      
      // Navigate to Auth stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <ScreenLayout 
      backgroundColor={ColorPalette.main_black} 
      statusBarStyle="light-content"
    >
      <Header 
        title="Account Settings"
        showCreateButton={false}
      />
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: HEADER_HEIGHT + 20 }
        ]}
      >
        {/* Redesigned User Profile Info */}
        <View style={styles.profileContainer}>
          <View style={styles.userInfoContainer}>
            <View style={styles.avatarContainer}>
              {userData?.profile_image ? (
                <Image 
                  source={{ uri: userData.profile_image }} 
                  style={styles.avatar}
                  key={userData.profile_image}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {userData?.first_name?.charAt(0) || userData?.email?.charAt(0) || '?'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {userData ? `${userData.first_name} ${userData.last_name}` : 'Loading...'}
              </Text>
              <Text style={styles.userHandle}>@{userData?.username || 'username'}</Text>
              <Text style={styles.userRole}>{userData?.bio || ' '}</Text>
              {orgData && (
                <Text style={styles.organization}>
                  {orgData.name}
                </Text>
              )}
            </View>
          </View>
        </View>
     
        {/* Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionText}>Account Details</Text>
            <Ionicons name="chevron-forward" size={20} color={ColorPalette.grey_text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionText}>Notification Preferences</Text>
            <Ionicons name="chevron-forward" size={20} color={ColorPalette.grey_text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionText}>My Plan</Text>
            <Ionicons name="chevron-forward" size={20} color={ColorPalette.grey_text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionText}>Privacy Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={ColorPalette.grey_text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionText}>Support and Feedback</Text>
            <Ionicons name="chevron-forward" size={20} color={ColorPalette.grey_text} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons 
            name="log-out-outline" 
            size={24} 
            color={ColorPalette.white}
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomDialog
        visible={showLogoutDialog}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
        confirmText="Logout"
        type="destructive"
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.main_black,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  profileContainer: {
    backgroundColor: ColorPalette.card_bg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: ColorPalette.border_color,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ColorPalette.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: ColorPalette.white,
    fontSize: 32,
    fontFamily: 'CG-Bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    color: ColorPalette.white,
    fontFamily: 'CG-Bold',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    color: ColorPalette.grey_text,
    fontFamily: 'CG-Regular',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    marginBottom: 4,
  },
  organization: {
    fontSize: 14,
    color: ColorPalette.green,
    fontFamily: 'CG-Medium',
  },
  optionsContainer: {
    backgroundColor: ColorPalette.card_bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ColorPalette.border_color,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.border_color,
  },
  optionText: {
    fontSize: 16,
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ColorPalette.dark_red || '#661111',
    marginTop: 30,
    marginBottom: 40,
    padding: 16,
    borderRadius: 12,
  },
  logoutIcon: {
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'CG-Medium',
    color: ColorPalette.white,
  },
});
