import React from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import ColorPalette from '../../constants/ColorPalette';

export default function PeopleList({ data }) {
  const renderPerson = ({ item }) => (
    <View style={styles.personContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.username}>{item.username}</Text>
      </View>
    </View>
  );

  return <FlatList data={data} renderItem={renderPerson} keyExtractor={item => item.id} />;
}

const styles = StyleSheet.create({
  personContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 2, borderBottomColor: '#333',backgroundColor:ColorPalette.bg_post,paddingVertical:15 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userInfo: { marginLeft: 12 },
  name: { color: '#fff', fontSize: 14, fontFamily: 'CG-Bold' },
  username: { color: '#888', fontSize: 13 },
});
