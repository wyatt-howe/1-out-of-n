const ascii = require('./util.js').ascii;

/*
 *  This is the setup for a secure 1-out-of-3 oblivious transfer using
 *  the methods in IO to send public messages between the two parties.
 */
var IO = require('./example-in-out.js');
const OT = require('./ot.js')(IO);
const N = 3;


/*
 *  The sender calls:
 */
const secrets = [
  'A first secret!!',
  // 'A second secret!',
  'A third secret!!'
].map(ascii.to_array);

OT.single_send(...secrets/*, N*/);


/*
 *  The receiver calls:
 */
OT.single_receive(1/*, N*/).then(function (array) {
  console.log('Secret #1 is:', ascii.to_ascii(array));
});
