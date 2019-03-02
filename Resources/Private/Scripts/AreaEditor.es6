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
		 * @type {ChildNode|HTMLElement}
		 */
		element = null;

		/**
		 * @type {AreaForm}
		 */
		form = null;

		postAddToForm() {
			this.id = fabric.Object.__uid++;

			this.initializeElement();
			this.initializeValues();
			this.initializeButtons();
			this.initializeColorPicker();
		}

		initializeElement() {
			this.element = this.getFormElement('#' + this.shape + 'Form');
			this.form.areaZone.insertBefore(this.element, this.form.areaZone.firstChild);
			this.form.initializeArrows();
		}

		initializeValues() {
			let that = this;
			this.getElements('.t3js-field').forEach(function (field) {
				switch (field.id) {
					case 'color':
						field.style.backgroundColor = that.color;
						break;
					case 'right':
						field.value = that.width + that.left;
						break;
					case 'bottom':
						field.value = that.height + that.top;
						break;
					default:
						field.value =
							that.hasOwnProperty(field.id) && that[field.id] ?
							that[field.id] :
							(
								that.hasOwnProperty('attributes') && that['attributes'].hasOwnProperty(field.id) && this['attributes'][field.id] ?
								that['attributes'][field.id] :
								''
							);
						break;
				}
			});
		}

		initializeButtons() {
			this.getElements('.t3js-btn').forEach(function (button) {
				button.addEventListener('click', this[button.id + 'Action'].bind(this));
			}.bind(this));
		}

		initializeColorPicker() {
			let colorPicker = this.getElement('#colorPicker'),
				values = ['00', '33', '66', '99', 'CC', 'FF'];

			for (let b = 0; b < 6; b++) {
				for (let g = 0; g < 6; g++) {
					for (let r = 0; r < 6; r++) {
						let color = values[b] + values[g] + values[r],
							cell = document.createElement('div');
						cell.id = color;
						cell.style.backgroundColor = '#' + color;
						cell.classList.add('colorPickerCell');
						cell.addEventListener('click', this.colorPickerAction.bind(this));

						colorPicker.appendChild(cell);
					}
				}
			}
		}

		initializeArrows() {
			let areaZone = this.form.areaZone;
			this.getElement('#up').classList[areaZone.firstChild !== this.element ? 'remove' : 'add']('disabled');
			this.getElement('#down').classList[areaZone.lastChild !== this.element ? 'remove' : 'add']('disabled');
		}

		linkAction(event) {
			this.form.openPopup(event.currentTarget, this);
		}

		upAction() {
		}

		downAction() {
		}

		deleteAction() {
			this.form.deleteArea(this);
			this.element.remove();
			this.form.initializeArrows();
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
			this.form.editor.canvas.renderAll();
		}

		getFormElement(selector, id) {
			let template = this.form.element.querySelector(selector)
				.innerHTML.replace(new RegExp('_ID', 'g'), id ? id : this.id);
			return new DOMParser().parseFromString(template, 'text/html').body.firstChild;
		}

		getElement(selector) {
			return this.element.querySelector(selector);
		}

		getElements(selector) {
			return this.element.querySelectorAll(selector);
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

		getLink() {
			return this.getElement('#link').value;
		}
	}

	class Rect extends Aggregation(fabric.Rect, AreaFormElement) {
		shape = 'rect';

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

	class Poly extends Aggregation(fabric.Polygon, AreaFormElement) {
		shape = 'poly';

		undoAction() {
		}

		redoAction() {
		}

		getAreaCoords() {

		}


		initializeValues() {
			super.initializeValues();
			this.points.forEach((point, index) => {
				point.id = this.id + '_' + index;
				let element = this.getFormElement('#polyCoords', point.id);
				element.querySelector('#x' + point.id).value = point.x;
				element.querySelector('#y' + point.id).value = point.y;
				this.append(element);
			});
		}

		addBeforeAction() {
		}

		addAfterAction() {
		}

		removeAction(event) {
			let element = event.currentTarget.parentNode.parentNode,
			points = [];
			this.points.forEach((point) => {
				if (element.id !== point.id) {
					points.push(point);
				}
			});
			element.remove();
			this.points = points;
			this.form.editor.canvas.renderAll();
		}

		prepend(element) {
			let positionOptions = this.getElement('.positionOptions');
			positionOptions.insertBefore(element, positionOptions.firstChild);
		}

		append(element) {
			let positionOptions = this.getElement('.positionOptions');
			positionOptions.insertBefore(element, positionOptions.lastChild);
		}
	}

	class AreaForm {
		/**
		 * @type {Array}
		 */
		areas = [];

		/**
		 * @type {HTMLElement}
		 */
		areaZone = null;

		constructor(formElement, editor) {
			this.element = fabric.document.querySelector(formElement);
			this.areaZone = this.element.querySelector('#areaZone');
			this.editor = editor;
		}

		initializeArrows() {
			this.areas.forEach((area) => {
				area.initializeArrows();
			});
		}

		addArea(area) {
			this.areas.push(area);
			area.form = this;
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
		areaConfig = {
			cornerColor: '#eee',
			cornerStrokeColor: '#bbb',
			cornerSize: 10,
			cornerStyle: 'circle',
			hasBorders: false,
			hasRotatingPoint: false,
			transparentCorners: false
		};

		preview = false;

		constructor(canvas, form, options) {
			this.initializeOptions(options);

			this.canvas = new fabric.Canvas(canvas, options.canvas);
			if (!this.preview) {
				this.form = new AreaForm(form, this);
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
			configuration.color = AreaEditor.getRandomColor(configuration.color);
			let [left, top, right, bottom] = configuration.coords.split(','),
				area = new Rect({
					...configuration,
					...this.areaConfig,
					hasControls: !this.preview,
					left: parseInt(left),
					top: parseInt(top),
					width: right - left,
					height: bottom - top,
					stroke: configuration.color,
					strokeWidth: 1,
					fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.001 : 0.2)
				});

			this.canvas.add(area);
			if (this.form) {
				this.form.addArea(area);
			}
		}

		addCircle(configuration) {
			configuration.color = AreaEditor.getRandomColor(configuration.color);
			let [left, top, radius] = configuration.coords.split(','),
				area = new Circle({
					...configuration,
					...this.areaConfig,
					hasControls: !this.preview,
					left: left - radius,
					top: top - radius,
					radius: parseInt(radius),
					stroke: configuration.color,
					strokeWidth: 1,
					fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.001 : 0.2)
				});

			area.setControlVisible('ml', false);
			area.setControlVisible('mt', false);
			area.setControlVisible('mr', false);
			area.setControlVisible('mb', false);

			this.canvas.add(area);
			if (this.form) {
				this.form.addArea(area);
			}
		}

		addPoly(configuration) {
			configuration.color = AreaEditor.getRandomColor(configuration.color);
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

			let area = new Poly(points, {
				...configuration,
				...this.areaConfig,
				hasControls: !this.preview,
				top: top,
				left: left,
				stroke: configuration.color,
				strokeWidth: 1,
				fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.001 : 0.2)
			});

			this.canvas.add(area);
			if (this.form) {
				this.form.addArea(area);
			}
		}

		deleteArea(area) {
			this.canvas.remove(area);
		}

		toAreaXml() {
			return this.form.toAreaXml();
		}

		static getRandomColor(color) {
			if (color === undefined) {
				let r = (Math.floor(Math.random() * 5) * 3).toString(16),
					g = (Math.floor(Math.random() * 5) * 3).toString(16),
					b = (Math.floor(Math.random() * 5) * 3).toString(16);
				color = '#' + r + r + g + g + b + b;
			}
			return color;
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
	}

	return AreaEditor;
});
