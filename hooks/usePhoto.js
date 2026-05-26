import { useState, useEffect } from "react";
import { enc, enc2, UNSPLASH_KEY } from "../lib/constants";

export const photoCache = {};

export function usePhoto(query) {
  const cacheKey = (query || "travel").substring(0, 60);
  const [src, setSrc] = useState(photoCache[cacheKey] || null);

  useEffect(() => {
    if (!query) return;
    if (photoCache[cacheKey]) { setSrc(photoCache[cacheKey]); return; }

    if (UNSPLASH_KEY) {
      fetch(`https://api.unsplash.com/photos/random?query=${enc(query)}&orientation=landscape&client_id=${UNSPLASH_KEY}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => {
          const url = d?.urls?.regular || d?.urls?.small;
          if (url) { photoCache[cacheKey] = url; setSrc(url); }
          else throw new Error();
        })
        .catch(() => {
          const fb = `https://source.unsplash.com/800x400/?${enc(query)}`;
          photoCache[cacheKey] = fb;
          setSrc(fb);
        });
    } else {
      setSrc(`https://source.unsplash.com/800x400/?${enc(query)}`);
    }
  }, [cacheKey]);

  return src || `https://picsum.photos/seed/${enc2(query || "travel")}/800/400`;
}
