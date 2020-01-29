import {GLTF as ThreeGLTF} from 'three/examples/jsm/loaders/GLTFLoader';

export interface IVariantMaterialMapping {
  material: number;
  tags: string[];
}

export interface IVariantMaterialExtension {
  mapping: IVariantMaterialMapping[];
}

export interface IVariantLoader {
  materialTags: string[];
  switchMaterial(
    tags: string[],
    onComplete: (gltf: ThreeGLTF) => void,
    onError?: (event: ErrorEvent) => void
  ): void;
}
