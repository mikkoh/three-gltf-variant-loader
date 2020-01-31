import {GUI as DatGui} from 'dat.gui';
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
import {
  EXRLoader,
} from 'three/examples/jsm/loaders/EXRLoader';
import {
  PMREMGenerator,
} from 'three/src/extras/PMREMGenerator';
import threeGltfVariantLoader from '../src';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const renderer = new WebGLRenderer({canvas});

const pmremGenerator = new PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

let currentVariantScene: Scene;
let exrCubeRenderTarget: WebGLRenderTarget;
let exrBackground: Texture;

renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.autoClear = false;

const gui = new DatGui();

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

threeGltfVariantLoader('./assets/variant.glb', (variantSwitcher, gltf) => {
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

  const datGuiState = {tag: ''};
  gui
    .add(datGuiState, 'tag', [''].concat(variantSwitcher.materialTags))
    .onChange(switchTag);
  switchTag(datGuiState.tag);

  currentVariantScene = gltf.scene;
  light.target = currentVariantScene;
  scene.add(currentVariantScene);
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
