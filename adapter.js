const Inshin = require( "./Inshin" );

function resolved ( value ) {

    return new Inshin( function ( resolve, reject ) {

        resolve( value );

    } );

}

function rejected ( reason ) {

    return new Inshin( function ( resolve, reject ) {

        reject( reason );

    } );

}

function deferred () {

    let resolve;
    let reject;

    return ( {
        promise: new Inshin( function ( rs, rj ) {

            resolve = rs;
            reject = rj;

        } ),
        resolve,
        reject,
    });

}

module.exports = { resolved, rejected, deferred };
