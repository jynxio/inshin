/**
 * 描述：
 * - 该脚本实现了一个符合 Promises/A+ 规范的Promise polyfill，名为Yeensin。
 * - 该脚本中的Yeensin仅提供构造器和then方法，而不包括catch、finaly等其他方法。
 * - 如果你想获取一个符合ECMAScript规范的Promise polyfill，那么请使用和参阅另
 *   一个名为YeensinPlus.js的文件。
 */

const PENDING_STATE = "pending";
const FULFILLED_STATE = "fulfilled";
const REJECTED_STATE = "rejected";

/**
 * 通过 Promises/A+ 测试的 Promise polyfill。
 * @param   { Function } execute - 该入参等同于原生Promise的入参。
 * @returns { Object } - Yeensin实例，等同于Promise实例。
 */
function Yeensin ( execute ) {

    /* Yeensin实例的内部数据。 */
    const self = this;

    self._state = PENDING_STATE;

    self._fulfilled_value = undefined;
    self._rejected_value  = undefined;

    self._fulfilled_events = [];
    self._rejected_events  = [];

    /*  */
    execute( resolve, reject );

    /**
     * resolve函数，用于敲定Yeensin实例。
     * @param   { * } fulfilled_value Yeensin实例的fulfilled值，代表敲定后的值。
     * @returns { undefined } - undefined。
     */
    function resolve ( fulfilled_value ) {

        if ( self._state !== PENDING_STATE ) return;

        self._state = FULFILLED_STATE;
        self._fulfilled_value = fulfilled_value;

        self._fulfilled_events.forEach( function ( handleThen ) {

            const microtask = _ => handleThen( self._fulfilled_value );

            globalThis.queueMicrotask( microtask );

        } );

        // TODO 如果展平的过程中，发生了错误，那么就会reject
        // TODO thenable的then方法会接受Yeensin实例的resolve和reject来作为入参，如果then调用了reject，那么Yeensin实例也会reject
        function flatten ( fulfilled_value ) {

            let result;

            resolve( fulfilled_value );

            return result;

            function resolve ( fulfilled_value ) {

                if ( typeof fulfilled_value?.then !== "function" ) {

                    resolve = fulfilled_value;

                    return;

                }

                const microtask = _ => {

                    thenable.then( resolve, reject );

                };

                globalThis.queueMicrotask( microtask );

            }

            function reject ( rejected_value ) {

                result = rejected_value;

            }

        }

    };

    /**
     * rejecte函数，用于拒绝Yeensin实例。
     * @param   { * } rejected_value - Yeensin实例的rejected值，代表被拒绝的原因。
     * @returns { undefined } - undefined。
     */
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

/**
 * then方法。
 * @param { Function } handleFulfilled - Yeensin实例的fulfilled订阅函数。
 * @param { Function } handleRejected  - Yeensin实例的rejected订阅函数。
 * @returns { Object } - 一个新的Yeensin实例或一个新的thenable对象。
 */
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

    /**
     * handleFulfilled函数的代理者。
     * @param { * } fulfilled_value - Yeensin实例的fulfilled值。
     * @returns { undefined } - undefined。
     */
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

    /**
     * handleRejected函数的代理者
     * @param { * } rejected_value - Yeensin实例的rejected值。
     * @returns { undefined } - undefined。
     */
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
    /**
     * The Promise Resolution Procedure，详见规范的2.3。
     * @param { Object } yeensin - Yeensin实例或thenable对象。
     * @param { * } x - handleFulfilled函数或handleRejected函数的返回值。
     * @returns { undefined } - undefine。
     */
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
