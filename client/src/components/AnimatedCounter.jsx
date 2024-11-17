import { useEffect, useRef, useState } from "react";

const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const endValue = parseInt(value.replace(/,/g, '').replace(/\+/g, ''));
    const stepTime = Math.abs(Math.floor(duration / endValue));
    let startTime;

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const increment = Math.min(endValue, Math.floor((progress / duration) * endValue));

      if (countRef.current !== increment) {
        countRef.current = increment;
        setCount(increment);
      }

      if (progress < duration) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, duration, isVisible]);

  return (
    <span ref={elementRef}>
      {count.toLocaleString()}+
    </span>
  );
};

export default AnimatedCounter;