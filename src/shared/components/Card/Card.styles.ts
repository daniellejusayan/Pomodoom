import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  paddingNone: { padding: 0 },
  paddingSmall: { padding: 8 },
  paddingMedium: { padding: 12 },
  paddingLarge: { padding: 16 },
  header: { paddingBottom: 8 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, color: '#6B7280' },
  body: {},
  footer: { paddingTop: 8 },
});
