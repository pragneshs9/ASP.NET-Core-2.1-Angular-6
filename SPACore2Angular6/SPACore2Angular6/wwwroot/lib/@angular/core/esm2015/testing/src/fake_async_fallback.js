/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * fakeAsync has been moved to zone.js
 * this file is for fallback in case old version of zone.js is used
 */
const /** @type {?} */ _Zone = typeof Zone !== 'undefined' ? Zone : null;
const /** @type {?} */ FakeAsyncTestZoneSpec = _Zone && _Zone['FakeAsyncTestZoneSpec'];
const /** @type {?} */ ProxyZoneSpec = _Zone && _Zone['ProxyZoneSpec'];
let /** @type {?} */ _fakeAsyncTestZoneSpec = null;
/**
 * Clears out the shared fake async zone for a test.
 * To be called in a global `beforeEach`.
 *
 * \@experimental
 * @return {?}
 */
export function resetFakeAsyncZoneFallback() {
    _fakeAsyncTestZoneSpec = null;
    // in node.js testing we may not have ProxyZoneSpec in which case there is nothing to reset.
    ProxyZoneSpec && ProxyZoneSpec.assertPresent().resetDelegate();
}
let /** @type {?} */ _inFakeAsyncCall = false;
/**
 * Wraps a function to be executed in the fakeAsync zone:
 * - microtasks are manually executed by calling `flushMicrotasks()`,
 * - timers are synchronous, `tick()` simulates the asynchronous passage of time.
 *
 * If there are any pending timers at the end of the function, an exception will be thrown.
 *
 * Can be used to wrap inject() calls.
 *
 * ## Example
 *
 * {\@example core/testing/ts/fake_async.ts region='basic'}
 *
 * \@experimental
 * @param {?} fn
 * @return {?} The function wrapped to be executed in the fakeAsync zone
 *
 */
export function fakeAsyncFallback(fn) {
    // Not using an arrow function to preserve context passed from call site
    return function (...args) {
        const /** @type {?} */ proxyZoneSpec = ProxyZoneSpec.assertPresent();
        if (_inFakeAsyncCall) {
            throw new Error('fakeAsync() calls can not be nested');
        }
        _inFakeAsyncCall = true;
        try {
            if (!_fakeAsyncTestZoneSpec) {
                if (proxyZoneSpec.getDelegate() instanceof FakeAsyncTestZoneSpec) {
                    throw new Error('fakeAsync() calls can not be nested');
                }
                _fakeAsyncTestZoneSpec = new FakeAsyncTestZoneSpec();
            }
            let /** @type {?} */ res;
            const /** @type {?} */ lastProxyZoneSpec = proxyZoneSpec.getDelegate();
            proxyZoneSpec.setDelegate(_fakeAsyncTestZoneSpec);
            try {
                res = fn.apply(this, args);
                flushMicrotasksFallback();
            }
            finally {
                proxyZoneSpec.setDelegate(lastProxyZoneSpec);
            }
            if (_fakeAsyncTestZoneSpec.pendingPeriodicTimers.length > 0) {
                throw new Error(`${_fakeAsyncTestZoneSpec.pendingPeriodicTimers.length} ` +
                    `periodic timer(s) still in the queue.`);
            }
            if (_fakeAsyncTestZoneSpec.pendingTimers.length > 0) {
                throw new Error(`${_fakeAsyncTestZoneSpec.pendingTimers.length} timer(s) still in the queue.`);
            }
            return res;
        }
        finally {
            _inFakeAsyncCall = false;
            resetFakeAsyncZoneFallback();
        }
    };
}
/**
 * @return {?}
 */
function _getFakeAsyncZoneSpec() {
    if (_fakeAsyncTestZoneSpec == null) {
        throw new Error('The code should be running in the fakeAsync zone to call this function');
    }
    return _fakeAsyncTestZoneSpec;
}
/**
 * Simulates the asynchronous passage of time for the timers in the fakeAsync zone.
 *
 * The microtasks queue is drained at the very start of this function and after any timer callback
 * has been executed.
 *
 * ## Example
 *
 * {\@example core/testing/ts/fake_async.ts region='basic'}
 *
 * \@experimental
 * @param {?=} millis
 * @return {?}
 */
export function tickFallback(millis = 0) {
    _getFakeAsyncZoneSpec().tick(millis);
}
/**
 * Simulates the asynchronous passage of time for the timers in the fakeAsync zone by
 * draining the macrotask queue until it is empty. The returned value is the milliseconds
 * of time that would have been elapsed.
 *
 * \@experimental
 * @param {?=} maxTurns
 * @return {?} The simulated time elapsed, in millis.
 *
 */
export function flushFallback(maxTurns) {
    return _getFakeAsyncZoneSpec().flush(maxTurns);
}
/**
 * Discard all remaining periodic tasks.
 *
 * \@experimental
 * @return {?}
 */
export function discardPeriodicTasksFallback() {
    const /** @type {?} */ zoneSpec = _getFakeAsyncZoneSpec();
    const /** @type {?} */ pendingTimers = zoneSpec.pendingPeriodicTimers;
    zoneSpec.pendingPeriodicTimers.length = 0;
}
/**
 * Flush any pending microtasks.
 *
 * \@experimental
 * @return {?}
 */
export function flushMicrotasksFallback() {
    _getFakeAsyncZoneSpec().flushMicrotasks();
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZV9hc3luY19mYWxsYmFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvdGVzdGluZy9zcmMvZmFrZV9hc3luY19mYWxsYmFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFZQSx1QkFBTSxLQUFLLEdBQVEsT0FBTyxJQUFJLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUM3RCx1QkFBTSxxQkFBcUIsR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFJdEUsdUJBQU0sYUFBYSxHQUNmLEtBQUssSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFcEMscUJBQUksc0JBQXNCLEdBQVEsSUFBSSxDQUFDOzs7Ozs7OztBQVF2QyxNQUFNO0lBQ0osc0JBQXNCLEdBQUcsSUFBSSxDQUFDOztJQUU5QixhQUFhLElBQUksYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO0NBQ2hFO0FBRUQscUJBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0I3QixNQUFNLDRCQUE0QixFQUFZOztJQUU1QyxPQUFPLFVBQVMsR0FBRyxJQUFXO1FBQzVCLHVCQUFNLGFBQWEsR0FBRyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDcEQsSUFBSSxnQkFBZ0IsRUFBRTtZQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7U0FDeEQ7UUFDRCxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSTtZQUNGLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtnQkFDM0IsSUFBSSxhQUFhLENBQUMsV0FBVyxFQUFFLFlBQVkscUJBQXFCLEVBQUU7b0JBQ2hFLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztpQkFDeEQ7Z0JBRUQsc0JBQXNCLEdBQUcsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO2FBQ3REO1lBRUQscUJBQUksR0FBUSxDQUFDO1lBQ2IsdUJBQU0saUJBQWlCLEdBQUcsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3RELGFBQWEsQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNsRCxJQUFJO2dCQUNGLEdBQUcsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDM0IsdUJBQXVCLEVBQUUsQ0FBQzthQUMzQjtvQkFBUztnQkFDUixhQUFhLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDOUM7WUFFRCxJQUFJLHNCQUFzQixDQUFDLHFCQUFxQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzNELE1BQU0sSUFBSSxLQUFLLENBQ1gsR0FBRyxzQkFBc0IsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEdBQUc7b0JBQ3pELHVDQUF1QyxDQUFDLENBQUM7YUFDOUM7WUFFRCxJQUFJLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNuRCxNQUFNLElBQUksS0FBSyxDQUNYLEdBQUcsc0JBQXNCLENBQUMsYUFBYSxDQUFDLE1BQU0sK0JBQStCLENBQUMsQ0FBQzthQUNwRjtZQUNELE9BQU8sR0FBRyxDQUFDO1NBQ1o7Z0JBQVM7WUFDUixnQkFBZ0IsR0FBRyxLQUFLLENBQUM7WUFDekIsMEJBQTBCLEVBQUUsQ0FBQztTQUM5QjtLQUNGLENBQUM7Q0FDSDs7OztBQUVEO0lBQ0UsSUFBSSxzQkFBc0IsSUFBSSxJQUFJLEVBQUU7UUFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx3RUFBd0UsQ0FBQyxDQUFDO0tBQzNGO0lBQ0QsT0FBTyxzQkFBc0IsQ0FBQztDQUMvQjs7Ozs7Ozs7Ozs7Ozs7O0FBY0QsTUFBTSx1QkFBdUIsU0FBaUIsQ0FBQztJQUM3QyxxQkFBcUIsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUN0Qzs7Ozs7Ozs7Ozs7QUFZRCxNQUFNLHdCQUF3QixRQUFpQjtJQUM3QyxPQUFPLHFCQUFxQixFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ2hEOzs7Ozs7O0FBT0QsTUFBTTtJQUNKLHVCQUFNLFFBQVEsR0FBRyxxQkFBcUIsRUFBRSxDQUFDO0lBQ3pDLHVCQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMscUJBQXFCLENBQUM7SUFDckQsUUFBUSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Q0FDM0M7Ozs7Ozs7QUFPRCxNQUFNO0lBQ0oscUJBQXFCLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztDQUMzQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBmYWtlQXN5bmMgaGFzIGJlZW4gbW92ZWQgdG8gem9uZS5qc1xuICogdGhpcyBmaWxlIGlzIGZvciBmYWxsYmFjayBpbiBjYXNlIG9sZCB2ZXJzaW9uIG9mIHpvbmUuanMgaXMgdXNlZFxuICovXG5jb25zdCBfWm9uZTogYW55ID0gdHlwZW9mIFpvbmUgIT09ICd1bmRlZmluZWQnID8gWm9uZSA6IG51bGw7XG5jb25zdCBGYWtlQXN5bmNUZXN0Wm9uZVNwZWMgPSBfWm9uZSAmJiBfWm9uZVsnRmFrZUFzeW5jVGVzdFpvbmVTcGVjJ107XG50eXBlIFByb3h5Wm9uZVNwZWMgPSB7XG4gIHNldERlbGVnYXRlKGRlbGVnYXRlU3BlYzogWm9uZVNwZWMpOiB2b2lkOyBnZXREZWxlZ2F0ZSgpOiBab25lU3BlYzsgcmVzZXREZWxlZ2F0ZSgpOiB2b2lkO1xufTtcbmNvbnN0IFByb3h5Wm9uZVNwZWM6IHtnZXQoKTogUHJveHlab25lU3BlYzsgYXNzZXJ0UHJlc2VudDogKCkgPT4gUHJveHlab25lU3BlY30gPVxuICAgIF9ab25lICYmIF9ab25lWydQcm94eVpvbmVTcGVjJ107XG5cbmxldCBfZmFrZUFzeW5jVGVzdFpvbmVTcGVjOiBhbnkgPSBudWxsO1xuXG4vKipcbiAqIENsZWFycyBvdXQgdGhlIHNoYXJlZCBmYWtlIGFzeW5jIHpvbmUgZm9yIGEgdGVzdC5cbiAqIFRvIGJlIGNhbGxlZCBpbiBhIGdsb2JhbCBgYmVmb3JlRWFjaGAuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRGYWtlQXN5bmNab25lRmFsbGJhY2soKSB7XG4gIF9mYWtlQXN5bmNUZXN0Wm9uZVNwZWMgPSBudWxsO1xuICAvLyBpbiBub2RlLmpzIHRlc3Rpbmcgd2UgbWF5IG5vdCBoYXZlIFByb3h5Wm9uZVNwZWMgaW4gd2hpY2ggY2FzZSB0aGVyZSBpcyBub3RoaW5nIHRvIHJlc2V0LlxuICBQcm94eVpvbmVTcGVjICYmIFByb3h5Wm9uZVNwZWMuYXNzZXJ0UHJlc2VudCgpLnJlc2V0RGVsZWdhdGUoKTtcbn1cblxubGV0IF9pbkZha2VBc3luY0NhbGwgPSBmYWxzZTtcblxuLyoqXG4gKiBXcmFwcyBhIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGluIHRoZSBmYWtlQXN5bmMgem9uZTpcbiAqIC0gbWljcm90YXNrcyBhcmUgbWFudWFsbHkgZXhlY3V0ZWQgYnkgY2FsbGluZyBgZmx1c2hNaWNyb3Rhc2tzKClgLFxuICogLSB0aW1lcnMgYXJlIHN5bmNocm9ub3VzLCBgdGljaygpYCBzaW11bGF0ZXMgdGhlIGFzeW5jaHJvbm91cyBwYXNzYWdlIG9mIHRpbWUuXG4gKlxuICogSWYgdGhlcmUgYXJlIGFueSBwZW5kaW5nIHRpbWVycyBhdCB0aGUgZW5kIG9mIHRoZSBmdW5jdGlvbiwgYW4gZXhjZXB0aW9uIHdpbGwgYmUgdGhyb3duLlxuICpcbiAqIENhbiBiZSB1c2VkIHRvIHdyYXAgaW5qZWN0KCkgY2FsbHMuXG4gKlxuICogIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3Rlc3RpbmcvdHMvZmFrZV9hc3luYy50cyByZWdpb249J2Jhc2ljJ31cbiAqXG4gKiBAcGFyYW0gZm5cbiAqIEByZXR1cm5zIFRoZSBmdW5jdGlvbiB3cmFwcGVkIHRvIGJlIGV4ZWN1dGVkIGluIHRoZSBmYWtlQXN5bmMgem9uZVxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZha2VBc3luY0ZhbGxiYWNrKGZuOiBGdW5jdGlvbik6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55IHtcbiAgLy8gTm90IHVzaW5nIGFuIGFycm93IGZ1bmN0aW9uIHRvIHByZXNlcnZlIGNvbnRleHQgcGFzc2VkIGZyb20gY2FsbCBzaXRlXG4gIHJldHVybiBmdW5jdGlvbiguLi5hcmdzOiBhbnlbXSkge1xuICAgIGNvbnN0IHByb3h5Wm9uZVNwZWMgPSBQcm94eVpvbmVTcGVjLmFzc2VydFByZXNlbnQoKTtcbiAgICBpZiAoX2luRmFrZUFzeW5jQ2FsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdmYWtlQXN5bmMoKSBjYWxscyBjYW4gbm90IGJlIG5lc3RlZCcpO1xuICAgIH1cbiAgICBfaW5GYWtlQXN5bmNDYWxsID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfZmFrZUFzeW5jVGVzdFpvbmVTcGVjKSB7XG4gICAgICAgIGlmIChwcm94eVpvbmVTcGVjLmdldERlbGVnYXRlKCkgaW5zdGFuY2VvZiBGYWtlQXN5bmNUZXN0Wm9uZVNwZWMpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Zha2VBc3luYygpIGNhbGxzIGNhbiBub3QgYmUgbmVzdGVkJyk7XG4gICAgICAgIH1cblxuICAgICAgICBfZmFrZUFzeW5jVGVzdFpvbmVTcGVjID0gbmV3IEZha2VBc3luY1Rlc3Rab25lU3BlYygpO1xuICAgICAgfVxuXG4gICAgICBsZXQgcmVzOiBhbnk7XG4gICAgICBjb25zdCBsYXN0UHJveHlab25lU3BlYyA9IHByb3h5Wm9uZVNwZWMuZ2V0RGVsZWdhdGUoKTtcbiAgICAgIHByb3h5Wm9uZVNwZWMuc2V0RGVsZWdhdGUoX2Zha2VBc3luY1Rlc3Rab25lU3BlYyk7XG4gICAgICB0cnkge1xuICAgICAgICByZXMgPSBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgZmx1c2hNaWNyb3Rhc2tzRmFsbGJhY2soKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHByb3h5Wm9uZVNwZWMuc2V0RGVsZWdhdGUobGFzdFByb3h5Wm9uZVNwZWMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoX2Zha2VBc3luY1Rlc3Rab25lU3BlYy5wZW5kaW5nUGVyaW9kaWNUaW1lcnMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgJHtfZmFrZUFzeW5jVGVzdFpvbmVTcGVjLnBlbmRpbmdQZXJpb2RpY1RpbWVycy5sZW5ndGh9IGAgK1xuICAgICAgICAgICAgYHBlcmlvZGljIHRpbWVyKHMpIHN0aWxsIGluIHRoZSBxdWV1ZS5gKTtcbiAgICAgIH1cblxuICAgICAgaWYgKF9mYWtlQXN5bmNUZXN0Wm9uZVNwZWMucGVuZGluZ1RpbWVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGAke19mYWtlQXN5bmNUZXN0Wm9uZVNwZWMucGVuZGluZ1RpbWVycy5sZW5ndGh9IHRpbWVyKHMpIHN0aWxsIGluIHRoZSBxdWV1ZS5gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIF9pbkZha2VBc3luY0NhbGwgPSBmYWxzZTtcbiAgICAgIHJlc2V0RmFrZUFzeW5jWm9uZUZhbGxiYWNrKCk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBfZ2V0RmFrZUFzeW5jWm9uZVNwZWMoKTogYW55IHtcbiAgaWYgKF9mYWtlQXN5bmNUZXN0Wm9uZVNwZWMgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIGNvZGUgc2hvdWxkIGJlIHJ1bm5pbmcgaW4gdGhlIGZha2VBc3luYyB6b25lIHRvIGNhbGwgdGhpcyBmdW5jdGlvbicpO1xuICB9XG4gIHJldHVybiBfZmFrZUFzeW5jVGVzdFpvbmVTcGVjO1xufVxuXG4vKipcbiAqIFNpbXVsYXRlcyB0aGUgYXN5bmNocm9ub3VzIHBhc3NhZ2Ugb2YgdGltZSBmb3IgdGhlIHRpbWVycyBpbiB0aGUgZmFrZUFzeW5jIHpvbmUuXG4gKlxuICogVGhlIG1pY3JvdGFza3MgcXVldWUgaXMgZHJhaW5lZCBhdCB0aGUgdmVyeSBzdGFydCBvZiB0aGlzIGZ1bmN0aW9uIGFuZCBhZnRlciBhbnkgdGltZXIgY2FsbGJhY2tcbiAqIGhhcyBiZWVuIGV4ZWN1dGVkLlxuICpcbiAqICMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90ZXN0aW5nL3RzL2Zha2VfYXN5bmMudHMgcmVnaW9uPSdiYXNpYyd9XG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gdGlja0ZhbGxiYWNrKG1pbGxpczogbnVtYmVyID0gMCk6IHZvaWQge1xuICBfZ2V0RmFrZUFzeW5jWm9uZVNwZWMoKS50aWNrKG1pbGxpcyk7XG59XG5cbi8qKlxuICogU2ltdWxhdGVzIHRoZSBhc3luY2hyb25vdXMgcGFzc2FnZSBvZiB0aW1lIGZvciB0aGUgdGltZXJzIGluIHRoZSBmYWtlQXN5bmMgem9uZSBieVxuICogZHJhaW5pbmcgdGhlIG1hY3JvdGFzayBxdWV1ZSB1bnRpbCBpdCBpcyBlbXB0eS4gVGhlIHJldHVybmVkIHZhbHVlIGlzIHRoZSBtaWxsaXNlY29uZHNcbiAqIG9mIHRpbWUgdGhhdCB3b3VsZCBoYXZlIGJlZW4gZWxhcHNlZC5cbiAqXG4gKiBAcGFyYW0gbWF4VHVybnNcbiAqIEByZXR1cm5zIFRoZSBzaW11bGF0ZWQgdGltZSBlbGFwc2VkLCBpbiBtaWxsaXMuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gZmx1c2hGYWxsYmFjayhtYXhUdXJucz86IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBfZ2V0RmFrZUFzeW5jWm9uZVNwZWMoKS5mbHVzaChtYXhUdXJucyk7XG59XG5cbi8qKlxuICogRGlzY2FyZCBhbGwgcmVtYWluaW5nIHBlcmlvZGljIHRhc2tzLlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRQZXJpb2RpY1Rhc2tzRmFsbGJhY2soKTogdm9pZCB7XG4gIGNvbnN0IHpvbmVTcGVjID0gX2dldEZha2VBc3luY1pvbmVTcGVjKCk7XG4gIGNvbnN0IHBlbmRpbmdUaW1lcnMgPSB6b25lU3BlYy5wZW5kaW5nUGVyaW9kaWNUaW1lcnM7XG4gIHpvbmVTcGVjLnBlbmRpbmdQZXJpb2RpY1RpbWVycy5sZW5ndGggPSAwO1xufVxuXG4vKipcbiAqIEZsdXNoIGFueSBwZW5kaW5nIG1pY3JvdGFza3MuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gZmx1c2hNaWNyb3Rhc2tzRmFsbGJhY2soKTogdm9pZCB7XG4gIF9nZXRGYWtlQXN5bmNab25lU3BlYygpLmZsdXNoTWljcm90YXNrcygpO1xufSJdfQ==