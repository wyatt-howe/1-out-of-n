module.exports = function (sodium, util) {

  // PRF of length m
  const PRF = function (k, x) {
    if (typeof(k) === 'number') k = Uint8Array.from(util.to_bits(k, 32));  // delete me

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
    // console.log('k, x', k, x);
    // sodium.crypto_generichash(16, x);
    return sodium.crypto_aead_chacha20poly1305_encrypt(x, null, null, new Uint8Array(8), k)
  };

  // KDF of length t
  const KDF = function () {
    // sodium.crypto_kdf_keygen('uint8array', sodium.randombytes_buf(32))
    return sodium.randombytes_buf(32);
  };

  const encrypt_generic = function (plaintext, key) {
    console.log('plaintext', plaintext, key);
    let pad = PRF(key, key);
    // console.log('pad', pad);
    let ciphertext = util.xor(plaintext, pad);
    // // console.log('ciphertext', ciphertext);
    return ciphertext;
  };

  const decrypt_generic = function (ciphertext, key) {
    let pad = PRF(key, key);
    let plaintext = util.xor(ciphertext, pad);
    // // console.log('plaintext', plaintext);
    return plaintext;
  };

  return {
    PRF: PRF,
    KDF: KDF,
    encrypt_generic,
    decrypt_generic
  };
};
