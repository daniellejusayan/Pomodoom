import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  fullScreen: { flex: 1, borderRadius: 0 },
  alertContainer: { margin: 32, borderRadius: 12, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  description: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
