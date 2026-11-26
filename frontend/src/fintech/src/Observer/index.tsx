/**
 * 监控当前内容是否在视口内
 * */

import { useEffect, useRef, useState } from 'react';

const Observer = (props: any) => {
  const ref = useRef();
  const observerRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setOpen(true);
              observer.disconnect();
            }
          });
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0.1,
        },
      );

      observer.observe(ref.current);
      observerRef.current = observer;

      return () => {
        if (observerRef.current) {
          observerRef.current?.disconnect();
        }
      };
    } catch (e) {
      setOpen(true);
    }
  }, []);

  return <div ref={ref}>{open ? props.children : null}</div>;
};

export default Observer;
