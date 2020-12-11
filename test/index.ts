import * as chai from 'chai'
import Promise from '../src/promise'
import * as sinon from 'sinon'
import * as sinonChai from "sinon-chai";

chai.use(sinonChai)
const assert = chai.assert

describe('Promise', () => {
    it('它是一个类', () => {
        assert.isFunction(Promise)
        assert.isObject(Promise.prototype)
    })
    it('new Promise 如果接受的不是一个函数就会报错', () => {
        assert.throw(() => { // 预测一个函数会报错
            //@ts-ignore
            new Promise()
        })
        assert.throw(() => { // 预测一个函数会报错
            //@ts-ignore
            new Promise(1)
        })
        assert.throw(() => { // 预测一个函数会报错
            //@ts-ignore
            new Promise(false)
        })
    })
    it('new Promise()会生成一个对象，这个对象有then方法', () => {
        const promise = new Promise(() => { })
        assert.isFunction(promise.then)
    })
    it('new Promise(fn)中的fn是立即执行的', () => {
        let fn = sinon.fake()
        new Promise(fn)
        //@ts-ignore
        assert(fn.called)
    })
    it('new Promise(fn)中的fn执行的时候，接受两个函数为参数resolve，reject', (done) => {
        new Promise((resolve, reject) => {
            assert.isFunction(resolve)
            assert.isFunction(reject)
            done() // 保证这个promise一定执行了
        })
    })
    it('promise.then(success)中的success会在resolve被调用的时候执行', (done) => {
        let success = sinon.fake()
        const promise = new Promise((resolve, reject) => {
            //该函数没有执行
            assert.isFalse(success.called)
            resolve()
            //该函数执行了
            setTimeout(() => {
                assert.isTrue(success.called)
                done()
            })
        })
        //@ts-ignore
        promise.then(success)
    })
    it('promise.then(fail)中的success会在reject被调用的时候执行', (done) => {
        let fail = sinon.fake()
        const promise = new Promise((resolve, reject) => {
            //该函数没有执行
            assert.isFalse(fail.called)
            reject()
            //该函数执行了
            setTimeout(() => {
                assert.isTrue(fail.called)
                done()
            })
        })
        //@ts-ignore
        promise.then(null, fail)
    })
    it('2.2.1', () => {
        const promise = new Promise(() => { })
        promise.then(false, null)
    })
    it('2.2.2', (done) => {
        const succeed = sinon.fake()
        const promise = new Promise((resolve) => {
            assert.isFalse(succeed.called)
            resolve(233)
            resolve(2333)
            setTimeout(() => {
                assert(promise.state === 'fulfilled')
                assert.isTrue(succeed.calledOnce)
                assert(succeed.calledWith(233))
                done()
            }, 0)
        })
        promise.then(succeed)
    })
    it('2.2.3', (done) => {
        const fail = sinon.fake()
        const promise = new Promise((resolve, reject) => {
            assert.isFalse(fail.called)
            reject(233)
            reject(2333)
            setTimeout(() => {
                assert(promise.state === 'rejected')
                assert.isTrue(fail.calledOnce)
                assert(fail.calledWith(233))
                done()
            }, 0)
        })
        promise.then(null, fail)
    })
    it('2.2.4 在我的代码执行完之前，不可以调用then后面的函数', (done) => {
        const succeed = sinon.fake()
        const promise = new Promise((resolve) => {
            resolve()
        })
        promise.then(succeed)
        assert.isFalse(succeed.called)
        setTimeout(() => {
            assert.isTrue(succeed.called)
            done()
        }, 0)
    })
    it('2.2.4 s\失败', (done) => {
        const fail = sinon.fake()
        const promise = new Promise((resolve, reject) => {
            reject()
        })
        promise.then(null, fail)
        assert.isFalse(fail.called)
        setTimeout(() => {
            assert.isTrue(fail.called)
            done()
        }, 0)
    })
    it('2.2.5', (done) => {
        const promise = new Promise((resolve) => {
            resolve()
        })
        promise.then(function () {
            "use strict" //防止this为空时被自动置为window
            assert(this === undefined)
            done()
        })
    })
    it('2.2.6 then可以在同一个promise里多次被调用', (done) => {
        const promise = new Promise((resolve) => {
            resolve()
        })
        const callbacks = [sinon.fake(), sinon.fake(), sinon.fake()]
        promise.then(callbacks[0])
        promise.then(callbacks[1])
        promise.then(callbacks[2])
        setTimeout(() => {
            assert(callbacks[0].called)
            assert(callbacks[1].calledAfter(callbacks[0]))
            assert(callbacks[1].called)
            assert(callbacks[2].calledAfter(callbacks[1]))
            assert(callbacks[2].called)
            done()
        }, 0)
    })
    it('2.2.6.2 then可以在同一个promise里多次被调用,拒绝', (done) => {
        const promise = new Promise((resolve, reject) => {
            reject()
        })
        const callbacks = [sinon.fake(), sinon.fake(), sinon.fake()]
        promise.then(null, callbacks[0])
        promise.then(null, callbacks[1])
        promise.then(null, callbacks[2])
        setTimeout(() => {
            assert(callbacks[0].called)
            assert(callbacks[1].calledAfter(callbacks[0]))
            assert(callbacks[1].called)
            assert(callbacks[2].calledAfter(callbacks[1]))
            assert(callbacks[2].called)
            done()
        }, 0)
    })
})