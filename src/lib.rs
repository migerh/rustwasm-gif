extern crate console_error_panic_hook;
extern crate gif;
extern crate wasm_bindgen;

use gif::SetParameter;
use gif::{ColorOutput, Decoder, Encoder, Frame, Reader, Repeat};
use std::vec::Vec;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    // Access console.log() from the wasm module
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // Tell the web page how many frames in total the gif has
    #[wasm_bindgen(js_name = registerProgress, js_namespace = self)]
    fn register_progress(id: &str, name: &str, number_of_frames: usize);

    // Report how many frames we already encoded.
    #[wasm_bindgen(js_name = reportProgress, js_namespace = self)]
    fn report_progress(id: &str, current_frame: usize);
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

    Dimension {
        width: decoder.width(),
        height: decoder.height(),
    }
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
        None => {}
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

    // allocate enough memory to fit in a full sized frame
    // width * height is the number of pixels and times 4 for the color channels (r, g, b, and a)
    full_frame.resize((width as usize) * (height as usize) * (4 as usize), 0);

    // extract the single frames from the gif
    while let Some(frame) = reader.read_next_frame().unwrap() {
        // todo: try to get rid of this copy
        let buffer = frame.buffer.to_vec();

        // some frames may be smaller than the whole image. we need to calculate
        // the correct index to map the frame to the correct parts of the full_frame.
        //
        //  full_frame   -   width
        // +-------------------------------------------------------+
        // | frame  top        frame width                         |
        // |  left   +---------------------------------------+     | full_frame
        // |         |                                 frame |     | height
        // |         |                                height |     |
        // |         +---------------------------------------+     |
        // +-------------------------------------------------------+
        //
        // see also the index calculation inside the loop.
        // to calculate the correct index in the full_frame buffer from the index `i`
        // in the frame buffer we first have to add frame `top` number of lines:
        //
        //        top * (width as usize)
        //
        // this is done in the constant_offset. For every full line inside the frame -
        // determined with `i / frame_width` - we add another line:
        //
        //        (i / frame_width) * (width as usize)
        //
        // all that is left to do now is add the constant left offset and advance the
        // same number of pixels in the full_frame buffer as we do in the frame buffer,
        // that is the remainder of the division above:
        //
        //         (i % frame_width)
        let left = frame.left as usize;
        let top = frame.top as usize;
        let frame_width = frame.width as usize;
        let constant_offset = top * (width as usize) + left;

        // copy the current frame buffer over the full_frame buffer, but only if the
        // current pixel is not opaque AND we have a full pixel. That last part should
        // always be true, but it's there anyway just in case.
        for (i, pixel) in buffer.chunks(4).enumerate() {
            if pixel.len() == 4 && pixel[3] != 0 {
                let index =
                    constant_offset + (i / frame_width) * (width as usize) + (i % frame_width);
                full_frame[index * 4 + 0] = pixel[0];
                full_frame[index * 4 + 1] = pixel[1];
                full_frame[index * 4 + 2] = pixel[2];
                full_frame[index * 4 + 3] = pixel[3];
            }
        }

        // this copy is necessary because we need the full_frame buffer to put (parts of) the next
        // frame on top of the existing buffer data.
        let frame_data = FrameData {
            width,
            height,
            rgba: full_frame.clone(),
            delay: frame.delay,
        };
        frames.push(frame_data);
    }

    frames
}

/// Creates a gif from a set of frames and a color palette
///
/// The `global_palette` may be an empty vector.
fn gif_from_frames(
    frames: &mut Vec<FrameData>,
    width: u16,
    height: u16,
    global_palette: Vec<u8>,
    id: &str,
) -> Vec<u8> {
    let mut buffer = Vec::new();
    {
        let mut encoder = Encoder::new(&mut buffer, width, height, &global_palette).unwrap();
        encoder.set(Repeat::Infinite).unwrap();

        for (i, frame) in frames.iter().enumerate() {
            let delay = frame.delay;
            let mut frame = Frame::from_rgba(frame.width, frame.height, &mut frame.rgba.to_vec());
            frame.delay = delay;
            encoder.write_frame(&frame).unwrap();

            report_progress(id, i + 1);
        }
    }

    buffer
}

/// Reverses a gif
#[wasm_bindgen]
pub fn reverse_gif(id: &str, name: &str, data: &[u8]) -> Vec<u8> {
    console_error_panic_hook::set_once();

    log("enter");
    let mut reader = decode_data(data);

    log("read metadata");
    let (width, height, global_palette) = metadata(&reader);

    log("read frames");
    let mut frames = collect_frames(&mut reader, width, height);

    register_progress(id, name, frames.len());

    frames.reverse();

    log("write buffer");
    gif_from_frames(&mut frames, width, height, global_palette, id)
}
