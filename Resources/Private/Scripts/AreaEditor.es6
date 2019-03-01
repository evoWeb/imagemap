define(['jquery', 'TYPO3/CMS/Imagemap/Fabric'], ($, fabric) => {
	let Aggregation = (baseClass, ...mixins) => {
		class base extends baseClass {
			constructor (...args) {
				super(...args);
				mixins.forEach((mixin) => {
					copyProperties(this, (new mixin));
				});
			}
		}

		// this function copies all properties and symbols, filtering out some special ones
		let copyProperties = (target, source) => {
			Object.getOwnPropertyNames(source)
				.concat(Object.getOwnPropertySymbols(source))
				.forEach((property) => {
					if (!property.match(
						/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/
					)) {
						Object.defineProperty(target, property, Object.getOwnPropertyDescriptor(source, property));
					}
				})
		};

		// outside constructor() to allow Aggregation(a, b, c).staticFunction() to be called etc.
		mixins.forEach((mixin) => {
			copyProperties(base.prototype, mixin.prototype);
			copyProperties(base, mixin);
		});

		return base;
	};

	class AreaFormElement {
		/**
		 * @type {string}
		 */
		shape = '';

		/**
		 * @type {Object}
		 */
		htmlElements = {
			subForm: '',
			coordForm: ''
		};

		/**
		 * @type {HTMLElement}
		 */
		subForm = null;

		/**
		 * @type {HTMLElement}
		 */
		coordForm = null;

		/**
		 * @type {AreaForm}
		 */
		editorForm = null;

		/**
		 * @type {string[]}
		 */
		colors = [
			'990033', 'ff3366', 'cc0033', 'ff0033', 'ff9999', 'cc3366', 'ffccff', 'cc6699', '993366', '660033',
			'cc3399', 'ff99cc', 'ff66cc', 'ff99ff', 'ff6699', 'cc0066', 'ff0066', 'ff3399', 'ff0099', 'ff33cc',
			'ff00cc', 'ff66ff', 'ff33ff', 'ff00ff', 'cc0099', '990066', 'cc66cc', 'cc33cc', 'cc99ff', 'cc66ff',
			'cc33ff', '993399', 'cc00cc', 'cc00ff', '9900cc', '990099', 'cc99cc', '996699', '663366', '660099',
			'9933cc', '660066', '9900ff', '9933ff', '9966cc', '330033', '663399', '6633cc', '6600cc', '9966ff',
			'330066', '6600ff', '6633ff', 'ccccff', '9999ff', '9999cc', '6666cc', '6666ff', '666699', '333366',
			'333399', '330099', '3300cc', '3300ff', '3333ff', '3333cc', '0066ff', '0033ff', '3366ff', '3366cc',
			'000066', '000033', '0000ff', '000099', '0033cc', '0000cc', '336699', '0066cc', '99ccff', '6699ff',
			'003366', '6699cc', '006699', '3399cc', '0099cc', '66ccff', '3399ff', '003399', '0099ff', '33ccff',
			'00ccff', '99ffff', '66ffff', '33ffff', '00ffff', '00cccc', '009999', '669999', '99cccc', 'ccffff',
			'33cccc', '66cccc', '339999', '336666', '006666', '003333', '00ffcc', '33ffcc', '33cc99', '00cc99',
			'66ffcc', '99ffcc', '00ff99', '339966', '006633', '336633', '669966', '66cc66', '99ff99', '66ff66',
			'339933', '99cc99', '66ff99', '33ff99', '33cc66', '00cc66', '66cc99', '009966', '009933', '33ff66',
			'00ff66', 'ccffcc', 'ccff99', '99ff66', '99ff33', '00ff33', '33ff33', '00cc33', '33cc33', '66ff33',
			'00ff00', '66cc33', '006600', '003300', '009900', '33ff00', '66ff00', '99ff00', '66cc00', '00cc00',
			'33cc00', '339900', '99cc66', '669933', '99cc33', '336600', '669900', '99cc00', 'ccff66', 'ccff33',
			'ccff00', '999900', 'cccc00', 'cccc33', '333300', '666600', '999933', 'cccc66', '666633', '999966',
			'cccc99', 'ffffcc', 'ffff99', 'ffff66', 'ffff33', 'ffff00', 'ffcc00', 'ffcc66', 'ffcc33', 'cc9933',
			'996600', 'cc9900', 'ff9900', 'cc6600', '993300', 'cc6633', '663300', 'ff9966', 'ff6633', 'ff9933',
			'ff6600', 'cc3300', '996633', '330000', '663333', '996666', 'cc9999', '993333', 'cc6666', 'ffcccc',
			'ff3333', 'cc3333', 'ff6666', '660000', '990000', 'cc0000', 'ff0000', 'ff3300', 'cc9966', 'ffcc99',
			'ffffff', 'cccccc', '999999', '666666', '333333', '000000'
		];

		/**
		 * @type {string[]}
		 */
		ignoreAttributes = [
			'link',
		];

		postAddToForm() {
			this.id = fabric.Object.__uid++;

			this.initializeValues();
			this.initializeButtons();
			this.initializeColorPicker();
		}

		initializeHtmlElements() {
			for (key of Object.keys(this.htmlElements)) {
				this[key] = this.getFormElement(this.htmlElements[key]);
			}
		}

		initializeValues() {
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
						field.value = this[field.id] ? this[field.id] : '';
						break;
				}
			}.bind(this));
		}

		initializeButtons() {
			this.getElements('.t3js-btn').forEach(function (button) {
				button.addEventListener('click', this[button.id + 'Action'].bind(this));
			}.bind(this));
		}

		initializeColorPicker() {
			let colorPicker = this.getElement('#colorPicker');

			this.colors.forEach((color) => {
				let cell = document.createElement('div');
				cell.id = color;
				cell.style.backgroundColor = '#' + color;
				cell.classList.add('colorPickerCell');
				cell.addEventListener('click', this.colorPickerAction.bind(this));

				colorPicker.appendChild(cell);
			});
		}

		linkAction(event) {
			this.editorForm.openPopup(event.currentTarget, this);
		}

		upAction() {
		}

		downAction() {
		}

		deleteAction() {
			this.editorForm.deleteArea(this);
			this.subForm.remove();
			if (this.coordForm) {
				this.coordForm.remove();
			}
			delete this;
		}

		expandAction() {
			this.showElement('.moreOptions');
			this.hideElement('#expand');
			this.showElement('#collapse');
		}

		collapseAction() {
			this.hideElement('.moreOptions');
			this.hideElement('#collapse');
			this.showElement('#expand');
		}

		colorPickerAction(event) {
			let color = event.currentTarget.style.backgroundColor;
			this.getElement('#color').style.backgroundColor = color;
			this.set('borderColor', color);
			this.set('stroke', color);
			this.set('fill', AreaEditor.hexToRgbA(AreaEditor.rgbAToHex(color), 0.2));
			this.editorForm.editor.canvas.renderAll();
		}

		getFormElement(selector) {
			let template = this.editorForm.element.querySelector(selector).innerHTML;
			template.replace(/_ID/g, this.id);
			return new DOMParser().parseFromString(template, 'text/html').body.firstChild;
		}

		getElement(selector) {
			return this.subForm.querySelector(selector);
		}

		getElements(selector) {
			return this.subForm.querySelectorAll(selector);
		}

		hideElement(selector) {
			this.getElement(selector).classList.add('hide');
		}

		showElement(selector) {
			this.getElement(selector).classList.remove('hide');
		}

		toAreaXml() {
			return [
				'<area shape="' + this.shape + '"',
				' coords="' + this.getAreaCoords() + '"',
				this.getAdditionalAttributes() + '>',
				this.getLink(),
				'</area>'
			].join('');
		}

		getAreaCoords() {
		}

		getAdditionalAttributes() {
			let result = [];

			this.getElements('.t3js-field').forEach((field) => {
				if (this.ignoreAttributes.indexOf(field.id) < 0) {
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

		getLink() {
			return this.getElement('#link').value;
		}
	}

	class Rect extends Aggregation(fabric.Rect, AreaFormElement) {
		shape = 'rect';

		htmlElements = {
			subForm: '#rectForm'
		};

		ignoreAttributes = [
			'link',
			'left',
			'top',
			'right',
			'bottom'
		];

		undoAction() {
		}

		redoAction() {
		}

		getAreaCoords() {
			return [this.left, this.top, (this.left + this.width), (this.height + this.top)].join(',');
		}
	}

	class Circle extends Aggregation(fabric.Circle, AreaFormElement) {
		shape = 'circle';

		htmlElements = {
			subForm: '#circForm'
		};

		ignoreAttributes = [
			'link',
			'left',
			'top',
			'radius'
		];

		undoAction() {
		}

		redoAction() {
		}

		getAreaCoords() {
			let coords = this.getCoords(),
				left = coords[0].x + this.radius,
				top = coords[0].y + this.radius;
			return left + ',' + top + ',' + this.radius;
		}
	}

	class Polygon extends Aggregation(fabric.Polygon, AreaFormElement) {
		shape = 'poly';

		htmlElements = {
			subForm: '#polyForm',
			coordForm: '#polyCoords'
		};

		ignoreAttributes = [
			'link',
			'left',
			'top'
		];

		initializeValues() {
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
						field.value = this[field.id] ? this[field.id] : '';
						break;
				}
			}.bind(this));

			// points
		}

		undoAction() {
		}

		redoAction() {
		}

		addBeforeAction() {
		}

		addAfterAction() {
		}

		removeAction() {
		}

		getAreaCoords() {

		}

		getAdditionalAttributes() {
			let result = [];

			this.getElements('.t3js-field').forEach((field) => {
				if (this.ignoreAttributes.indexOf(field.id) < 0
						|| field.id.indexOf('x') !== 0
						|| field.id.indexOf('y') !== 0) {
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
	}

	class AreaForm {
		/**
		 * @type {Array}
		 */
		areas = [];

		constructor(formElement, editor) {
			this.element = fabric.document.querySelector(formElement);
			this.editor = editor;
		}

		addArea(area) {
			area.editorForm = this;
			area.initializeHtmlElements();

			this.areas.push(area);
			this.element.insertBefore(area.subForm, this.element.firstChild);

			area.postAddToForm();
		}

		deleteArea(area) {
			let areas = [];
			this.areas.forEach((currentArea) => {
				if (area !== currentArea) {
					areas.push(currentArea);
				}
			});
			this.areas = areas;
			this.editor.deleteArea(area);
		}

		openPopup(link, area) {
			link.blur();

			let data = window.imagemap.browseLink;
			data.objectId = area.id;
			data.currentValue = area.getLink();

			$.ajax({
				url: TYPO3.settings.ajaxUrls['imagemap_browselink_url'],
				context: area,
				data: data
			}).done(function (response) {
				let vHWin = window.open(
					response.url,
					'',
					'height=600,width=500,status=0,menubar=0,scrollbars=1'
				);
				vHWin.focus()
			});
		}

		toAreaXml() {
			let xml = ['<map>'];
			this.areas.forEach((area) => {
				xml.push(area.toAreaXml());
			});
			xml.push('</map>');
			return xml.join("\n");
		}
	}

	class AreaEditor {
		constructor(canvas, form, options) {
			this.preview = false;
			this.initializeOptions(options);

			this.canvas = new fabric.Canvas(canvas, options.canvas);
			if (!this.preview) {
				this.editorForm = new AreaForm(form, this);
			}
		}

		initializeOptions(options) {
			for (let option in options) {
				if (options.hasOwnProperty(option)) {
					this[option] = options[option];
				}
			}
		}

		initializeScaling(scaling) {
			let width = parseInt(scaling) / this.canvas.width,
				height = parseInt(scaling) / this.canvas.height;
			return (width > height) ? height : width;
		}
		setScale(scaling) {
			this.scaleFactor = scaling > 1 ? 1 : scaling;
		}
		getMaxWidth() {
			return this.scaleFactor * this.canvas.width;
		}
		getMaxHeight() {
			return this.scaleFactor * this.canvas.height;
		}

		addRect(configuration) {
			let [left, top, right, bottom] = configuration.coords.split(','),
				area = new Rect({
					...configuration,
					hasRotatingPoint: false,
					left: parseInt(left),
					top: parseInt(top),
					width: right - left,
					height: bottom - top,
					borderColor: configuration.color,
					stroke: configuration.color,
					strokeWidth: 1,
					fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.001 : 0.2)
				});

			this.canvas.add(area);
			if (this.editorForm) {
				this.editorForm.addArea(area);
			}
		}

		addCircle(configuration) {
			let [left, top, radius] = configuration.coords.split(','),
				area = new Circle({
					...configuration,
					hasRotatingPoint: false,
					left: left - radius,
					top: top - radius,
					radius: parseInt(radius),
					borderColor: configuration.color,
					stroke: configuration.color,
					strokeWidth: 1,
					fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.001 : 0.2)
				});

			this.canvas.add(area);
			if (this.editorForm) {
				this.editorForm.addArea(area);
			}
		}

		addPoly(configuration) {
			let coordsXY = configuration.coords.split(','),
				left = 100000,
				top = 100000,
				i = 0,
				points = [];

			if (coordsXY.length % 2) {
				throw new Error('Bad coords count');
			}

			for (; i < coordsXY.length; i = i + 2) {
				let xy = {x: parseInt(coordsXY[i]), y: parseInt(coordsXY[i + 1])};
				points.push(xy);

				left = Math.min(left, xy.x);
				top = Math.min(top, xy.y);
			}

			let area = new Polygon(points, {
				...configuration,
				hasRotatingPoint: false,
				top: top,
				left: left,
				borderColor: configuration.color,
				stroke: configuration.color,
				strokeWidth: 1,
				fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.001 : 0.2)
			});

			this.canvas.add(area);
			if (this.editorForm) {
				this.editorForm.addArea(area);
			}
		}

		static hexToRgbA(hex, alpha) {
			let chars, r, g, b, result;
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

		static rgbAToHex(rgba) {
			let numbers = rgba.replace(/[^0-9,]*/g, '').split(',');

			if (numbers.length < 3) {
				throw new Error('Bad rgba');
			}

			let rgb = numbers[2] | (numbers[1] << 8) | (numbers[0] << 16);
			return '#' + (0x1000000 + rgb).toString(16).slice(1).toUpperCase();
		}

		deleteArea(area) {
			this.canvas.remove(area);
		}

		toAreaXml() {
			return this.editorForm.toAreaXml();
		}
	}

	return AreaEditor;
});
