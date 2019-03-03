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
			this.initializeColorPicker();
			this.initializeEvents();
			this.updateValues();
		}

		initializeElement() {
			this.element = this.getFormElement('#' + this.constructor.name.toLowerCase() + 'Form');
			this.form.areaZone.appendChild(this.element);
			this.form.initializeArrows();
		}

		initializeColorPicker() {
			let colorPicker = this.getElement('#colorPicker'),
				values = ['00', '33', '66', '99', 'CC', 'FF'];

			for (let b = 1; b < 6; b++) {
				for (let g = 1; g < 5; g++) {
					for (let r = 1; r < 6; r++) {
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

		initializeEvents() {
			this.on('moved', this.updateValues.bind(this));
			this.on('modified', this.updateValues.bind(this));

			this.getElements('.positionOptions .t3js-field').forEach(function (field) {
				field.addEventListener('changed', this['updateCanvas'].bind(this));
			}.bind(this));

			this.getElements('.t3js-btn').forEach(function (button) {
				button.addEventListener('click', this[button.id + 'Action'].bind(this));
			}.bind(this));
		}

		initializeArrows() {
			let areaZone = this.form.areaZone;
			this.getElement('#up').classList[areaZone.firstChild !== this.element ? 'remove' : 'add']('disabled');
			this.getElement('#down').classList[areaZone.lastChild !== this.element ? 'remove' : 'add']('disabled');
		}

		updateValues() {
		}

		updateCanvas() {
		}


		linkAction(event) {
			this.form.openLinkBrowser(event.currentTarget, this);
		}

		upAction() {
			this.form.moveArea(this, -1);
		}

		downAction() {
			this.form.moveArea(this, 1);
		}

		undoAction() {
		}

		redoAction() {
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
				'<area shape="' + this.constructor.name.toLowerCase() + '"',
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
			return this.getElement('.link').value;
		}
	}

	class Rect extends Aggregation(fabric.Rect, AreaFormElement) {
		updateValues() {
			this.getElement('#color').style.backgroundColor = this.color;
			this.getElement('#alt').value = this.alt;
			this.getElement('.link').value = this.link;
			this.getElement('#left').value = Math.floor(this.left + 0);
			this.getElement('#top').value = Math.floor(this.top + 0);
			this.getElement('#right').value = Math.floor(this.left + this.getScaledWidth());
			this.getElement('#bottom').value = Math.floor(this.top + this.getScaledHeight());

			if (this.hasOwnProperty('attributes') && this.attributes) {
				Object.entries(this.attributes).forEach((attribute) => {
					this.getElement('#' + attribute[0]).value = attribute[1];
				});
			}
		}

		updateCanvas(event) {
			console.log(this);
			console.log(event);
		}

		getAreaCoords() {
			return [
				Math.floor(this.left + 0),
				Math.floor(this.top + 0),
				Math.floor(this.left + this.getScaledWidth()),
				Math.floor(this.top + this.getScaledHeight())
			].join(',');
		}
	}

	class Circle extends Aggregation(fabric.Circle, AreaFormElement) {
		updateValues() {
			this.getElement('#color').style.backgroundColor = this.color;
			this.getElement('#alt').value = this.alt;
			this.getElement('.link').value = this.link;
			this.getElement('#left').value = Math.floor(this.left + 0);
			this.getElement('#top').value = Math.floor(this.top + 0);
			this.getElement('#radius').value = Math.floor(this.getRadiusX());

			if (this.hasOwnProperty('attributes') && this.attributes) {
				Object.entries(this.attributes).forEach((attribute) => {
					this.getElement('#' + attribute[0]).value = attribute[1];
				});
			}
		}

		updateCanvas(event) {
			console.log(this);
			console.log(event);
		}

		getAreaCoords() {
			return [
				Math.floor(this.left + this.getRadiusX()),
				Math.floor(this.top + this.getRadiusX()),
				Math.floor(this.getRadiusX())
			].join(',');
		}
	}

	class Poly extends Aggregation(fabric.Polygon, AreaFormElement) {
		updateValues() {
			this.getElement('#color').style.backgroundColor = this.color;
			this.getElement('#alt').value = this.alt;
			this.getElement('.link').value = this.link;

			if (this.hasOwnProperty('attributes') && this.attributes) {
				Object.entries(this.attributes).forEach((attribute) => {
					this.getElement('#' + attribute[0]).value = attribute[1];
				});
			}

			this.points.forEach((point, index) => {
				point.id = point.id ? point.id : 'p' + this.id + '_' + index;
				let element = this.getElement('#' + point.id);

				if (element === null) {
					element = this.getFormElement('#polyCoords', point.id);
					this.append(element);
				}

				element.querySelector('#x' + point.id).value = point.x;
				element.querySelector('#y' + point.id).value = point.y;
			});
		}

		updateCanvas(event) {
			console.log(this);
			console.log(event);
		}

		getAreaCoords() {
			let result = [];

			this.points.forEach((point) => {
				result.push(point.x);
				result.push(point.y);
			});

			return result.join(',');
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

		moveArea(area, offset) {
			let index = this.areas.indexOf(area),
				newIndex = index + offset,
				parent = area.element.parentNode;

			if (newIndex > -1 && newIndex < this.areas.length) {
				let removedArea = this.areas.splice(index, 1)[0];
				this.areas.splice(newIndex, 0, removedArea);

				parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
			}

			this.initializeArrows();
		}

		openLinkBrowser(link, area) {
			link.blur();

			let data = {
				...window.imagemap.browseLink,
				objectId: area.id,
				itemName: 'link' + area.id,
				currentValue: area.getLink()
			};

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

		syncAreaLinkValue(id) {
			this.areas.forEach((area) => {
				if (area.id === parseInt(id)) {
					area.link = area.getElement('.link').value;
				}
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

			this.canvas = new fabric.Canvas(canvas, {
				...options.canvas,
				selection: false
			});
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

		triggerAreaLinkUpdate(id) {
			this.form.syncAreaLinkValue(id);
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
