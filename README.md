# 1-out-of-n
1-out-of-n oblivious transfer protocol in JavaScript

## Protocol

To create 1-out-of-N, we use log2(N) 1-out-of-2 oblivious transfers of random bits to create log2(N) random strings.  Each secret is masked with one of these strings (by XOR) and the receiving party picks one after which the sender reveals all the masked secrets.

We build 1-out-of-N OT by composing random 1-out-of-N and multiple 1-out-of-2 oracles.  This is the same protocol as described in [*Oblivious Transfer and Polynomial Evaluation* pp. 247-248](https://doi.org/10.1145%2F301250.301312)<!-- [pdf](https://books c.xyz/dl/28462147/d44b14?openInBrowser) -->.

<!-- cite @inproceedings{Naor_1999,
	doi = {10.1145/301250.301312},
	url = {https://doi.org/10.1145%2F301250.301312},
	year = 1999,
	publisher = {{ACM} Press},
	author = {Moni Naor and Benny Pinkas},
	title = {Oblivious transfer and polynomial evaluation},
	booktitle = {Proceedings of the thirty-first annual {ACM} symposium on Theory of computing  - {STOC} {\textquotesingle}99}
} -->

## Project layout

```
├─ index.js           Module entry point (include this or use npm)
├─ lib/               Library source
│  ├─ ot.js             Oblivious transfer protocols
│  ├─ util.js           Bitwise helpers
│  └─ crypto.js         Crypto primitives
└─ demo/              Example demos
   ├─ io-example.js     Input-output communication for the demos
   ├─ io-template.js    IO methods template
   ├─ strings/          Strings demo
   │  ├─ example.js       OT choosing from strings
   │  └─ ascii.js         ASCII helpers to convert inputs to Uint8Array
   └─ numbers/          Numbers demo
      └─ example.js       OT choosing from numbers
```

## Installation

You may also install this module from [npm](https://www.npmjs.com/package/1-out-of-n/v/0.3.0).

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

## Test suite

The example demos in `demo/numbers/example.js` and `demo/strings/example.js` test both a basic, and slightly more advanced usage of the library.  You may run them individually, or use the pre-configured test script by running `npm test`.  All versions and releases have tests passing.

## Code linting

Please run `npm run-script lint-fix` before submitting a pull request.
