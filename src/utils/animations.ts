
// Animation utility functions
export const fadeIn = (delay: number = 0) => {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }
  };
};

export const slideUp = (delay: number = 0) => {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }
  };
};

export const slideDown = (delay: number = 0) => {
  return {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }
  };
};

export const slideInLeft = (delay: number = 0) => {
  return {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }
  };
};

export const slideInRight = (delay: number = 0) => {
  return {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }
  };
};

export const scale = (delay: number = 0) => {
  return {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }
  };
};

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

// Staggered children animation
export const staggerContainer = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
};
