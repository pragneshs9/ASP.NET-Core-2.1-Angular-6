/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFactoryResolver, NgZone } from '@angular/core';
import { $COMPILE, $INJECTOR, $PARSE, INJECTOR_KEY, LAZY_MODULE_REF, REQUIRE_INJECTOR, REQUIRE_NG_MODEL } from './constants';
import { DowngradeComponentAdapter } from './downgrade_component_adapter';
import { controllerKey, getComponentName, isFunction } from './util';
/**
 * @description
 *
 * A helper function that allows an Angular component to be used from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * This helper function returns a factory function to be used for registering
 * an AngularJS wrapper directive for "downgrading" an Angular component.
 *
 * ### Examples
 *
 * Let's assume that you have an Angular component called `ng2Heroes` that needs
 * to be made available in AngularJS templates.
 *
 * {@example upgrade/static/ts/module.ts region="ng2-heroes"}
 *
 * We must create an AngularJS [directive](https://docs.angularjs.org/guide/directive)
 * that will make this Angular component available inside AngularJS templates.
 * The `downgradeComponent()` function returns a factory function that we
 * can use to define the AngularJS directive that wraps the "downgraded" component.
 *
 * {@example upgrade/static/ts/module.ts region="ng2-heroes-wrapper"}
 *
 * @param info contains information about the Component that is being downgraded:
 *
 * * `component: Type<any>`: The type of the Component that will be downgraded
 *
 * @returns a factory function that can be used to register the component in an
 * AngularJS module.
 *
 * @experimental
 */
export function downgradeComponent(info) {
    var directiveFactory = function ($compile, $injector, $parse) {
        // When using `UpgradeModule`, we don't need to ensure callbacks to Angular APIs (e.g. change
        // detection) are run inside the Angular zone, because `$digest()` will be run inside the zone
        // (except if explicitly escaped, in which case we shouldn't force it back in).
        // When using `downgradeModule()` though, we need to ensure such callbacks are run inside the
        // Angular zone.
        var needsNgZone = false;
        var wrapCallback = function (cb) { return cb; };
        var ngZone;
        return {
            restrict: 'E',
            terminal: true,
            require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
            link: function (scope, element, attrs, required) {
                // We might have to compile the contents asynchronously, because this might have been
                // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
                // been compiled.
                var ngModel = required[1];
                var parentInjector = required[0];
                var ranAsync = false;
                if (!parentInjector) {
                    var lazyModuleRef = $injector.get(LAZY_MODULE_REF);
                    needsNgZone = lazyModuleRef.needsNgZone;
                    parentInjector = lazyModuleRef.injector || lazyModuleRef.promise;
                }
                var doDowngrade = function (injector) {
                    var componentFactoryResolver = injector.get(ComponentFactoryResolver);
                    var componentFactory = componentFactoryResolver.resolveComponentFactory(info.component);
                    if (!componentFactory) {
                        throw new Error('Expecting ComponentFactory for: ' + getComponentName(info.component));
                    }
                    var injectorPromise = new ParentInjectorPromise(element);
                    var facade = new DowngradeComponentAdapter(element, attrs, scope, ngModel, injector, $injector, $compile, $parse, componentFactory, wrapCallback);
                    var projectableNodes = facade.compileContents();
                    facade.createComponent(projectableNodes);
                    facade.setupInputs(needsNgZone, info.propagateDigest);
                    facade.setupOutputs();
                    facade.registerCleanup();
                    injectorPromise.resolve(facade.getInjector());
                    if (ranAsync) {
                        // If this is run async, it is possible that it is not run inside a
                        // digest and initial input values will not be detected.
                        scope.$evalAsync(function () { });
                    }
                };
                var downgradeFn = !needsNgZone ? doDowngrade : function (injector) {
                    if (!ngZone) {
                        ngZone = injector.get(NgZone);
                        wrapCallback = function (cb) { return function () {
                            return NgZone.isInAngularZone() ? cb() : ngZone.run(cb);
                        }; };
                    }
                    wrapCallback(function () { return doDowngrade(injector); })();
                };
                if (isThenable(parentInjector)) {
                    parentInjector.then(downgradeFn);
                }
                else {
                    downgradeFn(parentInjector);
                }
                ranAsync = true;
            }
        };
    };
    // bracket-notation because of closure - see #14441
    directiveFactory['$inject'] = [$COMPILE, $INJECTOR, $PARSE];
    return directiveFactory;
}
/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of Angular 1's $compile.
 */
var ParentInjectorPromise = /** @class */ (function () {
    function ParentInjectorPromise(element) {
        this.element = element;
        this.injectorKey = controllerKey(INJECTOR_KEY);
        this.callbacks = [];
        // Store the promise on the element.
        element.data(this.injectorKey, this);
    }
    ParentInjectorPromise.prototype.then = function (callback) {
        if (this.injector) {
            callback(this.injector);
        }
        else {
            this.callbacks.push(callback);
        }
    };
    ParentInjectorPromise.prototype.resolve = function (injector) {
        this.injector = injector;
        // Store the real injector on the element.
        this.element.data(this.injectorKey, injector);
        // Release the element to prevent memory leaks.
        this.element = null;
        // Run the queued callbacks.
        this.callbacks.forEach(function (callback) { return callback(injector); });
        this.callbacks.length = 0;
    };
    return ParentInjectorPromise;
}());
function isThenable(obj) {
    return isFunction(obj.then);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9jb21tb24vZG93bmdyYWRlX2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQW1CLHdCQUF3QixFQUFZLE1BQU0sRUFBTyxNQUFNLGVBQWUsQ0FBQztBQUdqRyxPQUFPLEVBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUMzSCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUN4RSxPQUFPLEVBQWdCLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFPbEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlDRztBQUNILE1BQU0sNkJBQTZCLElBVWxDO0lBQ0MsSUFBTSxnQkFBZ0IsR0FDVyxVQUNJLFFBQWlDLEVBQ2pDLFNBQW1DLEVBQ25DLE1BQTZCO1FBQ2hFLDZGQUE2RjtRQUM3Riw4RkFBOEY7UUFDOUYsK0VBQStFO1FBQy9FLDZGQUE2RjtRQUM3RixnQkFBZ0I7UUFDaEIsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksWUFBWSxHQUFHLFVBQUksRUFBVyxJQUFLLE9BQUEsRUFBRSxFQUFGLENBQUUsQ0FBQztRQUMxQyxJQUFJLE1BQWMsQ0FBQztRQUVuQixPQUFPO1lBQ0wsUUFBUSxFQUFFLEdBQUc7WUFDYixRQUFRLEVBQUUsSUFBSTtZQUNkLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDO1lBQzdDLElBQUksRUFBRSxVQUFDLEtBQXFCLEVB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QUN2RCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUNILDRCQUFDO0FBQUQsQ0FBQyxBQS9CRCxJQStCQztBQUVELG9CQUF1QixHQUFXO0lBQ2hDLE9BQU8sVUFBVSxDQUFFLEdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgSW5qZWN0b3IsIE5nWm9uZSwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi9hbmd1bGFyMSc7XG5pbXBvcnQgeyRDT01QSUxFLCAkSU5KRUNUT1IsICRQQVJTRSwgSU5KRUNUT1JfS0VZLCBMQVpZX01PRFVMRV9SRUYsIFJFUVVJUkVfSU5KRUNUT1IsIFJFUVVJUkVfTkdfTU9ERUx9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7RG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcn0gZnJvbSAnLi9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXInO1xuaW1wb3J0IHtMYXp5TW9kdWxlUmVmLCBjb250cm9sbGVyS2V5LCBnZXRDb21wb25lbnROYW1lLCBpc0Z1bmN0aW9ufSBmcm9tICcuL3V0aWwnO1xuXG5cbmludGVyZmFjZSBUaGVuYWJsZTxUPiB7XG4gIHRoZW4oY2FsbGJhY2s6ICh2YWx1ZTogVCkgPT4gYW55KTogYW55O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgYWxsb3dzIGFuIEFuZ3VsYXIgY29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFySlMuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBb1QgY29tcGlsYXRpb24qXG4gKlxuICogVGhpcyBoZWxwZXIgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdG8gYmUgdXNlZCBmb3IgcmVnaXN0ZXJpbmdcbiAqIGFuIEFuZ3VsYXJKUyB3cmFwcGVyIGRpcmVjdGl2ZSBmb3IgXCJkb3duZ3JhZGluZ1wiIGFuIEFuZ3VsYXIgY29tcG9uZW50LlxuICpcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIExldCdzIGFzc3VtZSB0aGF0IHlvdSBoYXZlIGFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbGxlZCBgbmcySGVyb2VzYCB0aGF0IG5lZWRzXG4gKiB0byBiZSBtYWRlIGF2YWlsYWJsZSBpbiBBbmd1bGFySlMgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9tb2R1bGUudHMgcmVnaW9uPVwibmcyLWhlcm9lc1wifVxuICpcbiAqIFdlIG11c3QgY3JlYXRlIGFuIEFuZ3VsYXJKUyBbZGlyZWN0aXZlXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9ndWlkZS9kaXJlY3RpdmUpXG4gKiB0aGF0IHdpbGwgbWFrZSB0aGlzIEFuZ3VsYXIgY29tcG9uZW50IGF2YWlsYWJsZSBpbnNpZGUgQW5ndWxhckpTIHRlbXBsYXRlcy5cbiAqIFRoZSBgZG93bmdyYWRlQ29tcG9uZW50KClgIGZ1bmN0aW9uIHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgd2VcbiAqIGNhbiB1c2UgdG8gZGVmaW5lIHRoZSBBbmd1bGFySlMgZGlyZWN0aXZlIHRoYXQgd3JhcHMgdGhlIFwiZG93bmdyYWRlZFwiIGNvbXBvbmVudC5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1oZXJvZXMtd3JhcHBlclwifVxuICpcbiAqIEBwYXJhbSBpbmZvIGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHRoZSBDb21wb25lbnQgdGhhdCBpcyBiZWluZyBkb3duZ3JhZGVkOlxuICpcbiAqICogYGNvbXBvbmVudDogVHlwZTxhbnk+YDogVGhlIHR5cGUgb2YgdGhlIENvbXBvbmVudCB0aGF0IHdpbGwgYmUgZG93bmdyYWRlZFxuICpcbiAqIEByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZ2lzdGVyIHRoZSBjb21wb25lbnQgaW4gYW5cbiAqIEFuZ3VsYXJKUyBtb2R1bGUuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gZG93bmdyYWRlQ29tcG9uZW50KGluZm86IHtcbiAgY29tcG9uZW50OiBUeXBlPGFueT47XG4gIC8qKiBAZXhwZXJpbWVudGFsICovXG4gIHByb3BhZ2F0ZURpZ2VzdD86IGJvb2xlYW47XG4gIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2NC4gVGhpcyBwYXJhbWV0ZXIgaXMgbm8gbG9uZ2VyIHVzZWQgKi9cbiAgaW5wdXRzPzogc3RyaW5nW107XG4gIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2NC4gVGhpcyBwYXJhbWV0ZXIgaXMgbm8gbG9uZ2VyIHVzZWQgKi9cbiAgb3V0cHV0cz86IHN0cmluZ1tdO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIHNlbGVjdG9ycz86IHN0cmluZ1tdO1xufSk6IGFueSAvKiBhbmd1bGFyLklJbmplY3RhYmxlICovIHtcbiAgY29uc3QgZGlyZWN0aXZlRmFjdG9yeTpcbiAgICAgIGFuZ3VsYXIuSUFubm90YXRlZEZ1bmN0aW9uID0gZnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRwYXJzZTogYW5ndWxhci5JUGFyc2VTZXJ2aWNlKTogYW5ndWxhci5JRGlyZWN0aXZlIHtcbiAgICAvLyBXaGVuIHVzaW5nIGBVcGdyYWRlTW9kdWxlYCwgd2UgZG9uJ3QgbmVlZCB0byBlbnN1cmUgY2FsbGJhY2tzIHRvIEFuZ3VsYXIgQVBJcyAoZS5nLiBjaGFuZ2VcbiAgICAvLyBkZXRlY3Rpb24pIGFyZSBydW4gaW5zaWRlIHRoZSBBbmd1bGFyIHpvbmUsIGJlY2F1c2UgYCRkaWdlc3QoKWAgd2lsbCBiZSBydW4gaW5zaWRlIHRoZSB6b25lXG4gICAgLy8gKGV4Y2VwdCBpZiBleHBsaWNpdGx5IGVzY2FwZWQsIGluIHdoaWNoIGNhc2Ugd2Ugc2hvdWxkbid0IGZvcmNlIGl0IGJhY2sgaW4pLlxuICAgIC8vIFdoZW4gdXNpbmcgYGRvd25ncmFkZU1vZHVsZSgpYCB0aG91Z2gsIHdlIG5lZWQgdG8gZW5zdXJlIHN1Y2ggY2FsbGJhY2tzIGFyZSBydW4gaW5zaWRlIHRoZVxuICAgIC8vIEFuZ3VsYXIgem9uZS5cbiAgICBsZXQgbmVlZHNOZ1pvbmUgPSBmYWxzZTtcbiAgICBsZXQgd3JhcENhbGxiYWNrID0gPFQ+KGNiOiAoKSA9PiBUKSA9PiBjYjtcbiAgICBsZXQgbmdab25lOiBOZ1pvbmU7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHRlcm1pbmFsOiB0cnVlLFxuICAgICAgcmVxdWlyZTogW1JFUVVJUkVfSU5KRUNUT1IsIFJFUVVJUkVfTkdfTU9ERUxdLFxuICAgICAgbGluazogKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcyxcbiAgICAgICAgICAgICByZXF1aXJlZDogYW55W10pID0+IHtcbiAgICAgICAgLy8gV2UgbWlnaHQgaGF2ZSB0byBjb21waWxlIHRoZSBjb250ZW50cyBhc3luY2hyb25vdXNseSwgYmVjYXVzZSB0aGlzIG1pZ2h0IGhhdmUgYmVlblxuICAgICAgICAvLyB0cmlnZ2VyZWQgYnkgYFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcmAsIGJlZm9yZSB0aGUgQW5ndWxhciB0ZW1wbGF0ZXMgaGF2ZVxuICAgICAgICAvLyBiZWVuIGNvbXBpbGVkLlxuXG4gICAgICAgIGNvbnN0IG5nTW9kZWw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyID0gcmVxdWlyZWRbMV07XG4gICAgICAgIGxldCBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3J8VGhlbmFibGU8SW5qZWN0b3I+fHVuZGVmaW5lZCA9IHJlcXVpcmVkWzBdO1xuICAgICAgICBsZXQgcmFuQXN5bmMgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIXBhcmVudEluamVjdG9yKSB7XG4gICAgICAgICAgY29uc3QgbGF6eU1vZHVsZVJlZiA9ICRpbmplY3Rvci5nZXQoTEFaWV9NT0RVTEVfUkVGKSBhcyBMYXp5TW9kdWxlUmVmO1xuICAgICAgICAgIG5lZWRzTmdab25lID0gbGF6eU1vZHVsZVJlZi5uZWVkc05nWm9uZTtcbiAgICAgICAgICBwYXJlbnRJbmplY3RvciA9IGxhenlNb2R1bGVSZWYuaW5qZWN0b3IgfHwgbGF6eU1vZHVsZVJlZi5wcm9taXNlIGFzIFByb21pc2U8SW5qZWN0b3I+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZG9Eb3duZ3JhZGUgPSAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiB7XG4gICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgPVxuICAgICAgICAgICAgICBpbmplY3Rvci5nZXQoQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKTtcbiAgICAgICAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4gPVxuICAgICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoaW5mby5jb21wb25lbnQpICE7XG5cbiAgICAgICAgICBpZiAoIWNvbXBvbmVudEZhY3RvcnkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0aW5nIENvbXBvbmVudEZhY3RvcnkgZm9yOiAnICsgZ2V0Q29tcG9uZW50TmFtZShpbmZvLmNvbXBvbmVudCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGluamVjdG9yUHJvbWlzZSA9IG5ldyBQYXJlbnRJbmplY3RvclByb21pc2UoZWxlbWVudCk7XG4gICAgICAgICAgY29uc3QgZmFjYWRlID0gbmV3IERvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXIoXG4gICAgICAgICAgICAgIGVsZW1lbnQsIGF0dHJzLCBzY29wZSwgbmdNb2RlbCwgaW5qZWN0b3IsICRpbmplY3RvciwgJGNvbXBpbGUsICRwYXJzZSxcbiAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeSwgd3JhcENhbGxiYWNrKTtcblxuICAgICAgICAgIGNvbnN0IHByb2plY3RhYmxlTm9kZXMgPSBmYWNhZGUuY29tcGlsZUNvbnRlbnRzKCk7XG4gICAgICAgICAgZmFjYWRlLmNyZWF0ZUNvbXBvbmVudChwcm9qZWN0YWJsZU5vZGVzKTtcbiAgICAgICAgICBmYWNhZGUuc2V0dXBJbnB1dHMobmVlZHNOZ1pvbmUsIGluZm8ucHJvcGFnYXRlRGlnZXN0KTtcbiAgICAgICAgICBmYWNhZGUuc2V0dXBPdXRwdXRzKCk7XG4gICAgICAgICAgZmFjYWRlLnJlZ2lzdGVyQ2xlYW51cCgpO1xuXG4gICAgICAgICAgaW5qZWN0b3JQcm9taXNlLnJlc29sdmUoZmFjYWRlLmdldEluamVjdG9yKCkpO1xuXG4gICAgICAgICAgaWYgKHJhbkFzeW5jKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGlzIGlzIHJ1biBhc3luYywgaXQgaXMgcG9zc2libGUgdGhhdCBpdCBpcyBub3QgcnVuIGluc2lkZSBhXG4gICAgICAgICAgICAvLyBkaWdlc3QgYW5kIGluaXRpYWwgaW5wdXQgdmFsdWVzIHdpbGwgbm90IGJlIGRldGVjdGVkLlxuICAgICAgICAgICAgc2NvcGUuJGV2YWxBc3luYygoKSA9PiB7fSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGRvd25ncmFkZUZuID0gIW5lZWRzTmdab25lID8gZG9Eb3duZ3JhZGUgOiAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiB7XG4gICAgICAgICAgaWYgKCFuZ1pvbmUpIHtcbiAgICAgICAgICAgIG5nWm9uZSA9IGluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgICAgICAgICAgd3JhcENhbGxiYWNrID0gPFQ+KGNiOiAoKSA9PiBUKSA9PiAoKSA9PlxuICAgICAgICAgICAgICAgIE5nWm9uZS5pc0luQW5ndWxhclpvbmUoKSA/IGNiKCkgOiBuZ1pvbmUucnVuKGNiKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3cmFwQ2FsbGJhY2soKCkgPT4gZG9Eb3duZ3JhZGUoaW5qZWN0b3IpKSgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChpc1RoZW5hYmxlPEluamVjdG9yPihwYXJlbnRJbmplY3RvcikpIHtcbiAgICAgICAgICBwYXJlbnRJbmplY3Rvci50aGVuKGRvd25ncmFkZUZuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb3duZ3JhZGVGbihwYXJlbnRJbmplY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICByYW5Bc3luYyA9IHRydWU7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBicmFja2V0LW5vdGF0aW9uIGJlY2F1c2Ugb2YgY2xvc3VyZSAtIHNlZSAjMTQ0NDFcbiAgZGlyZWN0aXZlRmFjdG9yeVsnJGluamVjdCddID0gWyRDT01QSUxFLCAkSU5KRUNUT1IsICRQQVJTRV07XG4gIHJldHVybiBkaXJlY3RpdmVGYWN0b3J5O1xufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzIHByb21pc2UtbGlrZSBvYmplY3QgdG8gd3JhcCBwYXJlbnQgaW5qZWN0b3JzLFxuICogdG8gcHJlc2VydmUgdGhlIHN5bmNocm9ub3VzIG5hdHVyZSBvZiBBbmd1bGFyIDEncyAkY29tcGlsZS5cbiAqL1xuY2xhc3MgUGFyZW50SW5qZWN0b3JQcm9taXNlIHtcbiAgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3I7XG4gIHByaXZhdGUgaW5qZWN0b3JLZXk6IHN0cmluZyA9IGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKTtcbiAgcHJpdmF0ZSBjYWxsYmFja3M6ICgoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBhbnkpW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkge1xuICAgIC8vIFN0b3JlIHRoZSBwcm9taXNlIG9uIHRoZSBlbGVtZW50LlxuICAgIGVsZW1lbnQuZGF0YSAhKHRoaXMuaW5qZWN0b3JLZXksIHRoaXMpO1xuICB9XG5cbiAgdGhlbihjYWxsYmFjazogKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55KSB7XG4gICAgaWYgKHRoaXMuaW5qZWN0b3IpIHtcbiAgICAgIGNhbGxiYWNrKHRoaXMuaW5qZWN0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICByZXNvbHZlKGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHRoaXMuaW5qZWN0b3IgPSBpbmplY3RvcjtcblxuICAgIC8vIFN0b3JlIHRoZSByZWFsIGluamVjdG9yIG9uIHRoZSBlbGVtZW50LlxuICAgIHRoaXMuZWxlbWVudC5kYXRhICEodGhpcy5pbmplY3RvcktleSwgaW5qZWN0b3IpO1xuXG4gICAgLy8gUmVsZWFzZSB0aGUgZWxlbWVudCB0byBwcmV2ZW50IG1lbW9yeSBsZWFrcy5cbiAgICB0aGlzLmVsZW1lbnQgPSBudWxsICE7XG5cbiAgICAvLyBSdW4gdGhlIHF1ZXVlZCBjYWxsYmFja3MuXG4gICAgdGhpcy5jYWxsYmFja3MuZm9yRWFjaChjYWxsYmFjayA9PiBjYWxsYmFjayhpbmplY3RvcikpO1xuICAgIHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNUaGVuYWJsZTxUPihvYmo6IG9iamVjdCk6IG9iaiBpcyBUaGVuYWJsZTxUPiB7XG4gIHJldHVybiBpc0Z1bmN0aW9uKChvYmogYXMgYW55KS50aGVuKTtcbn1cbiJdfQ==