var byebye = require( '../' )
var test = require( 'tape' )
var child_process = require( 'child_process' )

if( process.platform === 'win32') {

    function compare_at_End(t, cb_result, evt_result) {
        if( ( typeof cb_result !== 'undefined') && ( typeof evt_result !== 'undefined') ) {
            t.deepEqual( cb_result, evt_result, 'Got same return values and signal from event and callback' )
            t.end()
        }
    }

    test('WinMain', function (t) {
        t.timeoutAfter(10000)
        t.plan(5)

        var evt_result, cb_result
        var proc = child_process.spawn( 'mmc.exe' )
        t.notStrictEqual( proc, undefined, "Launched 'mmc.exe'" )
        proc.on('exit', function onProc_Win32_WinMain_Exit( code, signal ) {
            t.strictEqual( signal, null, "event - 'mmc.exe' didn't caught any signal" )
            evt_result = {
                code: code,
                signal : signal
            }
            compare_at_End(t, cb_result, evt_result)
        })
        setTimeout(function() {
            t.doesNotThrow(function() {
                byebye( proc, function callback_Win32_WinMain_Exit( code, signal ) {
                    t.strictEqual( signal, null, "callback - 'mmc.exe' didn't caught any signal" )
                    cb_result = {
                        code: code,
                        signal : signal
                    }
                    compare_at_End(t, cb_result, evt_result)
                })
            }, "calling byebye() didn't threw an exception")
        }, 2000 );
    })

    test('Main', function (t) {
        t.timeoutAfter(10000)
        t.plan(5)

        var evt_result, cb_result
        var proc = child_process.spawn( 'cmd.exe' )
        t.notStrictEqual( proc, undefined, "Launched 'cmd.exe'" )
        proc.on('exit', function onProc_Win32_Main_Exit( code, signal ) {
            t.strictEqual( signal, 'SIGINT', "'cmd.exe' caught signal SIGINT" )
            evt_result = {
                code: code,
                signal : signal
            }
            compare_at_End(t, cb_result, evt_result)
        })
        setTimeout(function() {
            t.doesNotThrow(function() {
                byebye( proc, function callback_Win32_Main_Exit( code, signal ) {
                    t.strictEqual( signal, 'SIGINT', "'cmd.exe' caught signal SIGINT" )
                    cb_result = {
                        code: code,
                        signal : signal
                    }
                    compare_at_End(t, cb_result, evt_result)
                })
            }, "calling byebye() didn't threw an exception")
        }, 2000 );
    })

    test('TimeOut', function (t) {
        t.timeoutAfter(10000)
        t.plan(3)

        var evt_result, cb_result
        var proc = child_process.spawn( 'mmc.exe' )
        t.notStrictEqual( proc, undefined, "Launched 'mmc.exe'" )
        setTimeout(function() {
            t.doesNotThrow(function() {
                byebye( proc, function callback_Win32_TimeOut_Exit( code, signal ) {
                    t.strictEqual( signal, 'SIGKILL', "callback - 'mmc.exe' caught signal SIGKILL" )
                    t.end()
                }, { timeout: 0 } )
            }, "calling byebye() didn't threw an exception")
        }, 2000 );
    })
}
