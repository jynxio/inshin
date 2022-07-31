const PENDING_STATE = "pending";
const FULFILLED_STATE = "fulfilled";
const REJECTED_STATE = "rejected";

function Yeensin ( execute ) {

    /* 内部数据 */
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

    let yeensin_resolve;
    let yeensin_reject;

    const yeensin = new Yeensin( ( resolve, reject ) => {

        yeensin_resolve = resolve;
        yeensin_reject = reject;

    } );

    if ( typeof handleFulfilled === "function" ) {

        const handleThen = function handleThen ( fulfilled_value ) {

            try {

                const result = handleFulfilled( fulfilled_value );

                yeensin_resolve( result ); // TODO 没有敲定yeensin的逻辑，从这里开始做

            } catch ( error ) {

                yeensin_reject( error );

            }

        }

        this._fulfilled_events.push( handleThen );

        if ( this._state === FULFILLED_STATE ) {

            const microtask = _ => handleThen( this._fulfilled_value );

            globalThis.queueMicrotask( microtask );

        }

    }

    if ( typeof handleRejected === "function" ) {

        const handleThen = function handleThen ( rejected_value ) {

            try {

                const result = handleRejected( rejected_value );

            } catch ( error ) {

                yeensin_reject( error );

            }

        }

        this._rejected_events.push( handleThen );

        if ( this._state === REJECTED_STATE ) {

            const microtask = _ => handleThen( this._rejected_value );

            globalThis.queueMicrotask( microtask );

        }

    }

    return yeensin;

}
