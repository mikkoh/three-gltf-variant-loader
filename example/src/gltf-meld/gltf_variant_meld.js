let wasm;

let cachegetInt32Memory = null;
function getInt32Memory() {
    if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm(arg) {
    const ptr = wasm.__wbindgen_malloc(arg.length * 1);
    getUint8Memory().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm(arg) {

    let len = arg.length;
    let ptr = wasm.__wbindgen_malloc(len);

    const mem = getUint8Memory();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = wasm.__wbindgen_realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function getArrayU8FromWasm(ptr, len) {
    return getUint8Memory().subarray(ptr / 1, ptr / 1 + len);
}

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

export async function init() {
    wasm = await import('./gltf_variant_meld_bg.wasm');
}

/**
* A summary of a mesh primitive\'s byte size requirements; currently textures only.
*/
export class AssetSizes {

    static __wrap(ptr) {
        const obj = Object.create(AssetSizes.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_assetsizes_free(ptr);
    }
    /**
    * Byte count for texture image data, in its raw encoded form.
    * @returns {number}
    */
    get texture_bytes() {
        const ret = wasm.__wbg_get_assetsizes_texture_bytes(this.ptr);
        return ret >>> 0;
    }
    /**
    * Byte count for texture image data, in its raw encoded form.
    * @param {number} arg0
    */
    set texture_bytes(arg0) {
        wasm.__wbg_set_assetsizes_texture_bytes(this.ptr, arg0);
    }
}
/**
* All the metadata generated for a variational asset.
*/
export class Metadata {

    static __wrap(ptr) {
        const obj = Object.create(Metadata.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_metadata_free(ptr);
    }
    /**
    * The sum byte size of **every** referenced texture in this asset.
    * @returns {AssetSizes}
    */
    total_sizes() {
        const ret = wasm.metadata_total_sizes(this.ptr);
        return AssetSizes.__wrap(ret);
    }
    /**
    * The sum byte size of textures that are referenced depending on active variant tag.
    * @returns {AssetSizes}
    */
    variational_sizes() {
        const ret = wasm.metadata_variational_sizes(this.ptr);
        return AssetSizes.__wrap(ret);
    }
    /**
    * WASM-friendly version of `tags()`; returns a JSON-encoded array of strings.
    * @returns {string}
    */
    wasm_tags() {
        const retptr = 8;
        const ret = wasm.metadata_wasm_tags(retptr, this.ptr);
        const memi32 = getInt32Memory();
        const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
    }
    /**
    * WASM-friendly version of `tags()`; returns a JSON-encoded map of tags to sizes.
    * @returns {string}
    */
    wasm_tag_sizes() {
        const retptr = 8;
        const ret = wasm.metadata_wasm_tag_sizes(retptr, this.ptr);
        const memi32 = getInt32Memory();
        const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
    }
}
/**
* The primary API data structure.
*
* The key property is a glTF asset in binary form (which will always implement
* the `FB_material_variants` extension), along with various useful metadata for
* the benefit of clients.
*
* The key method melds one variational asset into another:
* ```
*   extern crate assets;
*   use std::path::Path;
*   use gltf_variant_meld::{Tag, VariationalAsset};
*
*   let (matte_tag, shiny_tag) = (Tag::from(\"matte\"), Tag::from(\"shiny\"));
*   let pinecone_matte = VariationalAsset::from_file(
*      &Path::new(assets::ASSET_PINECONE_MATTE()),
*      Some(&matte_tag),
*   ).expect(\"Eek! Couldn\'t create matte pinecone VariationalAsset.\");
*
*   let pinecone_shiny = VariationalAsset::from_file(
*      &Path::new(assets::ASSET_PINECONE_SHINY()),
*      Some(&shiny_tag),
*   ).expect(\"Eek! Couldn\'t create shiny pinecone VariationalAsset.\");
*
*   let result = VariationalAsset::meld(
*     &pinecone_matte,
*     &pinecone_shiny
*   ).expect(\"Erk. Failed to meld two pinecones.\");
*
*   assert!(result.metadata().tags().contains(&matte_tag));
*   assert!(result.metadata().tags().contains(&shiny_tag));
*   assert_eq!(result.metadata().tags().len(), 2);
*```
*/
export class VariationalAsset {

    static __wrap(ptr) {
        const obj = Object.create(VariationalAsset.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_variationalasset_free(ptr);
    }
    /**
    * WASM-friendly version of `from_slice`; remaps its errors as `JsValue`.
    * @param {Uint8Array} glb
    * @param {string | undefined} tag
    * @returns {VariationalAsset}
    */
    static wasm_from_slice(glb, tag) {
        const ptr0 = isLikeNone(tag) ? 0 : passStringToWasm(tag);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.variationalasset_wasm_from_slice(passArray8ToWasm(glb), WASM_VECTOR_LEN, ptr0, len0);
        return VariationalAsset.__wrap(ret);
    }
    /**
    * WASM-friendly version of `meld``; remaps its errors as `JsValue`.
    * @param {VariationalAsset} base
    * @param {VariationalAsset} melded
    * @returns {VariationalAsset}
    */
    static wasm_meld(base, melded) {
        _assertClass(base, VariationalAsset);
        _assertClass(melded, VariationalAsset);
        const ret = wasm.variationalasset_wasm_meld(base.ptr, melded.ptr);
        return VariationalAsset.__wrap(ret);
    }
    /**
    * WASM-friendly version of `glb()`; returns an ownable `Vec<u8>` instead of a `&[u8]` slice.
    * @returns {Uint8Array}
    */
    wasm_glb() {
        const retptr = 8;
        const ret = wasm.variationalasset_wasm_glb(retptr, this.ptr);
        const memi32 = getInt32Memory();
        const v0 = getArrayU8FromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
    }
    /**
    * WASM-friendly version of `default_tag()`; returns a clone of the tag
    * @returns {string}
    */
    wasm_default_tag() {
        const retptr = 8;
        const ret = wasm.variationalasset_wasm_default_tag(retptr, this.ptr);
        const memi32 = getInt32Memory();
        const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
    }
    /**
    * WASM-friendly version of `metadata()`; returns a clone of our metadata
    * @returns {Metadata}
    */
    wasm_metadata() {
        const ret = wasm.variationalasset_wasm_metadata(this.ptr);
        return Metadata.__wrap(ret);
    }
}

export const __wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm(arg0, arg1);
    return addHeapObject(ret);
};

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm(arg0, arg1));
};

export const __wbindgen_rethrow = function(arg0) {
    throw takeObject(arg0);
};

