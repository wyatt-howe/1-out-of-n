/*
 *  Implement 'give' and 'get' using your appliction'
 *  underlying IO capabilities, and use the IO object
 *  to pass as the IO parameter for 1-out-of-N.
 *
 * The operation and session ids are optional, but
 * useful for managing multi-party communications or
 * differentiating multiple instances of the protocol.
 *
 *  IO template for the user:
 */

// IO send
const give = function (op_id, session_id, tag, msg) {
  /* give a message */
  return;
};

// IO receive
const get = function (op_id, session_id, tag) {
  /* get a message */
  return /*msg*/;
};

module.exports = {
  give: give,
  get: get
};
