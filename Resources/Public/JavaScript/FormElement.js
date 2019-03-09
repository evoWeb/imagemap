function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['jquery', './AreaEditor'], function ($, AreaEditor) {
  'use strict';

  var FormElement =
  /*#__PURE__*/
  function () {
    /**
     * @type {jQuery}
     */

    /**
     * @type {jQuery}
     */

    /**
     * @type {jQuery}
     */

    /**
     * @type {object}
     */

    /**
     * @type {AreaEditor}
     */
    function FormElement() {
      _classCallCheck(this, FormElement);

      _defineProperty(this, "control", null);

      _defineProperty(this, "image", null);

      _defineProperty(this, "canvas", null);

      _defineProperty(this, "editorOptions", {});

      _defineProperty(this, "areaEditor", null);

      this.control = $('.imagemap-control:eq(0)');
      this.image = this.control.find('.image img');
      this.canvas = this.control.find('.picture');
      this.initialize();
    }

    _createClass(FormElement, [{
      key: "initialize",
      value: function initialize() {
        this.editorOptions = {
          canvas: {
            width: parseInt(this.image.css('width')),
            height: parseInt(this.image.css('height')),
            top: parseInt(this.image.css('height')) * -1
          },
          previewRerenderAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_preview_rerender
        };
        this.initializeAreaEditor(this.editorOptions);
        this.initializeEvents(this.editorOptions);
        this.initializeScaleFactor(this.canvas.data('thumbnail-scale'));
        this.initializeAreas(this.canvas.data('existing-areas'));
      }
    }, {
      key: "initializeAreaEditor",
      value: function initializeAreaEditor(editorOptions) {
        this.areaEditor = new AreaEditor(editorOptions, this.control.find('#canvas')[0], '', window.document);
      }
    }, {
      key: "initializeScaleFactor",
      value: function initializeScaleFactor(scaleFactor) {
        this.areaEditor.setScale(scaleFactor);
      }
    }, {
      key: "initializeEvents",
      value: function initializeEvents() {
        this.control.find('input[type=hidden]').on('imagemap:changed', this.imagemapChangedHandler.bind(this));
      }
    }, {
      key: "initializeAreas",
      value: function initializeAreas(areas) {
        this.areaEditor.initializeAreas(areas);
      }
    }, {
      key: "imagemapChangedHandler",
      value: function imagemapChangedHandler(event) {
        var _this = this;

        var $field = $(event.currentTarget);
        $.ajax({
          url: this.editorOptions.previewRerenderAjaxUrl,
          method: 'POST',
          data: {
            P: {
              itemFormElName: $field.attr('name'),
              tableName: 'tt_content',
              fieldName: 'tx_imagemap_links',
              uid: $field.attr('name').replace('data[tt_content][', '').replace('][tx_imagemap_links]', ''),
              value: $field.val()
            }
          }
        }).done(function (data, textStatus) {
          if (textStatus === 'success') {
            _this.areaEditor.removeAllAreas();

            _this.areaEditor.initializeAreas(data);
          }
        });
      }
    }]);

    return FormElement;
  }();

  return FormElement;
});
//# sourceMappingURL=FormElement.js.map
