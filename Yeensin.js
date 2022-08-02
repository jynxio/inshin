const PENDING_STATE = "pending";
const FULFILLED_STATE = "fulfilled";
const REJECTED_STATE = "rejected";

function Yeensin ( execute ) {

    /*  */
    const self = this;

    self._state = PENDING_STATE;

    self._fulfilled_value = undefined;
    self._rejected_value  = undefined;

    self._fulfilled_events = [];
    self._rejected_events  = [];

    /*  */
    execute( resolve, reject );

    /*  */
    function resolve ( fulfilled_value ) {

        if ( self._state !== PENDING_STATE ) return;

        self._state = FULFILLED_STATE;
        self._fulfilled_value = fulfilled_value;

        self._fulfilled_events.forEach( function ( handleThen ) {

            const microtask = _ => handleThen( self._fulfilled_value );

            globalThis.queueMicrotask( microtask );

        } );

    };

    function reject ( rejected_value ) {

        if ( self._state !== PENDING_STATE ) return;

        self._state = REJECTED_STATE;
        self._rejected_value = rejected_value;

        self._rejected_events.forEach( function ( handleThen ) {

            const microtask = _ => handleThen( self._rejected_value );

            globalThis.queueMicrotask( microtask );

        } );

    };

}

Yeensin.prototype.then = function then ( handleFulfilled, handleRejected ) {

    /*  */
    let yeensinResolve;
    let yeensinReject;

    const yeensin = new Yeensin( ( resolve, reject ) => {

        yeensinResolve = resolve;
        yeensinReject = reject;

    } );

    /*  */
    this._fulfilled_events.push( handleFulfilledAndYeensin );

    if ( this._state === FULFILLED_STATE ) {

        const microtask = _ => handleFulfilledAndYeensin( this._fulfilled_value );

        globalThis.queueMicrotask( microtask );

    }

    function handleFulfilledAndYeensin ( fulfilled_value ) {

        if ( typeof handleFulfilled === "function" ) {

            let x;

            try {

                x = handleFulfilled( fulfilled_value );

            } catch ( error ) {

                yeensinReject( error );

            }

            yeensinResolutionProcedure( yeensin, x );

        } else {

            yeensinResolve( fulfilled_value );

        }

    }

    /* */
    this._rejected_events.push( handleRejectedAndYeensin );

    if ( this._state === REJECTED_STATE ) {

        const microtask = _ => handleRejectedAndYeensin( this._rejected_value );

        globalThis.queueMicrotask( microtask );

    }

    function handleRejectedAndYeensin ( rejected_value ) {

        if ( typeof handleRejected === "function" ) {

            let x;

            try {

                x = handleRejected( rejected_value );

            } catch ( error ) {

                yeensinReject( error );

            }

            yeensinResolutionProcedure( yeensin, x );

        } else {

            yeensinReject( rejected_value );

        }

    }

    /* [[Resolve]]( yeensin, x ) */
    function yeensinResolutionProcedure ( yeensin, x ) {

        if ( x === null ) {

            yeensinResolve( x );

            return;

        }

        if ( typeof x !== "object" && typeof x !== "function" ) {

            yeensinResolve( x );

            return;

        }

        if ( x === yeensin ) {

            yeensinReject( new TypeError( "Chaining cycle detected for promise" ) );

            return;

        }

        if ( typeof x === "object" || typeof x === "function" ) {

            let then;

            try {

                then = x.then;

            } catch ( error ) {

                yeensinReject( error );

            }

            if ( typeof then === "function" ) {

                let is_finish = false;

                const resolve = function resolve ( y ) {

                    if ( is_finish ) return;

                    is_finish = true;

                    yeensinResolutionProcedure( yeensin, y )

                };
                const reject = function reject ( r ) {

                    if ( is_finish ) return;

                    is_finish = true;

                    yeensinReject( r )

                };

                try {

                    then.call( x, resolve, reject );

                } catch ( error ) {

                    if ( ! is_finish ) yeensinReject( error );

                }

                return;

            }

            yeensinResolve( x );

        }

    }

    /*  */
    return yeensin;

}

module.exports = Yeensin;
