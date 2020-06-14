var sodium = {};
var crypto = {};
var util = {};
var io = {};
var G = {};

// 1-out-of-2 OT sending
const send_from_2 = function (X1, X2, op_id) {
  op_id = op_id + ':1in2ot';
  let get = io.get.bind(null, op_id);
  let give = io.give.bind(null, op_id);

  // console.log('X1, X2', X1, X2);
  const a = G.random();
  const A = G.exp_base(a);

  give('A', A);
  get('B').then(function (B) {
    let k0 = G.exp(B, a);
    let k1 = G.exp(G.mult_inv(B, A), a);

    k0 = G.point_to_hash(k0);
    k1 = G.point_to_hash(k1);

    // console.log('k0, k1', k0, k1);
    const e0 = util.encrypt_generic(X1, k0);
    const e1 = util.encrypt_generic(X2, k1);

    give('e', [e0, e1]);
  });
};

// 1-out-of-2 OT receiving
const receive_from_2 = function (c, op_id) {
  op_id = op_id + ':1in2ot';
  let get = io.get.bind(null, op_id);
  let give = io.give.bind(null, op_id);

  // console.log('c', c);
  const b = G.random();
  let B = G.exp_base(b);

  return new Promise(function (resolve) {
    get('A').then(function (A) {
      if (c === 1) {
        B = G.mult(A, B);
      }

      give('B', B);
      get('e').then(function (e) {
        e = e[c];

        let k = G.exp(A, b);
        k = G.point_to_hash(k);
        // console.log('k', k);

        let Xc = util.decrypt_generic(e, k);

        // console.log('Xc', Xc);
        resolve(Xc);
      });
    });
  });
};

// 1-out-of-2 OT sending
const send_from_N = function (X, N, op_id) {
  op_id = op_id + ':1inNot';
  let give = io.give.bind(null, op_id);

  if (N == null) {
    N = X.length;
  }

  // console.log(X, N);
  const l = Math.ceil(Math.log2(N));  // N = 2^l

  let K = Array(l);
  for (let j = 0; j < l; j++) {
    K[j] = Array(2);
    for (let b = 0; b <= 1; b++) {
      K[j][b] = crypto.KDF();  // {K_{j}}^{b}
    }
  }

  let Y = Array(N);
  for (let I = 0; I < N; I++) {
    let i = util.to_bits(I, l);  // l bits of I

    // console.log('X[I]', X[I]);
    Y[I] = new Uint8Array(X[I]);  // Array(m);
    for (let j = 0; j < l; j++) {
      let i_j = i[j];
      let K_j = K[j];
      let Kj_ij = K_j[i_j];  // {K_{j}}^{i_j}
      // console.log('KKK', i, j, K_j, Kj_ij);
      Y[I] = util.xor(Y[I], crypto.PRF(Kj_ij, I));
      // console.log('PRF OUTPUTs P1', crypto.PRF(Kj_ij, I));
    }
  }
  // console.log('Y', Y);

  for (let j = 0; j < l; j++) {
    let K_j = K[j];
    send_from_2(K_j[0], K_j[1], op_id+j);
    // console.log('kkkk', K_j[0], K_j[1]);
  }

  for (let I = 0; I < N; I++) {
    // console.log('Y['+I+']', Y[I]);
    give(I, Y[I]);  // reveal Y_I
  }
};

// 1-out-of-2 OT receiving
const receive_from_N = function (I, N, op_id) {
  op_id = op_id + ':1inNot';
  let get = io.get.bind(null, op_id);

  // // console.log(I, N);
  return new Promise(function (resolve) {
    const l = Math.ceil(Math.log2(N));  // N = 2^l
    const i = util.to_bits(I, l);  // l bits of I

    let K = Array(l);
    for (let j = 0; j < l; j++) {
      let i_j = i[j];  // bit j=i_j of I
      K[j] = receive_from_2(i_j, op_id+j);  // pick {K_{j}}^{b} which is also {K_{j}}^{i_j}
      // console.log('kkk', i, j, i_j, K[j]);
    }

    Promise.all(K).then(function (K) {
      // console.log('K', K);
      let Y_I = Array(32);
      for (let pI = 0; pI < N; pI++) {
        let pY_pI = get(pI);
        if (pI === I) {
          Y_I = pY_pI;
        }
      }

      Y_I.then(function (Y_I) {
        // console.log('Y_'+I, Y_I);
        let X_I = Y_I;  // Array(m);
        for (let j = 0; j < l; j++) {
          let Kj_ij = K[j];  // {K_{j}}^{i_j}
          // console.log('Kj_ij', Kj_ij, j);
          X_I = util.xor(X_I, crypto.PRF(Kj_ij, I));
          // console.log('PRF OUTPUTs P2', crypto.PRF(Kj_ij, I));
        }

        // Done
        // console.log('X_I', X_I);
        resolve(X_I);
      });
    });
  });
};

const methods = {
  send: send_from_N,
  receive: receive_from_N,
  single_send: send_from_2,
  single_receive: receive_from_2
};

module.exports = function (__io, __sodium) {
  io = __io;

  if (__sodium == null) {
    sodium = require('libsodium-wrappers');
  } else /*if (sodium.ready != null)*/ {
    sodium = __sodium;
  }

  util = require('./util.js');
  crypto = require('./crypto.js')(sodium, util);
  G = require('./group.js');

  return new Promise(function (resolve) {
    sodium.ready.then(function () {
      resolve(methods);
    });
  });
};
