# Promises/A+

## 概述

一个开放的 JavaScript Promise 标准。

`promise` 代表异步操作的最终结果，我们主要通过 `promise` 的 `then` 方法来使用它，`then` 方法用于注册回调函数，回调函数可以接收到 `promise` 在 `fulfilled` 或 `rejected` 状态下的值。

该规范详细说明了 `then` 方法的行为规范，providing an interoperable base which all Promises/A+ conformant promise implementations can be depended on to provide。所以我们可以认为这个规范是非常稳定的。虽然 Promises/A+ 组织可能会采用一些向后兼容的小修改来解决新发现的极端情况，但是组织只有在经过深思熟虑、讨论和测试之后才会采用无法向后兼容的大修改。

Promises/A+ 厘清了早期的 Promises/A 提案的行为规范，extending it to cover de facto behaviors，并省略掉了一些模糊的与存疑的部分。

最后，Promises/A+ 规范不涉及如何创建、敲定、拒绝 `promise` ，而是专注于定义 `then` 方法的行为规范，不过该规范在未来也可能会涉及到创建、敲定、拒绝 `promise` 的事情。

## 1.术语

1.1 `promise` 是 Promise 构造函数的实例，是一个具有 `then` 方法的对象或函数，且其 `then` 方法完全符合本规范的要求。

1.2 `thenable` 是一个具有 `then` 方法的对象或函数。

1.3 `value` 是 `promise` 的 `fulfilled` 值，代表 `promise` 被敲定时的值。

1.4 `reason` 是 `promise` 的 `rejected` 值，代表 `promise` 被拒绝时的原因。

1.5`exception` 是一个使用 `throw` 语句抛出的值。

## 2.要求

### 2.1 状态

`promise` 是拥有状态的，且其状态必须是 `pending`、`fulfilled`、`rejected` 这 3 种中的其中一种。

2.1.1 当处于 `pending` 状态时：
	2.1.1.1 可以转换到 `fulfilled` 或 `rejected` 状态。

2.1.2 当处于 `fulfilled` 状态时：
	2.1.2.1 不能再转换到其他的状态。
	2.1.2.2 拥有一个 `value`（即 `fulfilled` 值）。

2.1.3 当处于 `rejected` 状态时：
	2.1.3.1 不能再转换到其他的状态。
	2.1.3.2 拥有一个 `reason`（即 `rejected` 值）。

### 2.2 then

`promise` 必须提供 `then` 方法，且当 `promise` 的状态由 `pending` 切换到 `fulfilled` 后，由 `then` 方法注册的 `onFulfilled` 回调函数可以接收到 `promise` 的 `value`，或者当 `promise` 的状态由 `pending` 切换到 `rejected` 后，由 `then` 方法注册的 `onRejected` 回调函数可以接收到 `promise` 的 `reason`。`then` 方法的语法是

```js
promise.then( onFulfilled, onRejected );
```

2.2.1 `onFulfilled` 和 `onRejected` 都是可选的：
	2.2.1.1 如果 `onFulfilled` 不是一个函数，那么就忽略掉这个参数。
	2.2.1.2 如果 `onRejected` 不是一个函数，那么就忽略掉这个参数。

2.2.2 如果 `onFulfilled` 是一个函数：
	2.2.2.1 当 `promise` 切换至 `fulfilled` 状态之后，它就会被调用，并且 `value` 会作为它的第一个入参。
	2.2.2.2 在 `promise` 切换至 `fulfilled` 状态之前，它都不能被调用。
	2.2.2.3 它只能被调用至多一次。

2.2.3 如果 `onRejected` 是一个函数：
	2.2.3.1 当 `promise` 切换至 `rejected` 状态之后，它就会被调用，并且 `reason` 会作为它的第一个入参。
	2.2.3.2 在 `promise` 切换至 `rejected` 状态之前，它都不能被调用。
	2.2.3.3 它只能被调用至多一次。

2.2.4 `onFulfilled` 和 `onRejected` 函数被当作一个微任务或宏任务来调用。

> 一个 Promise 实例可以注册多个 `onFulfilled` 函数，当 Promise 实例敲定后，我们应该把每一个 `onFulfilled` 函数都放在独立的微/宏任务中去，还是应该把所有的 `onFulfilled` 函数都放在同一个微/宏任务中去呢？Promises/A+ 并没对此做出说明。
>
> 因此在实现 Promise 时，我沿用了浏览器运行时的做法，浏览器运行时将每一个 `onFulfilled` 函数都放在独立的微任务中去了，`onRejected` 函数也是如此。

2.2.5 `onFulfilled` 或 `onRejected` 要被当作函数来调用，而不是被当作方法来调用，具体来说，就是 `onFulfilled` 或 `onRejected` 在被调用时，其内部的 `this` 在严格模式下指向 `undefined`，在宽松模式下指向全局对象。

> 当 `onFulfilled` 或 `onRejected` 是箭头函数时，2.2.5 所描述的内容是不可能实现的，因为箭头函数内部的 `this` 指向只取决于其外部词法作用域的 `this` 指向，这是语法层面上限制，我们不可能突破这个限制。
>
> 请看下面的例子，`MyPromise` 中的箭头函数内 `this` 一定会等于其外部词法作用域（即全局作用域）的 `this`，因为全局作用域的 `this` 总是会指向 `Window` 对象（无论是处于严格模式还是宽松模式），所以箭头函数内的 `this` 也总是等于 `Window` 对象，哪怕箭头函数处于严格模式中，而这显然违反了 2.2.5。另外，浏览器运行时的 Promise 的实现也不遵循 2.2.5。
>
> ```html
> <script>
> 
> 	"use strtci";
> 
>     console.log( this );                                  // Window对象
>     MyPromise.resolve().then( _ => console.log( this ) ); // Window对象
>     
> 	Promise.resolve().then( _ => console.log( this ) );   // Window对象
> 
> </script>
> ```
>
> 我认为 Promises/A+ 并没有考虑到上述问题，因此在我的实现版本中，仅当 `onFulfilled` 或 `onRejected` 是由 `function` 关键字所声明的函数时，其行为才会遵循 2.2.5，如果 `onFulfilled` 或 `onRejected` 是箭头函数，那么其行为就会表现的和浏览器运行时的 Promise 一致。

2.2.6 一个 `promise` 可以多次调用 `then` 方法：
	2.2.6.1 当 `promise` 切换至 `fulfilled` 状态之后，`promise` 上的 `onFulfilled` 函数们都必须按照各自当初注册时的先后顺序来调用。
	2.2.6.2 当 `promise` 切换至 `rejected` 状态之后，`promise` 上的 `onRejected` 函数们都必须按照各自当初注册时的先后顺序来调用。

2.2.7 `then` 方法必须返回一个 `promise`，即 ：

```js
const promise_2 = promise_1.then( onFulfilled, onRejected );
```

​	2.2.7.1 如果 `onFulFilled` 或 `onRejected` 返回了一个值 `x`，那么就要运行 `promise 处理程序`，来确定 `promise_2` 的状态、`value`、`reason`，`promise 处理程序` 被表示为 `[[Resolve]]( promise_2, x )`。
​	2.2.7.2 如果 `onFulfilled` 或 `onRejected` 抛出了一个异常 `e`，那么 `promise_2` 就要切换到 `rejected` 状态，并用 `e` 来作为 `reason`。
​	2.2.7.3 如果 `onFulfilled` 不是一个函数，并且 `promise_1` 切换到了 `fulfilled` 状态，那么就要把 `promise_2` 切换到 `fulfilled` 状态，并且要用 `promise_1` 的 `value` 来作为 `promise_2` 的 `value`。
​	2.2.7.4 如果 `onRejected` 不是一个函数，并且 `promise_1` 切换到了 `rejected` 状态，那么就要把 `promise_2` 切换到 `rejected` 状态，并且要用 `promise_1` 的 `reason` 来作为 `promise_2` 的 `reason`。

> 关于 2.2.4：本文的 2.2.4 是我的个人理解，因为原文的表述非常晦涩。
>
> 关于 2.2.7：Promises/A+ 允许 `promise_2 === promise_1` 这种情况，并且实现者要主动在文档中说明你的实现是否允许这种情况，并且是在什么条件下才允许的。

### 2.3 promise 处理程序

`promise 处理程序` 是一个抽象的操作，它是 `promise` 的内部方法，它会接收一个 Promise 实例 `promise` 和一个值 `x`，我们把 `promise 处理程序表示为` `[[Resolve]]( promise, x )`。

> ECMAScript 规范会使用 `[[]]` 来表示内部属性或方法。

如果 `x` 是一个 `thenable` 且看起来像一个 Promise 实例的话，那么 `promise 处理程序` 就会试图让 `promise` 采用 `x` 的状态，否则 `promise 处理程序` 就会用 `x` 的值来敲定 `peomise`。

这种设计使得 Promise 变得更加通用，因为 Promise 可以接收和处理 `thenable`，只要 `thenable` 的 `then` 方法遵循 Promises/A+ 规范即可。这意味着，遵循 Promises/A+ 规范的 Promise 可以和那些不太遵循 Promises/A+ 规范但实现尚可良好的 Promise 一起使用。

`[[Resolve]]( promise, x )` 的执行逻辑如下：

2.3.1 如果 `x` 和 `promise` 指向同一个对象，那么就拒绝 `promise`，并用 `TypeError` 来作为它的 `reason`。

2.3.2 如果 `x` 是一个 Promise 实例，则令 `promise` 采用 `x` 的状态：
	2.3.2.1 当 `x` 处于 `pending` 状态时，`promise` 也要保持 `pending` 状态，直至 `x` 被敲定或拒绝。
	2.3.2.2 当 `x` 切换到 `fulfilled` 状态后，`promise` 也要立即切换到 `fulfilled` 状态，并用 `x` 的 `value` 来作为 `promise` 的 `value`。
	2.3.2.3 当 `x` 切换到 `rejected` 状态后，`promise` 也要立即切换到 `rejected` 状态，并用 `x` 的 `reason` 来作为 `promise` 的 `reason`。

2.3.3 如果 `x` 是一个对象或函数：
	2.3.3.1 新建一个 `then` 变量，并将 `x.then` 赋值给 `then`。
	2.3.3.2 如果获取 `x.then` 的值的时候，程序抛出了异常 `e`，那么就拒绝 `promise`，并用 `e` 来作为 `promise` 的 `reason`。
	2.3.3.3 如果 `then` 是一个函数，那么就调用 `then` 函数，并用 `x` 来作为它调用时的 `this`。并且 `then` 函数要接收 2 个回调函数来作为入参，第一个入参叫做 `resolvePromise`，第二个入参叫做 `rejectPromise`。
		2.3.3.3.1 如果 `resolvePromise` 被调用，并接收了一个值 `y` 来作为入参，那么就执行 `[[Resolve]]( promise, y )`。该 `y` 代表 `fulfilled` 值。
		2.3.3.3.2 如果 `rejectPromise` 被调用，并接收了一个值 `r` 来作为入参，那么就拒绝 `promise`，并用 `r` 来作为 `promise` 的 `reason`。该 `r` 代表 `rejected` 值。
		2.3.3.3.3 如果 `resolvePromise` 和 `rejectPromise` 都被调用了，那么就采用首次的调用，并忽略后续的调用。如果 `resolvePromise` 被用相同的参数调用了多次，那么就采用首次的调用，并忽略后续的调用。如果 `rejectPromise` 被相同的参数调用了多次，那么就采用首次的调用，并忽略后续的调用。
		2.3.3.3.3.4 如果执行 `then` 函数的过程中，程序抛出了异常 `e`：
			2.3.3.3.3.4.1 如果已经调用过了 `resolvePromise` 或 `rejectPromise`，那么就忽略 `e`。
			2.3.3.3.3.4.2 否则就拒绝 `promise`，并用 `e` 来作为 `promise` 的 `reason`。
	2.3.3.4 如果 `then` 不是一个函数，那么就敲定 `promise`，并用 `x` 来作为 `promise` 的 `value`。

> 关于 2.3.3.1，根据规范的描述，算法有可能会多次调用 `x.then` 函数，而 `x.then` 有可能在程序运行的过程中发生突变，为了保证每一次调用的 `x.then` 函数都是相同的，规范才会要求新建一个 `then` 变量来存储 `x.then` 的快照，并在后续的调用中操作 `then` 而不是 `x.then`。

2.3.4 如果 `x` 不是一个对象或函数，那么就敲定 `promise`，并用 `x` 来作为 `promise` 的 `value`。

如果一个 Promise 实例被一个 `thenable` 敲定了，且该 `thenable` 从属于一个循环的 `thenable` 链的话，那么 `[[Resolve]]( promise, thenable )` 就会递归调用自身，这便意味着算法/程序会陷入到无限递归之中。Promises/A+ 鼓励但不强制要求实现对这种无限递归的检测，如果检测到存在这种无限递归的话，那么就拒绝 `promise`，并用一个语意良好的 `TypeError` 来作为 `promise` 的 `reason`。

> 规范认为，不应该通过设定递归的深度上限来检测算法是否陷入到无限递归之中，因为真正的无限递归的深度是无限的。

## 参考资料

- [Promises/A+](https://promisesaplus.com)
- [Promises/A+ 的翻译](https://www.ituring.com.cn/article/66566)

[Promises/A+](https://promisesaplus.com) 自身比较晦涩，而 [Promises/A+ 的翻译](https://www.ituring.com.cn/article/66566) 是一份良好的简中版本，不过你应该在熟读前者的基础上，再结合后者来使用，而非单纯的依赖后者。

本文是一份比 [Promises/A+ 的翻译](https://www.ituring.com.cn/article/66566) 更好的简中版本，因为本文更加浅显易懂。