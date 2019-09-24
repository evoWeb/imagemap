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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
define(["require", "exports", "./vendor/fabric", "TYPO3/CMS/Backend/Modal", "TYPO3/CMS/Core/Contrib/jquery.minicolors"], function (require, exports, fabric, Modal) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AreaUtility = /** @class */ (function () {
        function AreaUtility() {
        }
        AreaUtility.getRandomColor = function (color) {
            if (color === undefined || color === '') {
                var r = (Math.floor(Math.random() * 5) * 3).toString(16), g = (Math.floor(Math.random() * 5) * 3).toString(16), b = (Math.floor(Math.random() * 5) * 3).toString(16);
                color = '#' + r + r + g + g + b + b;
            }
            return color;
        };
        AreaUtility.hexToRgbA = function (hex, alpha) {
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
        AreaUtility.wait = function (callback, delay) {
            return window.setTimeout(callback, delay);
        };
        AreaUtility.addElementToArrayWithPosition = function (array, item, newPointIndex) {
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
        AreaUtility.highestIndexOfArray = function (array) {
            var e_1, _a;
            var index = 0, iterator = array.keys();
            try {
                for (var iterator_1 = __values(iterator), iterator_1_1 = iterator_1.next(); !iterator_1_1.done; iterator_1_1 = iterator_1.next()) {
                    var key = iterator_1_1.value;
                    index = Math.max(index, key);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (iterator_1_1 && !iterator_1_1.done && (_a = iterator_1.return)) _a.call(iterator_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return index;
        };
        AreaUtility.before = -1;
        AreaUtility.after = 1;
        return AreaUtility;
    }());
    exports.AreaUtility = AreaUtility;
    var FormArea = /** @class */ (function () {
        function FormArea(form, canvasArea, configuration) {
            this.id = 0;
            this.form = form;
            this.configuration = configuration;
            this.canvasArea = canvasArea;
            this.canvasArea.formArea = this;
            this.id = canvasArea.id;
        }
        FormArea.prototype.initialize = function () {
            this.prepareAreaTemplate();
            this.updateFields(this.configuration);
            this.initializeColorPicker();
            this.initializeEvents();
            this.addFauxInput();
        };
        Object.defineProperty(FormArea.prototype, "element", {
            get: function () {
                return this._element;
            },
            enumerable: true,
            configurable: true
        });
        FormArea.prototype.getFormElement = function (selector, id, point) {
            var template = this.form.element
                .querySelector(selector)
                .innerHTML.replace(new RegExp('_ID', 'g'), String(id ? id : this.id));
            if (typeof point !== 'undefined') {
                template = template.replace(new RegExp('_POINT', 'g'), point.toString());
            }
            return (new DOMParser()).parseFromString(template, 'text/html').body.firstChild;
        };
        FormArea.prototype.prepareAreaTemplate = function () {
            this._element = this.getFormElement('#' + this.name + 'Form', this.id);
        };
        FormArea.prototype.getElement = function (selector) {
            return this.element.querySelector(selector);
        };
        FormArea.prototype.getElements = function (selector) {
            return this.element.querySelectorAll(selector);
        };
        FormArea.prototype.hideElement = function (selector) {
            this.getElement(selector).classList.add('hide');
        };
        FormArea.prototype.showElement = function (selector) {
            this.getElement(selector).classList.remove('hide');
        };
        FormArea.prototype.getFieldValue = function (selector) {
            return this.getElement(selector).value;
        };
        FormArea.prototype.setFieldValue = function (selector, value) {
            this.getElement(selector).value = (value || '').toString();
        };
        FormArea.prototype.initializeColorPicker = function () {
            $(this.getElement('.t3js-color-picker')).minicolors({
                format: 'hex',
                position: 'left',
                theme: 'default',
                changeDelay: 100,
                change: this.colorPickerAction.bind(this)
            });
        };
        FormArea.prototype.colorPickerAction = function (value) {
            this.getElement('.t3js-color-picker').value = value;
            this.canvasArea.setProperties({
                borderColor: value,
                stroke: value,
                fill: AreaUtility.hexToRgbA(value, 0.2),
            });
        };
        FormArea.prototype.initializeEvents = function () {
            var _this = this;
            this.getElements('.basicOptions .t3js-field').forEach(function (field) {
                field.addEventListener('keyup', _this.updateProperties.bind(_this));
            });
            this.getElements('.positionOptions .t3js-field').forEach(function (field) {
                field.addEventListener('input', _this.fieldInputHandler.bind(_this));
            });
            this.getElements('.t3js-btn').forEach(this.buttonEventHandler.bind(this));
        };
        FormArea.prototype.buttonEventHandler = function (button) {
            var action = button.dataset.action + 'Action';
            button.removeEventListener('click', this[action]);
            button.addEventListener('click', this[action].bind(this));
        };
        FormArea.prototype.fieldInputHandler = function (event) {
            var _this = this;
            clearTimeout(this.eventDelay);
            this.eventDelay = AreaUtility.wait(function () { _this.updateCanvas(event); }, 500);
        };
        FormArea.prototype.updateProperties = function (event) {
            var field = event.currentTarget, property = field.id;
            if (this.configuration.hasOwnProperty(property)) {
                this.configuration[property] = field.value;
            }
            else if (this.configuration.coords.hasOwnProperty(property)) {
                this.configuration.coords[property] = field.value;
            }
            else if (this.configuration.data.hasOwnProperty(property)) {
                this.configuration.data[property] = field.value;
            }
        };
        FormArea.prototype.updateArrowsState = function () {
            var areaZone = this.form.areaZone;
            this.getElement('[data-action="up"]').classList[areaZone.firstChild !== this.element ? 'remove' : 'add']('disabled');
            this.getElement('[data-action="down"]').classList[areaZone.lastChild !== this.element ? 'remove' : 'add']('disabled');
        };
        FormArea.prototype.linkAction = function (event) {
            event.preventDefault();
            this.form.openLinkBrowser(event.currentTarget, this);
        };
        FormArea.prototype.upAction = function (event) {
            event.preventDefault();
            this.form.moveArea(this, AreaUtility.before);
        };
        FormArea.prototype.downAction = function (event) {
            event.preventDefault();
            this.form.moveArea(this, AreaUtility.after);
        };
        FormArea.prototype.deleteAction = function (event) {
            event.preventDefault();
            if (this.element) {
                this.element.remove();
            }
            this.removeFauxInput();
            this.form.deleteArea(this);
        };
        FormArea.prototype.expandAction = function (event) {
            event.preventDefault();
            this.showElement('.moreOptions');
            this.hideElement('[data-action="expand"]');
            this.showElement('[data-action="collapse"]');
        };
        FormArea.prototype.collapseAction = function (event) {
            event.preventDefault();
            this.hideElement('.moreOptions');
            this.hideElement('[data-action="collapse"]');
            this.showElement('[data-action="expand"]');
        };
        FormArea.prototype.undoAction = function () {
        };
        FormArea.prototype.redoAction = function () {
        };
        /**
         * Add faux input as target for browselink which listens for changes and writes value to real field.
         *
         * Browselink uses the concept of opener which is a parent frame. In case the browselink was opened
         * in the modal (which resides in the top frame) still the opener frame it the iframe with the "Open
         * Area Editor" button.
         *
         * With help of the faux document and faux input, browselink finds the field to change link in, which
         * is then set in the modal to the originating link field, which then again is used to get the value
         * of once the save button is clicked.
         */
        FormArea.prototype.addFauxInput = function () {
            if (this.form.fauxForm) {
                var fauxInput = this.form.fauxDocument.createElement('input');
                fauxInput.setAttribute('id', 'link' + this.id);
                fauxInput.setAttribute('data-formengine-input-name', 'link' + this.id);
                fauxInput.setAttribute('value', this.configuration.href);
                fauxInput.onchange = this.changedFauxInput.bind(this);
                this.form.fauxForm.appendChild(fauxInput);
            }
        };
        FormArea.prototype.removeFauxInput = function () {
            if (this.form && this.form.fauxForm) {
                var field = this.form.fauxForm.querySelector('#link' + this.id);
                if (field) {
                    field.remove();
                }
            }
        };
        FormArea.prototype.changedFauxInput = function () {
            var field = this.form.fauxDocument.querySelector('#link' + this.id);
            this.configuration.href = field.value;
            this.updateFields(this.configuration);
        };
        FormArea.prototype.destroy = function () {
            this.element.remove();
            this.removeFauxInput();
            this.form.deleteArea(this);
        };
        return FormArea;
    }());
    var FormRectangle = /** @class */ (function (_super) {
        __extends(FormRectangle, _super);
        function FormRectangle() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'rectangle';
            return _this;
        }
        FormRectangle.prototype.updateFields = function (configuration) {
            this.configuration = configuration;
            this.setFieldValue('.color', configuration.data.color);
            this.setFieldValue('.alt', configuration.alt);
            this.setFieldValue('.href', configuration.href);
            this.setFieldValue('#left', configuration.coords.left);
            this.setFieldValue('#top', configuration.coords.top);
            this.setFieldValue('#right', configuration.coords.right);
            this.setFieldValue('#bottom', configuration.coords.bottom);
        };
        FormRectangle.prototype.updateCanvas = function (event) {
            var coords = this.configuration.coords, field = (event.currentTarget || event.target), value = parseInt(field.value), property = '';
            switch (field.id) {
                case 'left':
                    coords.right = coords.right - coords.left + value;
                    this.getElement('#right').value = coords.right.toString();
                    coords.left = value;
                    property = 'left';
                    break;
                case 'top':
                    coords.bottom = coords.bottom - coords.top + value;
                    this.getElement('#bottom').value = coords.bottom.toString();
                    coords.top = value;
                    property = 'top';
                    break;
                case 'right':
                    if (value <= coords.left) {
                        value = coords.left + 10;
                        field.value = value.toString();
                    }
                    coords.right = value;
                    value = coords.right - coords.left;
                    property = 'width';
                    break;
                case 'bottom':
                    if (value <= coords.top) {
                        value = coords.top + 10;
                        field.value = value.toString();
                    }
                    coords.bottom = value;
                    value = coords.bottom - coords.top;
                    property = 'height';
                    break;
            }
            this.canvasArea.setProperty(property, value);
        };
        FormRectangle.prototype.getData = function () {
            return this.configuration;
        };
        return FormRectangle;
    }(FormArea));
    var FormCircle = /** @class */ (function (_super) {
        __extends(FormCircle, _super);
        function FormCircle() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'circle';
            return _this;
        }
        FormCircle.prototype.updateFields = function (configuration) {
            this.configuration = configuration;
            this.setFieldValue('.color', configuration.data.color);
            this.setFieldValue('.alt', configuration.alt);
            this.setFieldValue('.href', configuration.href);
            this.setFieldValue('#left', configuration.coords.left);
            this.setFieldValue('#top', configuration.coords.top);
            this.setFieldValue('#radius', configuration.coords.radius);
        };
        FormCircle.prototype.updateCanvas = function (event) {
            var coords = this.configuration.coords, field = (event.currentTarget || event.target), value = parseInt(field.value), property = '';
            switch (field.id) {
                case 'left':
                    coords.left = value;
                    property = 'left';
                    break;
                case 'top':
                    coords.top = value;
                    property = 'top';
                    break;
                case 'radius':
                    coords.radius = value;
                    property = 'radius';
                    break;
            }
            this.canvasArea.setProperty(property, value);
        };
        FormCircle.prototype.getData = function () {
            return this.configuration;
        };
        return FormCircle;
    }(FormArea));
    var FormPolygon = /** @class */ (function (_super) {
        __extends(FormPolygon, _super);
        function FormPolygon() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'polygon';
            return _this;
        }
        FormPolygon.prototype.updateFields = function (configuration) {
            var _this = this;
            this.configuration = configuration;
            this.setFieldValue('.color', configuration.data.color);
            this.setFieldValue('.alt', configuration.alt);
            this.setFieldValue('.href', configuration.href);
            var parent = this.getElement('.positionOptions');
            configuration.coords.points.forEach(function (point, index) {
                if (!(point.element = parent.querySelector('#p' + point.id))) {
                    _this.canvasArea.points[index].id = point.id = fabric.Object.__uid++;
                    point.element = _this.getFormElement('#polyCoords', point.id, index);
                    parent.append(point.element);
                }
                _this.getElement('#x' + point.id).value = point.x.toString();
                _this.getElement('#y' + point.id).value = point.y.toString();
            });
        };
        FormPolygon.prototype.updateCanvas = function (event) {
            var field = (event.currentTarget || event.target), point = parseInt(field.dataset.index), fields = this.getElements('[data-point="' + field.dataset.index + '"]'), x = 0, y = 0;
            fields.forEach(function (field) {
                if (field.dataset.field == 'x') {
                    x = parseInt(field.value);
                }
                if (field.dataset.field == 'y') {
                    y = parseInt(field.value);
                }
            });
            this.configuration.coords.points[point] = { x: x, y: y };
            this.canvasArea.setPointProperties(point, this.configuration.coords.points[point]);
        };
        FormPolygon.prototype.getData = function () {
            this.configuration.coords.points.forEach(function (point) {
                delete point.id;
                delete point.element;
                if (point.hasOwnProperty('control')) {
                    delete point.control;
                }
            });
            return this.configuration;
        };
        FormPolygon.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.canvasArea.addControls();
        };
        FormPolygon.prototype.addPointBeforeAction = function (event) {
            this.addPointInDirection(event, AreaUtility.before);
        };
        FormPolygon.prototype.addPointAfterAction = function (event) {
            this.addPointInDirection(event, AreaUtility.after);
        };
        FormPolygon.prototype.removePointAction = function (event) {
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
        FormPolygon.prototype.addPointInDirection = function (event, direction) {
            var points = this.configuration.coords.points, index = AreaUtility.highestIndexOfArray(points) + 1, parentElement = this.getElement('.positionOptions'), _a = __read(this.getCurrentAndNewPoint(event, direction, index), 3), currentPoint = _a[0], newPoint = _a[1], currentPointIndex = _a[2];
            if (direction == AreaUtility.before || currentPoint.element.nextSibling) {
                parentElement.insertBefore(newPoint.element, currentPoint.element.nextSibling);
            }
            else {
                parentElement.append(newPoint.element);
            }
            this.getElement('#x' + newPoint.id).value = newPoint.x.toString();
            this.getElement('#y' + newPoint.id).value = newPoint.y.toString();
            newPoint.element.querySelectorAll('.t3js-btn').forEach(this.buttonEventHandler.bind(this));
            this.configuration.coords.points = AreaUtility.addElementToArrayWithPosition(points, newPoint, currentPointIndex + direction);
            var canvasPoint = {
                x: newPoint.x - this.canvasArea.configuration.left,
                y: newPoint.y - this.canvasArea.configuration.top,
                id: newPoint.id,
            };
            this.canvasArea.points = AreaUtility.addElementToArrayWithPosition(this.canvasArea.points, canvasPoint, currentPointIndex + direction);
            this.canvasArea.addControl(this.canvasArea.configuration, canvasPoint, index, currentPointIndex + direction);
        };
        FormPolygon.prototype.getCurrentAndNewPoint = function (event, direction, index) {
            var currentPointId = parseInt(event.currentTarget.dataset.point), _a = __read(this.getCurrentAndNextPoint(currentPointId, direction), 3), currentPoint = _a[0], nextPoint = _a[1], currentPointIndex = _a[2], id = fabric.Object.__uid++, newPoint = {
                x: Math.floor((currentPoint.x + nextPoint.x) / 2),
                y: Math.floor((currentPoint.y + nextPoint.y) / 2),
                id: id,
                element: this.getFormElement('#polyCoords', id, index)
            };
            return [currentPoint, newPoint, currentPointIndex];
        };
        FormPolygon.prototype.getCurrentAndNextPoint = function (currentPointId, direction) {
            var points = this.configuration.coords.points, currentPointIndex = 0;
            points.forEach(function (point, index) {
                if (point.id === currentPointId) {
                    currentPointIndex = index;
                }
            });
            var nextPointIndex = currentPointIndex + direction;
            if (nextPointIndex < 0) {
                nextPointIndex = points.length - 1;
            }
            if (nextPointIndex >= points.length) {
                nextPointIndex = 0;
            }
            return [
                points[currentPointIndex],
                points[nextPointIndex],
                currentPointIndex
            ];
        };
        return FormPolygon;
    }(FormArea));
    var AreaForm = /** @class */ (function () {
        function AreaForm(options, editor) {
            this.areas = [];
            this.options = options;
            this.fauxDocument = this.options.formDocument;
            this._element = editor.container.querySelector(options.formSelector);
            this._areaZone = this.element.querySelector('#areaZone');
            this.addFauxFormForLinkBrowser();
        }
        Object.defineProperty(AreaForm.prototype, "element", {
            get: function () {
                return this._element;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AreaForm.prototype, "areaZone", {
            get: function () {
                return this._areaZone;
            },
            enumerable: true,
            configurable: true
        });
        AreaForm.prototype.addArea = function (area, canvasArea) {
            var formArea;
            switch (area.shape) {
                case 'rect':
                case 'rectangle':
                    formArea = new FormRectangle(this, canvasArea, area);
                    break;
                case 'circ':
                case 'circle':
                    formArea = new FormCircle(this, canvasArea, area);
                    break;
                case 'poly':
                case 'polygon':
                    formArea = new FormPolygon(this, canvasArea, area);
                    break;
                case 'default':
            }
            formArea.initialize();
            this._areaZone.append(formArea.element);
            this.areas.push(formArea);
            return formArea;
        };
        AreaForm.prototype.deleteArea = function (area) {
            var areas = [];
            this.areas.forEach(function (currentArea) {
                if (area !== currentArea) {
                    areas.push(currentArea);
                }
            });
            this.areas = areas;
            area.canvasArea.areaCanvas.canvas.remove(area.canvasArea);
            area = null;
            this.updateArrowsState();
        };
        AreaForm.prototype.moveArea = function (area, offset) {
            var index = this.areas.indexOf(area), newIndex = index + offset, parent = area.element.parentNode;
            if (newIndex > -1 && newIndex < this.areas.length) {
                var removedArea = this.areas.splice(index, 1)[0];
                this.areas.splice(newIndex, 0, removedArea);
                parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
            }
            this.updateArrowsState();
        };
        AreaForm.prototype.updateArrowsState = function () {
            this.areas.forEach(function (area) {
                area.updateArrowsState();
            });
        };
        /**
         * Create form element that is reachable for LinkBrowser.finalizeFunction
         */
        AreaForm.prototype.addFauxFormForLinkBrowser = function () {
            if (top.document !== this.fauxDocument) {
                if (!(this.fauxForm = this.fauxDocument.querySelector(this.options.formSelector))) {
                    this.fauxForm = this.fauxDocument.createElement('form');
                    this.fauxForm.setAttribute('name', 'areasForm');
                    this.fauxForm.setAttribute('id', 'fauxForm');
                    this.fauxDocument.body.appendChild(this.fauxForm);
                }
                // empty previously created fauxForm
                while (this.fauxForm.firstChild) {
                    this.fauxForm.removeChild(this.fauxForm.firstChild);
                }
            }
        };
        AreaForm.prototype.openLinkBrowser = function (link, area) {
            link.blur();
            var data = __assign(__assign({}, this.options.browseLink), { objectId: area.id, formName: 'areasForm', itemFormElName: 'link' + area.id });
            $.ajax({
                url: this.options.browseLinkUrlAjaxUrl,
                context: area,
                data: data
            }).done(function (response) {
                var url = response.url
                    + '&P[currentValue]=' + encodeURIComponent(area.getFieldValue('.href'))
                    + '&P[currentSelectedValues]=' + encodeURIComponent(area.getFieldValue('.href'));
                window.FormArea = area;
                Modal.advanced({
                    type: Modal.types.iframe,
                    content: url,
                    size: Modal.sizes.large,
                });
            });
        };
        AreaForm.prototype.destroy = function () {
            this.areas.forEach(function (area) {
                area.destroy();
            });
        };
        return AreaForm;
    }());
    var CanvasRectangle = /** @class */ (function (_super) {
        __extends(CanvasRectangle, _super);
        function CanvasRectangle(options) {
            var _this = _super.call(this, options) || this;
            _this.id = 0;
            _this.id = fabric.Object.__uid++;
            _this.on('modified', _this.rectangleMoved.bind(_this));
            _this.on('moved', _this.rectangleMoved.bind(_this));
            return _this;
        }
        CanvasRectangle.prototype.setProperty = function (property, value) {
            var set = {};
            set[property] = value;
            this.set(set);
            this.canvas.renderAll();
        };
        CanvasRectangle.prototype.setProperties = function (properties) {
            this.set(properties);
            this.canvas.renderAll();
        };
        CanvasRectangle.prototype.rectangleMoved = function () {
            var configuration = JSON.parse(JSON.stringify(this.formArea.configuration));
            configuration.coords = {
                left: Math.round(this.left),
                top: Math.round(this.top),
                right: Math.round(this.getScaledWidth() + this.left),
                bottom: Math.round(this.getScaledHeight() + this.top),
            };
            this.formArea.updateFields(configuration);
        };
        return CanvasRectangle;
    }(fabric.Rect));
    var CanvasCircle = /** @class */ (function (_super) {
        __extends(CanvasCircle, _super);
        function CanvasCircle(options) {
            var _this = _super.call(this, options) || this;
            _this.id = 0;
            _this.id = fabric.Object.__uid++;
            _this.on('modified', _this.circleMoved.bind(_this));
            _this.on('moved', _this.circleMoved.bind(_this));
            return _this;
        }
        CanvasCircle.prototype.setProperty = function (property, value) {
            var set = {};
            set[property] = value;
            this.set(set);
            this.canvas.renderAll();
        };
        CanvasCircle.prototype.setProperties = function (properties) {
            this.set(properties);
            this.canvas.renderAll();
        };
        CanvasCircle.prototype.circleMoved = function () {
            var configuration = JSON.parse(JSON.stringify(this.formArea.configuration));
            configuration.coords = {
                left: Math.round(this.left),
                top: Math.round(this.top),
                radius: Math.round(this.getRadiusX()),
            };
            this.formArea.updateFields(configuration);
        };
        return CanvasCircle;
    }(fabric.Circle));
    var CanvasPolygon = /** @class */ (function (_super) {
        __extends(CanvasPolygon, _super);
        function CanvasPolygon(points, configuration) {
            var _this = _super.call(this, points, configuration) || this;
            _this.id = 0;
            _this.controls = [];
            _this.configuration = configuration;
            _this.id = fabric.Object.__uid++;
            _this.on('modified', _this.polygonMoved.bind(_this));
            _this.on('moved', _this.polygonMoved.bind(_this));
            return _this;
        }
        CanvasPolygon.prototype.setProperty = function (property, value) {
            var set = {};
            set[property] = value;
            this.set(set);
            this.canvas.renderAll();
        };
        CanvasPolygon.prototype.setProperties = function (properties) {
            this.set(properties);
            this.canvas.renderAll();
        };
        CanvasPolygon.prototype.setPointProperties = function (pointIndex, properties) {
            this.points[pointIndex] = {
                x: properties.x - this.configuration.left,
                y: properties.y - this.configuration.top,
            };
            this.controls[pointIndex].set({
                left: properties.x - this.configuration.left,
                top: properties.y - this.configuration.top,
            });
            this.controls[pointIndex].setCoords();
            this.canvas.renderAll();
        };
        CanvasPolygon.prototype.addControls = function () {
            var _this = this;
            if (!this.configuration.interactive) {
                return;
            }
            this.points.forEach(function (point, index) {
                _this.addControl(_this.configuration, point, index, 100000);
            });
        };
        CanvasPolygon.prototype.addControl = function (areaConfig, point, index, newControlIndex) {
            var circle = new fabric.Circle(__assign(__assign({}, areaConfig), { hasControls: false, radius: 5, fill: areaConfig.cornerColor, stroke: areaConfig.cornerStrokeColor, originX: 'center', originY: 'center', name: index, polygon: this, point: point, type: 'control', opacity: this.controls.length === 0 ? 0 : this.controls[0].opacity, 
                // set control position relative to polygon
                left: this.configuration.left + point.x, top: this.configuration.top + point.y }));
            circle.on('moved', this.pointMoved.bind(this));
            point.control = circle;
            this.controls = AreaUtility.addElementToArrayWithPosition(this.controls, circle, newControlIndex);
            this.areaCanvas.canvas.add(circle);
            this.areaCanvas.canvas.renderAll();
        };
        CanvasPolygon.prototype.removePoint = function (event) {
            var _this = this;
            if (this.points.length > 3) {
                var element_2 = event.currentTarget.parentNode.parentNode, points_2 = [], controls_2 = [];
                this.points.forEach(function (point, index) {
                    if (element_2.id !== point.id) {
                        points_2.push(point);
                        controls_2.push(_this.controls[index]);
                    }
                    else {
                        point.element.remove();
                        _this.areaCanvas.canvas.remove(_this.controls[index]);
                    }
                });
                points_2.forEach(function (point, index) {
                    point.id = 'p' + _this.id + '_' + index;
                    controls_2[index].name = index;
                });
                this.points = points_2;
                this.controls = controls_2;
                this.areaCanvas.canvas.renderAll();
            }
        };
        CanvasPolygon.prototype.pointMoved = function (event) {
            var configuration = JSON.parse(JSON.stringify(this.formArea.configuration)), control = event.target, id = control.point.id, center = control.getCenterPoint();
            configuration.coords.points.forEach(function (point) {
                if (point.id == id) {
                    point.x = Math.round(center.x);
                    point.y = Math.round(center.y);
                }
            });
            this.formArea.updateFields(configuration);
        };
        CanvasPolygon.prototype.polygonMoved = function () {
            var configuration = JSON.parse(JSON.stringify(this.formArea.configuration));
            this.controls.forEach(function (control, index) {
                configuration.coords.points[index] = {
                    x: Math.round(control.left),
                    y: Math.round(control.top),
                    id: control.point.id,
                };
            });
            this.formArea.updateFields(configuration);
        };
        return CanvasPolygon;
    }(fabric.Polygon));
    var AreaCanvas = /** @class */ (function () {
        function AreaCanvas(element, options) {
            this.areaConfig = {
                cornerColor: '#eee',
                cornerStrokeColor: '#bbb',
                cornerSize: 10,
                cornerStyle: 'circle',
                hasBorders: false,
                hasRotatingPoint: false,
                strokeWidth: 1,
                transparentCorners: false
            };
            this.areas = [];
            this.activePolygon = null;
            this.options = options;
            this._canvas = new fabric.Canvas(element, options);
            fabric.util.setStyle(this._canvas.wrapperEl, {
                position: 'absolute',
            });
            this._canvas.on('object:moving', this.canvasObjectMoving.bind(this));
            this._canvas.on('selection:created', this.canvasSelectionCreated.bind(this));
            this._canvas.on('selection:updated', this.canvasSelectionUpdated.bind(this));
        }
        Object.defineProperty(AreaCanvas.prototype, "canvas", {
            get: function () {
                return this._canvas;
            },
            enumerable: true,
            configurable: true
        });
        AreaCanvas.prototype.canvasObjectMoving = function (event) {
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
        };
        AreaCanvas.prototype.canvasSelectionCreated = function (event) {
            if (event.target.type === 'polygon') {
                this.activePolygon = event.target;
                // show controls of active polygon
                this.activePolygon.controls.forEach(function (control) {
                    control.opacity = 1;
                });
                this._canvas.renderAll();
            }
        };
        AreaCanvas.prototype.canvasSelectionUpdated = function (event) {
            var _this = this;
            event.deselected.forEach(function (element) {
                if (element.type === 'polygon' && event.selected[0].type !== 'control') {
                    // hide controls of active polygon
                    element.controls.forEach(function (control) {
                        control.opacity = 0;
                    });
                    _this.activePolygon = null;
                    _this._canvas.renderAll();
                }
                else if (element.type === 'control') {
                    _this.activePolygon = element.polygon;
                    // hide controls of active polygon
                    _this.activePolygon.controls.forEach(function (control) {
                        control.opacity = 0;
                    });
                    _this.activePolygon = null;
                    _this._canvas.renderAll();
                }
            });
            event.selected.forEach(function (element) {
                if (element.type === 'polygon') {
                    _this.activePolygon = element;
                    // hide controls of active polygon
                    element.controls.forEach(function (control) {
                        control.opacity = 1;
                    });
                    _this._canvas.renderAll();
                }
            });
        };
        AreaCanvas.prototype.addArea = function (area) {
            var canvasArea, configuration = {
                coords: area.coords,
                selectable: this.options.interactive,
                hasControls: this.options.interactive,
                stroke: area.data.color,
                fill: AreaUtility.hexToRgbA(area.data.color, 0.3)
            };
            switch (area.shape) {
                case 'rect':
                case 'rectangle':
                    canvasArea = this.createRectangle(configuration);
                    break;
                case 'circ':
                case 'circle':
                    canvasArea = this.createCircle(configuration);
                    break;
                case 'poly':
                case 'polygon':
                    canvasArea = this.createPolygon(configuration);
                    break;
                case 'default':
            }
            canvasArea.areaCanvas = this;
            this._canvas.add(canvasArea);
            this.areas.push(canvasArea);
            return canvasArea;
        };
        AreaCanvas.prototype.createRectangle = function (configuration) {
            var coords = configuration.coords, options = __assign(__assign(__assign({}, this.areaConfig), configuration), { top: coords.top, left: coords.left, width: coords.right - coords.left, height: coords.bottom - coords.top });
            return new CanvasRectangle(options);
        };
        AreaCanvas.prototype.createCircle = function (configuration) {
            var coords = configuration.coords, options = __assign(__assign(__assign({}, this.areaConfig), configuration), { top: coords.top - coords.radius, left: coords.left - coords.radius, radius: coords.radius }), canvasArea = new CanvasCircle(options);
            // disable control points as these would stretch the circle
            // to an ellipse which is not possible in html areas
            // @ts-ignore
            canvasArea.setControlVisible('ml', false);
            // @ts-ignore
            canvasArea.setControlVisible('mt', false);
            // @ts-ignore
            canvasArea.setControlVisible('mr', false);
            // @ts-ignore
            canvasArea.setControlVisible('mb', false);
            return canvasArea;
        };
        AreaCanvas.prototype.createPolygon = function (configuration) {
            var left = 100000, top = 100000, options = __assign(__assign(__assign({}, this.areaConfig), configuration), { left: 0, top: 0, selectable: true, hasControls: false, objectCaching: false, controlConfig: this.areaConfig, interactive: this.options.interactive });
            // get top and left corner of polygon
            options.coords.points.forEach(function (point) {
                left = Math.min(left, point.x);
                top = Math.min(top, point.y);
            });
            // reduce point x/y values by top/left values
            options.coords.points.forEach(function (point) {
                point.x = point.x - left;
                point.y = point.y - top;
            });
            options.left = left;
            options.top = top;
            return new CanvasPolygon(options.coords.points, options);
        };
        AreaCanvas.prototype.deleteArea = function (area) {
            var areas = [];
            this.areas.forEach(function (currentArea) {
                if (area !== currentArea) {
                    areas.push(currentArea);
                }
            });
            this.areas = areas;
            this._canvas.remove(area);
            area = null;
        };
        AreaCanvas.prototype.destroy = function () {
            var _this = this;
            this.areas.forEach(function (area) {
                _this.deleteArea(area);
            });
        };
        return AreaCanvas;
    }());
    var AreaManipulation = /** @class */ (function () {
        function AreaManipulation(container, options) {
            this.interactive = false;
            this.options = options;
            this.container = container;
            this.interactive = !!(options.formSelector || '');
            this.initializeCanvas();
            this.initializeForm();
        }
        AreaManipulation.prototype.initializeCanvas = function () {
            var canvas = this.container.querySelector(this.options.canvasSelector);
            this.canvas = new AreaCanvas(canvas, {
                width: this.options.canvas.width,
                height: this.options.canvas.height,
                interactive: this.interactive,
                selection: false,
                preserveObjectStacking: true,
                hoverCursor: this.interactive ? 'move' : 'default',
            });
        };
        AreaManipulation.prototype.initializeForm = function () {
            if (this.interactive) {
                this.form = new AreaForm({
                    formSelector: this.options.formSelector,
                    formDocument: this.options.editControlDocument,
                    browseLink: this.options.browseLink,
                    browseLinkUrlAjaxUrl: this.options.browseLinkUrlAjaxUrl,
                }, this);
            }
        };
        AreaManipulation.prototype.initializeAreas = function (areas) {
            var _this = this;
            areas = areas || [];
            areas.forEach(function (area) {
                area.data.color = AreaUtility.getRandomColor(area.data.color);
                var formArea = JSON.parse(JSON.stringify(area)), canvasArea = _this.canvas.addArea(area);
                if (_this.form) {
                    _this.form.addArea(formArea, canvasArea);
                }
            });
            if (this.form) {
                this.form.updateArrowsState();
            }
        };
        AreaManipulation.prototype.removeAllAreas = function () {
            var _this = this;
            this.form.areas.forEach(function (area) {
                _this.canvas.deleteArea(area.canvasArea);
                _this.form.deleteArea(area);
            });
        };
        AreaManipulation.prototype.getAreasData = function () {
            var data = [];
            this.form.areas.forEach(function (area) {
                data.push(area.getData());
            });
            return data;
        };
        AreaManipulation.prototype.destroy = function () {
            this.canvas.destroy();
            this.canvas = null;
            if (this.form) {
                this.form.destroy();
                this.form = null;
            }
        };
        return AreaManipulation;
    }());
    exports.AreaManipulation = AreaManipulation;
});
