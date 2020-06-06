/*
 *  This is the setup for a secure 1-out-of-3 oblivious transfer using
 *  the methods in IO to send public messages between the two parties.
 */
var IO = require('example-in-out');
const OT = require('ot')(IO);
const N = 3;


/*
 *  The sender calls:
 */
OT.send(['A first secret!!', 'A second secret!', 'A third secret!!'], N);


/*
 *  The receiver calls:
 */
OT.receive(1, N).then(console.log);
