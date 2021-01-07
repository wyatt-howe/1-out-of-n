module.exports = function (ot, io) {
  ot.extension = { queue: [] };

  // Helper to allow automatic integration for a socket's other parameters
  const end_bind = function (fn, end_args) {
    return (function (end_args) {
      return fn.apply(this, Array.from(arguments).slice(1).concat(end_args));
    }).bind(this, end_args);
  };

  // Queue 1-out-of-2 OT sending
  ot.extension.send_from_2 = function (X1, X2, op_id, session_id) {
    if (ot.extension.queue[session_id] === undefined || ot.extension.queue[session_id].messages === undefined) {
      ot.extension.queue[session_id] = { messages: [] };
    }
    ot.extension.queue[session_id].messages.push([X1, X2]);
  };

  // Queue 1-out-of-2 OT receiving
  ot.extension.receive_from_2 = function (c, op_id, session_id) {
    if (ot.extension.queue[session_id] === undefined || ot.extension.queue[session_id].choices === undefined || ot.extension.queue[session_id].listeners === undefined) {
      ot.extension.queue[session_id] = { choices: [], listeners: [] };
    }
    if (ot.extension.queue[session_id] === undefined) ot.extension.queue[session_id] = {};
    ot.extension.queue[session_id].choices.push(c);
    return new Promise(function (resolve) {
      ot.extension.queue[session_id].listeners.push(resolve);
    });
  };

  // Seed and execute OT-extension for 1-out-of-2 sending
  ot.extension.seed_and_execute_sender = function (n, k, X, op_id, session_id) {
    if (n == null) n = ot.extension.queue[session_id].messages.length;  // Queue all deferred transfers
    if (k == null) k = 256;  // A safe security parameter
    if (X == null) X = ot.extension.queue[session_id].messages.splice(0, n);  // Dequeue the oldest n pending message pairs
    op_id = op_id + ':ext';

    const extra_args = Array.from(arguments).slice(4);
    var __receive_from_2 = end_bind(ot.receive_from_2, extra_args);
    var __send_from_2 = end_bind(ot.send_from_2, extra_args);

    const s = Array(k).fill(() => Math.random()<0.5);  // {0,1}^k

    // Seed OT
    let Q_promises = s.map((s_j, j) => __receive_from_2(s_j, op_id + ':seed:' + j, session_id));

    // Execute OT
    Promise.all(Q_promises).then(function (Q) {
      for (i = 0; i < n; i++) {
        let row_i = Q.map(col => col[i]);
        let y_i_0 = xor_fit(X[i][0], H(i, row_i));
        let y_i_1 = xor_fit(X[i][1], H(i, row_i.map((Q_i_j, j) => Q_i_j ^ s[j])));
        __send_from_2(y_i_0, y_i_1, op_id + ':' + i, session_id);
      }
    });
  };

  // Seed and execute OT-extension for 1-out-of-2 receiving
  ot.extension.seed_and_execute_receiver = function (n, k, r, __listeners, op_id, session_id) {
    if (n == null) n = ot.extension.queue[session_id].choices.length;  // ot.extension.queue all deferred transfers
    if (k == null) k = 256;  // A safe security parameter
    if (r == null) r = ot.extension.queue[session_id].choices.splice(0, n);  // Dequeue the oldest n pending choice bits
    if (__listeners == null) __listeners = ot.extension.queue[session_id].listeners.splice(0, n);  // Dequeue the oldest n listeners
    op_id = op_id + ':ext';

    const extra_args = Array.from(arguments).slice(4);
    var __receive_from_2 = end_bind(ot.receive_from_2, extra_args);
    var __send_from_2 = end_bind(ot.send_from_2, extra_args);

    const T = Array(n).fill(Array(k).fill(() => Math.random()<0.5));  // {0,1}^(n x k)

    // Seed OT: Send each column of T as T_j or T_j XOR r
    for (j = 0; j < k; j++) {
      let col_j = T.map(row => row[j]);
      let m0 = col_j;
      let m1 = col_j.map((col_j_i, i) => col_j_i ^ r[i]);
      __send_from_2(m0, m1, op_id + ':seed:' + j, session_id);
    }

    // Execute OT
    let y_promises = r.map((r_i, i) => __receive_from_2(r_i, op_id + ':' + i, session_id));
    Promise.all(y_promises).then(function (y) {
      let X = y.map((y_i, i) => xor_fit(y_i, H(i, T[i])));
      X.map((x_i, i) => __listeners[i](x_i));
    });
  };
};
