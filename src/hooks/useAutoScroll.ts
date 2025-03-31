
import { useEffect, RefObject } from 'react';

/**
 * A hook that automatically scrolls to an element when dependencies change
 */
export const useAutoScroll = (
  elementRef: RefObject<HTMLElement>, 
  dependencies: any[] = [],
  options: ScrollIntoViewOptions = { behavior: 'smooth' }
) => {
  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView(options);
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
};
