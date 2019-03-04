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

define(['jquery', 'TYPO3/CMS/Imagemap/Fabric'], function ($, fabric) {
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
        this.initializeColorPicker();
        this.updateFields();
        this.initializeEvents();
      }
    }, {
      key: "initializeElement",
      value: function initializeElement() {
        this.element = this.getFormElement('#' + this.constructor.name.toLowerCase() + 'Form');
        this.form.areaZone.append(this.element);
        this.form.initializeArrows();
      }
    }, {
      key: "initializeColorPicker",
      value: function initializeColorPicker() {
        var colorPicker = this.getElement('.colorPicker'),
            values = ['00', '33', '66', '99', 'CC', 'FF'];

        for (var b = 1; b < 6; b++) {
          for (var g = 1; g < 5; g++) {
            for (var r = 1; r < 6; r++) {
              var color = values[b] + values[g] + values[r],
                  cell = document.createElement('div');
              cell.id = color;
              cell.style.backgroundColor = '#' + color;
              cell.classList.add('colorPickerCell');
              cell.addEventListener('click', this.colorPickerAction.bind(this));
              colorPicker.append(cell);
            }
          }
        }
      }
    }, {
      key: "initializeEvents",
      value: function initializeEvents() {
        var that = this;
        this.on('moved', this.updateFields.bind(this));
        this.on('modified', this.updateFields.bind(this));
        this.getElements('.positionOptions .t3js-field').forEach(function (field) {
          field.addEventListener('keyup', function (event) {
            clearTimeout(that.eventDelay);
            that.eventDelay = setTimeout(function () {
              that.updateCanvas(event);
            }, 500);
          }.bind(this));
        }.bind(this));
        this.getElements('.basicOptions .t3js-field, .attributes .t3js-field').forEach(function (field) {
          field.addEventListener('keyup', this['updateProperties'].bind(this));
        }.bind(this));
        this.getElements('.t3js-btn').forEach(function (button) {
          button.addEventListener('click', this[button.id + 'Action'].bind(this));
        }.bind(this));
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
        this.form.deleteArea(this);
        this.element.remove();
        this.form.initializeArrows();
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
      value: function colorPickerAction(event) {
        var color = event.currentTarget.style.backgroundColor;
        this.getElement('#color').style.backgroundColor = color;
        this.set('borderColor', color);
        this.set('stroke', color);
        this.set('fill', AreaEditor.hexToRgbA(AreaEditor.rgbAToHex(color), 0.2));
        this.form.editor.canvas.renderAll();
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
        return ['<area shape="' + this.constructor.name.toLowerCase() + '"', ' coords="' + this.getAreaCoords() + '"', this.getAdditionalAttributes() + '>', this.getLink(), '</area>'].join('');
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
            switch (field.id) {
              case 'color':
                result.push(field.id + '="' + AreaEditor.rgbAToHex(field.style.backgroundColor) + '"');
                break;

              default:
                result.push(field.id + '="' + field.value + '"');
                break;
            }
          }
        });
        return (result.length > 0 ? ' ' : '') + result.join(' ');
      }
    }, {
      key: "getLink",
      value: function getLink() {
        return this.getElement('.link').value;
      }
    }]);

    return AreaFormElement;
  }(fabric.Object);

  var Rect =
  /*#__PURE__*/
  function (_Aggregation) {
    _inherits(Rect, _Aggregation);

    function Rect() {
      _classCallCheck(this, Rect);

      return _possibleConstructorReturn(this, _getPrototypeOf(Rect).apply(this, arguments));
    }

    _createClass(Rect, [{
      key: "updateFields",
      value: function updateFields() {
        var _this3 = this;

        this.getElement('#color').style.backgroundColor = this.color;
        this.getElement('#alt').value = this.alt;
        this.getElement('.link').value = this.link;
        this.getElement('#left').value = Math.floor(this.left + 0);
        this.getElement('#top').value = Math.floor(this.top + 0);
        this.getElement('#right').value = Math.floor(this.left + this.getScaledWidth());
        this.getElement('#bottom').value = Math.floor(this.top + this.getScaledHeight());
        Object.entries(this.attributes).forEach(function (attribute) {
          _this3.getElement('#' + attribute[0]).value = attribute[1];
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
      _classCallCheck(this, Circle);

      return _possibleConstructorReturn(this, _getPrototypeOf(Circle).apply(this, arguments));
    }

    _createClass(Circle, [{
      key: "updateFields",
      value: function updateFields() {
        var _this4 = this;

        this.getElement('#color').style.backgroundColor = this.color;
        this.getElement('#alt').value = this.alt;
        this.getElement('.link').value = this.link;
        this.getElement('#left').value = Math.floor(this.left + 0);
        this.getElement('#top').value = Math.floor(this.top + 0);
        this.getElement('#radius').value = Math.floor(this.getRadiusX());
        Object.entries(this.attributes).forEach(function (attribute) {
          _this4.getElement('#' + attribute[0]).value = attribute[1];
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
      var _getPrototypeOf4;

      var _this5;

      _classCallCheck(this, Poly);

      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      _this5 = _possibleConstructorReturn(this, (_getPrototypeOf4 = _getPrototypeOf(Poly)).call.apply(_getPrototypeOf4, [this].concat(args)));

      _defineProperty(_assertThisInitialized(_this5), "controls", []);

      return _this5;
    }

    _createClass(Poly, [{
      key: "updateFields",
      value: function updateFields() {
        var _this6 = this;

        this.getElement('#color').style.backgroundColor = this.color;
        this.getElement('#alt').value = this.alt;
        this.getElement('.link').value = this.link;
        Object.entries(this.attributes).forEach(function (attribute) {
          _this6.getElement('#' + attribute[0]).value = attribute[1];
        });
        var parentElement = this.getElement('.positionOptions');
        this.points.forEach(function (point, index) {
          point.id = point.id ? point.id : 'p' + _this6.id + '_' + index;

          if (!point.hasOwnProperty('element')) {
            point.element = _this6.getFormElement('#polyCoords', point.id);
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
        var _this7 = this;

        this.points.forEach(function (point, index) {
          _this7.addControl(areaConfig, point, index);
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
        element.querySelectorAll('.t3js-btn').forEach(function (button) {
          button.addEventListener('click', this[button.id + 'Action'].bind(this));
        }.bind(this));
        element.querySelector('#x' + point.id).value = point.x;
        element.querySelector('#y' + point.id).value = point.y;
        parentElement.append(element);
        this.points.push(point);
        this.addControl(this.form.editor.areaConfig, point, index);
      }
    }, {
      key: "removePointAction",
      value: function removePointAction(event) {
        var _this8 = this;

        if (this.points.length > 3) {
          var element = event.currentTarget.parentNode.parentNode,
              points = [],
              controls = [];
          this.points.forEach(function (point, index) {
            if (element.id !== point.id) {
              points.push(point);
              controls.push(_this8.controls[index]);
            } else {
              point.element.remove();

              _this8.canvas.remove(_this8.controls[index]);
            }
          });
          points.forEach(function (point, index) {
            var oldId = point.id;
            point.id = 'p' + _this8.id + '_' + index;
            _this8.getElement('#' + oldId).id = point.id;
            _this8.getElement('#x' + oldId).id = 'x' + point.id;
            _this8.getElement('#y' + oldId).id = 'y' + point.id;

            _this8.getElement('[for="x' + oldId + '"]').setAttribute('for', 'x' + point.id);

            _this8.getElement('[for="y' + oldId + '"]').setAttribute('for', 'y' + point.id);

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
     * @type {Array}
     */

    /**
     * @type {HTMLElement}
     */
    function AreaForm(formElement, editor) {
      _classCallCheck(this, AreaForm);

      _defineProperty(this, "areas", []);

      _defineProperty(this, "areaZone", null);

      this.element = fabric.document.querySelector(formElement);
      this.areaZone = this.element.querySelector('#areaZone');
      this.editor = editor;
    }

    _createClass(AreaForm, [{
      key: "initializeArrows",
      value: function initializeArrows() {
        this.areas.forEach(function (area) {
          area.initializeArrows();
        });
      }
    }, {
      key: "addArea",
      value: function addArea(area) {
        this.areas.push(area);
        area.form = this;
        area.postAddToForm();
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
        this.editor.deleteArea(area);
      }
    }, {
      key: "moveArea",
      value: function moveArea(area, offset) {
        var index = this.areas.indexOf(area),
            newIndex = index + offset,
            parent = area.element.parentNode;

        if (newIndex > -1 && newIndex < this.areas.length) {
          var removedArea = this.areas.splice(index, 1)[0];
          this.areas.splice(newIndex, 0, removedArea);
          parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
        }

        this.initializeArrows();
      }
    }, {
      key: "openLinkBrowser",
      value: function openLinkBrowser(link, area) {
        link.blur();

        var data = _objectSpread({}, window.imagemap.browseLink, {
          objectId: area.id,
          itemName: 'link' + area.id,
          currentValue: area.getLink()
        });

        $.ajax({
          url: TYPO3.settings.ajaxUrls['imagemap_browselink_url'],
          context: area,
          data: data
        }).done(function (response) {
          var vHWin = window.open(response.url, '', 'height=600,width=500,status=0,menubar=0,scrollbars=1');
          vHWin.focus();
        });
      }
    }, {
      key: "syncAreaLinkValue",
      value: function syncAreaLinkValue(id) {
        this.areas.forEach(function (area) {
          if (area.id === parseInt(id)) {
            area.link = area.getElement('.link').value;
          }
        });
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
    }]);

    return AreaForm;
  }();

  var AreaEditor =
  /*#__PURE__*/
  function () {
    function AreaEditor(canvas, form, options) {
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

      _defineProperty(this, "preview", false);

      this.initializeOptions(options);
      this.canvas = new fabric.Canvas(canvas, _objectSpread({}, options.canvas, {
        selection: false
      }));

      if (!this.preview) {
        this.form = new AreaForm(form, this);
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
      key: "initializeScaling",
      value: function initializeScaling(scaling) {
        var width = parseInt(scaling) / this.canvas.width,
            height = parseInt(scaling) / this.canvas.height;
        return width > height ? height : width;
      }
    }, {
      key: "setScale",
      value: function setScale(scaling) {
        this.scaleFactor = scaling > 1 ? 1 : scaling;
      }
    }, {
      key: "getMaxWidth",
      value: function getMaxWidth() {
        return this.scaleFactor * this.canvas.width;
      }
    }, {
      key: "getMaxHeight",
      value: function getMaxHeight() {
        return this.scaleFactor * this.canvas.height;
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
          hasControls: !this.preview,
          left: parseInt(left),
          top: parseInt(top),
          width: right - left,
          height: bottom - top,
          stroke: configuration.color,
          strokeWidth: 1,
          fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.001 : 0.2)
        }));

        this.canvas.add(area);

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
          hasControls: !this.preview,
          left: left - radius,
          top: top - radius,
          radius: parseInt(radius),
          stroke: configuration.color,
          strokeWidth: 1,
          fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.001 : 0.2)
        }));

        area.setControlVisible('ml', false);
        area.setControlVisible('mt', false);
        area.setControlVisible('mr', false);
        area.setControlVisible('mb', false);
        this.canvas.add(area);

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
          fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.001 : 0.2)
        }));
        this.canvas.add(area);

        if (this.form) {
          area.addControls(this.areaConfig);
          this.form.addArea(area);
        }
      }
    }, {
      key: "triggerAreaLinkUpdate",
      value: function triggerAreaLinkUpdate(id) {
        this.form.syncAreaLinkValue(id);
      }
    }, {
      key: "deleteArea",
      value: function deleteArea(area) {
        this.canvas.remove(area);
      }
    }, {
      key: "toAreaXml",
      value: function toAreaXml() {
        return this.form.toAreaXml();
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
    }, {
      key: "rgbAToHex",
      value: function rgbAToHex(rgba) {
        var numbers = rgba.replace(/[^0-9,]*/g, '').split(',');

        if (numbers.length < 3) {
          throw new Error('Bad rgba');
        }

        var rgb = numbers[2] | numbers[1] << 8 | numbers[0] << 16;
        return '#' + (0x1000000 + rgb).toString(16).slice(1).toUpperCase();
      }
    }]);

    return AreaEditor;
  }();

  return AreaEditor;
});
//# sourceMappingURL=AreaEditor.js.map
