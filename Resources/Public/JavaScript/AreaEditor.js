/**
 * This file is developed by evoweb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
define(["require", "exports", "jquery", "./vendor/Fabric", "TYPO3/CMS/Backend/Modal", "TYPO3/CMS/Core/Contrib/jquery.minicolors"], function (require, exports, $, fabric, Modal) {
    "use strict";
    // needed to access top frame elements
    var d = top.document || document, w = top.window || window;
    if (typeof d !== 'undefined' && typeof w !== 'undefined') {
        fabric.document = d;
        fabric.window = w;
    }
    var Aggregation = function (baseClass) {
        var mixins = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            mixins[_i - 1] = arguments[_i];
        }
        var base = /** @class */ (function (_super) {
            __extends(base, _super);
            function base() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.apply(this, __spread(args)) || this;
                mixins.forEach(function (mixin) {
                    copyProperties(_this, (new mixin));
                });
                return _this;
            }
            return base;
        }(baseClass));
        // this function copies all properties and symbols, filtering out some special ones
        var copyProperties = function (target, source) {
            /** @type {Array} */
            var propertySymbols = Object.getOwnPropertySymbols(source);
            Object.getOwnPropertyNames(source)
                .concat(propertySymbols)
                .forEach(function (property) {
                if (!property.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
                    Object.defineProperty(target, property, Object.getOwnPropertyDescriptor(source, property));
                }
            });
        };
        // outside constructor() to allow Aggregation(a, b, c).staticFunction() to be called etc.
        mixins.forEach(function (mixin) {
            copyProperties(base.prototype, mixin.prototype);
            copyProperties(base, mixin);
        });
        return base;
    };
    var AreaFormElement = /** @class */ (function (_super) {
        __extends(AreaFormElement, _super);
        function AreaFormElement() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = '';
            _this.eventDelay = 0;
            _this.attributes = {};
            return _this;
        }
        AreaFormElement.prototype.postAddToForm = function () {
            this.id = fabric.Object.__uid++;
            this.initializeElement();
            this.updateFields();
            this.initializeColorPicker();
            this.initializeEvents();
            this.addFauxInput();
        };
        AreaFormElement.prototype.initializeElement = function () {
            this.element = this.getFormElement('#' + this.name + 'Form', this.id);
            this.form.areaZone.append(this.element);
            this.form.updateArrowsState();
        };
        AreaFormElement.prototype.initializeColorPicker = function () {
            $(this.getElement('.t3js-color-picker')).minicolors({
                format: 'hex',
                position: 'left',
                theme: 'default',
                changeDelay: 100,
                change: this.colorPickerAction.bind(this)
            });
        };
        AreaFormElement.prototype.initializeEvents = function () {
            var _this = this;
            this.on('moved', this.updateFields.bind(this));
            this.on('modified', this.updateFields.bind(this));
            this.getElements('.basicOptions .t3js-field').forEach(function (field) {
                field.addEventListener('keyup', _this.updateProperties.bind(_this));
            });
            this.getElements('.positionOptions .t3js-field').forEach(function (field) {
                field.addEventListener('input', _this.fieldInputHandler.bind(_this));
            });
            this.getElements('.t3js-btn').forEach(this.buttonEventHandler.bind(this));
        };
        AreaFormElement.prototype.fieldInputHandler = function (event) {
            var _this = this;
            clearTimeout(this.eventDelay);
            this.eventDelay = AreaFormElement.wait(function () { _this.updateCanvas(event); }, 500);
        };
        AreaFormElement.prototype.buttonEventHandler = function (button) {
            var action = button.dataset.action + 'Action';
            button.removeEventListener('click', this[action]);
            button.addEventListener('click', this[action].bind(this));
        };
        AreaFormElement.prototype.updateArrowsState = function () {
            var areaZone = this.form.areaZone;
            this.getElement('[data-action="up"]').classList[areaZone.firstChild !== this.element ? 'remove' : 'add']('disabled');
            this.getElement('[data-action="down"]').classList[areaZone.lastChild !== this.element ? 'remove' : 'add']('disabled');
        };
        AreaFormElement.prototype.updateFields = function () {
        };
        AreaFormElement.prototype.updateProperties = function (event) {
            var field = event.currentTarget, property = field.id;
            if (field.classList.contains('href')) {
                this.href = field.value;
            }
            else if (this.hasOwnProperty(property)) {
                this[property] = field.value;
            }
            else if (this.attributes.hasOwnProperty(property)) {
                this.attributes[property] = field.value;
            }
        };
        AreaFormElement.prototype.updateCanvas = function (event) {
        };
        AreaFormElement.prototype.linkAction = function (event) {
            this.form.openLinkBrowser(event.currentTarget, this);
        };
        AreaFormElement.prototype.upAction = function () {
            this.form.moveArea(this, AreaFormElement.before);
        };
        AreaFormElement.prototype.downAction = function () {
            this.form.moveArea(this, AreaFormElement.after);
        };
        AreaFormElement.prototype.deleteAction = function () {
            if (this.element) {
                this.element.remove();
            }
            if (this.form) {
                this.form.updateArrowsState();
            }
            this.removeFauxInput();
            this.editor.deleteArea(this);
        };
        AreaFormElement.prototype.expandAction = function () {
            this.showElement('.moreOptions');
            this.showElement('[data-action="collapse"]');
            this.hideElement('[data-action="expand"]');
        };
        AreaFormElement.prototype.collapseAction = function () {
            this.hideElement('.moreOptions');
            this.hideElement('[data-action="collapse"]');
            this.showElement('[data-action="expand"]');
        };
        AreaFormElement.prototype.undoAction = function () {
        };
        AreaFormElement.prototype.redoAction = function () {
        };
        AreaFormElement.prototype.colorPickerAction = function (value) {
            this.getElement('.t3js-color-picker').value = value;
            this.set('borderColor', value);
            this.set('stroke', value);
            this.set('fill', AreaEditor.hexToRgbA(value, 0.2));
            this.editor.canvas.renderAll();
        };
        AreaFormElement.prototype.getFormElement = function (selector, id) {
            var template = this.form.element.querySelector(selector)
                .innerHTML.replace(new RegExp('_ID', 'g'), String(id ? id : this.id));
            return (new DOMParser()).parseFromString(template, 'text/html').body.firstChild;
        };
        AreaFormElement.prototype.getElement = function (selector) {
            return this.element.querySelector(selector);
        };
        AreaFormElement.prototype.getElements = function (selector) {
            return this.element.querySelectorAll(selector);
        };
        AreaFormElement.prototype.hideElement = function (selector) {
            this.getElement(selector).classList.add('hide');
        };
        AreaFormElement.prototype.showElement = function (selector) {
            this.getElement(selector).classList.remove('hide');
        };
        AreaFormElement.prototype.getFieldValue = function (selector) {
            return this.getElement(selector).value;
        };
        AreaFormElement.prototype.getData = function () {
            var attributes = this.getAdditionalAttributes();
            return __assign(__assign({}, attributes), { shape: this.name, coords: this.getAreaCoords(), href: this.getLink() });
        };
        // @todo deprecated
        AreaFormElement.prototype.getAreaCoords = function () {
            return '';
        };
        // @todo deprecated
        AreaFormElement.prototype.getAdditionalAttributes = function () {
            var result = {};
            this.getElements('.t3js-field').forEach(function (field) {
                if (!field.classList.contains('ignored-attribute')) {
                    result[field.id] = field.value;
                }
            });
            return result;
        };
        // @todo deprecated
        AreaFormElement.prototype.getLink = function () {
            return this.getElement('.href').value;
        };
        /**
         * Add faux input as target for browselink which listens for changes and writes value to real field
         */
        AreaFormElement.prototype.addFauxInput = function () {
            if (this.form.fauxForm) {
                var fauxInput = this.editor.fauxFormDocument.createElement('input');
                fauxInput.setAttribute('id', 'href' + this.id);
                fauxInput.setAttribute('data-formengine-input-name', 'href' + this.id);
                fauxInput.setAttribute('value', this.href);
                fauxInput.onchange = this.changedFauxInput.bind(this);
                this.form.fauxForm.appendChild(fauxInput);
            }
        };
        AreaFormElement.prototype.removeFauxInput = function () {
            if (this.form && this.form.fauxForm !== null) {
                var field = this.form.fauxForm.querySelector('#href' + this.id);
                if (field) {
                    field.remove();
                }
            }
        };
        AreaFormElement.prototype.changedFauxInput = function () {
            var field = this.form.fauxForm.querySelector('#href' + this.id);
            this.href = field.value;
            this.updateFields();
        };
        AreaFormElement.wait = function (callback, delay) {
            return window.setTimeout(callback, delay);
        };
        AreaFormElement.before = -1;
        AreaFormElement.after = 1;
        return AreaFormElement;
    }(fabric.Object));
    var Rect = /** @class */ (function (_super) {
        __extends(Rect, _super);
        function Rect() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'rectangle';
            return _this;
        }
        Rect.prototype.updateFields = function () {
            var _this = this;
            this.getElement('.color').value = this.data.color;
            this.getElement('.alt').value = this.alt || '';
            this.getElement('.href').value = this.href || '';
            this.getElement('#left').value = Math.floor(this.left + 0);
            this.getElement('#top').value = Math.floor(this.top + 0);
            this.getElement('#right').value = Math.floor(this.left + this.getScaledWidth());
            this.getElement('#bottom').value = Math.floor(this.top + this.getScaledHeight());
            Object.entries(this.attributes).forEach(function (attribute) {
                _this.getElement('#' + attribute[0]).value = attribute[1] || '';
            });
        };
        Rect.prototype.updateCanvas = function (event) {
            var field = (event.currentTarget || event.target), value = parseInt(field.value);
            switch (field.id) {
                case 'left':
                    this.getElement('#right').value = value + this.getScaledWidth();
                    this.set({ left: value });
                    break;
                case 'top':
                    this.getElement('#bottom').value = value + this.getScaledHeight();
                    this.set({ top: value });
                    break;
                case 'right':
                    value -= this.left;
                    if (value < 0) {
                        value = 10;
                        field.value = this.left + value;
                    }
                    this.set({ width: value });
                    break;
                case 'bottom':
                    value -= this.top;
                    if (value < 0) {
                        value = 10;
                        field.value = this.top + value;
                    }
                    this.set({ height: value });
                    break;
            }
            this.canvas.renderAll();
        };
        Rect.prototype.getAreaCoords = function () {
            return {
                left: Math.floor(this.left + 0),
                top: Math.floor(this.top + 0),
                right: Math.floor(this.left + this.getScaledWidth() - 1),
                bottom: Math.floor(this.top + this.getScaledHeight() - 1)
            };
        };
        return Rect;
    }(Aggregation(fabric.Rect, AreaFormElement)));
    var Circle = /** @class */ (function (_super) {
        __extends(Circle, _super);
        function Circle() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'circle';
            return _this;
        }
        Circle.prototype.updateFields = function () {
            var _this = this;
            this.getElement('.color').value = this.data.color;
            this.getElement('.alt').value = this.alt || '';
            this.getElement('.href').value = this.href || '';
            this.getElement('#left').value = Math.floor(this.left + 0);
            this.getElement('#top').value = Math.floor(this.top + 0);
            this.getElement('#radius').value = Math.floor(this.getRadiusX());
            Object.entries(this.attributes).forEach(function (attribute) {
                _this.getElement('#' + attribute[0]).value = attribute[1] || '';
            });
        };
        Circle.prototype.updateCanvas = function (event) {
            var field = (event.currentTarget || event.target), value = 0;
            switch (field.id) {
                case 'left':
                    value = parseInt(field.value);
                    this.set({ left: value });
                    break;
                case 'top':
                    value = parseInt(field.value);
                    this.set({ top: value });
                    break;
                case 'radius':
                    value = parseInt(field.value);
                    this.set({ radius: value });
                    break;
            }
            this.canvas.renderAll();
        };
        Circle.prototype.getAreaCoords = function () {
            return {
                left: Math.floor(this.left + this.getRadiusX()),
                top: Math.floor(this.top + this.getRadiusX()),
                radius: Math.floor(this.getRadiusX())
            };
        };
        return Circle;
    }(Aggregation(fabric.Circle, AreaFormElement)));
    var Poly = /** @class */ (function (_super) {
        __extends(Poly, _super);
        function Poly(points, options) {
            var _this = _super.call(this, points, options) || this;
            _this.name = 'polygon';
            _this.controls = [];
            _this.on('moved', _this.polygonMoved.bind(_this));
            return _this;
        }
        Poly.prototype.updateFields = function () {
            var _this = this;
            this.getElement('.color').value = this.data.color;
            this.getElement('.alt').value = this.alt || '';
            this.getElement('.href').value = this.href || '';
            Object.entries(this.attributes).forEach(function (attribute) {
                _this.getElement('#' + attribute[0]).value = attribute[1] || '';
            });
            var parentElement = this.getElement('.positionOptions');
            this.points.forEach(function (point, index) {
                point.id = point.id ? point.id : 'p' + _this.id + '_' + index;
                if (!point.hasOwnProperty('element')) {
                    point.element = _this.getFormElement('#polyCoords', point.id);
                    parentElement.append(point.element);
                }
                point.element.querySelector('#x' + point.id).value = point.x + _this.left;
                point.element.querySelector('#y' + point.id).value = point.y + _this.top;
            });
        };
        Poly.prototype.updateCanvas = function (event) {
            var field = (event.currentTarget || event.target), _a = __read(field.id.split('_'), 2), point = _a[1], control = this.controls[parseInt(point)], x = control.getCenterPoint().x, y = control.getCenterPoint().y;
            if (field.id.indexOf('x') > -1) {
                x = parseInt(field.value);
            }
            if (field.id.indexOf('y') > -1) {
                y = parseInt(field.value);
            }
            control.set('left', x);
            control.set('top', y);
            control.setCoords();
            this.points[control.name] = { x: x, y: y };
            this.canvas.renderAll();
        };
        Poly.prototype.getAreaCoords = function () {
            var result = [];
            this.controls.forEach(function (control) {
                var center = control.getCenterPoint();
                result.push({ x: center.x, y: center.y });
            });
            return result;
        };
        Poly.prototype.addControls = function () {
            var _this = this;
            this.points.forEach(function (point, index) {
                _this.addControl(_this.controlConfig, point, index, 100000);
            });
        };
        Poly.prototype.addControl = function (areaConfig, point, index, newControlIndex) {
            var circle = new fabric.Circle(__assign(__assign({}, areaConfig), { hasControls: false, radius: 5, fill: areaConfig.cornerColor, stroke: areaConfig.cornerStrokeColor, originX: 'center', originY: 'center', name: index, polygon: this, point: point, type: 'control', opacity: this.controls.length === 0 ? 0 : this.controls[0].opacity, 
                // set control position relative to polygon
                left: this.left + point.x, top: this.top + point.y }));
            circle.on('moved', this.pointMoved.bind(this));
            point.control = circle;
            this.controls = Poly.addElementToArrayWithPosition(this.controls, circle, newControlIndex);
            this.canvas.add(circle);
            this.canvas.renderAll();
        };
        Poly.prototype.pointMoved = function (event) {
            var control = event.target, id = 'p' + control.polygon.id + '_' + control.name, center = control.getCenterPoint();
            this.getElement('#x' + id).value = center.x;
            this.getElement('#y' + id).value = center.y;
        };
        Poly.prototype.polygonMoved = function () {
            var _this = this;
            this.points.forEach(function (point) {
                _this.getElement('#x' + point.id).value = _this.left + point.x;
                _this.getElement('#y' + point.id).value = _this.top + point.y;
            });
        };
        Poly.prototype.addPointBeforeAction = function (event) {
            var direction = AreaFormElement.before, index = this.points.length, parentElement = this.getElement('.positionOptions'), _a = __read(this.getPointElementAndCurrentPoint(event, direction), 4), point = _a[0], element = _a[1], currentPointIndex = _a[2], currentPoint = _a[3];
            parentElement.insertBefore(element, currentPoint.element);
            this.points = Poly.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
            this.addControl(this.editor.areaConfig, point, index, currentPointIndex + direction);
        };
        Poly.prototype.addPointAfterAction = function (event) {
            var direction = AreaFormElement.after, index = this.points.length, parentElement = this.getElement('.positionOptions'), _a = __read(this.getPointElementAndCurrentPoint(event, direction), 4), point = _a[0], element = _a[1], currentPointIndex = _a[2], currentPoint = _a[3];
            if (currentPoint.element.nextSibling) {
                parentElement.insertBefore(element, currentPoint.element.nextSibling);
            }
            else {
                parentElement.append(element);
            }
            this.points = Poly.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
            this.addControl(this.editor.areaConfig, point, index, currentPointIndex + direction);
        };
        Poly.prototype.getPointElementAndCurrentPoint = function (event, direction) {
            var currentPointId = event.currentTarget.parentNode.parentNode.id, _a = __read(this.getCurrentAndNextPoint(currentPointId, direction), 3), currentPoint = _a[0], nextPoint = _a[1], currentPointIndex = _a[2], index = this.points.length, id = 'p' + this.id + '_' + index, element = this.getFormElement('#polyCoords', id), point = {
                x: Math.floor((currentPoint.x + nextPoint.x) / 2),
                y: Math.floor((currentPoint.y + nextPoint.y) / 2),
                id: id,
                element: element
            };
            element.querySelectorAll('.t3js-btn').forEach(this.buttonHandler.bind(this));
            element.querySelector('#x' + point.id).value = point.x;
            element.querySelector('#y' + point.id).value = point.y;
            return [point, element, currentPointIndex, currentPoint];
        };
        Poly.prototype.getCurrentAndNextPoint = function (currentPointId, direction) {
            var currentPointIndex = 0;
            for (var i = 0; i < this.points.length; i++) {
                if (this.points[i].id === currentPointId) {
                    break;
                }
                currentPointIndex++;
            }
            var nextPointIndex = currentPointIndex + direction;
            if (nextPointIndex < 0) {
                nextPointIndex = this.points.length - 1;
            }
            if (nextPointIndex >= this.points.length) {
                nextPointIndex = 0;
            }
            return [this.points[currentPointIndex], this.points[nextPointIndex], currentPointIndex, nextPointIndex];
        };
        Poly.prototype.removePointAction = function (event) {
            var _this = this;
            if (this.points.length > 3) {
                var element_1 = event.currentTarget.parentNode.parentNode, points_1 = [], controls_1 = [];
                this.points.forEach(function (point, index) {
                    if (element_1.id !== point.id) {
                        points_1.push(point);
                        controls_1.push(_this.controls[index]);
                    }
                    else {
                        point.element.remove();
                        _this.canvas.remove(_this.controls[index]);
                    }
                });
                points_1.forEach(function (point, index) {
                    var oldId = point.id;
                    point.id = 'p' + _this.id + '_' + index;
                    _this.getElement('#' + oldId).id = point.id;
                    _this.getElement('#x' + oldId).id = 'x' + point.id;
                    _this.getElement('#y' + oldId).id = 'y' + point.id;
                    _this.getElement('[for="x' + oldId + '"]').setAttribute('for', 'x' + point.id);
                    _this.getElement('[for="y' + oldId + '"]').setAttribute('for', 'y' + point.id);
                    controls_1[index].name = index;
                });
                this.points = points_1;
                this.controls = controls_1;
                this.canvas.renderAll();
            }
        };
        Poly.addElementToArrayWithPosition = function (array, item, newPointIndex) {
            if (newPointIndex < 0) {
                array.unshift(item);
            }
            else if (newPointIndex >= array.length) {
                array.push(item);
            }
            else {
                var newPoints = [];
                for (var i = 0; i < array.length; i++) {
                    newPoints.push(array[i]);
                    if (i === newPointIndex - 1) {
                        newPoints.push(item);
                    }
                }
                array = newPoints;
            }
            return array;
        };
        return Poly;
    }(Aggregation(fabric.Polygon, AreaFormElement)));
    var AreaForm = /** @class */ (function () {
        function AreaForm(formSelector, editor) {
            this.element = editor.document.querySelector(formSelector);
            this.areaZone = this.element.querySelector('#areaZone');
            this.editor = editor;
            this.addFauxFormForLinkBrowser();
        }
        AreaForm.prototype.destroy = function () {
            this.removeFauxForm();
        };
        AreaForm.prototype.updateArrowsState = function () {
            this.editor.areas.forEach(function (area) {
                area.updateArrowsState();
            });
        };
        AreaForm.prototype.addArea = function (area) {
            area.form = this;
            area.postAddToForm();
        };
        AreaForm.prototype.moveArea = function (area, offset) {
            var index = this.editor.areas.indexOf(area), newIndex = index + offset, parent = area.element.parentNode;
            if (newIndex > -1 && newIndex < this.editor.areas.length) {
                var removedArea = this.editor.areas.splice(index, 1)[0];
                this.editor.areas.splice(newIndex, 0, removedArea);
                parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
            }
            this.updateArrowsState();
        };
        AreaForm.prototype.openLinkBrowser = function (link, area) {
            var _this = this;
            link.blur();
            var data = __assign(__assign({}, this.editor.browseLink), { objectId: area.id, formName: 'areasForm', itemFormElName: 'href' + area.id, currentValue: area.getLink() });
            $.ajax({
                url: this.editor.browseLinkUrlAjaxUrl,
                context: area,
                data: data
            }).done(function (response) {
                var url = response.url
                    + '&P[currentValue]=' + encodeURIComponent(area.getFieldValue('.href'))
                    + '&P[currentSelectedValues]=' + encodeURIComponent(area.getFieldValue('.href'));
                if (_this.editor.typo3Branch < 10) {
                    // @todo remove once TYPO3 9.x support gets removed
                    var vHWin = window.open(url, '', 'height=600,width=500,status=0,menubar=0,scrollbars=1');
                    vHWin.focus();
                }
                else {
                    Modal.advanced({
                        type: Modal.types.iframe,
                        content: url,
                        size: Modal.sizes.large,
                    });
                }
            });
        };
        /**
         * Create form element that is reachable for LinkBrowser.finalizeFunction
         */
        AreaForm.prototype.addFauxFormForLinkBrowser = function () {
            if (top.document !== this.editor.fauxFormDocument) {
                if (!(this.fauxForm = this.editor.fauxFormDocument.querySelector(this.editor.formSelector))) {
                    this.fauxForm = this.editor.fauxFormDocument.createElement('form');
                    this.fauxForm.setAttribute('name', 'areasForm');
                    this.fauxForm.setAttribute('id', 'fauxForm');
                    this.editor.fauxFormDocument.body.appendChild(this.fauxForm);
                }
                // empty previously created fauxForm
                while (this.fauxForm.firstChild) {
                    this.fauxForm.removeChild(this.fauxForm.firstChild);
                }
            }
        };
        AreaForm.prototype.removeFauxForm = function () {
            if (this.fauxForm) {
                this.fauxForm.remove();
            }
        };
        return AreaForm;
    }());
    var AreaEditor = /** @class */ (function () {
        function AreaEditor(options, canvas, formSelector, document) {
            this.areaConfig = {
                cornerColor: '#eee',
                cornerStrokeColor: '#bbb',
                cornerSize: 10,
                cornerStyle: 'circle',
                hasBorders: false,
                hasRotatingPoint: false,
                transparentCorners: false
            };
            this.formSelector = '';
            this.typo3Branch = 0;
            this.browseLinkUrlAjaxUrl = '';
            this.preview = true;
            this.areas = [];
            this.setOptions(options);
            this.document = document;
            this.preview = formSelector === '';
            this.initializeCanvas(canvas, options);
            if (!this.preview) {
                this.form = new AreaForm(formSelector, this);
            }
        }
        AreaEditor.prototype.setOptions = function (options) {
            var _this = this;
            Object.entries(options).forEach(function (option) {
                _this[option[0]] = option[1];
            });
        };
        AreaEditor.prototype.initializeCanvas = function (canvas, options) {
            var _this = this;
            var activePolygon = null;
            this.canvas = new fabric.Canvas(canvas, __assign(__assign({}, options.canvas), { selection: false, preserveObjectStacking: true, hoverCursor: this.preview ? 'default' : 'move' }));
            this.canvas.on('object:moving', function (event) {
                var element = event.target;
                switch (element.type) {
                    case 'control':
                        var center = element.getCenterPoint();
                        element.point.x = center.x - element.polygon.left;
                        element.point.y = center.y - element.polygon.top;
                        break;
                    case 'polygon':
                        element.controls.forEach(function (control) {
                            control.left = element.left + control.point.x;
                            control.top = element.top + control.point.y;
                        });
                        break;
                }
            });
            this.canvas.on('selection:created', function (event) {
                if (event.target.type === 'polygon') {
                    activePolygon = event.target;
                    // show controls of active polygon
                    activePolygon.controls.forEach(function (control) {
                        control.opacity = 1;
                    });
                    _this.canvas.renderAll();
                }
            });
            this.canvas.on('selection:updated', function (event) {
                event.deselected.forEach(function (element) {
                    if (element.type === 'polygon' && event.selected[0].type !== 'control') {
                        // hide controls of active polygon
                        element.controls.forEach(function (control) {
                            control.opacity = 0;
                        });
                        activePolygon = null;
                        _this.canvas.renderAll();
                    }
                    else if (element.type === 'control') {
                        // hide controls of active polygon
                        activePolygon.controls.forEach(function (control) {
                            control.opacity = 0;
                        });
                        activePolygon = null;
                        _this.canvas.renderAll();
                    }
                });
                event.selected.forEach(function (element) {
                    if (element.type === 'polygon') {
                        activePolygon = element;
                        // hide controls of active polygon
                        element.controls.forEach(function (control) {
                            control.opacity = 1;
                        });
                        _this.canvas.renderAll();
                    }
                });
            });
        };
        AreaEditor.prototype.initializeAreas = function (areas) {
            var _this = this;
            if (areas !== undefined) {
                areas.forEach(function (area) {
                    area.data.color = AreaEditor.getRandomColor(area.data.color);
                    var areaElement, configuration = __assign(__assign(__assign({}, area), _this.areaConfig), { selectable: !_this.preview, hasControls: !_this.preview, stroke: area.data.color, strokeWidth: 1, fill: AreaEditor.hexToRgbA(area.data.color, 0.3) });
                    switch (configuration.shape) {
                        case 'rect':
                        case 'rectangle':
                            areaElement = _this.createRectangle(configuration);
                            break;
                        case 'circ':
                        case 'circle':
                            areaElement = _this.createCircle(configuration);
                            break;
                        case 'poly':
                        case 'polygon':
                            areaElement = _this.createPolygon(configuration);
                            break;
                    }
                    areaElement.editor = _this;
                    _this.areas.push(areaElement);
                    if (_this.form) {
                        _this.form.addArea(areaElement);
                    }
                });
            }
        };
        AreaEditor.prototype.removeAllAreas = function () {
            this.areas.forEach(function (area) { area.deleteAction(); });
        };
        AreaEditor.prototype.createRectangle = function (configuration) {
            var coords = configuration.coords, area = new Rect(__assign(__assign({}, configuration), { left: coords.left, top: coords.top, width: coords.right - coords.left, height: coords.bottom - coords.top }));
            this.canvas.add(area);
            return area;
        };
        AreaEditor.prototype.createCircle = function (configuration) {
            var coords = configuration.coords, area = new Circle(__assign(__assign({}, configuration), { left: coords.left - coords.radius, top: coords.top - coords.radius, radius: coords.radius }));
            // disable control points as these would stretch the circle
            // to an ellipse which is not possible in html areas
            area.setControlVisible('ml', false);
            area.setControlVisible('mt', false);
            area.setControlVisible('mr', false);
            area.setControlVisible('mb', false);
            this.canvas.add(area);
            return area;
        };
        AreaEditor.prototype.createPolygon = function (configuration) {
            var points = configuration.coords.points || [], area = new Poly(points, __assign(__assign({}, configuration), { selectable: true, hasControls: false, objectCaching: false, controlConfig: this.areaConfig }));
            this.canvas.add(area);
            if (this.form) {
                area.addControls();
            }
            return area;
        };
        AreaEditor.prototype.deleteArea = function (area) {
            var areas = [];
            this.areas.forEach(function (currentArea) {
                if (area !== currentArea) {
                    areas.push(currentArea);
                }
            });
            this.areas = areas;
            this.canvas.remove(area);
        };
        AreaEditor.prototype.getMapData = function () {
            var areas = [];
            this.areas.forEach(function (area) {
                areas.push(area.getData());
            });
            return JSON.stringify(areas);
        };
        AreaEditor.getRandomColor = function (color) {
            if (color === undefined) {
                var r = (Math.floor(Math.random() * 5) * 3).toString(16), g = (Math.floor(Math.random() * 5) * 3).toString(16), b = (Math.floor(Math.random() * 5) * 3).toString(16);
                color = '#' + r + r + g + g + b + b;
            }
            return color;
        };
        AreaEditor.hexToRgbA = function (hex, alpha) {
            var chars, r, g, b, result;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                chars = hex.substring(1).split('');
                if (chars.length === 3) {
                    chars = [chars[0], chars[0], chars[1], chars[1], chars[2], chars[2]];
                }
                r = parseInt(chars[0] + chars[1], 16);
                g = parseInt(chars[2] + chars[3], 16);
                b = parseInt(chars[4] + chars[5], 16);
                if (alpha) {
                    result = 'rgba(' + [r, g, b, alpha].join(', ') + ')';
                }
                else {
                    result = 'rgb(' + [r, g, b].join(', ') + ')';
                }
                return result;
            }
            throw new Error('Bad Hex');
        };
        return AreaEditor;
    }());
    return AreaEditor;
});
