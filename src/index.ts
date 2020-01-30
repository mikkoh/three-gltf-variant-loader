import {IGLTF} from 'babylonjs-gltf2interface';
import {
  GLTF as ThreeGLTF,
  GLTFLoader,
} from 'three/examples/jsm/loaders/GLTFLoader';
import cacheIndices from './cache-indices';
import getUniqueMaterialTags from './get-unique-material-tags';
import {IVariantLoader} from './types';
import updatePrimitive from './update-primitive';

export default function load(
  urlOrBuffer: string | ArrayBuffer,
  onComplete: (variantLoader: IVariantLoader, gltf: ThreeGLTF) => void,
  onProgress?: (event: ProgressEvent) => void,
  onError?: (event: ErrorEvent) => void
) {
  const meshesWithExtension: number[] = [];
  const primitivesWithExtension: {[id: number]: number[]} = {};
  let originalJSON: IGLTF;

  function onLoadComplete(gltf: ThreeGLTF) {
    originalJSON = JSON.parse(JSON.stringify(gltf.parser.json));

    cacheIndices(originalJSON, meshesWithExtension, primitivesWithExtension);

    onComplete(
      {
        materialTags: getUniqueMaterialTags(
          gltf.parser.json as IGLTF,
          meshesWithExtension,
          primitivesWithExtension
        ),
        switchMaterial(
          tags: string[],
          onParseComplete: (gltf: ThreeGLTF) => void,
          onParseError?: (event: ErrorEvent) => void
        ): void {
          const newJSON: IGLTF = JSON.parse(JSON.stringify(originalJSON));

          meshesWithExtension.forEach(meshIndex => {
            primitivesWithExtension[meshIndex].forEach(primitiveIndex => {
              const originalPrimitive =
                originalJSON.meshes[meshIndex].primitives[primitiveIndex];
              const primitiveToUpdate =
                newJSON.meshes[meshIndex].primitives[primitiveIndex];
              updatePrimitive(tags, primitiveToUpdate, originalPrimitive);
            });
          });

          gltf.parser.json = newJSON;

          // it seems that parse function isn't define in the types definition for Three
          (gltf as any).parser.parse(onParseComplete, onParseError);
        },
      },
      gltf
    );
  }

  const loader = new GLTFLoader();

  if (typeof urlOrBuffer === 'string') {
    loader.load(urlOrBuffer as string, onLoadComplete, onProgress, onError);
  } else {
    loader.parse(urlOrBuffer as ArrayBuffer, '', onLoadComplete, onError);
  }
}
