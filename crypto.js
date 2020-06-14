module.exports = function (sodium, util) {

  // PRF of length m
  const PRF = function (k, x) {
    if (typeof(x) === 'number') {
      x = new Uint8Array(util.to_bits(x, 32));
    // eslint-disable-next-line no-prototype-builtins
    } else if (!Uint8Array.prototype.isPrototypeOf(x) && Array.isArray(x)) {
      x = new Uint8Array(x);
    }
    // eslint-disable-next-line no-prototype-builtins
    if (!Uint8Array.prototype.isPrototypeOf(k) && Array.isArray(k)) {
      k = new Uint8Array(k);
    }
    // // console.log('k, x', k, x);
    // sodium.crypto_generichash(16, x);
    return sodium.crypto_aead_chacha20poly1305_encrypt(x, null, null, new Uint8Array(8), k)
  };

  // KDF of length t
  const KDF = function () {
    // sodium.crypto_kdf_keygen('uint8array', sodium.randombytes_buf(32))
    return sodium.randombytes_buf(32);
  };

  return {
    PRF: PRF,
    KDF: KDF
  };
};
