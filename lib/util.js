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

  const bytes = Array(x.length);

  for (var i = 0; i < bytes.length; i++) {
    bytes[i] = x[i] ^ y[i];
  }

  return bytes;
};

module.exports = {
  to_bits: to_bits,
  xor: xorBytes
};
