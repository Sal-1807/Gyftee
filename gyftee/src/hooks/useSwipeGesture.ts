import { useRef } from 'react';
import { useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { SWIPE_THRESHOLD_PX, SWIPE_VELOCITY_THRESHOLD } from '@/lib/constants';
import type { SwipeDirection } from '@/types/gift.types';

interface UseSwipeGestureOptions {
  onSwipe: (direction: SwipeDirection) => void;
}

export function useSwipeGesture({ onSwipe }: UseSwipeGestureOptions) {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD_PX], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD_PX, 0], [1, 0]);
  const cardOpacity = useTransform(
    x,
    [-300, -SWIPE_THRESHOLD_PX, 0, SWIPE_THRESHOLD_PX, 300],
    [0.5, 0.8, 1, 0.8, 0.5]
  );

  const isDragging = useRef(false);

  const flyOut = async (direction: SwipeDirection) => {
    const xTarget = direction === 'right' ? 600 : direction === 'left' ? -600 : 0;
    const yTarget = direction === 'up' ? -600 : 0;
    await controls.start({
      x: xTarget,
      y: yTarget,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    });
    onSwipe(direction);
    controls.set({ x: 0, y: 0, opacity: 1 });
    x.set(0);
    y.set(0);
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    isDragging.current = false;
    const { offset, velocity } = info;

    const isSwipeRight =
      offset.x > SWIPE_THRESHOLD_PX || velocity.x > SWIPE_VELOCITY_THRESHOLD;
    const isSwipeLeft =
      offset.x < -SWIPE_THRESHOLD_PX || velocity.x < -SWIPE_VELOCITY_THRESHOLD;

    if (isSwipeRight) {
      flyOut('right');
    } else if (isSwipeLeft) {
      flyOut('left');
    } else {
      controls.start({ x: 0, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  return {
    x,
    y,
    rotate,
    likeOpacity,
    nopeOpacity,
    cardOpacity,
    controls,
    flyOut,
    dragProps: {
      drag: true as const,
      dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
      dragElastic: 1,
      onDragStart: () => { isDragging.current = true; },
      onDragEnd: handleDragEnd,
    },
  };
}
