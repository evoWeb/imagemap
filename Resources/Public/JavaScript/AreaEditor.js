function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

define(['jquery', 'TYPO3/CMS/Imagemap/Fabric', 'TYPO3/CMS/Imagemap/jquery.minicolors', 'jquery-ui/draggable', 'jquery-ui/resizable'], function ($, fabric) {
  // needed to access top frame elements
  var d = top.document || document,
      w = top.window || window;

  if (typeof d !== 'undefined' && typeof w !== 'undefined') {
    fabric.document = d;
    fabric.window = w;
  }

  var Aggregation = function Aggregation(baseClass) {
    for (var _len = arguments.length, mixins = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      mixins[_key - 1] = arguments[_key];
    }

    var base =
    /*#__PURE__*/
    function (_baseClass) {
      _inherits(base, _baseClass);

      function base() {
        var _getPrototypeOf2;

        var _this;

        _classCallCheck(this, base);

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(base)).call.apply(_getPrototypeOf2, [this].concat(args)));
        mixins.forEach(function (mixin) {
          copyProperties(_assertThisInitialized(_this), new mixin());
        });
        return _this;
      }

      return base;
    }(baseClass); // this function copies all properties and symbols, filtering out some special ones


    var copyProperties = function copyProperties(target, source) {
      /** @type {Array} */
      var propertySymbols = Object.getOwnPropertySymbols(source);
      Object.getOwnPropertyNames(source).concat(propertySymbols).forEach(function (property) {
        if (!property.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
          Object.defineProperty(target, property, Object.getOwnPropertyDescriptor(source, property));
        }
      });
    }; // outside constructor() to allow Aggregation(a, b, c).staticFunction() to be called etc.


    mixins.forEach(function (mixin) {
      copyProperties(base.prototype, mixin.prototype);
      copyProperties(base, mixin);
    });
    return base;
  };

  var AreaFormElement =
  /*#__PURE__*/
  function (_fabric$Object) {
    _inherits(AreaFormElement, _fabric$Object);

    function AreaFormElement() {
      var _getPrototypeOf3;

      var _this2;

      _classCallCheck(this, AreaFormElement);

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      _this2 = _possibleConstructorReturn(this, (_getPrototypeOf3 = _getPrototypeOf(AreaFormElement)).call.apply(_getPrototypeOf3, [this].concat(args)));

      _defineProperty(_assertThisInitialized(_this2), "name", '');

      _defineProperty(_assertThisInitialized(_this2), "element", null);

      _defineProperty(_assertThisInitialized(_this2), "form", null);

      _defineProperty(_assertThisInitialized(_this2), "eventDelay", 0);

      return _this2;
    }

    _createClass(AreaFormElement, [{
      key: "postAddToForm",
      value: function postAddToForm() {
        this.id = fabric.Object.__uid++;

        if (!this.hasOwnProperty('attributes')) {
          this.attributes = [];
        }

        this.initializeElement();
        this.updateFields();
        this.initializeColorPicker();
        this.initializeEvents();
        this.addFauxInput();
      }
    }, {
      key: "initializeElement",
      value: function initializeElement() {
        this.element = this.getFormElement('#' + this.name + 'Form');
        this.form.areaZone.append(this.element);
        this.form.initializeArrows();
      }
    }, {
      key: "initializeColorPicker",
      value: function initializeColorPicker() {
        $(this.getElement('.t3js-color-picker')).minicolors({
          format: 'hex',
          position: 'left',
          theme: 'default',
          changeDelay: 100,
          change: this.colorPickerAction.bind(this)
        });
      }
    }, {
      key: "initializeEvents",
      value: function initializeEvents() {
        this.on('moved', this.updateFields.bind(this));
        this.on('modified', this.updateFields.bind(this));
        this.getElements('.positionOptions .t3js-field').forEach(this.coordinateFieldHandler.bind(this));
        this.getElements('.basicOptions .t3js-field, .attributes .t3js-field').forEach(this.attributeFieldHandler.bind(this));
        this.getElements('.t3js-btn').forEach(this.buttonHandler.bind(this));
      }
    }, {
      key: "coordinateFieldHandler",
      value: function coordinateFieldHandler(field) {
        field.addEventListener('keyup', this.fieldKeyUpHandler.bind(this));
      }
    }, {
      key: "fieldKeyUpHandler",
      value: function fieldKeyUpHandler(event) {
        var _this3 = this;

        clearTimeout(this.eventDelay);
        this.eventDelay = AreaFormElement.wait(function () {
          _this3.updateCanvas(event);
        }, 500);
      }
    }, {
      key: "attributeFieldHandler",
      value: function attributeFieldHandler(field) {
        field.addEventListener('keyup', this.updateProperties.bind(this));
      }
    }, {
      key: "buttonHandler",
      value: function buttonHandler(button) {
        button.addEventListener('click', this[button.id + 'Action'].bind(this));
      }
    }, {
      key: "initializeArrows",
      value: function initializeArrows() {
        var areaZone = this.form.areaZone;
        this.getElement('#up').classList[areaZone.firstChild !== this.element ? 'remove' : 'add']('disabled');
        this.getElement('#down').classList[areaZone.lastChild !== this.element ? 'remove' : 'add']('disabled');
      }
    }, {
      key: "updateFields",
      value: function updateFields() {}
    }, {
      key: "updateProperties",
      value: function updateProperties(event) {
        var field = event.currentTarget;

        if (field.classList.contains('link')) {
          this.link = field.value;
        } else if (this.hasOwnProperty(field.id)) {
          this[field.id] = field.value;
        } else if (this.attributes.hasOwnProperty(field.id)) {
          this.attributes[field.id] = field.value;
        }
      }
    }, {
      key: "updateCanvas",
      value: function updateCanvas() {}
    }, {
      key: "linkAction",
      value: function linkAction(event) {
        this.form.openLinkBrowser(event.currentTarget, this);
      }
    }, {
      key: "upAction",
      value: function upAction() {
        this.form.moveArea(this, -1);
      }
    }, {
      key: "downAction",
      value: function downAction() {
        this.form.moveArea(this, 1);
      }
    }, {
      key: "undoAction",
      value: function undoAction() {}
    }, {
      key: "redoAction",
      value: function redoAction() {}
    }, {
      key: "deleteAction",
      value: function deleteAction() {
        if (this.element) {
          this.element.remove();
        }

        if (this.form) {
          this.form.initializeArrows();
        }

        this.editor.deleteArea(this);
        this.removeFauxInput();
        delete this;
      }
    }, {
      key: "expandAction",
      value: function expandAction() {
        this.showElement('.moreOptions');
        this.hideElement('#expand');
        this.showElement('#collapse');
      }
    }, {
      key: "collapseAction",
      value: function collapseAction() {
        this.hideElement('.moreOptions');
        this.hideElement('#collapse');
        this.showElement('#expand');
      }
    }, {
      key: "colorPickerAction",
      value: function colorPickerAction(value) {
        this.getElement('.t3js-color-picker').value = value;
        this.set('borderColor', value);
        this.set('stroke', value);
        this.set('fill', AreaEditor.hexToRgbA(value, 0.2));
        this.editor.canvas.renderAll();
      }
    }, {
      key: "getFormElement",
      value: function getFormElement(selector, id) {
        var template = this.form.element.querySelector(selector).innerHTML.replace(new RegExp('_ID', 'g'), id ? id : this.id);
        return new DOMParser().parseFromString(template, 'text/html').body.firstChild;
      }
    }, {
      key: "getElement",
      value: function getElement(selector) {
        return this.element.querySelector(selector);
      }
    }, {
      key: "getElements",
      value: function getElements(selector) {
        return this.element.querySelectorAll(selector);
      }
    }, {
      key: "hideElement",
      value: function hideElement(selector) {
        this.getElement(selector).classList.add('hide');
      }
    }, {
      key: "showElement",
      value: function showElement(selector) {
        this.getElement(selector).classList.remove('hide');
      }
    }, {
      key: "toAreaXml",
      value: function toAreaXml() {
        return ['<area shape="' + this.name + '"', ' coords="' + this.getAreaCoords() + '"', this.getAdditionalAttributes() + '>', this.getLink(), '</area>'].join('');
      }
    }, {
      key: "getAreaCoords",
      value: function getAreaCoords() {}
    }, {
      key: "getAdditionalAttributes",
      value: function getAdditionalAttributes() {
        var result = [];
        this.getElements('.t3js-field').forEach(function (field) {
          if (!field.classList.contains('ignored-attribute')) {
            result.push(field.id + '="' + field.value + '"');
          }
        });
        return (result.length > 0 ? ' ' : '') + result.join(' ');
      }
    }, {
      key: "getLink",
      value: function getLink() {
        return this.getElement('.link').value;
      }
      /**
       * Add faux input as target for browselink which listens for changes and writes value to real field
       */

    }, {
      key: "addFauxInput",
      value: function addFauxInput() {
        if (this.form.fauxForm !== null) {
          var fauxInput = this.editor.fauxFormDocument.createElement('input');
          fauxInput.setAttribute('id', 'link' + this.id);
          fauxInput.setAttribute('data-formengine-input-name', 'link' + this.id);
          fauxInput.setAttribute('value', this.link);
          fauxInput.addEventListener('change', this.fauxInputChanged.bind(this));
          this.form.fauxForm.appendChild(fauxInput);
        }
      }
    }, {
      key: "fauxInputChanged",
      value: function fauxInputChanged(event) {
        var field = event.currentTarget;
        this.link = field.value;
        this.updateFields();
      }
    }, {
      key: "removeFauxInput",
      value: function removeFauxInput() {
        if (this.form && this.form.fauxForm !== null) {
          var field = this.form.fauxForm.querySelector('#link' + this.id);

          if (field) {
            field.remove();
          }
        }
      }
    }], [{
      key: "wait",
      value: function wait(callback, delay) {
        return window.setTimeout(callback, delay);
      }
    }]);

    return AreaFormElement;
  }(fabric.Object);

  var Rect =
  /*#__PURE__*/
  function (_Aggregation) {
    _inherits(Rect, _Aggregation);

    function Rect() {
      var _getPrototypeOf4;

      var _this4;

      _classCallCheck(this, Rect);

      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      _this4 = _possibleConstructorReturn(this, (_getPrototypeOf4 = _getPrototypeOf(Rect)).call.apply(_getPrototypeOf4, [this].concat(args)));

      _defineProperty(_assertThisInitialized(_this4), "name", 'rect');

      return _this4;
    }

    _createClass(Rect, [{
      key: "updateFields",
      value: function updateFields() {
        var _this5 = this;

        this.getElement('#color').value = this.color;
        this.getElement('#alt').value = this.alt;
        this.getElement('.link').value = this.link;
        this.getElement('#left').value = Math.floor(this.left + 0);
        this.getElement('#top').value = Math.floor(this.top + 0);
        this.getElement('#right').value = Math.floor(this.left + this.getScaledWidth());
        this.getElement('#bottom').value = Math.floor(this.top + this.getScaledHeight());
        Object.entries(this.attributes).forEach(function (attribute) {
          _this5.getElement('#' + attribute[0]).value = attribute[1];
        });
      }
    }, {
      key: "updateCanvas",
      value: function updateCanvas(event) {
        var field = event.currentTarget || event.target,
            value = 0;

        switch (field.id) {
          case 'left':
            value = parseInt(field.value);
            this.getElement('#right').value = value + this.getScaledWidth();
            this.set({
              left: value
            });
            break;

          case 'top':
            value = parseInt(field.value);
            this.getElement('#bottom').value = value + this.getScaledHeight();
            this.set({
              top: value
            });
            break;

          case 'right':
            value = field.value - this.left;

            if (value < 0) {
              value = 10;
              field.value = this.left + value;
            }

            this.set({
              width: value
            });
            break;

          case 'bottom':
            value = field.value - this.top;

            if (value < 0) {
              value = 10;
              field.value = this.top + value;
            }

            this.set({
              height: value
            });
            break;
        }

        this.canvas.renderAll();
      }
    }, {
      key: "getAreaCoords",
      value: function getAreaCoords() {
        return [Math.floor(this.left + 0), Math.floor(this.top + 0), Math.floor(this.left + this.getScaledWidth() - 1), Math.floor(this.top + this.getScaledHeight() - 1)].join(',');
      }
    }]);

    return Rect;
  }(Aggregation(fabric.Rect, AreaFormElement));

  var Circle =
  /*#__PURE__*/
  function (_Aggregation2) {
    _inherits(Circle, _Aggregation2);

    function Circle() {
      var _getPrototypeOf5;

      var _this6;

      _classCallCheck(this, Circle);

      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      _this6 = _possibleConstructorReturn(this, (_getPrototypeOf5 = _getPrototypeOf(Circle)).call.apply(_getPrototypeOf5, [this].concat(args)));

      _defineProperty(_assertThisInitialized(_this6), "name", 'circle');

      return _this6;
    }

    _createClass(Circle, [{
      key: "updateFields",
      value: function updateFields() {
        var _this7 = this;

        this.getElement('#color').value = this.color;
        this.getElement('#alt').value = this.alt;
        this.getElement('.link').value = this.link;
        this.getElement('#left').value = Math.floor(this.left + 0);
        this.getElement('#top').value = Math.floor(this.top + 0);
        this.getElement('#radius').value = Math.floor(this.getRadiusX());
        Object.entries(this.attributes).forEach(function (attribute) {
          _this7.getElement('#' + attribute[0]).value = attribute[1];
        });
      }
    }, {
      key: "updateCanvas",
      value: function updateCanvas(event) {
        var field = event.currentTarget || event.target,
            value = 0;

        switch (field.id) {
          case 'left':
            value = parseInt(field.value);
            this.set({
              left: value
            });
            break;

          case 'top':
            value = parseInt(field.value);
            this.set({
              top: value
            });
            break;

          case 'radius':
            value = parseInt(field.value);
            this.set({
              radius: value
            });
            break;
        }

        this.canvas.renderAll();
      }
    }, {
      key: "getAreaCoords",
      value: function getAreaCoords() {
        return [Math.floor(this.left + this.getRadiusX()), Math.floor(this.top + this.getRadiusX()), Math.floor(this.getRadiusX())].join(',');
      }
    }]);

    return Circle;
  }(Aggregation(fabric.Circle, AreaFormElement));

  var Poly =
  /*#__PURE__*/
  function (_Aggregation3) {
    _inherits(Poly, _Aggregation3);

    function Poly() {
      var _getPrototypeOf6;

      var _this8;

      _classCallCheck(this, Poly);

      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      _this8 = _possibleConstructorReturn(this, (_getPrototypeOf6 = _getPrototypeOf(Poly)).call.apply(_getPrototypeOf6, [this].concat(args)));

      _defineProperty(_assertThisInitialized(_this8), "name", 'poly');

      _defineProperty(_assertThisInitialized(_this8), "controls", []);

      return _this8;
    }

    _createClass(Poly, [{
      key: "updateFields",
      value: function updateFields() {
        var _this9 = this;

        this.getElement('#color').value = this.color;
        this.getElement('#alt').value = this.alt;
        this.getElement('.link').value = this.link;
        Object.entries(this.attributes).forEach(function (attribute) {
          _this9.getElement('#' + attribute[0]).value = attribute[1];
        });
        var parentElement = this.getElement('.positionOptions');
        this.points.forEach(function (point, index) {
          point.id = point.id ? point.id : 'p' + _this9.id + '_' + index;

          if (!point.hasOwnProperty('element')) {
            point.element = _this9.getFormElement('#polyCoords', point.id);
            parentElement.append(point.element);
          }

          point.element.querySelector('#x' + point.id).value = point.x;
          point.element.querySelector('#y' + point.id).value = point.y;
        });
      }
    }, {
      key: "updateCanvas",
      value: function updateCanvas(event) {
        var field = event.currentTarget || event.target,
            _field$id$split = field.id.split('_'),
            _field$id$split2 = _slicedToArray(_field$id$split, 2),
            point = _field$id$split2[1],
            control = this.controls[parseInt(point)],
            x = control.getCenterPoint().x,
            y = control.getCenterPoint().y;

        if (field.id.indexOf('x') > -1) {
          x = parseInt(field.value);
        }

        if (field.id.indexOf('y') > -1) {
          y = parseInt(field.value);
        }

        control.set('left', x);
        control.set('top', y);
        control.setCoords();
        this.points[control.name] = {
          x: x,
          y: y
        };
        this.canvas.renderAll();
      }
    }, {
      key: "getAreaCoords",
      value: function getAreaCoords() {
        var result = [];
        this.controls.forEach(function (control) {
          var center = control.getCenterPoint();
          result.push(center.x);
          result.push(center.y);
        });
        return result.join(',');
      }
      /**
       * @type {Array}
       */

    }, {
      key: "addControls",
      value: function addControls(areaConfig) {
        var _this10 = this;

        this.points.forEach(function (point, index) {
          _this10.addControl(areaConfig, point, index);
        });
        this.canvas.on('object:moving', function (event) {
          if (event.target.get('type') === 'control') {
            var control = event.target,
                center = control.getCenterPoint();
            control.polygon.points[control.name] = {
              x: center.x,
              y: center.y
            };
          }
        });
      }
    }, {
      key: "addControl",
      value: function addControl(areaConfig, point, index) {
        var circle = new fabric.Circle(_objectSpread({}, areaConfig, {
          hasControls: false,
          radius: 5,
          fill: areaConfig.cornerColor,
          stroke: areaConfig.cornerStrokeColor,
          left: point.x,
          top: point.y,
          originX: 'center',
          originY: 'center',
          name: index,
          polygon: this,
          type: 'control'
        }));
        circle.on('moved', this.pointMoved.bind(this));
        this.controls[index] = circle;
        this.canvas.add(circle);
      }
    }, {
      key: "pointMoved",
      value: function pointMoved(event) {
        var point = event.currentTabId || event.target,
            id = 'p' + point.polygon.id + '_' + point.name,
            center = point.getCenterPoint();
        this.getElement('#x' + id).value = center.x;
        this.getElement('#y' + id).value = center.y;
      }
    }, {
      key: "addPointAction",
      value: function addPointAction() {
        var index = this.points.length,
            firstPoint = this.points[0],
            lastPoint = this.points[index - 1],
            id = 'p' + this.id + '_' + index,
            parentElement = this.getElement('.positionOptions'),
            element = this.getFormElement('#polyCoords', id),
            point = {
          x: (firstPoint.x + lastPoint.x) / 2,
          y: (firstPoint.y + lastPoint.y) / 2,
          id: id,
          element: element
        };
        element.querySelectorAll('.t3js-btn').forEach(this.buttonHandler.bind(this));
        element.querySelector('#x' + point.id).value = point.x;
        element.querySelector('#y' + point.id).value = point.y;
        parentElement.append(element);
        this.points.push(point);
        this.addControl(this.editor.areaConfig, point, index);
      }
    }, {
      key: "removePointAction",
      value: function removePointAction(event) {
        var _this11 = this;

        if (this.points.length > 3) {
          var element = event.currentTarget.parentNode.parentNode,
              points = [],
              controls = [];
          this.points.forEach(function (point, index) {
            if (element.id !== point.id) {
              points.push(point);
              controls.push(_this11.controls[index]);
            } else {
              point.element.remove();

              _this11.canvas.remove(_this11.controls[index]);
            }
          });
          points.forEach(function (point, index) {
            var oldId = point.id;
            point.id = 'p' + _this11.id + '_' + index;
            _this11.getElement('#' + oldId).id = point.id;
            _this11.getElement('#x' + oldId).id = 'x' + point.id;
            _this11.getElement('#y' + oldId).id = 'y' + point.id;

            _this11.getElement('[for="x' + oldId + '"]').setAttribute('for', 'x' + point.id);

            _this11.getElement('[for="y' + oldId + '"]').setAttribute('for', 'y' + point.id);

            controls[index].name = index;
          });
          this.points = points;
          this.controls = controls;
          this.canvas.renderAll();
        }
      }
    }]);

    return Poly;
  }(Aggregation(fabric.Polygon, AreaFormElement));

  var AreaForm =
  /*#__PURE__*/
  function () {
    /**
     * @type {HTMLElement}
     */

    /**
     * @type {AreaEditor}
     */

    /**
     * Element needed to add inputs that act as target for browselink finalizeFunction target
     *
     * @type {HTMLElement}
     */
    function AreaForm(formElement, editor) {
      _classCallCheck(this, AreaForm);

      _defineProperty(this, "areaZone", null);

      _defineProperty(this, "editor", null);

      _defineProperty(this, "fauxForm", null);

      this.element = editor.document.querySelector(formElement);
      this.areaZone = this.element.querySelector('#areaZone');
      this.editor = editor;
      this.addFauxFormForLinkBrowser(this.editor.browseLink);
    }

    _createClass(AreaForm, [{
      key: "destroy",
      value: function destroy() {
        this.removeFauxForm();
      }
    }, {
      key: "initializeArrows",
      value: function initializeArrows() {
        this.editor.areas.forEach(function (area) {
          area.initializeArrows();
        });
      }
    }, {
      key: "addArea",
      value: function addArea(area) {
        area.form = this;
        area.postAddToForm();
      }
    }, {
      key: "moveArea",
      value: function moveArea(area, offset) {
        var index = this.editor.areas.indexOf(area),
            newIndex = index + offset,
            parent = area.element.parentNode;

        if (newIndex > -1 && newIndex < this.editor.areas.length) {
          var removedArea = this.editor.areas.splice(index, 1)[0];
          this.editor.areas.splice(newIndex, 0, removedArea);
          parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
        }

        this.initializeArrows();
      }
    }, {
      key: "openLinkBrowser",
      value: function openLinkBrowser(link, area) {
        link.blur();

        var data = _objectSpread({}, this.editor.browseLink, {
          objectId: area.id,
          itemName: 'link' + area.id,
          currentValue: area.getLink()
        });

        $.ajax({
          url: this.editor.browseLinkUrlAjaxUrl,
          context: area,
          data: data
        }).done(function (response) {
          var vHWin = window.open(response.url, '', 'height=600,width=500,status=0,menubar=0,scrollbars=1');
          vHWin.focus();
        });
      }
      /**
       * Triggers change event after faux field was changed by browselink
       */

    }, {
      key: "addFauxFormForLinkBrowser",
      value: function addFauxFormForLinkBrowser() {
        if (top.document !== this.editor.fauxFormDocument) {
          this.fauxForm = this.editor.fauxFormDocument.createElement('form');
          this.fauxForm.setAttribute('name', this.editor.browseLink.formName);
          var fauxFormContainer = this.editor.fauxFormDocument.querySelector('#fauxFormContainer');

          while (fauxFormContainer.firstChild) {
            fauxFormContainer.removeChild(fauxFormContainer.firstChild);
          }

          fauxFormContainer.appendChild(this.fauxForm);
        }
      }
    }, {
      key: "removeFauxForm",
      value: function removeFauxForm() {
        if (this.fauxForm) {
          this.fauxForm.remove();
        }
      }
    }, {
      key: "syncAreaLinkValue",
      value: function syncAreaLinkValue(id) {
        this.editor.areas.forEach(function (area) {
          if (area.id === parseInt(id)) {
            area.link = area.getElement('.link').value;
          }
        });
      }
    }]);

    return AreaForm;
  }();

  var AreaEditor =
  /*#__PURE__*/
  function () {
    /**
     * @type {HTMLElement}
     */

    /**
     * @type {HTMLElement}
     */

    /**
     * @type {string}
     */

    /**
     * @type {object}
     */

    /**
     * @type {boolean}
     */

    /**
     * @type {Array}
     */
    function AreaEditor(options, canvasSelector, formSelector, document) {
      _classCallCheck(this, AreaEditor);

      _defineProperty(this, "areaConfig", {
        cornerColor: '#eee',
        cornerStrokeColor: '#bbb',
        cornerSize: 10,
        cornerStyle: 'circle',
        hasBorders: false,
        hasRotatingPoint: false,
        transparentCorners: false
      });

      _defineProperty(this, "document", null);

      _defineProperty(this, "fauxFormDocument", null);

      _defineProperty(this, "browseLinkUrlAjaxUrl", '');

      _defineProperty(this, "browseLink", null);

      _defineProperty(this, "preview", true);

      _defineProperty(this, "areas", []);

      this.initializeOptions(options);
      this.document = document;
      this.canvas = new fabric.Canvas(canvasSelector, _objectSpread({}, options.canvas, {
        selection: false
      }));

      if (formSelector !== '') {
        this.preview = false;
        this.form = new AreaForm(formSelector, this);
      }
    }

    _createClass(AreaEditor, [{
      key: "initializeOptions",
      value: function initializeOptions(options) {
        for (var option in options) {
          if (options.hasOwnProperty(option)) {
            this[option] = options[option];
          }
        }
      }
    }, {
      key: "setScale",
      value: function setScale(scaling) {
        this.canvas.setZoom(this.canvas.getZoom() * (scaling ? scaling : 1));
      }
    }, {
      key: "initializeAreas",
      value: function initializeAreas(areas) {
        var _this12 = this;

        if (areas !== undefined) {
          areas.forEach(function (area) {
            switch (area.shape) {
              case 'rect':
                _this12.addRect(area);

                break;

              case 'circle':
                _this12.addCircle(area);

                break;

              case 'poly':
                _this12.addPoly(area);

                break;
            }
          });
        }
      }
    }, {
      key: "removeAllAreas",
      value: function removeAllAreas() {
        this.areas.forEach(function (area) {
          area.deleteAction();
        });
      }
    }, {
      key: "addRect",
      value: function addRect(configuration) {
        configuration.color = AreaEditor.getRandomColor(configuration.color);

        var _configuration$coords = configuration.coords.split(','),
            _configuration$coords2 = _slicedToArray(_configuration$coords, 4),
            left = _configuration$coords2[0],
            top = _configuration$coords2[1],
            right = _configuration$coords2[2],
            bottom = _configuration$coords2[3],
            area = new Rect(_objectSpread({}, configuration, this.areaConfig, {
          selectable: !this.preview,
          hasControls: !this.preview,
          left: parseInt(left),
          top: parseInt(top),
          width: right - left,
          height: bottom - top,
          stroke: configuration.color,
          strokeWidth: 1,
          fill: AreaEditor.hexToRgbA(configuration.color, 0.3)
        }));

        area.editor = this;
        this.canvas.add(area);
        this.areas.push(area);

        if (this.form) {
          this.form.addArea(area);
        }
      }
    }, {
      key: "addCircle",
      value: function addCircle(configuration) {
        configuration.color = AreaEditor.getRandomColor(configuration.color);

        var _configuration$coords3 = configuration.coords.split(','),
            _configuration$coords4 = _slicedToArray(_configuration$coords3, 3),
            left = _configuration$coords4[0],
            top = _configuration$coords4[1],
            radius = _configuration$coords4[2],
            area = new Circle(_objectSpread({}, configuration, this.areaConfig, {
          selectable: !this.preview,
          hasControls: !this.preview,
          left: left - radius,
          top: top - radius,
          radius: parseInt(radius),
          stroke: configuration.color,
          strokeWidth: 1,
          fill: AreaEditor.hexToRgbA(configuration.color, 0.3)
        }));

        area.setControlVisible('ml', false);
        area.setControlVisible('mt', false);
        area.setControlVisible('mr', false);
        area.setControlVisible('mb', false);
        area.editor = this;
        this.canvas.add(area);
        this.areas.push(area);

        if (this.form) {
          this.form.addArea(area);
        }
      }
    }, {
      key: "addPoly",
      value: function addPoly(configuration) {
        configuration.color = AreaEditor.getRandomColor(configuration.color);
        var coordsXY = configuration.coords.split(','),
            left = 100000,
            top = 100000,
            i = 0,
            points = [];

        if (coordsXY.length % 2) {
          throw new Error('Bad coords count');
        }

        for (; i < coordsXY.length; i = i + 2) {
          var xy = {
            x: parseInt(coordsXY[i]),
            y: parseInt(coordsXY[i + 1])
          };
          points.push(xy);
          left = Math.min(left, xy.x);
          top = Math.min(top, xy.y);
        }

        var area = new Poly(points, _objectSpread({}, configuration, this.areaConfig, {
          selectable: false,
          objectCaching: false,
          hasControls: !this.preview,
          top: top,
          left: left,
          stroke: configuration.color,
          strokeWidth: 1,
          fill: AreaEditor.hexToRgbA(configuration.color, 0.3)
        }));
        area.editor = this;
        this.canvas.add(area);
        this.areas.push(area);

        if (this.form) {
          area.addControls(this.areaConfig);
          this.form.addArea(area);
        }
      }
    }, {
      key: "triggerLinkChanged",
      value: function triggerLinkChanged(id) {
        var selector = 'form[name="' + this.browseLink.formName + '"] [data-formengine-input-name="link' + id + '"]',
            field = this.fauxFormDocument.querySelector(selector),
            event = this.fauxFormDocument.createEvent('HTMLEvents');
        event.initEvent('change', false, true);
        field.dispatchEvent(event);
      }
    }, {
      key: "deleteArea",
      value: function deleteArea(area) {
        var areas = [];
        this.areas.forEach(function (currentArea) {
          if (area !== currentArea) {
            areas.push(currentArea);
          }
        });
        this.areas = areas;
        this.canvas.remove(area);
      }
    }, {
      key: "toAreaXml",
      value: function toAreaXml() {
        var xml = ['<map>'];
        this.areas.forEach(function (area) {
          xml.push(area.toAreaXml());
        });
        xml.push('</map>');
        return xml.join("\n");
      }
    }], [{
      key: "getRandomColor",
      value: function getRandomColor(color) {
        if (color === undefined) {
          var r = (Math.floor(Math.random() * 5) * 3).toString(16),
              g = (Math.floor(Math.random() * 5) * 3).toString(16),
              b = (Math.floor(Math.random() * 5) * 3).toString(16);
          color = '#' + r + r + g + g + b + b;
        }

        return color;
      }
    }, {
      key: "hexToRgbA",
      value: function hexToRgbA(hex, alpha) {
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
          } else {
            result = 'rgb(' + [r, g, b].join(', ') + ')';
          }

          return result;
        }

        throw new Error('Bad Hex');
      }
    }]);

    return AreaEditor;
  }();

  return AreaEditor;
});
//# sourceMappingURL=AreaEditor.js.map
