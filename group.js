/*
 *  Math helpers
 */
const math = {
  random_bytestring: () => Math.floor(Math.random()*Math.pow(2, 48)).toString(16),
  random_number: () => Math.floor(Math.random()*Math.pow(2, 48)),
  gcd: (a, b) => b === 0 ? a : gcd(b, a % b),
  egcd: function (a, b) {
    if (a % b === 0) {
      return {d: b, s: 0, t: 1};
    } else {
      let q = Math.floor(a / b);
      let r = a % b;
      let gcd = math.egcd(b, r);
      let d = gcd.d;
      let s = gcd.s;
      let t = gcd.t;
      return {
        d: d,
        s: t,
        t: s - (t * q)
      };
    }
  }
};

/*
 *  Group Arithmetic (for public key operations in OT)
 *  Multiplicative group Z*101 of order 100 and with generator g = 99
 */
const G = {
  p: 101,
  g: 99,
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
    let c = a;
    for (var i = 1; i < b; i++) {
      c = G.mult(c, a);
    }
    return c;
  },
  exp_base: function (a) {
    return G.exp(G.g, a);
  },
  point_to_hash: function (e) {
    return (function (m) {  // Generic hash for array of chars
      var hash = 0;
      const compress = (h, b) => ((h<<5)-h) + b;
      for (var i = 0; i < m.length; i++) {
        hash = compress(hash, m.charCodeAt(i));
      }
      return Math.abs(hash);
    })(String(e + G.p));
  }
};

module.exports = G;
