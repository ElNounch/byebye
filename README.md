# byebye

[![npm](https://img.shields.io/npm/v/byebye.svg?style=plastic)](https://www.npmjs.com/package/byebye)
[![Travis branch](https://img.shields.io/travis/ElNounch/byebye/master.svg?label=Linux&style=plastic)](https://travis-ci.org/ElNounch/byebye)
[![AppVeyor branch](https://img.shields.io/appveyor/ci/ElNounch/byebye/master.svg?label=Windows&style=plastic)](https://ci.appveyor.com/project/ElNounch/byebye)
[![Downloads](https://img.shields.io/npm/dm/byebye.svg?style=plastic)](https://www.npmjs.com/package/byebye)
[![David](https://img.shields.io/david/ElNounch/byebye.svg?style=plastic)](https://david-dm.org/ElNounch/byebye)
[![David opt](https://img.shields.io/david/opt/ElNounch/byebye.svg?style=plastic)](https://david-dm.org/ElNounch/byebye#info=optionalDependencies)
[![David dev](https://img.shields.io/david/dev/ElNounch/byebye.svg?style=plastic)](https://david-dm.org/ElNounch/byebye#info=devDependencies)

Politely ask a program to quit, and then enforce it to. Cross-platform.

## Usage

**byebye( process, [callback], [options], [timeout] )**

- *process* is an object returned by any function of the library child_process.

- *callback* is an optional function which will get called after process ended.

 It will be called as **callback( return_code, signal_received  )**.

- *options* is an object with any of the following properties :

 - timeout : delay (in seconds)  before killing process if it didn't react to initial request to quit (defaults to 5).

# license

MIT
