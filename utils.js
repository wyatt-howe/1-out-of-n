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
const xor = function (x, y) {
  return z;
};

const ascii = {
  to_array: to_array,
  to_ascii: to_ascii
};

module.exports = {
  ascii: ascii,
  to_bits: to_bits,
  xor: xor
};
