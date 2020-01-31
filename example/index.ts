import {GUI as DatGui, GUIController} from 'dat.gui';
import Stats from 'stats.js';
import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  FloatType,
  Texture,
  WebGLRenderTarget,
  MeshStandardMaterial,
  Mesh,
} from 'three';
import {GLTF as ThreeGLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import {EXRLoader} from 'three/examples/jsm/loaders/EXRLoader';
import {PMREMGenerator,} from 'three/src/extras/PMREMGenerator';
import threeGltfVariantLoader from '../src';
import dragDropConvert from './src/drag-drop-convert';
import {IVariantLoader} from '../src/types';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const renderer = new WebGLRenderer({canvas});

const pmremGenerator = new PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

let currentVariantScene: Scene;
let currentGltfArrayBuffer: ArrayBuffer;
let exrCubeRenderTarget: WebGLRenderTarget;
let exrBackground: Texture;

renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.autoClear = false;

const gui = new DatGui();
const datGuiState = {tag: '', download};
let datTagController: GUIController = null;

const stats = new Stats();
canvas.parentElement.appendChild(stats.dom);

const scene = new Scene();
const camera = new PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

scene.add(new AmbientLight(0x404040, 1.5));
const light = new DirectionalLight();
scene.add(light);

new EXRLoader()
  .setDataType(FloatType)
  .load('assets/shopify_foyer.exr',
  (texture: Texture) => {
    exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
    exrBackground = exrCubeRenderTarget.texture;
    texture.dispose();
  }
);

function download() {
  const blob = new Blob([new Uint8Array(currentGltfArrayBuffer)], {
    type: 'model/gltf-binary',
  });
  const a = document.createElement('a') as HTMLAnchorElement;
  a.style.display = 'none';
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = 'variant_model.glb';
  a.click();
}

function variantLoadingComplete(
  variantSwitcher: IVariantLoader,
  gltf: ThreeGLTF
) {
  function switchTag(tag: string) {
    variantSwitcher.switchMaterial([tag], gltf => {
      if (currentVariantScene) {
        scene.remove(currentVariantScene);
      }

      currentVariantScene = gltf.scene;
      light.target = currentVariantScene;

      scene.add(currentVariantScene);
    });
  }

  const hasBeenInitialized = Boolean(datTagController);

  if (hasBeenInitialized) {
    gui.remove(datTagController);
  }

  if (currentVariantScene) {
    scene.remove(currentVariantScene);
  }

  datGuiState.tag = '';
  datTagController = gui
    .add(datGuiState, 'tag', [''].concat(variantSwitcher.materialTags))
    .onChange(switchTag);

  if (!hasBeenInitialized) {
    gui.add(datGuiState, 'download');
  }

  switchTag(datGuiState.tag);

  currentVariantScene = gltf.scene;
  light.target = currentVariantScene;
  scene.add(currentVariantScene);
}

const container = document.querySelector('#container') as HTMLDivElement;
dragDropConvert(container, (meldedGLTF: ArrayBuffer) => {
  currentGltfArrayBuffer = meldedGLTF;
  threeGltfVariantLoader(meldedGLTF, variantLoadingComplete);
});

window.addEventListener('resize', (event: UIEvent) => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
});

function render() {
  if (currentVariantScene) {
    currentVariantScene.rotation.x += 0.01;
    currentVariantScene.rotation.y += 0.01;
  }

  if (currentVariantScene && exrCubeRenderTarget) {
    const root = (currentVariantScene.children[0] as Mesh);
    const material = (root.material as MeshStandardMaterial);
    material.envMap = exrCubeRenderTarget.texture;
    material.needsUpdate = true;
  }

  scene.background = exrBackground;

  renderer.setClearColor(0xffffff);
  renderer.clearColor();
  renderer.render(scene, camera);
}

function renderLoop() {
  requestAnimationFrame(renderLoop);
  stats.begin();
  render();
  stats.end();
}
renderLoop();
