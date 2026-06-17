(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // (disabled):crypto
  var require_crypto = __commonJS({
    "(disabled):crypto"() {
    }
  });

  // (disabled):buffer
  var require_buffer = __commonJS({
    "(disabled):buffer"() {
    }
  });

  // node_modules/js-sha256/src/sha256.js
  var require_sha256 = __commonJS({
    "node_modules/js-sha256/src/sha256.js"(exports, module) {
      (function() {
        "use strict";
        var ERROR = "input is invalid type";
        var WINDOW = typeof window === "object";
        var root = WINDOW ? window : {};
        if (root.JS_SHA256_NO_WINDOW) {
          WINDOW = false;
        }
        var WEB_WORKER = !WINDOW && typeof self === "object";
        var NODE_JS = !root.JS_SHA256_NO_NODE_JS && typeof process === "object" && process.versions && process.versions.node && process.type != "renderer";
        if (NODE_JS) {
          root = global;
        } else if (WEB_WORKER) {
          root = self;
        }
        var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && typeof module === "object" && module.exports;
        var AMD = typeof define === "function" && define.amd;
        var ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== "undefined";
        var HEX_CHARS = "0123456789abcdef".split("");
        var EXTRA = [-2147483648, 8388608, 32768, 128];
        var SHIFT = [24, 16, 8, 0];
        var K = [
          1116352408,
          1899447441,
          3049323471,
          3921009573,
          961987163,
          1508970993,
          2453635748,
          2870763221,
          3624381080,
          310598401,
          607225278,
          1426881987,
          1925078388,
          2162078206,
          2614888103,
          3248222580,
          3835390401,
          4022224774,
          264347078,
          604807628,
          770255983,
          1249150122,
          1555081692,
          1996064986,
          2554220882,
          2821834349,
          2952996808,
          3210313671,
          3336571891,
          3584528711,
          113926993,
          338241895,
          666307205,
          773529912,
          1294757372,
          1396182291,
          1695183700,
          1986661051,
          2177026350,
          2456956037,
          2730485921,
          2820302411,
          3259730800,
          3345764771,
          3516065817,
          3600352804,
          4094571909,
          275423344,
          430227734,
          506948616,
          659060556,
          883997877,
          958139571,
          1322822218,
          1537002063,
          1747873779,
          1955562222,
          2024104815,
          2227730452,
          2361852424,
          2428436474,
          2756734187,
          3204031479,
          3329325298
        ];
        var OUTPUT_TYPES = ["hex", "array", "digest", "arrayBuffer"];
        var blocks = [];
        if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
          Array.isArray = function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
          };
        }
        if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
          ArrayBuffer.isView = function(obj) {
            return typeof obj === "object" && obj.buffer && obj.buffer.constructor === ArrayBuffer;
          };
        }
        var createOutputMethod = function(outputType, is224) {
          return function(message) {
            return new Sha256(is224, true).update(message)[outputType]();
          };
        };
        var createMethod = function(is224) {
          var method = createOutputMethod("hex", is224);
          if (NODE_JS) {
            method = nodeWrap(method, is224);
          }
          method.create = function() {
            return new Sha256(is224);
          };
          method.update = function(message) {
            return method.create().update(message);
          };
          for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
            var type = OUTPUT_TYPES[i];
            method[type] = createOutputMethod(type, is224);
          }
          return method;
        };
        var nodeWrap = function(method, is224) {
          var crypto = require_crypto();
          var Buffer2 = require_buffer().Buffer;
          var algorithm = is224 ? "sha224" : "sha256";
          var bufferFrom;
          if (Buffer2.from && !root.JS_SHA256_NO_BUFFER_FROM) {
            bufferFrom = Buffer2.from;
          } else {
            bufferFrom = function(message) {
              return new Buffer2(message);
            };
          }
          var nodeMethod = function(message) {
            if (typeof message === "string") {
              return crypto.createHash(algorithm).update(message, "utf8").digest("hex");
            } else {
              if (message === null || message === void 0) {
                throw new Error(ERROR);
              } else if (message.constructor === ArrayBuffer) {
                message = new Uint8Array(message);
              }
            }
            if (Array.isArray(message) || ArrayBuffer.isView(message) || message.constructor === Buffer2) {
              return crypto.createHash(algorithm).update(bufferFrom(message)).digest("hex");
            } else {
              return method(message);
            }
          };
          return nodeMethod;
        };
        var createHmacOutputMethod = function(outputType, is224) {
          return function(key, message) {
            return new HmacSha256(key, is224, true).update(message)[outputType]();
          };
        };
        var createHmacMethod = function(is224) {
          var method = createHmacOutputMethod("hex", is224);
          method.create = function(key) {
            return new HmacSha256(key, is224);
          };
          method.update = function(key, message) {
            return method.create(key).update(message);
          };
          for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
            var type = OUTPUT_TYPES[i];
            method[type] = createHmacOutputMethod(type, is224);
          }
          return method;
        };
        function Sha256(is224, sharedMemory) {
          if (sharedMemory) {
            blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
            this.blocks = blocks;
          } else {
            this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          }
          if (is224) {
            this.h0 = 3238371032;
            this.h1 = 914150663;
            this.h2 = 812702999;
            this.h3 = 4144912697;
            this.h4 = 4290775857;
            this.h5 = 1750603025;
            this.h6 = 1694076839;
            this.h7 = 3204075428;
          } else {
            this.h0 = 1779033703;
            this.h1 = 3144134277;
            this.h2 = 1013904242;
            this.h3 = 2773480762;
            this.h4 = 1359893119;
            this.h5 = 2600822924;
            this.h6 = 528734635;
            this.h7 = 1541459225;
          }
          this.block = this.start = this.bytes = this.hBytes = 0;
          this.finalized = this.hashed = false;
          this.first = true;
          this.is224 = is224;
        }
        Sha256.prototype.update = function(message) {
          if (this.finalized) {
            return;
          }
          var notString, type = typeof message;
          if (type !== "string") {
            if (type === "object") {
              if (message === null) {
                throw new Error(ERROR);
              } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
                message = new Uint8Array(message);
              } else if (!Array.isArray(message)) {
                if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
                  throw new Error(ERROR);
                }
              }
            } else {
              throw new Error(ERROR);
            }
            notString = true;
          }
          var code, index = 0, i, length = message.length, blocks2 = this.blocks;
          while (index < length) {
            if (this.hashed) {
              this.hashed = false;
              blocks2[0] = this.block;
              this.block = blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
            }
            if (notString) {
              for (i = this.start; index < length && i < 64; ++index) {
                blocks2[i >>> 2] |= message[index] << SHIFT[i++ & 3];
              }
            } else {
              for (i = this.start; index < length && i < 64; ++index) {
                code = message.charCodeAt(index);
                if (code < 128) {
                  blocks2[i >>> 2] |= code << SHIFT[i++ & 3];
                } else if (code < 2048) {
                  blocks2[i >>> 2] |= (192 | code >>> 6) << SHIFT[i++ & 3];
                  blocks2[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
                } else if (code < 55296 || code >= 57344) {
                  blocks2[i >>> 2] |= (224 | code >>> 12) << SHIFT[i++ & 3];
                  blocks2[i >>> 2] |= (128 | code >>> 6 & 63) << SHIFT[i++ & 3];
                  blocks2[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
                } else {
                  code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
                  blocks2[i >>> 2] |= (240 | code >>> 18) << SHIFT[i++ & 3];
                  blocks2[i >>> 2] |= (128 | code >>> 12 & 63) << SHIFT[i++ & 3];
                  blocks2[i >>> 2] |= (128 | code >>> 6 & 63) << SHIFT[i++ & 3];
                  blocks2[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
                }
              }
            }
            this.lastByteIndex = i;
            this.bytes += i - this.start;
            if (i >= 64) {
              this.block = blocks2[16];
              this.start = i - 64;
              this.hash();
              this.hashed = true;
            } else {
              this.start = i;
            }
          }
          if (this.bytes > 4294967295) {
            this.hBytes += this.bytes / 4294967296 << 0;
            this.bytes = this.bytes % 4294967296;
          }
          return this;
        };
        Sha256.prototype.finalize = function() {
          if (this.finalized) {
            return;
          }
          this.finalized = true;
          var blocks2 = this.blocks, i = this.lastByteIndex;
          blocks2[16] = this.block;
          blocks2[i >>> 2] |= EXTRA[i & 3];
          this.block = blocks2[16];
          if (i >= 56) {
            if (!this.hashed) {
              this.hash();
            }
            blocks2[0] = this.block;
            blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
          }
          blocks2[14] = this.hBytes << 3 | this.bytes >>> 29;
          blocks2[15] = this.bytes << 3;
          this.hash();
        };
        Sha256.prototype.hash = function() {
          var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6, h = this.h7, blocks2 = this.blocks, j, s0, s1, maj, t1, t2, ch, ab4, da2, cd2, bc4;
          for (j = 16; j < 64; ++j) {
            t1 = blocks2[j - 15];
            s0 = (t1 >>> 7 | t1 << 25) ^ (t1 >>> 18 | t1 << 14) ^ t1 >>> 3;
            t1 = blocks2[j - 2];
            s1 = (t1 >>> 17 | t1 << 15) ^ (t1 >>> 19 | t1 << 13) ^ t1 >>> 10;
            blocks2[j] = blocks2[j - 16] + s0 + blocks2[j - 7] + s1 << 0;
          }
          bc4 = b & c;
          for (j = 0; j < 64; j += 4) {
            if (this.first) {
              if (this.is224) {
                ab4 = 300032;
                t1 = blocks2[0] - 1413257819;
                h = t1 - 150054599 << 0;
                d = t1 + 24177077 << 0;
              } else {
                ab4 = 704751109;
                t1 = blocks2[0] - 210244248;
                h = t1 - 1521486534 << 0;
                d = t1 + 143694565 << 0;
              }
              this.first = false;
            } else {
              s0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
              s1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
              ab4 = a & b;
              maj = ab4 ^ a & c ^ bc4;
              ch = e & f ^ ~e & g;
              t1 = h + s1 + ch + K[j] + blocks2[j];
              t2 = s0 + maj;
              h = d + t1 << 0;
              d = t1 + t2 << 0;
            }
            s0 = (d >>> 2 | d << 30) ^ (d >>> 13 | d << 19) ^ (d >>> 22 | d << 10);
            s1 = (h >>> 6 | h << 26) ^ (h >>> 11 | h << 21) ^ (h >>> 25 | h << 7);
            da2 = d & a;
            maj = da2 ^ d & b ^ ab4;
            ch = h & e ^ ~h & f;
            t1 = g + s1 + ch + K[j + 1] + blocks2[j + 1];
            t2 = s0 + maj;
            g = c + t1 << 0;
            c = t1 + t2 << 0;
            s0 = (c >>> 2 | c << 30) ^ (c >>> 13 | c << 19) ^ (c >>> 22 | c << 10);
            s1 = (g >>> 6 | g << 26) ^ (g >>> 11 | g << 21) ^ (g >>> 25 | g << 7);
            cd2 = c & d;
            maj = cd2 ^ c & a ^ da2;
            ch = g & h ^ ~g & e;
            t1 = f + s1 + ch + K[j + 2] + blocks2[j + 2];
            t2 = s0 + maj;
            f = b + t1 << 0;
            b = t1 + t2 << 0;
            s0 = (b >>> 2 | b << 30) ^ (b >>> 13 | b << 19) ^ (b >>> 22 | b << 10);
            s1 = (f >>> 6 | f << 26) ^ (f >>> 11 | f << 21) ^ (f >>> 25 | f << 7);
            bc4 = b & c;
            maj = bc4 ^ b & d ^ cd2;
            ch = f & g ^ ~f & h;
            t1 = e + s1 + ch + K[j + 3] + blocks2[j + 3];
            t2 = s0 + maj;
            e = a + t1 << 0;
            a = t1 + t2 << 0;
            this.chromeBugWorkAround = true;
          }
          this.h0 = this.h0 + a << 0;
          this.h1 = this.h1 + b << 0;
          this.h2 = this.h2 + c << 0;
          this.h3 = this.h3 + d << 0;
          this.h4 = this.h4 + e << 0;
          this.h5 = this.h5 + f << 0;
          this.h6 = this.h6 + g << 0;
          this.h7 = this.h7 + h << 0;
        };
        Sha256.prototype.hex = function() {
          this.finalize();
          var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
          var hex = HEX_CHARS[h0 >>> 28 & 15] + HEX_CHARS[h0 >>> 24 & 15] + HEX_CHARS[h0 >>> 20 & 15] + HEX_CHARS[h0 >>> 16 & 15] + HEX_CHARS[h0 >>> 12 & 15] + HEX_CHARS[h0 >>> 8 & 15] + HEX_CHARS[h0 >>> 4 & 15] + HEX_CHARS[h0 & 15] + HEX_CHARS[h1 >>> 28 & 15] + HEX_CHARS[h1 >>> 24 & 15] + HEX_CHARS[h1 >>> 20 & 15] + HEX_CHARS[h1 >>> 16 & 15] + HEX_CHARS[h1 >>> 12 & 15] + HEX_CHARS[h1 >>> 8 & 15] + HEX_CHARS[h1 >>> 4 & 15] + HEX_CHARS[h1 & 15] + HEX_CHARS[h2 >>> 28 & 15] + HEX_CHARS[h2 >>> 24 & 15] + HEX_CHARS[h2 >>> 20 & 15] + HEX_CHARS[h2 >>> 16 & 15] + HEX_CHARS[h2 >>> 12 & 15] + HEX_CHARS[h2 >>> 8 & 15] + HEX_CHARS[h2 >>> 4 & 15] + HEX_CHARS[h2 & 15] + HEX_CHARS[h3 >>> 28 & 15] + HEX_CHARS[h3 >>> 24 & 15] + HEX_CHARS[h3 >>> 20 & 15] + HEX_CHARS[h3 >>> 16 & 15] + HEX_CHARS[h3 >>> 12 & 15] + HEX_CHARS[h3 >>> 8 & 15] + HEX_CHARS[h3 >>> 4 & 15] + HEX_CHARS[h3 & 15] + HEX_CHARS[h4 >>> 28 & 15] + HEX_CHARS[h4 >>> 24 & 15] + HEX_CHARS[h4 >>> 20 & 15] + HEX_CHARS[h4 >>> 16 & 15] + HEX_CHARS[h4 >>> 12 & 15] + HEX_CHARS[h4 >>> 8 & 15] + HEX_CHARS[h4 >>> 4 & 15] + HEX_CHARS[h4 & 15] + HEX_CHARS[h5 >>> 28 & 15] + HEX_CHARS[h5 >>> 24 & 15] + HEX_CHARS[h5 >>> 20 & 15] + HEX_CHARS[h5 >>> 16 & 15] + HEX_CHARS[h5 >>> 12 & 15] + HEX_CHARS[h5 >>> 8 & 15] + HEX_CHARS[h5 >>> 4 & 15] + HEX_CHARS[h5 & 15] + HEX_CHARS[h6 >>> 28 & 15] + HEX_CHARS[h6 >>> 24 & 15] + HEX_CHARS[h6 >>> 20 & 15] + HEX_CHARS[h6 >>> 16 & 15] + HEX_CHARS[h6 >>> 12 & 15] + HEX_CHARS[h6 >>> 8 & 15] + HEX_CHARS[h6 >>> 4 & 15] + HEX_CHARS[h6 & 15];
          if (!this.is224) {
            hex += HEX_CHARS[h7 >>> 28 & 15] + HEX_CHARS[h7 >>> 24 & 15] + HEX_CHARS[h7 >>> 20 & 15] + HEX_CHARS[h7 >>> 16 & 15] + HEX_CHARS[h7 >>> 12 & 15] + HEX_CHARS[h7 >>> 8 & 15] + HEX_CHARS[h7 >>> 4 & 15] + HEX_CHARS[h7 & 15];
          }
          return hex;
        };
        Sha256.prototype.toString = Sha256.prototype.hex;
        Sha256.prototype.digest = function() {
          this.finalize();
          var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
          var arr = [
            h0 >>> 24 & 255,
            h0 >>> 16 & 255,
            h0 >>> 8 & 255,
            h0 & 255,
            h1 >>> 24 & 255,
            h1 >>> 16 & 255,
            h1 >>> 8 & 255,
            h1 & 255,
            h2 >>> 24 & 255,
            h2 >>> 16 & 255,
            h2 >>> 8 & 255,
            h2 & 255,
            h3 >>> 24 & 255,
            h3 >>> 16 & 255,
            h3 >>> 8 & 255,
            h3 & 255,
            h4 >>> 24 & 255,
            h4 >>> 16 & 255,
            h4 >>> 8 & 255,
            h4 & 255,
            h5 >>> 24 & 255,
            h5 >>> 16 & 255,
            h5 >>> 8 & 255,
            h5 & 255,
            h6 >>> 24 & 255,
            h6 >>> 16 & 255,
            h6 >>> 8 & 255,
            h6 & 255
          ];
          if (!this.is224) {
            arr.push(h7 >>> 24 & 255, h7 >>> 16 & 255, h7 >>> 8 & 255, h7 & 255);
          }
          return arr;
        };
        Sha256.prototype.array = Sha256.prototype.digest;
        Sha256.prototype.arrayBuffer = function() {
          this.finalize();
          var buffer = new ArrayBuffer(this.is224 ? 28 : 32);
          var dataView = new DataView(buffer);
          dataView.setUint32(0, this.h0);
          dataView.setUint32(4, this.h1);
          dataView.setUint32(8, this.h2);
          dataView.setUint32(12, this.h3);
          dataView.setUint32(16, this.h4);
          dataView.setUint32(20, this.h5);
          dataView.setUint32(24, this.h6);
          if (!this.is224) {
            dataView.setUint32(28, this.h7);
          }
          return buffer;
        };
        function HmacSha256(key, is224, sharedMemory) {
          var i, type = typeof key;
          if (type === "string") {
            var bytes = [], length = key.length, index = 0, code;
            for (i = 0; i < length; ++i) {
              code = key.charCodeAt(i);
              if (code < 128) {
                bytes[index++] = code;
              } else if (code < 2048) {
                bytes[index++] = 192 | code >>> 6;
                bytes[index++] = 128 | code & 63;
              } else if (code < 55296 || code >= 57344) {
                bytes[index++] = 224 | code >>> 12;
                bytes[index++] = 128 | code >>> 6 & 63;
                bytes[index++] = 128 | code & 63;
              } else {
                code = 65536 + ((code & 1023) << 10 | key.charCodeAt(++i) & 1023);
                bytes[index++] = 240 | code >>> 18;
                bytes[index++] = 128 | code >>> 12 & 63;
                bytes[index++] = 128 | code >>> 6 & 63;
                bytes[index++] = 128 | code & 63;
              }
            }
            key = bytes;
          } else {
            if (type === "object") {
              if (key === null) {
                throw new Error(ERROR);
              } else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
                key = new Uint8Array(key);
              } else if (!Array.isArray(key)) {
                if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
                  throw new Error(ERROR);
                }
              }
            } else {
              throw new Error(ERROR);
            }
          }
          if (key.length > 64) {
            key = new Sha256(is224, true).update(key).array();
          }
          var oKeyPad = [], iKeyPad = [];
          for (i = 0; i < 64; ++i) {
            var b = key[i] || 0;
            oKeyPad[i] = 92 ^ b;
            iKeyPad[i] = 54 ^ b;
          }
          Sha256.call(this, is224, sharedMemory);
          this.update(iKeyPad);
          this.oKeyPad = oKeyPad;
          this.inner = true;
          this.sharedMemory = sharedMemory;
        }
        HmacSha256.prototype = new Sha256();
        HmacSha256.prototype.finalize = function() {
          Sha256.prototype.finalize.call(this);
          if (this.inner) {
            this.inner = false;
            var innerHash = this.array();
            Sha256.call(this, this.is224, this.sharedMemory);
            this.update(this.oKeyPad);
            this.update(innerHash);
            Sha256.prototype.finalize.call(this);
          }
        };
        var exports2 = createMethod();
        exports2.sha256 = exports2;
        exports2.sha224 = createMethod(true);
        exports2.sha256.hmac = createHmacMethod();
        exports2.sha224.hmac = createHmacMethod(true);
        if (COMMON_JS) {
          module.exports = exports2;
        } else {
          root.sha256 = exports2.sha256;
          root.sha224 = exports2.sha224;
          if (AMD) {
            define(function() {
              return exports2;
            });
          }
        }
      })();
    }
  });

  // content.js
  var import_js_sha256 = __toESM(require_sha256());

  // node_modules/@turf/helpers/dist/esm/index.js
  var earthRadius = 63710088e-1;
  var factors = {
    centimeters: earthRadius * 100,
    centimetres: earthRadius * 100,
    degrees: 360 / (2 * Math.PI),
    feet: earthRadius * 3.28084,
    inches: earthRadius * 39.37,
    kilometers: earthRadius / 1e3,
    kilometres: earthRadius / 1e3,
    meters: earthRadius,
    metres: earthRadius,
    miles: earthRadius / 1609.344,
    millimeters: earthRadius * 1e3,
    millimetres: earthRadius * 1e3,
    nauticalmiles: earthRadius / 1852,
    radians: 1,
    yards: earthRadius * 1.0936
  };
  function feature(geom, properties, options = {}) {
    const feat = { type: "Feature" };
    if (options.id === 0 || options.id) {
      feat.id = options.id;
    }
    if (options.bbox) {
      feat.bbox = options.bbox;
    }
    feat.properties = properties || {};
    feat.geometry = geom;
    return feat;
  }
  function point(coordinates, properties, options = {}) {
    if (!coordinates) {
      throw new Error("coordinates is required");
    }
    if (!Array.isArray(coordinates)) {
      throw new Error("coordinates must be an Array");
    }
    if (coordinates.length < 2) {
      throw new Error("coordinates must be at least 2 numbers long");
    }
    if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) {
      throw new Error("coordinates must contain numbers");
    }
    const geom = {
      type: "Point",
      coordinates
    };
    return feature(geom, properties, options);
  }
  function isNumber(num) {
    return !isNaN(num) && num !== null && !Array.isArray(num);
  }

  // node_modules/robust-predicates/esm/util.js
  var epsilon = 11102230246251565e-32;
  var splitter = 134217729;
  var resulterrbound = (3 + 8 * epsilon) * epsilon;
  function sum(elen, e, flen, f, h) {
    let Q, Qnew, hh, bvirt;
    let enow = e[0];
    let fnow = f[0];
    let eindex = 0;
    let findex = 0;
    if (fnow > enow === fnow > -enow) {
      Q = enow;
      enow = e[++eindex];
    } else {
      Q = fnow;
      fnow = f[++findex];
    }
    let hindex = 0;
    if (eindex < elen && findex < flen) {
      if (fnow > enow === fnow > -enow) {
        Qnew = enow + Q;
        hh = Q - (Qnew - enow);
        enow = e[++eindex];
      } else {
        Qnew = fnow + Q;
        hh = Q - (Qnew - fnow);
        fnow = f[++findex];
      }
      Q = Qnew;
      if (hh !== 0) {
        h[hindex++] = hh;
      }
      while (eindex < elen && findex < flen) {
        if (fnow > enow === fnow > -enow) {
          Qnew = Q + enow;
          bvirt = Qnew - Q;
          hh = Q - (Qnew - bvirt) + (enow - bvirt);
          enow = e[++eindex];
        } else {
          Qnew = Q + fnow;
          bvirt = Qnew - Q;
          hh = Q - (Qnew - bvirt) + (fnow - bvirt);
          fnow = f[++findex];
        }
        Q = Qnew;
        if (hh !== 0) {
          h[hindex++] = hh;
        }
      }
    }
    while (eindex < elen) {
      Qnew = Q + enow;
      bvirt = Qnew - Q;
      hh = Q - (Qnew - bvirt) + (enow - bvirt);
      enow = e[++eindex];
      Q = Qnew;
      if (hh !== 0) {
        h[hindex++] = hh;
      }
    }
    while (findex < flen) {
      Qnew = Q + fnow;
      bvirt = Qnew - Q;
      hh = Q - (Qnew - bvirt) + (fnow - bvirt);
      fnow = f[++findex];
      Q = Qnew;
      if (hh !== 0) {
        h[hindex++] = hh;
      }
    }
    if (Q !== 0 || hindex === 0) {
      h[hindex++] = Q;
    }
    return hindex;
  }
  function estimate(elen, e) {
    let Q = e[0];
    for (let i = 1; i < elen; i++) Q += e[i];
    return Q;
  }
  function vec(n) {
    return new Float64Array(n);
  }

  // node_modules/robust-predicates/esm/orient2d.js
  var ccwerrboundA = (3 + 16 * epsilon) * epsilon;
  var ccwerrboundB = (2 + 12 * epsilon) * epsilon;
  var ccwerrboundC = (9 + 64 * epsilon) * epsilon * epsilon;
  var B = vec(4);
  var C1 = vec(8);
  var C2 = vec(12);
  var D = vec(16);
  var u = vec(4);
  function orient2dadapt(ax, ay, bx, by, cx, cy, detsum) {
    let acxtail, acytail, bcxtail, bcytail;
    let bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u32;
    const acx = ax - cx;
    const bcx = bx - cx;
    const acy = ay - cy;
    const bcy = by - cy;
    s1 = acx * bcy;
    c = splitter * acx;
    ahi = c - (c - acx);
    alo = acx - ahi;
    c = splitter * bcy;
    bhi = c - (c - bcy);
    blo = bcy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acy * bcx;
    c = splitter * acy;
    ahi = c - (c - acy);
    alo = acy - ahi;
    c = splitter * bcx;
    bhi = c - (c - bcx);
    blo = bcx - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    B[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    B[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u32 = _j + _i;
    bvirt = u32 - _j;
    B[2] = _j - (u32 - bvirt) + (_i - bvirt);
    B[3] = u32;
    let det = estimate(4, B);
    let errbound = ccwerrboundB * detsum;
    if (det >= errbound || -det >= errbound) {
      return det;
    }
    bvirt = ax - acx;
    acxtail = ax - (acx + bvirt) + (bvirt - cx);
    bvirt = bx - bcx;
    bcxtail = bx - (bcx + bvirt) + (bvirt - cx);
    bvirt = ay - acy;
    acytail = ay - (acy + bvirt) + (bvirt - cy);
    bvirt = by - bcy;
    bcytail = by - (bcy + bvirt) + (bvirt - cy);
    if (acxtail === 0 && acytail === 0 && bcxtail === 0 && bcytail === 0) {
      return det;
    }
    errbound = ccwerrboundC * detsum + resulterrbound * Math.abs(det);
    det += acx * bcytail + bcy * acxtail - (acy * bcxtail + bcx * acytail);
    if (det >= errbound || -det >= errbound) return det;
    s1 = acxtail * bcy;
    c = splitter * acxtail;
    ahi = c - (c - acxtail);
    alo = acxtail - ahi;
    c = splitter * bcy;
    bhi = c - (c - bcy);
    blo = bcy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acytail * bcx;
    c = splitter * acytail;
    ahi = c - (c - acytail);
    alo = acytail - ahi;
    c = splitter * bcx;
    bhi = c - (c - bcx);
    blo = bcx - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    u[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u32 = _j + _i;
    bvirt = u32 - _j;
    u[2] = _j - (u32 - bvirt) + (_i - bvirt);
    u[3] = u32;
    const C1len = sum(4, B, 4, u, C1);
    s1 = acx * bcytail;
    c = splitter * acx;
    ahi = c - (c - acx);
    alo = acx - ahi;
    c = splitter * bcytail;
    bhi = c - (c - bcytail);
    blo = bcytail - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acy * bcxtail;
    c = splitter * acy;
    ahi = c - (c - acy);
    alo = acy - ahi;
    c = splitter * bcxtail;
    bhi = c - (c - bcxtail);
    blo = bcxtail - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    u[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u32 = _j + _i;
    bvirt = u32 - _j;
    u[2] = _j - (u32 - bvirt) + (_i - bvirt);
    u[3] = u32;
    const C2len = sum(C1len, C1, 4, u, C2);
    s1 = acxtail * bcytail;
    c = splitter * acxtail;
    ahi = c - (c - acxtail);
    alo = acxtail - ahi;
    c = splitter * bcytail;
    bhi = c - (c - bcytail);
    blo = bcytail - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acytail * bcxtail;
    c = splitter * acytail;
    ahi = c - (c - acytail);
    alo = acytail - ahi;
    c = splitter * bcxtail;
    bhi = c - (c - bcxtail);
    blo = bcxtail - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    u[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u32 = _j + _i;
    bvirt = u32 - _j;
    u[2] = _j - (u32 - bvirt) + (_i - bvirt);
    u[3] = u32;
    const Dlen = sum(C2len, C2, 4, u, D);
    return D[Dlen - 1];
  }
  function orient2d(ax, ay, bx, by, cx, cy) {
    const detleft = (ay - cy) * (bx - cx);
    const detright = (ax - cx) * (by - cy);
    const det = detleft - detright;
    const detsum = Math.abs(detleft + detright);
    if (Math.abs(det) >= ccwerrboundA * detsum) return det;
    return -orient2dadapt(ax, ay, bx, by, cx, cy, detsum);
  }

  // node_modules/robust-predicates/esm/orient3d.js
  var o3derrboundA = (7 + 56 * epsilon) * epsilon;
  var o3derrboundB = (3 + 28 * epsilon) * epsilon;
  var o3derrboundC = (26 + 288 * epsilon) * epsilon * epsilon;
  var bc = vec(4);
  var ca = vec(4);
  var ab = vec(4);
  var at_b = vec(4);
  var at_c = vec(4);
  var bt_c = vec(4);
  var bt_a = vec(4);
  var ct_a = vec(4);
  var ct_b = vec(4);
  var bct = vec(8);
  var cat = vec(8);
  var abt = vec(8);
  var u2 = vec(4);
  var _8 = vec(8);
  var _8b = vec(8);
  var _16 = vec(16);
  var _12 = vec(12);
  var fin = vec(192);
  var fin2 = vec(192);

  // node_modules/robust-predicates/esm/incircle.js
  var iccerrboundA = (10 + 96 * epsilon) * epsilon;
  var iccerrboundB = (4 + 48 * epsilon) * epsilon;
  var iccerrboundC = (44 + 576 * epsilon) * epsilon * epsilon;
  var bc2 = vec(4);
  var ca2 = vec(4);
  var ab2 = vec(4);
  var aa = vec(4);
  var bb = vec(4);
  var cc = vec(4);
  var u3 = vec(4);
  var v = vec(4);
  var axtbc = vec(8);
  var aytbc = vec(8);
  var bxtca = vec(8);
  var bytca = vec(8);
  var cxtab = vec(8);
  var cytab = vec(8);
  var abt2 = vec(8);
  var bct2 = vec(8);
  var cat2 = vec(8);
  var abtt = vec(4);
  var bctt = vec(4);
  var catt = vec(4);
  var _82 = vec(8);
  var _162 = vec(16);
  var _16b = vec(16);
  var _16c = vec(16);
  var _32 = vec(32);
  var _32b = vec(32);
  var _48 = vec(48);
  var _64 = vec(64);
  var fin3 = vec(1152);
  var fin22 = vec(1152);

  // node_modules/robust-predicates/esm/insphere.js
  var isperrboundA = (16 + 224 * epsilon) * epsilon;
  var isperrboundB = (5 + 72 * epsilon) * epsilon;
  var isperrboundC = (71 + 1408 * epsilon) * epsilon * epsilon;
  var ab3 = vec(4);
  var bc3 = vec(4);
  var cd = vec(4);
  var de = vec(4);
  var ea = vec(4);
  var ac = vec(4);
  var bd = vec(4);
  var ce = vec(4);
  var da = vec(4);
  var eb = vec(4);
  var abc = vec(24);
  var bcd = vec(24);
  var cde = vec(24);
  var dea = vec(24);
  var eab = vec(24);
  var abd = vec(24);
  var bce = vec(24);
  var cda = vec(24);
  var deb = vec(24);
  var eac = vec(24);
  var adet = vec(1152);
  var bdet = vec(1152);
  var cdet = vec(1152);
  var ddet = vec(1152);
  var edet = vec(1152);
  var abdet = vec(2304);
  var cddet = vec(2304);
  var cdedet = vec(3456);
  var deter = vec(5760);
  var _83 = vec(8);
  var _8b2 = vec(8);
  var _8c = vec(8);
  var _163 = vec(16);
  var _24 = vec(24);
  var _482 = vec(48);
  var _48b = vec(48);
  var _96 = vec(96);
  var _192 = vec(192);
  var _384x = vec(384);
  var _384y = vec(384);
  var _384z = vec(384);
  var _768 = vec(768);
  var xdet = vec(96);
  var ydet = vec(96);
  var zdet = vec(96);
  var fin4 = vec(1152);

  // node_modules/point-in-polygon-hao/dist/esm/index.js
  function pointInPolygon(p, polygon) {
    var i;
    var ii;
    var k = 0;
    var f;
    var u1;
    var v1;
    var u22;
    var v2;
    var currentP;
    var nextP;
    var x = p[0];
    var y = p[1];
    var numContours = polygon.length;
    for (i = 0; i < numContours; i++) {
      ii = 0;
      var contour = polygon[i];
      var contourLen = contour.length - 1;
      currentP = contour[0];
      if (currentP[0] !== contour[contourLen][0] && currentP[1] !== contour[contourLen][1]) {
        throw new Error("First and last coordinates in a ring must be the same");
      }
      u1 = currentP[0] - x;
      v1 = currentP[1] - y;
      for (ii; ii < contourLen; ii++) {
        nextP = contour[ii + 1];
        u22 = nextP[0] - x;
        v2 = nextP[1] - y;
        if (v1 === 0 && v2 === 0) {
          if (u22 <= 0 && u1 >= 0 || u1 <= 0 && u22 >= 0) {
            return 0;
          }
        } else if (v2 >= 0 && v1 <= 0 || v2 <= 0 && v1 >= 0) {
          f = orient2d(u1, u22, v1, v2, 0, 0);
          if (f === 0) {
            return 0;
          }
          if (f > 0 && v2 > 0 && v1 <= 0 || f < 0 && v2 <= 0 && v1 > 0) {
            k++;
          }
        }
        currentP = nextP;
        v1 = v2;
        u1 = u22;
      }
    }
    if (k % 2 === 0) {
      return false;
    }
    return true;
  }

  // node_modules/@turf/invariant/dist/esm/index.js
  function getCoord(coord) {
    if (!coord) {
      throw new Error("coord is required");
    }
    if (!Array.isArray(coord)) {
      if (coord.type === "Feature" && coord.geometry !== null && coord.geometry.type === "Point") {
        return [...coord.geometry.coordinates];
      }
      if (coord.type === "Point") {
        return [...coord.coordinates];
      }
    }
    if (Array.isArray(coord) && coord.length >= 2 && !Array.isArray(coord[0]) && !Array.isArray(coord[1])) {
      return [...coord];
    }
    throw new Error("coord must be GeoJSON Point or an Array of numbers");
  }
  function getGeom(geojson) {
    if (geojson.type === "Feature") {
      return geojson.geometry;
    }
    return geojson;
  }

  // node_modules/@turf/boolean-point-in-polygon/dist/esm/index.js
  function booleanPointInPolygon(point2, polygon, options = {}) {
    if (!point2) {
      throw new Error("point is required");
    }
    if (!polygon) {
      throw new Error("polygon is required");
    }
    const pt = getCoord(point2);
    const geom = getGeom(polygon);
    const type = geom.type;
    const bbox = polygon.bbox;
    let polys = geom.coordinates;
    if (bbox && inBBox(pt, bbox) === false) {
      return false;
    }
    if (type === "Polygon") {
      polys = [polys];
    }
    let result = false;
    for (var i = 0; i < polys.length; ++i) {
      const polyResult = pointInPolygon(pt, polys[i]);
      if (polyResult === 0) return options.ignoreBoundary ? false : true;
      else if (polyResult) result = true;
    }
    return result;
  }
  function inBBox(pt, bbox) {
    return bbox[0] <= pt[0] && bbox[1] <= pt[1] && bbox[2] >= pt[0] && bbox[3] >= pt[1];
  }

  // content.js
  var seenIds = /* @__PURE__ */ new Set();
  var seenImgs = /* @__PURE__ */ new Set();
  chrome.storage.local.get({ seenMessageIds: [], seenImages: [] }).then((result) => {
    seenIds = new Set(result.seenMessageIds);
    seenImgs = new Set(result.seenImages);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
  var coarseLocation = "waiting for coarse location...";
  var countriesFileUrl = chrome.runtime.getURL("World_Countries_(Generalized)_2173680399808997149.geojson");
  var statesFileUrl = chrome.runtime.getURL("us-states.json");
  var aqueductIdsFileUrl = chrome.runtime.getURL("CanUS_aqueduct_ids.geojson");
  var canadaProvincesFileUrl = chrome.runtime.getURL("canada_provinces.json");
  var countriesGeoJson = null;
  var statesGeoJson = null;
  var aqueductIdsGeoJson = null;
  var canadaProvincesJson = null;
  async function loadSpatialData() {
    const countriesResponse = await fetch(countriesFileUrl);
    countriesGeoJson = await countriesResponse.json();
    const statesResponse = await fetch(statesFileUrl);
    statesGeoJson = await statesResponse.json();
    const aqueductIdsResponse = await fetch(aqueductIdsFileUrl);
    aqueductIdsGeoJson = await aqueductIdsResponse.json();
    const canadaProvincesResponse = await fetch(canadaProvincesFileUrl);
    canadaProvincesJson = await canadaProvincesResponse.json();
    console.log("All spatial data loaded and ready.");
  }
  loadSpatialData();
  function getMessageId(container) {
    const text = container.innerText.trim();
    if (text.length < 250) {
      return (0, import_js_sha256.sha256)(text);
    } else {
      return (0, import_js_sha256.sha256)(text.substring(0, 250));
    }
  }
  var observer = new MutationObserver((mutations) => {
    const responseAnchors = document.querySelectorAll('p[data-is-last-node="true"], p[data-is-last-node=""]');
    responseAnchors.forEach((p) => {
      if (p) {
        const messageContainer = p.closest(".markdown");
        if (messageContainer && messageContainer.dataset.isProcessed === "true") {
          return;
        }
        if (messageContainer && !messageContainer._timer) {
          messageContainer._timer = setTimeout(async () => {
            while (coarseLocation === "waiting for coarse location...") {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
            while (!!document.querySelector('button[aria-label="Stop generating"]')) {
              await new Promise((resolve) => setTimeout(resolve, 1e3));
            }
            const messageID = getMessageId(messageContainer);
            if (!messageID || seenIds.has(messageID)) {
              const contents2 = messageContainer.innerText;
              messageContainer.dataset.isProcessed = "true";
              cleanupTimer(messageContainer);
              return;
            }
            seenIds.add(messageID);
            messageContainer.dataset.isProcessed = "true";
            chrome.storage.local.get({ seenMessageIds: [] }).then((result) => {
              const updatedArray = [.../* @__PURE__ */ new Set([...result.seenMessageIds, messageID])];
              chrome.storage.local.set({ seenMessageIds: updatedArray });
            });
            const contents = messageContainer.innerText;
            chrome.runtime.sendMessage({
              action: "COUNT_TOKENS",
              text: contents,
              location: coarseLocation
            });
            cleanupTimer(messageContainer);
          }, 5e3);
        }
      }
    });
    const imageAnchors = document.querySelectorAll('img[id^="_r_"]');
    imageAnchors.forEach((img) => {
      if (!img) {
        return;
      }
      ;
      img._timer = setTimeout(async () => {
        while (coarseLocation === "waiting for coarse location...") {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        while (!!document.querySelector('button[aria-label="Stop generating"]')) {
          await new Promise((resolve) => setTimeout(resolve, 1e3));
        }
        const imgWidth = img.width;
        const imgHeight = img.height;
        const urlObj = new URL(img.src);
        const fileId = urlObj.searchParams.get("id");
        if (!fileId || seenImgs.has(fileId)) {
          return;
        }
        seenImgs.add(fileId);
        chrome.storage.local.get({ seenImageIds: [] }).then((result) => {
          const updatedArray = [.../* @__PURE__ */ new Set([...result.seenImageIds, fileId])];
          chrome.storage.local.set({ seenImageIds: updatedArray });
        });
        chrome.runtime.sendMessage({
          action: "COUNT_IMAGES",
          height: imgHeight,
          width: imgWidth,
          location: coarseLocation
        });
      }, 5e3);
    });
  });
  function cleanupTimer(container) {
    if (container._timer) clearTimeout(container._timer);
    container._timer = null;
  }
  navigator.geolocation.watchPosition((position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const userCoords = [lng, lat];
    getLocation2(userCoords);
  });
  async function getLocation2(userCoords) {
    if (!countriesGeoJson || !statesGeoJson || !aqueductIdsGeoJson) {
      console.log("Spatial data still loading...");
      return;
    }
    const pt = point(userCoords);
    const foundCountry = countriesGeoJson.features.find(
      (country) => booleanPointInPolygon(pt, country)
    );
    if (!foundCountry) {
      console.log(`No country found for: ${userCoords}`);
      coarseLocation = "No country found";
      return;
    }
    coarseLocation = foundCountry.properties["COUNTRY"];
    if (foundCountry.properties["COUNTRY"] == "United States") {
      const foundState = statesGeoJson.features.find(
        (state) => booleanPointInPolygon(pt, state)
      );
      if (!foundState) {
        console.log(`No state found for ${userCoords}`);
        return;
      }
      coarseLocation += ", " + foundState.properties["name"];
    } else if (foundCountry.properties["COUNTRY"] == "Canada") {
      const foundProvince = canadaProvincesJson.features.find(
        (province) => booleanPointInPolygon(pt, province)
      );
      if (!foundProvince) {
        console.log(`No province found for ${userCoords}`);
        return;
      }
      coarseLocation += ", " + foundProvince.properties["name"];
    } else {
      coarseLocation += ", ";
    }
    if (foundCountry.properties["COUNTRY"] == "Canada" || foundCountry.properties["COUNTRY"] == "United States") {
      const watershedId = aqueductIdsGeoJson.features.find(
        (string_id) => booleanPointInPolygon(pt, string_id)
      );
      if (!watershedId) {
        console.log(`No watershed id found for ${userCoords}`);
        return;
      }
      coarseLocation += ", " + watershedId.properties["string_id"];
    }
  }
})();
/*! Bundled license information:

js-sha256/src/sha256.js:
  (**
   * [js-sha256]{@link https://github.com/emn178/js-sha256}
   *
   * @version 0.11.1
   * @author Chen, Yi-Cyuan [emn178@gmail.com]
   * @copyright Chen, Yi-Cyuan 2014-2025
   * @license MIT
   *)
*/
