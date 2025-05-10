import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons/';
import ColorPalette from '../../constants/ColorPalette';
import RoundedContainer from '../../components/RoundedContainer';
import CustomButton from '../../components/CustomButton';
import { AntDesign } from "@expo/vector-icons";
import axios from 'axios';
import { useSelector } from 'react-redux';
import CustomAlert from '../../components/CustomAlert';
import { BASE_URL, ORGANIZATION_ENDPOINTS } from '../../constants/ApiConstants';
import api from '../../services/apiService';

const WorkspaceSelectionScreen = ({ navigation, onWorkspaceSelected }) => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  
  // Get auth token from Redux store
  const { tokens } = useSelector((state) => state.auth);

  const showAlert = (type, message, duration = 3000) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
    
    if (type !== 'loading') {
      setTimeout(() => {
        setAlertVisible(false);
      }, duration);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await api.get(ORGANIZATION_ENDPOINTS.GET_ALL);
      setOrganizations(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('Failed to fetch workspaces');
      showAlert('error', 'Failed to fetch workspaces. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWorkspace = async (organization) => {
    showAlert('loading', `Joining workspace: ${organization.name}`);
    try {
      // No need to call the join endpoint - removed API call
      
      showAlert('success', `Successfully joined ${organization.name}`);
      
      // Save the selected workspace and store it in AsyncStorage
      if (onWorkspaceSelected) {
        await onWorkspaceSelected(organization.id);
      }
      
      // Navigate to HomeScreen with correct screen name
      setTimeout(() => {
        navigation.navigate('Main', { 
          screen: 'Home',
          params: {
            screen: 'HomeScreen',
            params: {
              organizationId: organization.id,
              organizationName: organization.name
            }
          }
        });
      }, 1000);
    } catch (error) {
      console.error('Error selecting workspace:', error);
      showAlert('error', 'Failed to select workspace. Please try again.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.workspaceItem}
      onPress={() => handleJoinWorkspace(item)}
    >
      <View style={styles.workspaceContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.workspaceInitial}>
            {item.name.charAt(0)}
          </Text>
        </View>

        <View style={styles.workspaceInfo}>
          <Text style={styles.workspaceName}>{item.name}</Text>
          <Text style={styles.workspaceDescription}>
            {item.description || 'No description'}
          </Text>
          <View style={styles.memberInfo}>
            <MaterialIcons name="people" size={14} color={ColorPalette.grey_text} />
            <Text style={styles.memberCount}>
              {item.users ? `${item.users.length} members` : '0 members'}
            </Text>
          </View>
        </View>
        
        <View style={styles.joinButtonContainer}>
          <CustomButton
            title="Join"
            onPress={() => handleJoinWorkspace(item)}
            height={36}
            width={70}
            fontSize={14}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <RoundedContainer>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <AntDesign name="arrowleft" size={22} color={ColorPalette.green} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Workspaces</Text>
          </View>
          <TouchableOpacity onPress={() => showAlert('info', 'Select a workspace to join and start collaborating with your team.')} style={styles.helpButton}>
            <Text style={styles.helpText}>Help</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={ColorPalette.green} />
            <Text style={styles.loadingText}>Loading workspaces...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <MaterialIcons name="error-outline" size={60} color={ColorPalette.error} />
            <Text style={styles.errorText}>{error}</Text>
            <CustomButton
              title="Retry"
              onPress={fetchOrganizations}
              height={40}
              width={120}
              fontSize={16}
              style={styles.retryButton}
            />
          </View>
        ) : organizations.length > 0 ? (
          <View style={styles.workspaceListContainer}>
            <Text style={styles.listHeader}>Available Workspaces</Text>
            <Text style={styles.listDescription}>Select a workspace to continue</Text>
            <View style={styles.divider} />
            <FlatList
              data={organizations}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            />
          </View>
        ) : (
          <View style={styles.centered}>
            <MaterialIcons name="workspaces-outline" size={60} color={ColorPalette.grey_text} />
            <Text style={styles.noWorkspacesText}>No workspaces available</Text>
            <Text style={styles.noWorkspacesSubText}>You're not a member of any workspace yet.</Text>
            <CustomButton
              title="Create Workspace"
              onPress={() => navigation.navigate('CreateWorkspaceScreen')}
              height={40}
              width={180}
              fontSize={16}
              style={styles.createButton}
            />
          </View>
        )}
      </RoundedContainer>
      
      {/* Custom Alert */}
      <CustomAlert 
        visible={alertVisible}
        type={alertType}
        message={alertMessage}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: ColorPalette.text_black,
    fontFamily: 'CG-Semibold',
  },
  helpButton: {
    padding: 5,
  },
  helpText: {
    fontSize: 14,
    color: ColorPalette.green,
    fontFamily: 'CG-Regular',
  },
  workspaceListContainer: {
    paddingVertical: 15,
  },
  listHeader: {
    fontSize: 18,
    fontFamily: 'CG-Semibold',
    color: ColorPalette.text_black,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  listDescription: {
    fontSize: 14,
    fontFamily: 'CG-Regular',
    color: ColorPalette.grey_text,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  divider: {
    height: 1,
    backgroundColor: ColorPalette.grey_light,
    marginVertical: 10,
  },
  list: {
    width: '100%',
    paddingHorizontal: 10,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: ColorPalette.grey_light,
    opacity: 0.5,
  },
  workspaceItem: {
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  workspaceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: ColorPalette.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workspaceInitial: {
    fontSize: 20,
    color: ColorPalette.white,
    fontFamily: 'CG-Semibold',
  },
  workspaceInfo: {
    flex: 1,
  },
  workspaceName: {
    fontSize: 16,
    fontFamily: 'CG-Semibold',
    color: ColorPalette.text_black,
    marginBottom: 2,
  },
  workspaceDescription: {
    fontSize: 14,
    fontFamily: 'CG-Regular',
    color: ColorPalette.grey_text,
    marginBottom: 5,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 13,
    fontFamily: 'CG-Regular',
    color: ColorPalette.grey_text,
    marginLeft: 5,
  },
  joinButtonContainer: {
    marginLeft: 10,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'CG-Medium',
    color: ColorPalette.grey_text,
    marginTop: 15,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'CG-Regular',
    color: ColorPalette.error,
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
  },
  noWorkspacesText: {
    fontSize: 18,
    fontFamily: 'CG-Semibold',
    color: ColorPalette.text_black,
    marginTop: 15,
    textAlign: 'center',
  },
  noWorkspacesSubText: {
    fontSize: 14,
    fontFamily: 'CG-Regular',
    color: ColorPalette.grey_text,
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
  createButton: {
    marginTop: 10,
  },
});

export default WorkspaceSelectionScreen;
