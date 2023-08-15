/**
 * 描述：
 * - 该脚本实现了一个符合 Promises/A+ 规范的Promise polyfill，名为Inshin。
 * - 该脚本中的Inshin仅提供构造器和then方法，而不包括catch、finaly等其他方法。
 * - 如果你想获取一个符合ECMAScript规范的Promise polyfill，那么请使用和参阅另
 *   一个名为InshinPlus.js的文件。
 */

const PENDING_STATE = "pending";
const FULFILLED_STATE = "fulfilled";
const REJECTED_STATE = "rejected";

/**
 * 通过 Promises/A+ 测试的 Promise polyfill。
 * @param   { Function } execute - 该入参等同于原生Promise的入参。
 * @returns { Object } - Inshin实例，等同于Promise实例。
 */
function Inshin ( execute ) {

    /* Inshin实例的内部数据。 */
    const self = this;

    self._state = PENDING_STATE;

    self._fulfilled_value = undefined;
    self._rejected_value  = undefined;

    self._fulfilled_events = [];
    self._rejected_events  = [];

    /*  */
    execute( resolve, reject );

    /**
     * resolve函数，用于敲定Inshin实例。
     * @param   { * } fulfilled_value Inshin实例的fulfilled值，代表敲定后的值。
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
    };

    /**
     * rejecte函数，用于拒绝Inshin实例。
     * @param   { * } rejected_value - Inshin实例的rejected值，代表被拒绝的原因。
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
 * @param { Function } handleFulfilled - Inshin实例的fulfilled订阅函数。
 * @param { Function } handleRejected  - Inshin实例的rejected订阅函数。
 * @returns { Object } - 一个新的Inshin实例或一个新的thenable对象。
 */
Inshin.prototype.then = function then ( handleFulfilled, handleRejected ) {

    /*  */
    let inshinResolve;
    let inshinReject;

    const inshin = new Inshin( ( resolve, reject ) => {

        inshinResolve = resolve;
        inshinReject = reject;

    } );

    /*  */
    this._fulfilled_events.push( handleFulfilledAndInshin );

    if ( this._state === FULFILLED_STATE ) {

        const microtask = _ => handleFulfilledAndInshin( this._fulfilled_value );

        globalThis.queueMicrotask( microtask );

    }

    /**
     * handleFulfilled函数的代理者。
     * @param { * } fulfilled_value - Inshin实例的fulfilled值。
     * @returns { undefined } - undefined。
     */
    function handleFulfilledAndInshin ( fulfilled_value ) {

        if ( typeof handleFulfilled === "function" ) {

            let x;

            try {

                x = handleFulfilled( fulfilled_value );

            } catch ( error ) {

                inshinReject( error );

            }

            inshinResolutionProcedure( inshin, x );

        } else {

            inshinResolve( fulfilled_value );

        }

    }

    /* */
    this._rejected_events.push( handleRejectedAndInshin );

    if ( this._state === REJECTED_STATE ) {

        const microtask = _ => handleRejectedAndInshin( this._rejected_value );

        globalThis.queueMicrotask( microtask );

    }

    /**
     * handleRejected函数的代理者
     * @param { * } rejected_value - Inshin实例的rejected值。
     * @returns { undefined } - undefined。
     */
    function handleRejectedAndInshin ( rejected_value ) {

        if ( typeof handleRejected === "function" ) {

            let x;

            try {

                x = handleRejected( rejected_value );

            } catch ( error ) {

                inshinReject( error );

            }

            inshinResolutionProcedure( inshin, x );

        } else {

            inshinReject( rejected_value );

        }

    }

    /* [[Resolve]]( inshin, x ) */
    /**
     * The Promise Resolution Procedure，详见规范的2.3。
     * @param { Object } inshin - Inshin实例或thenable对象。
     * @param { * } x - handleFulfilled函数或handleRejected函数的返回值。
     * @returns { undefined } - undefine。
     */
    function inshinResolutionProcedure ( inshin, x ) {

        if ( x === null ) {

            inshinResolve( x );

            return;

        }

        if ( typeof x !== "object" && typeof x !== "function" ) {

            inshinResolve( x );

            return;

        }

        if ( x === inshin ) {

            inshinReject( new TypeError( "Chaining cycle detected for promise" ) );

            return;

        }

        if ( typeof x === "object" || typeof x === "function" ) {

            let then;

            try {

                then = x.then;

            } catch ( error ) {

                inshinReject( error );

            }

            if ( typeof then === "function" ) {

                let is_finish = false;

                const resolve = function resolve ( y ) {

                    if ( is_finish ) return;

                    is_finish = true;

                    inshinResolutionProcedure( inshin, y )

                };
                const reject = function reject ( r ) {

                    if ( is_finish ) return;

                    is_finish = true;

                    inshinReject( r )

                };

                try {

                    then.call( x, resolve, reject );

                } catch ( error ) {

                    if ( ! is_finish ) inshinReject( error );

                }

                return;

            }

            inshinResolve( x );

        }

    }

    /*  */
    return inshin;

}

module.exports = Inshin;
