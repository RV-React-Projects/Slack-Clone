import { AxiosError } from 'axios';

// Enum to define the strategy for retry delay
export enum RetryStrategy {
  Fixed, // Fixed retry delay (constant between attempts)
  Exponential, // Exponential backoff (delay increases exponentially after each attempt)
}

// Interface defining the configuration for retry behavior
export interface RetryConfig {
  retries: number; // Maximum number of retry attempts
  retryDelay: RetryDelay; // Initial delay between retries, using the RetryDelay enum
  strategy?: RetryStrategy; // Optional: Strategy to apply for calculating retry delay (defaults to Fixed)
  onRetry?: (attempt: number, delay: number) => void; // Optional callback function to provide feedback after each retry attempt
}

// Enum defining different retry delay durations (in milliseconds)
export enum RetryDelay {
  Quick = 500, // Quick retry: 500 milliseconds delay
  Moderate = 1000, // Moderate retry: 1 second delay
  Slow = 2000, // Slow retry: 2 seconds delay
  VerySlow = 3000, // Very slow retry: 3 seconds delay
}

// Class responsible for managing retries with delay and retry strategies
export class RetryManager {
  private retries: number; // Maximum number of allowed retries
  private retryDelay: RetryDelay; // Current delay between retries
  private strategy: RetryStrategy; // Strategy for calculating delay (Fixed or Exponential)
  private onRetry?: (attempt: number, delay: number) => void; // Optional callback function for retry feedback

  // Constructor initializes the RetryManager with the provided configuration
  constructor(config: RetryConfig) {
    this.retries = config.retries; // Set the maximum number of retries
    this.retryDelay = config.retryDelay; // Set the initial delay between retries
    this.strategy = config.strategy || RetryStrategy.Fixed; // Set the retry strategy (default to Fixed)
    this.onRetry = config.onRetry; // Set the optional retry feedback callback
  }

  /**
   * Executes the provided task (usually a function returning a promise),
   * with retries if it fails.
   * @param task The function to be executed with retry logic
   * @returns The result of the task if successful, or throws an error after max retries
   */
  async execute<T>(task: () => Promise<T>): Promise<T> {
    let attempt = 0; // Counter to track the number of attempts
    let delay = this.retryDelay; // Start with the initial retry delay

    // Loop to attempt the task up to the configured number of retries
    while (attempt < this.retries) {
      // Changed to '<' to allow the last attempt
      try {
        // Try executing the task (e.g., an API call)
        return await task();
      } catch (error) {
        // If an error occurs, increment the attempt count
        attempt++;

        // If the maximum retries have been exceeded, throw an error
        if (attempt >= this.retries) {
          // Changed to '>=' for better clarity
          throw new Error('Max retry attempts reached');
        }

        // Calculate the next delay based on the selected retry strategy
        delay = this.calculateDelay(attempt, delay);

        // If a retry feedback callback is provided, call it
        if (this.onRetry) {
          this.onRetry(attempt, delay);
        }

        // Wait for the calculated delay before retrying
        await this.delay(delay);
      }
    }

    // If all retries fail, throw a final error (this line is redundant now)
    throw new Error('Failed after all retry attempts');
  }

  /**
   * Calculates the next delay based on the retry strategy.
   * @param attempt The current retry attempt number
   * @param currentDelay The current delay duration
   * @returns The next delay duration
   */
  private calculateDelay(
    _attempt: number,
    currentDelay: RetryDelay,
  ): RetryDelay {
    // If the Exponential strategy is selected, double the delay after each retry
    if (this.strategy === RetryStrategy.Exponential) {
      const newDelay = currentDelay * 2;
      // Ensure the delay doesn't exceed the maximum defined value in RetryDelay
      return Math.min(newDelay, RetryDelay.VerySlow) as RetryDelay; // Ensure it doesn't exceed the defined limit
    }
    // If Fixed strategy, keep the delay constant
    return currentDelay;
  }

  /**
   * Pauses execution for the specified duration.
   * @param ms The delay duration in milliseconds
   * @returns A promise that resolves after the delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retrieves the current configuration of the RetryManager.
   * @returns An object containing the current retry configuration
   */
  public getConfig(): RetryConfig {
    return {
      retries: this.retries,
      retryDelay: this.retryDelay,
      strategy: this.strategy,
      onRetry: this.onRetry,
    };
  }
  /**
   * Simple helper method to check if an error is retryable.
   */
  isRetryableError(error: AxiosError): boolean {
    // Check if the error is an Axios error and evaluate its retry-ability
    return (
      (error.isAxiosError &&
        (!error.response ||
          (error.response.status >= 500 && error.response.status < 600))) || // Server errors (5xx)
      error.code === 'ECONNABORTED' // Connection aborted (e.g., timeout)
    );
  }
}
