var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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

// node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "node_modules/base64-js/index.js"(exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    var i;
    var len;
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1) validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
        );
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
        );
      }
      return parts.join("");
    }
  }
});

// node_modules/js-tiktoken/dist/chunk-VL2OQCWN.js
var import_base64_js = __toESM(require_base64_js(), 1);
var __defProp2 = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
function bytePairMerge(piece, ranks) {
  let parts = Array.from(
    { length: piece.length },
    (_, i) => ({ start: i, end: i + 1 })
  );
  while (parts.length > 1) {
    let minRank = null;
    for (let i = 0; i < parts.length - 1; i++) {
      const slice = piece.slice(parts[i].start, parts[i + 1].end);
      const rank = ranks.get(slice.join(","));
      if (rank == null)
        continue;
      if (minRank == null || rank < minRank[0]) {
        minRank = [rank, i];
      }
    }
    if (minRank != null) {
      const i = minRank[1];
      parts[i] = { start: parts[i].start, end: parts[i + 1].end };
      parts.splice(i + 1, 1);
    } else {
      break;
    }
  }
  return parts;
}
function bytePairEncode(piece, ranks) {
  if (piece.length === 1)
    return [ranks.get(piece.join(","))];
  return bytePairMerge(piece, ranks).map((p) => ranks.get(piece.slice(p.start, p.end).join(","))).filter((x) => x != null);
}
function escapeRegex(str) {
  return str.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
}
var _Tiktoken = class {
  /** @internal */
  specialTokens;
  /** @internal */
  inverseSpecialTokens;
  /** @internal */
  patStr;
  /** @internal */
  textEncoder = new TextEncoder();
  /** @internal */
  textDecoder = new TextDecoder("utf-8");
  /** @internal */
  rankMap = /* @__PURE__ */ new Map();
  /** @internal */
  textMap = /* @__PURE__ */ new Map();
  constructor(ranks, extendedSpecialTokens) {
    this.patStr = ranks.pat_str;
    const uncompressed = ranks.bpe_ranks.split("\n").filter(Boolean).reduce((memo, x) => {
      const [_, offsetStr, ...tokens] = x.split(" ");
      const offset = Number.parseInt(offsetStr, 10);
      tokens.forEach((token, i) => memo[token] = offset + i);
      return memo;
    }, {});
    for (const [token, rank] of Object.entries(uncompressed)) {
      const bytes = import_base64_js.default.toByteArray(token);
      this.rankMap.set(bytes.join(","), rank);
      this.textMap.set(rank, bytes);
    }
    this.specialTokens = { ...ranks.special_tokens, ...extendedSpecialTokens };
    this.inverseSpecialTokens = Object.entries(this.specialTokens).reduce((memo, [text, rank]) => {
      memo[rank] = this.textEncoder.encode(text);
      return memo;
    }, {});
  }
  encode(text, allowedSpecial = [], disallowedSpecial = "all") {
    const regexes = new RegExp(this.patStr, "ug");
    const specialRegex = _Tiktoken.specialTokenRegex(
      Object.keys(this.specialTokens)
    );
    const ret = [];
    const allowedSpecialSet = new Set(
      allowedSpecial === "all" ? Object.keys(this.specialTokens) : allowedSpecial
    );
    const disallowedSpecialSet = new Set(
      disallowedSpecial === "all" ? Object.keys(this.specialTokens).filter(
        (x) => !allowedSpecialSet.has(x)
      ) : disallowedSpecial
    );
    if (disallowedSpecialSet.size > 0) {
      const disallowedSpecialRegex = _Tiktoken.specialTokenRegex([
        ...disallowedSpecialSet
      ]);
      const specialMatch = text.match(disallowedSpecialRegex);
      if (specialMatch != null) {
        throw new Error(
          `The text contains a special token that is not allowed: ${specialMatch[0]}`
        );
      }
    }
    let start = 0;
    while (true) {
      let nextSpecial = null;
      let startFind = start;
      while (true) {
        specialRegex.lastIndex = startFind;
        nextSpecial = specialRegex.exec(text);
        if (nextSpecial == null || allowedSpecialSet.has(nextSpecial[0]))
          break;
        startFind = nextSpecial.index + 1;
      }
      const end = nextSpecial?.index ?? text.length;
      for (const match of text.substring(start, end).matchAll(regexes)) {
        const piece = this.textEncoder.encode(match[0]);
        const token2 = this.rankMap.get(piece.join(","));
        if (token2 != null) {
          ret.push(token2);
          continue;
        }
        ret.push(...bytePairEncode(piece, this.rankMap));
      }
      if (nextSpecial == null)
        break;
      let token = this.specialTokens[nextSpecial[0]];
      ret.push(token);
      start = nextSpecial.index + nextSpecial[0].length;
    }
    return ret;
  }
  decode(tokens) {
    const res = [];
    let length = 0;
    for (let i2 = 0; i2 < tokens.length; ++i2) {
      const token = tokens[i2];
      const bytes = this.textMap.get(token) ?? this.inverseSpecialTokens[token];
      if (bytes != null) {
        res.push(bytes);
        length += bytes.length;
      }
    }
    const mergedArray = new Uint8Array(length);
    let i = 0;
    for (const bytes of res) {
      mergedArray.set(bytes, i);
      i += bytes.length;
    }
    return this.textDecoder.decode(mergedArray);
  }
};
var Tiktoken = _Tiktoken;
__publicField(Tiktoken, "specialTokenRegex", (tokens) => {
  return new RegExp(tokens.map((i) => escapeRegex(i)).join("|"), "g");
});

// popup.js
var getModel = document.getElementById("getModel");
var list = document.getElementById("response");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let responses = request.contents;
  if (responses == null || responses.length == 0) {
    let li = document.createElement("li");
    li.innerText = "No response Found";
    list.appendChild(li);
  } else {
    let li = document.createElement("li");
    li.innerText = responses;
    list.appendChild(li);
  }
});
getModel.addEventListener("click", async () => {
  console.log("Button clicked");
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  alert("1");
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrapeModelResponse
  });
});
function scrapeModelResponse() {
  const response = document.querySelectorAll("p");
  const contents = Array.from(response).map((p) => p.textContent).join(" ");
  chrome.runtime.sendMessage({ contents });
}
