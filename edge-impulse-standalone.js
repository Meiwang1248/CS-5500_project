var Module = typeof Module !== "undefined" ? Module : {};
var moduleOverrides = {};
var key;
for (key in Module) {
    if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key]
    }
}
var arguments_ = [];
var thisProgram = "./this.program";
var quit_ = function (status, toThrow) {
    throw toThrow
};
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_HAS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === "object";
ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
ENVIRONMENT_HAS_NODE = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
ENVIRONMENT_IS_NODE = ENVIRONMENT_HAS_NODE && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (Module["ENVIRONMENT"]) {
    throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)")
}
var scriptDirectory = "";

function locateFile(path) {
    if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory)
    }
    return scriptDirectory + path
}

var read_, readAsync, readBinary, setWindowTitle;
var nodeFS;
var nodePath;
if (ENVIRONMENT_IS_NODE) {
    scriptDirectory = __dirname + "/";
    read_ = function shell_read(filename, binary) {
        if (!nodeFS) nodeFS = require("fs");
        if (!nodePath) nodePath = require("path");
        filename = nodePath["normalize"](filename);
        return nodeFS["readFileSync"](filename, binary ? null : "utf8")
    };
    readBinary = function readBinary(filename) {
        var ret = read_(filename, true);
        if (!ret.buffer) {
            ret = new Uint8Array(ret)
        }
        assert(ret.buffer);
        return ret
    };
    if (process["argv"].length > 1) {
        thisProgram = process["argv"][1].replace(/\\/g, "/")
    }
    arguments_ = process["argv"].slice(2);
    if (typeof module !== "undefined") {
        module["exports"] = Module
    }
    process["on"]("uncaughtException", function (ex) {
        if (!(ex instanceof ExitStatus)) {
            throw ex
        }
    });
    process["on"]("unhandledRejection", abort);
    quit_ = function (status) {
        process["exit"](status)
    };
    Module["inspect"] = function () {
        return "[Emscripten Module object]"
    }
} else if (ENVIRONMENT_IS_SHELL) {
    if (typeof read != "undefined") {
        read_ = function shell_read(f) {
            return read(f)
        }
    }
    readBinary = function readBinary(f) {
        var data;
        if (typeof readbuffer === "function") {
            return new Uint8Array(readbuffer(f))
        }
        data = read(f, "binary");
        assert(typeof data === "object");
        return data
    };
    if (typeof scriptArgs != "undefined") {
        arguments_ = scriptArgs
    } else if (typeof arguments != "undefined") {
        arguments_ = arguments
    }
    if (typeof quit === "function") {
        quit_ = function (status) {
            quit(status)
        }
    }
    if (typeof print !== "undefined") {
        if (typeof console === "undefined") console = {};
        console.log = print;
        console.warn = console.error = typeof printErr !== "undefined" ? printErr : print
    }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href
    } else if (document.currentScript) {
        scriptDirectory = document.currentScript.src
    }
    if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1)
    } else {
        scriptDirectory = ""
    }
    {
        read_ = function shell_read(url) {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, false);
            xhr.send(null);
            return xhr.responseText
        };
        if (ENVIRONMENT_IS_WORKER) {
            readBinary = function readBinary(url) {
                var xhr = new XMLHttpRequest;
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response)
            }
        }
        readAsync = function readAsync(url, onload, onerror) {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function xhr_onload() {
                if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                    onload(xhr.response);
                    return
                }
                onerror()
            };
            xhr.onerror = onerror;
            xhr.send(null)
        }
    }
    setWindowTitle = function (title) {
        document.title = title
    }
} else {
    throw new Error("environment detection error")
}
var out = Module["print"] || console.log.bind(console);
var err = Module["printErr"] || console.warn.bind(console);
for (key in moduleOverrides) {
    if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key]
    }
}
moduleOverrides = null;
if (Module["arguments"]) arguments_ = Module["arguments"];
if (!Object.getOwnPropertyDescriptor(Module, "arguments")) Object.defineProperty(Module, "arguments", {
    configurable: true,
    get: function () {
        abort("Module.arguments has been replaced with plain arguments_")
    }
});
if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
if (!Object.getOwnPropertyDescriptor(Module, "thisProgram")) Object.defineProperty(Module, "thisProgram", {
    configurable: true,
    get: function () {
        abort("Module.thisProgram has been replaced with plain thisProgram")
    }
});
if (Module["quit"]) quit_ = Module["quit"];
if (!Object.getOwnPropertyDescriptor(Module, "quit")) Object.defineProperty(Module, "quit", {
    configurable: true,
    get: function () {
        abort("Module.quit has been replaced with plain quit_")
    }
});
assert(typeof Module["memoryInitializerPrefixURL"] === "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["pthreadMainPrefixURL"] === "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["cdInitializerPrefixURL"] === "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["filePackagePrefixURL"] === "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["read"] === "undefined", "Module.read option was removed (modify read_ in JS)");
assert(typeof Module["readAsync"] === "undefined", "Module.readAsync option was removed (modify readAsync in JS)");
assert(typeof Module["readBinary"] === "undefined", "Module.readBinary option was removed (modify readBinary in JS)");
assert(typeof Module["setWindowTitle"] === "undefined", "Module.setWindowTitle option was removed (modify setWindowTitle in JS)");
if (!Object.getOwnPropertyDescriptor(Module, "read")) Object.defineProperty(Module, "read", {
    configurable: true,
    get: function () {
        abort("Module.read has been replaced with plain read_")
    }
});
if (!Object.getOwnPropertyDescriptor(Module, "readAsync")) Object.defineProperty(Module, "readAsync", {
    configurable: true,
    get: function () {
        abort("Module.readAsync has been replaced with plain readAsync")
    }
});
if (!Object.getOwnPropertyDescriptor(Module, "readBinary")) Object.defineProperty(Module, "readBinary", {
    configurable: true,
    get: function () {
        abort("Module.readBinary has been replaced with plain readBinary")
    }
});
stackSave = stackRestore = stackAlloc = function () {
    abort("cannot use the stack before compiled code is ready to run, and has provided stack access")
};

function warnOnce(text) {
    if (!warnOnce.shown) warnOnce.shown = {};
    if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text)
    }
}


var tempRet0 = 0;
var setTempRet0 = function (value) {
    tempRet0 = value
};
var wasmBinary;
if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
if (!Object.getOwnPropertyDescriptor(Module, "wasmBinary")) Object.defineProperty(Module, "wasmBinary", {
    configurable: true,
    get: function () {
        abort("Module.wasmBinary has been replaced with plain wasmBinary")
    }
});
var noExitRuntime;
if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
if (!Object.getOwnPropertyDescriptor(Module, "noExitRuntime")) Object.defineProperty(Module, "noExitRuntime", {
    configurable: true,
    get: function () {
        abort("Module.noExitRuntime has been replaced with plain noExitRuntime")
    }
});
if (typeof WebAssembly !== "object") {
    abort("No WebAssembly support found. Build with -s WASM=0 to target JavaScript instead.")
}
var wasmMemory;
var wasmTable = new WebAssembly.Table({"initial": 221, "maximum": 221 + 0, "element": "anyfunc"});
var ABORT = false;
var EXITSTATUS = 0;

function assert(condition, text) {
    if (!condition) {
        abort("Assertion failed: " + text)
    }
}

var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
    var endIdx = idx + maxBytesToRead;
    var endPtr = idx;
    while (u8Array[endPtr] && !(endPtr >= endIdx)) ++endPtr;
    if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(u8Array.subarray(idx, endPtr))
    } else {
        var str = "";
        while (idx < endPtr) {
            var u0 = u8Array[idx++];
            if (!(u0 & 128)) {
                str += String.fromCharCode(u0);
                continue
            }
            var u1 = u8Array[idx++] & 63;
            if ((u0 & 224) == 192) {
                str += String.fromCharCode((u0 & 31) << 6 | u1);
                continue
            }
            var u2 = u8Array[idx++] & 63;
            if ((u0 & 240) == 224) {
                u0 = (u0 & 15) << 12 | u1 << 6 | u2
            } else {
                if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte 0x" + u0.toString(16) + " encountered when deserializing a UTF-8 string on the asm.js/wasm heap to a JS string!");
                u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u8Array[idx++] & 63
            }
            if (u0 < 65536) {
                str += String.fromCharCode(u0)
            } else {
                var ch = u0 - 65536;
                str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
            }
        }
    }
    return str
}

function UTF8ToString(ptr, maxBytesToRead) {
    return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
}

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
    if (!(maxBytesToWrite > 0)) return 0;
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = 65536 + ((u & 1023) << 10) | u1 & 1023
        }
        if (u <= 127) {
            if (outIdx >= endIdx) break;
            outU8Array[outIdx++] = u
        } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            outU8Array[outIdx++] = 192 | u >> 6;
            outU8Array[outIdx++] = 128 | u & 63
        } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            outU8Array[outIdx++] = 224 | u >> 12;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        } else {
            if (outIdx + 3 >= endIdx) break;
            if (u >= 2097152) warnOnce("Invalid Unicode code point 0x" + u.toString(16) + " encountered when serializing a JS string to an UTF-8 string on the asm.js/wasm heap! (Valid unicode code points should be in range 0-0x1FFFFF).");
            outU8Array[outIdx++] = 240 | u >> 18;
            outU8Array[outIdx++] = 128 | u >> 12 & 63;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        }
    }
    outU8Array[outIdx] = 0;
    return outIdx - startIdx
}

function stringToUTF8(str, outPtr, maxBytesToWrite) {
    assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
    return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
}

function lengthBytesUTF8(str) {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
        if (u <= 127) ++len; else if (u <= 2047) len += 2; else if (u <= 65535) len += 3; else len += 4
    }
    return len
}

var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;
var WASM_PAGE_SIZE = 65536;

function alignUp(x, multiple) {
    if (x % multiple > 0) {
        x += multiple - x % multiple
    }
    return x
}

var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateGlobalBufferAndViews(buf) {
    buffer = buf;
    Module["HEAP8"] = HEAP8 = new Int8Array(buf);
    Module["HEAP16"] = HEAP16 = new Int16Array(buf);
    Module["HEAP32"] = HEAP32 = new Int32Array(buf);
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
    Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
    Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
    Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
    Module["HEAPF64"] = HEAPF64 = new Float64Array(buf)
}

var STACK_BASE = 5311408, STACK_MAX = 68528, DYNAMIC_BASE = 5311408, DYNAMICTOP_PTR = 68368;
assert(STACK_BASE % 16 === 0, "stack must start aligned");
assert(DYNAMIC_BASE % 16 === 0, "heap must start aligned");
var TOTAL_STACK = 5242880;
if (Module["TOTAL_STACK"]) assert(TOTAL_STACK === Module["TOTAL_STACK"], "the stack size can no longer be determined at runtime");
var INITIAL_TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 134217728;
if (!Object.getOwnPropertyDescriptor(Module, "TOTAL_MEMORY")) Object.defineProperty(Module, "TOTAL_MEMORY", {
    configurable: true,
    get: function () {
        abort("Module.TOTAL_MEMORY has been replaced with plain INITIAL_TOTAL_MEMORY")
    }
});
assert(INITIAL_TOTAL_MEMORY >= TOTAL_STACK, "TOTAL_MEMORY should be larger than TOTAL_STACK, was " + INITIAL_TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined, "JS engine does not provide full typed array support");
if (Module["wasmMemory"]) {
    wasmMemory = Module["wasmMemory"]
} else {
    wasmMemory = new WebAssembly.Memory({"initial": INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE})
}
if (wasmMemory) {
    buffer = wasmMemory.buffer
}
INITIAL_TOTAL_MEMORY = buffer.byteLength;
assert(INITIAL_TOTAL_MEMORY % WASM_PAGE_SIZE === 0);
updateGlobalBufferAndViews(buffer);
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;

function writeStackCookie() {
    assert((STACK_MAX & 3) == 0);
    HEAPU32[(STACK_MAX >> 2) + 1] = 34821223;
    HEAPU32[(STACK_MAX >> 2) + 2] = 2310721022;
    HEAP32[0] = 1668509029
}

function checkStackCookie() {
    var cookie1 = HEAPU32[(STACK_MAX >> 2) + 1];
    var cookie2 = HEAPU32[(STACK_MAX >> 2) + 2];
    if (cookie1 != 34821223 || cookie2 != 2310721022) {
        abort("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x2135467, but received 0x" + cookie2.toString(16) + " " + cookie1.toString(16))
    }
    if (HEAP32[0] !== 1668509029) abort("Runtime error: The application has corrupted its heap memory area (address zero)!")
}

function abortStackOverflow(allocSize) {
    abort("Stack overflow! Attempted to allocate " + allocSize + " bytes on the stack, but stack has only " + (STACK_MAX - stackSave() + allocSize) + " bytes available!")
}

(function () {
    var h16 = new Int16Array(1);
    var h8 = new Int8Array(h16.buffer);
    h16[0] = 25459;
    if (h8[0] !== 115 || h8[1] !== 99) throw"Runtime error: expected the system to be little-endian!"
})();

function callRuntimeCallbacks(callbacks) {
    while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == "function") {
            callback();
            continue
        }
        var func = callback.func;
        if (typeof func === "number") {
            if (callback.arg === undefined) {
                Module["dynCall_v"](func)
            } else {
                Module["dynCall_vi"](func, callback.arg)
            }
        } else {
            func(callback.arg === undefined ? null : callback.arg)
        }
    }
}

var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;

function preRun() {
    if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPRERUN__)
}

function initRuntime() {
    checkStackCookie();
    assert(!runtimeInitialized);
    runtimeInitialized = true;
    callRuntimeCallbacks(__ATINIT__)
}

function preMain() {
    checkStackCookie();
    callRuntimeCallbacks(__ATMAIN__)
}

function postRun() {
    checkStackCookie();
    if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPOSTRUN__)
}

function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb)
}

function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb)
}

assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
var runDependencyTracking = {};

function addRunDependency(id) {
    runDependencies++;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
    if (id) {
        assert(!runDependencyTracking[id]);
        runDependencyTracking[id] = 1;
        if (runDependencyWatcher === null && typeof setInterval !== "undefined") {
            runDependencyWatcher = setInterval(function () {
                if (ABORT) {
                    clearInterval(runDependencyWatcher);
                    runDependencyWatcher = null;
                    return
                }
                var shown = false;
                for (var dep in runDependencyTracking) {
                    if (!shown) {
                        shown = true;
                        err("still waiting on run dependencies:")
                    }
                    err("dependency: " + dep)
                }
                if (shown) {
                    err("(end of list)")
                }
            }, 1e4)
        }
    } else {
        err("warning: run dependency added without ID")
    }
}

function removeRunDependency(id) {
    runDependencies--;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
    if (id) {
        assert(runDependencyTracking[id]);
        delete runDependencyTracking[id]
    } else {
        err("warning: run dependency removed without ID")
    }
    if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null
        }
        if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback()
        }
    }
}

Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};

function abort(what) {
    if (Module["onAbort"]) {
        Module["onAbort"](what)
    }
    what += "";
    out(what);
    err(what);
    ABORT = true;
    EXITSTATUS = 1;
    var output = "abort(" + what + ") at " + stackTrace();
    what = output;
    throw new WebAssembly.RuntimeError(what)
}

var FS = {
    error: function () {
        abort("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with  -s FORCE_FILESYSTEM=1")
    }, init: function () {
        FS.error()
    }, createDataFile: function () {
        FS.error()
    }, createPreloadedFile: function () {
        FS.error()
    }, createLazyFile: function () {
        FS.error()
    }, open: function () {
        FS.error()
    }, mkdev: function () {
        FS.error()
    }, registerDevice: function () {
        FS.error()
    }, analyzePath: function () {
        FS.error()
    }, loadFilesFromDB: function () {
        FS.error()
    }, ErrnoError: function ErrnoError() {
        FS.error()
    }
};
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
var dataURIPrefix = "data:application/octet-stream;base64,";

function isDataURI(filename) {
    return String.prototype.startsWith ? filename.startsWith(dataURIPrefix) : filename.indexOf(dataURIPrefix) === 0
}

var wasmBinaryFile = "edge-impulse-standalone.wasm";
if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile)
}

function getBinary() {
    try {
        if (wasmBinary) {
            return new Uint8Array(wasmBinary)
        }
        if (readBinary) {
            return readBinary(wasmBinaryFile)
        } else {
            throw"both async and sync fetching of the wasm failed"
        }
    } catch (err) {
        abort(err)
    }
}

function getBinaryPromise() {
    if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === "function") {
        return fetch(wasmBinaryFile, {credentials: "same-origin"}).then(function (response) {
            if (!response["ok"]) {
                throw"failed to load wasm binary file at '" + wasmBinaryFile + "'"
            }
            return response["arrayBuffer"]()
        }).catch(function () {
            return getBinary()
        })
    }
    return new Promise(function (resolve, reject) {
        resolve(getBinary())
    })
}

function createWasm() {
    var info = {"env": asmLibraryArg, "wasi_snapshot_preview1": asmLibraryArg};

    function receiveInstance(instance, module) {
        var exports = instance.exports;
        Module["asm"] = exports;
        removeRunDependency("wasm-instantiate")
    }

    addRunDependency("wasm-instantiate");
    var trueModule = Module;

    function receiveInstantiatedSource(output) {
        assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
        trueModule = null;
        receiveInstance(output["instance"])
    }

    function instantiateArrayBuffer(receiver) {
        return getBinaryPromise().then(function (binary) {
            return WebAssembly.instantiate(binary, info)
        }).then(receiver, function (reason) {
            err("failed to asynchronously prepare wasm: " + reason);
            abort(reason)
        })
    }

    function instantiateAsync() {
        if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function") {
            fetch(wasmBinaryFile, {credentials: "same-origin"}).then(function (response) {
                var result = WebAssembly.instantiateStreaming(response, info);
                return result.then(receiveInstantiatedSource, function (reason) {
                    err("wasm streaming compile failed: " + reason);
                    err("falling back to ArrayBuffer instantiation");
                    instantiateArrayBuffer(receiveInstantiatedSource)
                })
            })
        } else {
            return instantiateArrayBuffer(receiveInstantiatedSource)
        }
    }

    if (Module["instantiateWasm"]) {
        try {
            var exports = Module["instantiateWasm"](info, receiveInstance);
            return exports
        } catch (e) {
            err("Module.instantiateWasm callback failed with error: " + e);
            return false
        }
    }
    instantiateAsync();
    return {}
}

__ATINIT__.push({
    func: function () {
        ___wasm_call_ctors()
    }
});

function demangle(func) {
    warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
    return func
}

function demangleAll(text) {
    var regex = /\b_Z[\w\d_]+/g;
    return text.replace(regex, function (x) {
        var y = demangle(x);
        return x === y ? x : y + " [" + x + "]"
    })
}

function jsStackTrace() {
    var err = new Error;
    if (!err.stack) {
        try {
            throw new Error
        } catch (e) {
            err = e
        }
        if (!err.stack) {
            return "(no stack trace available)"
        }
    }
    return err.stack.toString()
}

function stackTrace() {
    var js = jsStackTrace();
    if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
    return demangleAll(js)
}

function ___assert_fail(condition, filename, line, func) {
    abort("Assertion failed: " + UTF8ToString(condition) + ", at: " + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"])
}

function ___cxa_allocate_exception(size) {
    return _malloc(size)
}

var ___exception_infos = {};
var ___exception_last = 0;

function ___cxa_throw(ptr, type, destructor) {
    ___exception_infos[ptr] = {
        ptr: ptr,
        adjusted: [ptr],
        type: type,
        destructor: destructor,
        refcount: 0,
        caught: false,
        rethrown: false
    };
    ___exception_last = ptr;
    if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exceptions = 1
    } else {
        __ZSt18uncaught_exceptionv.uncaught_exceptions++
    }
    throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch."
}

function ___handle_stack_overflow() {
    abort("stack overflow")
}

function getShiftFromSize(size) {
    switch (size) {
        case 1:
            return 0;
        case 2:
            return 1;
        case 4:
            return 2;
        case 8:
            return 3;
        default:
            throw new TypeError("Unknown type size: " + size)
    }
}

function embind_init_charCodes() {
    var codes = new Array(256);
    for (var i = 0; i < 256; ++i) {
        codes[i] = String.fromCharCode(i)
    }
    embind_charCodes = codes
}

var embind_charCodes = undefined;

function readLatin1String(ptr) {
    var ret = "";
    var c = ptr;
    while (HEAPU8[c]) {
        ret += embind_charCodes[HEAPU8[c++]]
    }
    return ret
}

var awaitingDependencies = {};
var registeredTypes = {};
var typeDependencies = {};
var char_0 = 48;
var char_9 = 57;

function makeLegalFunctionName(name) {
    if (undefined === name) {
        return "_unknown"
    }
    name = name.replace(/[^a-zA-Z0-9_]/g, "$");
    var f = name.charCodeAt(0);
    if (f >= char_0 && f <= char_9) {
        return "_" + name
    } else {
        return name
    }
}

function createNamedFunction(name, body) {
    name = makeLegalFunctionName(name);
    return new Function("body", "return function " + name + "() {\n" + '    "use strict";' + "    return body.apply(this, arguments);\n" + "};\n")(body)
}

function extendError(baseErrorType, errorName) {
    var errorClass = createNamedFunction(errorName, function (message) {
        this.name = errorName;
        this.message = message;
        var stack = new Error(message).stack;
        if (stack !== undefined) {
            this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "")
        }
    });
    errorClass.prototype = Object.create(baseErrorType.prototype);
    errorClass.prototype.constructor = errorClass;
    errorClass.prototype.toString = function () {
        if (this.message === undefined) {
            return this.name
        } else {
            return this.name + ": " + this.message
        }
    };
    return errorClass
}

var BindingError = undefined;

function throwBindingError(message) {
    throw new BindingError(message)
}

var InternalError = undefined;

function throwInternalError(message) {
    throw new InternalError(message)
}

function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
    myTypes.forEach(function (type) {
        typeDependencies[type] = dependentTypes
    });

    function onComplete(typeConverters) {
        var myTypeConverters = getTypeConverters(typeConverters);
        if (myTypeConverters.length !== myTypes.length) {
            throwInternalError("Mismatched type converter count")
        }
        for (var i = 0; i < myTypes.length; ++i) {
            registerType(myTypes[i], myTypeConverters[i])
        }
    }

    var typeConverters = new Array(dependentTypes.length);
    var unregisteredTypes = [];
    var registered = 0;
    dependentTypes.forEach(function (dt, i) {
        if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt]
        } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt] = []
            }
            awaitingDependencies[dt].push(function () {
                typeConverters[i] = registeredTypes[dt];
                ++registered;
                if (registered === unregisteredTypes.length) {
                    onComplete(typeConverters)
                }
            })
        }
    });
    if (0 === unregisteredTypes.length) {
        onComplete(typeConverters)
    }
}

function registerType(rawType, registeredInstance, options) {
    options = options || {};
    if (!("argPackAdvance" in registeredInstance)) {
        throw new TypeError("registerType registeredInstance requires argPackAdvance")
    }
    var name = registeredInstance.name;
    if (!rawType) {
        throwBindingError('type "' + name + '" must have a positive integer typeid pointer')
    }
    if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
            return
        } else {
            throwBindingError("Cannot register type '" + name + "' twice")
        }
    }
    registeredTypes[rawType] = registeredInstance;
    delete typeDependencies[rawType];
    if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach(function (cb) {
            cb()
        })
    }
}

function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
    var shift = getShiftFromSize(size);
    name = readLatin1String(name);
    registerType(rawType, {
        name: name, "fromWireType": function (wt) {
            return !!wt
        }, "toWireType": function (destructors, o) {
            return o ? trueValue : falseValue
        }, "argPackAdvance": 8, "readValueFromPointer": function (pointer) {
            var heap;
            if (size === 1) {
                heap = HEAP8
            } else if (size === 2) {
                heap = HEAP16
            } else if (size === 4) {
                heap = HEAP32
            } else {
                throw new TypeError("Unknown boolean type size: " + name)
            }
            return this["fromWireType"](heap[pointer >> shift])
        }, destructorFunction: null
    })
}

function ClassHandle_isAliasOf(other) {
    if (!(this instanceof ClassHandle)) {
        return false
    }
    if (!(other instanceof ClassHandle)) {
        return false
    }
    var leftClass = this.$$.ptrType.registeredClass;
    var left = this.$$.ptr;
    var rightClass = other.$$.ptrType.registeredClass;
    var right = other.$$.ptr;
    while (leftClass.baseClass) {
        left = leftClass.upcast(left);
        leftClass = leftClass.baseClass
    }
    while (rightClass.baseClass) {
        right = rightClass.upcast(right);
        rightClass = rightClass.baseClass
    }
    return leftClass === rightClass && left === right
}

function shallowCopyInternalPointer(o) {
    return {
        count: o.count,
        deleteScheduled: o.deleteScheduled,
        preservePointerOnDelete: o.preservePointerOnDelete,
        ptr: o.ptr,
        ptrType: o.ptrType,
        smartPtr: o.smartPtr,
        smartPtrType: o.smartPtrType
    }
}

function throwInstanceAlreadyDeleted(obj) {
    function getInstanceTypeName(handle) {
        return handle.$$.ptrType.registeredClass.name
    }

    throwBindingError(getInstanceTypeName(obj) + " instance already deleted")
}

var finalizationGroup = false;

function detachFinalizer(handle) {
}

function runDestructor($$) {
    if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr)
    } else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr)
    }
}

function releaseClassHandle($$) {
    $$.count.value -= 1;
    var toDelete = 0 === $$.count.value;
    if (toDelete) {
        runDestructor($$)
    }
}

function attachFinalizer(handle) {
    if ("undefined" === typeof FinalizationGroup) {
        attachFinalizer = function (handle) {
            return handle
        };
        return handle
    }
    finalizationGroup = new FinalizationGroup(function (iter) {
        for (var result = iter.next(); !result.done; result = iter.next()) {
            var $$ = result.value;
            if (!$$.ptr) {
                console.warn("object already deleted: " + $$.ptr)
            } else {
                releaseClassHandle($$)
            }
        }
    });
    attachFinalizer = function (handle) {
        finalizationGroup.register(handle, handle.$$, handle.$$);
        return handle
    };
    detachFinalizer = function (handle) {
        finalizationGroup.unregister(handle.$$)
    };
    return attachFinalizer(handle)
}

function ClassHandle_clone() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this)
    }
    if (this.$$.preservePointerOnDelete) {
        this.$$.count.value += 1;
        return this
    } else {
        var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), {$$: {value: shallowCopyInternalPointer(this.$$)}}));
        clone.$$.count.value += 1;
        clone.$$.deleteScheduled = false;
        return clone
    }
}

function ClassHandle_delete() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this)
    }
    if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError("Object already scheduled for deletion")
    }
    detachFinalizer(this);
    releaseClassHandle(this.$$);
    if (!this.$$.preservePointerOnDelete) {
        this.$$.smartPtr = undefined;
        this.$$.ptr = undefined
    }
}

function ClassHandle_isDeleted() {
    return !this.$$.ptr
}

var delayFunction = undefined;
var deletionQueue = [];

function flushPendingDeletes() {
    while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj["delete"]()
    }
}

function ClassHandle_deleteLater() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this)
    }
    if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError("Object already scheduled for deletion")
    }
    deletionQueue.push(this);
    if (deletionQueue.length === 1 && delayFunction) {
        delayFunction(flushPendingDeletes)
    }
    this.$$.deleteScheduled = true;
    return this
}

function init_ClassHandle() {
    ClassHandle.prototype["isAliasOf"] = ClassHandle_isAliasOf;
    ClassHandle.prototype["clone"] = ClassHandle_clone;
    ClassHandle.prototype["delete"] = ClassHandle_delete;
    ClassHandle.prototype["isDeleted"] = ClassHandle_isDeleted;
    ClassHandle.prototype["deleteLater"] = ClassHandle_deleteLater
}

function ClassHandle() {
}

var registeredPointers = {};

function ensureOverloadTable(proto, methodName, humanName) {
    if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        proto[methodName] = function () {
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!")
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments)
        };
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc
    }
}

function exposePublicSymbol(name, value, numArguments) {
    if (Module.hasOwnProperty(name)) {
        if (undefined === numArguments || undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments]) {
            throwBindingError("Cannot register public name '" + name + "' twice")
        }
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
            throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!")
        }
        Module[name].overloadTable[numArguments] = value
    } else {
        Module[name] = value;
        if (undefined !== numArguments) {
            Module[name].numArguments = numArguments
        }
    }
}

function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
    this.name = name;
    this.constructor = constructor;
    this.instancePrototype = instancePrototype;
    this.rawDestructor = rawDestructor;
    this.baseClass = baseClass;
    this.getActualType = getActualType;
    this.upcast = upcast;
    this.downcast = downcast;
    this.pureVirtualFunctions = []
}

function upcastPointer(ptr, ptrClass, desiredClass) {
    while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
            throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name)
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass
    }
    return ptr
}

function constNoSmartPtrRawPointerToWireType(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError("null is not a valid " + this.name)
        }
        return 0
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name)
    }
    if (!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name)
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr
}

function genericPointerToWireType(destructors, handle) {
    var ptr;
    if (handle === null) {
        if (this.isReference) {
            throwBindingError("null is not a valid " + this.name)
        }
        if (this.isSmartPointer) {
            ptr = this.rawConstructor();
            if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr)
            }
            return ptr
        } else {
            return 0
        }
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name)
    }
    if (!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name)
    }
    if (!this.isConst && handle.$$.ptrType.isConst) {
        throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name)
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    if (this.isSmartPointer) {
        if (undefined === handle.$$.smartPtr) {
            throwBindingError("Passing raw pointer to smart pointer is illegal")
        }
        switch (this.sharingPolicy) {
            case 0:
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr
                } else {
                    throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name)
                }
                break;
            case 1:
                ptr = handle.$$.smartPtr;
                break;
            case 2:
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr
                } else {
                    var clonedHandle = handle["clone"]();
                    ptr = this.rawShare(ptr, __emval_register(function () {
                        clonedHandle["delete"]()
                    }));
                    if (destructors !== null) {
                        destructors.push(this.rawDestructor, ptr)
                    }
                }
                break;
            default:
                throwBindingError("Unsupporting sharing policy")
        }
    }
    return ptr
}

function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError("null is not a valid " + this.name)
        }
        return 0
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name)
    }
    if (!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name)
    }
    if (handle.$$.ptrType.isConst) {
        throwBindingError("Cannot convert argument of type " + handle.$$.ptrType.name + " to parameter type " + this.name)
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr
}

function simpleReadValueFromPointer(pointer) {
    return this["fromWireType"](HEAPU32[pointer >> 2])
}

function RegisteredPointer_getPointee(ptr) {
    if (this.rawGetPointee) {
        ptr = this.rawGetPointee(ptr)
    }
    return ptr
}

function RegisteredPointer_destructor(ptr) {
    if (this.rawDestructor) {
        this.rawDestructor(ptr)
    }
}

function RegisteredPointer_deleteObject(handle) {
    if (handle !== null) {
        handle["delete"]()
    }
}

function downcastPointer(ptr, ptrClass, desiredClass) {
    if (ptrClass === desiredClass) {
        return ptr
    }
    if (undefined === desiredClass.baseClass) {
        return null
    }
    var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
    if (rv === null) {
        return null
    }
    return desiredClass.downcast(rv)
}

function getInheritedInstanceCount() {
    return Object.keys(registeredInstances).length
}

function getLiveInheritedInstances() {
    var rv = [];
    for (var k in registeredInstances) {
        if (registeredInstances.hasOwnProperty(k)) {
            rv.push(registeredInstances[k])
        }
    }
    return rv
}

function setDelayFunction(fn) {
    delayFunction = fn;
    if (deletionQueue.length && delayFunction) {
        delayFunction(flushPendingDeletes)
    }
}

function init_embind() {
    Module["getInheritedInstanceCount"] = getInheritedInstanceCount;
    Module["getLiveInheritedInstances"] = getLiveInheritedInstances;
    Module["flushPendingDeletes"] = flushPendingDeletes;
    Module["setDelayFunction"] = setDelayFunction
}

var registeredInstances = {};

function getBasestPointer(class_, ptr) {
    if (ptr === undefined) {
        throwBindingError("ptr should not be undefined")
    }
    while (class_.baseClass) {
        ptr = class_.upcast(ptr);
        class_ = class_.baseClass
    }
    return ptr
}

function getInheritedInstance(class_, ptr) {
    ptr = getBasestPointer(class_, ptr);
    return registeredInstances[ptr]
}

function makeClassHandle(prototype, record) {
    if (!record.ptrType || !record.ptr) {
        throwInternalError("makeClassHandle requires ptr and ptrType")
    }
    var hasSmartPtrType = !!record.smartPtrType;
    var hasSmartPtr = !!record.smartPtr;
    if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError("Both smartPtrType and smartPtr must be specified")
    }
    record.count = {value: 1};
    return attachFinalizer(Object.create(prototype, {$$: {value: record}}))
}

function RegisteredPointer_fromWireType(ptr) {
    var rawPointer = this.getPointee(ptr);
    if (!rawPointer) {
        this.destructor(ptr);
        return null
    }
    var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
    if (undefined !== registeredInstance) {
        if (0 === registeredInstance.$$.count.value) {
            registeredInstance.$$.ptr = rawPointer;
            registeredInstance.$$.smartPtr = ptr;
            return registeredInstance["clone"]()
        } else {
            var rv = registeredInstance["clone"]();
            this.destructor(ptr);
            return rv
        }
    }

    function makeDefaultHandle() {
        if (this.isSmartPointer) {
            return makeClassHandle(this.registeredClass.instancePrototype, {
                ptrType: this.pointeeType,
                ptr: rawPointer,
                smartPtrType: this,
                smartPtr: ptr
            })
        } else {
            return makeClassHandle(this.registeredClass.instancePrototype, {ptrType: this, ptr: ptr})
        }
    }

    var actualType = this.registeredClass.getActualType(rawPointer);
    var registeredPointerRecord = registeredPointers[actualType];
    if (!registeredPointerRecord) {
        return makeDefaultHandle.call(this)
    }
    var toType;
    if (this.isConst) {
        toType = registeredPointerRecord.constPointerType
    } else {
        toType = registeredPointerRecord.pointerType
    }
    var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
    if (dp === null) {
        return makeDefaultHandle.call(this)
    }
    if (this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
            ptrType: toType,
            ptr: dp,
            smartPtrType: this,
            smartPtr: ptr
        })
    } else {
        return makeClassHandle(toType.registeredClass.instancePrototype, {ptrType: toType, ptr: dp})
    }
}

function init_RegisteredPointer() {
    RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
    RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
    RegisteredPointer.prototype["argPackAdvance"] = 8;
    RegisteredPointer.prototype["readValueFromPointer"] = simpleReadValueFromPointer;
    RegisteredPointer.prototype["deleteObject"] = RegisteredPointer_deleteObject;
    RegisteredPointer.prototype["fromWireType"] = RegisteredPointer_fromWireType
}

function RegisteredPointer(name, registeredClass, isReference, isConst, isSmartPointer, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor) {
    this.name = name;
    this.registeredClass = registeredClass;
    this.isReference = isReference;
    this.isConst = isConst;
    this.isSmartPointer = isSmartPointer;
    this.pointeeType = pointeeType;
    this.sharingPolicy = sharingPolicy;
    this.rawGetPointee = rawGetPointee;
    this.rawConstructor = rawConstructor;
    this.rawShare = rawShare;
    this.rawDestructor = rawDestructor;
    if (!isSmartPointer && registeredClass.baseClass === undefined) {
        if (isConst) {
            this["toWireType"] = constNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null
        } else {
            this["toWireType"] = nonConstNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null
        }
    } else {
        this["toWireType"] = genericPointerToWireType
    }
}

function replacePublicSymbol(name, value, numArguments) {
    if (!Module.hasOwnProperty(name)) {
        throwInternalError("Replacing nonexistant public symbol")
    }
    if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        Module[name].overloadTable[numArguments] = value
    } else {
        Module[name] = value;
        Module[name].argCount = numArguments
    }
}

function embind__requireFunction(signature, rawFunction) {
    signature = readLatin1String(signature);

    function makeDynCaller(dynCall) {
        var args = [];
        for (var i = 1; i < signature.length; ++i) {
            args.push("a" + i)
        }
        var name = "dynCall_" + signature + "_" + rawFunction;
        var body = "return function " + name + "(" + args.join(", ") + ") {\n";
        body += "    return dynCall(rawFunction" + (args.length ? ", " : "") + args.join(", ") + ");\n";
        body += "};\n";
        return new Function("dynCall", "rawFunction", body)(dynCall, rawFunction)
    }

    var fp;
    if (Module["FUNCTION_TABLE_" + signature] !== undefined) {
        fp = Module["FUNCTION_TABLE_" + signature][rawFunction]
    } else if (typeof FUNCTION_TABLE !== "undefined") {
        fp = FUNCTION_TABLE[rawFunction]
    } else {
        var dc = Module["dynCall_" + signature];
        if (dc === undefined) {
            dc = Module["dynCall_" + signature.replace(/f/g, "d")];
            if (dc === undefined) {
                throwBindingError("No dynCall invoker for signature: " + signature)
            }
        }
        fp = makeDynCaller(dc)
    }
    if (typeof fp !== "function") {
        throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction)
    }
    return fp
}

var UnboundTypeError = undefined;

function getTypeName(type) {
    var ptr = ___getTypeName(type);
    var rv = readLatin1String(ptr);
    _free(ptr);
    return rv
}

function throwUnboundTypeError(message, types) {
    var unboundTypes = [];
    var seen = {};

    function visit(type) {
        if (seen[type]) {
            return
        }
        if (registeredTypes[type]) {
            return
        }
        if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return
        }
        unboundTypes.push(type);
        seen[type] = true
    }

    types.forEach(visit);
    throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]))
}

function __embind_register_class(rawType, rawPointerType, rawConstPointerType, baseClassRawType, getActualTypeSignature, getActualType, upcastSignature, upcast, downcastSignature, downcast, name, destructorSignature, rawDestructor) {
    name = readLatin1String(name);
    getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
    if (upcast) {
        upcast = embind__requireFunction(upcastSignature, upcast)
    }
    if (downcast) {
        downcast = embind__requireFunction(downcastSignature, downcast)
    }
    rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
    var legalFunctionName = makeLegalFunctionName(name);
    exposePublicSymbol(legalFunctionName, function () {
        throwUnboundTypeError("Cannot construct " + name + " due to unbound types", [baseClassRawType])
    });
    whenDependentTypesAreResolved([rawType, rawPointerType, rawConstPointerType], baseClassRawType ? [baseClassRawType] : [], function (base) {
        base = base[0];
        var baseClass;
        var basePrototype;
        if (baseClassRawType) {
            baseClass = base.registeredClass;
            basePrototype = baseClass.instancePrototype
        } else {
            basePrototype = ClassHandle.prototype
        }
        var constructor = createNamedFunction(legalFunctionName, function () {
            if (Object.getPrototypeOf(this) !== instancePrototype) {
                throw new BindingError("Use 'new' to construct " + name)
            }
            if (undefined === registeredClass.constructor_body) {
                throw new BindingError(name + " has no accessible constructor")
            }
            var body = registeredClass.constructor_body[arguments.length];
            if (undefined === body) {
                throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!")
            }
            return body.apply(this, arguments)
        });
        var instancePrototype = Object.create(basePrototype, {constructor: {value: constructor}});
        constructor.prototype = instancePrototype;
        var registeredClass = new RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast);
        var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
        var pointerConverter = new RegisteredPointer(name + "*", registeredClass, false, false, false);
        var constPointerConverter = new RegisteredPointer(name + " const*", registeredClass, false, true, false);
        registeredPointers[rawType] = {pointerType: pointerConverter, constPointerType: constPointerConverter};
        replacePublicSymbol(legalFunctionName, constructor);
        return [referenceConverter, pointerConverter, constPointerConverter]
    })
}

function heap32VectorToArray(count, firstElement) {
    var array = [];
    for (var i = 0; i < count; i++) {
        array.push(HEAP32[(firstElement >> 2) + i])
    }
    return array
}

function runDestructors(destructors) {
    while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr)
    }
}

function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
    assert(argCount > 0);
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    invoker = embind__requireFunction(invokerSignature, invoker);
    var args = [rawConstructor];
    var destructors = [];
    whenDependentTypesAreResolved([], [rawClassType], function (classType) {
        classType = classType[0];
        var humanName = "constructor " + classType.name;
        if (undefined === classType.registeredClass.constructor_body) {
            classType.registeredClass.constructor_body = []
        }
        if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
            throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount - 1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!")
        }
        classType.registeredClass.constructor_body[argCount - 1] = function unboundTypeHandler() {
            throwUnboundTypeError("Cannot construct " + classType.name + " due to unbound types", rawArgTypes)
        };
        whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
            classType.registeredClass.constructor_body[argCount - 1] = function constructor_body() {
                if (arguments.length !== argCount - 1) {
                    throwBindingError(humanName + " called with " + arguments.length + " arguments, expected " + (argCount - 1))
                }
                destructors.length = 0;
                args.length = argCount;
                for (var i = 1; i < argCount; ++i) {
                    args[i] = argTypes[i]["toWireType"](destructors, arguments[i - 1])
                }
                var ptr = invoker.apply(null, args);
                runDestructors(destructors);
                return argTypes[0]["fromWireType"](ptr)
            };
            return []
        });
        return []
    })
}

function new_(constructor, argumentList) {
    if (!(constructor instanceof Function)) {
        throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function")
    }
    var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function () {
    });
    dummy.prototype = constructor.prototype;
    var obj = new dummy;
    var r = constructor.apply(obj, argumentList);
    return r instanceof Object ? r : obj
}

function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
    var argCount = argTypes.length;
    if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!")
    }
    var isClassMethodFunc = argTypes[1] !== null && classType !== null;
    var needsDestructorStack = false;
    for (var i = 1; i < argTypes.length; ++i) {
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
            needsDestructorStack = true;
            break
        }
    }
    var returns = argTypes[0].name !== "void";
    var argsList = "";
    var argsListWired = "";
    for (var i = 0; i < argCount - 2; ++i) {
        argsList += (i !== 0 ? ", " : "") + "arg" + i;
        argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired"
    }
    var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\n" + "if (arguments.length !== " + (argCount - 2) + ") {\n" + "throwBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n" + "}\n";
    if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n"
    }
    var dtorStack = needsDestructorStack ? "destructors" : "null";
    var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
    var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
    if (isClassMethodFunc) {
        invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n"
    }
    for (var i = 0; i < argCount - 2; ++i) {
        invokerFnBody += "var arg" + i + "Wired = argType" + i + ".toWireType(" + dtorStack + ", arg" + i + "); // " + argTypes[i + 2].name + "\n";
        args1.push("argType" + i);
        args2.push(argTypes[i + 2])
    }
    if (isClassMethodFunc) {
        argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired
    }
    invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
    if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n"
    } else {
        for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
            var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";
            if (argTypes[i].destructorFunction !== null) {
                invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i].name + "\n";
                args1.push(paramName + "_dtor");
                args2.push(argTypes[i].destructorFunction)
            }
        }
    }
    if (returns) {
        invokerFnBody += "var ret = retType.fromWireType(rv);\n" + "return ret;\n"
    } else {
    }
    invokerFnBody += "}\n";
    args1.push(invokerFnBody);
    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction
}

function __embind_register_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, context, isPureVirtual) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    methodName = readLatin1String(methodName);
    rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
    whenDependentTypesAreResolved([], [rawClassType], function (classType) {
        classType = classType[0];
        var humanName = classType.name + "." + methodName;
        if (isPureVirtual) {
            classType.registeredClass.pureVirtualFunctions.push(methodName)
        }

        function unboundTypesHandler() {
            throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes)
        }

        var proto = classType.registeredClass.instancePrototype;
        var method = proto[methodName];
        if (undefined === method || undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2) {
            unboundTypesHandler.argCount = argCount - 2;
            unboundTypesHandler.className = classType.name;
            proto[methodName] = unboundTypesHandler
        } else {
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler
        }
        whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
            var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
            if (undefined === proto[methodName].overloadTable) {
                memberFunction.argCount = argCount - 2;
                proto[methodName] = memberFunction
            } else {
                proto[methodName].overloadTable[argCount - 2] = memberFunction
            }
            return []
        });
        return []
    })
}

function validateThis(this_, classType, humanName) {
    if (!(this_ instanceof Object)) {
        throwBindingError(humanName + ' with invalid "this": ' + this_)
    }
    if (!(this_ instanceof classType.registeredClass.constructor)) {
        throwBindingError(humanName + ' incompatible with "this" of type ' + this_.constructor.name)
    }
    if (!this_.$$.ptr) {
        throwBindingError("cannot call emscripten binding method " + humanName + " on deleted object")
    }
    return upcastPointer(this_.$$.ptr, this_.$$.ptrType.registeredClass, classType.registeredClass)
}

function __embind_register_class_property(classType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) {
    fieldName = readLatin1String(fieldName);
    getter = embind__requireFunction(getterSignature, getter);
    whenDependentTypesAreResolved([], [classType], function (classType) {
        classType = classType[0];
        var humanName = classType.name + "." + fieldName;
        var desc = {
            get: function () {
                throwUnboundTypeError("Cannot access " + humanName + " due to unbound types", [getterReturnType, setterArgumentType])
            }, enumerable: true, configurable: true
        };
        if (setter) {
            desc.set = function () {
                throwUnboundTypeError("Cannot access " + humanName + " due to unbound types", [getterReturnType, setterArgumentType])
            }
        } else {
            desc.set = function (v) {
                throwBindingError(humanName + " is a read-only property")
            }
        }
        Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
        whenDependentTypesAreResolved([], setter ? [getterReturnType, setterArgumentType] : [getterReturnType], function (types) {
            var getterReturnType = types[0];
            var desc = {
                get: function () {
                    var ptr = validateThis(this, classType, humanName + " getter");
                    return getterReturnType["fromWireType"](getter(getterContext, ptr))
                }, enumerable: true
            };
            if (setter) {
                setter = embind__requireFunction(setterSignature, setter);
                var setterArgumentType = types[1];
                desc.set = function (v) {
                    var ptr = validateThis(this, classType, humanName + " setter");
                    var destructors = [];
                    setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, v));
                    runDestructors(destructors)
                }
            }
            Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
            return []
        });
        return []
    })
}

var emval_free_list = [];
var emval_handle_array = [{}, {value: undefined}, {value: null}, {value: true}, {value: false}];

function __emval_decref(handle) {
    if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
        emval_handle_array[handle] = undefined;
        emval_free_list.push(handle)
    }
}

function count_emval_handles() {
    var count = 0;
    for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
            ++count
        }
    }
    return count
}

function get_first_emval() {
    for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
            return emval_handle_array[i]
        }
    }
    return null
}

function init_emval() {
    Module["count_emval_handles"] = count_emval_handles;
    Module["get_first_emval"] = get_first_emval
}

function __emval_register(value) {
    switch (value) {
        case undefined: {
            return 1
        }
        case null: {
            return 2
        }
        case true: {
            return 3
        }
        case false: {
            return 4
        }
        default: {
            var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
            emval_handle_array[handle] = {refcount: 1, value: value};
            return handle
        }
    }
}

function __embind_register_emval(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name, "fromWireType": function (handle) {
            var rv = emval_handle_array[handle].value;
            __emval_decref(handle);
            return rv
        }, "toWireType": function (destructors, value) {
            return __emval_register(value)
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: null
    })
}

function _embind_repr(v) {
    if (v === null) {
        return "null"
    }
    var t = typeof v;
    if (t === "object" || t === "array" || t === "function") {
        return v.toString()
    } else {
        return "" + v
    }
}

function floatReadValueFromPointer(name, shift) {
    switch (shift) {
        case 2:
            return function (pointer) {
                return this["fromWireType"](HEAPF32[pointer >> 2])
            };
        case 3:
            return function (pointer) {
                return this["fromWireType"](HEAPF64[pointer >> 3])
            };
        default:
            throw new TypeError("Unknown float type: " + name)
    }
}

function __embind_register_float(rawType, name, size) {
    var shift = getShiftFromSize(size);
    name = readLatin1String(name);
    registerType(rawType, {
        name: name, "fromWireType": function (value) {
            return value
        }, "toWireType": function (destructors, value) {
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
            }
            return value
        }, "argPackAdvance": 8, "readValueFromPointer": floatReadValueFromPointer(name, shift), destructorFunction: null
    })
}

function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
    var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    name = readLatin1String(name);
    rawInvoker = embind__requireFunction(signature, rawInvoker);
    exposePublicSymbol(name, function () {
        throwUnboundTypeError("Cannot call " + name + " due to unbound types", argTypes)
    }, argCount - 1);
    whenDependentTypesAreResolved([], argTypes, function (argTypes) {
        var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
        replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn), argCount - 1);
        return []
    })
}

function integerReadValueFromPointer(name, shift, signed) {
    switch (shift) {
        case 0:
            return signed ? function readS8FromPointer(pointer) {
                return HEAP8[pointer]
            } : function readU8FromPointer(pointer) {
                return HEAPU8[pointer]
            };
        case 1:
            return signed ? function readS16FromPointer(pointer) {
                return HEAP16[pointer >> 1]
            } : function readU16FromPointer(pointer) {
                return HEAPU16[pointer >> 1]
            };
        case 2:
            return signed ? function readS32FromPointer(pointer) {
                return HEAP32[pointer >> 2]
            } : function readU32FromPointer(pointer) {
                return HEAPU32[pointer >> 2]
            };
        default:
            throw new TypeError("Unknown integer type: " + name)
    }
}

function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
    name = readLatin1String(name);
    if (maxRange === -1) {
        maxRange = 4294967295
    }
    var shift = getShiftFromSize(size);
    var fromWireType = function (value) {
        return value
    };
    if (minRange === 0) {
        var bitshift = 32 - 8 * size;
        fromWireType = function (value) {
            return value << bitshift >>> bitshift
        }
    }
    var isUnsignedType = name.indexOf("unsigned") != -1;
    registerType(primitiveType, {
        name: name,
        "fromWireType": fromWireType,
        "toWireType": function (destructors, value) {
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
            }
            if (value < minRange || value > maxRange) {
                throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ", " + maxRange + "]!")
            }
            return isUnsignedType ? value >>> 0 : value | 0
        },
        "argPackAdvance": 8,
        "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0),
        destructorFunction: null
    })
}

function __embind_register_memory_view(rawType, dataTypeIndex, name) {
    var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
    var TA = typeMapping[dataTypeIndex];

    function decodeMemoryView(handle) {
        handle = handle >> 2;
        var heap = HEAPU32;
        var size = heap[handle];
        var data = heap[handle + 1];
        return new TA(heap["buffer"], data, size)
    }

    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        "fromWireType": decodeMemoryView,
        "argPackAdvance": 8,
        "readValueFromPointer": decodeMemoryView
    }, {ignoreDuplicateRegistrations: true})
}

function __embind_register_std_string(rawType, name) {
    name = readLatin1String(name);
    var stdStringIsUTF8 = name === "std::string";
    registerType(rawType, {
        name: name, "fromWireType": function (value) {
            var length = HEAPU32[value >> 2];
            var str;
            if (stdStringIsUTF8) {
                var endChar = HEAPU8[value + 4 + length];
                var endCharSwap = 0;
                if (endChar != 0) {
                    endCharSwap = endChar;
                    HEAPU8[value + 4 + length] = 0
                }
                var decodeStartPtr = value + 4;
                for (var i = 0; i <= length; ++i) {
                    var currentBytePtr = value + 4 + i;
                    if (HEAPU8[currentBytePtr] == 0) {
                        var stringSegment = UTF8ToString(decodeStartPtr);
                        if (str === undefined) str = stringSegment; else {
                            str += String.fromCharCode(0);
                            str += stringSegment
                        }
                        decodeStartPtr = currentBytePtr + 1
                    }
                }
                if (endCharSwap != 0) HEAPU8[value + 4 + length] = endCharSwap
            } else {
                var a = new Array(length);
                for (var i = 0; i < length; ++i) {
                    a[i] = String.fromCharCode(HEAPU8[value + 4 + i])
                }
                str = a.join("")
            }
            _free(value);
            return str
        }, "toWireType": function (destructors, value) {
            if (value instanceof ArrayBuffer) {
                value = new Uint8Array(value)
            }
            var getLength;
            var valueIsOfTypeString = typeof value === "string";
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
                throwBindingError("Cannot pass non-string to std::string")
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
                getLength = function () {
                    return lengthBytesUTF8(value)
                }
            } else {
                getLength = function () {
                    return value.length
                }
            }
            var length = getLength();
            var ptr = _malloc(4 + length + 1);
            HEAPU32[ptr >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
                stringToUTF8(value, ptr + 4, length + 1)
            } else {
                if (valueIsOfTypeString) {
                    for (var i = 0; i < length; ++i) {
                        var charCode = value.charCodeAt(i);
                        if (charCode > 255) {
                            _free(ptr);
                            throwBindingError("String has UTF-16 code units that do not fit in 8 bits")
                        }
                        HEAPU8[ptr + 4 + i] = charCode
                    }
                } else {
                    for (var i = 0; i < length; ++i) {
                        HEAPU8[ptr + 4 + i] = value[i]
                    }
                }
            }
            if (destructors !== null) {
                destructors.push(_free, ptr)
            }
            return ptr
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function (ptr) {
            _free(ptr)
        }
    })
}

function __embind_register_std_wstring(rawType, charSize, name) {
    name = readLatin1String(name);
    var getHeap, shift;
    if (charSize === 2) {
        getHeap = function () {
            return HEAPU16
        };
        shift = 1
    } else if (charSize === 4) {
        getHeap = function () {
            return HEAPU32
        };
        shift = 2
    }
    registerType(rawType, {
        name: name, "fromWireType": function (value) {
            var HEAP = getHeap();
            var length = HEAPU32[value >> 2];
            var a = new Array(length);
            var start = value + 4 >> shift;
            for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAP[start + i])
            }
            _free(value);
            return a.join("")
        }, "toWireType": function (destructors, value) {
            var length = value.length;
            var ptr = _malloc(4 + length * charSize);
            var HEAP = getHeap();
            HEAPU32[ptr >> 2] = length;
            var start = ptr + 4 >> shift;
            for (var i = 0; i < length; ++i) {
                HEAP[start + i] = value.charCodeAt(i)
            }
            if (destructors !== null) {
                destructors.push(_free, ptr)
            }
            return ptr
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function (ptr) {
            _free(ptr)
        }
    })
}

function __embind_register_void(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        isVoid: true, name: name, "argPackAdvance": 0, "fromWireType": function () {
            return undefined
        }, "toWireType": function (destructors, o) {
            return undefined
        }
    })
}

function __emval_incref(handle) {
    if (handle > 4) {
        emval_handle_array[handle].refcount += 1
    }
}

function requireRegisteredType(rawType, humanName) {
    var impl = registeredTypes[rawType];
    if (undefined === impl) {
        throwBindingError(humanName + " has unknown type " + getTypeName(rawType))
    }
    return impl
}

function __emval_take_value(type, argv) {
    type = requireRegisteredType(type, "_emval_take_value");
    var v = type["readValueFromPointer"](argv);
    return __emval_register(v)
}

function _abort() {
    abort()
}

function _emscripten_get_now() {
    abort()
}

var _emscripten_get_now_is_monotonic = 0 || ENVIRONMENT_IS_NODE || typeof dateNow !== "undefined" || 1;

function ___setErrNo(value) {
    if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value; else err("failed to set errno from JS");
    return value
}

function _clock_gettime(clk_id, tp) {
    var now;
    if (clk_id === 0) {
        now = Date.now()
    } else if (clk_id === 1 && _emscripten_get_now_is_monotonic) {
        now = _emscripten_get_now()
    } else {
        ___setErrNo(28);
        return -1
    }
    HEAP32[tp >> 2] = now / 1e3 | 0;
    HEAP32[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0;
    return 0
}

function _emscripten_get_heap_size() {
    return HEAP8.length
}

function _emscripten_memcpy_big(dest, src, num) {
    HEAPU8.set(HEAPU8.subarray(src, src + num), dest)
}

function emscripten_realloc_buffer(size) {
    try {
        wasmMemory.grow(size - buffer.byteLength + 65535 >> 16);
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1
    } catch (e) {
        console.error("emscripten_realloc_buffer: Attempted to grow heap from " + buffer.byteLength + " bytes to " + size + " bytes, but got error: " + e)
    }
}

function _emscripten_resize_heap(requestedSize) {
    var oldSize = _emscripten_get_heap_size();
    assert(requestedSize > oldSize);
    var PAGE_MULTIPLE = 65536;
    var maxHeapSize = 2147483648 - PAGE_MULTIPLE;
    if (requestedSize > maxHeapSize) {
        err("Cannot enlarge memory, asked to go up to " + requestedSize + " bytes, but the limit is " + maxHeapSize + " bytes!");
        return false
    }
    var minHeapSize = 16777216;
    for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(minHeapSize, requestedSize, overGrownHeapSize), PAGE_MULTIPLE));
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
            return true
        }
    }
    err("Failed to grow the heap from " + oldSize + " bytes to " + newSize + " bytes, not enough memory!");
    return false
}

var PATH = {
    splitPath: function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1)
    }, normalizeArray: function (parts, allowAboveRoot) {
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === ".") {
                parts.splice(i, 1)
            } else if (last === "..") {
                parts.splice(i, 1);
                up++
            } else if (up) {
                parts.splice(i, 1);
                up--
            }
        }
        if (allowAboveRoot) {
            for (; up; up--) {
                parts.unshift("..")
            }
        }
        return parts
    }, normalize: function (path) {
        var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
        path = PATH.normalizeArray(path.split("/").filter(function (p) {
            return !!p
        }), !isAbsolute).join("/");
        if (!path && !isAbsolute) {
            path = "."
        }
        if (path && trailingSlash) {
            path += "/"
        }
        return (isAbsolute ? "/" : "") + path
    }, dirname: function (path) {
        var result = PATH.splitPath(path), root = result[0], dir = result[1];
        if (!root && !dir) {
            return "."
        }
        if (dir) {
            dir = dir.substr(0, dir.length - 1)
        }
        return root + dir
    }, basename: function (path) {
        if (path === "/") return "/";
        var lastSlash = path.lastIndexOf("/");
        if (lastSlash === -1) return path;
        return path.substr(lastSlash + 1)
    }, extname: function (path) {
        return PATH.splitPath(path)[3]
    }, join: function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join("/"))
    }, join2: function (l, r) {
        return PATH.normalize(l + "/" + r)
    }
};
var SYSCALLS = {
    buffers: [null, [], []], printChar: function (stream, curr) {
        var buffer = SYSCALLS.buffers[stream];
        assert(buffer);
        if (curr === 0 || curr === 10) {
            (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
            buffer.length = 0
        } else {
            buffer.push(curr)
        }
    }, varargs: 0, get: function (varargs) {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
        return ret
    }, getStr: function () {
        var ret = UTF8ToString(SYSCALLS.get());
        return ret
    }, get64: function () {
        var low = SYSCALLS.get(), high = SYSCALLS.get();
        if (low >= 0) assert(high === 0); else assert(high === -1);
        return low
    }, getZero: function () {
        assert(SYSCALLS.get() === 0)
    }
};

function _fd_write(fd, iov, iovcnt, pnum) {
    try {
        var num = 0;
        for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[iov + i * 8 >> 2];
            var len = HEAP32[iov + (i * 8 + 4) >> 2];
            for (var j = 0; j < len; j++) {
                SYSCALLS.printChar(fd, HEAPU8[ptr + j])
            }
            num += len
        }
        HEAP32[pnum >> 2] = num;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function _round(d) {
    d = +d;
    return d >= +0 ? +Math_floor(d + +.5) : +Math_ceil(d - +.5)
}

function _roundf(d) {
    d = +d;
    return d >= +0 ? +Math_floor(d + +.5) : +Math_ceil(d - +.5)
}

function _setTempRet0($i) {
    setTempRet0($i | 0)
}

embind_init_charCodes();
BindingError = Module["BindingError"] = extendError(Error, "BindingError");
InternalError = Module["InternalError"] = extendError(Error, "InternalError");
init_ClassHandle();
init_RegisteredPointer();
init_embind();
UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
init_emval();
if (ENVIRONMENT_IS_NODE) {
    _emscripten_get_now = function _emscripten_get_now_actual() {
        var t = process["hrtime"]();
        return t[0] * 1e3 + t[1] / 1e6
    }
} else if (typeof dateNow !== "undefined") {
    _emscripten_get_now = dateNow
} else _emscripten_get_now = function () {
    return performance["now"]()
};
var asmLibraryArg = {
    "__assert_fail": ___assert_fail,
    "__cxa_allocate_exception": ___cxa_allocate_exception,
    "__cxa_throw": ___cxa_throw,
    "__handle_stack_overflow": ___handle_stack_overflow,
    "_embind_register_bool": __embind_register_bool,
    "_embind_register_class": __embind_register_class,
    "_embind_register_class_constructor": __embind_register_class_constructor,
    "_embind_register_class_function": __embind_register_class_function,
    "_embind_register_class_property": __embind_register_class_property,
    "_embind_register_emval": __embind_register_emval,
    "_embind_register_float": __embind_register_float,
    "_embind_register_function": __embind_register_function,
    "_embind_register_integer": __embind_register_integer,
    "_embind_register_memory_view": __embind_register_memory_view,
    "_embind_register_std_string": __embind_register_std_string,
    "_embind_register_std_wstring": __embind_register_std_wstring,
    "_embind_register_void": __embind_register_void,
    "_emval_decref": __emval_decref,
    "_emval_incref": __emval_incref,
    "_emval_take_value": __emval_take_value,
    "abort": _abort,
    "clock_gettime": _clock_gettime,
    "emscripten_memcpy_big": _emscripten_memcpy_big,
    "emscripten_resize_heap": _emscripten_resize_heap,
    "fd_write": _fd_write,
    "memory": wasmMemory,
    "round": _round,
    "roundf": _roundf,
    "setTempRet0": _setTempRet0,
    "table": wasmTable
};
var asm = createWasm();
Module["asm"] = asm;
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["__wasm_call_ctors"].apply(null, arguments)
};
var _free = Module["_free"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["free"].apply(null, arguments)
};
var _malloc = Module["_malloc"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["malloc"].apply(null, arguments)
};
var ___errno_location = Module["___errno_location"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["__errno_location"].apply(null, arguments)
};
var __ZSt18uncaught_exceptionv = Module["__ZSt18uncaught_exceptionv"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_ZSt18uncaught_exceptionv"].apply(null, arguments)
};
var ___getTypeName = Module["___getTypeName"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["__getTypeName"].apply(null, arguments)
};
var ___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["__embind_register_native_and_builtin_types"].apply(null, arguments)
};
var ___set_stack_limit = Module["___set_stack_limit"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["__set_stack_limit"].apply(null, arguments)
};
var stackSave = Module["stackSave"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["stackSave"].apply(null, arguments)
};
var stackAlloc = Module["stackAlloc"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["stackAlloc"].apply(null, arguments)
};
var stackRestore = Module["stackRestore"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["stackRestore"].apply(null, arguments)
};
var dynCall_iiiii = Module["dynCall_iiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iiiii"].apply(null, arguments)
};
var dynCall_iiii = Module["dynCall_iiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iiii"].apply(null, arguments)
};
var dynCall_vi = Module["dynCall_vi"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_vi"].apply(null, arguments)
};
var dynCall_fi = Module["dynCall_fi"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_fi"].apply(null, arguments)
};
var dynCall_iiiif = Module["dynCall_iiiif"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iiiif"].apply(null, arguments)
};
var dynCall_ii = Module["dynCall_ii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_ii"].apply(null, arguments)
};
var dynCall_i = Module["dynCall_i"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_i"].apply(null, arguments)
};
var dynCall_iii = Module["dynCall_iii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iii"].apply(null, arguments)
};
var dynCall_viii = Module["dynCall_viii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viii"].apply(null, arguments)
};
var dynCall_fii = Module["dynCall_fii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_fii"].apply(null, arguments)
};
var dynCall_viif = Module["dynCall_viif"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viif"].apply(null, arguments)
};
var dynCall_vii = Module["dynCall_vii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_vii"].apply(null, arguments)
};
var dynCall_viiii = Module["dynCall_viiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viiii"].apply(null, arguments)
};
var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iiiiiii"].apply(null, arguments)
};
var dynCall_iiiiii = Module["dynCall_iiiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iiiiii"].apply(null, arguments)
};
var dynCall_iidiiii = Module["dynCall_iidiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iidiiii"].apply(null, arguments)
};
var dynCall_jiji = Module["dynCall_jiji"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_jiji"].apply(null, arguments)
};
var dynCall_viiiiii = Module["dynCall_viiiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viiiiii"].apply(null, arguments)
};
var dynCall_viiiii = Module["dynCall_viiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viiiii"].apply(null, arguments)
};
Module["asm"] = asm;
if (!Object.getOwnPropertyDescriptor(Module, "intArrayFromString")) Module["intArrayFromString"] = function () {
    abort("'intArrayFromString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "intArrayToString")) Module["intArrayToString"] = function () {
    abort("'intArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "ccall")) Module["ccall"] = function () {
    abort("'ccall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "cwrap")) Module["cwrap"] = function () {
    abort("'cwrap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "setValue")) Module["setValue"] = function () {
    abort("'setValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getValue")) Module["getValue"] = function () {
    abort("'getValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "allocate")) Module["allocate"] = function () {
    abort("'allocate' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getMemory")) Module["getMemory"] = function () {
    abort("'getMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "AsciiToString")) Module["AsciiToString"] = function () {
    abort("'AsciiToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stringToAscii")) Module["stringToAscii"] = function () {
    abort("'stringToAscii' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "UTF8ArrayToString")) Module["UTF8ArrayToString"] = function () {
    abort("'UTF8ArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "UTF8ToString")) Module["UTF8ToString"] = function () {
    abort("'UTF8ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8Array")) Module["stringToUTF8Array"] = function () {
    abort("'stringToUTF8Array' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8")) Module["stringToUTF8"] = function () {
    abort("'stringToUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF8")) Module["lengthBytesUTF8"] = function () {
    abort("'lengthBytesUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "UTF16ToString")) Module["UTF16ToString"] = function () {
    abort("'UTF16ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF16")) Module["stringToUTF16"] = function () {
    abort("'stringToUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF16")) Module["lengthBytesUTF16"] = function () {
    abort("'lengthBytesUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "UTF32ToString")) Module["UTF32ToString"] = function () {
    abort("'UTF32ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF32")) Module["stringToUTF32"] = function () {
    abort("'stringToUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF32")) Module["lengthBytesUTF32"] = function () {
    abort("'lengthBytesUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8")) Module["allocateUTF8"] = function () {
    abort("'allocateUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8OnStack")) Module["allocateUTF8OnStack"] = function () {
    abort("'allocateUTF8OnStack' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stackTrace")) Module["stackTrace"] = function () {
    abort("'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addOnPreRun")) Module["addOnPreRun"] = function () {
    abort("'addOnPreRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addOnInit")) Module["addOnInit"] = function () {
    abort("'addOnInit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addOnPreMain")) Module["addOnPreMain"] = function () {
    abort("'addOnPreMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addOnExit")) Module["addOnExit"] = function () {
    abort("'addOnExit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addOnPostRun")) Module["addOnPostRun"] = function () {
    abort("'addOnPostRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "writeStringToMemory")) Module["writeStringToMemory"] = function () {
    abort("'writeStringToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "writeArrayToMemory")) Module["writeArrayToMemory"] = function () {
    abort("'writeArrayToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "writeAsciiToMemory")) Module["writeAsciiToMemory"] = function () {
    abort("'writeAsciiToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addRunDependency")) Module["addRunDependency"] = function () {
    abort("'addRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "removeRunDependency")) Module["removeRunDependency"] = function () {
    abort("'removeRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "ENV")) Module["ENV"] = function () {
    abort("'ENV' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS")) Module["FS"] = function () {
    abort("'FS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createFolder")) Module["FS_createFolder"] = function () {
    abort("'FS_createFolder' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createPath")) Module["FS_createPath"] = function () {
    abort("'FS_createPath' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createDataFile")) Module["FS_createDataFile"] = function () {
    abort("'FS_createDataFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createPreloadedFile")) Module["FS_createPreloadedFile"] = function () {
    abort("'FS_createPreloadedFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createLazyFile")) Module["FS_createLazyFile"] = function () {
    abort("'FS_createLazyFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createLink")) Module["FS_createLink"] = function () {
    abort("'FS_createLink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_createDevice")) Module["FS_createDevice"] = function () {
    abort("'FS_createDevice' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "FS_unlink")) Module["FS_unlink"] = function () {
    abort("'FS_unlink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Object.getOwnPropertyDescriptor(Module, "GL")) Module["GL"] = function () {
    abort("'GL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "dynamicAlloc")) Module["dynamicAlloc"] = function () {
    abort("'dynamicAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "loadDynamicLibrary")) Module["loadDynamicLibrary"] = function () {
    abort("'loadDynamicLibrary' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "loadWebAssemblyModule")) Module["loadWebAssemblyModule"] = function () {
    abort("'loadWebAssemblyModule' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getLEB")) Module["getLEB"] = function () {
    abort("'getLEB' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getFunctionTables")) Module["getFunctionTables"] = function () {
    abort("'getFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "alignFunctionTables")) Module["alignFunctionTables"] = function () {
    abort("'alignFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "registerFunctions")) Module["registerFunctions"] = function () {
    abort("'registerFunctions' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "addFunction")) Module["addFunction"] = function () {
    abort("'addFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "removeFunction")) Module["removeFunction"] = function () {
    abort("'removeFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getFuncWrapper")) Module["getFuncWrapper"] = function () {
    abort("'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "prettyPrint")) Module["prettyPrint"] = function () {
    abort("'prettyPrint' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "makeBigInt")) Module["makeBigInt"] = function () {
    abort("'makeBigInt' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "dynCall")) Module["dynCall"] = function () {
    abort("'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getCompilerSetting")) Module["getCompilerSetting"] = function () {
    abort("'getCompilerSetting' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "print")) Module["print"] = function () {
    abort("'print' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "printErr")) Module["printErr"] = function () {
    abort("'printErr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "getTempRet0")) Module["getTempRet0"] = function () {
    abort("'getTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "setTempRet0")) Module["setTempRet0"] = function () {
    abort("'setTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "callMain")) Module["callMain"] = function () {
    abort("'callMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "abort")) Module["abort"] = function () {
    abort("'abort' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "warnOnce")) Module["warnOnce"] = function () {
    abort("'warnOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stackSave")) Module["stackSave"] = function () {
    abort("'stackSave' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stackRestore")) Module["stackRestore"] = function () {
    abort("'stackRestore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Object.getOwnPropertyDescriptor(Module, "stackAlloc")) Module["stackAlloc"] = function () {
    abort("'stackAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
Module["writeStackCookie"] = writeStackCookie;
Module["checkStackCookie"] = checkStackCookie;
Module["abortStackOverflow"] = abortStackOverflow;
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_NORMAL")) Object.defineProperty(Module, "ALLOC_NORMAL", {
    configurable: true,
    get: function () {
        abort("'ALLOC_NORMAL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
});
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_STACK")) Object.defineProperty(Module, "ALLOC_STACK", {
    configurable: true,
    get: function () {
        abort("'ALLOC_STACK' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
});
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_DYNAMIC")) Object.defineProperty(Module, "ALLOC_DYNAMIC", {
    configurable: true,
    get: function () {
        abort("'ALLOC_DYNAMIC' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
});
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_NONE")) Object.defineProperty(Module, "ALLOC_NONE", {
    configurable: true,
    get: function () {
        abort("'ALLOC_NONE' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
});
if (!Object.getOwnPropertyDescriptor(Module, "calledRun")) Object.defineProperty(Module, "calledRun", {
    configurable: true,
    get: function () {
        abort("'calledRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
    }
});
var calledRun;

function ExitStatus(status) {
    this.name = "ExitStatus";
    this.message = "Program terminated with exit(" + status + ")";
    this.status = status
}

dependenciesFulfilled = function runCaller() {
    if (!calledRun) run();
    if (!calledRun) dependenciesFulfilled = runCaller
};

function run(args) {
    args = args || arguments_;
    if (runDependencies > 0) {
        return
    }
    writeStackCookie();
    preRun();
    if (runDependencies > 0) return;

    function doRun() {
        if (calledRun) return;
        calledRun = true;
        if (ABORT) return;
        initRuntime();
        preMain();
        if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
        assert(!Module["_main"], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
        postRun()
    }

    if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function () {
            setTimeout(function () {
                Module["setStatus"]("")
            }, 1);
            doRun()
        }, 1)
    } else {
        doRun()
    }
    checkStackCookie()
}

Module["run"] = run;
if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
    while (Module["preInit"].length > 0) {
        Module["preInit"].pop()()
    }
}
noExitRuntime = true;
run();
