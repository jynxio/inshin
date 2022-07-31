const adapter = require( "./adapter" );
const promisesAplusTests = require( "promises-aplus-tests" );

promisesAplusTests( adapter, function ( error ) {

        // All done; output is in the console. Or check `err` for number of failures.
        console.log( error );

} );
