var byebye = require( '../' )
var test = require( 'tape' )
var child_process = require( 'child_process' )

test('No argument', function (t) {
    t.plan(1)

	t.throws( function provoke_NoArgument () {
		byebye()
	},  /No process specified/g, 'got an exception if giving no argument')
    t.end()
})

test('Wrong argument', function (t) {
    t.plan(1)

	t.throws( function provoke_NoArgument () {
		byebye( {} )
	}, /No process specified/g, 'got an exception if giving wrong process argument')
    t.end()
})

test('Failed spawn', function (t) {
    t.plan(1)

    var proc
    var d = require('domain').create() // [1]
    d.on('error', function(){}) // [2]
    d.run(function () {
        proc = child_process.spawn( 'thisprogramdoesntexit' )
    })
	t.throws( function provoke_NoArgument () {
		byebye( proc )
	}, /Invalid process specified/g, 'got an exception if providing a process launch failure result')
    t.end()
})

test('Already finished', function (t) {
    t.plan(2)

	var proc = child_process.exec( 'echo Job done' )

    proc.on('exit',function( code, signal ) {
        t.doesNotThrow( function provoke_NoArgument () {
            byebye( proc, function alreadyDone( code, signal ) {
                t.pass( 'Callback called even with program already finished' )
            })
        }, 'No exception throwned if providing an already finished process')
        t.end()
    })
})
