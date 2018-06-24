#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate gif;
extern crate wasm_bindgen;
extern crate console_error_panic_hook;

use gif::{Encoder, Decoder, Reader, ColorOutput, Repeat, Frame};
use gif::SetParameter;
use std::panic;
use std::vec::Vec;
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

struct FrameData {
  pub width: u16,
  pub height: u16,
  pub rgba: Vec<u8>,
  pub delay: u16,
}

/// A small function that decodes a gif and returns its dimensions.
/// Input is a u8 slice which corresponds to a Uint8Array in JavaScript.
#[wasm_bindgen]
pub fn get_dimension(data: &[u8]) -> Dimension {
    let mut decoder = Decoder::new(data);

    // Configure the decoder such that it will expand the image to RGBA.
    decoder.set(ColorOutput::RGBA);

    // Read the file header
    let decoder = decoder.read_info().unwrap();

    Dimension { width: decoder.width(), height: decoder.height() }
}

// Instantiate a gif reader from the byte slice
fn decode_data(data: &[u8]) -> Reader<&[u8]> {
  let mut decoder = Decoder::new(data);
  decoder.set(ColorOutput::RGBA);
  decoder.read_info().unwrap()
}

/// Reads global metadata from the gif like
fn metadata(reader: &Reader<&[u8]>) -> (u16, u16, Vec<u8>) {
  let width = reader.width();
  let height = reader.height();
  let mut global_palette: Vec<u8> = Vec::new();
  match reader.global_palette() {
    Some(palette) => global_palette = palette.to_vec(),
    None => {},
  };

  (width, height, global_palette)
}

/// Extract all the frames from the gif
///
/// The `reader` has to be mutable because `read_next_frame()` probably has some state that
/// is mutated like "what's the current frame". The returned vector contains all frames fully
/// decoded. Gifs can sometime contain only partial images of just the areas that change from
/// one frame to the next. This may cause reversed gifs to look funny because only parts of the
/// image are rendered.
fn collect_frames(reader: &mut Reader<&[u8]>, width: u16, height: u16) -> Vec<FrameData> {
  let mut frames = Vec::new();
  let mut full_frame: Vec<u8> = Vec::new();

  // extract the single frames from the gif
  while let Some(frame) = reader.read_next_frame().unwrap() {
    // todo: try to get rid of this copy
    let buffer = frame.buffer.to_vec();

    // make sure we have enough data to fit the whole frame into our full_frame buffer
    // but do not make it smaller!
    // usually the first frame should be the biggest so this hould be called only once
    if buffer.len() > full_frame.len() {
      full_frame.resize(buffer.len(), 0);
    }

    // desperate attempt to remove these strange artifacts
    // copy the current frame buffer over the full_frame buffer, but only if the
    // current pixel is not opaque AND we have a full pixel. That last part should
    // always be true, but it's there anyway just in case.
    for (i, pixel) in buffer.chunks(4).enumerate() {
      if pixel[3] != 0 && pixel.len() == 4 {
        full_frame[i * 4 + 0] = pixel[0];
        full_frame[i * 4 + 1] = pixel[1];
        full_frame[i * 4 + 2] = pixel[2];
        full_frame[i * 4 + 3] = pixel[3];
      }
    }

    // this copy is necessary because we need the full_frame buffer to put (parts of) the next
    // frame on top of the existing buffer data.
    let frame_data = FrameData { width, height, rgba: full_frame.clone(), delay: frame.delay};
    frames.push(frame_data);
  }

  frames
}

/// Creates a gif from a set of frames and a color palette
///
/// The `global_palette` may be an empty vector.
fn gif_from_frames(frames: &mut Vec<FrameData>, width: u16, height: u16, global_palette: Vec<u8>) -> Vec<u8> {
  let mut buffer = Vec::new();
  {
    let mut encoder = Encoder::new(&mut buffer, width, height, &global_palette).unwrap();
    encoder.set(Repeat::Infinite).unwrap();

    for frame in frames.iter() {
      let delay = frame.delay;
      let mut frame = Frame::from_rgba(frame.width, frame.height, &mut frame.rgba.to_vec());
      frame.delay = delay;
      encoder.write_frame(&frame).unwrap();
    }
  }

  buffer
}

/// Reverses a gif
#[wasm_bindgen]
pub fn reverse_gif(data: &[u8]) -> Vec<u8> {
  console_error_panic_hook::set_once();

  log("enter");
  let mut reader = decode_data(data);

  log("read metadata");
  let (width, height, global_palette) = metadata(&reader);

  log("read frames");
  let mut frames = collect_frames(&mut reader, width, height);

  frames.reverse();

  log("write buffer");
  gif_from_frames(&mut frames, width, height, global_palette)
}