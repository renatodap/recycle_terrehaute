'use client';

import { useEffect, useRef, useState } from 'react';

export default function Stats() {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      value: 32,
      suffix: '%',
      label: 'Recycling Rate in Indiana',
      description: 'We can do better together',
    },
    {
      value: 75,
      suffix: '%',
      label: 'of Waste is Recyclable',
      description: 'Most items have a second life',
    },
    {
      value: 1000,
      suffix: '+',
      label: 'Items in Database',
      description: 'Comprehensive local coverage',
    },
    {
      value: 95,
      suffix: '%',
      label: 'Accuracy Rate',
      description: 'AI-powered identification',
    },
  ];

  return (
    <section ref={statsRef} className="py-16 bg-primary-600 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {isVisible && (
                  <CountUp end={stat.value} suffix={stat.suffix} duration={2000} delay={index * 200} />
                )}
              </div>
              <div className="text-lg font-semibold mb-1">{stat.label}</div>
              <div className="text-primary-100 text-sm">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUp({ end, suffix, duration, delay }: { end: number; suffix: string; duration: number; delay: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const increment = end / (duration / 10);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 10);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timeout);
  }, [end, duration, delay]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}