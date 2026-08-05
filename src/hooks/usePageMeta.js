import { useEffect } from 'react';

/* Sets document title + meta description for the life of the page, restoring
   the previous values on unmount so SPA navigation doesn't leak state. */
export default function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    let created = false;
    let prevDescription = null;
    if (description) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
        created = true;
      } else {
        prevDescription = meta.getAttribute('content');
      }
      meta.setAttribute('content', description);
    }

    return () => {
      document.title = prevTitle;
      if (meta) {
        if (created) meta.remove();
        else if (prevDescription != null) meta.setAttribute('content', prevDescription);
      }
    };
  }, [title, description]);
}
