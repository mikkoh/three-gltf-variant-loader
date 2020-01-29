import {GUI as DatGui} from 'dat.gui';
import Stats from 'stats.js';
import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import threeGltfVariantLoader from '../src';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const renderer = new WebGLRenderer({canvas});
let currentVariantScene: Scene;

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

threeGltfVariantLoader('./assets/variant.glb', variantSwitcher => {
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

  const datGuiState = {tag: variantSwitcher.materialTags[0]};
  gui.add(datGuiState, 'tag', variantSwitcher.materialTags).onChange(switchTag);
  switchTag(datGuiState.tag);
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
