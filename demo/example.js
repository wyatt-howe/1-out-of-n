const ascii = require('./ascii.js');

/*
 *  This is the setup for a secure 1-out-of-3 oblivious transfer using
 *  the methods in IO to send public messages between the two parties.
 */
var IO = require('./io-example.js');
const OT = require('../index.js')(IO);
const N = 11;
const op_id = '1in11ot';  // OPTIONAL op_id string
const session_id = '1,2';  // OPTIONAL string to specify participants

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

  OT.send(secrets, N, op_id, session_id);


  /*
   *  The receiver calls:
   */
  OT.receive(6, N, op_id, session_id).then(function (array) {
    console.log('The chosen secret is:', ascii.to_ascii(array));
  });

});
