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
            this._canvasArea = canvasArea;
            this._canvasArea.formArea = this;
            this.id = canvasArea.id;
        }
        FormArea.prototype.initialize = function () {
            this.prepareAreaTemplate();
            this.updateFields(this.configuration);
            this.initializeColorPicker();
            this.initializeEvents();
            this.addFauxInput();
        };
        Object.defineProperty(FormArea.prototype, "canvasArea", {
            get: function () {
                return this._canvasArea;
            },
            set: function (value) {
                this._canvasArea = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FormArea.prototype, "element", {
            get: function () {
                return this._element;
            },
            enumerable: true,
            configurable: true
        });
        FormArea.prototype.getFormElement = function (selector, id) {
            var template = this.form.element
                .querySelector(selector)
                .innerHTML.replace(new RegExp('_ID', 'g'), String(id ? id : this.id));
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
            this.canvasArea.set('borderColor', value);
            this.canvasArea.set('stroke', value);
            this.canvasArea.set('fill', AreaUtility.hexToRgbA(value, 0.2));
            this.canvasArea.canvas.renderAll();
        };
        FormArea.prototype.initializeEvents = function () {
            // this.on('moved', this.updateFields.bind(this));
            // this.on('modified', this.updateFields.bind(this));
            var _this = this;
            this.getElements('.positionOptions .t3js-field').forEach(function (field) {
                field.addEventListener('keyup', _this.fieldKeyUpHandler.bind(_this));
            });
            this.getElements('.basicOptions .t3js-field').forEach(function (field) {
                field.addEventListener('keyup', _this.updateProperties.bind(_this));
            });
            this.getElements('.t3js-btn').forEach(function (button) {
                var action = button.dataset.action + 'Action';
                button.addEventListener('click', _this[action].bind(_this));
            });
        };
        FormArea.prototype.fieldKeyUpHandler = function (event) {
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
        FormArea.prototype.initializeArrows = function () {
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
         * Add faux input as target for browselink which listens for changes and writes value to real field
         */
        FormArea.prototype.addFauxInput = function () {
            if (this.form.fauxForm) {
                var fauxInput = this.form.fauxFormDocument.createElement('input');
                fauxInput.setAttribute('id', 'link' + this.id);
                fauxInput.setAttribute('data-formengine-input-name', 'link' + this.id);
                fauxInput.setAttribute('value', this.link);
                fauxInput.addEventListener('change', this.fauxInputChanged.bind(this));
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
        FormArea.prototype.fauxInputChanged = function (event) {
            var field = event.currentTarget;
            this.link = field.value;
            this.updateFields(this.configuration);
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
            this.setFieldValue('.color', configuration.data.color);
            this.setFieldValue('.alt', configuration.alt);
            this.setFieldValue('.href', configuration.href);
            this.setFieldValue('#left', configuration.coords.left);
            this.setFieldValue('#top', configuration.coords.top);
            this.setFieldValue('#right', configuration.coords.right);
            this.setFieldValue('#bottom', configuration.coords.bottom);
        };
        FormRectangle.prototype.updateCanvas = function (event) {
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
        FormRectangle.prototype.getData = function () {
            return {
                shape: 'rect',
                href: this.getFieldValue('.href'),
                alt: this.getFieldValue('.alt'),
                coords: {
                    left: parseInt(this.getFieldValue('#left')),
                    top: parseInt(this.getFieldValue('#top')),
                    right: parseInt(this.getFieldValue('#right')),
                    bottom: parseInt(this.getFieldValue('#bottom'))
                },
                data: {
                    color: this.getFieldValue('.color')
                }
            };
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
            this.setFieldValue('.color', configuration.data.color);
            this.setFieldValue('.alt', configuration.alt);
            this.setFieldValue('.href', configuration.href);
            this.setFieldValue('#left', configuration.coords.left);
            this.setFieldValue('#top', configuration.coords.top);
            this.setFieldValue('#radius', configuration.coords.radius);
        };
        FormCircle.prototype.updateCanvas = function (event) {
            var field = (event.currentTarget || event.target), value = parseInt(field.value);
            switch (field.id) {
                case 'left':
                    this.set({ left: value });
                    break;
                case 'top':
                    this.set({ top: value });
                    break;
                case 'radius':
                    this.set({ radius: value });
                    break;
            }
            this.canvas.renderAll();
        };
        FormCircle.prototype.getData = function () {
            return {
                shape: 'circle',
                href: this.getFieldValue('.href'),
                alt: this.getFieldValue('.alt'),
                coords: {
                    left: parseInt(this.getFieldValue('#left')),
                    top: parseInt(this.getFieldValue('#top')),
                    radius: parseInt(this.getFieldValue('#radius'))
                },
                data: {
                    color: this.getFieldValue('.color')
                }
            };
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
            this.setFieldValue('.color', configuration.data.color);
            this.setFieldValue('.alt', configuration.alt);
            this.setFieldValue('.href', configuration.href);
            var parentElement = this.getElement('.positionOptions');
            configuration.coords.points.forEach(function (point, index) {
                point.id = point.id ? point.id : 'p' + _this.id + '_' + index;
                if (!point.hasOwnProperty('element')) {
                    point.element = _this.getFormElement('#polyCoords', point.id);
                    parentElement.append(point.element);
                }
                point.element.querySelector('#x' + point.id).value = point.x + _this.canvasArea.left;
                point.element.querySelector('#y' + point.id).value = point.y + _this.canvasArea.top;
            });
        };
        FormPolygon.prototype.updateCanvas = function (event) {
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
        FormPolygon.prototype.getData = function () {
            var coords = [], xCoords = this.getElements('.x-coord'), yCoords = this.getElements('.y-coord');
            xCoords.forEach(function (x, index) {
                var y = yCoords[index], point = {
                    x: parseInt(x.value),
                    y: parseInt(y.value)
                };
                coords.push(point);
            });
            return {
                shape: 'poly',
                href: this.getFieldValue('.href'),
                alt: this.getFieldValue('.alt'),
                coords: coords,
                data: {
                    color: this.getFieldValue('.color')
                }
            };
        };
        FormPolygon.prototype.addPointBeforeAction = function (event) {
            var direction = AreaUtility.before, index = this.points.length, parentElement = this.getElement('.positionOptions'), _a = __read(this.getPointElementAndCurrentPoint(event, direction), 4), point = _a[0], element = _a[1], currentPointIndex = _a[2], currentPoint = _a[3];
            parentElement.insertBefore(element, currentPoint.element);
            this.points = AreaUtility.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
            this.addControl(this.editor.areaConfig, point, index, currentPointIndex + direction);
        };
        FormPolygon.prototype.addPointAfterAction = function (event) {
            var direction = AreaUtility.after, index = this.points.length, parentElement = this.getElement('.positionOptions'), _a = __read(this.getPointElementAndCurrentPoint(event, direction), 4), point = _a[0], element = _a[1], currentPointIndex = _a[2], currentPoint = _a[3];
            if (currentPoint.element.nextSibling) {
                parentElement.insertBefore(element, currentPoint.element.nextSibling);
            }
            else {
                parentElement.append(element);
            }
            this.points = AreaUtility.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
            this.addControl(this.editor.areaConfig, point, index, currentPointIndex + direction);
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
        return FormPolygon;
    }(FormArea));
    var AreaForm = /** @class */ (function () {
        function AreaForm(options, editor) {
            this.areas = [];
            this.options = options;
            this.fauxFormDocument = this.options.fauxFormDocument;
            this._element = editor.container.querySelector(options.formSelector);
            this._areaZone = this.element.querySelector('#areaZone');
            this.addFauxFormForLinkBrowser(this.options.browseLink);
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
            area.canvasArea.canvas.remove(area.canvasArea);
            area = null;
            this.initializeArrows();
        };
        AreaForm.prototype.moveArea = function (area, offset) {
            var index = this.areas.indexOf(area), newIndex = index + offset, parent = area.element.parentNode;
            if (newIndex > -1 && newIndex < this.areas.length) {
                var removedArea = this.areas.splice(index, 1)[0];
                this.areas.splice(newIndex, 0, removedArea);
                parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
            }
            this.initializeArrows();
        };
        AreaForm.prototype.initializeArrows = function () {
            this.areas.forEach(function (area) {
                area.initializeArrows();
            });
        };
        /**
         * Triggers change event after faux field was changed by browselink
         */
        AreaForm.prototype.addFauxFormForLinkBrowser = function (configuration) {
            if (top.document !== this.fauxFormDocument) {
                this.fauxForm = this.fauxFormDocument.createElement('form');
                this.fauxForm.setAttribute('name', configuration.formName);
                var fauxFormContainer = this.fauxFormDocument.querySelector('#fauxFormContainer');
                while (fauxFormContainer.firstChild) {
                    fauxFormContainer.removeChild(fauxFormContainer.firstChild);
                }
                fauxFormContainer.appendChild(this.fauxForm);
            }
        };
        AreaForm.prototype.openLinkBrowser = function (link, area) {
            link.blur();
            /*let data = {
              ...this.options.browseLink,
              objectId: area.id,
              itemName: 'link' + area.id,
              currentValue: area.getFieldValue('.href')
            };
        
            $.ajax({
              url: this.options.browseLinkUrlAjaxUrl,
              context: area,
              data: data
            }).done((response: {url: string}) => {
              let vHWin = window.open(
                response.url,
                '',
                'height=600,width=500,status=0,menubar=0,scrollbars=1'
              );
              vHWin.focus()
            });*/
            var data = __assign(__assign({}, this.options.browseLink), { objectId: area.id, itemName: 'link' + area.id });
            $.ajax({
                url: this.options.browseLinkUrlAjaxUrl,
                context: area,
                data: data
            }).done(function (response) {
                var url = response.url
                    + '&P[currentValue]=' + encodeURIComponent(area.getFieldValue('.href'))
                    + '&P[currentSelectedValues]=' + encodeURIComponent(area.getFieldValue('.href'));
                Modal.advanced({
                    type: Modal.types.iframe,
                    content: url,
                    size: Modal.sizes.large,
                });
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
            return _this;
        }
        Object.defineProperty(CanvasRectangle.prototype, "canvas", {
            get: function () {
                return this._canvas;
            },
            set: function (value) {
                this._canvas = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasRectangle.prototype, "formArea", {
            get: function () {
                return this._formArea;
            },
            set: function (value) {
                this._formArea = value;
            },
            enumerable: true,
            configurable: true
        });
        return CanvasRectangle;
    }(fabric.Rect));
    var CanvasCircle = /** @class */ (function (_super) {
        __extends(CanvasCircle, _super);
        function CanvasCircle(options) {
            var _this = _super.call(this, options) || this;
            _this.id = 0;
            _this.id = fabric.Object.__uid++;
            return _this;
        }
        Object.defineProperty(CanvasCircle.prototype, "canvas", {
            get: function () {
                return this._canvas;
            },
            set: function (value) {
                this._canvas = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasCircle.prototype, "formArea", {
            get: function () {
                return this._formArea;
            },
            set: function (value) {
                this._formArea = value;
            },
            enumerable: true,
            configurable: true
        });
        return CanvasCircle;
    }(fabric.Circle));
    var CanvasPolygon = /** @class */ (function (_super) {
        __extends(CanvasPolygon, _super);
        function CanvasPolygon(options, points) {
            var _this = _super.call(this, points, options) || this;
            _this.id = 0;
            _this.id = fabric.Object.__uid++;
            return _this;
        }
        Object.defineProperty(CanvasPolygon.prototype, "canvas", {
            get: function () {
                return this._canvas;
            },
            set: function (value) {
                this._canvas = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasPolygon.prototype, "formArea", {
            get: function () {
                return this._formArea;
            },
            set: function (value) {
                this._formArea = value;
            },
            enumerable: true,
            configurable: true
        });
        CanvasPolygon.prototype.addControls = function () {
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
            this.options = options;
            this.canvas = new fabric.Canvas(element, options);
            fabric.util.setStyle(this.canvas.wrapperEl, {
                position: 'absolute',
            });
            this.canvas.on('object:moving', this.canvasObjectMoving);
            this.canvas.on('selection:created', this.canvasSelectionCreated);
            this.canvas.on('selection:updated', this.canvasSelectionUpdated);
        }
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
            var activePolygon = null;
            if (event.target.type === 'polygon') {
                activePolygon = event.target;
                // show controls of active polygon
                activePolygon.controls.forEach(function (control) {
                    control.opacity = 1;
                });
                this.canvas.renderAll();
            }
        };
        AreaCanvas.prototype.canvasSelectionUpdated = function (event) {
            var _this = this;
            var activePolygon = null;
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
            canvasArea.canvas = this;
            this.canvas.add(canvasArea);
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
            var left = 100000, top = 100000, options = __assign(__assign(__assign({}, this.areaConfig), configuration), { left: 0, top: 0, selectable: true, hasControls: false, objectCaching: false, controlConfig: this.areaConfig });
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
            var canvasArea = new CanvasPolygon(options, options.coords.points);
            if (this.options.interactive) {
                canvasArea.addControls();
            }
            return canvasArea;
        };
        AreaCanvas.prototype.deleteArea = function (area) {
            var areas = [];
            this.areas.forEach(function (currentArea) {
                if (area !== currentArea) {
                    areas.push(currentArea);
                }
            });
            this.areas = areas;
            this.canvas.remove(area);
            area = null;
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
                    fauxFormDocument: this.options.fauxFormDocument,
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
                var canvasArea = _this.canvas.addArea(area);
                if (_this.form) {
                    _this.form.addArea(area, canvasArea);
                }
            });
            if (this.form) {
                this.form.initializeArrows();
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
        AreaManipulation.prototype.destruct = function () {
            // this.form.destroy();
        };
        return AreaManipulation;
    }());
    exports.AreaManipulation = AreaManipulation;
});
