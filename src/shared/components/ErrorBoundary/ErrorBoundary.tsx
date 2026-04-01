import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  info?: string | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught error', error, info);
    this.setState({ info: info.componentStack });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined, info: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong.</Text>
          <Text style={styles.message}>The app encountered an unexpected error.</Text>
          <Text style={styles.details}>{this.state.error?.message || 'Unknown error'}</Text>

          <TouchableOpacity onPress={this.handleReload} style={styles.button}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  details: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
