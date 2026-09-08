import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#0f172a',
  card: '#1e293b',
  cardBorder: '#334155',
  text: '#f8fafc',
  muted: '#94a3b8',
  accent: '#38bdf8',
  accentDark: '#0284c7',
  success: '#4ade80',
  warning: '#fbbf24',
  danger: '#f87171',
};

export const sharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 16,
  },
  rowValue: {
    color: colors.muted,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    padding: 14,
    color: colors.text,
    fontSize: 16,
    marginBottom: 12,
  },
  empty: {
    color: colors.muted,
    fontSize: 15,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
  },
});
