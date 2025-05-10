import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Animated, 
  Image, 
  Alert,
  StatusBar,
  SafeAreaView
} from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import ColorPallete from '../../constants/ColorPalette';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/authSlice';
import ScreenLayout from '../../components/layout/ScreenLayout';

export default function AccountScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [orgData, setOrgData] = useState(null);
  const dispatch = useDispatch();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userJSON = await AsyncStorage.getItem('user');
        const orgJSON = await AsyncStorage.getItem('organization');
        
        if (userJSON) {
          console.log('User data:', JSON.parse(userJSON));
          setUserData(JSON.parse(userJSON));
        }
        
        if (orgJSON) {
          setOrgData(JSON.parse(orgJSON));
        }
      } catch (error) {
        console.error('Error fetching data from localStorage:', error);
      }
    };
    
    fetchUserData();
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
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
          }
        }
      ]
    );
  };

  return (
    <ScreenLayout 
      backgroundColor="#f8f8f8" 
      statusBarStyle="dark-content"
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>My Account</Text>
        </View>

        {/* User Profile Info */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            {userData?.profileImage ? (
              <Image 
                source={{ uri: userData.profileImage }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userData?.first_name?.charAt(0) || userData?.email?.charAt(0) || '?'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {userData ? `${userData.first_name} ${userData.last_name}` : 'User Name'}
            </Text>
            <Text style={styles.userEmail}>{userData?.email || 'email@example.com'}</Text>
            <Text style={styles.userDetail}>Username: {userData?.username || 'Not specified'}</Text>
            <Text style={styles.userDetail}>Role: {userData?.role || 'Not specified'}</Text>
            {orgData && (
              <Text style={styles.organization}>
                Organization: {orgData.name || 'Not specified'}
              </Text>
            )}
          </View>
        </View>
     
        {/* Other Options */}
        <TouchableOpacity style={styles.optionItem}>
          <Text style={styles.optionText}>Account Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Text style={styles.optionText}>Notification Preferences</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Text style={styles.optionText}>My Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Text style={styles.optionText}>Privacy Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Text style={styles.optionText}>Support and Feedback</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons 
            name="log-out-outline" 
            size={24} 
            color="#FF6B6B" 
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16, // Reduced from 24 as SafeAreaView handles status bar space
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderWidth: 0,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ColorPallete.main_black_2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ColorPallete.text_black,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: ColorPallete.text_black,
    opacity: 0.8,
    marginBottom: 4,
  },
  organization: {
    fontSize: 14,
    color: ColorPallete.text_black,
    opacity: 0.8,
  },
  userDetail: {
    fontSize: 14,
    color: ColorPallete.text_black,
    opacity: 0.8,
    marginBottom: 4,
  },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 0, // No lines between options
  },
  optionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: ColorPallete.text_black,
  },
  arrow: {
    marginLeft: 10,
    fontSize: 16,
    color: ColorPallete.text_black,
  },
  dropdownContent: {
    position: 'absolute', // Position it above other content
    top: 60, // Position it right below the "Professional Information" section
    left: 16,
    right: 16,
    paddingLeft: 16,
    paddingVertical: 8,
    backgroundColor: '#333333',
    borderRadius: 8,
    marginTop: 10,
    zIndex: 999, // Ensures it stays on top of other content
  },
  dropdownText: {
    fontSize: 14,
    color: ColorPallete.pop_up_white,
    marginBottom: 6,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    marginTop: 30,
    marginBottom: 40,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutIcon: {
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
});
