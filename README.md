# 1-out-of-n
1-out-of-n oblivious transfer protocol in JavaScript

**[In progress]**

## Calling the API

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
