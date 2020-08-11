const ascii = require('./ascii.js');

/*
 *  This is the setup for a secure 1-out-of-11 oblivious transfer using
 *  the methods in IO to send public messages between the two parties.
 */
var IO = require('../io-example.js');
const OT = require('1-out-of-n')(IO);
const N = 11;
const op_id = '1in11ot';  // OPTIONAL op_id string
const session_id = '1,2';  // OPTIONAL string to specify participants
const extra_arg_1 = "str_1";  // OPTIONAL extra parameters
const extra_arg_2 = "str_2";  // (We can pass multiple, if needed for the IO.)

OT.then(function (OT) {

  /*
   *  The sender calls:
   */
  const secrets = [
    'A zeroth secret!',
    'A first secret!!',
    'A second secret!',
    'A third secret!!',
    'A fourth secret!',
    'A fifth secret!!',
    'A sixth secret!!',
    'A seventh secret',
    'A eighth secret!',
    'A nineth secret!',
    'A tenth secret!!'
  ].map(ascii.to_array);

  OT.send(secrets, N, op_id, session_id, extra_arg_1, extra_arg_2);


  /*
   *  The receiver calls:
   */
  OT.receive(6, N, op_id, session_id, extra_arg_1, extra_arg_2).then(function (array) {
    console.log('The chosen secret is:', ascii.to_ascii(array));
  });

});
