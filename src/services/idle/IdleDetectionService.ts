
/**
 * Service for tracking user idle time and triggering actions
 */
export class IdleDetectionService {
  private timeout: number;
  private timer: NodeJS.Timeout | null = null;
  private onIdle: () => void;
  private events: string[] = [
    'mousedown', 'mousemove', 'keypress', 
    'scroll', 'touchstart', 'click', 'keydown'
  ];
  
  /**
   * Create a new idle detection service
   * 
   * @param timeoutInMinutes - The time in minutes before a user is considered idle
   * @param onIdle - Callback function to execute when user becomes idle
   */
  constructor(timeoutInMinutes: number, onIdle: () => void) {
    this.timeout = timeoutInMinutes * 60 * 1000; // Convert to milliseconds
    this.onIdle = onIdle;
  }
  
  /**
   * Start monitoring for user inactivity
   */
  start(): void {
    // Set initial timer
    this.resetTimer();
    
    // Register event listeners
    this.events.forEach(event => {
      document.addEventListener(event, this.resetTimer.bind(this));
    });
    
    console.log(`Idle detection started with ${this.timeout/60000} minute timeout`);
  }
  
  /**
   * Stop monitoring for user inactivity
   */
  stop(): void {
    // Clear the timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    // Remove event listeners
    this.events.forEach(event => {
      document.removeEventListener(event, this.resetTimer.bind(this));
    });
    
    console.log('Idle detection stopped');
  }
  
  /**
   * Reset the idle timer
   */
  private resetTimer(): void {
    // Clear existing timer
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    // Set new timer
    this.timer = setTimeout(() => {
      console.log('User is idle, executing callback');
      this.onIdle();
    }, this.timeout);
  }
}

/**
 * Create and configure a new idle detection service
 * 
 * @param timeoutInMinutes - The time in minutes before a user is considered idle
 * @param onIdle - Callback function to execute when user becomes idle
 */
export const createIdleDetection = (
  timeoutInMinutes: number = 30,
  onIdle: () => void
): IdleDetectionService => {
  return new IdleDetectionService(timeoutInMinutes, onIdle);
};
