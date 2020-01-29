import {IMeshPrimitive} from 'babylonjs-gltf2interface';
import EXTENSION_NAME from './extension-name';
import {IVariantMaterialExtension} from './types';

export default function updatePrimitive(
  tags: string[],
  primitiveToUpdate: IMeshPrimitive,
  originalPrimitive: IMeshPrimitive
) {
  const extension = originalPrimitive.extensions[
    EXTENSION_NAME
  ] as IVariantMaterialExtension;
  let bestMappingIndex: number = -1;
  let bestMappingCount: number = 0;

  extension.mapping.forEach((mapping, mapingIndex) => {
    const countMatching = mapping.tags.reduce((total, tag) => {
      if (tags.includes(tag)) {
        return total + 1;
      }

      return total;
    }, 0);

    if (countMatching > bestMappingCount) {
      bestMappingCount = countMatching;
      bestMappingIndex = mapingIndex;
    }
  });

  if (bestMappingIndex > -1) {
    primitiveToUpdate.material = extension.mapping[bestMappingIndex].material;
  }
}
