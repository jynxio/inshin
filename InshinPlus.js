const Inshin = require( "./Inshin" );

/**
 * 该脚本暂停开发，原因如下：
 * 对于JavaScript内建的Promise而言，如果尝试兑现一个thenable，那么Promise自动展平这个thenable（即通过
 * 调用thenable的方式来展平它），并将最后的展平值来作为最终的兑现值。
 * 具体来说，无论是new Inshin(resolve => thenable)，还是Inshin.resolve(thenable)都应当会自动的展
 * 平thenable。
 * 如果希望Inshin.resolve(thenable)能够具有自动展平thenable的能力，那么就首先要为new Inshin(resolv
 * e => thenable)实现该能力。
 * 我尝试改写Inshin.js中的代码，以使得new Inshin(resolve => thenable)具有自动展平的能力，并期望可以将
 * 该能力轻易的移植到Inshin.resolve(thenable)上。
 * 不幸的是，我失败了，我很努力的改写Inshin.js，改写之后的Inshin.js也确实具有了自动展平thenable的能力，但
 * 是Inshin.js却始终无法再通过Promises/A+的测试了。
 * 不具备自动展平的能力，就无法完全实现JavaScript内建的Promise，因此我暂时搁置了InshinPlus.js脚本的开发。
 */

/** 停工。
 * @param { * } fulfilled_value - Inshin实例的敲定值，或Inshin实例，或thenable对象。
 * @returns { Object } Inshin实例。
 */
Inshin.resolve = function ( fulfilled_value ) {

    /* fulfilled_value是Inshin实例。 */
    if ( Object.getPrototypeOf( fulfilled_value ) === Inshin.prototype ) {

        return fulfilled_value;

    }

    /* fulfilled_value是thenable对象。 */
    if ( typeof fulfilled_value?.then === "function" ) {

        const inshin = new Inshin( ( resolve, reject ) => {

            const microtask = _ => {

                try {

                    fulfilled_value.then( resolve, reject );

                } catch ( error ) {

                    reject( error );

                }

            };

            globalThis.queueMicrotask( microtask );

        } );

        return inshin;

    }

    /* fulfilled_value是其他。 */
    return new Inshin( resolve => resolve( fulfilled_value ) );

};

Inshin.reject = function ( rejected_value ) {};

Inshin.all = function ( iterable ) {};

Inshin.any = function ( iterable ) {};

Inshin.race = function () {};

Inshin.allSettled = function () {};

Inshin.prototype.catch = function () {};

Inshin.prototype.finally = function () {};

module.exports = Inshin;
