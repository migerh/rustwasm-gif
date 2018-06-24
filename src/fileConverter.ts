
// The FileReader reads files and returns their content in
// a buffer.
export default class FileConverter {

  // Reads the file and returns the content as a Uint8Array
  // wrapped inside a Promise.
  static readAsByteArray(file: File): Promise<Uint8Array> {
    return new Promise((resolve) => {
      let reader = new FileReader();

      reader.onload = function (event) {
        const buffer = event.target.result;

        resolve(new Uint8Array(buffer));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  // Reads the file or blob and returns a string containing a data
  // url that can be assigned to and img's src attribute.
  static readAsDataUrl(file: File | Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = function (event) {
        const buffer = <string> event.target.result;

        resolve(buffer);
      }

      reader.readAsDataURL(file);
    })
  }

  // Converts a Uint8Array into a data url with the given mime type. Default
  // type is `'image/gif'`.
  static convertToDataUrl(data: Uint8Array, type: string = 'image/gif'): Promise<string> {
    const blob = new Blob([data], {type});
    return this.readAsDataUrl(blob);
  }
}