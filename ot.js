const crypto = require('./crypto.js');
const util = require('./util.js');
var IO = {};
var io = {};
const G = require('./group.js');

// 1-out-of-2 OT sending
const send_from_2 = function (X1, X2) {
  console.log('X1, X2', X1, X2);
  const a = G.random();
  const A = G.exp_base(a);

  io.give('A', A);
  io.get('B').then(function (B) {
    let k0 = G.exp(B, a);
    let k1 = G.exp(G.mult_inv(B, A), a);

    k0 = G.point_to_hash(k0);
    k1 = G.point_to_hash(k1);

    console.log('k0, k1', k0, k1);
    const e0 = util.encrypt_generic(X1, k0);
    const e1 = util.encrypt_generic(X1, k1);

    io.give('e', [e0, e1]);
  });
};

// 1-out-of-2 OT receiving
const receive_from_2 = function (c) {
  console.log('c', c);
  const b = G.random();
  let B = G.exp_base(b);

  return new Promise(function (resolve) {
    io.get('A').then(function (A) {
      if (c === 1) {
        B = G.mult(A, B);
      }

      io.give('B', B);
      io.get('e').then(function (e) {
        e = e[c];

        let k = G.exp(A, b);
        k = G.point_to_hash(k);
        console.log('k', k);

        let Xc = util.decrypt_generic(e, k);

        console.log('Xc', Xc);
        resolve(Xc);
      });
    });
  });
};

// 1-out-of-2 OT sending
const send_from_N = function (X, N) {
  console.log(X, N);
  const l = Math.ceil(Math.log2(N));  // N = 2^l

  let K = Array(l);
  for (let j = 1; j <= l; j++) {
    K[j] = Array(2);
    for (let b = 0; b <= 1; b++) {
      K[j][b] = crypto.KDF();  // {K_{j}}^{b}
    }
  }

  let Y = Array(N);
  for (let I = 1; I <= N; I++) {
    let i = to_bits(I);  // l bits of I

    Y[I] = X[I];  // Array(m);
    for (let j = 1; j <= l; j++) {
      let i_j = i[j];
      let K_j = K[j];
      let Kj_ij = K_j[i_j];  // {K_{j}}^{i_j}
      Y[I] = util.xor(Y[I], crypto.PRF(Kj_ij, I));
    }
  }

  for (let j = 1; j <= l; j++) {
    let K_j = K[j];
    send_from_2(K_j[0], K_j[1]);
  }

  for (let I = 1; I <= N; I++) {
    IO.give(I, Y[I]);  // reveal Y_I
  }
};

// 1-out-of-2 OT receiving
const receive_from_N = function (I, N) {
  console.log(I, N);
  const l = Math.ceil(Math.log2(N));  // N = 2^l
  const i = to_bits(I);  // l bits of I

  let K = Array(l);
  for (let j = 1; j <= l; j++) {
    let i_j = i[j];  // bit j=i_j of I
    K[j] = receive_from_2(i_j);  // pick {K_{j}}^{b} which is also {K_{j}}^{i_j}
  }

  for (let pI = 1; pI <= N; pI++) {
    let pY_pI = IO.get(pI);
    if (pI === I) {
      Y_I = pY_pI;
    }
  }

  let X_I = Y_I;  // Array(m);
  for (let j = 1; j <= l; j++) {
    let Kj_ij = K[j];  // {K_{j}}^{i_j}
    X_I = util.xor(X_I, crypto.PRF(Kj_ij, I));
  }

  return X_I;
};

module.exports = function (__io) {
  IO = __io;
  io = IO;
  return {
    send: send_from_N,
    receive: receive_from_N,
    single_send: send_from_2,
    single_receive: receive_from_2
  };
};
