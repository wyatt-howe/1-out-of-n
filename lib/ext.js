module.exports = function (ot, io, sodium, util, crypto) {
  ot.extension = { queue: {} };

  // Helper to allow automatic integration for a socket's other parameters
  const end_bind = function (fn, end_args) {
    return (function (end_args) {
      return fn.apply(this, Array.from(arguments).slice(1).concat(end_args));
    }).bind(this, end_args);
  };

  // Queue 1-out-of-2 OT sending
  ot.extension.send_from_2 = function (X1, X2, op_id, session_id) {
    if (ot.extension.queue[session_id] === undefined) {
      ot.extension.queue[session_id] = { messages: [] };
    } else if (ot.extension.queue[session_id].messages === undefined) {
      ot.extension.queue[session_id].messages = [];
    }
    ot.extension.queue[session_id].messages.push([X1, X2]);
  };

  // Queue 1-out-of-2 OT receiving
  ot.extension.receive_from_2 = function (c, op_id, session_id) {
    if (ot.extension.queue[session_id] === undefined) {
      ot.extension.queue[session_id] = { choices: [], listeners: [] };
    } else if (ot.extension.queue[session_id].choices === undefined && ot.extension.queue[session_id].listeners === undefined) {
      ot.extension.queue[session_id].choices = [];
      ot.extension.queue[session_id].listeners = [];
    } else if (ot.extension.queue[session_id].choices === undefined) {
      ot.extension.queue[session_id].choices = [];
    } else if (ot.extension.queue[session_id].listeners === undefined) {
      ot.extension.queue[session_id].listeners = [];
    }

    ot.extension.queue[session_id].choices.push(c);
    return new Promise(function (resolve) {
      ot.extension.queue[session_id].listeners.push(resolve);
    });
  };

  // 1-out-of-N OT sending
  ot.extension.send_from_N = function (X, N, op_id, session_id) {
    var I, j;

    const extra_args = Array.from(arguments).slice(4);

    op_id = op_id + ':1inNot';
    var give = end_bind(io.give.bind(null, op_id, session_id), extra_args);
    var __send_from_2 = end_bind(ot.extension.send_from_2, extra_args);
    X = util.sanitize(X);  // Check padding and fix if not the right type

    if (N == null) {
      N = X.length;
    }

    const l = Math.ceil(Math.log2(N));  // N = 2^l

    var K = Array(l);
    for (j = 0; j < l; j++) {
      K[j] = Array(2);
      for (var b = 0; b <= 1; b++) {
        K[j][b] = crypto.KDF();  // {K_{j}}^{b}
      }
    }

    var Y = Array(N);
    for (I = 0; I < N; I++) {
      var i = util.to_bits(I, l);  // l bits of I

      Y[I] = X[I];  // new Uint8Array(m);
      for (j = 0; j < l; j++) {
        const i_j = i[j];
        const K_j = K[j];
        const Kj_ij = K_j[i_j];  // {K_{j}}^{i_j}
        Y[I] = util.xor(Y[I], crypto.PRF(Kj_ij, I));
      }
    }
    for (j = 0; j < l; j++) {
      const K_j = K[j];
      __send_from_2(K_j[0], K_j[1], op_id + j, session_id);
    }

    for (I = 0; I < N; I++) {
      give('I' + String(I), util.to_str(Y[I]));  // Reveal Y_I
    }
  };

  // 1-out-of-N OT receiving
  ot.extension.receive_from_N = function (I, N, op_id, session_id) {
    var j;

    const extra_args = Array.from(arguments).slice(4);

    op_id = op_id + ':1inNot';
    var get = end_bind(io.get.bind(null, op_id, session_id), extra_args);
    var __receive_from_2 = end_bind(ot.extension.receive_from_2, extra_args);

    return new Promise(function (resolve) {
      const l = Math.ceil(Math.log2(N));  // N = 2^l
      const i = util.to_bits(I, l);  // l bits of I

      var K = Array(l);
      for (j = 0; j < l; j++) {
        const i_j = i[j];  // bit j=i_j of I
        K[j] = __receive_from_2(i_j, op_id + j, session_id);  // Pick {K_{j}}^{b} which is also {K_{j}}^{i_j}
      }

      Promise.all(K).then(function (K) {
        var Y_I = new Uint8Array(32);
        for (var pI = 0; pI < N; pI++) {
          const pY_pI = get('I' + String(pI));
          if (pI === I) {
            Y_I = pY_pI;
          }
        }

        Y_I.then(function (Y_I_str) {
          const Y_I = util.from_str(Y_I_str);

          var X_I = Y_I;  // new Uint8Array(m);
          for (j = 0; j < l; j++) {
            const Kj_ij = K[j];  // {K_{j}}^{i_j}
            X_I = util.xor(X_I, crypto.PRF(Kj_ij, I));
          }

          // Done
          resolve(X_I);
        });
      });
    });
  };

  function xor_fit(x, y) {
    if (typeof(x) === "number") { x = [x]; }
    if (typeof(y) === "number") { y = [y]; }
    const l = Math.max(x.length, y.length);
    let z = Array(l);
    for (var i = 0; i < l; i++) {
      if (x[i] != null && x[i] != null) {
        z[i] = x[i] ^ y[i];
      } else if (x[i] != null) {
        z[i] = x[i];
      } else if (y[i] != null) {
        z[i] = y[i];
      }
    }
    return z;
  }

  // Seed and execute OT-extension for 1-out-of-2 sending
  ot.extension.seed_and_execute_sender = function (n, k, X, op_id, session_id) {
    const k_BYTES = Math.ceil(k/8);
    const extra_args = Array.from(arguments).slice(5);
    if (n == null) n = ot.extension.queue[session_id].messages.length;  // Queue all deferred transfers
    if (k == null) k = 256;  // A safe security parameter
    if (X == null) X = ot.extension.queue[session_id].messages.splice(0, n);  // Dequeue the oldest n pending message pairs

    op_id = op_id + ':ext';
    var give = end_bind(io.give.bind(null, op_id, session_id), extra_args);  // extra_args means extra parameters
    var receive = end_bind(ot.single_receive, extra_args);

    const s = Array.from(Array(k), () => Math.random()<0.5?0:1);  // {0,1}^k

    let Q_promises = (function seed_stage_sender() {
      // Seed OT
      let Q_promises = s.map((s_j, j) =>
          receive(s_j, op_id + ':seed:' + j, session_id)
      );
      return Q_promises;
    })();

      // Execute OT
      Promise.all(Q_promises).then(function (Q) {
        (function execute_stage_sender() {
        console.timeEnd("Q");
        console.time("y");
        let y_0 = Array(n);
        let y_1 = Array(n);
        for (i = 0; i < n; i++) {
          let row_i = Q.map(col => col[i]);
          let y_i_0 = xor_fit(X[i][0], sodium.crypto_generichash(k_BYTES, new Uint8Array([i].concat(row_i))));
          let y_i_1 = xor_fit(X[i][1], sodium.crypto_generichash(k_BYTES, new Uint8Array([i].concat(row_i.map((Q_i_j, j) => Q_i_j ^ s[j])))));
          y_0[i] = new Uint8Array(y_i_0);
          y_1[i] = new Uint8Array(y_i_1);
        }
        give('y', util.to_str([y_0, y_1]));
        })();
      });
  };

  // Seed and execute OT-extension for 1-out-of-2 receiving
  ot.extension.seed_and_execute_receiver = function (n, k, r, __listeners, op_id, session_id) {
    const k_BYTES = Math.ceil(k/8);
    const extra_args = Array.from(arguments).slice(6);

    if (n == null) n = ot.extension.queue[session_id].choices.length;  // ot.extension.queue all deferred transfers
    if (k == null) k = 256;  // A safe security parameter
    if (r == null) r = ot.extension.queue[session_id].choices.splice(0, n);  // Dequeue the oldest n pending choice bits
    if (__listeners == null) __listeners = ot.extension.queue[session_id].listeners.splice(0, n);  // Dequeue the oldest n listeners

    op_id = op_id + ':ext';
    var get = end_bind(io.get.bind(null, op_id, session_id), extra_args);  // extra_args means extra parameters
    var send = end_bind(ot.single_send, extra_args);

    const T = Array.from(Array(n), () => Array.from(Array(k), () => Math.random()<0.5?0:1));  // {0,1}^(n x k)

    (function seed_stage_receiver() {
      // Seed OT: Send each column of T as T_j or T_j XOR r
      console.time("Q");
      for (j = 0; j < k; j++) {
        let col_j = T.map(row => row[j]);
        let m0 = col_j;
        let m1 = col_j.map((col_j_i, i) => col_j_i ^ r[i]);
        send(new Uint8Array(m0), new Uint8Array(m1), op_id + ':seed:' + j, session_id);
      }
    })();

    (function execute_stage_receiver() {
      // Execute OT
      get('y').then(function (y_str) {
        let y = util.from_str(y_str);
        console.timeEnd("y");
        console.time("z");
        for (i = 0; i < n; i++) {
          let x =
            xor_fit(
              y[r[i]][i],
              sodium.crypto_generichash(k_BYTES,
                new Uint8Array([i].concat(T[i]))
              )
            );
          let Uint8x = new Uint8Array(x);
          __listeners[i](Uint8x);
        }
        console.timeEnd("z");
      });
    })();
  };

  ot.extension.send = ot.extension.send_from_N;
  ot.extension.receive = ot.extension.receive_from_N;
  ot.extension.single_send = ot.extension.send_from_2;
  ot.extension.single_receive = ot.extension.receive_from_2;
};
