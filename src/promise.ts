class Promise2 {
    static x = null//类的属性
    state = 'pending'
    callbacks = []

    private resolveOrReject(state, data, i) {
        if (this.state !== 'pending') return
        this.state = state
        nextTick(() => {
            this.callbacks.forEach((handle) => {
                if (typeof handle[i] === 'function') {
                    let x
                    try {
                        x = handle[i].call(undefined, data)
                    } catch (e) {
                        return handle[2].reject(e)
                    }
                    handle[2].resolveWith(x)
                }
            })
        })
    }
    resolve(result) {
        this.resolveOrReject('fulfilled', result, 0)
    }
    reject(reason) {
        this.resolveOrReject('rejected', reason, 1)
    }
    constructor(fn) { //构造方法
        if (typeof fn !== 'function') {
            throw new Error('我只接收函数')
        }
        fn(this.resolve.bind(this), this.reject.bind(this))
    }
    then(succeed?, fail?) {
        const handle = []
        if (typeof succeed === 'function') {
            handle[0] = succeed
        }
        if (typeof fail === 'function') {
            handle[1] = fail
        }
        handle[2] = new Promise2(() => { })
        this.callbacks.push(handle)
        return handle[2]
    }


    resolveWith(x) {
        let promise2 = this
        if (promise2 === x) {
            this.resolveWithSelf()
        } else if (x instanceof Promise2) {
            this.resolveWithPromise(x)
        } else if (x instanceof Object) {
            this.resolveWithObject(x)
        } else {
            this.resolve(x)
        }
    }
    private getThen(x) {
        let then
        try {
            then = x.then
        } catch (e) {
            return this.reject(e)
        }
        return then
    }
    resolveWithSelf() {
        this.reject(new TypeError('参数类型错误'))
    }
    resolveWithPromise(x) {
        x.then((result) => {
            this.resolve(result)
        }, (reason) => {
            this.reject(reason)
        })
    }
    resolveWithThenable(x) {
        try {
            x.then((y) => {
                this.resolveWith(y)
            }, (r) => {
                this.reject(r)
            })
        } catch (e) {
            this.reject(e)
        }
    }
    resolveWithObject(x) {
        let then = this.getThen(x)
        if (then instanceof Function) {
            this.resolveWithThenable(x)
        } else {
            this.resolve(x)
        }
    }
}

export default Promise2

function nextTick(fn) {
    if (process?.nextTick) {
        return process.nextTick(fn)
    } else {
        //Vue中的nextTick的实现方式 MutationObserver
        let counter = 1
        let observer = new MutationObserver(fn)  //这个是浏览器的API，和process.nextTick的功能类似
        let textNode = document.createTextNode(String(counter))

        observer.observe(textNode, {
            characterData: true
        })
        //  改变counter
        counter += 1
        textNode.data = String(counter)
    }
}