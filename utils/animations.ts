import { withTiming, withSpring, Easing } from 'react-native-reanimated';

export const fadeIn = {
  opacity: withTiming(1, {
    duration: 300,
    easing: Easing.ease,
  }),
};

export const fadeOut = {
  opacity: withTiming(0, {
    duration: 300,
    easing: Easing.ease,
  }),
};

export const scaleIn = {
  transform: [
    {
      scale: withSpring(1, {
        damping: 10,
        stiffness: 100,
      }),
    },
  ],
};

export const scaleOut = {
  transform: [
    {
      scale: withSpring(0.95, {
        damping: 10,
        stiffness: 100,
      }),
    },
  ],
}; 