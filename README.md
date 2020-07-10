# 1-out-of-n
1-out-of-n oblivious transfer protocol in JavaScript

## Protocol

To create 1-out-of-N, we use log2(N) 1-out-of-2 oblivious transfers of random bits to create log2(N) random strings.  Each secret is masked with one of these strings (by XOR) and the receiving party picks one after which the sender reveals all the masked secrets.

We build 1-out-of-N OT by composing random 1-out-of-N and multiple 1-out-of-2 oracles.
<!-- cite naor1999oblivious -->

## Project Layout

```
    ├─ index.js           Module entry point (include this or use npm)
    ├─ lib/               Library source
    │  ├─ ot.js             Oblivious transfer protocols
    │  ├─ util.js           Bitwise helpers
    │  └─ crypto.js         Crypto primitives
    └─ demo/              Example demos
       ├─ io-example.js   Input-output communication for the demos
       ├─ io-template.js  IO methods template
       ├─ strings/        Strings demo
       │  ├─ example.js     OT choosing from strings
       │  └─ ascii.js       ASCII helpers to convert inputs to Uint8Array
       └─ numbers/        Numbers demo
          └─ example.js     OT choosing from numbers
```

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

Note that the latest version expects to get an array of Uint8Array as inputs, so if you are working with numbers larger than 8 bits, it is strongly recommended to use the Uint8Array byte array type to represent your number choices.  Please read [strings/example.js](https://github.com/wyatt-howe/1-out-of-n/blob/master/demo/strings/example.js) for a more detailed example or run it with `node demo/*/example.js`.
