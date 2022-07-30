# Promises/A+

一个开放的 JavaScript Promise 标准。

`promise` 代表异步操作的最终结果，我们主要通过 `promise` 的 `then` 方法来使用它，`then` 方法用于注册回调函数，回调函数可以接收到 `promise` 在 `fulfilled` 或 `rejected` 状态下的值。

该规范详细说明了 `then` 方法的行为规范，providing an interoperable base which all Promises/A+ conformant promise implementations can be depended on to provide。所以我们可以认为这个规范是非常稳定的。虽然 Promises/A+ 组织可能会采用一些向后兼容的小修改来解决新发现的极端情况，但是组织只有在经过深思熟虑、讨论和测试之后才会采用无法向后兼容的大修改。

Promises/A+ 厘清了早期的 Promises/A 提案的行为规范，extending it to cover de facto behaviors，并省略掉了一些模糊的与存疑的部分。

最后，Promises/A+ 规范不涉及如何创建、解决、拒绝 `promise` ，而是专注于定义 `then` 方法的行为规范，不过该规范在未来也可能会涉及到创建、解决、拒绝 `promise` 的事情。

## 1.术语

1.1 `promise` 是 Promise 构造函数的实例，是一个具有 `then` 方法的对象或函数，且其 `then` 方法完全符合本规范的要求。

1.2 `thenable` 是一个具有 `then` 方法的对象或函数。

1.3 `value` 是 `promise` 的 `fulfilled` 值，代表 `promise` 被解决时的值。

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

2.2.5 执行 `onFulfilled` 或 `onRejected` 函数时，其内部的 `this` 在严格模式下指向 `undefined`，在宽松模式下指向全局对象。

2.2.6 一个 `promise` 可以多次调用 `then` 方法：
	2.2.6.1 当 `promise` 切换至 `fulfilled` 状态之后，`promise` 上的 `onFulfilled` 函数们都必须按照各自当初注册时的先后顺序来调用。
	2.2.6.2 当 `promise` 切换至 `rejected` 状态之后，`promise` 上的 `onRejected` 函数们都必须按照各自当初注册时的先后顺序来调用。

2.2.7 `then` 方法必须返回一个 `promise`，即 ：

```js
const promise_2 = promise_1.then( onFulfilled, onRejected );
```

​	2.2.7.1 如果 `onFulFilled` 或 `onRejected` 返回了一个值 `x`，那么就要运行 `promise 处理程序`，来确定 `promise_2` 的 `value` 或 `reason`，`promise 处理程序` 被表示为 `[[Resolve]]( promise_2, x )`。
​	2.2.7.2 如果 `onFulfilled` 或 `onRejected` 抛出了一个异常 `e`，那么 `promise_2` 就要切换到 `rejected` 状态，并用 `e` 来作为 `reason`。
​	2.2.7.3 如果 `onFulfilled` 不是一个函数，并且 `promise_1` 切换到了 `fulfilled` 状态，那么就要把 `promise_2` 切换到 `fulfilled` 状态，并且要用 `promise_1` 的 `value` 来作为 `promise_2` 的 `value`。
​	2.2.7.4 如果 `onRejected` 不是一个函数，并且 `promise_1` 切换到了 `rejected` 状态，那么就要把 `promise_2` 切换到 `rejected` 状态，并且要用 `promise_1` 的 `reason` 来作为 `promise_2` 的 `reason`。

> 关于 2.2.4：本文的 2.2.4 是我的个人理解，因为原文的表述非常晦涩。
>
> 关于 2.2.7：Promises/A+ 还允许 `promise_2 === promise_1` 这种情况，不过这是不做要求的、额外的实现。

### 2.3 promise 处理程序

`promise 处理程序` 是一个抽象的操作，它是 `promise` 的内部方法，它会接收一个 Promise 实例 `promise` 和一个值 `x`，我们把 `promise 处理程序表示为` `[[Resolve]]( promise, x )`。如果 `x` 是一个 `thenable` 且看起来像一个 Promise 实例的话，那么 `promise 处理程序` 就会试图返回 `promise`，并且用 `x` 的状态来作为这个 `promise` 的状态。否则的话，`promise 处理程序` 就会用 `x` 的值来解决或拒绝 `promise`。

这种设计更加

只要 `thanble` 的 `then` 方法符合 Promises/A+ 规范，那么 `promise 处理程序` 就可以像使用 `promise` 的 `then` 方法一样，来使用 `thenable` 的 `then` 方法，比如进行链式调用。另外，它也可以吸收那些不符合 Promises/A+ 规范的 `then` 方法。

> ECMAScript 使用 `[[]]` 来表示内部属性或方法。

`[[Resolve]]( promise, x )` 的执行步骤如下：

2.3.1 如果 `promise` 和 `x` 严格相等