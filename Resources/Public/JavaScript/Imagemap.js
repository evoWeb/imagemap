function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

define(['TYPO3/CMS/Imagemap/Fabric'], function (fabric) {
  var imagemap = imagemap || {};

  var Rect =
  /*#__PURE__*/
  function (_fabric$Rect) {
    _inherits(Rect, _fabric$Rect);

    function Rect(options) {
      var _this;

      _classCallCheck(this, Rect);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Rect).call(this, options));
      _this.form = null;
      _this.subForm = null;
      return _this;
    }

    _createClass(Rect, [{
      key: "postInitializeForm",
      value: function postInitializeForm() {
        this.setValues();
        this.addEvents();
      }
    }, {
      key: "setValues",
      value: function setValues() {
        this.subForm.querySelector('#link').value = this.link;
        this.subForm.querySelector('#label').value = this.alt;
        this.subForm.querySelector('.colorPreview > div').style.backgroundColor = this.color;
      }
    }, {
      key: "addEvents",
      value: function addEvents() {
        this.subForm.querySelectorAll('.t3js-btn').forEach(function (button) {
          button.addEventListener('click', this[button.id + 'Action'].bind(this));
        }.bind(this));
      }
    }, {
      key: "linkAction",
      value: function linkAction() {// var area = jQuery(this).parents('.areaForm').data('area'); area.getCanvas().openPopup(this, area);
      }
    }, {
      key: "upAction",
      value: function upAction() {}
    }, {
      key: "downAction",
      value: function downAction() {}
    }, {
      key: "undoAction",
      value: function undoAction() {}
    }, {
      key: "redoAction",
      value: function redoAction() {}
    }, {
      key: "deleteAction",
      value: function deleteAction() {}
    }, {
      key: "expandAction",
      value: function expandAction() {
        this.showElement('.moreOptions');
        this.hideElement('#expand');
        this.showElement('#collaps');
      }
    }, {
      key: "collapsAction",
      value: function collapsAction() {
        this.hideElement('.moreOptions');
        this.hideElement('#collaps');
        this.showElement('#expand');
      }
    }, {
      key: "hideElement",
      value: function hideElement(selector) {
        this.subForm.querySelector(selector).classList.add('hide');
      }
    }, {
      key: "showElement",
      value: function showElement(selector) {
        this.subForm.querySelector(selector).classList.remove('hide');
      }
    }, {
      key: "persistanceXML",
      value: function persistanceXML() {
        var coords = this.left + ',' + this.top + ',' + (this.left + this.width) + ',' + (this.height + this.top);
        return '<area shape="rect" coords="' + coords + '" ' + this.getAdditionalAttributeXML() + '>' + this.getLink() + '</area>';
      }
    }]);

    return Rect;
  }(fabric.Rect);

  var Circle =
  /*#__PURE__*/
  function (_fabric$Circle) {
    _inherits(Circle, _fabric$Circle);

    function Circle(options) {
      var _this2;

      _classCallCheck(this, Circle);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Circle).call(this, options));
      _this2.form = null;
      _this2.subForm = null;
      return _this2;
    }

    _createClass(Circle, [{
      key: "postInitializeForm",
      value: function postInitializeForm() {
        this.setValues();
        this.addEvents();
      }
    }, {
      key: "setValues",
      value: function setValues() {
        this.subForm.querySelector('#link').value = this.link;
        this.subForm.querySelector('#label').value = this.alt;
        this.subForm.querySelector('.colorPreview > div').style.backgroundColor = this.color;
      }
    }, {
      key: "addEvents",
      value: function addEvents() {
        this.subForm.querySelectorAll('.t3js-btn').forEach(function (button) {
          button.addEventListener('click', this[button.id + 'Action'].bind(this));
        }.bind(this));
      }
    }, {
      key: "linkAction",
      value: function linkAction() {// var area = jQuery(this).parents('.areaForm').data('area'); area.getCanvas().openPopup(this, area);
      }
    }, {
      key: "upAction",
      value: function upAction() {}
    }, {
      key: "downAction",
      value: function downAction() {}
    }, {
      key: "undoAction",
      value: function undoAction() {}
    }, {
      key: "redoAction",
      value: function redoAction() {}
    }, {
      key: "deleteAction",
      value: function deleteAction() {}
    }, {
      key: "expandAction",
      value: function expandAction() {
        this.showElement('.moreOptions');
        this.hideElement('#expand');
        this.showElement('#collaps');
      }
    }, {
      key: "collapsAction",
      value: function collapsAction() {
        this.hideElement('.moreOptions');
        this.hideElement('#collaps');
        this.showElement('#expand');
      }
    }, {
      key: "hideElement",
      value: function hideElement(selector) {
        this.subForm.querySelector(selector).classList.add('hide');
      }
    }, {
      key: "showElement",
      value: function showElement(selector) {
        this.subForm.querySelector(selector).classList.remove('hide');
      }
    }, {
      key: "persistanceXML",
      value: function persistanceXML() {
        var coords = this.left + ',' + this.top + ',' + this.radius;
        return '<area shape="circle" coords="' + coords + '" ' + this.getAdditionalAttributeXML() + '>' + this.getLink() + '</area>';
      }
    }]);

    return Circle;
  }(fabric.Circle);

  var Polygon =
  /*#__PURE__*/
  function (_fabric$Polygon) {
    _inherits(Polygon, _fabric$Polygon);

    function Polygon(options) {
      var _this3;

      _classCallCheck(this, Polygon);

      _this3 = _possibleConstructorReturn(this, _getPrototypeOf(Polygon).call(this, options));
      _this3.form = null;
      _this3.subForm = null;
      return _this3;
    }

    _createClass(Polygon, [{
      key: "postInitializeForm",
      value: function postInitializeForm() {
        this.setValues();
        this.addEvents();
      }
    }, {
      key: "setValues",
      value: function setValues() {
        this.subForm.querySelector('#link').value = this.link;
        this.subForm.querySelector('#label').value = this.alt;
        this.subForm.querySelector('.colorPreview > div').style.backgroundColor = this.color;
      }
    }, {
      key: "addEvents",
      value: function addEvents() {
        this.subForm.querySelectorAll('.t3js-btn').forEach(function (button) {
          button.addEventListener('click', this[button.id + 'Action'].bind(this));
        }.bind(this));
      }
    }, {
      key: "linkAction",
      value: function linkAction() {// var area = jQuery(this).parents('.areaForm').data('area'); area.getCanvas().openPopup(this, area);
      }
    }, {
      key: "upAction",
      value: function upAction() {}
    }, {
      key: "downAction",
      value: function downAction() {}
    }, {
      key: "undoAction",
      value: function undoAction() {}
    }, {
      key: "redoAction",
      value: function redoAction() {}
    }, {
      key: "deleteAction",
      value: function deleteAction() {}
    }, {
      key: "addAction",
      value: function addAction() {}
    }, {
      key: "expandAction",
      value: function expandAction() {
        this.showElement('.moreOptions');
        this.hideElement('#expand');
        this.showElement('#collaps');
      }
    }, {
      key: "collapsAction",
      value: function collapsAction() {
        this.hideElement('.moreOptions');
        this.hideElement('#collaps');
        this.showElement('#expand');
      }
    }, {
      key: "hideElement",
      value: function hideElement(selector) {
        this.subForm.querySelector(selector).classList.add('hide');
      }
    }, {
      key: "showElement",
      value: function showElement(selector) {
        this.subForm.querySelector(selector).classList.remove('hide');
      }
    }, {
      key: "persistanceXML",
      value: function persistanceXML() {
        return '<area shape="poly" coords="' + this.joinCoords() + '" ' + this.getAdditionalAttributeXML() + ">" + this.getLink() + "</area>";
      }
    }]);

    return Polygon;
  }(fabric.Polygon);

  var AreaForm =
  /*#__PURE__*/
  function () {
    function AreaForm(formElement) {
      _classCallCheck(this, AreaForm);

      this.element = fabric.document.querySelector('#' + formElement);
    }

    _createClass(AreaForm, [{
      key: "getFormElement",
      value: function getFormElement(selector) {
        return new DOMParser().parseFromString(this.element.querySelector(selector).innerHTML, 'text/html').body.firstChild;
      }
    }, {
      key: "addRect",
      value: function addRect(area) {
        area.form = this;
        area.subForm = this.getFormElement('#rectForm');
        this.element.insertBefore(area.subForm, this.element.firstChild);
        area.postInitializeForm();
      }
    }, {
      key: "addCircle",
      value: function addCircle(area) {
        area.form = this;
        area.subForm = this.getFormElement('#circForm');
        this.element.insertBefore(area.subForm, this.element.firstChild);
        area.postInitializeForm();
      }
    }, {
      key: "addPoly",
      value: function addPoly(area) {
        area.form = this;
        area.subForm = this.getFormElement('#polyForm');
        area.coordForm = this.getFormElement('#polyCoords');
        this.element.insertBefore(area.subForm, this.element.firstChild);
        area.postInitializeForm();
      }
    }, {
      key: "openPopup",
      value: function openPopup(link, area) {
        link.blur();
        var data = window.imagemap.browseLink;
        data.objectId = area.getId();
        data.currentValue = area.getLink();
        $.ajax({
          url: TYPO3.settings.ajaxUrls['imagemap_browselink_url'],
          context: area,
          data: data
        }).done(function (response) {
          console.log(response);
          var vHWin = window.open(response.url, '', 'height=600,width=500,status=0,menubar=0,scrollbars=1');
          vHWin.focus();
        });
      }
    }]);

    return AreaForm;
  }();

  var AreaEditor =
  /*#__PURE__*/
  function (_fabric$Canvas) {
    _inherits(AreaEditor, _fabric$Canvas);

    function AreaEditor(canvas, form, options) {
      var _this4;

      _classCallCheck(this, AreaEditor);

      _this4 = _possibleConstructorReturn(this, _getPrototypeOf(AreaEditor).call(this, canvas, options));
      _this4.form = new AreaForm(form);
      return _this4;
    }

    _createClass(AreaEditor, [{
      key: "initializeScaling",
      value: function initializeScaling(scaling) {
        var width = parseInt(scaling) / this.width,
            height = parseInt(scaling) / this.height;
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
        return this.scaleFactor * this.width;
      }
    }, {
      key: "getMaxHeight",
      value: function getMaxHeight() {
        return this.scaleFactor * this.height;
      }
    }, {
      key: "addRect",
      value: function addRect(configuration) {
        var _configuration$coords = configuration.coords.split(','),
            _configuration$coords2 = _slicedToArray(_configuration$coords, 4),
            left = _configuration$coords2[0],
            top = _configuration$coords2[1],
            right = _configuration$coords2[2],
            bottom = _configuration$coords2[3];

        var area = new Rect(_objectSpread({}, configuration, {
          left: parseInt(left),
          top: parseInt(top),
          width: parseInt(right - left),
          height: parseInt(bottom - top),
          borderColor: configuration.color,
          stroke: configuration.color,
          strokeWidth: 1,
          fill: this.hexToRgbA(configuration.color, 0.2)
        }));
        this.form.addRect(area);
        this.add(area);
      }
    }, {
      key: "addCircle",
      value: function addCircle(configuration) {
        var _configuration$coords3 = configuration.coords.split(','),
            _configuration$coords4 = _slicedToArray(_configuration$coords3, 3),
            left = _configuration$coords4[0],
            top = _configuration$coords4[1],
            radius = _configuration$coords4[2];

        var area = new Circle(_objectSpread({}, configuration, {
          left: parseInt(left),
          top: parseInt(top),
          radius: parseInt(radius),
          borderColor: configuration.color,
          stroke: configuration.color,
          strokeWidth: 1,
          fill: this.hexToRgbA(configuration.color, 0.2)
        }));
        this.form.addCircle(area);
        this.add(area);
      }
    }, {
      key: "addPoly",
      value: function addPoly(configuration) {
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

        var area = new Polygon(points, _objectSpread({}, configuration, {
          top: top,
          left: left,
          borderColor: configuration.color,
          stroke: configuration.color,
          strokeWidth: 1,
          fill: this.hexToRgbA(configuration.color, 0.2)
        }));
        this.form.addPoly(area);
        this.add(area);
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
      key: "mousedown",
      value: function mousedown(event) {
        console.log(event);
      }
    }, {
      key: "mouseup",
      value: function mouseup(event) {
        console.log(event);
      }
    }, {
      key: "mousemove",
      value: function mousemove(event) {
        console.log(event);
      }
    }, {
      key: "dblclick",
      value: function dblclick(event) {
        console.log(event);
      }
    }]);

    return AreaEditor;
  }(fabric.Canvas);

  imagemap.AreaEditor = AreaEditor;
  return imagemap;
});
//# sourceMappingURL=Imagemap.js.map
