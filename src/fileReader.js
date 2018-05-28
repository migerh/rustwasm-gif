
// The FileReader reads files and returns their content in
// a buffer.
export default class FileReader {

  // Reads the file and returns the content as a Uint8Array
  // wrapped inside a Promise.
  static read(file) {
    return new Promise((resolve) => {
      let reader = new window.FileReader();

      reader.onload = function (event) {
        const buffer = event.target.result;

        resolve(new Uint8Array(buffer));
      };

      reader.readAsArrayBuffer(file);
    });
  }
}