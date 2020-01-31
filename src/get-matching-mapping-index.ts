import {IVariantMaterialMapping} from './types';

export default function getMatchingMappingIndex(
  tags: string[],
  mappings: IVariantMaterialMapping[]
) {
  let matchingIndex: number = -1;

  for (let i = 0; i < mappings.length; i++) {
    const mapping = mappings[i];

    for (let j = 0; j < mapping.tags.length; j++) {
      const mappingTag = mapping.tags[j];

      if (tags.includes(mappingTag)) {
        matchingIndex = i;
        break;
      }
    }

    if (matchingIndex !== -1) {
      break;
    }
  }

  return matchingIndex;
}
