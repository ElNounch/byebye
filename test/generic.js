var byebye = require( '../' )
var test = require( 'tape' )
var child_process = require( 'child_process' )

if( process.platform !== 'win32') {

    function lastChanceKill( t, proc ) {
        return setTimeout(function safetyKill() {
            proc.kill('SIGKILL')
            t.fail( "emergency kill" )
        }, 10000 )
    }

    function compare_at_End(t, cb_result, evt_result) {
        if( ( typeof cb_result !== 'undefined') && ( typeof evt_result !== 'undefined') ) {
            t.deepEqual( cb_result, evt_result, 'Got same return values and signal from event and callback' )
            t.end()
        }
    }

    test('Generic - Vanilla', function (t) {
        t.timeoutAfter(10000)
        t.plan(5)

        var evt_result, cb_result
        var proc = child_process.spawn( 'bash', [ '-c', 'sleep 10' ] )
        t.notStrictEqual( proc, undefined, "Launched 'bash'" )
        var lastChance = lastChanceKill( t, proc )
        proc.on('exit', function onProc_generic_Vanilla_Exit( code, signal ) {
            if( lastChance ) {
                clearTimeout( lastChance )
            }
            t.strictEqual( signal, 'SIGTERM', "event - 'bash' caught signal SIGTERM" )
            evt_result = {
                code: code,
                signal : signal
            }
            compare_at_End(t, cb_result, evt_result)
        })
        setTimeout(function() {
            t.doesNotThrow(function() {
                byebye( proc, function callback_generic_Vanilla_Exit( err, code ) {
                    t.strictEqual( err, 'SIGTERM', "callback - 'bash' caught signal SIGTERM" )
                    cb_result = {
                        code: code,
                        signal : err
                    }
                    compare_at_End(t, cb_result, evt_result)
                })
            }, "Calling byebye() didn't threw an exception")
        }, 2000 );
    })

    test('Generic - SIGTERM proof', function (t) {
        t.timeoutAfter(10000)
        t.plan(5)

        var evt_result, cb_result
        var proc = child_process.spawn( 'bash', [ '-c', 'trap "echo BOOM" SIGTERM; sleep 10' ] )
        t.notStrictEqual( proc, undefined, "Launched 'bash'" )
        var lastChance = lastChanceKill( t, proc )
        proc.on('exit', function onProc_generic_NoSIGTERM_Exit( code, signal ) {
            if( lastChance ) {
                clearTimeout( lastChance )
            }
            t.strictEqual( signal, 'SIGKILL', "event - 'bash' caught signal SIGKILL" )
            evt_result = {
                code: code,
                signal : signal
            }
            compare_at_End(t, cb_result, evt_result)
        })
        setTimeout(function() {
            t.doesNotThrow(function() {
                byebye( proc, function callback_generic_NoSIGTERM_Exit( err, code ) {
                    t.strictEqual( err, 'SIGKILL', "callback - 'bash' caught signal SIGKILL" )
                    cb_result = {
                        code: code,
                        signal : err
                    }
                    compare_at_End(t, cb_result, evt_result)
                })
            }, "Calling byebye() didn't threw an exception")
        }, 2000 );
    })

    test('Generic - TimeOut', function (t) {
        t.timeoutAfter(10000)
        t.plan(3)

        var evt_result, cb_result
        var proc = child_process.spawn( 'bash', [ '-c', 'trap "echo BOOM" SIGTERM; sleep 10' ] )
        t.notStrictEqual( proc, undefined, "Launched 'bash'" )
        var lastChance = lastChanceKill( t, proc )
        setTimeout(function() {
            setTimeout(t.end, 3000)

            t.doesNotThrow(function() {
                byebye( proc, function callback_generic_TimeOut_Exit( err, code ) {
                    if( lastChance ) {
                        clearTimeout( lastChance )
                    }
                    t.strictEqual( err, 'SIGKILL', "'bash' caught signal SIGKILL" )
                }, { timeout: 2 } )
            }, "Calling byebye() didn't threw an exception")
        }, 2000 );
    })
}
