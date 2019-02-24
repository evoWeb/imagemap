function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

    function Rect() {
      _classCallCheck(this, Rect);

      return _possibleConstructorReturn(this, _getPrototypeOf(Rect).apply(this, arguments));
    }

    return Rect;
  }(fabric.Rect);

  imagemap.Rect = Rect;

  var AreaEditor =
  /*#__PURE__*/
  function (_fabric$Canvas) {
    _inherits(AreaEditor, _fabric$Canvas);

    function AreaEditor(canvas, picture, form) {
      _classCallCheck(this, AreaEditor);

      return _possibleConstructorReturn(this, _getPrototypeOf(AreaEditor).call(this, canvas, picture, form));
    }

    _createClass(AreaEditor, [{
      key: "initializeScaling",
      value: function initializeScaling(scaling) {
        var width = parseInt(scaling) / this.imageOrigW,
            height = parseInt(scaling) / this.imageOrigH;
        return width > height ? height : width;
      }
    }, {
      key: "setScale",
      value: function setScale(scaling) {
        this.scaleFactor = scaling > 1 ? 1 : scaling;
        jQuery(this.pictureId + " > #image > img").width(this.getMaxW());
        jQuery(this.pictureId + " > #image > img").height(this.getMaxH());
        jQuery(this.pictureId).width(this.getMaxW());
        jQuery(this.pictureId).height(this.getMaxH());
        var that = this;
        jQuery.each(this.areaObjectList, function (d, c) {
          that.areaObjects[c].setScale(that.scaleFactor);
          that.updateCanvas(c);
        });
        jQuery(this.canvasId).width(this.getMaxW()).height(this.getMaxH());
      }
    }, {
      key: "getMaxW",
      value: function getMaxW() {
        return this.scaleFactor * this.imageOrigW;
      }
    }, {
      key: "getMaxH",
      value: function getMaxH() {
        return this.scaleFactor * this.imageOrigH;
      }
    }, {
      key: "persistanceXML",
      value: function persistanceXML() {
        return '';
      }
    }, {
      key: "mousedown",
      value: function mousedown() {
        console.log();
      }
    }, {
      key: "mouseup",
      value: function mouseup() {
        console.log();
      }
    }, {
      key: "mousemove",
      value: function mousemove() {
        console.log();
      }
    }, {
      key: "dblclick",
      value: function dblclick() {
        console.log();
      }
    }]);

    return AreaEditor;
  }(fabric.Canvas);

  imagemap.AreaEditor = AreaEditor;
  return imagemap;
});
//# sourceMappingURL=Imagemap.js.map
