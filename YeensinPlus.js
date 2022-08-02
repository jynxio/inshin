const Yeensin = require( "Yeensin" );

Yeensin.resolve = function resolve ( fulfilled_value ) {

    /*  */
    if ( Object.getPrototypeOf( fulfilled_value ) === Yeensin.prototype ) {

        return fulfilled_value;

    }

    /*  */
    let yeensinResolve;

    const yeensin = new Yeensin( resolve => yeensinResolve = resolve );

    if (
        ( typeof fulfilled_value === "object" && fulfilled_value !== null )
        ||
        typeof fulfilled_value === "function"
    ) {

        const then = fulfilled_value.then;

        if ( typeof then === "function" ) {

            then.call( fulfilled_value, yeensinResolve );

            return yeensin;

        }

    }

    /*  */
    yeensinResolve( fulfilled_value );

    return yeensin;

};

Yeensin.reject = function reject ( rejected_value ) {

    return new Yeensin( ( _, reject ) => reject( rejected_value ) );

};

Yeensin.all = function all ( iterable ) {

    /*  */
    let yeensinResolve;
    let yeensinReject;

    const yeensin_fulfilled_value = [];

    const yeensin = new Yeensin( ( resolve, reject ) => {

        yeensinResolve = resolve;
        yeensinReject = reject;

    } );

    /*  */
    if ( ! Array.from( iterable ).length ) {

        yeensinResolve( [] );

        return yeensin;

    }

    /*  */
    let index = 0;

    const others = [];
    const yeensins = [];

    const others_indexes = [];
    const yeensins_indexes = [];

    for ( const item of iterable ) {

        if ( Object.getPrototypeOf( item ) === Yeensin.prototype ) {

            yeensins.push( item );
            yeensins_indexes.push( index );

            index ++;

            continue;

        }

        others.push( item )
        others_indexes.push( index );

        index ++;

    }

    /*  */
    others.forEach( ( item, index ) => {

        yeensin_fulfilled_value[ others_indexes[ index ] ] = item;

    } );

    if ( ! yeensins.length ) {

        yeensinResolve( yeensin_fulfilled_value );

        return yeensin;

    }

    /*  */
    let is_reject = false;
    let pending_count = yeensins.length;

    yeensins.forEach( ( item, index ) => {

        item.then( handleFulfilled, handleRejected );

        function handleFulfilled ( item_fulfilled_value ) {

            pending_count --;

            yeensin_fulfilled_value[ yeensins_indexes[ index ] ] = item_fulfilled_value;

            if ( ! pending_count ) {

                yeensinResolve( yeensin_fulfilled_value );

            }

        }

        function handleRejected ( item_rejected_value ) {

            if ( is_reject ) return;

            yeensinReject( item_rejected_value );

            is_reject = true;

        }

    } );

    return yeensin;

};

Yeensin.any = function any () {};

Yeensin.race = function race () {};

Yeensin.allSettled = function allSettled () {};

Yeensin.prototype.catch = function () {};

Yeensin.prototype.finally = function () {};
