import {IGLTF} from 'babylonjs-gltf2interface';
import EXTENSION_NAME from './extension-name';

export default function cacheIndices(
  gltf: IGLTF,
  indicesToMeshesWithExtension: number[],
  indicesToPrimitivesWithExtension: {[index: number]: number[]}
): void {
  gltf.meshes.forEach((mesh: any, meshIndex: number) => {
    if (!mesh.primitives) {
      return;
    }

    mesh.primitives.forEach((primitive: any, primitiveIndex: number) => {
      if (!primitive.extensions && !primitive.extensions[EXTENSION_NAME]) {
        return;
      }

      if (!indicesToPrimitivesWithExtension[meshIndex]) {
        indicesToMeshesWithExtension.push(meshIndex);
        indicesToPrimitivesWithExtension[meshIndex] = [];
      }

      indicesToPrimitivesWithExtension[meshIndex].push(primitiveIndex);
    });
  });
}
