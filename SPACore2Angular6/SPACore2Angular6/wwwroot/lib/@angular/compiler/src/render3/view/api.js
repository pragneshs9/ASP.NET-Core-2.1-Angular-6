/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/view/api", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi8uLi9wYXJzZV91dGlsJztcbmltcG9ydCAqIGFzIHQgZnJvbSAnLi4vcjNfYXN0JztcbmltcG9ydCB7UjNEZXBlbmRlbmN5TWV0YWRhdGF9IGZyb20gJy4uL3IzX2ZhY3RvcnknO1xuXG4vKipcbiAqIEluZm9ybWF0aW9uIG5lZWRlZCB0byBjb21waWxlIGEgZGlyZWN0aXZlIGZvciB0aGUgcmVuZGVyMyBydW50aW1lLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFIzRGlyZWN0aXZlTWV0YWRhdGEge1xuICAvKipcbiAgICogTmFtZSBvZiB0aGUgZGlyZWN0aXZlIHR5cGUuXG4gICAqL1xuICBuYW1lOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBkaXJlY3RpdmUgaXRzZWxmLlxuICAgKi9cbiAgdHlwZTogby5FeHByZXNzaW9uO1xuXG4gIC8qKlxuICAgKiBBIHNvdXJjZSBzcGFuIGZvciB0aGUgZGlyZWN0aXZlIHR5cGUuXG4gICAqL1xuICB0eXBlU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuO1xuXG4gIC8qKlxuICAgKiBEZXBlbmRlbmNpZXMgb2YgdGhlIGRpcmVjdGl2ZSdzIGNvbnN0cnVjdG9yLlxuICAgKi9cbiAgZGVwczogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXTtcblxuICAvKipcbiAgICogVW5wYXJzZWQgc2VsZWN0b3Igb2YgdGhlIGRpcmVjdGl2ZSwgb3IgYG51bGxgIGlmIHRoZXJlIHdhcyBubyBzZWxlY3Rvci5cbiAgICovXG4gIHNlbGVjdG9yOiBzdHJpbmd8bnVsbDtcblxuICAvKipcbiAgICogSW5mb3JtYXRpb24gYWJvdXQgdGhlIGNvbnRlbnQgcXVlcmllcyBtYWRlIGJ5IHRoZSBkaXJlY3RpdmUuXG4gICAqL1xuICBxdWVyaWVzOiBSM1F1ZXJ5TWV0YWRhdGFbXTtcblxuICAvKipcbiAgICogTWFwcGluZ3MgaW5kaWNhdGluZyBob3cgdGhlIGRpcmVjdGl2ZSBpbnRlcmFjdHMgd2l0aCBpdHMgaG9zdCBlbGVtZW50IChob3N0IGJpbmRpbmdzLFxuICAgKiBsaXN0ZW5lcnMsIGV0YykuXG4gICAqL1xuICBob3N0OiB7XG4gICAgLyoqXG4gICAgICogQSBtYXBwaW5nIG9mIGF0dHJpYnV0ZSBiaW5kaW5nIGtleXMgdG8gdW5wYXJzZWQgZXhwcmVzc2lvbnMuXG4gICAgICovXG4gICAgYXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcHBpbmcgb2YgZXZlbnQgYmluZGluZyBrZXlzIHRvIHVucGFyc2VkIGV4cHJlc3Npb25zLlxuICAgICAqL1xuICAgIGxpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcHBpbmcgb2YgcHJvcGVydHkgYmluZGluZyBrZXlzIHRvIHVucGFyc2VkIGV4cHJlc3Npb25zLlxuICAgICAqL1xuICAgIHByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbmZvcm1hdGlvbiBhYm91dCB1c2FnZSBvZiBzcGVjaWZpYyBsaWZlY3ljbGUgZXZlbnRzIHdoaWNoIHJlcXVpcmUgc3BlY2lhbCB0cmVhdG1lbnQgaW4gdGhlXG4gICAqIGNvZGUgZ2VuZXJhdG9yLlxuICAgKi9cbiAgbGlmZWN5Y2xlOiB7XG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgZGlyZWN0aXZlIHVzZXMgTmdPbkNoYW5nZXMuXG4gICAgICovXG4gICAgdXNlc09uQ2hhbmdlczogYm9vbGVhbjtcbiAgfTtcblxuICAvKipcbiAgICogQSBtYXBwaW5nIG9mIGlucHV0IGZpZWxkIG5hbWVzIHRvIHRoZSBwcm9wZXJ0eSBuYW1lcy5cbiAgICovXG4gIGlucHV0czoge1tmaWVsZDogc3RyaW5nXTogc3RyaW5nfTtcblxuICAvKipcbiAgICogQSBtYXBwaW5nIG9mIG91dHB1dCBmaWVsZCBuYW1lcyB0byB0aGUgcHJvcGVydHkgbmFtZXMuXG4gICAqL1xuICBvdXRwdXRzOiB7W2ZpZWxkOiBzdHJpbmddOiBzdHJpbmd9O1xufVxuXG4vKipcbiAqIEluZm9ybWF0aW9uIG5lZWRlZCB0byBjb21waWxlIGEgY29tcG9uZW50IGZvciB0aGUgcmVuZGVyMyBydW50aW1lLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFIzQ29tcG9uZW50TWV0YWRhdGEgZXh0ZW5kcyBSM0RpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZS5cbiAgICovXG4gIHRlbXBsYXRlOiB7XG4gICAgLyoqXG4gICAgICogUGFyc2VkIG5vZGVzIG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICAgKi9cbiAgICBub2RlczogdC5Ob2RlW107XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSB0ZW1wbGF0ZSBpbmNsdWRlcyA8bmctY29udGVudD4gdGFncy5cbiAgICAgKi9cbiAgICBoYXNOZ0NvbnRlbnQ6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3RvcnMgZm91bmQgaW4gdGhlIDxuZy1jb250ZW50PiB0YWdzIGluIHRoZSB0ZW1wbGF0ZS5cbiAgICAgKi9cbiAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgdmlldyBxdWVyaWVzIG1hZGUgYnkgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIHZpZXdRdWVyaWVzOiBSM1F1ZXJ5TWV0YWRhdGFbXTtcblxuICAvKipcbiAgICogQSBtYXAgb2YgcGlwZSBuYW1lcyB0byBhbiBleHByZXNzaW9uIHJlZmVyZW5jaW5nIHRoZSBwaXBlIHR5cGUgd2hpY2ggYXJlIGluIHRoZSBzY29wZSBvZiB0aGVcbiAgICogY29tcGlsYXRpb24uXG4gICAqL1xuICBwaXBlczogTWFwPHN0cmluZywgby5FeHByZXNzaW9uPjtcblxuICAvKipcbiAgICogQSBtYXAgb2YgZGlyZWN0aXZlIHNlbGVjdG9ycyB0byBhbiBleHByZXNzaW9uIHJlZmVyZW5jaW5nIHRoZSBkaXJlY3RpdmUgdHlwZSB3aGljaCBhcmUgaW4gdGhlXG4gICAqIHNjb3BlIG9mIHRoZSBjb21waWxhdGlvbi5cbiAgICovXG4gIGRpcmVjdGl2ZXM6IE1hcDxzdHJpbmcsIG8uRXhwcmVzc2lvbj47XG59XG5cbi8qKlxuICogSW5mb3JtYXRpb24gbmVlZGVkIHRvIGNvbXBpbGUgYSBxdWVyeSAodmlldyBvciBjb250ZW50KS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSM1F1ZXJ5TWV0YWRhdGEge1xuICAvKipcbiAgICogTmFtZSBvZiB0aGUgcHJvcGVydHkgb24gdGhlIGNsYXNzIHRvIHVwZGF0ZSB3aXRoIHF1ZXJ5IHJlc3VsdHMuXG4gICAqL1xuICBwcm9wZXJ0eU5hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogV2hldGhlciB0byByZWFkIG9ubHkgdGhlIGZpcnN0IG1hdGNoaW5nIHJlc3VsdCwgb3IgYW4gYXJyYXkgb2YgcmVzdWx0cy5cbiAgICovXG4gIGZpcnN0OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBFaXRoZXIgYW4gZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgYSB0eXBlIGZvciB0aGUgcXVlcnkgcHJlZGljYXRlLCBvciBhIHNldCBvZiBzdHJpbmcgc2VsZWN0b3JzLlxuICAgKi9cbiAgcHJlZGljYXRlOiBvLkV4cHJlc3Npb258c3RyaW5nW107XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gaW5jbHVkZSBvbmx5IGRpcmVjdCBjaGlsZHJlbiBvciBhbGwgZGVzY2VuZGFudHMuXG4gICAqL1xuICBkZXNjZW5kYW50czogYm9vbGVhbjtcblxuICAvKipcbiAgICogQW4gZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgYSB0eXBlIHRvIHJlYWQgZnJvbSBlYWNoIG1hdGNoZWQgbm9kZSwgb3IgbnVsbCBpZiB0aGUgbm9kZSBpdHNlbGZcbiAgICogaXMgdG8gYmUgcmV0dXJuZWQuXG4gICAqL1xuICByZWFkOiBvLkV4cHJlc3Npb258bnVsbDtcbn1cblxuLyoqXG4gKiBPdXRwdXQgb2YgcmVuZGVyMyBkaXJlY3RpdmUgY29tcGlsYXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUjNEaXJlY3RpdmVEZWYge1xuICBleHByZXNzaW9uOiBvLkV4cHJlc3Npb247XG4gIHR5cGU6IG8uVHlwZTtcbn1cblxuLyoqXG4gKiBPdXRwdXQgb2YgcmVuZGVyMyBjb21wb25lbnQgY29tcGlsYXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUjNDb21wb25lbnREZWYge1xuICBleHByZXNzaW9uOiBvLkV4cHJlc3Npb247XG4gIHR5cGU6IG8uVHlwZTtcbn1cbiJdfQ==