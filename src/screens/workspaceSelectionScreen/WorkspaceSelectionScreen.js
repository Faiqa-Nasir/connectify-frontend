import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons/';
import ColorPalette from '../../constants/ColorPalette';
import RoundedContainer from '../../components/RoundedContainer';
import CustomButton from '../../components/CustomButton';
import { FontAwesome } from '@expo/vector-icons';
import { AntDesign } from "@expo/vector-icons";

const WorkspaceSelectionScreen = ({navigation}) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching workspaces (replace with actual API call)
    setTimeout(() => {
      const mockWorkspaces = [
        { id: '1', name: 'Connectify HQ', memberCount: 15, icon: 'domain' },
        { id: '2', name: 'Dev Team Workspace', memberCount: 8, icon: 'code' },
        { id: '3', name: 'Design Team Workspace', memberCount: 5, icon: 'palette' },
      ];
      setWorkspaces(mockWorkspaces);
      setLoading(false);
    }, 1500);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.workspaceItem}>
      <View style={styles.memberPills}>
      <MaterialIcons name={item.icon} size={24} color={ColorPalette.primary} style={styles.workspaceIcon} />
      <View style={styles.workspaceInfo}>
        <Text style={styles.workspaceName}>{item.name}</Text>
        <View style={styles.memberCountContainer}>
          <Text style={styles.memberCount}>Members: {item.memberCount}</Text>
        </View>
      </View>
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Join"
          onPress={() => {
            // Handle join workspace logic here
            alert(`Joining workspace: ${item.name}`);
          }}
          height={15}
          width={70}
          fontSize={12}
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        
        <RoundedContainer>
        <Text style={styles.title}>Workspaces</Text>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ColorPalette.green} />
          <Text style={styles.loadingText}>Loading Workspaces...</Text>
        </View>
        </RoundedContainer>
      </View>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <View style={styles.container}>
        <RoundedContainer>
        <Text style={styles.title}>Workspaces</Text>
          <View style={styles.centered}>
        <MaterialIcons name="domain-disabled" size={60} color={ColorPalette.grey_text} />
        <Text style={styles.noWorkspacesText}>No workspaces available.</Text>
        <Text style={styles.noWorkspacesSubText}>Contact your administrator to create a workspace.</Text>
        </View>
        </RoundedContainer>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RoundedContainer>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={24} color={ColorPalette.green} />
          </TouchableOpacity>
          <Text style={styles.helpText}>Help</Text>
        </View>
        <Text style={styles.title}>Workspaces</Text>

      
        <View style={styles.workspaceContainer}>
          <Text style={styles.header}>Select a Workspace</Text>
          <Text style={styles.description}>Choose a workspace to join and start collaborating with your team.</Text>
          <FlatList
            data={workspaces}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false} // Hide vertical scroll indicator
          />
          
        </View>
 
      </RoundedContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: ColorPalette.green,
  },
  workspaceContainer: {

    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ColorPalette.light_bg,
    padding: 20,
    marginTop: 50,
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: 400,
  },
  title: {
    fontSize: 20,
    color: ColorPalette.text_black,
    fontFamily: 'CG-Semibold',
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    fontSize: 24,
    fontFamily: 'CG-Bold',
    color: ColorPalette.primary,
    marginBottom: 20,
  },
  list: {
    width: '100%',
    overflowY: 'hidden',
  },
  workspaceItem: {
    flexDirection: 'row', // Arrange items horizontally
    justifyContent: 'space-between', // Push button to the right
    alignItems: 'center', // Align items vertically in the center
    backgroundColor: ColorPalette.light_bg,
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    borderWidth: 1,
  },
  workspaceInfo: {
    flexDirection: 'column', // Stack name and member count vertically
    alignItems: 'flex-start',
    maxWidth: '70%', // Adjust as needed
    marginLeft: 10, // Add some space between the icon and the text
  },
  workspaceIcon: {
    marginRight: 0, // Remove margin from the icon
  },
  workspaceName: {
    fontSize: 16,
    fontFamily: 'CG-Semibold',
    color: ColorPalette.text_dark,
    textAlign: 'left',
    flexWrap: 'wrap',
    marginBottom: 5, // Add some space between the name and member count
  },
  buttonContainer: {
  },
  memberCountContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  memberCount: {
    fontSize: 14,
    fontFamily: 'CG-Regular',
    color: ColorPalette.green,
    textAlign: 'left',
  },
  memberPills: {
    flexDirection: 'row',
    alignItems: 'center',
    width:'auto '
  },
  memberIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ColorPalette.white,
    borderWidth: 1,
    borderColor: ColorPalette.grey_light,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  noWorkspacesText: {
    fontSize: 20,
    fontFamily: 'CG-Semibold',
    color: ColorPalette.grey_text,
    marginTop: 10,
    textAlign: 'center',
  },
  noWorkspacesSubText: {
    fontSize: 14,
    fontFamily: 'CG-Regular',
    color: ColorPalette.grey_text,
    marginTop: 5,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'CG-Medium',
    color: ColorPalette.primary,
    marginTop: 10,
    textAlign: 'center',
  },
  centered: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: { // Add description style
    fontSize: 14,
    fontFamily: 'CG-Regular',
    color: ColorPalette.grey_text,
    textAlign: 'center',
    marginBottom: 20,
  },
  helpText: {
    fontSize: 14,
    marginTop: 20,
    color: ColorPalette.text_black,
    fontFamily: 'CG-Regular',
    textAlign: 'center',
    paddingBottom: 20,
  },
});

export default WorkspaceSelectionScreen;
