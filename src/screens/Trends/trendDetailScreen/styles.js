import { StyleSheet } from 'react-native';
import ColorPalette from '../../../constants/ColorPalette';

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: ColorPalette.bg },
    tabs: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
    tab: { paddingVertical: 8 },
    activeTab: { borderBottomWidth: 2, borderBottomColor: '#fff' },
    tabText: { color: '#aaa', fontSize: 16, fontWeight: 'bold' },
    activeTabText: { color: '#fff' },
    postContainer: { paddingHorizontal: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
    header: { flexDirection: 'row', alignItems: 'center' },
    userInfo: { flex: 1, marginLeft: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    name: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    username: { color: '#888', fontSize: 13 },
    content: { color: '#fff', fontSize: 14, marginVertical: 8 },
    singleImage: { width: '100%', height: 180, borderRadius: 12, marginBottom: 8 },
    actions: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    iconSpacing: { marginLeft: 12 },
    timestamp: { color: '#888', fontSize: 12 },
    gridImage: { width: '32.5%', height: 120, margin: '0.5%', borderRadius: 8 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    commentsContainer: { backgroundColor: '#222', padding: 20, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
    commentText: { color: '#fff', fontSize: 16, textAlign: 'center' },
});
