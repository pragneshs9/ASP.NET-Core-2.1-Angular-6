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
import * as angular from './angular1';
import { $COMPILE, $CONTROLLER, $HTTP_BACKEND, $INJECTOR, $TEMPLATE_CACHE } from './constants';
import { controllerKey, directiveNormalize, isFunction } from './util';
// Constants
const /** @type {?} */ REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;
/**
 * @record
 */
export function IBindingDestination() { }
function IBindingDestination_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    [key: string]: any;
    */
    /** @type {?|undefined} */
    IBindingDestination.prototype.$onChanges;
}
/**
 * @record
 */
export function IControllerInstance() { }
function IControllerInstance_tsickle_Closure_declarations() {
    /** @type {?|undefined} */
    IControllerInstance.prototype.$doCheck;
    /** @type {?|undefined} */
    IControllerInstance.prototype.$onDestroy;
    /** @type {?|undefined} */
    IControllerInstance.prototype.$onInit;
    /** @type {?|undefined} */
    IControllerInstance.prototype.$postLink;
}
export class UpgradeHelper {
    /**
     * @param {?} injector
     * @param {?} name
     * @param {?} elementRef
     * @param {?=} directive
     */
    constructor(injector, name, elementRef, directive) {
        this.injector = injector;
        this.name = name;
        this.$injector = injector.get($INJECTOR);
        this.$compile = this.$injector.get($COMPILE);
        this.$controller = this.$injector.get($CONTROLLER);
        this.element = elementRef.nativeElement;
        this.$element = angular.element(this.element);
        this.directive = directive || UpgradeHelper.getDirective(this.$injector, name);
    }
    /**
     * @param {?} $injector
     * @param {?} name
     * @return {?}
     */
    static getDirective($injector, name) {
        const /** @type {?} */ directives = $injector.get(name + 'Directive');
        if (directives.length > 1) {
            throw new Error(`Only support single directive definition for: ${name}`);
        }
        const /** @type {?} */ directive = directives[0];
        // AngularJS will transform `link: xyz` to `compile: () => xyz`. So we can only tell there was a
        // user-defined `compile` if there is no `link`. In other cases, we will just ignore `compile`.
        if (directive.compile && !directive.link)
            notSupported(name, 'compile');
        if (directive.replace)
            notSupported(name, 'replace');
        if (directive.terminal)
            notSupported(name, 'terminal');
        return directive;
    }
    /**
     * @param {?} $injector
     * @param {?} directive
     * @param {?=} fetchRemoteTemplate
     * @return {?}
     */
    static getTemplate($injector, directive, fetchRemoteTemplate = false) {
        if (directive.template !== undefined) {
            return getOrCall(directive.template);
        }
        else if (directive.templateUrl) {
            const /** @type {?} */ $templateCache = /** @type {?} */ ($injector.get($TEMPLATE_CACHE));
            const /** @type {?} */ url = getOrCall(directive.templateUrl);
            const /** @type {?} */ template = $templateCache.get(url);
            if (template !== undefined) {
                return template;
            }
            else if (!fetchRemoteTemplate) {
                throw new Error('loading directive templates asynchronously is not supported');
            }
            return new Promise((resolve, reject) => {
                const /** @type {?} */ $httpBackend = /** @type {?} */ ($injector.get($HTTP_BACKEND));
                $httpBackend('GET', url, null, (status, response) => {
                    if (status === 200) {
                        resolve($templateCache.put(url, response));
                    }
                    else {
                        reject(`GET component template from '${url}' returned '${status}: ${response}'`);
                    }
                });
            });
        }
        else {
            throw new Error(`Directive '${directive.name}' is not a component, it is missing template.`);
        }
    }
    /**
     * @param {?} controllerType
     * @param {?} $scope
     * @return {?}
     */
    buildController(controllerType, $scope) {
        // TODO: Document that we do not pre-assign bindings on the controller instance.
        // Quoted properties below so that this code can be optimized with Closure Compiler.
        const /** @type {?} */ locals = { '$scope': $scope, '$element': this.$element };
        const /** @type {?} */ controller = this.$controller(controllerType, locals, null, this.directive.controllerAs); /** @type {?} */
        ((this.$element.data))(controllerKey(/** @type {?} */ ((this.directive.name))), controller);
        return controller;
    }
    /**
     * @param {?=} template
     * @return {?}
     */
    compileTemplate(template) {
        if (template === undefined) {
            template = /** @type {?} */ (UpgradeHelper.getTemplate(this.$injector, this.directive));
        }
        return this.compileHtml(template);
    }
    /**
     * @return {?}
     */
    prepareTransclusion() {
        const /** @type {?} */ transclude = this.directive.transclude;
        const /** @type {?} */ contentChildNodes = this.extractChildNodes();
        const /** @type {?} */ attachChildrenFn = (scope, cloneAttachFn) => {
            // Since AngularJS v1.5.8, `cloneAttachFn` will try to destroy the transclusion scope if
            // `$template` is empty. Since the transcluded content comes from Angular, not AngularJS,
            // there will be no transclusion scope here.
            // Provide a dummy `scope.$destroy()` method to prevent `cloneAttachFn` from throwing.
            scope = scope || { $destroy: () => undefined };
            return /** @type {?} */ ((cloneAttachFn))($template, scope);
        };
        let /** @type {?} */ $template = contentChildNodes;
        if (transclude) {
            const /** @type {?} */ slots = Object.create(null);
            if (typeof transclude === 'object') {
                $template = [];
                const /** @type {?} */ slotMap = Object.create(null);
                const /** @type {?} */ filledSlots = Object.create(null);
                // Parse the element selectors.
                Object.keys(transclude).forEach(slotName => {
                    let /** @type {?} */ selector = transclude[slotName];
                    const /** @type {?} */ optional = selector.charAt(0) === '?';
                    selector = optional ? selector.substring(1) : selector;
                    slotMap[selector] = slotName;
                    slots[slotName] = null; // `null`: Defined but not yet filled.
                    filledSlots[slotName] = optional; // Consider optional slots as filled.
                });
                // Add the matching elements into their slot.
                contentChildNodes.forEach(node => {
                    const /** @type {?} */ slotName = slotMap[directiveNormalize(node.nodeName.toLowerCase())];
                    if (slotName) {
                        filledSlots[slotName] = true;
                        slots[slotName] = slots[slotName] || [];
                        slots[slotName].push(node);
                    }
                    else {
                        $template.push(node);
                    }
                });
                // Check for required slots that were not filled.
                Object.keys(filledSlots).forEach(slotName => {
                    if (!filledSlots[slotName]) {
                        throw new Error(`Required transclusion slot '${slotName}' on directive: ${this.name}`);
                    }
                });
                Object.keys(slots).filter(slotName => slots[slotName]).forEach(slotName => {
                    const /** @type {?} */ nodes = slots[slotName];
                    slots[slotName] = (scope, cloneAttach) => /** @type {?} */ ((cloneAttach))(nodes, scope);
                });
            }
            // Attach `$$slots` to default slot transclude fn.
            attachChildrenFn.$$slots = slots;
            // AngularJS v1.6+ ignores empty or whitespace-only transcluded text nodes. But Angular
            // removes all text content after the first interpolation and updates it later, after
            // evaluating the expressions. This would result in AngularJS failing to recognize text
            // nodes that start with an interpolation as transcluded content and use the fallback
            // content instead.
            // To avoid this issue, we add a
            // [zero-width non-joiner character](https://en.wikipedia.org/wiki/Zero-width_non-joiner)
            // to empty text nodes (which can only be a result of Angular removing their initial content).
            // NOTE: Transcluded text content that starts with whitespace followed by an interpolation
            //       will still fail to be detected by AngularJS v1.6+
            $template.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && !node.nodeValue) {
                    node.nodeValue = '\u200C';
                }
            });
        }
        return attachChildrenFn;
    }
    /**
     * @param {?} controllerInstance
     * @return {?}
     */
    resolveAndBindRequiredControllers(controllerInstance) {
        const /** @type {?} */ directiveRequire = this.getDirectiveRequire();
        const /** @type {?} */ requiredControllers = this.resolveRequire(directiveRequire);
        if (controllerInstance && this.directive.bindToController && isMap(directiveRequire)) {
            const /** @type {?} */ requiredControllersMap = /** @type {?} */ (requiredControllers);
            Object.keys(requiredControllersMap).forEach(key => {
                controllerInstance[key] = requiredControllersMap[key];
            });
        }
        return requiredControllers;
    }
    /**
     * @param {?} html
     * @return {?}
     */
    compileHtml(html) {
        this.element.innerHTML = html;
        return this.$compile(this.element.childNodes);
    }
    /**
     * @return {?}
     */
    extractChildNodes() {
        const /** @type {?} */ childNodes = [];
        let /** @type {?} */ childNode;
        while (childNode = this.element.firstChild) {
            this.element.removeChild(childNode);
            childNodes.push(childNode);
        }
        return childNodes;
    }
    /**
     * @return {?}
     */
    getDirectiveRequire() {
        const /** @type {?} */ require = this.directive.require || /** @type {?} */ (((this.directive.controller && this.directive.name)));
        if (isMap(require)) {
            Object.keys(require).forEach(key => {
                const /** @type {?} */ value = require[key];
                const /** @type {?} */ match = /** @type {?} */ ((value.match(REQUIRE_PREFIX_RE)));
                const /** @type {?} */ name = value.substring(match[0].length);
                if (!name) {
                    require[key] = match[0] + key;
                }
            });
        }
        return require;
    }
    /**
     * @param {?} require
     * @param {?=} controllerInstance
     * @return {?}
     */
    resolveRequire(require, controllerInstance) {
        if (!require) {
            return null;
        }
        else if (Array.isArray(require)) {
            return require.map(req => this.resolveRequire(req));
        }
        else if (typeof require === 'object') {
            const /** @type {?} */ value = {};
            Object.keys(require).forEach(key => value[key] = /** @type {?} */ ((this.resolveRequire(require[key]))));
            return value;
        }
        else if (typeof require === 'string') {
            const /** @type {?} */ match = /** @type {?} */ ((require.match(REQUIRE_PREFIX_RE)));
            const /** @type {?} */ inheritType = match[1] || match[3];
            const /** @type {?} */ name = require.substring(match[0].length);
            const /** @type {?} */ isOptional = !!match[2];
            const /** @type {?} */ searchParents = !!inheritType;
            const /** @type {?} */ startOnParent = inheritType === '^^';
            const /** @type {?} */ ctrlKey = controllerKey(name);
            const /** @type {?} */ elem = startOnParent ? /** @type {?} */ ((this.$element.parent))() : this.$element;
            const /** @type {?} */ value = searchParents ? /** @type {?} */ ((elem.inheritedData))(ctrlKey) : /** @type {?} */ ((elem.data))(ctrlKey);
            if (!value && !isOptional) {
                throw new Error(`Unable to find required '${require}' in upgraded directive '${this.name}'.`);
            }
            return value;
        }
        else {
            throw new Error(`Unrecognized 'require' syntax on upgraded directive '${this.name}': ${require}`);
        }
    }
}
function UpgradeHelper_tsickle_Closure_declarations() {
    /** @type {?} */
    UpgradeHelper.prototype.$injector;
    /** @type {?} */
    UpgradeHelper.prototype.element;
    /** @type {?} */
    UpgradeHelper.prototype.$element;
    /** @type {?} */
    UpgradeHelper.prototype.directive;
    /** @type {?} */
    UpgradeHelper.prototype.$compile;
    /** @type {?} */
    UpgradeHelper.prototype.$controller;
    /** @type {?} */
    UpgradeHelper.prototype.injector;
    /** @type {?} */
    UpgradeHelper.prototype.name;
}
/**
 * @template T
 * @param {?} property
 * @return {?}
 */
function getOrCall(property) {
    return isFunction(property) ? property() : property;
}
/**
 * @template T
 * @param {?} value
 * @return {?}
 */
function isMap(value) {
    return value && !Array.isArray(value) && typeof value === 'object';
}
/**
 * @param {?} name
 * @param {?} feature
 * @return {?}
 */
function notSupported(name, feature) {
    throw new Error(`Upgraded directive '${name}' contains unsupported feature: '${feature}'.`);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9oZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvY29tbW9uL3VwZ3JhZGVfaGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBVUEsT0FBTyxLQUFLLE9BQU8sTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDN0YsT0FBTyxFQUFDLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxRQUFRLENBQUM7O0FBSXJFLHVCQUFNLGlCQUFpQixHQUFHLHdCQUF3QixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdCbkQsTUFBTTs7Ozs7OztJQVNKLFlBQ1ksVUFBNEIsSUFBWSxFQUFFLFVBQXNCLEVBQ3hFLFNBQThCO1FBRHRCLGFBQVEsR0FBUixRQUFRO1FBQW9CLFNBQUksR0FBSixJQUFJLENBQVE7UUFFbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVuRCxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsSUFBSSxhQUFhLENBQUMsWUFB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R0QsZUFBa0IsS0FBbUM7SUFDbkQsT0FBTyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztDQUNwRTs7Ozs7O0FBRUQsc0JBQXNCLElBQVksRUFBRSxPQUFlO0lBQ2pELE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLElBQUksb0NBQW9DLE9BQU8sSUFBSSxDQUFDLENBQUM7Q0FDN0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RWxlbWVudFJlZiwgSW5qZWN0b3IsIFNpbXBsZUNoYW5nZXN9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHskQ09NUElMRSwgJENPTlRST0xMRVIsICRIVFRQX0JBQ0tFTkQsICRJTkpFQ1RPUiwgJFRFTVBMQVRFX0NBQ0hFfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2NvbnRyb2xsZXJLZXksIGRpcmVjdGl2ZU5vcm1hbGl6ZSwgaXNGdW5jdGlvbn0gZnJvbSAnLi91dGlsJztcblxuXG4vLyBDb25zdGFudHNcbmNvbnN0IFJFUVVJUkVfUFJFRklYX1JFID0gL14oXFxeXFxePyk/KFxcPyk/KFxcXlxcXj8pPy87XG5cbi8vIEludGVyZmFjZXNcbmV4cG9ydCBpbnRlcmZhY2UgSUJpbmRpbmdEZXN0aW5hdGlvbiB7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbiAgJG9uQ2hhbmdlcz86IChjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElDb250cm9sbGVySW5zdGFuY2UgZXh0ZW5kcyBJQmluZGluZ0Rlc3RpbmF0aW9uIHtcbiAgJGRvQ2hlY2s/OiAoKSA9PiB2b2lkO1xuICAkb25EZXN0cm95PzogKCkgPT4gdm9pZDtcbiAgJG9uSW5pdD86ICgpID0+IHZvaWQ7XG4gICRwb3N0TGluaz86ICgpID0+IHZvaWQ7XG59XG5cbi8vIENsYXNzZXNcbmV4cG9ydCBjbGFzcyBVcGdyYWRlSGVscGVyIHtcbiAgcHVibGljIHJlYWRvbmx5ICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlO1xuICBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudDogRWxlbWVudDtcbiAgcHVibGljIHJlYWRvbmx5ICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnk7XG4gIHB1YmxpYyByZWFkb25seSBkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZTtcblxuICBwcml2YXRlIHJlYWRvbmx5ICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZTtcbiAgcHJpdmF0ZSByZWFkb25seSAkY29udHJvbGxlcjogYW5ndWxhci5JQ29udHJvbGxlclNlcnZpY2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGluamVjdG9yOiBJbmplY3RvciwgcHJpdmF0ZSBuYW1lOiBzdHJpbmcsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICBkaXJlY3RpdmU/OiBhbmd1bGFyLklEaXJlY3RpdmUpIHtcbiAgICB0aGlzLiRpbmplY3RvciA9IGluamVjdG9yLmdldCgkSU5KRUNUT1IpO1xuICAgIHRoaXMuJGNvbXBpbGUgPSB0aGlzLiRpbmplY3Rvci5nZXQoJENPTVBJTEUpO1xuICAgIHRoaXMuJGNvbnRyb2xsZXIgPSB0aGlzLiRpbmplY3Rvci5nZXQoJENPTlRST0xMRVIpO1xuXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIHRoaXMuJGVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQodGhpcy5lbGVtZW50KTtcblxuICAgIHRoaXMuZGlyZWN0aXZlID0gZGlyZWN0aXZlIHx8IFVwZ3JhZGVIZWxwZXIuZ2V0RGlyZWN0aXZlKHRoaXMuJGluamVjdG9yLCBuYW1lKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXREaXJlY3RpdmUoJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsIG5hbWU6IHN0cmluZyk6IGFuZ3VsYXIuSURpcmVjdGl2ZSB7XG4gICAgY29uc3QgZGlyZWN0aXZlczogYW5ndWxhci5JRGlyZWN0aXZlW10gPSAkaW5qZWN0b3IuZ2V0KG5hbWUgKyAnRGlyZWN0aXZlJyk7XG4gICAgaWYgKGRpcmVjdGl2ZXMubGVuZ3RoID4gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBPbmx5IHN1cHBvcnQgc2luZ2xlIGRpcmVjdGl2ZSBkZWZpbml0aW9uIGZvcjogJHtuYW1lfWApO1xuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGRpcmVjdGl2ZXNbMF07XG5cbiAgICAvLyBBbmd1bGFySlMgd2lsbCB0cmFuc2Zvcm0gYGxpbms6IHh5emAgdG8gYGNvbXBpbGU6ICgpID0+IHh5emAuIFNvIHdlIGNhbiBvbmx5IHRlbGwgdGhlcmUgd2FzIGFcbiAgICAvLyB1c2VyLWRlZmluZWQgYGNvbXBpbGVgIGlmIHRoZXJlIGlzIG5vIGBsaW5rYC4gSW4gb3RoZXIgY2FzZXMsIHdlIHdpbGwganVzdCBpZ25vcmUgYGNvbXBpbGVgLlxuICAgIGlmIChkaXJlY3RpdmUuY29tcGlsZSAmJiAhZGlyZWN0aXZlLmxpbmspIG5vdFN1cHBvcnRlZChuYW1lLCAnY29tcGlsZScpO1xuICAgIGlmIChkaXJlY3RpdmUucmVwbGFjZSkgbm90U3VwcG9ydGVkKG5hbWUsICdyZXBsYWNlJyk7XG4gICAgaWYgKGRpcmVjdGl2ZS50ZXJtaW5hbCkgbm90U3VwcG9ydGVkKG5hbWUsICd0ZXJtaW5hbCcpO1xuXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRUZW1wbGF0ZShcbiAgICAgICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLCBkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZSxcbiAgICAgIGZldGNoUmVtb3RlVGVtcGxhdGUgPSBmYWxzZSk6IHN0cmluZ3xQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmIChkaXJlY3RpdmUudGVtcGxhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGdldE9yQ2FsbDxzdHJpbmc+KGRpcmVjdGl2ZS50ZW1wbGF0ZSk7XG4gICAgfSBlbHNlIGlmIChkaXJlY3RpdmUudGVtcGxhdGVVcmwpIHtcbiAgICAgIGNvbnN0ICR0ZW1wbGF0ZUNhY2hlID0gJGluamVjdG9yLmdldCgkVEVNUExBVEVfQ0FDSEUpIGFzIGFuZ3VsYXIuSVRlbXBsYXRlQ2FjaGVTZXJ2aWNlO1xuICAgICAgY29uc3QgdXJsID0gZ2V0T3JDYWxsPHN0cmluZz4oZGlyZWN0aXZlLnRlbXBsYXRlVXJsKTtcbiAgICAgIGNvbnN0IHRlbXBsYXRlID0gJHRlbXBsYXRlQ2FjaGUuZ2V0KHVybCk7XG5cbiAgICAgIGlmICh0ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICAgIH0gZWxzZSBpZiAoIWZldGNoUmVtb3RlVGVtcGxhdGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2FkaW5nIGRpcmVjdGl2ZSB0ZW1wbGF0ZXMgYXN5bmNocm9ub3VzbHkgaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCAkaHR0cEJhY2tlbmQgPSAkaW5qZWN0b3IuZ2V0KCRIVFRQX0JBQ0tFTkQpIGFzIGFuZ3VsYXIuSUh0dHBCYWNrZW5kU2VydmljZTtcbiAgICAgICAgJGh0dHBCYWNrZW5kKCdHRVQnLCB1cmwsIG51bGwsIChzdGF0dXM6IG51bWJlciwgcmVzcG9uc2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGlmIChzdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgcmVzb2x2ZSgkdGVtcGxhdGVDYWNoZS5wdXQodXJsLCByZXNwb25zZSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QoYEdFVCBjb21wb25lbnQgdGVtcGxhdGUgZnJvbSAnJHt1cmx9JyByZXR1cm5lZCAnJHtzdGF0dXN9OiAke3Jlc3BvbnNlfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRGlyZWN0aXZlICcke2RpcmVjdGl2ZS5uYW1lfScgaXMgbm90IGEgY29tcG9uZW50LCBpdCBpcyBtaXNzaW5nIHRlbXBsYXRlLmApO1xuICAgIH1cbiAgfVxuXG4gIGJ1aWxkQ29udHJvbGxlcihjb250cm9sbGVyVHlwZTogYW5ndWxhci5JQ29udHJvbGxlciwgJHNjb3BlOiBhbmd1bGFyLklTY29wZSkge1xuICAgIC8vIFRPRE86IERvY3VtZW50IHRoYXQgd2UgZG8gbm90IHByZS1hc3NpZ24gYmluZGluZ3Mgb24gdGhlIGNvbnRyb2xsZXIgaW5zdGFuY2UuXG4gICAgLy8gUXVvdGVkIHByb3BlcnRpZXMgYmVsb3cgc28gdGhhdCB0aGlzIGNvZGUgY2FuIGJlIG9wdGltaXplZCB3aXRoIENsb3N1cmUgQ29tcGlsZXIuXG4gICAgY29uc3QgbG9jYWxzID0geyckc2NvcGUnOiAkc2NvcGUsICckZWxlbWVudCc6IHRoaXMuJGVsZW1lbnR9O1xuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSB0aGlzLiRjb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCBsb2NhbHMsIG51bGwsIHRoaXMuZGlyZWN0aXZlLmNvbnRyb2xsZXJBcyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmRhdGEgIShjb250cm9sbGVyS2V5KHRoaXMuZGlyZWN0aXZlLm5hbWUgISksIGNvbnRyb2xsZXIpO1xuXG4gICAgcmV0dXJuIGNvbnRyb2xsZXI7XG4gIH1cblxuICBjb21waWxlVGVtcGxhdGUodGVtcGxhdGU/OiBzdHJpbmcpOiBhbmd1bGFyLklMaW5rRm4ge1xuICAgIGlmICh0ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0ZW1wbGF0ZSA9IFVwZ3JhZGVIZWxwZXIuZ2V0VGVtcGxhdGUodGhpcy4kaW5qZWN0b3IsIHRoaXMuZGlyZWN0aXZlKSBhcyBzdHJpbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZUh0bWwodGVtcGxhdGUpO1xuICB9XG5cbiAgcHJlcGFyZVRyYW5zY2x1c2lvbigpOiBhbmd1bGFyLklMaW5rRm58dW5kZWZpbmVkIHtcbiAgICBjb25zdCB0cmFuc2NsdWRlID0gdGhpcy5kaXJlY3RpdmUudHJhbnNjbHVkZTtcbiAgICBjb25zdCBjb250ZW50Q2hpbGROb2RlcyA9IHRoaXMuZXh0cmFjdENoaWxkTm9kZXMoKTtcbiAgICBjb25zdCBhdHRhY2hDaGlsZHJlbkZuOiBhbmd1bGFyLklMaW5rRm4gPSAoc2NvcGUsIGNsb25lQXR0YWNoRm4pID0+IHtcbiAgICAgIC8vIFNpbmNlIEFuZ3VsYXJKUyB2MS41LjgsIGBjbG9uZUF0dGFjaEZuYCB3aWxsIHRyeSB0byBkZXN0cm95IHRoZSB0cmFuc2NsdXNpb24gc2NvcGUgaWZcbiAgICAgIC8vIGAkdGVtcGxhdGVgIGlzIGVtcHR5LiBTaW5jZSB0aGUgdHJhbnNjbHVkZWQgY29udGVudCBjb21lcyBmcm9tIEFuZ3VsYXIsIG5vdCBBbmd1bGFySlMsXG4gICAgICAvLyB0aGVyZSB3aWxsIGJlIG5vIHRyYW5zY2x1c2lvbiBzY29wZSBoZXJlLlxuICAgICAgLy8gUHJvdmlkZSBhIGR1bW15IGBzY29wZS4kZGVzdHJveSgpYCBtZXRob2QgdG8gcHJldmVudCBgY2xvbmVBdHRhY2hGbmAgZnJvbSB0aHJvd2luZy5cbiAgICAgIHNjb3BlID0gc2NvcGUgfHwgeyRkZXN0cm95OiAoKSA9PiB1bmRlZmluZWR9O1xuICAgICAgcmV0dXJuIGNsb25lQXR0YWNoRm4gISgkdGVtcGxhdGUsIHNjb3BlKTtcbiAgICB9O1xuICAgIGxldCAkdGVtcGxhdGUgPSBjb250ZW50Q2hpbGROb2RlcztcblxuICAgIGlmICh0cmFuc2NsdWRlKSB7XG4gICAgICBjb25zdCBzbG90cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAgIGlmICh0eXBlb2YgdHJhbnNjbHVkZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgJHRlbXBsYXRlID0gW107XG5cbiAgICAgICAgY29uc3Qgc2xvdE1hcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIGNvbnN0IGZpbGxlZFNsb3RzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgICAgICAvLyBQYXJzZSB0aGUgZWxlbWVudCBzZWxlY3RvcnMuXG4gICAgICAgIE9iamVjdC5rZXlzKHRyYW5zY2x1ZGUpLmZvckVhY2goc2xvdE5hbWUgPT4ge1xuICAgICAgICAgIGxldCBzZWxlY3RvciA9IHRyYW5zY2x1ZGVbc2xvdE5hbWVdO1xuICAgICAgICAgIGNvbnN0IG9wdGlvbmFsID0gc2VsZWN0b3IuY2hhckF0KDApID09PSAnPyc7XG4gICAgICAgICAgc2VsZWN0b3IgPSBvcHRpb25hbCA/IHNlbGVjdG9yLnN1YnN0cmluZygxKSA6IHNlbGVjdG9yO1xuXG4gICAgICAgICAgc2xvdE1hcFtzZWxlY3Rvcl0gPSBzbG90TmFtZTtcbiAgICAgICAgICBzbG90c1tzbG90TmFtZV0gPSBudWxsOyAgICAgICAgICAgIC8vIGBudWxsYDogRGVmaW5lZCBidXQgbm90IHlldCBmaWxsZWQuXG4gICAgICAgICAgZmlsbGVkU2xvdHNbc2xvdE5hbWVdID0gb3B0aW9uYWw7ICAvLyBDb25zaWRlciBvcHRpb25hbCBzbG90cyBhcyBmaWxsZWQuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgbWF0Y2hpbmcgZWxlbWVudHMgaW50byB0aGVpciBzbG90LlxuICAgICAgICBjb250ZW50Q2hpbGROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICAgIGNvbnN0IHNsb3ROYW1lID0gc2xvdE1hcFtkaXJlY3RpdmVOb3JtYWxpemUobm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKV07XG4gICAgICAgICAgaWYgKHNsb3ROYW1lKSB7XG4gICAgICAgICAgICBmaWxsZWRTbG90c1tzbG90TmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgc2xvdHNbc2xvdE5hbWVdID0gc2xvdHNbc2xvdE5hbWVdIHx8IFtdO1xuICAgICAgICAgICAgc2xvdHNbc2xvdE5hbWVdLnB1c2gobm9kZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICR0ZW1wbGF0ZS5wdXNoKG5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHJlcXVpcmVkIHNsb3RzIHRoYXQgd2VyZSBub3QgZmlsbGVkLlxuICAgICAgICBPYmplY3Qua2V5cyhmaWxsZWRTbG90cykuZm9yRWFjaChzbG90TmFtZSA9PiB7XG4gICAgICAgICAgaWYgKCFmaWxsZWRTbG90c1tzbG90TmFtZV0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVxdWlyZWQgdHJhbnNjbHVzaW9uIHNsb3QgJyR7c2xvdE5hbWV9JyBvbiBkaXJlY3RpdmU6ICR7dGhpcy5uYW1lfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgT2JqZWN0LmtleXMoc2xvdHMpLmZpbHRlcihzbG90TmFtZSA9PiBzbG90c1tzbG90TmFtZV0pLmZvckVhY2goc2xvdE5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGVzID0gc2xvdHNbc2xvdE5hbWVdO1xuICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXSA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGNsb25lQXR0YWNoOiBhbmd1bGFyLklDbG9uZUF0dGFjaEZ1bmN0aW9uKSA9PlxuICAgICAgICAgICAgICBjbG9uZUF0dGFjaCAhKG5vZGVzLCBzY29wZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBdHRhY2ggYCQkc2xvdHNgIHRvIGRlZmF1bHQgc2xvdCB0cmFuc2NsdWRlIGZuLlxuICAgICAgYXR0YWNoQ2hpbGRyZW5Gbi4kJHNsb3RzID0gc2xvdHM7XG5cbiAgICAgIC8vIEFuZ3VsYXJKUyB2MS42KyBpZ25vcmVzIGVtcHR5IG9yIHdoaXRlc3BhY2Utb25seSB0cmFuc2NsdWRlZCB0ZXh0IG5vZGVzLiBCdXQgQW5ndWxhclxuICAgICAgLy8gcmVtb3ZlcyBhbGwgdGV4dCBjb250ZW50IGFmdGVyIHRoZSBmaXJzdCBpbnRlcnBvbGF0aW9uIGFuZCB1cGRhdGVzIGl0IGxhdGVyLCBhZnRlclxuICAgICAgLy8gZXZhbHVhdGluZyB0aGUgZXhwcmVzc2lvbnMuIFRoaXMgd291bGQgcmVzdWx0IGluIEFuZ3VsYXJKUyBmYWlsaW5nIHRvIHJlY29nbml6ZSB0ZXh0XG4gICAgICAvLyBub2RlcyB0aGF0IHN0YXJ0IHdpdGggYW4gaW50ZXJwb2xhdGlvbiBhcyB0cmFuc2NsdWRlZCBjb250ZW50IGFuZCB1c2UgdGhlIGZhbGxiYWNrXG4gICAgICAvLyBjb250ZW50IGluc3RlYWQuXG4gICAgICAvLyBUbyBhdm9pZCB0aGlzIGlzc3VlLCB3ZSBhZGQgYVxuICAgICAgLy8gW3plcm8td2lkdGggbm9uLWpvaW5lciBjaGFyYWN0ZXJdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1plcm8td2lkdGhfbm9uLWpvaW5lcilcbiAgICAgIC8vIHRvIGVtcHR5IHRleHQgbm9kZXMgKHdoaWNoIGNhbiBvbmx5IGJlIGEgcmVzdWx0IG9mIEFuZ3VsYXIgcmVtb3ZpbmcgdGhlaXIgaW5pdGlhbCBjb250ZW50KS5cbiAgICAgIC8vIE5PVEU6IFRyYW5zY2x1ZGVkIHRleHQgY29udGVudCB0aGF0IHN0YXJ0cyB3aXRoIHdoaXRlc3BhY2UgZm9sbG93ZWQgYnkgYW4gaW50ZXJwb2xhdGlvblxuICAgICAgLy8gICAgICAgd2lsbCBzdGlsbCBmYWlsIHRvIGJlIGRldGVjdGVkIGJ5IEFuZ3VsYXJKUyB2MS42K1xuICAgICAgJHRlbXBsYXRlLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSAmJiAhbm9kZS5ub2RlVmFsdWUpIHtcbiAgICAgICAgICBub2RlLm5vZGVWYWx1ZSA9ICdcXHUyMDBDJztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dGFjaENoaWxkcmVuRm47XG4gIH1cblxuICByZXNvbHZlQW5kQmluZFJlcXVpcmVkQ29udHJvbGxlcnMoY29udHJvbGxlckluc3RhbmNlOiBJQ29udHJvbGxlckluc3RhbmNlfG51bGwpIHtcbiAgICBjb25zdCBkaXJlY3RpdmVSZXF1aXJlID0gdGhpcy5nZXREaXJlY3RpdmVSZXF1aXJlKCk7XG4gICAgY29uc3QgcmVxdWlyZWRDb250cm9sbGVycyA9IHRoaXMucmVzb2x2ZVJlcXVpcmUoZGlyZWN0aXZlUmVxdWlyZSk7XG5cbiAgICBpZiAoY29udHJvbGxlckluc3RhbmNlICYmIHRoaXMuZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXIgJiYgaXNNYXAoZGlyZWN0aXZlUmVxdWlyZSkpIHtcbiAgICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnNNYXAgPSByZXF1aXJlZENvbnRyb2xsZXJzIGFze1trZXk6IHN0cmluZ106IElDb250cm9sbGVySW5zdGFuY2V9O1xuICAgICAgT2JqZWN0LmtleXMocmVxdWlyZWRDb250cm9sbGVyc01hcCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb250cm9sbGVySW5zdGFuY2Vba2V5XSA9IHJlcXVpcmVkQ29udHJvbGxlcnNNYXBba2V5XTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXF1aXJlZENvbnRyb2xsZXJzO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21waWxlSHRtbChodG1sOiBzdHJpbmcpOiBhbmd1bGFyLklMaW5rRm4ge1xuICAgIHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHJldHVybiB0aGlzLiRjb21waWxlKHRoaXMuZWxlbWVudC5jaGlsZE5vZGVzKTtcbiAgfVxuXG4gIHByaXZhdGUgZXh0cmFjdENoaWxkTm9kZXMoKTogTm9kZVtdIHtcbiAgICBjb25zdCBjaGlsZE5vZGVzOiBOb2RlW10gPSBbXTtcbiAgICBsZXQgY2hpbGROb2RlOiBOb2RlfG51bGw7XG5cbiAgICB3aGlsZSAoY2hpbGROb2RlID0gdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDaGlsZChjaGlsZE5vZGUpO1xuICAgICAgY2hpbGROb2Rlcy5wdXNoKGNoaWxkTm9kZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoaWxkTm9kZXM7XG4gIH1cblxuICBwcml2YXRlIGdldERpcmVjdGl2ZVJlcXVpcmUoKTogYW5ndWxhci5EaXJlY3RpdmVSZXF1aXJlUHJvcGVydHkge1xuICAgIGNvbnN0IHJlcXVpcmUgPSB0aGlzLmRpcmVjdGl2ZS5yZXF1aXJlIHx8ICh0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyICYmIHRoaXMuZGlyZWN0aXZlLm5hbWUpICE7XG5cbiAgICBpZiAoaXNNYXAocmVxdWlyZSkpIHtcbiAgICAgIE9iamVjdC5rZXlzKHJlcXVpcmUpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSByZXF1aXJlW2tleV07XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdmFsdWUubWF0Y2goUkVRVUlSRV9QUkVGSVhfUkUpICE7XG4gICAgICAgIGNvbnN0IG5hbWUgPSB2YWx1ZS5zdWJzdHJpbmcobWF0Y2hbMF0ubGVuZ3RoKTtcblxuICAgICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgICByZXF1aXJlW2tleV0gPSBtYXRjaFswXSArIGtleTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcXVpcmU7XG4gIH1cblxuICBwcml2YXRlIHJlc29sdmVSZXF1aXJlKHJlcXVpcmU6IGFuZ3VsYXIuRGlyZWN0aXZlUmVxdWlyZVByb3BlcnR5LCBjb250cm9sbGVySW5zdGFuY2U/OiBhbnkpOlxuICAgICAgYW5ndWxhci5TaW5nbGVPckxpc3RPck1hcDxJQ29udHJvbGxlckluc3RhbmNlPnxudWxsIHtcbiAgICBpZiAoIXJlcXVpcmUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXF1aXJlKSkge1xuICAgICAgcmV0dXJuIHJlcXVpcmUubWFwKHJlcSA9PiB0aGlzLnJlc29sdmVSZXF1aXJlKHJlcSkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlcXVpcmUgPT09ICdvYmplY3QnKSB7XG4gICAgICBjb25zdCB2YWx1ZToge1trZXk6IHN0cmluZ106IElDb250cm9sbGVySW5zdGFuY2V9ID0ge307XG4gICAgICBPYmplY3Qua2V5cyhyZXF1aXJlKS5mb3JFYWNoKGtleSA9PiB2YWx1ZVtrZXldID0gdGhpcy5yZXNvbHZlUmVxdWlyZShyZXF1aXJlW2tleV0pICEpO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlcXVpcmUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBtYXRjaCA9IHJlcXVpcmUubWF0Y2goUkVRVUlSRV9QUkVGSVhfUkUpICE7XG4gICAgICBjb25zdCBpbmhlcml0VHlwZSA9IG1hdGNoWzFdIHx8IG1hdGNoWzNdO1xuXG4gICAgICBjb25zdCBuYW1lID0gcmVxdWlyZS5zdWJzdHJpbmcobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgIGNvbnN0IGlzT3B0aW9uYWwgPSAhIW1hdGNoWzJdO1xuICAgICAgY29uc3Qgc2VhcmNoUGFyZW50cyA9ICEhaW5oZXJpdFR5cGU7XG4gICAgICBjb25zdCBzdGFydE9uUGFyZW50ID0gaW5oZXJpdFR5cGUgPT09ICdeXic7XG5cbiAgICAgIGNvbnN0IGN0cmxLZXkgPSBjb250cm9sbGVyS2V5KG5hbWUpO1xuICAgICAgY29uc3QgZWxlbSA9IHN0YXJ0T25QYXJlbnQgPyB0aGlzLiRlbGVtZW50LnBhcmVudCAhKCkgOiB0aGlzLiRlbGVtZW50O1xuICAgICAgY29uc3QgdmFsdWUgPSBzZWFyY2hQYXJlbnRzID8gZWxlbS5pbmhlcml0ZWREYXRhICEoY3RybEtleSkgOiBlbGVtLmRhdGEgIShjdHJsS2V5KTtcblxuICAgICAgaWYgKCF2YWx1ZSAmJiAhaXNPcHRpb25hbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIGZpbmQgcmVxdWlyZWQgJyR7cmVxdWlyZX0nIGluIHVwZ3JhZGVkIGRpcmVjdGl2ZSAnJHt0aGlzLm5hbWV9Jy5gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVucmVjb2duaXplZCAncmVxdWlyZScgc3ludGF4IG9uIHVwZ3JhZGVkIGRpcmVjdGl2ZSAnJHt0aGlzLm5hbWV9JzogJHtyZXF1aXJlfWApO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRPckNhbGw8VD4ocHJvcGVydHk6IFQgfCBGdW5jdGlvbik6IFQge1xuICByZXR1cm4gaXNGdW5jdGlvbihwcm9wZXJ0eSkgPyBwcm9wZXJ0eSgpIDogcHJvcGVydHk7XG59XG5cbi8vIE5PVEU6IE9ubHkgd29ya3MgZm9yIGB0eXBlb2YgVCAhPT0gJ29iamVjdCdgLlxuZnVuY3Rpb24gaXNNYXA8VD4odmFsdWU6IGFuZ3VsYXIuU2luZ2xlT3JMaXN0T3JNYXA8VD4pOiB2YWx1ZSBpcyB7W2tleTogc3RyaW5nXTogVH0ge1xuICByZXR1cm4gdmFsdWUgJiYgIUFycmF5LmlzQXJyYXkodmFsdWUpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCc7XG59XG5cbmZ1bmN0aW9uIG5vdFN1cHBvcnRlZChuYW1lOiBzdHJpbmcsIGZlYXR1cmU6IHN0cmluZykge1xuICB0aHJvdyBuZXcgRXJyb3IoYFVwZ3JhZGVkIGRpcmVjdGl2ZSAnJHtuYW1lfScgY29udGFpbnMgdW5zdXBwb3J0ZWQgZmVhdHVyZTogJyR7ZmVhdHVyZX0nLmApO1xufVxuIl19