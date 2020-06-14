/*
 *  ASCII helpers for showing text based oblivious transfer
 */
const to_array = function (ascii) {
  let array = Array(ascii.length);
  for (let i = 0; i < ascii.length; i++) {
    array[i] = ascii[i].charCodeAt();
  }
  return array;
}
const to_ascii = function (array) {
  return String.fromCharCode.apply(null, array);
}

// Bit decomposition
const to_bits = function (I, l) {
  let i = I.toString(2).split('').map(Number);
  i = i.reverse();  // little endian for correctness, but actually doesn't matter for the use in OT
  let il = i.concat(Array(l - i.length).fill(0));
  return il;
};

// Bitwise XOR
const xorBytes = function (x, y) {
  // if (x.length !== y.length) {
  //   throw new Error('Cannot XOR mismatched size byte arrays, ' + x.length + ' and ' + y.length + '.')
  // }

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
  xor: xorBytes
};
