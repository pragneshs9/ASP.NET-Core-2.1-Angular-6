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
        define("@angular/compiler/src/i18n/serializers/xliff2", ["require", "exports", "tslib", "@angular/compiler/src/ml_parser/ast", "@angular/compiler/src/ml_parser/xml_parser", "@angular/compiler/src/i18n/digest", "@angular/compiler/src/i18n/i18n_ast", "@angular/compiler/src/i18n/parse_util", "@angular/compiler/src/i18n/serializers/serializer", "@angular/compiler/src/i18n/serializers/xml_helper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ml = require("@angular/compiler/src/ml_parser/ast");
    var xml_parser_1 = require("@angular/compiler/src/ml_parser/xml_parser");
    var digest_1 = require("@angular/compiler/src/i18n/digest");
    var i18n = require("@angular/compiler/src/i18n/i18n_ast");
    var parse_util_1 = require("@angular/compiler/src/i18n/parse_util");
    var serializer_1 = require("@angular/compiler/src/i18n/serializers/serializer");
    var xml = require("@angular/compiler/src/i18n/serializers/xml_helper");
    var _VERSION = '2.0';
    var _XMLNS = 'urn:oasis:names:tc:xliff:document:2.0';
    // TODO(vicb): make this a param (s/_/-/)
    var _DEFAULT_SOURCE_LANG = 'en';
    var _PLACEHOLDER_TAG = 'ph';
    var _PLACEHOLDER_SPANNING_TAG = 'pc';
    var _MARKER_TAG = 'mrk';
    var _XLIFF_TAG = 'xliff';
    var _SOURCE_TAG = 'source';
    var _TARGET_TAG = 'target';
    var _UNIT_TAG = 'unit';
    // http://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
    var Xliff2 = /** @class */ (function (_super) {
        tslib_1.__extends(Xliff2, _super);
        function Xliff2() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Xliff2.prototype.write = function (messages, locale) {
            var visitor = new _WriteVisitor();
            var units = [];
            messages.forEach(function (message) {
                var unit = new xml.Tag(_UNIT_TAG, { id: message.id });
                var notes = new xml.Tag('notes');
                if (message.description || message.meaning) {
                    if (message.description) {
                        notes.children.push(new xml.CR(8), new xml.Tag('note', { category: 'description' }, [new xml.Text(message.description)]));
                    }
                    if (message.meaning) {
                        notes.children.push(new xml.CR(8), new xml.Tag('note', { category: 'meaning' }, [new xml.Text(message.meaning)]));
                    }
                }
                message.sources.forEach(function (source) {
                    notes.children.push(new xml.CR(8), new xml.Tag('note', { category: 'location' }, [
                        new xml.Text(source.filePath + ":" + source.startLine + (source.endLine !== source.startLine ? ',' + source.endLine : ''))
                    ]));
                });
                notes.children.push(new xml.CR(6));
                unit.children.push(new xml.CR(6), notes);
                var segment = new xml.Tag('segment');
                segment.children.push(new xml.CR(8), new xml.Tag(_SOURCE_TAG, {}, visitor.serialize(message.nodes)), new xml.CR(6));
                unit.children.push(new xml.CR(6), segment, new xml.CR(4));
                units.push(new xml.CR(4), unit);
            });
            var file = new xml.Tag('file', { 'original': 'ng.template', id: 'ngi18n' }, tslib_1.__spread(units, [new xml.CR(2)]));
            var xliff = new xml.Tag(_XLIFF_TAG, { version: _VERSION, xmlns: _XMLNS, srcLang: locale || _DEFAULT_SOURCE_LANG }, [new xml.CR(2), file, new xml.CR()]);
            return xml.serialize([
                new xml.Declaration({ version: '1.0', encoding: 'UTF-8' }), new xml.CR(), xliff, new xml.CR()
            ]);
        };
        Xliff2.prototype.load = function (content, url) {
            // xliff to xml nodes
            var xliff2Parser = new Xliff2Parser();
            var _a = xliff2Parser.parse(content, url), locale = _a.locale, msgIdToHtml = _a.msgIdToHtml, errors = _a.errors;
            // xml nodes to i18n nodes
            var i18nNodesByMsgId = {};
            var converter = new XmlToI18n();
            Object.keys(msgIdToHtml).forEach(function (msgId) {
                var _a = converter.convert(msgIdToHtml[msgId], url), i18nNodes = _a.i18nNodes, e = _a.errors;
                errors.push.apply(errors, tslib_1.__spread(e));
                i18nNodesByMsgId[msgId] = i18nNodes;
            });
            if (errors.length) {
                throw new Error("xliff2 parse errors:\n" + errors.join('\n'));
            }
            return { locale: locale, i18nNodesByMsgId: i18nNodesByMsgId };
        };
        Xliff2.prototype.digest = function (message) { return digest_1.decimalDigest(message); };
        return Xliff2;
    }(serializer_1.Serializer));
    exports.Xliff2 = Xliff2;
    var _WriteVisitor = /** @class */ (function () {
        function _WriteVisitor() {
        }
        _WriteVisitor.prototype.visitText = function (text, context) { return [new xml.Text(text.value)]; };
        _WriteVisitor.prototype.visitContainer = function (container, context) {
            var _this = this;
            var nodes = [];
            container.children.forEach(function (node) { return nodes.push.apply(nodes, tslib_1.__spread(node.visit(_this))); });
            return nodes;
        };
        _WriteVisitor.prototype.visitIcu = function (icu, context) {
            var _this = this;
            var nodes = [new xml.Text("{" + icu.expressionPlaceholder + ", " + icu.type + ", ")];
            Object.keys(icu.cases).forEach(function (c) {
                nodes.push.apply(nodes, tslib_1.__spread([new xml.Text(c + " {")], icu.cases[c].visit(_this), [new xml.Text("} ")]));
            });
            nodes.push(new xml.Text("}"));
            return nodes;
        };
        _WriteVisitor.prototype.visitTagPlaceholder = function (ph, context) {
            var _this = this;
            var type = getTypeForTag(ph.tag);
            if (ph.isVoid) {
                var tagPh = new xml.Tag(_PLACEHOLDER_TAG, {
                    id: (this._nextPlaceholderId++).toString(),
                    equiv: ph.startName,
                    type: type,
                    disp: "<" + ph.tag + "/>",
                });
                return [tagPh];
            }
            var tagPc = new xml.Tag(_PLACEHOLDER_SPANNING_TAG, {
                id: (this._nextPlaceholderId++).toString(),
                equivStart: ph.startName,
                equivEnd: ph.closeName,
                type: type,
                dispStart: "<" + ph.tag + ">",
                dispEnd: "</" + ph.tag + ">",
            });
            var nodes = [].concat.apply([], tslib_1.__spread(ph.children.map(function (node) { return node.visit(_this); })));
            if (nodes.length) {
                nodes.forEach(function (node) { return tagPc.children.push(node); });
            }
            else {
                tagPc.children.push(new xml.Text(''));
            }
            return [tagPc];
        };
        _WriteVisitor.prototype.visitPlaceholder = function (ph, context) {
            var idStr = (this._nextPlaceholderId++).toString();
            return [new xml.Tag(_PLACEHOLDER_TAG, {
                    id: idStr,
                    equiv: ph.name,
                    disp: "{{" + ph.value + "}}",
                })];
        };
        _WriteVisitor.prototype.visitIcuPlaceholder = function (ph, context) {
            var cases = Object.keys(ph.value.cases).map(function (value) { return value + ' {...}'; }).join(' ');
            var idStr = (this._nextPlaceholderId++).toString();
            return [new xml.Tag(_PLACEHOLDER_TAG, { id: idStr, equiv: ph.name, disp: "{" + ph.value.expression + ", " + ph.value.type + ", " + cases + "}" })];
        };
        _WriteVisitor.prototype.serialize = function (nodes) {
            var _this = this;
            this._nextPlaceholderId = 0;
            return [].concat.apply([], tslib_1.__spread(nodes.map(function (node) { return node.visit(_this); })));
        };
        return _WriteVisitor;
    }());
    // Extract messages as xml nodes from the xliff file
    var Xliff2Parser = /** @class */ (function () {
        function Xliff2Parser() {
            this._locale = null;
        }
        Xliff2Parser.prototype.parse = function (xliff, url) {
            this._unitMlString = null;
            this._msgIdToHtml = {};
            var xml = new xml_parser_1.XmlParser().parse(xliff, url, false);
            this._errors = xml.errors;
            ml.visitAll(this, xml.rootNodes, null);
            return {
                msgIdToHtml: this._msgIdToHtml,
                errors: this._errors,
                locale: this._locale,
            };
        };
        Xliff2Parser.prototype.visitElement = function (element, context) {
            switch (element.name) {
                case _UNIT_TAG:
                    this._unitMlString = null;
                    var idAttr = element.attrs.find(function (attr) { return attr.name === 'id'; });
                    if (!idAttr) {
                        this._addError(element, "<" + _UNIT_TAG + "> misses the \"id\" attribute");
                    }
                    else {
                        var id = idAttr.value;
                        if (this._msgIdToHtml.hasOwnProperty(id)) {
                            this._addError(element, "Duplicated translations for msg " + id);
                        }
                        else {
                            ml.visitAll(this, element.children, null);
                            if (typeof this._unitMlString === 'string') {
                                this._msgIdToHtml[id] = this._unitMlString;
                            }
                            else {
                                this._addError(element, "Message " + id + " misses a translation");
                            }
                        }
                    }
                    break;
                case _SOURCE_TAG:
                    // ignore source message
                    break;
                case _TARGET_TAG:
                    var innerTextStart = element.startSourceSpan.end.offset;
                    var innerTextEnd = element.endSourceSpan.start.offset;
                    var content = element.startSourceSpan.start.file.content;
                    var innerText = content.slice(innerTextStart, innerTextEnd);
                    this._unitMlString = innerText;
                    break;
                case _XLIFF_TAG:
                    var localeAttr = element.attrs.find(function (attr) { return attr.name === 'trgLang'; });
                    if (localeAttr) {
                        this._locale = localeAttr.value;
                    }
                    var versionAttr = element.attrs.find(function (attr) { return attr.name === 'version'; });
                    if (versionAttr) {
                        var version = versionAttr.value;
                        if (version !== '2.0') {
                            this._addError(element, "The XLIFF file version " + version + " is not compatible with XLIFF 2.0 serializer");
                        }
                        else {
                            ml.visitAll(this, element.children, null);
                        }
                    }
                    break;
                default:
                    ml.visitAll(this, element.children, null);
            }
        };
        Xliff2Parser.prototype.visitAttribute = function (attribute, context) { };
        Xliff2Parser.prototype.visitText = function (text, context) { };
        Xliff2Parser.prototype.visitComment = function (comment, context) { };
        Xliff2Parser.prototype.visitExpansion = function (expansion, context) { };
        Xliff2Parser.prototype.visitExpansionCase = function (expansionCase, context) { };
        Xliff2Parser.prototype._addError = function (node, message) {
            this._errors.push(new parse_util_1.I18nError(node.sourceSpan, message));
        };
        return Xliff2Parser;
    }());
    // Convert ml nodes (xliff syntax) to i18n nodes
    var XmlToI18n = /** @class */ (function () {
        function XmlToI18n() {
        }
        XmlToI18n.prototype.convert = function (message, url) {
            var xmlIcu = new xml_parser_1.XmlParser().parse(message, url, true);
            this._errors = xmlIcu.errors;
            var i18nNodes = this._errors.length > 0 || xmlIcu.rootNodes.length == 0 ?
                [] : [].concat.apply([], tslib_1.__spread(ml.visitAll(this, xmlIcu.rootNodes)));
            return {
                i18nNodes: i18nNodes,
                errors: this._errors,
            };
        };
        XmlToI18n.prototype.visitText = function (text, context) { return new i18n.Text(text.value, text.sourceSpan); };
        XmlToI18n.prototype.visitElement = function (el, context) {
            var _this = this;
            switch (el.name) {
                case _PLACEHOLDER_TAG:
                    var nameAttr = el.attrs.find(function (attr) { return attr.name === 'equiv'; });
                    if (nameAttr) {
                        return [new i18n.Placeholder('', nameAttr.value, el.sourceSpan)];
                    }
                    this._addError(el, "<" + _PLACEHOLDER_TAG + "> misses the \"equiv\" attribute");
                    break;
                case _PLACEHOLDER_SPANNING_TAG:
                    var startAttr = el.attrs.find(function (attr) { return attr.name === 'equivStart'; });
                    var endAttr = el.attrs.find(function (attr) { return attr.name === 'equivEnd'; });
                    if (!startAttr) {
                        this._addError(el, "<" + _PLACEHOLDER_TAG + "> misses the \"equivStart\" attribute");
                    }
                    else if (!endAttr) {
                        this._addError(el, "<" + _PLACEHOLDER_TAG + "> misses the \"equivEnd\" attribute");
                    }
                    else {
                        var startId = startAttr.value;
                        var endId = endAttr.value;
                        var nodes = [];
                        return nodes.concat.apply(nodes, tslib_1.__spread([new i18n.Placeholder('', startId, el.sourceSpan)], el.children.map(function (node) { return node.visit(_this, null); }), [new i18n.Placeholder('', endId, el.sourceSpan)]));
                    }
                    break;
                case _MARKER_TAG:
                    return [].concat.apply([], tslib_1.__spread(ml.visitAll(this, el.children)));
                default:
                    this._addError(el, "Unexpected tag");
            }
            return null;
        };
        XmlToI18n.prototype.visitExpansion = function (icu, context) {
            var caseMap = {};
            ml.visitAll(this, icu.cases).forEach(function (c) {
                caseMap[c.value] = new i18n.Container(c.nodes, icu.sourceSpan);
            });
            return new i18n.Icu(icu.switchValue, icu.type, caseMap, icu.sourceSpan);
        };
        XmlToI18n.prototype.visitExpansionCase = function (icuCase, context) {
            return {
                value: icuCase.value,
                nodes: [].concat.apply([], tslib_1.__spread(ml.visitAll(this, icuCase.expression))),
            };
        };
        XmlToI18n.prototype.visitComment = function (comment, context) { };
        XmlToI18n.prototype.visitAttribute = function (attribute, context) { };
        XmlToI18n.prototype._addError = function (node, message) {
            this._errors.push(new parse_util_1.I18nError(node.sourceSpan, message));
        };
        return XmlToI18n;
    }());
    function getTypeForTag(tag) {
        switch (tag.toLowerCase()) {
            case 'br':
            case 'b':
            case 'i':
            case 'u':
                return 'fmt';
            case 'img':
                return 'image';
            case 'a':
                return 'link';
            default:
                return 'other';
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGxpZmYyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2kxOG4vc2VyaWFsaXplcnMveGxpZmYyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILHdEQUEwQztJQUMxQyx5RUFBcUQ7SUFDckQsNERBQXdDO0lBQ3hDLDBEQUFvQztJQUNwQyxvRUFBd0M7SUFFeEMsZ0ZBQXdDO0lBQ3hDLHVFQUFvQztJQUVwQyxJQUFNLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDdkIsSUFBTSxNQUFNLEdBQUcsdUNBQXVDLENBQUM7SUFDdkQseUNBQXlDO0lBQ3pDLElBQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDO0lBQ2xDLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0lBQzlCLElBQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDO0lBQ3ZDLElBQU0sV0FBVyxHQUFHLEtBQUssQ0FBQztJQUUxQixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUM7SUFDM0IsSUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDO0lBQzdCLElBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQztJQUM3QixJQUFNLFNBQVMsR0FBRyxNQUFNLENBQUM7SUFFekIsOEVBQThFO0lBQzlFO1FBQTRCLGtDQUFVO1FBQXRDOztRQWdGQSxDQUFDO1FBL0VDLHNCQUFLLEdBQUwsVUFBTSxRQUF3QixFQUFFLE1BQW1CO1lBQ2pELElBQU0sT0FBTyxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7WUFDcEMsSUFBTSxLQUFLLEdBQWUsRUFBRSxDQUFDO1lBRTdCLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPO2dCQUN0QixJQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUMsQ0FBQyxD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LENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUM7YUFDM0QsQ0FBQztRQUNKLENBQUM7UUFFRCxnQ0FBWSxHQUFaLFVBQWEsT0FBbUIsRUFBRSxPQUFZLElBQUcsQ0FBQztRQUVsRCxrQ0FBYyxHQUFkLFVBQWUsU0FBdUIsRUFBRSxPQUFZLElBQUcsQ0FBQztRQUVoRCw2QkFBUyxHQUFqQixVQUFrQixJQUFhLEVBQUUsT0FBZTtZQUM5QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFDSCxnQkFBQztJQUFELENBQUMsQUFsRkQsSUFrRkM7SUFFRCx1QkFBdUIsR0FBVztRQUNoQyxRQUFRLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUN6QixLQUFLLElBQUksQ0FBQztZQUNWLEtBQUssR0FBRyxDQUFDO1lBQ1QsS0FBSyxHQUFHLENBQUM7WUFDVCxLQUFLLEdBQUc7Z0JBQ04sT0FBTyxLQUFLLENBQUM7WUFDZixLQUFLLEtBQUs7Z0JBQ1IsT0FBTyxPQUFPLENBQUM7WUFDakIsS0FBSyxHQUFHO2dCQUNOLE9BQU8sTUFBTSxDQUFDO1lBQ2hCO2dCQUNFLE9BQU8sT0FBTyxDQUFDO1NBQ2xCO0lBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbWwgZnJvbSAnLi4vLi4vbWxfcGFyc2VyL2FzdCc7XG5pbXBvcnQge1htbFBhcnNlcn0gZnJvbSAnLi4vLi4vbWxfcGFyc2VyL3htbF9wYXJzZXInO1xuaW1wb3J0IHtkZWNpbWFsRGlnZXN0fSBmcm9tICcuLi9kaWdlc3QnO1xuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuLi9pMThuX2FzdCc7XG5pbXBvcnQge0kxOG5FcnJvcn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5cbmltcG9ydCB7U2VyaWFsaXplcn0gZnJvbSAnLi9zZXJpYWxpemVyJztcbmltcG9ydCAqIGFzIHhtbCBmcm9tICcuL3htbF9oZWxwZXInO1xuXG5jb25zdCBfVkVSU0lPTiA9ICcyLjAnO1xuY29uc3QgX1hNTE5TID0gJ3VybjpvYXNpczpuYW1lczp0Yzp4bGlmZjpkb2N1bWVudDoyLjAnO1xuLy8gVE9ETyh2aWNiKTogbWFrZSB0aGlzIGEgcGFyYW0gKHMvXy8tLylcbmNvbnN0IF9ERUZBVUxUX1NPVVJDRV9MQU5HID0gJ2VuJztcbmNvbnN0IF9QTEFDRUhPTERFUl9UQUcgPSAncGgnO1xuY29uc3QgX1BMQUNFSE9MREVSX1NQQU5OSU5HX1RBRyA9ICdwYyc7XG5jb25zdCBfTUFSS0VSX1RBRyA9ICdtcmsnO1xuXG5jb25zdCBfWExJRkZfVEFHID0gJ3hsaWZmJztcbmNvbnN0IF9TT1VSQ0VfVEFHID0gJ3NvdXJjZSc7XG5jb25zdCBfVEFSR0VUX1RBRyA9ICd0YXJnZXQnO1xuY29uc3QgX1VOSVRfVEFHID0gJ3VuaXQnO1xuXG4vLyBodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy94bGlmZi94bGlmZi1jb3JlL3YyLjAvb3MveGxpZmYtY29yZS12Mi4wLW9zLmh0bWxcbmV4cG9ydCBjbGFzcyBYbGlmZjIgZXh0ZW5kcyBTZXJpYWxpemVyIHtcbiAgd3JpdGUobWVzc2FnZXM6IGkxOG4uTWVzc2FnZVtdLCBsb2NhbGU6IHN0cmluZ3xudWxsKTogc3RyaW5nIHtcbiAgICBjb25zdCB2aXNpdG9yID0gbmV3IF9Xcml0ZVZpc2l0b3IoKTtcbiAgICBjb25zdCB1bml0czogeG1sLk5vZGVbXSA9IFtdO1xuXG4gICAgbWVzc2FnZXMuZm9yRWFjaChtZXNzYWdlID0+IHtcbiAgICAgIGNvbnN0IHVuaXQgPSBuZXcgeG1sLlRhZyhfVU5JVF9UQUcsIHtpZDogbWVzc2FnZS5pZH0pO1xuICAgICAgY29uc3Qgbm90ZXMgPSBuZXcgeG1sLlRhZygnbm90ZXMnKTtcblxuICAgICAgaWYgKG1lc3NhZ2UuZGVzY3JpcHRpb24gfHwgbWVzc2FnZS5tZWFuaW5nKSB7XG4gICAgICAgIGlmIChtZXNzYWdlLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgbm90ZXMuY2hpbGRyZW4ucHVzaChcbiAgICAgICAgICAgICAgbmV3IHhtbC5DUig4KSxcbiAgICAgICAgICAgICAgbmV3IHhtbC5UYWcoJ25vdGUnLCB7Y2F0ZWdvcnk6ICdkZXNjcmlwdGlvbid9LCBbbmV3IHhtbC5UZXh0KG1lc3NhZ2UuZGVzY3JpcHRpb24pXSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1lc3NhZ2UubWVhbmluZykge1xuICAgICAgICAgIG5vdGVzLmNoaWxkcmVuLnB1c2goXG4gICAgICAgICAgICAgIG5ldyB4bWwuQ1IoOCksXG4gICAgICAgICAgICAgIG5ldyB4bWwuVGFnKCdub3RlJywge2NhdGVnb3J5OiAnbWVhbmluZyd9LCBbbmV3IHhtbC5UZXh0KG1lc3NhZ2UubWVhbmluZyldKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbWVzc2FnZS5zb3VyY2VzLmZvckVhY2goKHNvdXJjZTogaTE4bi5NZXNzYWdlU3BhbikgPT4ge1xuICAgICAgICBub3Rlcy5jaGlsZHJlbi5wdXNoKG5ldyB4bWwuQ1IoOCksIG5ldyB4bWwuVGFnKCdub3RlJywge2NhdGVnb3J5OiAnbG9jYXRpb24nfSwgW1xuICAgICAgICAgIG5ldyB4bWwuVGV4dChcbiAgICAgICAgICAgICAgYCR7c291cmNlLmZpbGVQYXRofToke3NvdXJjZS5zdGFydExpbmV9JHtzb3VyY2UuZW5kTGluZSAhPT0gc291cmNlLnN0YXJ0TGluZSA/ICcsJyArIHNvdXJjZS5lbmRMaW5lIDogJyd9YClcbiAgICAgICAgXSkpO1xuICAgICAgfSk7XG5cbiAgICAgIG5vdGVzLmNoaWxkcmVuLnB1c2gobmV3IHhtbC5DUig2KSk7XG4gICAgICB1bml0LmNoaWxkcmVuLnB1c2gobmV3IHhtbC5DUig2KSwgbm90ZXMpO1xuXG4gICAgICBjb25zdCBzZWdtZW50ID0gbmV3IHhtbC5UYWcoJ3NlZ21lbnQnKTtcblxuICAgICAgc2VnbWVudC5jaGlsZHJlbi5wdXNoKFxuICAgICAgICAgIG5ldyB4bWwuQ1IoOCksIG5ldyB4bWwuVGFnKF9TT1VSQ0VfVEFHLCB7fSwgdmlzaXRvci5zZXJpYWxpemUobWVzc2FnZS5ub2RlcykpLFxuICAgICAgICAgIG5ldyB4bWwuQ1IoNikpO1xuXG4gICAgICB1bml0LmNoaWxkcmVuLnB1c2gobmV3IHhtbC5DUig2KSwgc2VnbWVudCwgbmV3IHhtbC5DUig0KSk7XG5cbiAgICAgIHVuaXRzLnB1c2gobmV3IHhtbC5DUig0KSwgdW5pdCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBmaWxlID1cbiAgICAgICAgbmV3IHhtbC5UYWcoJ2ZpbGUnLCB7J29yaWdpbmFsJzogJ25nLnRlbXBsYXRlJywgaWQ6ICduZ2kxOG4nfSwgWy4uLnVuaXRzLCBuZXcgeG1sLkNSKDIpXSk7XG5cbiAgICBjb25zdCB4bGlmZiA9IG5ldyB4bWwuVGFnKFxuICAgICAgICBfWExJRkZfVEFHLCB7dmVyc2lvbjogX1ZFUlNJT04sIHhtbG5zOiBfWE1MTlMsIHNyY0xhbmc6IGxvY2FsZSB8fCBfREVGQVVMVF9TT1VSQ0VfTEFOR30sXG4gICAgICAgIFtuZXcgeG1sLkNSKDIpLCBmaWxlLCBuZXcgeG1sLkNSKCldKTtcblxuICAgIHJldHVybiB4bWwuc2VyaWFsaXplKFtcbiAgICAgIG5ldyB4bWwuRGVjbGFyYXRpb24oe3ZlcnNpb246ICcxLjAnLCBlbmNvZGluZzogJ1VURi04J30pLCBuZXcgeG1sLkNSKCksIHhsaWZmLCBuZXcgeG1sLkNSKClcbiAgICBdKTtcbiAgfVxuXG4gIGxvYWQoY29udGVudDogc3RyaW5nLCB1cmw6IHN0cmluZyk6XG4gICAgICB7bG9jYWxlOiBzdHJpbmcsIGkxOG5Ob2Rlc0J5TXNnSWQ6IHtbbXNnSWQ6IHN0cmluZ106IGkxOG4uTm9kZVtdfX0ge1xuICAgIC8vIHhsaWZmIHRvIHhtbCBub2Rlc1xuICAgIGNvbnN0IHhsaWZmMlBhcnNlciA9IG5ldyBYbGlmZjJQYXJzZXIoKTtcbiAgICBjb25zdCB7bG9jYWxlLCBtc2dJZFRvSHRtbCwgZXJyb3JzfSA9IHhsaWZmMlBhcnNlci5wYXJzZShjb250ZW50LCB1cmwpO1xuXG4gICAgLy8geG1sIG5vZGVzIHRvIGkxOG4gbm9kZXNcbiAgICBjb25zdCBpMThuTm9kZXNCeU1zZ0lkOiB7W21zZ0lkOiBzdHJpbmddOiBpMThuLk5vZGVbXX0gPSB7fTtcbiAgICBjb25zdCBjb252ZXJ0ZXIgPSBuZXcgWG1sVG9JMThuKCk7XG5cbiAgICBPYmplY3Qua2V5cyhtc2dJZFRvSHRtbCkuZm9yRWFjaChtc2dJZCA9PiB7XG4gICAgICBjb25zdCB7aTE4bk5vZGVzLCBlcnJvcnM6IGV9ID0gY29udmVydGVyLmNvbnZlcnQobXNnSWRUb0h0bWxbbXNnSWRdLCB1cmwpO1xuICAgICAgZXJyb3JzLnB1c2goLi4uZSk7XG4gICAgICBpMThuTm9kZXNCeU1zZ0lkW21zZ0lkXSA9IGkxOG5Ob2RlcztcbiAgICB9KTtcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHhsaWZmMiBwYXJzZSBlcnJvcnM6XFxuJHtlcnJvcnMuam9pbignXFxuJyl9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtsb2NhbGU6IGxvY2FsZSAhLCBpMThuTm9kZXNCeU1zZ0lkfTtcbiAgfVxuXG4gIGRpZ2VzdChtZXNzYWdlOiBpMThuLk1lc3NhZ2UpOiBzdHJpbmcgeyByZXR1cm4gZGVjaW1hbERpZ2VzdChtZXNzYWdlKTsgfVxufVxuXG5jbGFzcyBfV3JpdGVWaXNpdG9yIGltcGxlbWVudHMgaTE4bi5WaXNpdG9yIHtcbiAgcHJpdmF0ZSBfbmV4dFBsYWNlaG9sZGVySWQ6IG51bWJlcjtcblxuICB2aXNpdFRleHQodGV4dDogaTE4bi5UZXh0LCBjb250ZXh0PzogYW55KTogeG1sLk5vZGVbXSB7IHJldHVybiBbbmV3IHhtbC5UZXh0KHRleHQudmFsdWUpXTsgfVxuXG4gIHZpc2l0Q29udGFpbmVyKGNvbnRhaW5lcjogaTE4bi5Db250YWluZXIsIGNvbnRleHQ/OiBhbnkpOiB4bWwuTm9kZVtdIHtcbiAgICBjb25zdCBub2RlczogeG1sLk5vZGVbXSA9IFtdO1xuICAgIGNvbnRhaW5lci5jaGlsZHJlbi5mb3JFYWNoKChub2RlOiBpMThuLk5vZGUpID0+IG5vZGVzLnB1c2goLi4ubm9kZS52aXNpdCh0aGlzKSkpO1xuICAgIHJldHVybiBub2RlcztcbiAgfVxuXG4gIHZpc2l0SWN1KGljdTogaTE4bi5JY3UsIGNvbnRleHQ/OiBhbnkpOiB4bWwuTm9kZVtdIHtcbiAgICBjb25zdCBub2RlcyA9IFtuZXcgeG1sLlRleHQoYHske2ljdS5leHByZXNzaW9uUGxhY2Vob2xkZXJ9LCAke2ljdS50eXBlfSwgYCldO1xuXG4gICAgT2JqZWN0LmtleXMoaWN1LmNhc2VzKS5mb3JFYWNoKChjOiBzdHJpbmcpID0+IHtcbiAgICAgIG5vZGVzLnB1c2gobmV3IHhtbC5UZXh0KGAke2N9IHtgKSwgLi4uaWN1LmNhc2VzW2NdLnZpc2l0KHRoaXMpLCBuZXcgeG1sLlRleHQoYH0gYCkpO1xuICAgIH0pO1xuXG4gICAgbm9kZXMucHVzaChuZXcgeG1sLlRleHQoYH1gKSk7XG5cbiAgICByZXR1cm4gbm9kZXM7XG4gIH1cblxuICB2aXNpdFRhZ1BsYWNlaG9sZGVyKHBoOiBpMThuLlRhZ1BsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogeG1sLk5vZGVbXSB7XG4gICAgY29uc3QgdHlwZSA9IGdldFR5cGVGb3JUYWcocGgudGFnKTtcblxuICAgIGlmIChwaC5pc1ZvaWQpIHtcbiAgICAgIGNvbnN0IHRhZ1BoID0gbmV3IHhtbC5UYWcoX1BMQUNFSE9MREVSX1RBRywge1xuICAgICAgICBpZDogKHRoaXMuX25leHRQbGFjZWhvbGRlcklkKyspLnRvU3RyaW5nKCksXG4gICAgICAgIGVxdWl2OiBwaC5zdGFydE5hbWUsXG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIGRpc3A6IGA8JHtwaC50YWd9Lz5gLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gW3RhZ1BoXTtcbiAgICB9XG5cbiAgICBjb25zdCB0YWdQYyA9IG5ldyB4bWwuVGFnKF9QTEFDRUhPTERFUl9TUEFOTklOR19UQUcsIHtcbiAgICAgIGlkOiAodGhpcy5fbmV4dFBsYWNlaG9sZGVySWQrKykudG9TdHJpbmcoKSxcbiAgICAgIGVxdWl2U3RhcnQ6IHBoLnN0YXJ0TmFtZSxcbiAgICAgIGVxdWl2RW5kOiBwaC5jbG9zZU5hbWUsXG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgZGlzcFN0YXJ0OiBgPCR7cGgudGFnfT5gLFxuICAgICAgZGlzcEVuZDogYDwvJHtwaC50YWd9PmAsXG4gICAgfSk7XG4gICAgY29uc3Qgbm9kZXM6IHhtbC5Ob2RlW10gPSBbXS5jb25jYXQoLi4ucGguY2hpbGRyZW4ubWFwKG5vZGUgPT4gbm9kZS52aXNpdCh0aGlzKSkpO1xuICAgIGlmIChub2Rlcy5sZW5ndGgpIHtcbiAgICAgIG5vZGVzLmZvckVhY2goKG5vZGU6IHhtbC5Ob2RlKSA9PiB0YWdQYy5jaGlsZHJlbi5wdXNoKG5vZGUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFnUGMuY2hpbGRyZW4ucHVzaChuZXcgeG1sLlRleHQoJycpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3RhZ1BjXTtcbiAgfVxuXG4gIHZpc2l0UGxhY2Vob2xkZXIocGg6IGkxOG4uUGxhY2Vob2xkZXIsIGNvbnRleHQ/OiBhbnkpOiB4bWwuTm9kZVtdIHtcbiAgICBjb25zdCBpZFN0ciA9ICh0aGlzLl9uZXh0UGxhY2Vob2xkZXJJZCsrKS50b1N0cmluZygpO1xuICAgIHJldHVybiBbbmV3IHhtbC5UYWcoX1BMQUNFSE9MREVSX1RBRywge1xuICAgICAgaWQ6IGlkU3RyLFxuICAgICAgZXF1aXY6IHBoLm5hbWUsXG4gICAgICBkaXNwOiBge3ske3BoLnZhbHVlfX19YCxcbiAgICB9KV07XG4gIH1cblxuICB2aXNpdEljdVBsYWNlaG9sZGVyKHBoOiBpMThuLkljdVBsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogeG1sLk5vZGVbXSB7XG4gICAgY29uc3QgY2FzZXMgPSBPYmplY3Qua2V5cyhwaC52YWx1ZS5jYXNlcykubWFwKCh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSArICcgey4uLn0nKS5qb2luKCcgJyk7XG4gICAgY29uc3QgaWRTdHIgPSAodGhpcy5fbmV4dFBsYWNlaG9sZGVySWQrKykudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gW25ldyB4bWwuVGFnKFxuICAgICAgICBfUExBQ0VIT0xERVJfVEFHLFxuICAgICAgICB7aWQ6IGlkU3RyLCBlcXVpdjogcGgubmFtZSwgZGlzcDogYHske3BoLnZhbHVlLmV4cHJlc3Npb259LCAke3BoLnZhbHVlLnR5cGV9LCAke2Nhc2VzfX1gfSldO1xuICB9XG5cbiAgc2VyaWFsaXplKG5vZGVzOiBpMThuLk5vZGVbXSk6IHhtbC5Ob2RlW10ge1xuICAgIHRoaXMuX25leHRQbGFjZWhvbGRlcklkID0gMDtcbiAgICByZXR1cm4gW10uY29uY2F0KC4uLm5vZGVzLm1hcChub2RlID0+IG5vZGUudmlzaXQodGhpcykpKTtcbiAgfVxufVxuXG4vLyBFeHRyYWN0IG1lc3NhZ2VzIGFzIHhtbCBub2RlcyBmcm9tIHRoZSB4bGlmZiBmaWxlXG5jbGFzcyBYbGlmZjJQYXJzZXIgaW1wbGVtZW50cyBtbC5WaXNpdG9yIHtcbiAgcHJpdmF0ZSBfdW5pdE1sU3RyaW5nOiBzdHJpbmd8bnVsbDtcbiAgcHJpdmF0ZSBfZXJyb3JzOiBJMThuRXJyb3JbXTtcbiAgcHJpdmF0ZSBfbXNnSWRUb0h0bWw6IHtbbXNnSWQ6IHN0cmluZ106IHN0cmluZ307XG4gIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gIHBhcnNlKHhsaWZmOiBzdHJpbmcsIHVybDogc3RyaW5nKSB7XG4gICAgdGhpcy5fdW5pdE1sU3RyaW5nID0gbnVsbDtcbiAgICB0aGlzLl9tc2dJZFRvSHRtbCA9IHt9O1xuXG4gICAgY29uc3QgeG1sID0gbmV3IFhtbFBhcnNlcigpLnBhcnNlKHhsaWZmLCB1cmwsIGZhbHNlKTtcblxuICAgIHRoaXMuX2Vycm9ycyA9IHhtbC5lcnJvcnM7XG4gICAgbWwudmlzaXRBbGwodGhpcywgeG1sLnJvb3ROb2RlcywgbnVsbCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbXNnSWRUb0h0bWw6IHRoaXMuX21zZ0lkVG9IdG1sLFxuICAgICAgZXJyb3JzOiB0aGlzLl9lcnJvcnMsXG4gICAgICBsb2NhbGU6IHRoaXMuX2xvY2FsZSxcbiAgICB9O1xuICB9XG5cbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IG1sLkVsZW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgc3dpdGNoIChlbGVtZW50Lm5hbWUpIHtcbiAgICAgIGNhc2UgX1VOSVRfVEFHOlxuICAgICAgICB0aGlzLl91bml0TWxTdHJpbmcgPSBudWxsO1xuICAgICAgICBjb25zdCBpZEF0dHIgPSBlbGVtZW50LmF0dHJzLmZpbmQoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gJ2lkJyk7XG4gICAgICAgIGlmICghaWRBdHRyKSB7XG4gICAgICAgICAgdGhpcy5fYWRkRXJyb3IoZWxlbWVudCwgYDwke19VTklUX1RBR30+IG1pc3NlcyB0aGUgXCJpZFwiIGF0dHJpYnV0ZWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGlkID0gaWRBdHRyLnZhbHVlO1xuICAgICAgICAgIGlmICh0aGlzLl9tc2dJZFRvSHRtbC5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZEVycm9yKGVsZW1lbnQsIGBEdXBsaWNhdGVkIHRyYW5zbGF0aW9ucyBmb3IgbXNnICR7aWR9YCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1sLnZpc2l0QWxsKHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4sIG51bGwpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl91bml0TWxTdHJpbmcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIHRoaXMuX21zZ0lkVG9IdG1sW2lkXSA9IHRoaXMuX3VuaXRNbFN0cmluZztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuX2FkZEVycm9yKGVsZW1lbnQsIGBNZXNzYWdlICR7aWR9IG1pc3NlcyBhIHRyYW5zbGF0aW9uYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIF9TT1VSQ0VfVEFHOlxuICAgICAgICAvLyBpZ25vcmUgc291cmNlIG1lc3NhZ2VcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgX1RBUkdFVF9UQUc6XG4gICAgICAgIGNvbnN0IGlubmVyVGV4dFN0YXJ0ID0gZWxlbWVudC5zdGFydFNvdXJjZVNwYW4gIS5lbmQub2Zmc2V0O1xuICAgICAgICBjb25zdCBpbm5lclRleHRFbmQgPSBlbGVtZW50LmVuZFNvdXJjZVNwYW4gIS5zdGFydC5vZmZzZXQ7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBlbGVtZW50LnN0YXJ0U291cmNlU3BhbiAhLnN0YXJ0LmZpbGUuY29udGVudDtcbiAgICAgICAgY29uc3QgaW5uZXJUZXh0ID0gY29udGVudC5zbGljZShpbm5lclRleHRTdGFydCwgaW5uZXJUZXh0RW5kKTtcbiAgICAgICAgdGhpcy5fdW5pdE1sU3RyaW5nID0gaW5uZXJUZXh0O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBfWExJRkZfVEFHOlxuICAgICAgICBjb25zdCBsb2NhbGVBdHRyID0gZWxlbWVudC5hdHRycy5maW5kKChhdHRyKSA9PiBhdHRyLm5hbWUgPT09ICd0cmdMYW5nJyk7XG4gICAgICAgIGlmIChsb2NhbGVBdHRyKSB7XG4gICAgICAgICAgdGhpcy5fbG9jYWxlID0gbG9jYWxlQXR0ci52YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZlcnNpb25BdHRyID0gZWxlbWVudC5hdHRycy5maW5kKChhdHRyKSA9PiBhdHRyLm5hbWUgPT09ICd2ZXJzaW9uJyk7XG4gICAgICAgIGlmICh2ZXJzaW9uQXR0cikge1xuICAgICAgICAgIGNvbnN0IHZlcnNpb24gPSB2ZXJzaW9uQXR0ci52YWx1ZTtcbiAgICAgICAgICBpZiAodmVyc2lvbiAhPT0gJzIuMCcpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZEVycm9yKFxuICAgICAgICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgYFRoZSBYTElGRiBmaWxlIHZlcnNpb24gJHt2ZXJzaW9ufSBpcyBub3QgY29tcGF0aWJsZSB3aXRoIFhMSUZGIDIuMCBzZXJpYWxpemVyYCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1sLnZpc2l0QWxsKHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4sIG51bGwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG1sLnZpc2l0QWxsKHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4sIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0QXR0cmlidXRlKGF0dHJpYnV0ZTogbWwuQXR0cmlidXRlLCBjb250ZXh0OiBhbnkpOiBhbnkge31cblxuICB2aXNpdFRleHQodGV4dDogbWwuVGV4dCwgY29udGV4dDogYW55KTogYW55IHt9XG5cbiAgdmlzaXRDb21tZW50KGNvbW1lbnQ6IG1sLkNvbW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuXG4gIHZpc2l0RXhwYW5zaW9uKGV4cGFuc2lvbjogbWwuRXhwYW5zaW9uLCBjb250ZXh0OiBhbnkpOiBhbnkge31cblxuICB2aXNpdEV4cGFuc2lvbkNhc2UoZXhwYW5zaW9uQ2FzZTogbWwuRXhwYW5zaW9uQ2FzZSwgY29udGV4dDogYW55KTogYW55IHt9XG5cbiAgcHJpdmF0ZSBfYWRkRXJyb3Iobm9kZTogbWwuTm9kZSwgbWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZXJyb3JzLnB1c2gobmV3IEkxOG5FcnJvcihub2RlLnNvdXJjZVNwYW4sIG1lc3NhZ2UpKTtcbiAgfVxufVxuXG4vLyBDb252ZXJ0IG1sIG5vZGVzICh4bGlmZiBzeW50YXgpIHRvIGkxOG4gbm9kZXNcbmNsYXNzIFhtbFRvSTE4biBpbXBsZW1lbnRzIG1sLlZpc2l0b3Ige1xuICBwcml2YXRlIF9lcnJvcnM6IEkxOG5FcnJvcltdO1xuXG4gIGNvbnZlcnQobWVzc2FnZTogc3RyaW5nLCB1cmw6IHN0cmluZykge1xuICAgIGNvbnN0IHhtbEljdSA9IG5ldyBYbWxQYXJzZXIoKS5wYXJzZShtZXNzYWdlLCB1cmwsIHRydWUpO1xuICAgIHRoaXMuX2Vycm9ycyA9IHhtbEljdS5lcnJvcnM7XG5cbiAgICBjb25zdCBpMThuTm9kZXMgPSB0aGlzLl9lcnJvcnMubGVuZ3RoID4gMCB8fCB4bWxJY3Uucm9vdE5vZGVzLmxlbmd0aCA9PSAwID9cbiAgICAgICAgW10gOlxuICAgICAgICBbXS5jb25jYXQoLi4ubWwudmlzaXRBbGwodGhpcywgeG1sSWN1LnJvb3ROb2RlcykpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGkxOG5Ob2RlcyxcbiAgICAgIGVycm9yczogdGhpcy5fZXJyb3JzLFxuICAgIH07XG4gIH1cblxuICB2aXNpdFRleHQodGV4dDogbWwuVGV4dCwgY29udGV4dDogYW55KSB7IHJldHVybiBuZXcgaTE4bi5UZXh0KHRleHQudmFsdWUsIHRleHQuc291cmNlU3Bhbik7IH1cblxuICB2aXNpdEVsZW1lbnQoZWw6IG1sLkVsZW1lbnQsIGNvbnRleHQ6IGFueSk6IGkxOG4uTm9kZVtdfG51bGwge1xuICAgIHN3aXRjaCAoZWwubmFtZSkge1xuICAgICAgY2FzZSBfUExBQ0VIT0xERVJfVEFHOlxuICAgICAgICBjb25zdCBuYW1lQXR0ciA9IGVsLmF0dHJzLmZpbmQoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gJ2VxdWl2Jyk7XG4gICAgICAgIGlmIChuYW1lQXR0cikge1xuICAgICAgICAgIHJldHVybiBbbmV3IGkxOG4uUGxhY2Vob2xkZXIoJycsIG5hbWVBdHRyLnZhbHVlLCBlbC5zb3VyY2VTcGFuKV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9hZGRFcnJvcihlbCwgYDwke19QTEFDRUhPTERFUl9UQUd9PiBtaXNzZXMgdGhlIFwiZXF1aXZcIiBhdHRyaWJ1dGVgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIF9QTEFDRUhPTERFUl9TUEFOTklOR19UQUc6XG4gICAgICAgIGNvbnN0IHN0YXJ0QXR0ciA9IGVsLmF0dHJzLmZpbmQoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gJ2VxdWl2U3RhcnQnKTtcbiAgICAgICAgY29uc3QgZW5kQXR0ciA9IGVsLmF0dHJzLmZpbmQoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gJ2VxdWl2RW5kJyk7XG5cbiAgICAgICAgaWYgKCFzdGFydEF0dHIpIHtcbiAgICAgICAgICB0aGlzLl9hZGRFcnJvcihlbCwgYDwke19QTEFDRUhPTERFUl9UQUd9PiBtaXNzZXMgdGhlIFwiZXF1aXZTdGFydFwiIGF0dHJpYnV0ZWApO1xuICAgICAgICB9IGVsc2UgaWYgKCFlbmRBdHRyKSB7XG4gICAgICAgICAgdGhpcy5fYWRkRXJyb3IoZWwsIGA8JHtfUExBQ0VIT0xERVJfVEFHfT4gbWlzc2VzIHRoZSBcImVxdWl2RW5kXCIgYXR0cmlidXRlYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgc3RhcnRJZCA9IHN0YXJ0QXR0ci52YWx1ZTtcbiAgICAgICAgICBjb25zdCBlbmRJZCA9IGVuZEF0dHIudmFsdWU7XG5cbiAgICAgICAgICBjb25zdCBub2RlczogaTE4bi5Ob2RlW10gPSBbXTtcblxuICAgICAgICAgIHJldHVybiBub2Rlcy5jb25jYXQoXG4gICAgICAgICAgICAgIG5ldyBpMThuLlBsYWNlaG9sZGVyKCcnLCBzdGFydElkLCBlbC5zb3VyY2VTcGFuKSxcbiAgICAgICAgICAgICAgLi4uZWwuY2hpbGRyZW4ubWFwKG5vZGUgPT4gbm9kZS52aXNpdCh0aGlzLCBudWxsKSksXG4gICAgICAgICAgICAgIG5ldyBpMThuLlBsYWNlaG9sZGVyKCcnLCBlbmRJZCwgZWwuc291cmNlU3BhbikpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBfTUFSS0VSX1RBRzpcbiAgICAgICAgcmV0dXJuIFtdLmNvbmNhdCguLi5tbC52aXNpdEFsbCh0aGlzLCBlbC5jaGlsZHJlbikpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fYWRkRXJyb3IoZWwsIGBVbmV4cGVjdGVkIHRhZ2ApO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb24oaWN1OiBtbC5FeHBhbnNpb24sIGNvbnRleHQ6IGFueSkge1xuICAgIGNvbnN0IGNhc2VNYXA6IHtbdmFsdWU6IHN0cmluZ106IGkxOG4uTm9kZX0gPSB7fTtcblxuICAgIG1sLnZpc2l0QWxsKHRoaXMsIGljdS5jYXNlcykuZm9yRWFjaCgoYzogYW55KSA9PiB7XG4gICAgICBjYXNlTWFwW2MudmFsdWVdID0gbmV3IGkxOG4uQ29udGFpbmVyKGMubm9kZXMsIGljdS5zb3VyY2VTcGFuKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgaTE4bi5JY3UoaWN1LnN3aXRjaFZhbHVlLCBpY3UudHlwZSwgY2FzZU1hcCwgaWN1LnNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb25DYXNlKGljdUNhc2U6IG1sLkV4cGFuc2lvbkNhc2UsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiBpY3VDYXNlLnZhbHVlLFxuICAgICAgbm9kZXM6IFtdLmNvbmNhdCguLi5tbC52aXNpdEFsbCh0aGlzLCBpY3VDYXNlLmV4cHJlc3Npb24pKSxcbiAgICB9O1xuICB9XG5cbiAgdmlzaXRDb21tZW50KGNvbW1lbnQ6IG1sLkNvbW1lbnQsIGNvbnRleHQ6IGFueSkge31cblxuICB2aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGU6IG1sLkF0dHJpYnV0ZSwgY29udGV4dDogYW55KSB7fVxuXG4gIHByaXZhdGUgX2FkZEVycm9yKG5vZGU6IG1sLk5vZGUsIG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Vycm9ycy5wdXNoKG5ldyBJMThuRXJyb3Iobm9kZS5zb3VyY2VTcGFuLCBtZXNzYWdlKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VHlwZUZvclRhZyh0YWc6IHN0cmluZyk6IHN0cmluZyB7XG4gIHN3aXRjaCAodGFnLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdicic6XG4gICAgY2FzZSAnYic6XG4gICAgY2FzZSAnaSc6XG4gICAgY2FzZSAndSc6XG4gICAgICByZXR1cm4gJ2ZtdCc7XG4gICAgY2FzZSAnaW1nJzpcbiAgICAgIHJldHVybiAnaW1hZ2UnO1xuICAgIGNhc2UgJ2EnOlxuICAgICAgcmV0dXJuICdsaW5rJztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICdvdGhlcic7XG4gIH1cbn1cbiJdfQ==