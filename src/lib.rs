#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate gif;
extern crate wasm_bindgen;

use gif::{Decoder, ColorOutput};
use gif::SetParameter;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

/// Tuples are apparently not supported by wasm-bindgen atm
/// so we'll use our own datastructure.
#[wasm_bindgen]
pub struct Dimension {
    pub width: u16,
    pub height: u16,
}

/// A small function that decodes a gif and returns its dimensions.
/// Input is a u8 slice which corresponds to a Uint8Array in JavaScript.
#[wasm_bindgen]
pub fn decode_gif(data: &[u8]) -> Dimension {
    let mut decoder = Decoder::new(data);

    // Configure the decoder such that it will expand the image to RGBA.
    decoder.set(ColorOutput::RGBA);

    // Read the file header
    let decoder = decoder.read_info().unwrap();

    Dimension { width: decoder.width(), height: decoder.height() }
}
