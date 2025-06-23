'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const useScrollSpy = (sectionIds: string[]) => {
  const [activeId, setActiveId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveId(id);
            router.replace(`#${id}`, undefined); // just updates URL fragment, doesn't reload
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }, // trigger when the section is roughly centered
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds, router]);

  return activeId;
};
