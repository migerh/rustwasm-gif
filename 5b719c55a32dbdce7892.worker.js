/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/processing.worker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./pkg/gif.js":
/*!********************!*\
  !*** ./pkg/gif.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports) {

(function() {
    const __exports = {};
    let wasm;

    let cachegetUint8Memory = null;
    function getUint8Memory() {
        if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
            cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
        }
        return cachegetUint8Memory;
    }

    let WASM_VECTOR_LEN = 0;

    function passArray8ToWasm(arg) {
        const ptr = wasm.__wbindgen_malloc(arg.length * 1);
        getUint8Memory().set(arg, ptr / 1);
        WASM_VECTOR_LEN = arg.length;
        return ptr;
    }
    /**
    * A small function that decodes a gif and returns its dimensions.
    * Input is a u8 slice which corresponds to a Uint8Array in JavaScript.
    * @param {Uint8Array} data
    * @returns {Dimension}
    */
    __exports.get_dimension = function(data) {
        const ret = wasm.get_dimension(passArray8ToWasm(data), WASM_VECTOR_LEN);
        return Dimension.__wrap(ret);
    };

    let cachedTextEncoder = new TextEncoder('utf-8');

    let passStringToWasm;
    if (typeof cachedTextEncoder.encodeInto === 'function') {
        passStringToWasm = function(arg) {


            let size = arg.length;
            let ptr = wasm.__wbindgen_malloc(size);
            let offset = 0;
            {
                const mem = getUint8Memory();
                for (; offset < arg.length; offset++) {
                    const code = arg.charCodeAt(offset);
                    if (code > 0x7F) break;
                    mem[ptr + offset] = code;
                }
            }

            if (offset !== arg.length) {
                arg = arg.slice(offset);
                ptr = wasm.__wbindgen_realloc(ptr, size, size = offset + arg.length * 3);
                const view = getUint8Memory().subarray(ptr + offset, ptr + size);
                const ret = cachedTextEncoder.encodeInto(arg, view);

                offset += ret.written;
            }
            WASM_VECTOR_LEN = offset;
            return ptr;
        };
    } else {
        passStringToWasm = function(arg) {


            let size = arg.length;
            let ptr = wasm.__wbindgen_malloc(size);
            let offset = 0;
            {
                const mem = getUint8Memory();
                for (; offset < arg.length; offset++) {
                    const code = arg.charCodeAt(offset);
                    if (code > 0x7F) break;
                    mem[ptr + offset] = code;
                }
            }

            if (offset !== arg.length) {
                const buf = cachedTextEncoder.encode(arg.slice(offset));
                ptr = wasm.__wbindgen_realloc(ptr, size, size = offset + buf.length);
                getUint8Memory().set(buf, ptr + offset);
                offset += buf.length;
            }
            WASM_VECTOR_LEN = offset;
            return ptr;
        };
    }

    let cachegetInt32Memory = null;
    function getInt32Memory() {
        if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
            cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
        }
        return cachegetInt32Memory;
    }

    function getArrayU8FromWasm(ptr, len) {
        return getUint8Memory().subarray(ptr / 1, ptr / 1 + len);
    }
    /**
    * Reverses a gif
    * @param {string} id
    * @param {string} name
    * @param {Uint8Array} data
    * @returns {Uint8Array}
    */
    __exports.reverse_gif = function(id, name, data) {
        const retptr = 8;
        const ret = wasm.reverse_gif(retptr, passStringToWasm(id), WASM_VECTOR_LEN, passStringToWasm(name), WASM_VECTOR_LEN, passArray8ToWasm(data), WASM_VECTOR_LEN);
        const memi32 = getInt32Memory();
        const v0 = getArrayU8FromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
    };

    let cachedTextDecoder = new TextDecoder('utf-8');

    function getStringFromWasm(ptr, len) {
        return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
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
/**
* Tuples are apparently not supported by wasm-bindgen atm
* so we\'ll use our own datastructure.
*/
class Dimension {

    static __wrap(ptr) {
        const obj = Object.create(Dimension.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_dimension_free(ptr);
    }
    /**
    * @returns {number}
    */
    get width() {
        const ret = wasm.__wbg_get_dimension_width(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set width(arg0) {
        wasm.__wbg_set_dimension_width(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get height() {
        const ret = wasm.__wbg_get_dimension_height(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set height(arg0) {
        wasm.__wbg_set_dimension_height(this.ptr, arg0);
    }
}
__exports.Dimension = Dimension;

function init(module) {

    let result;
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_log_24a2dbf20588208a = function(arg0, arg1) {
        console.log(getStringFromWasm(arg0, arg1));
    };
    imports.wbg.__wbg_registerProgress_e176ca1a9785d304 = function(arg0, arg1, arg2, arg3, arg4) {
        self.registerProgress(getStringFromWasm(arg0, arg1), getStringFromWasm(arg2, arg3), arg4 >>> 0);
    };
    imports.wbg.__wbg_reportProgress_5d8930b824af2db8 = function(arg0, arg1, arg2) {
        self.reportProgress(getStringFromWasm(arg0, arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_new_59cb74e423758ede = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_558ba5917b466edd = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ret0 = passStringToWasm(ret);
        const ret1 = WASM_VECTOR_LEN;
        getInt32Memory()[arg0 / 4 + 0] = ret0;
        getInt32Memory()[arg0 / 4 + 1] = ret1;
    };
    imports.wbg.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
        const v0 = getStringFromWasm(arg0, arg1).slice();
        wasm.__wbindgen_free(arg0, arg1 * 1);
        console.error(v0);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm(arg0, arg1));
    };

    if (module instanceof URL || typeof module === 'string' || module instanceof Request) {

        const response = fetch(module);
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            result = WebAssembly.instantiateStreaming(response, imports)
            .catch(e => {
                console.warn("`WebAssembly.instantiateStreaming` failed. Assuming this is because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
                return response
                .then(r => r.arrayBuffer())
                .then(bytes => WebAssembly.instantiate(bytes, imports));
            });
        } else {
            result = response
            .then(r => r.arrayBuffer())
            .then(bytes => WebAssembly.instantiate(bytes, imports));
        }
    } else {

        result = WebAssembly.instantiate(module, imports)
        .then(result => {
            if (result instanceof WebAssembly.Instance) {
                return { instance: result, module };
            } else {
                return result;
            }
        });
    }
    return result.then(({instance, module}) => {
        wasm = instance.exports;
        init.__wbindgen_wasm_module = module;

        return wasm;
    });
}

self.wasm_bindgen = Object.assign(init, __exports);

})();


/***/ }),

/***/ "./pkg/gif_bg.wasm":
/*!*************************!*\
  !*** ./pkg/gif_bg.wasm ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "7834dce80aa58c885be053ce85852782.wasm";

/***/ }),

/***/ "./src/processing.worker.js":
/*!**********************************!*\
  !*** ./src/processing.worker.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Ideally, this file would be written in typescript as well but something is
// not working correctly. So for now at least this will be plain javascript.

// The next two functions `registerProgress` and `reportProgress` will be
// called from the rust wasm module. They have to be defined before importing
// the wasm module otherwise the import will fail.

// We just forward the data to the main thread. The main thread will add the
// gif to the progress module.
self.registerProgress = (id, name, numberOfFrames) => {
  self.postMessage({
    type: 'register_progress',
    id,
    name,
    numberOfFrames
  });
}

// This function will be called after every frame that was processed by the
// wasm module. All we do here is pass the information through to the main
// thread which will then update the progress bar.
self.reportProgress = (id, currentFrame) => {
  self.postMessage({
    type: 'report_progress',
    id,
    currentFrame
  });
}

// Import the wasm wrapper module generated by wasm-bindgen.
__webpack_require__(/*! ../pkg/gif */ "./pkg/gif.js");

// This does not really load the wasm module. This in fact is loaded through
// the webpack file-loader. This loader will copy the wasm file to the output
// folder and this require only gives us the path to the wasm module which can
// then be passd to the init function of the wasm_bindgen wrapper.
const wasmPath = __webpack_require__(/*! ../pkg/gif_bg.wasm */ "./pkg/gif_bg.wasm");

// Initialize the wasm module. We get back a promise that resolves once the
// wasm module was successfully initialized.
const gifModule = self.wasm_bindgen(wasmPath);

// Once we get a message from the main thread we can start processing the gif.
self.addEventListener('message', async (event) => {
  try {
    const { id, name, buffer } = event.data;

    // Make sure the wasm module is fully initialized.
    await gifModule;
    const gif = self.wasm_bindgen;

    // Reverse the gif.
    const reversedBuffer = gif.reverse_gif(id, name, buffer);

    // Tell the main thread that we're finished.
    self.postMessage({
      type: 'finished',
      id,
      name,
      buffer,
      reversedBuffer
    });
  } catch (e) {
    self.postMessage({
      type: 'error',
      id: event.data.id,
      name: event.data.name,
      message: e.message,
      stack: e.stack
    })
  }
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcGtnL2dpZi5qcyIsIndlYnBhY2s6Ly8vLi9wa2cvZ2lmX2JnLndhc20iLCJ3ZWJwYWNrOi8vLy4vc3JjL3Byb2Nlc3Npbmcud29ya2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxXQUFXO0FBQ3pCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixxQkFBcUI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IscUJBQXFCO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsT0FBTztBQUNyQixjQUFjLE9BQU87QUFDckIsY0FBYyxXQUFXO0FBQ3pCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSx5QkFBeUIsa0JBQWtCOztBQUUzQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxPQUFPO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxPQUFPO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCO0FBQ3hCLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EseUJBQXlCLGlCQUFpQjtBQUMxQztBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMOztBQUVBOztBQUVBLENBQUM7Ozs7Ozs7Ozs7OztBQ2pSRCxpQkFBaUIscUJBQXVCLDJDOzs7Ozs7Ozs7OztBQ0F4QztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQSxtQkFBTyxDQUFDLGdDQUFZOztBQUVwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixtQkFBTyxDQUFDLDZDQUFvQjs7QUFFN0M7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsbUJBQW1COztBQUU5QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsQ0FBQyxFIiwiZmlsZSI6IjViNzE5YzU1YTMyZGJkY2U3ODkyLndvcmtlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3Byb2Nlc3Npbmcud29ya2VyLmpzXCIpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IF9fZXhwb3J0cyA9IHt9O1xuICAgIGxldCB3YXNtO1xuXG4gICAgbGV0IGNhY2hlZ2V0VWludDhNZW1vcnkgPSBudWxsO1xuICAgIGZ1bmN0aW9uIGdldFVpbnQ4TWVtb3J5KCkge1xuICAgICAgICBpZiAoY2FjaGVnZXRVaW50OE1lbW9yeSA9PT0gbnVsbCB8fCBjYWNoZWdldFVpbnQ4TWVtb3J5LmJ1ZmZlciAhPT0gd2FzbS5tZW1vcnkuYnVmZmVyKSB7XG4gICAgICAgICAgICBjYWNoZWdldFVpbnQ4TWVtb3J5ID0gbmV3IFVpbnQ4QXJyYXkod2FzbS5tZW1vcnkuYnVmZmVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVnZXRVaW50OE1lbW9yeTtcbiAgICB9XG5cbiAgICBsZXQgV0FTTV9WRUNUT1JfTEVOID0gMDtcblxuICAgIGZ1bmN0aW9uIHBhc3NBcnJheThUb1dhc20oYXJnKSB7XG4gICAgICAgIGNvbnN0IHB0ciA9IHdhc20uX193YmluZGdlbl9tYWxsb2MoYXJnLmxlbmd0aCAqIDEpO1xuICAgICAgICBnZXRVaW50OE1lbW9yeSgpLnNldChhcmcsIHB0ciAvIDEpO1xuICAgICAgICBXQVNNX1ZFQ1RPUl9MRU4gPSBhcmcubGVuZ3RoO1xuICAgICAgICByZXR1cm4gcHRyO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEEgc21hbGwgZnVuY3Rpb24gdGhhdCBkZWNvZGVzIGEgZ2lmIGFuZCByZXR1cm5zIGl0cyBkaW1lbnNpb25zLlxuICAgICogSW5wdXQgaXMgYSB1OCBzbGljZSB3aGljaCBjb3JyZXNwb25kcyB0byBhIFVpbnQ4QXJyYXkgaW4gSmF2YVNjcmlwdC5cbiAgICAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICAgICogQHJldHVybnMge0RpbWVuc2lvbn1cbiAgICAqL1xuICAgIF9fZXhwb3J0cy5nZXRfZGltZW5zaW9uID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zdCByZXQgPSB3YXNtLmdldF9kaW1lbnNpb24ocGFzc0FycmF5OFRvV2FzbShkYXRhKSwgV0FTTV9WRUNUT1JfTEVOKTtcbiAgICAgICAgcmV0dXJuIERpbWVuc2lvbi5fX3dyYXAocmV0KTtcbiAgICB9O1xuXG4gICAgbGV0IGNhY2hlZFRleHRFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCd1dGYtOCcpO1xuXG4gICAgbGV0IHBhc3NTdHJpbmdUb1dhc207XG4gICAgaWYgKHR5cGVvZiBjYWNoZWRUZXh0RW5jb2Rlci5lbmNvZGVJbnRvID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHBhc3NTdHJpbmdUb1dhc20gPSBmdW5jdGlvbihhcmcpIHtcblxuXG4gICAgICAgICAgICBsZXQgc2l6ZSA9IGFyZy5sZW5ndGg7XG4gICAgICAgICAgICBsZXQgcHRyID0gd2FzbS5fX3diaW5kZ2VuX21hbGxvYyhzaXplKTtcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSAwO1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lbSA9IGdldFVpbnQ4TWVtb3J5KCk7XG4gICAgICAgICAgICAgICAgZm9yICg7IG9mZnNldCA8IGFyZy5sZW5ndGg7IG9mZnNldCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBhcmcuY2hhckNvZGVBdChvZmZzZXQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29kZSA+IDB4N0YpIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBtZW1bcHRyICsgb2Zmc2V0XSA9IGNvZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob2Zmc2V0ICE9PSBhcmcubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYXJnID0gYXJnLnNsaWNlKG9mZnNldCk7XG4gICAgICAgICAgICAgICAgcHRyID0gd2FzbS5fX3diaW5kZ2VuX3JlYWxsb2MocHRyLCBzaXplLCBzaXplID0gb2Zmc2V0ICsgYXJnLmxlbmd0aCAqIDMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZpZXcgPSBnZXRVaW50OE1lbW9yeSgpLnN1YmFycmF5KHB0ciArIG9mZnNldCwgcHRyICsgc2l6ZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0ID0gY2FjaGVkVGV4dEVuY29kZXIuZW5jb2RlSW50byhhcmcsIHZpZXcpO1xuXG4gICAgICAgICAgICAgICAgb2Zmc2V0ICs9IHJldC53cml0dGVuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgV0FTTV9WRUNUT1JfTEVOID0gb2Zmc2V0O1xuICAgICAgICAgICAgcmV0dXJuIHB0cjtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwYXNzU3RyaW5nVG9XYXNtID0gZnVuY3Rpb24oYXJnKSB7XG5cblxuICAgICAgICAgICAgbGV0IHNpemUgPSBhcmcubGVuZ3RoO1xuICAgICAgICAgICAgbGV0IHB0ciA9IHdhc20uX193YmluZGdlbl9tYWxsb2Moc2l6ZSk7XG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gMDtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZW0gPSBnZXRVaW50OE1lbW9yeSgpO1xuICAgICAgICAgICAgICAgIGZvciAoOyBvZmZzZXQgPCBhcmcubGVuZ3RoOyBvZmZzZXQrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2RlID0gYXJnLmNoYXJDb2RlQXQob2Zmc2V0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGUgPiAweDdGKSBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgbWVtW3B0ciArIG9mZnNldF0gPSBjb2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9mZnNldCAhPT0gYXJnLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IGNhY2hlZFRleHRFbmNvZGVyLmVuY29kZShhcmcuc2xpY2Uob2Zmc2V0KSk7XG4gICAgICAgICAgICAgICAgcHRyID0gd2FzbS5fX3diaW5kZ2VuX3JlYWxsb2MocHRyLCBzaXplLCBzaXplID0gb2Zmc2V0ICsgYnVmLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgZ2V0VWludDhNZW1vcnkoKS5zZXQoYnVmLCBwdHIgKyBvZmZzZXQpO1xuICAgICAgICAgICAgICAgIG9mZnNldCArPSBidWYubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgV0FTTV9WRUNUT1JfTEVOID0gb2Zmc2V0O1xuICAgICAgICAgICAgcmV0dXJuIHB0cjtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBsZXQgY2FjaGVnZXRJbnQzMk1lbW9yeSA9IG51bGw7XG4gICAgZnVuY3Rpb24gZ2V0SW50MzJNZW1vcnkoKSB7XG4gICAgICAgIGlmIChjYWNoZWdldEludDMyTWVtb3J5ID09PSBudWxsIHx8IGNhY2hlZ2V0SW50MzJNZW1vcnkuYnVmZmVyICE9PSB3YXNtLm1lbW9yeS5idWZmZXIpIHtcbiAgICAgICAgICAgIGNhY2hlZ2V0SW50MzJNZW1vcnkgPSBuZXcgSW50MzJBcnJheSh3YXNtLm1lbW9yeS5idWZmZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWNoZWdldEludDMyTWVtb3J5O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEFycmF5VThGcm9tV2FzbShwdHIsIGxlbikge1xuICAgICAgICByZXR1cm4gZ2V0VWludDhNZW1vcnkoKS5zdWJhcnJheShwdHIgLyAxLCBwdHIgLyAxICsgbGVuKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBSZXZlcnNlcyBhIGdpZlxuICAgICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gICAgKiBAcmV0dXJucyB7VWludDhBcnJheX1cbiAgICAqL1xuICAgIF9fZXhwb3J0cy5yZXZlcnNlX2dpZiA9IGZ1bmN0aW9uKGlkLCBuYW1lLCBkYXRhKSB7XG4gICAgICAgIGNvbnN0IHJldHB0ciA9IDg7XG4gICAgICAgIGNvbnN0IHJldCA9IHdhc20ucmV2ZXJzZV9naWYocmV0cHRyLCBwYXNzU3RyaW5nVG9XYXNtKGlkKSwgV0FTTV9WRUNUT1JfTEVOLCBwYXNzU3RyaW5nVG9XYXNtKG5hbWUpLCBXQVNNX1ZFQ1RPUl9MRU4sIHBhc3NBcnJheThUb1dhc20oZGF0YSksIFdBU01fVkVDVE9SX0xFTik7XG4gICAgICAgIGNvbnN0IG1lbWkzMiA9IGdldEludDMyTWVtb3J5KCk7XG4gICAgICAgIGNvbnN0IHYwID0gZ2V0QXJyYXlVOEZyb21XYXNtKG1lbWkzMltyZXRwdHIgLyA0ICsgMF0sIG1lbWkzMltyZXRwdHIgLyA0ICsgMV0pLnNsaWNlKCk7XG4gICAgICAgIHdhc20uX193YmluZGdlbl9mcmVlKG1lbWkzMltyZXRwdHIgLyA0ICsgMF0sIG1lbWkzMltyZXRwdHIgLyA0ICsgMV0gKiAxKTtcbiAgICAgICAgcmV0dXJuIHYwO1xuICAgIH07XG5cbiAgICBsZXQgY2FjaGVkVGV4dERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoJ3V0Zi04Jyk7XG5cbiAgICBmdW5jdGlvbiBnZXRTdHJpbmdGcm9tV2FzbShwdHIsIGxlbikge1xuICAgICAgICByZXR1cm4gY2FjaGVkVGV4dERlY29kZXIuZGVjb2RlKGdldFVpbnQ4TWVtb3J5KCkuc3ViYXJyYXkocHRyLCBwdHIgKyBsZW4pKTtcbiAgICB9XG5cbiAgICBjb25zdCBoZWFwID0gbmV3IEFycmF5KDMyKTtcblxuICAgIGhlYXAuZmlsbCh1bmRlZmluZWQpO1xuXG4gICAgaGVhcC5wdXNoKHVuZGVmaW5lZCwgbnVsbCwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgbGV0IGhlYXBfbmV4dCA9IGhlYXAubGVuZ3RoO1xuXG4gICAgZnVuY3Rpb24gYWRkSGVhcE9iamVjdChvYmopIHtcbiAgICAgICAgaWYgKGhlYXBfbmV4dCA9PT0gaGVhcC5sZW5ndGgpIGhlYXAucHVzaChoZWFwLmxlbmd0aCArIDEpO1xuICAgICAgICBjb25zdCBpZHggPSBoZWFwX25leHQ7XG4gICAgICAgIGhlYXBfbmV4dCA9IGhlYXBbaWR4XTtcblxuICAgICAgICBoZWFwW2lkeF0gPSBvYmo7XG4gICAgICAgIHJldHVybiBpZHg7XG4gICAgfVxuXG5mdW5jdGlvbiBnZXRPYmplY3QoaWR4KSB7IHJldHVybiBoZWFwW2lkeF07IH1cblxuZnVuY3Rpb24gZHJvcE9iamVjdChpZHgpIHtcbiAgICBpZiAoaWR4IDwgMzYpIHJldHVybjtcbiAgICBoZWFwW2lkeF0gPSBoZWFwX25leHQ7XG4gICAgaGVhcF9uZXh0ID0gaWR4O1xufVxuXG5mdW5jdGlvbiB0YWtlT2JqZWN0KGlkeCkge1xuICAgIGNvbnN0IHJldCA9IGdldE9iamVjdChpZHgpO1xuICAgIGRyb3BPYmplY3QoaWR4KTtcbiAgICByZXR1cm4gcmV0O1xufVxuLyoqXG4qIFR1cGxlcyBhcmUgYXBwYXJlbnRseSBub3Qgc3VwcG9ydGVkIGJ5IHdhc20tYmluZGdlbiBhdG1cbiogc28gd2VcXCdsbCB1c2Ugb3VyIG93biBkYXRhc3RydWN0dXJlLlxuKi9cbmNsYXNzIERpbWVuc2lvbiB7XG5cbiAgICBzdGF0aWMgX193cmFwKHB0cikge1xuICAgICAgICBjb25zdCBvYmogPSBPYmplY3QuY3JlYXRlKERpbWVuc2lvbi5wcm90b3R5cGUpO1xuICAgICAgICBvYmoucHRyID0gcHRyO1xuXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgZnJlZSgpIHtcbiAgICAgICAgY29uc3QgcHRyID0gdGhpcy5wdHI7XG4gICAgICAgIHRoaXMucHRyID0gMDtcblxuICAgICAgICB3YXNtLl9fd2JnX2RpbWVuc2lvbl9mcmVlKHB0cik7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAqL1xuICAgIGdldCB3aWR0aCgpIHtcbiAgICAgICAgY29uc3QgcmV0ID0gd2FzbS5fX3diZ19nZXRfZGltZW5zaW9uX3dpZHRoKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gYXJnMFxuICAgICovXG4gICAgc2V0IHdpZHRoKGFyZzApIHtcbiAgICAgICAgd2FzbS5fX3diZ19zZXRfZGltZW5zaW9uX3dpZHRoKHRoaXMucHRyLCBhcmcwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICovXG4gICAgZ2V0IGhlaWdodCgpIHtcbiAgICAgICAgY29uc3QgcmV0ID0gd2FzbS5fX3diZ19nZXRfZGltZW5zaW9uX2hlaWdodCh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGFyZzBcbiAgICAqL1xuICAgIHNldCBoZWlnaHQoYXJnMCkge1xuICAgICAgICB3YXNtLl9fd2JnX3NldF9kaW1lbnNpb25faGVpZ2h0KHRoaXMucHRyLCBhcmcwKTtcbiAgICB9XG59XG5fX2V4cG9ydHMuRGltZW5zaW9uID0gRGltZW5zaW9uO1xuXG5mdW5jdGlvbiBpbml0KG1vZHVsZSkge1xuXG4gICAgbGV0IHJlc3VsdDtcbiAgICBjb25zdCBpbXBvcnRzID0ge307XG4gICAgaW1wb3J0cy53YmcgPSB7fTtcbiAgICBpbXBvcnRzLndiZy5fX3diZ19sb2dfMjRhMmRiZjIwNTg4MjA4YSA9IGZ1bmN0aW9uKGFyZzAsIGFyZzEpIHtcbiAgICAgICAgY29uc29sZS5sb2coZ2V0U3RyaW5nRnJvbVdhc20oYXJnMCwgYXJnMSkpO1xuICAgIH07XG4gICAgaW1wb3J0cy53YmcuX193YmdfcmVnaXN0ZXJQcm9ncmVzc19lMTc2Y2ExYTk3ODVkMzA0ID0gZnVuY3Rpb24oYXJnMCwgYXJnMSwgYXJnMiwgYXJnMywgYXJnNCkge1xuICAgICAgICBzZWxmLnJlZ2lzdGVyUHJvZ3Jlc3MoZ2V0U3RyaW5nRnJvbVdhc20oYXJnMCwgYXJnMSksIGdldFN0cmluZ0Zyb21XYXNtKGFyZzIsIGFyZzMpLCBhcmc0ID4+PiAwKTtcbiAgICB9O1xuICAgIGltcG9ydHMud2JnLl9fd2JnX3JlcG9ydFByb2dyZXNzXzVkODkzMGI4MjRhZjJkYjggPSBmdW5jdGlvbihhcmcwLCBhcmcxLCBhcmcyKSB7XG4gICAgICAgIHNlbGYucmVwb3J0UHJvZ3Jlc3MoZ2V0U3RyaW5nRnJvbVdhc20oYXJnMCwgYXJnMSksIGFyZzIgPj4+IDApO1xuICAgIH07XG4gICAgaW1wb3J0cy53YmcuX193YmdfbmV3XzU5Y2I3NGU0MjM3NThlZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgcmV0ID0gbmV3IEVycm9yKCk7XG4gICAgICAgIHJldHVybiBhZGRIZWFwT2JqZWN0KHJldCk7XG4gICAgfTtcbiAgICBpbXBvcnRzLndiZy5fX3diZ19zdGFja181NThiYTU5MTdiNDY2ZWRkID0gZnVuY3Rpb24oYXJnMCwgYXJnMSkge1xuICAgICAgICBjb25zdCByZXQgPSBnZXRPYmplY3QoYXJnMSkuc3RhY2s7XG4gICAgICAgIGNvbnN0IHJldDAgPSBwYXNzU3RyaW5nVG9XYXNtKHJldCk7XG4gICAgICAgIGNvbnN0IHJldDEgPSBXQVNNX1ZFQ1RPUl9MRU47XG4gICAgICAgIGdldEludDMyTWVtb3J5KClbYXJnMCAvIDQgKyAwXSA9IHJldDA7XG4gICAgICAgIGdldEludDMyTWVtb3J5KClbYXJnMCAvIDQgKyAxXSA9IHJldDE7XG4gICAgfTtcbiAgICBpbXBvcnRzLndiZy5fX3diZ19lcnJvcl80YmI2YzJhOTc0MDcxMjlhID0gZnVuY3Rpb24oYXJnMCwgYXJnMSkge1xuICAgICAgICBjb25zdCB2MCA9IGdldFN0cmluZ0Zyb21XYXNtKGFyZzAsIGFyZzEpLnNsaWNlKCk7XG4gICAgICAgIHdhc20uX193YmluZGdlbl9mcmVlKGFyZzAsIGFyZzEgKiAxKTtcbiAgICAgICAgY29uc29sZS5lcnJvcih2MCk7XG4gICAgfTtcbiAgICBpbXBvcnRzLndiZy5fX3diaW5kZ2VuX29iamVjdF9kcm9wX3JlZiA9IGZ1bmN0aW9uKGFyZzApIHtcbiAgICAgICAgdGFrZU9iamVjdChhcmcwKTtcbiAgICB9O1xuICAgIGltcG9ydHMud2JnLl9fd2JpbmRnZW5fdGhyb3cgPSBmdW5jdGlvbihhcmcwLCBhcmcxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihnZXRTdHJpbmdGcm9tV2FzbShhcmcwLCBhcmcxKSk7XG4gICAgfTtcblxuICAgIGlmIChtb2R1bGUgaW5zdGFuY2VvZiBVUkwgfHwgdHlwZW9mIG1vZHVsZSA9PT0gJ3N0cmluZycgfHwgbW9kdWxlIGluc3RhbmNlb2YgUmVxdWVzdCkge1xuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gZmV0Y2gobW9kdWxlKTtcbiAgICAgICAgaWYgKHR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmVzdWx0ID0gV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcocmVzcG9uc2UsIGltcG9ydHMpXG4gICAgICAgICAgICAuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiYFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nYCBmYWlsZWQuIEFzc3VtaW5nIHRoaXMgaXMgYmVjYXVzZSB5b3VyIHNlcnZlciBkb2VzIG5vdCBzZXJ2ZSB3YXNtIHdpdGggYGFwcGxpY2F0aW9uL3dhc21gIE1JTUUgdHlwZS4gRmFsbGluZyBiYWNrIHRvIGBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZWAgd2hpY2ggaXMgc2xvd2VyLiBPcmlnaW5hbCBlcnJvcjpcXG5cIiwgZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgLnRoZW4ociA9PiByLmFycmF5QnVmZmVyKCkpXG4gICAgICAgICAgICAgICAgLnRoZW4oYnl0ZXMgPT4gV2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoYnl0ZXMsIGltcG9ydHMpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzcG9uc2VcbiAgICAgICAgICAgIC50aGVuKHIgPT4gci5hcnJheUJ1ZmZlcigpKVxuICAgICAgICAgICAgLnRoZW4oYnl0ZXMgPT4gV2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoYnl0ZXMsIGltcG9ydHMpKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgcmVzdWx0ID0gV2ViQXNzZW1ibHkuaW5zdGFudGlhdGUobW9kdWxlLCBpbXBvcnRzKVxuICAgICAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFdlYkFzc2VtYmx5Lkluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgaW5zdGFuY2U6IHJlc3VsdCwgbW9kdWxlIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHtpbnN0YW5jZSwgbW9kdWxlfSkgPT4ge1xuICAgICAgICB3YXNtID0gaW5zdGFuY2UuZXhwb3J0cztcbiAgICAgICAgaW5pdC5fX3diaW5kZ2VuX3dhc21fbW9kdWxlID0gbW9kdWxlO1xuXG4gICAgICAgIHJldHVybiB3YXNtO1xuICAgIH0pO1xufVxuXG5zZWxmLndhc21fYmluZGdlbiA9IE9iamVjdC5hc3NpZ24oaW5pdCwgX19leHBvcnRzKTtcblxufSkoKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjc4MzRkY2U4MGFhNThjODg1YmUwNTNjZTg1ODUyNzgyLndhc21cIjsiLCIvLyBJZGVhbGx5LCB0aGlzIGZpbGUgd291bGQgYmUgd3JpdHRlbiBpbiB0eXBlc2NyaXB0IGFzIHdlbGwgYnV0IHNvbWV0aGluZyBpc1xuLy8gbm90IHdvcmtpbmcgY29ycmVjdGx5LiBTbyBmb3Igbm93IGF0IGxlYXN0IHRoaXMgd2lsbCBiZSBwbGFpbiBqYXZhc2NyaXB0LlxuXG4vLyBUaGUgbmV4dCB0d28gZnVuY3Rpb25zIGByZWdpc3RlclByb2dyZXNzYCBhbmQgYHJlcG9ydFByb2dyZXNzYCB3aWxsIGJlXG4vLyBjYWxsZWQgZnJvbSB0aGUgcnVzdCB3YXNtIG1vZHVsZS4gVGhleSBoYXZlIHRvIGJlIGRlZmluZWQgYmVmb3JlIGltcG9ydGluZ1xuLy8gdGhlIHdhc20gbW9kdWxlIG90aGVyd2lzZSB0aGUgaW1wb3J0IHdpbGwgZmFpbC5cblxuLy8gV2UganVzdCBmb3J3YXJkIHRoZSBkYXRhIHRvIHRoZSBtYWluIHRocmVhZC4gVGhlIG1haW4gdGhyZWFkIHdpbGwgYWRkIHRoZVxuLy8gZ2lmIHRvIHRoZSBwcm9ncmVzcyBtb2R1bGUuXG5zZWxmLnJlZ2lzdGVyUHJvZ3Jlc3MgPSAoaWQsIG5hbWUsIG51bWJlck9mRnJhbWVzKSA9PiB7XG4gIHNlbGYucG9zdE1lc3NhZ2Uoe1xuICAgIHR5cGU6ICdyZWdpc3Rlcl9wcm9ncmVzcycsXG4gICAgaWQsXG4gICAgbmFtZSxcbiAgICBudW1iZXJPZkZyYW1lc1xuICB9KTtcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZnRlciBldmVyeSBmcmFtZSB0aGF0IHdhcyBwcm9jZXNzZWQgYnkgdGhlXG4vLyB3YXNtIG1vZHVsZS4gQWxsIHdlIGRvIGhlcmUgaXMgcGFzcyB0aGUgaW5mb3JtYXRpb24gdGhyb3VnaCB0byB0aGUgbWFpblxuLy8gdGhyZWFkIHdoaWNoIHdpbGwgdGhlbiB1cGRhdGUgdGhlIHByb2dyZXNzIGJhci5cbnNlbGYucmVwb3J0UHJvZ3Jlc3MgPSAoaWQsIGN1cnJlbnRGcmFtZSkgPT4ge1xuICBzZWxmLnBvc3RNZXNzYWdlKHtcbiAgICB0eXBlOiAncmVwb3J0X3Byb2dyZXNzJyxcbiAgICBpZCxcbiAgICBjdXJyZW50RnJhbWVcbiAgfSk7XG59XG5cbi8vIEltcG9ydCB0aGUgd2FzbSB3cmFwcGVyIG1vZHVsZSBnZW5lcmF0ZWQgYnkgd2FzbS1iaW5kZ2VuLlxucmVxdWlyZShcIi4uL3BrZy9naWZcIik7XG5cbi8vIFRoaXMgZG9lcyBub3QgcmVhbGx5IGxvYWQgdGhlIHdhc20gbW9kdWxlLiBUaGlzIGluIGZhY3QgaXMgbG9hZGVkIHRocm91Z2hcbi8vIHRoZSB3ZWJwYWNrIGZpbGUtbG9hZGVyLiBUaGlzIGxvYWRlciB3aWxsIGNvcHkgdGhlIHdhc20gZmlsZSB0byB0aGUgb3V0cHV0XG4vLyBmb2xkZXIgYW5kIHRoaXMgcmVxdWlyZSBvbmx5IGdpdmVzIHVzIHRoZSBwYXRoIHRvIHRoZSB3YXNtIG1vZHVsZSB3aGljaCBjYW5cbi8vIHRoZW4gYmUgcGFzc2QgdG8gdGhlIGluaXQgZnVuY3Rpb24gb2YgdGhlIHdhc21fYmluZGdlbiB3cmFwcGVyLlxuY29uc3Qgd2FzbVBhdGggPSByZXF1aXJlKCcuLi9wa2cvZ2lmX2JnLndhc20nKTtcblxuLy8gSW5pdGlhbGl6ZSB0aGUgd2FzbSBtb2R1bGUuIFdlIGdldCBiYWNrIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIG9uY2UgdGhlXG4vLyB3YXNtIG1vZHVsZSB3YXMgc3VjY2Vzc2Z1bGx5IGluaXRpYWxpemVkLlxuY29uc3QgZ2lmTW9kdWxlID0gc2VsZi53YXNtX2JpbmRnZW4od2FzbVBhdGgpO1xuXG4vLyBPbmNlIHdlIGdldCBhIG1lc3NhZ2UgZnJvbSB0aGUgbWFpbiB0aHJlYWQgd2UgY2FuIHN0YXJ0IHByb2Nlc3NpbmcgdGhlIGdpZi5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGFzeW5jIChldmVudCkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHsgaWQsIG5hbWUsIGJ1ZmZlciB9ID0gZXZlbnQuZGF0YTtcblxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgd2FzbSBtb2R1bGUgaXMgZnVsbHkgaW5pdGlhbGl6ZWQuXG4gICAgYXdhaXQgZ2lmTW9kdWxlO1xuICAgIGNvbnN0IGdpZiA9IHNlbGYud2FzbV9iaW5kZ2VuO1xuXG4gICAgLy8gUmV2ZXJzZSB0aGUgZ2lmLlxuICAgIGNvbnN0IHJldmVyc2VkQnVmZmVyID0gZ2lmLnJldmVyc2VfZ2lmKGlkLCBuYW1lLCBidWZmZXIpO1xuXG4gICAgLy8gVGVsbCB0aGUgbWFpbiB0aHJlYWQgdGhhdCB3ZSdyZSBmaW5pc2hlZC5cbiAgICBzZWxmLnBvc3RNZXNzYWdlKHtcbiAgICAgIHR5cGU6ICdmaW5pc2hlZCcsXG4gICAgICBpZCxcbiAgICAgIG5hbWUsXG4gICAgICBidWZmZXIsXG4gICAgICByZXZlcnNlZEJ1ZmZlclxuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgc2VsZi5wb3N0TWVzc2FnZSh7XG4gICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgaWQ6IGV2ZW50LmRhdGEuaWQsXG4gICAgICBuYW1lOiBldmVudC5kYXRhLm5hbWUsXG4gICAgICBtZXNzYWdlOiBlLm1lc3NhZ2UsXG4gICAgICBzdGFjazogZS5zdGFja1xuICAgIH0pXG4gIH1cbn0pOyJdLCJzb3VyY2VSb290IjoiIn0=