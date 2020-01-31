export function init(): Promise<void>;

/* tslint:disable */
/**
 * A summary of a mesh primitive\'s byte size requirements; currently textures only.
 */
export class AssetSizes {
  free(): void;
  texture_bytes: number;
}
/**
 * All the metadata generated for a variational asset.
 */
export class Metadata {
  free(): void;
  /**
   * The sum byte size of **every** referenced texture in this asset.
   * @returns {AssetSizes}
   */
  total_sizes(): AssetSizes;
  /**
   * The sum byte size of textures that are referenced depending on active variant tag.
   * @returns {AssetSizes}
   */
  variational_sizes(): AssetSizes;
  /**
   * WASM-friendly version of `tags()`; returns a JSON-encoded array of strings.
   * @returns {string}
   */
  wasm_tags(): string;
  /**
   * WASM-friendly version of `tags()`; returns a JSON-encoded map of tags to sizes.
   * @returns {string}
   */
  wasm_tag_sizes(): string;
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
  free(): void;
  /**
   * WASM-friendly version of `from_slice`; remaps its errors as `JsValue`.
   * @param {Uint8Array} glb
   * @param {string | undefined} tag
   * @returns {VariationalAsset}
   */
  static wasm_from_slice(glb: Uint8Array, tag?: string): VariationalAsset;
  /**
   * WASM-friendly version of `meld``; remaps its errors as `JsValue`.
   * @param {VariationalAsset} base
   * @param {VariationalAsset} melded
   * @returns {VariationalAsset}
   */
  static wasm_meld(
    base: VariationalAsset,
    melded: VariationalAsset
  ): VariationalAsset;
  /**
   * WASM-friendly version of `glb()`; returns an ownable `Vec<u8>` instead of a `&[u8]` slice.
   * @returns {Uint8Array}
   */
  wasm_glb(): Uint8Array;
  /**
   * WASM-friendly version of `default_tag()`; returns a clone of the tag
   * @returns {string}
   */
  wasm_default_tag(): string;
  /**
   * WASM-friendly version of `metadata()`; returns a clone of our metadata
   * @returns {Metadata}
   */
  wasm_metadata(): Metadata;
}
