import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ColorPalette from '../../constants/ColorPalette';
import ChatItem from '../../components/ChatItem';
import { dummyDirectMessages, dummyGroupChats } from '../../data/chatData';

export default function MessagingScreen({navigation}) {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'groups'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDirectMessages = searchQuery 
    ? dummyDirectMessages.filter(chat => 
        chat.user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    : dummyDirectMessages;

  const filteredGroupChats = searchQuery 
    ? dummyGroupChats.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : dummyGroupChats;

  const renderChatItem = ({ item }) => {
    return (
      <ChatItem 
        chat={item} 
        isGroupChat={activeTab === 'groups'} 
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="create-outline" size={24} color={ColorPalette.white}
            onPress={()=>navigation.navigate("CreateGroupScreen")}/>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor={ColorPalette.white}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={ColorPalette.gradient_text} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'direct' && styles.activeTab]}
          onPress={() => setActiveTab('direct')}
        >
          <Text style={[styles.tabText, activeTab === 'direct' && styles.activeTabText]}>Direct Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>Group Chats</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <FlatList
        data={activeTab === 'direct' ? filteredDirectMessages : filteredGroupChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    color: ColorPalette.white,
    fontFamily: 'CG-Bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorPalette.dark_gray,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    height: 46,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
    color: ColorPalette.white,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
  },
  clearButton: {
    padding: 4,
    color: ColorPalette.white,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent:'space-between'
  },
  tab: {
    paddingVertical: 12,
    marginRight: 16,
    width: '45%',
    alignItems: 'center',
    
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.gradient_text,
  },
  tabText: {
    color: ColorPalette.white,
    fontSize: 16,
    fontFamily: 'CG-Medium',
  },
  activeTabText: {
    color: ColorPalette.gradient_text,
  },
  divider: {
    height: 1,
    backgroundColor: ColorPalette.dark_gray,
    width: '100%',
    marginBottom: 8,
  },
  chatList: {
    paddingHorizontal: 16,
  },
});
