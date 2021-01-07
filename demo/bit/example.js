/*
 *  This is the setup for a secure 1-out-of-3 oblivious transfer using
 *  the methods in IO to send public messages between the two parties.
 */
var IO = require('../io-example.js');
const OT = require('../../index.js')(IO);
const N = 4;
const op_id = '1in4ot';  // OPTIONAL op_id string
const session_id = '1,2';  // OPTIONAL string to specify participants

OT.then(function (OT) {

  /*
   *  The sender calls:
   *///            0  1  2  3
  const secrets = [1, 0, 0, 0];
  // OT.send(secrets, N, op_id, session_id);
  //
  //
  // /*
  //  *  The receiver calls:
  //  */
  // OT.receive(1, N, op_id, session_id).then(function (b) {
  //   console.log('The chosen secret is:', b);
  // });
  //
  //
  //
  // // Again anew, but choose 2 this time:
  // OT.send(secrets, N, '1in4to', '3,4');
  // OT.receive(2, N, '1in4to', '3,4').then(function (b) {
  //   console.log('The chosen secret is:', b);
  // });
  // OT.send(secrets, N, '1in4too', '3,4');
  // OT.receive(3, N, '1in4too', '3,4').then(function (b) {
  //   console.log('The chosen secret is:', b);
  // });
  // OT.send(secrets, N, '1in4tooo', '3,4');
  // OT.receive(0, N, '1in4tooo', '3,4').then(function (b) {
  //   console.log('The chosen secret is:', b);
  // });



  console.time('bench');
  var promises = [];
  for (let i = 0; i < 10000; i++) {
    let c = i%N;
    // console.log(secrets, c);
    OT.send(secrets, N, op_id + ':' + i, session_id + ':' + i);
    promises.push(OT.receive(c, N, op_id + ':' + i, session_id + ':' + i));
  }
  Promise.all(promises).then(function (bs) {
    console.timeEnd('bench');
    bs.map(function (b) {
      // console.log('The chosen secret is:', b);
    });
  });
});
