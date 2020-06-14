/*
 *  Group Arithmetic (for public key operations in OT)
 *  Multiplicative group Z*101 of order 100 and with generator g = 99
 */
const G = {
  random: function () {
    return Math.floor(Math.random() * (G.p - 1)) + 1;
  },
  mult: function (a, b) {
    return (a * b) % G.p;
  },
  inv: function (a) {
    return (math.egcd(a, G.p).s + G.p) % G.p;
  },
  mult_inv: function (a, b) {
    return G.mult(a, G.inv(b)) % G.p;
  },
  exp: function (a, b) {
    return crypto_scalarmult_ristretto255(a, b);
  },
  exp_base: function (a) {
    return sodium.crypto_scalarmult_ristretto255_base(a);
  },
  point_to_hash: function (e) {
    return sodium.crypto_generichash(32, e);
  }
};

sodium.crypto_core_ristretto255_scalar_random();
sodium.crypto_scalarmult_ristretto255_base(a);
sodium.crypto_scalarmult_ristretto255(a, B);
sodium.crypto_core_ristretto255_scalar_random();
sodium.crypto_core_ristretto255_add(A, B);
sodium.crypto_scalarmult_ristretto255(b, A);
sodium.crypto_generichash(32, k);

module.exports = G;
