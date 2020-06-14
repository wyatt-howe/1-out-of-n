module.exports = function (sodium, util) {

  // PRF of length m
  const PRF = function (k, x) {
    if (typeof(x) === 'number') {
      x = Uint8Array.from(util.to_bits(x, 32));
    // eslint-disable-next-line no-prototype-builtins
    } else if (!Uint8Array.prototype.isPrototypeOf(x) && Array.isArray(x)) {
      x = Uint8Array.from(x);
    }
    // eslint-disable-next-line no-prototype-builtins
    if (!Uint8Array.prototype.isPrototypeOf(k) && Array.isArray(k)) {
      k = Uint8Array.from(k);
    }
    return sodium.crypto_aead_chacha20poly1305_encrypt(x, null, null, new Uint8Array(8), k)
  };

  // KDF of length t
  const KDF = function () {
    return sodium.randombytes_buf(32);
  };

  const encrypt_generic = function (plaintext, key) {
    let pad = PRF(key, key);
    let ciphertext = util.xor(plaintext, pad);
    return ciphertext;
  };

  const decrypt_generic = function (ciphertext, key) {
    let pad = PRF(key, key);
    let plaintext = util.xor(ciphertext, pad);
    return plaintext;
  };

  return {
    PRF: PRF,
    KDF: KDF,
    encrypt_generic: encrypt_generic,
    decrypt_generic: decrypt_generic
  };
};
