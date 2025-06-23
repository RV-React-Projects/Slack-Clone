import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { RetryConfig, RetryDelay, RetryManager } from './RetryManager';

// Interface extending AxiosRequestConfig to include optional retry configuration
interface NetworkManagerConfig extends AxiosRequestConfig {
  retryConfig?: RetryConfig; // Optional retry configuration
}

// Custom error class for network-related errors
class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError'; // Set the name of the error for easier identification
  }
}

// Class responsible for managing network requests with retry capabilities
export class NetworkManager {
  private axiosInstance: AxiosInstance; // Axios instance for making requests
  private retryManager: RetryManager; // Instance of RetryManager to handle retries

  // Constructor to initialize NetworkManager with base URL, interceptors, and retry configuration
  constructor(baseURL: string, interceptors?: any, retryConfig?: RetryConfig) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 20000, // Optional timeout for requests (10 seconds)
    });

    // Initialize RetryManager with provided or default retry config
    this.retryManager = new RetryManager(
      retryConfig || {
        retries: 0, // Default maximum number of retries
        retryDelay: RetryDelay.Quick, // Default initial retry delay
      },
    );

    // Apply interceptors if provided to customize request/response handling
    if (interceptors) {
      this.applyInterceptors(interceptors);
    }
  }

  /**
   * Check if network is available.
   * Throws a NetworkError if no network is detected.
   */
  // private async checkNetwork(): Promise<void> {
  //   const networkState = await NetInfo.fetch();
  //   if (!networkState.isConnected && !networkState.isInternetReachable) {
  //     throw new NetworkError('No network connection available.');
  //   }
  // }

  /**
   * Generic function to handle network requests with a retry mechanism.
   * Supports GET, POST, PUT, DELETE, and form-data based requests.
   */
  private async request<T>(
    config: NetworkManagerConfig,
  ): Promise<AxiosResponse<T>> {
    const maxRetries =
      config.retryConfig?.retries ?? this.retryManager.getConfig().retries;
    const retryDelay =
      config.retryConfig?.retryDelay ??
      this.retryManager.getConfig().retryDelay;

    for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
      try {
        // Check network availability right before the request
        // await this.checkNetwork(); // Check network availability

        // Make the network request using Axios instance
        const response = await this.axiosInstance.request<T>(config);
        return response; // Return the successful response
      } catch (error) {
        console.log({ error });

        const axiosError = error as AxiosError;

        // Check if the error is a network error (not just HTTP errors)
        if (
          error instanceof NetworkError ||
          this.retryManager.isRetryableError(axiosError)
        ) {
          if (retryCount < maxRetries) {
            await this.delay(retryDelay);
          } else {
            throw axiosError; // Re-throw error if retries exceeded
          }
        } else if (this.isAuthError(axiosError) && retryCount < maxRetries) {
          await this.refreshToken(); // Refresh token if 401 error
        } else {
          throw axiosError; // Re-throw error if non-retryable
        }
      }
    }

    throw new Error('Failed after retry attempts');
  }

  /**
   * Check if error is authentication related (401 Unauthorized).
   */
  private isAuthError(error: AxiosError): boolean {
    return error.response?.status === 401; // Return true if the error is a 401 Unauthorized
  }

  /**
   * Method to refresh access token.
   * This would involve hitting a refresh token endpoint.
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = await this.getStoredRefreshToken(); // Get stored refresh token
    const response = await this.axiosInstance.post('/auth/refresh-token', {
      refreshToken, // Send refresh token to the server
    });
    const newToken = response.data.token; // Get new token from response
    this.setToken(newToken); // Store new token globally for future requests
  }

  /**
   * Placeholder for retrieving refresh token (e.g. from AsyncStorage or Secure Store).
   */
  private async getStoredRefreshToken(): Promise<string> {
    // Logic to retrieve refresh token
    return 'mock_refresh_token'; // Replace this with actual retrieval logic
  }

  /**
   * Store new token in global state or persistent storage.
   */
  private setToken(newToken: string): void {
    // Set new token for future requests in Axios instance
    this.axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
  }

  /**
   * Delay helper to wait for retry delays.
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms)); // Wait for the specified milliseconds
  }

  /**
   * Apply request and response interceptors if provided.
   */
  private applyInterceptors(interceptors: any): void {
    // Request interceptor
    if (interceptors.request) {
      this.axiosInstance.interceptors.request.use(
        interceptors.request,
        interceptors.error, // Handle request error
      );
    }

    // Response interceptor
    if (interceptors.response) {
      this.axiosInstance.interceptors.response.use(
        interceptors.response,
        interceptors.error, // Handle response error
      );
    }
  }

  /**
   * Method to perform a GET request.
   * @param url The endpoint to send the request to
   * @param config Optional Axios request configuration
   * @returns The response data from the GET request
   */
  public async get<T>(
    url: string,
    config?: NetworkManagerConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url }); // Call the request method
  }

  /**
   * Method to perform a POST request with form-data support.
   * @param url The endpoint to send the request to
   * @param data The data to send in the request body
   * @param config Optional Axios request configuration
   * @returns The response data from the POST request
   */
  public async post<T>(
    url: string,
    data: any,
    config?: NetworkManagerConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data }); // Call the request method
  }

  /**
   * Method to perform a PUT request with form-data support.
   * @param url The endpoint to send the request to
   * @param data The data to update in the request body
   * @param config Optional Axios request configuration
   * @returns The response data from the PUT request
   */
  public async put<T>(
    url: string,
    data: any,
    config?: NetworkManagerConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data }); // Call the request method
  }

  /**
   * Method to perform a PATCH request.
   * @param url The endpoint to send the request to
   * @param data The data to send in the request body
   * @param config Optional Axios request configuration
   * @returns The response data from the PATCH request
   */
  public async patch<T>(
    url: string,
    data: any,
    config?: NetworkManagerConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data }); // Call the request method
  }

  /**
   * Method to perform a DELETE request.
   * @param url The endpoint to send the request to
   * @param config Optional Axios request configuration
   * @returns The response data from the DELETE request
   */
  public async delete<T>(
    url: string,
    config?: NetworkManagerConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url }); // Call the request method
  }

  /**
   * Placeholder for future caching mechanism.
   * Can be implemented later for better performance.
   */
  // public enableCaching(): void {
  //   // Logic to enable caching in the future
  //   console.log('Caching mechanism not implemented yet.');
  // }
}
