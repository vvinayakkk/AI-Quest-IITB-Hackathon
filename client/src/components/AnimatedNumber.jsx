import { useEffect, useState } from 'react';

const AnimatedNumber = ({ end, minDuration = 1000, maxDuration = 3000 }) => {
  const [number, setNumber] = useState(() => {
    const start = Math.max(0, Math.floor(Math.random() * (end - 100)));
    return start;
  });

  const duration = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;

  useEffect(() => {
    let start = number;
    const range = end - start;
    const startTime = Date.now();

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const newNumber = Math.round(start + range * easedProgress);

      setNumber(newNumber);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animate);
  }, [end, duration, number]);

  return <span>{number}</span>;
}

export default AnimatedNumber;