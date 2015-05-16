var byebye = require( '../' )
var test = require( 'tape' )
var child_process = require( 'child_process' )

if( process.platform === 'win32') {

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

    test('Win32 - WinMain', function (t) {
        t.timeoutAfter(20000)
        t.plan(5)

        var evt_result, cb_result
        var proc = child_process.spawn( 'notepad.exe' )
        t.notStrictEqual( proc, undefined, "Launched 'notepad.exe'" )
        var lastChance = lastChanceKill( t, proc )
        proc.on('exit', function onProc_Win32_WinMain_Exit( code, signal ) {
            if( lastChance ) {
                clearTimeout( lastChance )
            }
            t.strictEqual( signal, null, "event - 'notepad.exe' didn't caught any signal" )
            evt_result = {
                code: code,
                signal : signal
            }
            compare_at_End(t, cb_result, evt_result)
        })
        setTimeout(function() {
            t.doesNotThrow(function() {
                byebye( proc, function callback_Win32_WinMain_Exit( err, code ) {
                    t.strictEqual( err, null, "callback - 'notepad.exe' didn't caught any signal or error" )
                    cb_result = {
                        code: code,
                        signal : err
                    }
                    compare_at_End(t, cb_result, evt_result)
                })
            }, "Calling byebye() didn't threw an exception")
        }, 2000 );
    })

    test('Win32 - Main', function (t) {
        t.timeoutAfter(20000)
        t.plan(5)

        var evt_result, cb_result
        var proc = child_process.spawn( 'cmd.exe' )
        t.notStrictEqual( proc, undefined, "Launched 'cmd.exe'" )
        var lastChance = lastChanceKill( t, proc )
        proc.on('exit', function onProc_Win32_Main_Exit( code, signal ) {
            if( lastChance ) {
                clearTimeout( lastChance )
            }
            t.strictEqual( signal, null, "event - 'cmd.exe' didn't caught any signal" )
            evt_result = {
                code: code,
                signal : signal
            }
            compare_at_End(t, cb_result, evt_result)
        })
        setTimeout(function() {
            t.doesNotThrow(function() {
                byebye( proc, function callback_Win32_Main_Exit( err, code ) {
                    t.strictEqual( err, null, "callback - 'cmd.exe' didn't caught any signal" )
                    cb_result = {
                        code: code,
                        signal : err
                    }
                    compare_at_End(t, cb_result, evt_result)
                })
            }, "Calling byebye() didn't threw an exception")
        }, 2000 );
    })

    test('Win32 - TimeOut', function (t) {
        t.timeoutAfter(20000)
        t.plan(5)

        var evt_result, cb_result
        var proc = child_process.exec( '"' + process.execPath + '" -e "process.on(\'SIGTERM\',function(){});setTimeout(function(){},30000)"' )
        t.notStrictEqual( proc, undefined, "Launched the unbreakable" )
        var lastChance = lastChanceKill( t, proc )
        proc.on('exit', function onProc_Win32_Main_Exit( code, signal ) {
            if( lastChance ) {
                clearTimeout( lastChance )
            }
            t.strictEqual( signal, 'SIGKILL', "event - the unbreakable caught signal SIGKILL" )
            evt_result = {
                code: code,
                signal : signal
            }
            compare_at_End(t, cb_result, evt_result)
        })
        setTimeout(function() {
            t.doesNotThrow(function() {
                byebye( proc, function callback_Win32_TimeOut_Exit( err, code ) {
                    t.strictEqual( err, 'SIGKILL', "callback - the unbreakable caught signal SIGKILL" )
                    cb_result = {
                        code: code,
                        signal : err
                    }
                    compare_at_End(t, cb_result, evt_result)
                }, { timeout: 2 } )
            }, "Calling byebye() didn't threw an exception")
        }, 2000 );
    })
}
