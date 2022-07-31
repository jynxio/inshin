const Yeensin = require( "./Yeensin" );

function resolved ( value ) {

    return new Yeensin( function ( resolve, reject ) {

        resolve( value );

    } );

}

function rejected ( reason ) {

    return new Yeensin( function ( resolve, reject ) {

        reject( reason );

    } );

}

function deferred () {

    let resolve;
    let reject;

    return ( {
        promise: new Yeensin( function ( rs, rj ) {

            resolve = rs;
            reject = rj;

        } ),
        resolve,
        reject,
    });

}

module.exports = { resolved, rejected, deferred };
