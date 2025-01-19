

import { getServiceError } from '../utils';
import { ServiceError } from '../interfaces/errors';

export const generateGridService = (bias?: string): { html: string, raw: string[] } | ServiceError => {
  try {
    const GRID_LAYOUT_SIZE = 10;
    const GRID_LAYOUT_TOTAL = GRID_LAYOUT_SIZE * GRID_LAYOUT_SIZE;

    // Generate a random letter, avoiding bias if provided
    const getRandomLetter = (): string => {
      let randomCode = Math.floor(Math.random() * 26) + 97; // 'a' to 'z'
      const biasCode = bias?.charCodeAt(0);

      while (bias && randomCode === biasCode) {
        randomCode = Math.floor(Math.random() * 26) + 97;
      }
      return String.fromCharCode(randomCode);
    };

    // Generate the initial grid of letters
    const letters = Array.from({ length: GRID_LAYOUT_TOTAL }, getRandomLetter);

    // Randomly replace letters with the bias letter (up to 20 times)
    if (bias) {
      const biasPositions = new Set<number>();
      const maxBiasCount = 20;

      while (biasPositions.size < maxBiasCount) {
        const position = Math.floor(Math.random() * GRID_LAYOUT_TOTAL);
        if (letters[position] !== bias) {
          biasPositions.add(position);
          letters[position] = bias;
        }
      }
    }

    // Generate the HTML grid
    const rows = [];
    for (let row = 0; row < GRID_LAYOUT_SIZE; row++) {
      const cells = [];
      for (let col = 0; col < GRID_LAYOUT_SIZE; col++) {
        const index = row * GRID_LAYOUT_SIZE + col;
        const isBias = letters[index] === bias;

        cells.push(`
          <span 
            style="
              padding: 30px 55px;
              display: inline-flex;
              justify-content: center;
              align-items: center;
              height: 20px;
              width: 20px;
              border-left: 1px solid #000;
              ${col === GRID_LAYOUT_SIZE - 1 ? 'border-right: 1px solid #000;' : ''}
              ${isBias ? 'background-color: blue;' : ''}
            "
            ${isBias ? 'data-bg="highlight"' : ''}
          >
            ${letters[index]}
          </span>
        `);
      }

      rows.push(`
        <div style="display: inline-flex; border-bottom: 1px solid #000; ${row === 0 ? 'border-top: 1px solid #000;' : ''}">
          ${cells.join('')}
        </div>
      `);
    }

    return {
      html: `${rows.join('')}`,
      raw: letters
    };
  } catch (error: any) {
    return getServiceError(error);
  }
};
