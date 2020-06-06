/*
 *  Client-Server Communications
 */
var listeners = {};
var mailbox = {};
const dummy_socket = party_id => ({
  get: function (tag) {
    return new Promise(function (resolve) {
      tag = party_id + ':' + tag;
      if (mailbox[tag] == null) {
        listeners[tag] = resolve;
      } else {
        resolve(mailbox[tag]);
        mailbox[tag] = undefined;
      }
    });
  },
  give: function (tag, msg) {
    tag = party_id + ':' + tag;
    if (listeners[tag] == null) {
      mailbox[tag] = msg;
    } else {
      listeners[tag](msg);
      listeners[tag] = undefined;
    }
  },
  listen: function (get, tag, callback) {
    (function register(f) {
      get(tag).then(function (msg) {
        f(msg);
        register(f);
      });
    }(callback));
  }
});

module.exports = dummy_socket('example');
