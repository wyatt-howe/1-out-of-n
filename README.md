# 1-out-of-n
1-out-of-n oblivious transfer protocol in JavaScript

## Protocol

To create 1-out-of-N, we use log2(N) 1-out-of-2 oblivious transfers of random bits to create log2(N) random strings.  Each secret is masked with one of these strings (by XOR) and the receiving party picks one after which the sender reveals all the masked secrets.

We are essentially building 1-out-of-N OT from random 1-out-of-N and 1-out-of-2 as oracles.
<!-- cite naor1999oblivious -->

<!-- ## Project Layout

    ├─ lib/
    │  ├─ ot.js
    │  ├─ util.js
    │  └─ crypto.js
    ├─ index.js
    └─ src/
       ├─ example.js
       ├─ io-example.js
       ├─ io-template.js
       └─ ascii.js -->

## Installation

You may also install this module from [npm](https://www.npmjs.com/).

```shell
npm install 1-out-of-n
```

## Calling the API

The process generally works as follows:

```javascript
// Each party includes the 1-out-of-n module with IO:
const OT = require('1-out-of-n')(IO);

// 1-out-of-3
const N = 3;

// The sender calls send and provides its secrets:
OT.send([77, 66, 88], N);

// The receiver calls receive with its selection out of N:
OT.receive(2, N).then(console.log.bind(null, 'Secret #2 is:'));

// Result:
66
```

Note that the latest version expects to get an array of Uint8Array as inputs.  Please read [example.js](https://github.com/wyatt-howe/1-out-of-n/blob/master/demo/example.js) for a more detailed example or run it with `node demo/example.js`.
