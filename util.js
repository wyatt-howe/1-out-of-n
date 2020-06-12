/*
 *  ASCII helpers for showing text based oblivious transfer
 */
const to_array = function(ascii) {
  let array = Array(ascii.length);
  for (let i = 0; i < ascii.length; i++) {
    array[i] = ascii[i].charCodeAt();
  }
  return array;
}
const to_ascii = function(array) {
 return String.fromCharCode.apply(null, array);
}

// Bit decomposition
const to_bits = function (I) {
  return i;
};

// Bitwise XOR
const xorBytes = function (x, y) {
  if (x.length !== y.length) {
    throw new Error('Cannot XOR mismatched size byte arrays, ' + x.length + ' and ' + y.length + '.')
  }

  const bytes = Array(x.length);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = x[i] ^ y[i];
  }

  return bytes;
};

const ascii = {
  to_array: to_array,
  to_ascii: to_ascii
};

module.exports = {
  ascii: ascii,
  to_bits: to_bits,
  xor: xorBytes,

  H: function (m) {  // Generic hash for array of chars
    var hash = 0;
    const compress = (h, b) => ((h<<5)-h) + b;
    for (var i = 0; i < m.length; i++) {
      hash = compress(hash, m.charCodeAt(i));
    }
    return Math.abs(hash);
  },
  xor_char: (a, b) => (((parseInt(a, 16) ^ parseInt(b, 16)) + 16) % 16).toString(16),
  xor_array: function (a, b, l) {
    const util = require('./util.js');
    var c = "";
    for (var i = 0; i < a.length; i++) {
      c += util.xor_char(a[i], b[i]);
    }
    return c;
  },
  encrypt_generic: function (plaintext, key) {
    const util = require('./util.js');
    console.log('plaintext', plaintext);
    let pad = to_array(util.H(key.toString(16)).toString(16).padStart(16, '0'));
    console.log('pad', pad);
    let ciphertext = util.xor(plaintext, pad);
    console.log('ciphertext', ciphertext);
    return ciphertext;
  },
  decrypt_generic: function (ciphertext, key) {
    const util = require('./util.js');
    let pad = to_array(util.H(key.toString(16)).toString(16).padStart(16, '0'));
    let plaintext = util.xor(ciphertext, pad);
    console.log('plaintext', plaintext);
    return plaintext;
  }
};
