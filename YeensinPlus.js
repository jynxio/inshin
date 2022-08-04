const Yeensin = require( "./Yeensin" );

/**
 * 该脚本暂停开发，原因如下：
 * 对于JavaScript内建的Promise而言，如果尝试兑现一个thenable，那么Promise自动展平这个thenable（即通过
 * 调用thenable的方式来展平它），并将最后的展平值来作为最终的兑现值。
 * 具体来说，无论是new Yeensin(resolve => thenable)，还是Yeensin.resolve(thenable)都应当会自动的展
 * 平thenable。
 * 如果希望Yeensin.resolve(thenable)能够具有自动展平thenable的能力，那么就首先要为new Yeensin(resolv
 * e => thenable)实现该能力。
 * 我尝试改写Yeensin.js中的代码，以使得new Yeensin(resolve => thenable)具有自动展平的能力，并期望可以将
 * 该能力轻易的移植到Yeensin.resolve(thenable)上。
 * 不幸的是，我失败了，我很努力的改写Yeensin.js，改写之后的Yeensin.js也确实具有了自动展平thenable的能力，但
 * 是Yeensin.js却始终无法再通过Promises/A+的测试了。
 * 不具备自动展平的能力，就无法完全实现JavaScript内建的Promise，因此我暂时搁置了YeensinPlus.js脚本的开发。
 */

/** 停工。
 * @param { * } fulfilled_value - Yeensin实例的敲定值，或Yeensin实例，或thenable对象。
 * @returns { Object } Yeensin实例。
 */
Yeensin.resolve = function ( fulfilled_value ) {

    /* fulfilled_value是Yeensin实例。 */
    if ( Object.getPrototypeOf( fulfilled_value ) === Yeensin.prototype ) {

        return fulfilled_value;

    }

    /* fulfilled_value是thenable对象。 */
    if ( typeof fulfilled_value?.then === "function" ) {

        const yeensin = new Yeensin( ( resolve, reject ) => {

            const microtask = _ => {

                try {

                    fulfilled_value.then( resolve, reject );

                } catch ( error ) {

                    reject( error );

                }

            };

            globalThis.queueMicrotask( microtask );

        } );

        return yeensin;

    }

    /* fulfilled_value是其他。 */
    return new Yeensin( resolve => resolve( fulfilled_value ) );

};

Yeensin.reject = function ( rejected_value ) {};

Yeensin.all = function ( iterable ) {};

Yeensin.any = function ( iterable ) {};

Yeensin.race = function () {};

Yeensin.allSettled = function () {};

Yeensin.prototype.catch = function () {};

Yeensin.prototype.finally = function () {};

module.exports = Yeensin;
