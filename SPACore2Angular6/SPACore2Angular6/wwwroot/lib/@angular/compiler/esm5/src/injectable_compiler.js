/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { identifierName } from './compile_metadata';
import { Identifiers } from './identifiers';
import * as o from './output/output_ast';
import { convertValueToOutputAst } from './output/value_util';
function mapEntry(key, value) {
    return { key: key, value: value, quoted: false };
}
var InjectableCompiler = /** @class */ (function () {
    function InjectableCompiler(reflector, alwaysGenerateDef) {
        this.reflector = reflector;
        this.alwaysGenerateDef = alwaysGenerateDef;
        this.tokenInjector = reflector.resolveExternalReference(Identifiers.Injector);
    }
    InjectableCompiler.prototype.depsArray = function (deps, ctx) {
        var _this = this;
        return deps.map(function (dep) {
            var token = dep;
            var args = [token];
            var flags = 0 /* Default */;
            if (Array.isArray(dep)) {
                for (var i = 0; i < dep.length; i++) {
                    var v = dep[i];
                    if (v) {
                        if (v.ngMetadataName === 'Optional') {
                            flags |= 8 /* Optional */;
                        }
                        else if (v.ngMetadataName === 'SkipSelf') {
                            flags |= 4 /* SkipSelf */;
                        }
                        else if (v.ngMetadataName === 'Self') {
                            flags |= 2 /* Self */;
                        }
                        else if (v.ngMetadataName === 'Inject') {
                            token = v.token;
                        }
                        else {
                            token = v;
                        }
                    }
                }
            }
            var tokenExpr;
            if (typeof token === 'string') {
                tokenExpr = o.literal(token);
            }
            else if (token === _this.tokenInjector) {
                tokenExpr = o.importExpr(Identifiers.INJECTOR);
            }
            else {
                tokenExpr = ctx.importExpr(token);
            }
            if (flags !== 0 /* Default */) {
                args = [tokenExpr, o.literal(flags)];
            }
            else {
                args = [tokenExpr];
            }
            return o.importExpr(Identifiers.inject).callFn(args);
        });
    };
    InjectableCompiler.prototype.factoryFor = function (injectable, ctx) {
        var retValue;
        if (injectable.useExisting) {
            retValue = o.importExpr(Identifiers.inject).callFn([ctx.importExpr(injectable.useExisting)]);
        }
        else if (injectable.useFactory) {
            var deps = injectable.deps || [];
            if (deps.length > 0) {
                retValue = ctx.importExpr(injectable.useFactory).callFn(this.depsArray(deps, ctx));
            }
            else {
                return ctx.importExpr(injectable.useFactory);
            }
        }
        else if (injectable.useValue) {
            retValue = convertValueToOutputAst(ctx, injectable.useValue);
        }
        else {
            var clazz = injectable.useClass || injectable.symbol;
            var depArgs = this.depsArray(this.reflector.parameters(clazz), ctx);
            retValue = new o.InstantiateExpr(ctx.importExpr(clazz), depArgs);
        }
        return o.fn([], [new o.ReturnStatement(retValue)], undefined, undefined, injectable.symbol.name + '_Factory');
    };
    InjectableCompiler.prototype.injectableDef = function (injectable, ctx) {
        var providedIn = o.NULL_EXPR;
        if (injectable.providedIn !== undefined) {
            if (injectable.providedIn === null) {
                providedIn = o.NULL_EXPR;
            }
            else if (typeof injectable.providedIn === 'string') {
                providedIn = o.literal(injectable.providedIn);
            }
            else {
                providedIn = ctx.importExpr(injectable.providedIn);
            }
        }
        var def = [
            mapEntry('factory', this.factoryFor(injectable, ctx)),
            mapEntry('token', ctx.importExpr(injectable.type.reference)),
            mapEntry('providedIn', providedIn),
        ];
        return o.importExpr(Identifiers.defineInjectable).callFn([o.literalMap(def)]);
    };
    InjectableCompiler.prototype.compile = function (injectable, ctx) {
        if (this.alwaysGenerateDef || injectable.providedIn !== undefined) {
            var className = identifierName(injectable.type);
            var clazz = new o.ClassStmt(className, null, [
                new o.ClassField('ngInjectableDef', o.INFERRED_TYPE, [o.StmtModifier.Static], this.injectableDef(injectable, ctx)),
            ], [], new o.ClassMethod(null, [], []), []);
            ctx.statements.push(clazz);
        }
    };
    return InjectableCompiler;
}());
export { InjectableCompiler };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0YWJsZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9pbmplY3RhYmxlX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBOEUsY0FBYyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFHL0gsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMxQyxPQUFPLEtBQUssQ0FBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBYTVELGtCQUFrQixHQUFXLEVBQUUsS0FBbUI7SUFDaEQsT0FBTyxFQUFDLEdBQUcsS0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQ7SUFFRSw0QkFBb0IsU0FBMkIsRUFBVSxpQkFBMEI7UUFBL0QsY0FBUyxHQUFULFNBQVMsQ0FBa0I7UUFBVSxzQkFBaUIsR0FBakIsaUJBQWlCLENBQVM7UUFDakYsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUMsd0JBQXdCLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFTyxzQ0FBUyxHQUFqQixVQUFrQixJQUFXLEVBQUUsR0FBa0I7UUFBakQsaUJBd0NDO1FBdkNDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUc7WUFDakIsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDO1lBQ2hCLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkIsSUFBSSxLQUFLLGtCQUFtQyxDQUFDO1lBQzdDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDdEIsS0FBSyxJQUFJLENBQUMs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LFlBQVksRUFBRSxVQUFVLENBQUM7U0FDbkMsQ0FBQztRQUNGLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRUQsb0NBQU8sR0FBUCxVQUFRLFVBQXFDLEVBQUUsR0FBa0I7UUFDL0QsSUFBSSxJQUFJLENBQUMsaUJBQWlCLElBQUksVUFBVSxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7WUFDakUsSUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsQ0FBQztZQUNwRCxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQ3pCLFNBQVMsRUFBRSxJQUFJLEVBQ2Y7Z0JBQ0UsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUNaLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUMzRCxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUN6QyxFQUNELEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM3QyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM1QjtJQUNILENBQUM7SUFDSCx5QkFBQztBQUFELENBQUMsQUF4R0QsSUF3R0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U3RhdGljU3ltYm9sfSBmcm9tICcuL2FvdC9zdGF0aWNfc3ltYm9sJztcbmltcG9ydCB7Q29tcGlsZUluamVjdGFibGVNZXRhZGF0YSwgQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEsIENvbXBpbGVQcm92aWRlck1ldGFkYXRhLCBpZGVudGlmaWVyTmFtZX0gZnJvbSAnLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7Q29tcGlsZVJlZmxlY3Rvcn0gZnJvbSAnLi9jb21waWxlX3JlZmxlY3Rvcic7XG5pbXBvcnQge0luamVjdEZsYWdzLCBOb2RlRmxhZ3N9IGZyb20gJy4vY29yZSc7XG5pbXBvcnQge0lkZW50aWZpZXJzfSBmcm9tICcuL2lkZW50aWZpZXJzJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge2NvbnZlcnRWYWx1ZVRvT3V0cHV0QXN0fSBmcm9tICcuL291dHB1dC92YWx1ZV91dGlsJztcbmltcG9ydCB7dHlwZVNvdXJjZVNwYW59IGZyb20gJy4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge05nTW9kdWxlUHJvdmlkZXJBbmFseXplcn0gZnJvbSAnLi9wcm92aWRlcl9hbmFseXplcic7XG5pbXBvcnQge091dHB1dENvbnRleHR9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge2NvbXBvbmVudEZhY3RvcnlSZXNvbHZlclByb3ZpZGVyRGVmLCBkZXBEZWYsIHByb3ZpZGVyRGVmfSBmcm9tICcuL3ZpZXdfY29tcGlsZXIvcHJvdmlkZXJfY29tcGlsZXInO1xuXG50eXBlIE1hcEVudHJ5ID0ge1xuICBrZXk6IHN0cmluZyxcbiAgcXVvdGVkOiBib29sZWFuLFxuICB2YWx1ZTogby5FeHByZXNzaW9uXG59O1xudHlwZSBNYXBMaXRlcmFsID0gTWFwRW50cnlbXTtcblxuZnVuY3Rpb24gbWFwRW50cnkoa2V5OiBzdHJpbmcsIHZhbHVlOiBvLkV4cHJlc3Npb24pOiBNYXBFbnRyeSB7XG4gIHJldHVybiB7a2V5LCB2YWx1ZSwgcXVvdGVkOiBmYWxzZX07XG59XG5cbmV4cG9ydCBjbGFzcyBJbmplY3RhYmxlQ29tcGlsZXIge1xuICBwcml2YXRlIHRva2VuSW5qZWN0b3I6IFN0YXRpY1N5bWJvbDtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IsIHByaXZhdGUgYWx3YXlzR2VuZXJhdGVEZWY6IGJvb2xlYW4pIHtcbiAgICB0aGlzLnRva2VuSW5qZWN0b3IgPSByZWZsZWN0b3IucmVzb2x2ZUV4dGVybmFsUmVmZXJlbmNlKElkZW50aWZpZXJzLkluamVjdG9yKTtcbiAgfVxuXG4gIHByaXZhdGUgZGVwc0FycmF5KGRlcHM6IGFueVtdLCBjdHg6IE91dHB1dENvbnRleHQpOiBvLkV4cHJlc3Npb25bXSB7XG4gICAgcmV0dXJuIGRlcHMubWFwKGRlcCA9PiB7XG4gICAgICBsZXQgdG9rZW4gPSBkZXA7XG4gICAgICBsZXQgYXJncyA9IFt0b2tlbl07XG4gICAgICBsZXQgZmxhZ3M6IEluamVjdEZsYWdzID0gSW5qZWN0RmxhZ3MuRGVmYXVsdDtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGRlcCkpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjb25zdCB2ID0gZGVwW2ldO1xuICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICBpZiAodi5uZ01ldGFkYXRhTmFtZSA9PT0gJ09wdGlvbmFsJykge1xuICAgICAgICAgICAgICBmbGFncyB8PSBJbmplY3RGbGFncy5PcHRpb25hbDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodi5uZ01ldGFkYXRhTmFtZSA9PT0gJ1NraXBTZWxmJykge1xuICAgICAgICAgICAgICBmbGFncyB8PSBJbmplY3RGbGFncy5Ta2lwU2VsZjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodi5uZ01ldGFkYXRhTmFtZSA9PT0gJ1NlbGYnKSB7XG4gICAgICAgICAgICAgIGZsYWdzIHw9IEluamVjdEZsYWdzLlNlbGY7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHYubmdNZXRhZGF0YU5hbWUgPT09ICdJbmplY3QnKSB7XG4gICAgICAgICAgICAgIHRva2VuID0gdi50b2tlbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRva2VuID0gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IHRva2VuRXhwcjogby5FeHByZXNzaW9uO1xuICAgICAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdG9rZW5FeHByID0gby5saXRlcmFsKHRva2VuKTtcbiAgICAgIH0gZWxzZSBpZiAodG9rZW4gPT09IHRoaXMudG9rZW5JbmplY3Rvcikge1xuICAgICAgICB0b2tlbkV4cHIgPSBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuSU5KRUNUT1IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9rZW5FeHByID0gY3R4LmltcG9ydEV4cHIodG9rZW4pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmxhZ3MgIT09IEluamVjdEZsYWdzLkRlZmF1bHQpIHtcbiAgICAgICAgYXJncyA9IFt0b2tlbkV4cHIsIG8ubGl0ZXJhbChmbGFncyldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJncyA9IFt0b2tlbkV4cHJdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5pbmplY3QpLmNhbGxGbihhcmdzKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZhY3RvcnlGb3IoaW5qZWN0YWJsZTogQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YSwgY3R4OiBPdXRwdXRDb250ZXh0KTogby5FeHByZXNzaW9uIHtcbiAgICBsZXQgcmV0VmFsdWU6IG8uRXhwcmVzc2lvbjtcbiAgICBpZiAoaW5qZWN0YWJsZS51c2VFeGlzdGluZykge1xuICAgICAgcmV0VmFsdWUgPSBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuaW5qZWN0KS5jYWxsRm4oW2N0eC5pbXBvcnRFeHByKGluamVjdGFibGUudXNlRXhpc3RpbmcpXSk7XG4gICAgfSBlbHNlIGlmIChpbmplY3RhYmxlLnVzZUZhY3RvcnkpIHtcbiAgICAgIGNvbnN0IGRlcHMgPSBpbmplY3RhYmxlLmRlcHMgfHwgW107XG4gICAgICBpZiAoZGVwcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldFZhbHVlID0gY3R4LmltcG9ydEV4cHIoaW5qZWN0YWJsZS51c2VGYWN0b3J5KS5jYWxsRm4odGhpcy5kZXBzQXJyYXkoZGVwcywgY3R4KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY3R4LmltcG9ydEV4cHIoaW5qZWN0YWJsZS51c2VGYWN0b3J5KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGluamVjdGFibGUudXNlVmFsdWUpIHtcbiAgICAgIHJldFZhbHVlID0gY29udmVydFZhbHVlVG9PdXRwdXRBc3QoY3R4LCBpbmplY3RhYmxlLnVzZVZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY2xhenogPSBpbmplY3RhYmxlLnVzZUNsYXNzIHx8IGluamVjdGFibGUuc3ltYm9sO1xuICAgICAgY29uc3QgZGVwQXJncyA9IHRoaXMuZGVwc0FycmF5KHRoaXMucmVmbGVjdG9yLnBhcmFtZXRlcnMoY2xhenopLCBjdHgpO1xuICAgICAgcmV0VmFsdWUgPSBuZXcgby5JbnN0YW50aWF0ZUV4cHIoY3R4LmltcG9ydEV4cHIoY2xhenopLCBkZXBBcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIG8uZm4oXG4gICAgICAgIFtdLCBbbmV3IG8uUmV0dXJuU3RhdGVtZW50KHJldFZhbHVlKV0sIHVuZGVmaW5lZCwgdW5kZWZpbmVkLFxuICAgICAgICBpbmplY3RhYmxlLnN5bWJvbC5uYW1lICsgJ19GYWN0b3J5Jyk7XG4gIH1cblxuICBpbmplY3RhYmxlRGVmKGluamVjdGFibGU6IENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGEsIGN0eDogT3V0cHV0Q29udGV4dCk6IG8uRXhwcmVzc2lvbiB7XG4gICAgbGV0IHByb3ZpZGVkSW46IG8uRXhwcmVzc2lvbiA9IG8uTlVMTF9FWFBSO1xuICAgIGlmIChpbmplY3RhYmxlLnByb3ZpZGVkSW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGluamVjdGFibGUucHJvdmlkZWRJbiA9PT0gbnVsbCkge1xuICAgICAgICBwcm92aWRlZEluID0gby5OVUxMX0VYUFI7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbmplY3RhYmxlLnByb3ZpZGVkSW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHByb3ZpZGVkSW4gPSBvLmxpdGVyYWwoaW5qZWN0YWJsZS5wcm92aWRlZEluKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb3ZpZGVkSW4gPSBjdHguaW1wb3J0RXhwcihpbmplY3RhYmxlLnByb3ZpZGVkSW4pO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBkZWY6IE1hcExpdGVyYWwgPSBbXG4gICAgICBtYXBFbnRyeSgnZmFjdG9yeScsIHRoaXMuZmFjdG9yeUZvcihpbmplY3RhYmxlLCBjdHgpKSxcbiAgICAgIG1hcEVudHJ5KCd0b2tlbicsIGN0eC5pbXBvcnRFeHByKGluamVjdGFibGUudHlwZS5yZWZlcmVuY2UpKSxcbiAgICAgIG1hcEVudHJ5KCdwcm92aWRlZEluJywgcHJvdmlkZWRJbiksXG4gICAgXTtcbiAgICByZXR1cm4gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLmRlZmluZUluamVjdGFibGUpLmNhbGxGbihbby5saXRlcmFsTWFwKGRlZildKTtcbiAgfVxuXG4gIGNvbXBpbGUoaW5qZWN0YWJsZTogQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YSwgY3R4OiBPdXRwdXRDb250ZXh0KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYWx3YXlzR2VuZXJhdGVEZWYgfHwgaW5qZWN0YWJsZS5wcm92aWRlZEluICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGlkZW50aWZpZXJOYW1lKGluamVjdGFibGUudHlwZSkgITtcbiAgICAgIGNvbnN0IGNsYXp6ID0gbmV3IG8uQ2xhc3NTdG10KFxuICAgICAgICAgIGNsYXNzTmFtZSwgbnVsbCxcbiAgICAgICAgICBbXG4gICAgICAgICAgICBuZXcgby5DbGFzc0ZpZWxkKFxuICAgICAgICAgICAgICAgICduZ0luamVjdGFibGVEZWYnLCBvLklORkVSUkVEX1RZUEUsIFtvLlN0bXRNb2RpZmllci5TdGF0aWNdLFxuICAgICAgICAgICAgICAgIHRoaXMuaW5qZWN0YWJsZURlZihpbmplY3RhYmxlLCBjdHgpKSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIFtdLCBuZXcgby5DbGFzc01ldGhvZChudWxsLCBbXSwgW10pLCBbXSk7XG4gICAgICBjdHguc3RhdGVtZW50cy5wdXNoKGNsYXp6KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==