import { useEffect } from 'react';

const SITE_NAME = 'Kivistone';
const SITE_ORIGIN = 'https://kivistone.vercel.app';

function setMetaTag(attr, key, content) {
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  const prevContent = tag ? tag.getAttribute('content') : null;
  let created = false;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
    created = true;
  }
  tag.setAttribute('content', content);
  return () => {
    if (created) tag.remove();
    else if (prevContent != null) tag.setAttribute('content', prevContent);
  };
}

function setLinkTag(rel, href) {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  const prevHref = tag ? tag.getAttribute('href') : null;
  let created = false;
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
    created = true;
  }
  tag.setAttribute('href', href);
  return () => {
    if (created) tag.remove();
    else if (prevHref != null) tag.setAttribute('href', prevHref);
  };
}

function setJsonLd(data) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
  return () => script.remove();
}

/* Sets document title, meta description, canonical link, and OG/Twitter tags
   for the life of the page, restoring the previous values on unmount so SPA
   navigation doesn't leak state between routes. `path` should be the
   site-relative path (e.g. "/products/dish-plates"); `image` should be an
   absolute or root-relative URL. `jsonLd` is an optional object (or array of
   objects) serialized into one or more <script type="application/ld+json">
   tags for the life of the page. */
export default function usePageMeta({ title, description, image, path, jsonLd, noIndex } = {}) {
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : undefined;

  useEffect(() => {
    const cleanups = [];
    const prevTitle = document.title;
    if (title) document.title = title;

    const url = path ? `${SITE_ORIGIN}${path}` : undefined;
    const absoluteImage = image
      ? (image.startsWith('http') ? image : `${SITE_ORIGIN}${image}`)
      : undefined;

    cleanups.push(setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow'));
    if (description) cleanups.push(setMetaTag('name', 'description', description));
    if (url) cleanups.push(setLinkTag('canonical', url));

    if (title) cleanups.push(setMetaTag('property', 'og:title', title));
    if (description) cleanups.push(setMetaTag('property', 'og:description', description));
    if (url) cleanups.push(setMetaTag('property', 'og:url', url));
    cleanups.push(setMetaTag('property', 'og:type', 'website'));
    cleanups.push(setMetaTag('property', 'og:site_name', SITE_NAME));
    if (absoluteImage) cleanups.push(setMetaTag('property', 'og:image', absoluteImage));

    cleanups.push(setMetaTag('name', 'twitter:card', 'summary_large_image'));
    if (title) cleanups.push(setMetaTag('name', 'twitter:title', title));
    if (description) cleanups.push(setMetaTag('name', 'twitter:description', description));
    if (absoluteImage) cleanups.push(setMetaTag('name', 'twitter:image', absoluteImage));

    if (jsonLd) {
      const entries = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      entries.forEach((entry) => cleanups.push(setJsonLd(entry)));
    }

    return () => {
      document.title = prevTitle;
      cleanups.forEach((restore) => restore());
    };
  }, [title, description, image, path, jsonLdKey, noIndex]);
}
