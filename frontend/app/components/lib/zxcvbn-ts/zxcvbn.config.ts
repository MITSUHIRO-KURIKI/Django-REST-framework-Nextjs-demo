import { zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'

// zxcvbnOptions
const options = {
  translations: zxcvbnEnPackage.translations,
  graphs:       zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
};
export function setupZxcvbnOptions() {
  zxcvbnOptions.setOptions(options);
};

// getZxcvbnStrengthLabel
export function getZxcvbnStrengthLabel(score: number) {
  switch (score) {
    case 0: return '弱';
    case 1: return '弱';
    case 2: return '中';
    case 3: return '強';
    case 4: return '強';
    default: return '';
  };
};