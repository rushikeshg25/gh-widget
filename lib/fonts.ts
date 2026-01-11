
const fontCache: Record<string, ArrayBuffer> = {};

export async function loadGoogleFont(font: string, weight: number = 400, text: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/") {
  const cacheKey = `${font}-${weight}`;
  if (fontCache[cacheKey]) {
    return fontCache[cacheKey];
  }

  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`;
  
  // Cache the CSS fetch
  const css = await (await fetch(url, { next: { revalidate: 86400 } })).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

  if (resource) {
    // Cache the font file fetch
    const response = await fetch(resource[1], { next: { revalidate: 86400 } });
    if (response.status == 200) {
      const buffer = await response.arrayBuffer();
      fontCache[cacheKey] = buffer;
      return buffer;
    }
  }

  throw new Error("Failed to load font data");
}
