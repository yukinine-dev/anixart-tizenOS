var QRCode = (function() {
  var EXP = [], LOG = [];
  (function() {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 256) x ^= 0x11d;
    }
    EXP[255] = EXP[0];
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[(LOG[a] + LOG[b]) % 255];
  }

  function rsGenPoly(n) {
    var poly = [1];
    for (var i = 0; i < n; i++) {
      var next = new Array(poly.length + 1);
      for (var j = 0; j < next.length; j++) next[j] = 0;
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= gfMul(poly[j], EXP[i]);
        next[j + 1] ^= poly[j];
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(data, ecLen) {
    var gen = rsGenPoly(ecLen);
    var msg = new Array(data.length + ecLen);
    for (var i = 0; i < msg.length; i++) msg[i] = 0;
    for (var i = 0; i < data.length; i++) msg[i] = data[i];

    for (var i = 0; i < data.length; i++) {
      var coef = msg[i];
      if (coef === 0) continue;
      for (var j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
    return msg.slice(data.length);
  }

  var EC_CODEWORDS = [
    0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 28
  ];
  var DATA_CAPACITY = [
    0, 16, 28, 44, 64, 86, 108, 124, 154, 182, 216
  ];
  var NUM_BLOCKS = [
    0, 1, 1, 1, 2, 2, 4, 4, 4, 4, 6
  ];
  var ALIGN_POS = [
    [],[], [6,18], [6,22], [6,26], [6,30], [6,34],
    [6,22,38], [6,24,42], [6,26,46], [6,28,50]
  ];

  function bestVersion(dataLen) {
    var byteLen = dataLen + 3;
    for (var v = 1; v <= 10; v++) {
      if (DATA_CAPACITY[v] >= byteLen) return v;
    }
    return 10;
  }

  function encodeBytes(text) {
    var bytes = [];
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if (c < 128) {
        bytes.push(c);
      } else if (c < 2048) {
        bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      } else {
        bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      }
    }
    return bytes;
  }

  function encodeData(text, version) {
    var raw = encodeBytes(text);
    var capacity = DATA_CAPACITY[version];
    var bits = [];

    function pushBits(val, len) {
      for (var i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
    }

    pushBits(4, 4);
    pushBits(raw.length, version <= 9 ? 8 : 16);
    for (var i = 0; i < raw.length; i++) pushBits(raw[i], 8);

    var totalBits = capacity * 8;
    var termLen = Math.min(4, totalBits - bits.length);
    pushBits(0, termLen);

    while (bits.length % 8 !== 0) bits.push(0);

    var padBytes = [0xec, 0x11];
    var pi = 0;
    while (bits.length < totalBits) {
      pushBits(padBytes[pi % 2], 8);
      pi++;
    }

    var data = [];
    for (var i = 0; i < bits.length; i += 8) {
      var b = 0;
      for (var j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      data.push(b);
    }
    return data;
  }

  function buildCodewords(data, version) {
    var ecPerBlock = EC_CODEWORDS[version];
    var numBlocks = NUM_BLOCKS[version];
    var totalData = DATA_CAPACITY[version];
    var shortBlockLen = Math.floor(totalData / numBlocks);
    var longBlocks = totalData % numBlocks;
    var shortBlocks = numBlocks - longBlocks;

    var blocks = [];
    var offset = 0;
    for (var i = 0; i < numBlocks; i++) {
      var len = shortBlockLen + (i >= shortBlocks ? 1 : 0);
      blocks.push(data.slice(offset, offset + len));
      offset += len;
    }

    var ecBlocks = [];
    for (var i = 0; i < numBlocks; i++) {
      ecBlocks.push(rsEncode(blocks[i], ecPerBlock));
    }

    var result = [];
    var maxDataLen = shortBlockLen + (longBlocks > 0 ? 1 : 0);
    for (var col = 0; col < maxDataLen; col++) {
      for (var i = 0; i < numBlocks; i++) {
        if (col < blocks[i].length) result.push(blocks[i][col]);
      }
    }
    for (var col = 0; col < ecPerBlock; col++) {
      for (var i = 0; i < numBlocks; i++) {
        result.push(ecBlocks[i][col]);
      }
    }
    return result;
  }

  function createMatrix(size) {
    var m = [];
    for (var r = 0; r < size; r++) {
      m[r] = [];
      for (var c = 0; c < size; c++) {
        m[r][c] = -1;
      }
    }
    return m;
  }

  function setModule(m, r, c, val) {
    if (r >= 0 && r < m.length && c >= 0 && c < m.length) m[r][c] = val;
  }

  function placeFinder(m, row, col) {
    for (var dr = -1; dr <= 7; dr++) {
      for (var dc = -1; dc <= 7; dc++) {
        var r = row + dr, c = col + dc;
        if (r < 0 || r >= m.length || c < 0 || c >= m.length) continue;
        var inOuter = dr === -1 || dr === 7 || dc === -1 || dc === 7;
        var inBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        var inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setModule(m, r, c, (inBorder || inInner) && !inOuter ? 1 : 0);
      }
    }
  }

  function placeAlignment(m, row, col) {
    for (var dr = -2; dr <= 2; dr++) {
      for (var dc = -2; dc <= 2; dc++) {
        var v = (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) ? 1 : 0;
        setModule(m, row + dr, col + dc, v);
      }
    }
  }

  function placePatterns(m, version) {
    var size = m.length;
    placeFinder(m, 0, 0);
    placeFinder(m, 0, size - 7);
    placeFinder(m, size - 7, 0);

    for (var i = 8; i < size - 8; i++) {
      if (m[6][i] === -1) m[6][i] = i % 2 === 0 ? 1 : 0;
      if (m[i][6] === -1) m[i][6] = i % 2 === 0 ? 1 : 0;
    }

    var ap = ALIGN_POS[version];
    if (ap.length > 0) {
      for (var i = 0; i < ap.length; i++) {
        for (var j = 0; j < ap.length; j++) {
          if ((i === 0 && j === 0) || (i === 0 && j === ap.length - 1) ||
              (i === ap.length - 1 && j === 0)) continue;
          if (m[ap[i]][ap[j]] === -1) {
            placeAlignment(m, ap[i], ap[j]);
          }
        }
      }
    }

    m[size - 8][8] = 1;

    for (var i = 0; i < 9; i++) {
      if (m[8][i] === -1) m[8][i] = 0;
      if (m[i][8] === -1) m[i][8] = 0;
      if (i < 8) {
        if (m[8][size - 1 - i] === -1) m[8][size - 1 - i] = 0;
        if (m[size - 1 - i][8] === -1) m[size - 1 - i][8] = 0;
      }
    }
  }

  function placeData(m, codewords) {
    var size = m.length;
    var bitIdx = 0;
    var totalBits = codewords.length * 8;

    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var j = 0; j < 2; j++) {
          var col = right - j;
          var upward = ((right + 1) / 2 | 0) % 2 === (size > 25 ? 0 : 1);
          if (right <= 6) upward = ((right) / 2 | 0) % 2 === 0;
          upward = Math.floor((size - 1 - right) / 2) % 2 === 0;
          var row = upward ? size - 1 - vert : vert;
          if (m[row][col] !== -1) continue;
          if (bitIdx < totalBits) {
            m[row][col] = (codewords[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1;
            bitIdx++;
          } else {
            m[row][col] = 0;
          }
        }
      }
    }
  }

  var MASK_FNS = [
    function(r, c) { return (r + c) % 2 === 0; },
    function(r, c) { return r % 2 === 0; },
    function(r, c) { return c % 3 === 0; },
    function(r, c) { return (r + c) % 3 === 0; },
    function(r, c) { return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; },
    function(r, c) { return (r * c) % 2 + (r * c) % 3 === 0; },
    function(r, c) { return ((r * c) % 2 + (r * c) % 3) % 2 === 0; },
    function(r, c) { return ((r + c) % 2 + (r * c) % 3) % 2 === 0; }
  ];

  function applyMask(m, base, maskNum) {
    var size = m.length;
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        m[r][c] = base[r][c];
      }
    }
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (base[r][c] === -1) continue;
        var isData = true;
        if (r <= 8 && c <= 8) isData = false;
        if (r <= 8 && c >= size - 8) isData = false;
        if (r >= size - 8 && c <= 8) isData = false;
        if (r === 6 || c === 6) isData = false;
        if (!isData) continue;
        // just check if it was -1 in the original pattern placement
      }
    }
  }

  function copyMatrix(m) {
    var copy = [];
    for (var r = 0; r < m.length; r++) {
      copy[r] = m[r].slice();
    }
    return copy;
  }

  function isDataModule(m, patternMatrix, r, c) {
    return patternMatrix[r][c] === -1;
  }

  function penalty(m) {
    var size = m.length;
    var score = 0;
    for (var r = 0; r < size; r++) {
      var run = 1;
      for (var c = 1; c < size; c++) {
        if (m[r][c] === m[r][c - 1]) { run++; }
        else { if (run >= 5) score += run - 2; run = 1; }
      }
      if (run >= 5) score += run - 2;
    }
    for (var c = 0; c < size; c++) {
      var run = 1;
      for (var r = 1; r < size; r++) {
        if (m[r][c] === m[r - 1][c]) { run++; }
        else { if (run >= 5) score += run - 2; run = 1; }
      }
      if (run >= 5) score += run - 2;
    }
    for (var r = 0; r < size - 1; r++) {
      for (var c = 0; c < size - 1; c++) {
        var v = m[r][c];
        if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
      }
    }
    var dark = 0;
    for (var r = 0; r < size; r++)
      for (var c = 0; c < size; c++)
        if (m[r][c] === 1) dark++;
    var pct = dark * 100 / (size * size);
    score += Math.abs(Math.floor(pct / 5) * 5 - 50) * 2;
    return score;
  }

  var FORMAT_BITS = [
    0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976,
    0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0
  ];

  function placeFormatBits(m, maskNum) {
    var bits = FORMAT_BITS[maskNum];
    var size = m.length;
    for (var i = 0; i < 15; i++) {
      var bit = (bits >> (14 - i)) & 1;
      // Around top-left
      if (i < 6) m[8][i] = bit;
      else if (i === 6) m[8][7] = bit;
      else if (i === 7) m[8][8] = bit;
      else if (i === 8) m[7][8] = bit;
      else m[14 - i][8] = bit;
      // Around top-right and bottom-left
      if (i < 8) m[size - 1 - i][8] = bit;
      else m[8][size - 15 + i] = bit;
    }
  }

  function generate(text) {
    var version = bestVersion(encodeBytes(text).length);
    var size = version * 4 + 17;
    var data = encodeData(text, version);
    var codewords = buildCodewords(data, version);

    var patternMatrix = createMatrix(size);
    placePatterns(patternMatrix, version);

    var dataMatrix = copyMatrix(patternMatrix);
    placeData(dataMatrix, codewords);

    var bestMask = 0;
    var bestPenalty = Infinity;
    var bestMatrix = null;

    for (var mask = 0; mask < 8; mask++) {
      var m = copyMatrix(dataMatrix);
      for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
          if (patternMatrix[r][c] !== -1) continue;
          if (MASK_FNS[mask](r, c)) {
            m[r][c] ^= 1;
          }
        }
      }
      placeFormatBits(m, mask);
      var p = penalty(m);
      if (p < bestPenalty) {
        bestPenalty = p;
        bestMask = mask;
        bestMatrix = m;
      }
    }

    return bestMatrix;
  }

  function toCanvas(matrix, scale, margin) {
    scale = scale || 4;
    margin = margin !== undefined ? margin : 4;
    var size = matrix.length;
    var totalSize = (size + margin * 2) * scale;
    var canvas = document.createElement('canvas');
    canvas.width = totalSize;
    canvas.height = totalSize;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalSize, totalSize);
    ctx.fillStyle = '#000000';
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (matrix[r][c] === 1) {
          ctx.fillRect((c + margin) * scale, (r + margin) * scale, scale, scale);
        }
      }
    }
    return canvas;
  }

  function toDataURL(text, scale) {
    var matrix = generate(text);
    var canvas = toCanvas(matrix, scale || 4);
    return canvas.toDataURL();
  }

  return {
    generate: generate,
    toCanvas: toCanvas,
    toDataURL: toDataURL
  };
})();
