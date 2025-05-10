import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ColorPalette from '../../../constants/ColorPalette';
import api from '../../../services/apiService';
import { ORGANIZATION_ENDPOINTS } from '../../../constants/ApiConstants';

const UserItem = memo(({ user, onSelect }) => {
  return (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => onSelect(user)}
    >
      <View style={styles.userAvatar}>
        {user.profileImage ? (
          <Image 
            source={{ uri: user.profileImage }}
            style={styles.avatarImage}
          />
        ) : (
          <Text style={styles.avatarText}>
            {user.username.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.username}</Text>
        <Text style={styles.userMeta}>{user.email || `@${user.username.toLowerCase()}`}</Text>
      </View>
    </TouchableOpacity>
  );
});

// Implement the searchUsers function using organization details
const searchUsers = async (query, organizationId) => {
  try {
    // Get organization details which includes the users list
    const response = await api.get(ORGANIZATION_ENDPOINTS.GET_DETAILS(organizationId));
    
    // Extract users from the organization data
    const organizationUsers = response.data.users || [];
    
    // If query is provided, filter users by username, first_name, or last_name
    if (query && query.trim() !== '') {
      const lowercaseQuery = query.toLowerCase();
      return organizationUsers.filter(user => 
        (user.username && user.username.toLowerCase().includes(lowercaseQuery)) || 
        (user.first_name && user.first_name.toLowerCase().includes(lowercaseQuery)) || 
        (user.last_name && user.last_name.toLowerCase().includes(lowercaseQuery)) || 
        (user.email && user.email.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    // Return all users if no query
    return organizationUsers;
  } catch (error) {
    console.error('API error fetching organization users:', error);
    throw error;
  }
};

const UserSearchModal = ({ visible, onClose, onSelectUser, organizationId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search for users when query changes
  useEffect(() => {
    if (!visible) return;
    
    const searchTimer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        fetchUsers(searchQuery);
      } else {
        fetchUsers(''); // Get all users when no query
      }
    }, 500);
    
    return () => clearTimeout(searchTimer);
  }, [searchQuery, visible, organizationId]);
  
  // Fetch users from API
  const fetchUsers = useCallback(async (query) => {
    if (!organizationId) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await searchUsers(query, organizationId);
      setUsers(result);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);
  
  // Clear search when modal is closed
  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
      setUsers([]);
    }
  }, [visible]);
  
  // Handle selecting a user
  const handleSelectUser = useCallback((user) => {
    onSelectUser(user);
    // Don't close modal to allow tagging multiple users
  }, [onSelectUser]);

  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tag People</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={ColorPalette.white} />
            </TouchableOpacity>
          </View>
          
          {/* Search input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={ColorPalette.grey_text} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or username"
              placeholderTextColor={ColorPalette.grey_text}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          {/* Loading/error states */}
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={ColorPalette.green} />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <FlatList
              data={users.length > 0 ? users : []}
              keyExtractor={item => `user-${item.id}`}
              renderItem={({ item }) => (
                <UserItem user={item} onSelect={handleSelectUser} />
              )}
              contentContainerStyle={styles.userList}
              ListEmptyComponent={
                <View style={styles.centerContainer}>
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              }
              ListFooterComponent={
                users.length > 0 ? (
                  <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>
                      Tap on a user to tag them. You can tag multiple users.
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: ColorPalette.main_black,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.border_color || '#2A2A2A',
  },
  modalTitle: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorPalette.card_bg || '#1A1A1A',
    paddingHorizontal: 12,
    margin: 16,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    padding: 12,
    fontSize: 16,
  },
  userList: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#FF6B6B',
    fontFamily: 'CG-Regular',
    textAlign: 'center',
  },
  emptyText: {
    color: ColorPalette.grey_text,
    fontFamily: 'CG-Regular',
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.border_color || '#2A2A2A',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ColorPalette.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    color: ColorPalette.white,
    fontFamily: 'CG-Bold',
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
    fontSize: 16,
  },
  userMeta: {
    color: ColorPalette.grey_text,
    fontFamily: 'CG-Regular',
    fontSize: 14,
  },
  footerContainer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: ColorPalette.border_color || '#2A2A2A',
  },
  footerText: {
    color: ColorPalette.grey_text,
    fontFamily: 'CG-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default memo(UserSearchModal);
