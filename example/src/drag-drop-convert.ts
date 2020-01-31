import {
  init as initGLTFMeld,
  VariationalAsset,
} from './gltf-meld/gltf_variant_meld';

type MeldCallback = (dataAfterMeld: ArrayBuffer) => void;
interface IArrayBufferReader {
  arrayBuffer(): Promise<ArrayBuffer>;
}

function getTagsFromFiles(files: FileList): string[] {
  const tags: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file: File = files.item(i);
    const fileNameWithoutExtension = file.name
      .split('.')
      .slice(0, -1)
      .join('.');
    tags.push(fileNameWithoutExtension);
  }

  return tags;
}

function getArrayBuffersFromFiles(files: FileList): Promise<ArrayBuffer[]> {
  const arrayBufferPromises: Promise<ArrayBuffer>[] = [];

  for (let i = 0; i < files.length; i++) {
    const file: File = files.item(i);

    if (!(file as any).arrayBuffer) {
      throw new Error('Need to implement file loading via FileReader still');
    }

    const blob: IArrayBufferReader = (file as any) as IArrayBufferReader;
    arrayBufferPromises.push(blob.arrayBuffer());
  }

  return Promise.all(arrayBufferPromises);
}

function combineArrayBuffersIntoMeldedGLTFs(
  tags: string[],
  arrayBuffers: ArrayBuffer[]
): Uint8Array {
  const assets = arrayBuffers.map((buffer, index) => {
    const tag = tags[index];
    return VariationalAsset.wasm_from_slice(new Uint8Array(buffer), tag);
  });
  const meldedAssets = assets.reduce((meldedAssets, asset) => {
    if (!meldedAssets) {
      return asset;
    }

    return VariationalAsset.wasm_meld(meldedAssets, asset);
  }, null);

  return meldedAssets.wasm_glb();
}

export default function dragDropConvert(
  container: HTMLElement,
  callback: MeldCallback
) {
  let files: FileList = null;
  let gltfMeldIsInitialized = false;
  container.draggable = true;

  async function meldFiles() {
    if (!gltfMeldIsInitialized || !files) {
      return;
    }

    const arrayBuffers = await getArrayBuffersFromFiles(files);

    if (arrayBuffers.length === 1) {
      callback(arrayBuffers[0]);
      return;
    }

    const tags = getTagsFromFiles(files);
    files = null;

    try {
      const meldedGLB = combineArrayBuffersIntoMeldedGLTFs(tags, arrayBuffers);
      callback(meldedGLB.buffer);
    } catch (error) {
      throw error;
    }
  }

  container.addEventListener('dragover', ev => {
    ev.preventDefault();
  });

  container.addEventListener('drop', (ev: DragEvent) => {
    ev.preventDefault();

    files = ev.dataTransfer.files;

    meldFiles().catch(error => {
      throw error;
    });
  });

  initGLTFMeld()
    .then(() => {
      gltfMeldIsInitialized = true;
      meldFiles().catch(error => {
        throw error;
      });
    })
    .catch((error: Error) => {
      throw error;
    });
}
