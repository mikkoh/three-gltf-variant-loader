import {IGLTF} from 'babylonjs-gltf2interface';
import EXTENSION_NAME from './extension-name';
import {IVariantMaterialExtension} from './types';

export default function getUniqueMaterialTags(
  gltf: IGLTF,
  indicesToMeshesWithExtension: number[],
  indicesToPrimitivesWithExtension: {[index: number]: number[]}
) {
  const tags = {};

  indicesToMeshesWithExtension.forEach(meshIndex => {
    indicesToPrimitivesWithExtension[meshIndex].forEach(primitiveIndex => {
      const extension = gltf.meshes[meshIndex].primitives[primitiveIndex]
        .extensions[EXTENSION_NAME] as IVariantMaterialExtension;

      extension.mapping.forEach(mapping => {
        mapping.tags.forEach(tag => {
          (tags as any)[tag] = true;
        });
      });
    });
  });

  return Object.keys(tags);
}
