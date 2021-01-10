/*
 *  This is the setup for a secure 1-out-of-3 oblivious transfer using
 *  the methods in IO to send public messages between the two parties.
 */
var IO = require('../io-example.js');
const OT = require('../../index.js')(IO);
const N = 4;
const op_id = '1in4ot';  // OPTIONAL op_id string
const session_id = '1,2';  // OPTIONAL string to specify participants
const TEST_AMOUNT = 10;
const secrets = Array.from(Array(TEST_AMOUNT), () => Array.from(Array(4), () =>
    Array.from(Array(32), () => Math.floor(Math.random()*256))
));
const choices = Array.from(Array(TEST_AMOUNT), () => Math.floor(Math.random()*4));
// const JSON.parse(JSON.stringify(secrets)) = JSON.parse(JSON.stringify(secrets));
// const JSON.parse(JSON.stringify(choices)) = JSON.parse(JSON.stringify(choices));

OT.then(function (OT) {

  /*
   *  The sender calls:
   *///            0  1  2  3
  // const JSON.parse(JSON.stringify(secrets)) = ______;
  // OT.send(JSON.parse(JSON.stringify(secrets)), N, op_id, session_id);
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
  // OT.send(JSON.parse(JSON.stringify(secrets)), N, '1in4to', '3,4');
  // OT.receive(2, N, '1in4to', '3,4').then(function (b) {
  //   console.log('The chosen secret is:', b);
  // });
  // OT.send(JSON.parse(JSON.stringify(secrets)), N, '1in4too', '3,4');
  // OT.receive(3, N, '1in4too', '3,4').then(function (b) {
  //   console.log('The chosen secret is:', b);
  // });
  // OT.send(JSON.parse(JSON.stringify(secrets)), N, '1in4tooo', '3,4');
  // OT.receive(0, N, '1in4tooo', '3,4').then(function (b) {
  //   console.log('The chosen secret is:', b);
  // });



  // console.time('bench');
  // var promises = [];
  // for (let i = 0; i < TEST_AMOUNT; i++) {
  //   let c = JSON.parse(JSON.stringify(choices))[i];//i%N;
  //   // console.log(JSON.parse(JSON.stringify(secrets))[i], c);
  //   // console.log(i, "v v v   send_from_2");
  //   OT.send(JSON.parse(JSON.stringify(secrets))[i], N, op_id + ':' + i, session_id);
  //   // console.log(i, "^ ^ ^   send_from_2");
  //   promises.push(OT.receive(c, N, op_id + ':' + i, session_id));
  // }
  // // console.log("secrets", JSON.parse(JSON.stringify(secrets)), JSON.parse(JSON.stringify(choices)));
  // Promise.all(promises).then(function (bs) {
  //   console.timeEnd('bench');
  //   for (let i = 0; i < TEST_AMOUNT; i++) {
  //     let b = bs[i];
  //     if (b.toString() === JSON.parse(JSON.stringify(secrets))[i][JSON.parse(JSON.stringify(choices))[i]].toString()) {
  //       console.log(JSON.stringify(secrets[i]), JSON.stringify(choices[i]), JSON.stringify(Array.from(b)));
  //     } else {
  //       console.log("FAILED", JSON.stringify(secrets[i]), JSON.stringify(choices[i]), JSON.stringify(Array.from(b)));
  //     }
  //     // console.log('The chosen secret is:', b);
  //   }
  //   console.log("Done");
  //   // OT.send(JSON.parse(JSON.stringify(secrets))[0], N, op_id + ':' + 0, session_id);
  // });


  console.time('bench');
  var promises = [];
  for (let i = 0; i < TEST_AMOUNT; i++) {
    let c = JSON.parse(JSON.stringify(choices))[i];//i%N;
    // console.log(JSON.parse(JSON.stringify(secrets))[i], c);
    // console.log(i, "v v v   send_from_2");
    OT.extension.send(JSON.parse(JSON.stringify(secrets))[i], N, op_id + ':' + i, session_id);
    // console.log(i, "^ ^ ^   send_from_2");
    promises.push(OT.extension.receive(c, N, op_id + ':' + i, session_id));
  }
  Promise.all(promises).then(function (bs) {
    console.timeEnd('bench');
    for (let i = 0; i < TEST_AMOUNT; i++) {
      let b = bs[i];
      // b = b[0]
      if (b.toString() === JSON.parse(JSON.stringify(secrets))[i][JSON.parse(JSON.stringify(choices))[i]].toString()) {
        // console.log(JSON.stringify(secrets[i]), JSON.stringify(choices[i]), JSON.stringify(Array.from(b)));
      } else {
        console.log("FAILED", JSON.stringify(secrets[i]), JSON.stringify(choices[i]), JSON.stringify(Array.from(b)));
      }
      // console.log('The chosen secret is:', b);
    }
    console.log("Done");
    // OT.send(JSON.parse(JSON.stringify(secrets))[0], N, op_id + ':' + 0, session_id);
  });

  OT.extension.seed_and_execute_sender(null, 128, null, op_id, session_id);
  OT.extension.seed_and_execute_receiver(null, 128, null, null, op_id, session_id);
});
