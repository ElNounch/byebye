var byebye = require( '../' )
var test = require( 'tape' )
var child_process = require( 'child_process' )

test('Arguments - No argument', function (t) {
    t.plan(1)

	t.throws( function provoke_NoArgument () {
		byebye()
	},  /No process specified/g, 'Got an exception if giving no argument')
    t.end()
})

test('Arguments - Wrong argument', function (t) {
    t.plan(1)

	t.throws( function provoke_WrongArgument () {
		byebye( 'Oops' )
	}, /No process specified/g, 'Got an exception if giving wrong process argument')
    t.end()
})

test('Arguments - Already finished', function (t) {
    t.plan(2)

	var proc = child_process.exec( 'echo Job done' )

    proc.on('exit',function( code, signal ) {
        t.doesNotThrow( function provoke_AlreadyExited () {
            byebye( proc, function alreadyDone( err, code ) {
                t.pass( 'Callback called even with program already finished' )
                t.end()
            })
        }, 'No exception throwned if providing an already finished process', { skip: true } )
    })
})
