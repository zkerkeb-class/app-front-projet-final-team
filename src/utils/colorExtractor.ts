/**
 * Extracts dominant colors from an image URL
 * @param imageUrl - URL of the image to analyze
 * @returns Promise resolving to array of hex color codes
 */
export const extractColors = async (imageUrl: string): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(['#000000', '#222222', '#444444']); // Fallback colors
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      ).data;
      const colors = new Map<string, number>();

      // Analyser chaque pixel pour trouver les couleurs dominantes
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colors.set(hex, (colors.get(hex) || 0) + 1);
      }

      // Trier et retourner les 3 couleurs les plus présentes
      const sortedColors = Array.from(colors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([color]) => color);

      resolve(sortedColors);
    };

    img.src = imageUrl;
  });
};
