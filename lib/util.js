module.exports = function (sodium) {
  // Bit decomposition
  const to_bits = function (I, l) {
    var i = I.toString(2).split('').map(Number);
    i = i.reverse();  // little endian for correctness, but actually doesn't matter for the use in OT
    var il = i.concat(Array(l - i.length).fill(0));
    return il;
  };

  // Bitwise XOR
  const xorBytes = function (x, y) {
    // if (x.length !== y.length) {
    //   throw new Error('Cannot XOR mismatched size byte arrays, ' + x.length + ' and ' + y.length + '.')
    // }

    const bytes = new Uint8Array(x.length);

    for (var i = 0; i < bytes.length; i++) {
      bytes[i] = x[i] ^ y[i];
    }

    return bytes;
  };

  // Message serialization helpers
  const del = ', ';
  const to_Uint8 = sodium.from_base64;
  const from_Uint8 = sodium.to_base64;  // Tip: Use sodium.to_hex for debug.
  const to_str = function (x) {
    if (Array.isArray(x)) {
      return x.map(to_str).join(del);
    } else {
      return from_Uint8(x);
    }
  };
  const from_str = function (str) {
    if (str.indexOf(del) > 1) {
      json_array = '["' + str.split(del).join('","') + '"]';
      return JSON.parse(json_array).map(from_str);
    } else {
      return to_Uint8(str);
    }
  };

  return {
    to_bits: to_bits,
    xor: xorBytes,
    to_str: to_str,
    from_str: from_str
  };
}
