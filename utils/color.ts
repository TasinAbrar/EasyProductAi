
export const extractColorsFromLogo = (imgSrc: string): Promise<string[]> => {
  return new Promise((resolve) => {
    const fallback = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
    
    // Set a hard timeout so the UI never hangs
    const timeout = setTimeout(() => {
      console.warn("Color extraction timed out, using fallbacks");
      resolve(fallback);
    }, 2000);

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgSrc;
    
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          clearTimeout(timeout);
          return resolve(fallback);
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colors: Record<string, number> = {};

        // Faster sampling
        const step = Math.max(4, Math.floor(data.length / 4000));
        for (let i = 0; i < data.length; i += step) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 200) continue; // High opacity only
          
          // Simple brightness check to avoid pure blacks/whites as primary brand colors
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness < 30 || brightness > 240) continue;

          const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
          colors[hex] = (colors[hex] || 0) + 1;
        }

        const sortedColors = Object.entries(colors)
          .sort((a, b) => b[1] - a[1])
          .map(([color]) => color);

        clearTimeout(timeout);
        const result = sortedColors.length > 0 ? [...sortedColors, ...fallback].slice(0, 4) : fallback;
        resolve(result);
      } catch (e) {
        clearTimeout(timeout);
        resolve(fallback);
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(fallback);
    };
  });
};

export const getDarkenedColor = (hex: string, percent: number) => {
  try {
    const num = parseInt(hex.replace("#",""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
  } catch (e) {
    return "#000000";
  }
};
