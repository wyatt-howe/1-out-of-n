/*
 *  This is the setup for a secure 1-out-of-3 oblivious transfer using
 *  the methods in IO to send public messages between the two parties.
 */
var IO = require('../io-example.js');
const OT = require('1-out-of-n')(IO);
const N = 3;
const op_id = '1in3ot';  // OPTIONAL op_id string
const session_id = '1,2';  // OPTIONAL string to specify participants

OT.then(function (OT) {

  /*
   *  The sender calls:
   *///             0   1   2
  const secrets = [77, 66, 88];
  OT.send(secrets, N, op_id, session_id);


  /*
   *  The receiver calls:
   */
  OT.receive(1, N, op_id, session_id).then(function (uint8array) {
    console.log('The chosen secret is:', uint8array[0]);
  });

});
