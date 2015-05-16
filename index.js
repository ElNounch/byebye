var extend = require( 'extend' )

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
    var byebye_Win32Helper
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
        askPolitely = function sendSIGTERM( target ) {
            if( ! byebye_Win32Helper.CloseMainWindowsByProcess( target ) ) {
                target.kill( 'SIGINT' )
            }
        }
    }
}

module.exports = exports = function byebye( target ) {
    var th = this
    var options = extend( {}, default_options )
    var callback
    var timer

    if( ( typeof target === 'undefined') || !( target.constructor.name === 'ChildProcess' ) ) {
        throw new Error('No process specified' )
    }

    if( typeof target.pid === 'undefined') {
        throw new Error('Invalid process specified' )
    }

    for( var i = 1; i < arguments.length; i++) {
        var arg = arguments[i]
        switch( typeof arg ) {
            case 'object':
                options = extend( {}, default_options, arg )
                break
            case 'function':
                callback = arg
                break
            case 'number':
                options.timeout = arg
                break;
            default:
                throw new Error( 'Argument number ' + i + ' of wrong type' )
                break
        }
    }

    if( target.exitCode === null ) {
        target.on('exit', function byebye_OnExit ( code, signal ) {
            if( typeof timer !== 'undefined') {
                clearTimeout( timer )
            }

            if( typeof callback !== 'undefined') {
                callback.apply( th, [ signal, code ] )
            }
        })

        askPolitely( target )
        timer = setTimeout( function byebye_TimedOut () {
            enforceExit( target )
        }, options.timeout * 1000 )
    } else {
        // Already exited
        if( typeof callback !== 'undefined') {
            callback.apply( th, [ target.exitSignal, target.exitCode ] )
        }
    }

}
