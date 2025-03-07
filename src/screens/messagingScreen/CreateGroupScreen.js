import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Pressable,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ColorPalette from '../../constants/ColorPalette';
import { dummyDirectMessages } from '../../data/chatData';
import * as ImagePicker from 'expo-image-picker';

// Extracting all users from direct messages for member selection
const allUsers = dummyDirectMessages.map(chat => chat.user);

export default function CreateGroupScreen({ navigation }) {
  const [step, setStep] = useState(1); // Step 1: Select members, Step 2: Group details
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(null);

  // Animation for transition between steps
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const filteredUsers = searchQuery
    ? allUsers.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allUsers;

  const handleMemberSelection = (user) => {
    const isAlreadySelected = selectedMembers.some(member => member.id === user.id);
    
    if (isAlreadySelected) {
      setSelectedMembers(selectedMembers.filter(member => member.id !== user.id));
    } else {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(member => member.id !== userId));
  };

  const goToNextStep = () => {
    // Animate to next step
    Animated.timing(slideAnimation, {
      toValue: -1,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setStep(2);
      slideAnimation.setValue(1);
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    });
  };

  const goToPrevStep = () => {
    // Animate to previous step
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setStep(1);
      slideAnimation.setValue(-1);
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    });
  };

  const handleCreateGroup = () => {
    // Don't run animations when creating group
    // Here you would typically save the group details to your backend
    alert(`Group "${groupName}" created with ${selectedMembers.length} members!`);
    navigation.navigate('ChatConversation', {
      isGroupChat: true,
      chatName: groupName,
      members: selectedMembers
    });
  };

  const handleSelectGroupImage = async () => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to set a group image.');
      return;
    }
    
    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    // If the user didn't cancel, update the group image
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setGroupImage(result.assets[0].uri);
    }
  };

  const renderMemberItem = ({ item }) => {
    const isSelected = selectedMembers.some(member => member.id === item.id);
    
    return (
      <TouchableOpacity 
        style={styles.userItem} 
        onPress={() => handleMemberSelection(item)}
      >
        <Image source={{ uri: item.profileImage }} style={styles.userAvatar} />
        <View style={styles.userDetails}>
          <Text style={styles.username}>{item.username}</Text>
        </View>
        <View style={[
          styles.checkbox,
          isSelected && styles.checkboxSelected
        ]}>
          {isSelected && <Ionicons name="checkmark" size={18} color={ColorPalette.dark_bg} />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectedMembersSection = () => {
    if (selectedMembers.length === 0) return null;
    
    return (
      <View style={styles.selectedMembersContainer}>
        <Text style={styles.sectionTitle}>
          Selected Members ({selectedMembers.length})
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.selectedMembersScrollView}
          contentContainerStyle={styles.selectedMembersContent}
        >
          {selectedMembers.map(member => (
            <View key={member.id} style={styles.selectedMemberItem}>
              <Image source={{ uri: member.profileImage }} style={styles.selectedMemberAvatar} />
              <Text style={styles.selectedMemberName} numberOfLines={1}>
                {member.username}
              </Text>
              <TouchableOpacity 
                style={styles.removeMemberButton}
                onPress={() => handleRemoveMember(member.id)}
              >
                <Ionicons name="close-circle" size={20} color={ColorPalette.white} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderMemberSelectionStep = () => {
    return (
      <Animated.View 
        style={[
          styles.stepContainer,
          { transform: [{ translateX: slideAnimation.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: ['-100%', '0%', '100%'],
          }) }] }
        ]}
      >
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={ColorPalette.white} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={ColorPalette.text_gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={ColorPalette.gradient_text} />
            </TouchableOpacity>
          )}
        </View>
        
        {renderSelectedMembersSection()}
        
        <FlatList
          data={filteredUsers}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.id}
          style={styles.usersList}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No contacts found</Text>
          }
        />
      </Animated.View>
    );
  };

  const renderGroupDetailsStep = () => {
    // Remove animation from the group details step to prevent UI issues
    return (
      <View style={styles.stepContainer}>
        <View style={styles.groupDetailsContainer}>
          <TouchableOpacity 
            style={styles.groupImageContainer}
            onPress={handleSelectGroupImage}
          >
            {groupImage ? (
              <Image source={{ uri: groupImage }} style={styles.groupImage} />
            ) : (
              <View style={styles.groupImagePlaceholder}>
                <Ionicons name="camera" size={40} color={ColorPalette.white} />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.groupNameContainer}>
            <TextInput
              style={styles.groupNameInput}
              placeholder="Group Name"
              placeholderTextColor={ColorPalette.text_gray}
              value={groupName}
              onChangeText={setGroupName}
              maxLength={30}
            />
          </View>
          
          <View style={styles.membersPreviewContainer}>
            <Text style={styles.sectionTitle}>Group Members ({selectedMembers.length})</Text>
            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
              {selectedMembers.map(item => (
                <View key={item.id} style={styles.memberPreviewItem}>
                  <Image source={{ uri: item.profileImage }} style={styles.memberPreviewAvatar} />
                  <Text style={styles.memberPreviewName}>{item.username}</Text>
                  <TouchableOpacity
                    style={styles.removeMemberIcon}
                    onPress={() => handleRemoveMember(item.id)}
                  >
                    <Ionicons name="close-circle" size={22} color={ColorPalette.gradient_text} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (step === 1) {
              navigation.goBack();
            } else {
              goToPrevStep();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={ColorPalette.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {step === 1 ? 'New Group' : 'Group Details'}
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.nextButton,
            (step === 1 && selectedMembers.length === 0) || 
            (step === 2 && !groupName.trim()) ? styles.disabledButton : {}
          ]}
          disabled={
            (step === 1 && selectedMembers.length === 0) || 
            (step === 2 && !groupName.trim())
          }
          onPress={() => {
            if (step === 1) {
              goToNextStep();
            } else {
              handleCreateGroup();
            }
          }}
        >
          <Text style={[
            styles.nextButtonText,
            (step === 1 && selectedMembers.length === 0) || 
            (step === 2 && !groupName.trim()) ? styles.disabledButtonText : {}
          ]}>
            {step === 1 ? 'Next' : 'Done'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {step === 1 ? (
        renderMemberSelectionStep()
      ) : (
        renderGroupDetailsStep()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.dark_bg,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.dark_gray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ColorPalette.dark_gray,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'CG-Medium',
    color: ColorPalette.white,
    textAlign: 'center',
  },
  nextButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: ColorPalette.gradient_text,
  },
  nextButtonText: {
    color: ColorPalette.text_black,
    fontFamily: 'CG-Medium',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: ColorPalette.dark_gray,
  },
  disabledButtonText: {
    color: ColorPalette.text_gray,
  },
  stepContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorPalette.dark_gray,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 16,
    height: 46,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
  },
  clearButton: {
    padding: 4,
  },
  selectedMembersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
    fontSize: 16,
    marginBottom: 10,
  },
  selectedMembersScrollView: {
    flexGrow: 0,
  },
  selectedMembersContent: {
    paddingBottom: 10,
  },
  selectedMemberItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 76,
  },
  selectedMemberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  selectedMemberName: {
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    fontSize: 12,
    textAlign: 'center',
    width: 70,
  },
  removeMemberButton: {
    position: 'absolute',
    top: 0,
    right: 5,
    backgroundColor: ColorPalette.dark_bg,
    borderRadius: 10,
  },
  usersList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.dark_gray,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ColorPalette.text_gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: ColorPalette.gradient_text,
    borderColor: ColorPalette.gradient_text,
  },
  emptyListText: {
    color: ColorPalette.text_gray,
    fontFamily: 'CG-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  // Group details styles
  groupDetailsContainer: {
    flex: 1,
    padding: 16,
  },
  groupImageContainer: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  groupImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ColorPalette.dark_gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
    fontSize: 14,
    marginTop: 5,
  },
  groupNameContainer: {
    marginBottom: 24,
  },
  groupNameInput: {
    backgroundColor: ColorPalette.dark_gray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
    fontSize: 16,
  },
  membersPreviewContainer: {
    flex: 1,
  },
  memberPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.dark_gray,
  },
  memberPreviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberPreviewName: {
    flex: 1,
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    fontSize: 16,
    marginLeft: 12,
  },
  removeMemberIcon: {
    padding: 5,
  },
});
