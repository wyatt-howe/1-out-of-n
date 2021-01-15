/*
 *  This is the setup for a secure 1-out-of-3 oblivious transfer using
 *  the methods in IO to send public messages between the two parties.
 */
var IO = require('../io-example.js');
const OT = require('../../index.js')(IO);
const N = 4;
const op_id = '1in4ot';  // OPTIONAL op_id string
const session_id = '1,2';  // OPTIONAL string to specify participants
const TEST_AMOUNT = 5;
const secrets = Array.from(Array(TEST_AMOUNT), () => Array.from(Array(N), () => Array.from(Array(32), () => Math.floor(Math.random() * 256))));  // TEST_AMOUNT x N x 32 x byte
const choices = Array.from(Array(TEST_AMOUNT), () => Math.floor(Math.random() * N));  // TEST_AMOUNT x [0, N)

const USE_EXTENSION = true;  // Use OT-extension to run in a constant number of rounds proportional to the security parameter
const SECURITY_PARAMETER = 128;  // OT-extension security parameter equal to the number of seed/base oblivious transfers

OT.then(function (OT) {
  if (USE_EXTENSION) {
    OT = OT.extension;
  }

  // console.time('bench');

  var promises = [];
  for (let i = 0; i < TEST_AMOUNT; i++) {
    const c = JSON.parse(JSON.stringify(choices))[i];
    OT.send(JSON.parse(JSON.stringify(secrets))[i], N, op_id + ':' + i, session_id);
    promises.push(OT.receive(c, N, op_id + ':' + i, session_id));
  }

  Promise.all(promises).then(function (bs) {
    // console.timeEnd('bench');

    for (let i = 0; i < TEST_AMOUNT; i++) {
      const b = bs[i];
      if (b.toString() === JSON.parse(JSON.stringify(secrets))[i][JSON.parse(JSON.stringify(choices))[i]].toString()) {
        console.log('PASSED', JSON.stringify(secrets[i]), JSON.stringify(choices[i]), JSON.stringify(Array.from(b)));
      } else {
        console.log('FAILED', JSON.stringify(secrets[i]), JSON.stringify(choices[i]), JSON.stringify(Array.from(b)));
      }
      // console.log('The chosen secret is:', b);
    }
    // console.log("Done");
  });

  if (USE_EXTENSION) {
    OT.seed_and_execute_sender(null, SECURITY_PARAMETER, null, op_id, session_id);
    OT.seed_and_execute_receiver(null, SECURITY_PARAMETER, null, null, op_id, session_id);
  }
});
