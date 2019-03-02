function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

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
      Object.getOwnPropertyNames(source).concat(Object.getOwnPropertySymbols(source)).forEach(function (property) {
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
  function () {
    function AreaFormElement() {
      _classCallCheck(this, AreaFormElement);

      _defineProperty(this, "shape", '');

      _defineProperty(this, "element", null);

      _defineProperty(this, "form", null);

      _defineProperty(this, "colors", ['990033', 'ff3366', 'cc0033', 'ff0033', 'ff9999', 'cc3366', 'ffccff', 'cc6699', '993366', '660033', 'cc3399', 'ff99cc', 'ff66cc', 'ff99ff', 'ff6699', 'cc0066', 'ff0066', 'ff3399', 'ff0099', 'ff33cc', 'ff00cc', 'ff66ff', 'ff33ff', 'ff00ff', 'cc0099', '990066', 'cc66cc', 'cc33cc', 'cc99ff', 'cc66ff', 'cc33ff', '993399', 'cc00cc', 'cc00ff', '9900cc', '990099', 'cc99cc', '996699', '663366', '660099', '9933cc', '660066', '9900ff', '9933ff', '9966cc', '330033', '663399', '6633cc', '6600cc', '9966ff', '330066', '6600ff', '6633ff', 'ccccff', '9999ff', '9999cc', '6666cc', '6666ff', '666699', '333366', '333399', '330099', '3300cc', '3300ff', '3333ff', '3333cc', '0066ff', '0033ff', '3366ff', '3366cc', '000066', '000033', '0000ff', '000099', '0033cc', '0000cc', '336699', '0066cc', '99ccff', '6699ff', '003366', '6699cc', '006699', '3399cc', '0099cc', '66ccff', '3399ff', '003399', '0099ff', '33ccff', '00ccff', '99ffff', '66ffff', '33ffff', '00ffff', '00cccc', '009999', '669999', '99cccc', 'ccffff', '33cccc', '66cccc', '339999', '336666', '006666', '003333', '00ffcc', '33ffcc', '33cc99', '00cc99', '66ffcc', '99ffcc', '00ff99', '339966', '006633', '336633', '669966', '66cc66', '99ff99', '66ff66', '339933', '99cc99', '66ff99', '33ff99', '33cc66', '00cc66', '66cc99', '009966', '009933', '33ff66', '00ff66', 'ccffcc', 'ccff99', '99ff66', '99ff33', '00ff33', '33ff33', '00cc33', '33cc33', '66ff33', '00ff00', '66cc33', '006600', '003300', '009900', '33ff00', '66ff00', '99ff00', '66cc00', '00cc00', '33cc00', '339900', '99cc66', '669933', '99cc33', '336600', '669900', '99cc00', 'ccff66', 'ccff33', 'ccff00', '999900', 'cccc00', 'cccc33', '333300', '666600', '999933', 'cccc66', '666633', '999966', 'cccc99', 'ffffcc', 'ffff99', 'ffff66', 'ffff33', 'ffff00', 'ffcc00', 'ffcc66', 'ffcc33', 'cc9933', '996600', 'cc9900', 'ff9900', 'cc6600', '993300', 'cc6633', '663300', 'ff9966', 'ff6633', 'ff9933', 'ff6600', 'cc3300', '996633', '330000', '663333', '996666', 'cc9999', '993333', 'cc6666', 'ffcccc', 'ff3333', 'cc3333', 'ff6666', '660000', '990000', 'cc0000', 'ff0000', 'ff3300', 'cc9966', 'ffcc99', 'ffffff', 'cccccc', '999999', '666666', '333333', '000000']);
    }

    _createClass(AreaFormElement, [{
      key: "postAddToForm",
      value: function postAddToForm() {
        this.id = fabric.Object.__uid++;
        this.initializeElement();
        this.initializeValues();
        this.initializeButtons();
        this.initializeColorPicker();
      }
    }, {
      key: "initializeElement",
      value: function initializeElement() {
        this.element = this.getFormElement('#' + this.shape + 'Form');
        this.form.areaZone.insertBefore(this.element, this.form.areaZone.firstChild);
        this.form.initializeArrows();
      }
    }, {
      key: "initializeValues",
      value: function initializeValues() {
        this.getElements('.t3js-field').forEach(function (field) {
          switch (field.id) {
            case 'color':
              field.style.backgroundColor = this.color;
              break;

            case 'right':
              field.value = this.width + this.left;
              break;

            case 'bottom':
              field.value = this.height + this.top;
              break;

            default:
              field.value = this.hasOwnProperty(field.id) && this[field.id] ? this[field.id] : this.hasOwnProperty('attributes') && this['attributes'].hasOwnProperty(field.id) && this['attributes'][field.id] ? this['attributes'][field.id] : '';
              break;
          }
        }.bind(this));
      }
    }, {
      key: "initializeButtons",
      value: function initializeButtons() {
        this.getElements('.t3js-btn').forEach(function (button) {
          button.addEventListener('click', this[button.id + 'Action'].bind(this));
        }.bind(this));
      }
    }, {
      key: "initializeColorPicker",
      value: function initializeColorPicker() {
        var _this2 = this;

        var colorPicker = this.getElement('#colorPicker');
        this.colors.forEach(function (color) {
          var cell = document.createElement('div');
          cell.id = color;
          cell.style.backgroundColor = '#' + color;
          cell.classList.add('colorPickerCell');
          cell.addEventListener('click', _this2.colorPickerAction.bind(_this2));
          colorPicker.appendChild(cell);
        });
      }
    }, {
      key: "initializeArrows",
      value: function initializeArrows() {
        var areaZone = this.form.areaZone;
        this.getElement('#up').classList[areaZone.firstChild !== this.element ? 'remove' : 'add']('disabled');
        this.getElement('#down').classList[areaZone.lastChild !== this.element ? 'remove' : 'add']('disabled');
      }
    }, {
      key: "linkAction",
      value: function linkAction(event) {
        this.form.openPopup(event.currentTarget, this);
      }
    }, {
      key: "upAction",
      value: function upAction() {}
    }, {
      key: "downAction",
      value: function downAction() {}
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
        return ['<area shape="' + this.shape + '"', ' coords="' + this.getAreaCoords() + '"', this.getAdditionalAttributes() + '>', this.getLink(), '</area>'].join('');
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
        return this.getElement('#link').value;
      }
    }]);

    return AreaFormElement;
  }();

  var Rect =
  /*#__PURE__*/
  function (_Aggregation) {
    _inherits(Rect, _Aggregation);

    function Rect() {
      var _getPrototypeOf3;

      var _this3;

      _classCallCheck(this, Rect);

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      _this3 = _possibleConstructorReturn(this, (_getPrototypeOf3 = _getPrototypeOf(Rect)).call.apply(_getPrototypeOf3, [this].concat(args)));

      _defineProperty(_assertThisInitialized(_this3), "shape", 'rect');

      return _this3;
    }

    _createClass(Rect, [{
      key: "undoAction",
      value: function undoAction() {}
    }, {
      key: "redoAction",
      value: function redoAction() {}
    }, {
      key: "getAreaCoords",
      value: function getAreaCoords() {
        return [this.left, this.top, this.left + this.width, this.height + this.top].join(',');
      }
    }]);

    return Rect;
  }(Aggregation(fabric.Rect, AreaFormElement));

  var Circle =
  /*#__PURE__*/
  function (_Aggregation2) {
    _inherits(Circle, _Aggregation2);

    function Circle() {
      var _getPrototypeOf4;

      var _this4;

      _classCallCheck(this, Circle);

      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      _this4 = _possibleConstructorReturn(this, (_getPrototypeOf4 = _getPrototypeOf(Circle)).call.apply(_getPrototypeOf4, [this].concat(args)));

      _defineProperty(_assertThisInitialized(_this4), "shape", 'circle');

      return _this4;
    }

    _createClass(Circle, [{
      key: "undoAction",
      value: function undoAction() {}
    }, {
      key: "redoAction",
      value: function redoAction() {}
    }, {
      key: "getAreaCoords",
      value: function getAreaCoords() {
        var coords = this.getCoords(),
            left = coords[0].x + this.radius,
            top = coords[0].y + this.radius;
        return left + ',' + top + ',' + this.radius;
      }
    }]);

    return Circle;
  }(Aggregation(fabric.Circle, AreaFormElement));

  var Poly =
  /*#__PURE__*/
  function (_Aggregation3) {
    _inherits(Poly, _Aggregation3);

    function Poly() {
      var _getPrototypeOf5;

      var _this5;

      _classCallCheck(this, Poly);

      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      _this5 = _possibleConstructorReturn(this, (_getPrototypeOf5 = _getPrototypeOf(Poly)).call.apply(_getPrototypeOf5, [this].concat(args)));

      _defineProperty(_assertThisInitialized(_this5), "shape", 'poly');

      return _this5;
    }

    _createClass(Poly, [{
      key: "undoAction",
      value: function undoAction() {}
    }, {
      key: "redoAction",
      value: function redoAction() {}
    }, {
      key: "getAreaCoords",
      value: function getAreaCoords() {}
    }, {
      key: "initializeValues",
      value: function initializeValues() {
        var _this6 = this;

        _get(_getPrototypeOf(Poly.prototype), "initializeValues", this).call(this);

        this.points.forEach(function (point, index) {
          var element = _this6.getFormElement('#polyCoords', _this6.id + '_' + index);

          element.querySelector('#x' + _this6.id + '_' + index).value = point.x;
          element.querySelector('#y' + _this6.id + '_' + index).value = point.y;

          _this6.append(element);
        });
      }
    }, {
      key: "addBeforeAction",
      value: function addBeforeAction() {}
    }, {
      key: "addAfterAction",
      value: function addAfterAction() {}
    }, {
      key: "removeAction",
      value: function removeAction(event) {
        console.log(event.currentTarget);
      }
    }, {
      key: "prepend",
      value: function prepend(element) {
        var positionOptions = this.getElement('.positionOptions');
        positionOptions.insertBefore(element, positionOptions.firstChild);
      }
    }, {
      key: "append",
      value: function append(element) {
        var positionOptions = this.getElement('.positionOptions');
        positionOptions.insertBefore(element, positionOptions.lastChild);
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
      key: "openPopup",
      value: function openPopup(link, area) {
        link.blur();
        var data = window.imagemap.browseLink;
        data.objectId = area.id;
        data.currentValue = area.getLink();
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
      this.canvas = new fabric.Canvas(canvas, options.canvas);

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
          hasControls: !this.preview,
          top: top,
          left: left,
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
