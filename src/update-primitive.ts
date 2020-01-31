import {IMeshPrimitive} from 'babylonjs-gltf2interface';
import EXTENSION_NAME from './extension-name';
import {IVariantMaterialExtension} from './types';
import getMatchingMappingIndex from './get-matching-mapping-index';

export default function updatePrimitive(
  tags: string[],
  primitiveToUpdate: IMeshPrimitive,
  originalPrimitive: IMeshPrimitive
) {
  const extension = originalPrimitive.extensions[
    EXTENSION_NAME
  ] as IVariantMaterialExtension;

  const matchingIndex: number = getMatchingMappingIndex(
    tags,
    extension.mapping
  );

  if (matchingIndex > -1) {
    primitiveToUpdate.material = extension.mapping[matchingIndex].material;
  }
}
