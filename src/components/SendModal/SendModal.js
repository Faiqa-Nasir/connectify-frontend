import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  ToastAndroid,
  Platform,
  Alert,
  ScrollView,
  Clipboard,
} from 'react-native';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import DynamicModal from '../DynamicModal';
import ColorPalette from '../../constants/ColorPalette';

// Sample users data - would be fetched from API in a real app
const dummyUsers = [
  { id: '1', username: 'JohnDoe', name: 'John Doe', profileImage: 'https://randomuser.me/api/portraits/men/1.jpg', followedByYou: true },
  { id: '2', username: 'JaneSmith', name: 'Jane Smith', profileImage: 'https://randomuser.me/api/portraits/women/2.jpg', followedByYou: true },
  { id: '3', username: 'MikeJohnson', name: 'Mike Johnson', profileImage: 'https://randomuser.me/api/portraits/men/3.jpg', followedByYou: true },
  { id: '4', username: 'EmilyBrown', name: 'Emily Brown', profileImage: 'https://randomuser.me/api/portraits/women/4.jpg', followedByYou: false },
  { id: '5', username: 'DavidWilson', name: 'David Wilson', profileImage: 'https://randomuser.me/api/portraits/men/5.jpg', followedByYou: false },
  { id: '6', username: 'SarahLee', name: 'Sarah Lee', profileImage: 'https://randomuser.me/api/portraits/women/6.jpg', followedByYou: true },
  { id: '7', username: 'RobertSmith', name: 'Robert Smith', profileImage: 'https://randomuser.me/api/portraits/men/7.jpg', followedByYou: true },
  { id: '8', username: 'LisaJones', name: 'Lisa Jones', profileImage: 'https://randomuser.me/api/portraits/women/8.jpg', followedByYou: false },
  { id: '9', username: 'StevenBrown', name: 'Steven Brown', profileImage: 'https://randomuser.me/api/portraits/men/9.jpg', followedByYou: true },
  { id: '10', username: 'AmandaWilson', name: 'Amanda Wilson', profileImage: 'https://randomuser.me/api/portraits/women/10.jpg', followedByYou: false },
];

// Social platforms
const socialPlatforms = [
  { id: 'whatsapp', name: 'WhatsApp', icon: <FontAwesome5 name="whatsapp" size={24} color="#25D366" /> },
  { id: 'instagram', name: 'Instagram', icon: <AntDesign name="instagram" size={24} color="#C13584" /> },
  { id: 'facebook', name: 'Facebook', icon: <FontAwesome5 name="facebook" size={24} color="#1877F2" /> },
  { id: 'twitter', name: 'Twitter', icon: <FontAwesome name="twitter" size={24} color="#1DA1F2" /> },
  { id: 'snapchat', name: 'Snapchat', icon: <FontAwesome5 name="snapchat" size={24} color="#FFFC00" /> },
  { id: 'telegram', name: 'Telegram', icon: <FontAwesome5 name="telegram-plane" size={24} color="#0088cc" /> },
  { id: 'messenger', name: 'Messenger', icon: <FontAwesome5 name="facebook-messenger" size={24} color="#00B2FF" /> },
  { id: 'email', name: 'Email', icon: <MaterialCommunityIcons name="email-outline" size={24} color="#D44638" /> },
  { id: 'sms', name: 'SMS', icon: <MaterialCommunityIcons name="message-text-outline" size={24} color="#5BC236" /> },
];

const SendModal = ({ visible, onClose, postId, postImage, postCaption, postUsername }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(dummyUsers);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [recentUsers, setRecentUsers] = useState(dummyUsers.slice(0, 4));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'platforms'
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(dummyUsers);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = dummyUsers.filter(
        user => 
          user.username.toLowerCase().includes(lowercasedQuery) || 
          user.name.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery]);

  const toggleUserSelection = (user) => {
    setSelectedUsers(prevSelected => {
      if (prevSelected.some(selectedUser => selectedUser.id === user.id)) {
        return prevSelected.filter(selectedUser => selectedUser.id !== user.id);
      } else {
        return [...prevSelected, user];
      }
    });
  };

  const handleSend = async () => {
    if (selectedUsers.length === 0) {
      // Show notification that no users are selected
      Platform.OS === 'android'
        ? ToastAndroid.show('Please select at least one user', ToastAndroid.SHORT)
        : Alert.alert('Error', 'Please select at least one user');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setShowSuccessMessage(true);
      
      // Update recent users with selected users
      const newRecentUsers = [...selectedUsers, ...recentUsers];
      const uniqueRecentUsers = Array.from(new Map(newRecentUsers.map(user => [user.id, user])).values()).slice(0, 4);
      setRecentUsers(uniqueRecentUsers);
      
      setTimeout(() => {
        setShowSuccessMessage(false);
        onClose();
        setSelectedUsers([]);
        setMessage('');
      }, 1500);
    }, 1000);
  };

  const handleCopyLink = () => {
    // Fix: Use correct Clipboard API
    Clipboard.setString(`https://connectify.com/p/${postId}`);
    
    Platform.OS === 'android'
      ? ToastAndroid.show('Link copied to clipboard', ToastAndroid.SHORT)
      : Alert.alert('Success', 'Link copied to clipboard');
  };

  const handleShareToPlatform = (platform) => {
    setLoading(true);
    
    // Simulate sharing to platform
    setTimeout(() => {
      setLoading(false);
      Platform.OS === 'android'
        ? ToastAndroid.show(`Shared to ${platform.name}`, ToastAndroid.SHORT)
        : Alert.alert('Success', `Shared to ${platform.name}`);
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 500);
    }, 800);
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => toggleUserSelection(item)}
    >
      <View style={styles.userInfoContainer}>
        <Image source={{ uri: item.profileImage }} style={styles.userAvatar} />
        <View style={styles.userTextContainer}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userUsername}>{item.username}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.selectButton, 
          selectedUsers.some(u => u.id === item.id) && styles.selectedButton
        ]}
        onPress={() => toggleUserSelection(item)}
      >
        {selectedUsers.some(u => u.id === item.id) ? (
          <Ionicons name="checkmark" size={18} color={ColorPalette.white} />
        ) : (
          <Text style={styles.selectButtonText}>Send</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPlatformItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.platformItem}
      onPress={() => handleShareToPlatform(item)}
    >
      <View style={styles.platformIconContainer}>
        {item.icon}
      </View>
      <Text style={styles.platformName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <DynamicModal
      visible={visible}
      onClose={onClose}
      title="Share"
      height="75%"
    >
    <View style={{display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
      {/* Preview of what's being shared */}
      <View style={styles.previewContainer}>
        {postImage && (
          <Image 
            source={{ uri: postImage }} 
            style={styles.previewImage} 
          />
        )}
        <View>
          <Text style={styles.previewTitle}>Post by {postUsername ? postUsername : 'Unknown'}</Text>
          <Text 
            style={styles.previewCaption}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {postCaption || 'Share this post with your friends'}
          </Text>
        </View>
      </View>

      {/* Copy link button */}
      <TouchableOpacity 
        style={styles.copyLinkButton}
        onPress={handleCopyLink}
      >
        <Ionicons name="link-outline" size={20} color={ColorPalette.white} />
      </TouchableOpacity>

      </View>

      {/* Tab Selection */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]} 
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'platforms' && styles.activeTab]}
          onPress={() => setActiveTab('platforms')}
        >
          <Text style={[styles.tabText, activeTab === 'platforms' && styles.activeTabText]}>Social Platforms</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'users' ? (
        <>
          {/* Search bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={ColorPalette.grey_text} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor={ColorPalette.grey_text}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={ColorPalette.grey_text} />
              </TouchableOpacity>
            )}
          </View>

          {/* Recent users */}
          {searchQuery.trim() === '' && recentUsers.length > 0 && (
            <View style={styles.recentContainer}>
              <Text style={styles.sectionTitle}>Recent</Text>
              <View style={styles.recentUsersContainer}>
                {recentUsers.map(user => (
                  <TouchableOpacity 
                    key={user.id} 
                    style={styles.recentUserItem}
                    onPress={() => toggleUserSelection(user)}
                  >
                    <View style={[
                      styles.recentUserAvatar,
                      selectedUsers.some(u => u.id === user.id) && styles.selectedRecentAvatar
                    ]}>
                      <Image source={{ uri: user.profileImage }} style={styles.recentUserImage} />
                      {selectedUsers.some(u => u.id === user.id) && (
                        <View style={styles.checkmarkOverlay}>
                          <Ionicons name="checkmark" size={14} color={ColorPalette.white} />
                        </View>
                      )}
                    </View>
                    <Text 
                      style={styles.recentUserName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {user.username}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* All users list */}
          <View style={styles.usersListContainer}>
            <Text style={styles.sectionTitle}>{searchQuery ? 'Results' : 'Suggested'}</Text>
            {filteredUsers.length > 0 ? (
              <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.usersList}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No users found</Text>
              </View>
            )}
          </View>

          {/* Selected users chips */}
          {selectedUsers.length > 0 && (
            <View style={styles.selectedUsersContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedUsersScrollContent}
              >
                {selectedUsers.map(user => (
                  <View key={user.id} style={styles.selectedUserChip}>
                    <Text style={styles.selectedUserText}>{user.username}</Text>
                    <TouchableOpacity onPress={() => toggleUserSelection(user)}>
                      <Ionicons name="close-circle" size={18} color={ColorPalette.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Send button */}
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={ColorPalette.gradient_text} size="small" />
            ) : showSuccessMessage ? (
              <Text style={styles.sendButtonText}>Sent!</Text>
            ) : (
              <Text style={styles.sendButtonText}>
                Send to {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'}
              </Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        // Social platforms tab
        <View style={styles.platformsContainer}>
          <Text style={styles.sectionTitle}>Share to</Text>
          <FlatList
            data={socialPlatforms}
            renderItem={renderPlatformItem}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={styles.platformsList}
          />
        </View>
      )}
    </DynamicModal>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    backgroundColor: ColorPalette.main_black,
    borderRadius: 8,
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  previewTitle: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
    fontSize: 14,
  },
  previewCaption: {
    color: ColorPalette.grey_text,
    fontFamily: 'CG-Regular',
    fontSize: 12,
  },
  copyLinkButton: {
   display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: ColorPalette.main_black,
    borderRadius: 25,
  },
  copyLinkText: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: ColorPalette.main_black,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: ColorPalette.gradient_text,
  },
  tabText: {
    color: ColorPalette.grey_text,
    fontFamily: 'CG-Medium',
  },
  activeTabText: {
    color: ColorPalette.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorPalette.main_black,
    borderRadius: 25,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
  },
  recentContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
    fontSize: 16,
    marginBottom: 8,
  },
  recentUsersContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recentUserItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  recentUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
    position: 'relative',
  },
  selectedRecentAvatar: {
    borderWidth: 2,
    borderColor: ColorPalette.gradient_text,
  },
  recentUserImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  checkmarkOverlay: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ColorPalette.gradient_text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentUserName: {
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    fontSize: 12,
    textAlign: 'center',
    width: 60,
  },
  usersListContainer: {
    flex: 1,
  },
  usersList: {
    paddingBottom: 90,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
  },
  userUsername: {
    color: ColorPalette.grey_text,
    fontFamily: 'CG-Regular',
    fontSize: 12,
  },
  selectButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: ColorPalette.main_black,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedButton: {
    backgroundColor: ColorPalette.gradient_text,
    borderColor: ColorPalette.gradient_text,
  },
  selectButtonText: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
    fontSize: 12,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noResultsText: {
    color: ColorPalette.grey_text,
    fontFamily: 'CG-Regular',
  },
  selectedUsersContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: ColorPalette.dark_bg,
    paddingVertical: 8,
  },
  selectedUsersScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  selectedUserText: {
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    fontSize: 12,
    marginRight: 4,
  },
  messageContainer: {
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  messageInput: {
    backgroundColor: ColorPalette.main_black,
    borderRadius: 8,
    padding: 10,
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: ColorPalette.white,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: ColorPalette.main_black,
    fontFamily: 'CG-Medium',
  },
  platformsContainer: {
    flex: 1,
  },
  platformsList: {
    paddingBottom: 20,
  },
  platformItem: {
    width: '33.33%',
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  platformIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformName: {
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default SendModal;
