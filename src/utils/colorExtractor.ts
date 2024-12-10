/**
 * Extracts the two most dominant colors from an image URL
 * @param imageUrl - URL of the image to analyze
 * @returns Promise resolving to array of 2 hex color codes
 */
export const extractColors = async (imageUrl: string): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(['#b62c2c', '#5333a9', '#2c7bb6']); // Fallback colors
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
        const a = imageData[i + 3];

        // Ignorer les pixels transparents
        if (a < 128) continue;

        // Détecter les pixels noirs (seuil ajustable)
        if (r < 30 && g < 30 && b < 30) {
          colors.set('#000000', (colors.get('#000000') || 0) + 1);
          continue;
        }

        // Classifier les couleurs en groupes principaux
        const isRed = r > 150 && g < 100 && b < 100;
        const isYellow = r > 150 && g > 150 && b < 100;
        const isBlack = r < 50 && g < 50 && b < 50;

        let colorKey;
        if (isRed) {
          colorKey = '#FF0000';
        } else if (isYellow) {
          colorKey = '#FFFF00';
        } else if (isBlack) {
          colorKey = '#000000';
        } else {
          // Quantification plus grossière pour les autres couleurs
          const quantizedR = Math.round(r / 64) * 64;
          const quantizedG = Math.round(g / 64) * 64;
          const quantizedB = Math.round(b / 64) * 64;
          colorKey = `#${((1 << 24) + (quantizedR << 16) + (quantizedG << 8) + quantizedB).toString(16).slice(1)}`;
        }

        colors.set(colorKey, (colors.get(colorKey) || 0) + 1);
      }

      // Trier et retourner les 3 couleurs les plus présentes
      const sortedColors = Array.from(colors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([color]) => color);

      console.log('Extracted colors:', sortedColors);

      resolve(sortedColors);
    };

    img.src = imageUrl;
  });
};
