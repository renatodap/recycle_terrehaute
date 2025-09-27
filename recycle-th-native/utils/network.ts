import NetInfo from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

class NetworkManager {
  private listeners: Set<(state: NetworkState) => void> = new Set();
  private currentState: NetworkState = {
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  };

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Get initial state
    const state = await NetInfo.fetch();
    this.updateState(state);

    // Subscribe to network state changes
    NetInfo.addEventListener((state) => {
      this.updateState(state);
    });
  }

  private updateState(state: any) {
    const newState: NetworkState = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type || 'unknown',
    };

    if (
      newState.isConnected !== this.currentState.isConnected ||
      newState.isInternetReachable !== this.currentState.isInternetReachable
    ) {
      this.currentState = newState;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentState));
  }

  public subscribe(listener: (state: NetworkState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.currentState);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async checkConnection(): Promise<NetworkState> {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type || 'unknown',
    };
  }

  public isOnline(): boolean {
    return this.currentState.isConnected && this.currentState.isInternetReachable;
  }
}

// Lazy initialization to prevent crash on app start
let _networkManager: NetworkManager | null = null;

export const networkManager = {
  isOnline(): boolean {
    if (!_networkManager) {
      _networkManager = new NetworkManager();
    }
    return _networkManager.isOnline();
  },

  async checkConnection(): Promise<NetworkState> {
    if (!_networkManager) {
      _networkManager = new NetworkManager();
    }
    return _networkManager.checkConnection();
  },

  subscribe(listener: (state: NetworkState) => void): () => void {
    if (!_networkManager) {
      _networkManager = new NetworkManager();
    }
    return _networkManager.subscribe(listener);
  }
};

// Utility function for retry logic with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    shouldRetry?: (error: any) => boolean;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = (error) => {
      // Retry on network errors or 5xx server errors
      return (
        error.code === 'NETWORK_ERROR' ||
        error.code === 'TIMEOUT' ||
        (error.status >= 500 && error.status < 600)
      );
    },
    onRetry,
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Check network before attempting
      const networkState = await networkManager.checkConnection();
      if (!networkState.isConnected) {
        throw {
          code: 'NETWORK_ERROR',
          message: 'No network connection available',
        };
      }

      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase delay for next attempt
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError;
}

// Error types for better error handling
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  PERMISSION = 'PERMISSION',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  retry?: () => Promise<void>;
}

export function createAppError(
  type: ErrorType,
  message: string,
  details?: any,
  retry?: () => Promise<void>
): AppError {
  return { type, message, details, retry };
}

// Helper to get user-friendly error messages
export function getErrorMessage(error: any): string {
  // Network errors
  if (error.code === 'NETWORK_ERROR' || !networkManager.isOnline()) {
    return 'No internet connection. Please check your network settings and try again.';
  }

  // API errors
  if (error.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (error.status === 401) {
    return 'Authentication failed. Please sign in again.';
  }
  if (error.status === 403) {
    return 'You don\'t have permission to perform this action.';
  }
  if (error.status >= 500) {
    return 'Server error. Please try again later or contact support if the problem persists.';
  }

  // Supabase specific errors
  if (error.message?.includes('Invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (error.message?.includes('User already registered')) {
    return 'An account with this email already exists.';
  }

  // Permission errors
  if (error.message?.includes('Permission denied') || error.message?.includes('permission')) {
    return 'Permission denied. Please check your app settings.';
  }

  // Image analysis errors
  if (error.message?.includes('analyze')) {
    return 'Unable to analyze image. Please ensure the image is clear and try again.';
  }

  // Fallback messages
  if (error.message && typeof error.message === 'string') {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}