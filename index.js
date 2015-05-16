var asap = require( 'asap' )
var extend = require( 'extend' )
var byebye_Win32Helper

var default_options = {
    timeout: 5
}

var askPolitely = function sendSIGTERM( target ) {
    target.kill( 'SIGTERM' )
}

var enforceExit = function sendSIGKILL( target ) {
    target.kill( 'SIGKILL' )
}

if( process.platform === 'win32' ) {
    try {
        var tmp = require( 'byebye-win32' )
        if( ! tmp.addon_loaded) {
            throw new Error( 'Couldn\'t find or load native addon' )
        }
        if( typeof tmp.CloseMainWindowsByProcess !== 'function' ) {
            throw new Error( 'Missing CloseMainWindowsByProcess()' )
        }
        byebye_Win32Helper = tmp
    } catch (err) {
        tmp = undefined
    }

    if( typeof byebye_Win32Helper !== 'undefined' ) {
        var askPolitely = function sendSIGTERM( target ) {
            byebye_Win32Helper.CloseMainWindowsByProcess( target )
        }
    }
}

function asyncify( cb ) {
    return function asyncified() {
        var th = this
        var args = arguments
        asap( function asyncified() {
            cb.apply( th, args )
        })
    }
}

module.exports = exports = function byebye( target ) {
    var options = extend( {}, default_options )
    var callback
    var timer
    var callbackCalled = false

    if( ( typeof target === 'undefined') || !( target.constructor.name === 'ChildProcess' ) ) {
        throw new Error('No process specified' )
    }

    callback = function(){}
    for( var i = 1; i < arguments.length; i++) {
        var arg = arguments[i]
        switch( typeof arg ) {
            case 'object':
                options = extend( {}, default_options, arg )
                break
            case 'function':
                callback = asyncify( arg )
                break
            case 'number':
                options.timeout = arg
                break;
            default:
                throw new Error( 'Argument number ' + i + ' of wrong type' )
                break
        }
    }

    if( ( typeof target.pid === 'undefined') || (target.pid === 0) ) {
        return callback( 'Invalid process specified' )
    }

    target.once('error', function byebye_OnError ( err ) {
        if( typeof timer !== 'undefined') {
            clearTimeout( timer )
        }
        callbackCalled = true
        callback( err )
    })
    target.once('exit', function byebye_OnExit ( code, signal ) {
        if( typeof timer !== 'undefined') {
            clearTimeout( timer )
        }

        if( !callbackCalled ) {
            callbackCalled = true
            callback( signal, code )
        }
    })

    if( target.exitCode === null ) {
        target.stdin.end()
        askPolitely( target )
        timer = setTimeout( function byebye_TimedOut () {
            enforceExit( target )
        }, options.timeout * 1000 )
    } else {
        callback( target.exitSignal, target.exitCode )
    }

}
