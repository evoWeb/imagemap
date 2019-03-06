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
			/** @type {Array} */
			let propertySymbols = Object.getOwnPropertySymbols(source);
			Object.getOwnPropertyNames(source)
				.concat(propertySymbols)
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

	class AreaFormElement extends fabric.Object {
		/**
		 * @type {string}
		 */
		name = '';

		/**
		 * @type {ChildNode|HTMLElement}
		 */
		element = null;

		/**
		 * @type {AreaForm}
		 */
		form = null;

		/**
		 * @type {number}
		 */
		eventDelay = 0;

		postAddToForm() {
			this.id = fabric.Object.__uid++;

			if (!this.hasOwnProperty('attributes')) {
				this.attributes = [];
			}

			this.initializeElement();
			this.initializeColorPicker();
			this.updateFields();
			this.initializeEvents();
		}

		initializeElement() {
			this.element = this.getFormElement('#' + this.name + 'Form');
			this.form.areaZone.append(this.element);
			this.form.initializeArrows();
		}

		initializeColorPicker() {
			let colorPicker = this.getElement('.colorPicker'),
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

						colorPicker.append(cell);
					}
				}
			}
		}

		initializeEvents() {
			this.on('moved', this.updateFields.bind(this));
			this.on('modified', this.updateFields.bind(this));

			this.getElements('.positionOptions .t3js-field').forEach(this.coordinateFieldHandler.bind(this));
			this.getElements('.basicOptions .t3js-field, .attributes .t3js-field').forEach(this.attributeFieldHandler.bind(this));
			this.getElements('.t3js-btn').forEach(this.buttonHandler.bind(this));
		}

		coordinateFieldHandler(field) {
			field.addEventListener('keyup', this.fieldKeyUpHandler.bind(this));
		}

		fieldKeyUpHandler(event) {
			clearTimeout(this.eventDelay);
			this.eventDelay = AreaFormElement.wait(() => { this.updateCanvas(event); }, 500);
		}

		attributeFieldHandler(field) {
			field.addEventListener('keyup', this.updateProperties.bind(this));
		}

		buttonHandler(button) {
			button.addEventListener('click', this[button.id + 'Action'].bind(this));
		}

		initializeArrows() {
			let areaZone = this.form.areaZone;
			this.getElement('#up').classList[areaZone.firstChild !== this.element ? 'remove' : 'add']('disabled');
			this.getElement('#down').classList[areaZone.lastChild !== this.element ? 'remove' : 'add']('disabled');
		}

		updateFields() {
		}

		updateProperties(event) {
			let field = event.currentTarget;
			if (field.classList.contains('link')) {
				this.link = field.value;
			} else if (this.hasOwnProperty(field.id)) {
				this[field.id] = field.value;
			} else if (this.attributes.hasOwnProperty(field.id)) {
				this.attributes[field.id] = field.value;
			}
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
			if (this.element) {
				this.element.remove();
			}
			if (this.form) {
				this.form.initializeArrows();
			}
			this.editor.deleteArea(this);
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
			this.editor.canvas.renderAll();
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
				'<area shape="' + this.name + '"',
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

		static wait(callback, delay) {
			return window.setTimeout(callback, delay);
		}
	}

	class Rect extends Aggregation(fabric.Rect, AreaFormElement) {
		name = 'rect';

		updateFields() {
			this.getElement('#color').style.backgroundColor = this.color;
			this.getElement('#alt').value = this.alt;
			this.getElement('.link').value = this.link;
			this.getElement('#left').value = Math.floor(this.left + 0);
			this.getElement('#top').value = Math.floor(this.top + 0);
			this.getElement('#right').value = Math.floor(this.left + this.getScaledWidth());
			this.getElement('#bottom').value = Math.floor(this.top + this.getScaledHeight());

			Object.entries(this.attributes).forEach((attribute) => {
				this.getElement('#' + attribute[0]).value = attribute[1];
			});
		}

		updateCanvas(event) {
			let field = event.currentTarget || event.target,
				value = 0;

			switch (field.id) {
				case 'left':
					value = parseInt(field.value);
					this.getElement('#right').value = value + this.getScaledWidth();
					this.set({left: value});
					break;

				case 'top':
					value = parseInt(field.value);
					this.getElement('#bottom').value = value + this.getScaledHeight();
					this.set({top: value});
					break;

				case 'right':
					value = field.value - this.left;
					if (value < 0) {
						value = 10;
						field.value = this.left + value;
					}
					this.set({width: value});
					break;

				case 'bottom':
					value = field.value - this.top;
					if (value < 0) {
						value = 10;
						field.value = this.top + value;
					}
					this.set({height: value});
					break;
			}
			this.canvas.renderAll();
		}

		getAreaCoords() {
			return [
				Math.floor(this.left + 0),
				Math.floor(this.top + 0),
				Math.floor(this.left + this.getScaledWidth() - 1),
				Math.floor(this.top + this.getScaledHeight() - 1)
			].join(',');
		}
	}

	class Circle extends Aggregation(fabric.Circle, AreaFormElement) {
		name = 'circle';

		updateFields() {
			this.getElement('#color').style.backgroundColor = this.color;
			this.getElement('#alt').value = this.alt;
			this.getElement('.link').value = this.link;
			this.getElement('#left').value = Math.floor(this.left + 0);
			this.getElement('#top').value = Math.floor(this.top + 0);
			this.getElement('#radius').value = Math.floor(this.getRadiusX());

			Object.entries(this.attributes).forEach((attribute) => {
				this.getElement('#' + attribute[0]).value = attribute[1];
			});
		}

		updateCanvas(event) {
			let field = event.currentTarget || event.target,
				value = 0;

			switch (field.id) {
				case 'left':
					value = parseInt(field.value);
					this.set({left: value});
					break;

				case 'top':
					value = parseInt(field.value);
					this.set({top: value});
					break;

				case 'radius':
					value = parseInt(field.value);
					this.set({radius: value});
					break;
			}
			this.canvas.renderAll();
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
		name = 'poly';

		updateFields() {
			this.getElement('#color').style.backgroundColor = this.color;
			this.getElement('#alt').value = this.alt;
			this.getElement('.link').value = this.link;

			Object.entries(this.attributes).forEach((attribute) => {
				this.getElement('#' + attribute[0]).value = attribute[1];
			});

			let parentElement = this.getElement('.positionOptions');
			this.points.forEach((point, index) => {
				point.id = point.id ? point.id : 'p' + this.id + '_' + index;

				if (!point.hasOwnProperty('element')) {
					point.element = this.getFormElement('#polyCoords', point.id);
					parentElement.append(point.element);
				}

				point.element.querySelector('#x' + point.id).value = point.x;
				point.element.querySelector('#y' + point.id).value = point.y;
			});
		}

		updateCanvas(event) {
			let field = event.currentTarget || event.target,
				[, point] = field.id.split('_'),
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
			this.points[control.name] = {x: x, y: y};
			this.canvas.renderAll();
		}

		getAreaCoords() {
			let result = [];

			this.controls.forEach((control) => {
				let center = control.getCenterPoint();
				result.push(center.x);
				result.push(center.y);
			});

			return result.join(',');
		}

		/**
		 * @type {Array}
		 */
		controls = [];

		addControls(areaConfig) {
			this.points.forEach((point, index) => {
				this.addControl(areaConfig, point, index);
			});

			this.canvas.on('object:moving', (event) => {
				if (event.target.get('type') === 'control') {
					let control = event.target,
						center = control.getCenterPoint();
					control.polygon.points[control.name] = {
						x: center.x,
						y: center.y
					};
				}
			});
		}

		addControl(areaConfig, point, index) {
			let circle = new fabric.Circle({
				...areaConfig,
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
			});
			circle.on('moved', this.pointMoved.bind(this));
			this.controls[index] = circle;
			this.canvas.add(circle);
		}

		pointMoved(event) {
			let point = event.currentTabId || event.target,
				id = 'p' + point.polygon.id + '_' + point.name,
				center = point.getCenterPoint();

			this.getElement('#x' + id).value = center.x;
			this.getElement('#y' + id).value = center.y;
		}

		addPointAction() {
			let index = this.points.length,
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

		removePointAction(event) {
			if (this.points.length > 3) {
				let element = event.currentTarget.parentNode.parentNode,
					points = [],
					controls = [];

				this.points.forEach((point, index) => {
					if (element.id !== point.id) {
						points.push(point);
						controls.push(this.controls[index]);
					} else {
						point.element.remove();
						this.canvas.remove(this.controls[index]);
					}
				});

				points.forEach((point, index) => {
					let oldId = point.id;
					point.id = 'p' + this.id + '_' + index;
					this.getElement('#' + oldId).id = point.id;
					this.getElement('#x' + oldId).id = 'x' + point.id;
					this.getElement('#y' + oldId).id = 'y' + point.id;
					this.getElement('[for="x' + oldId + '"]').setAttribute('for', 'x' + point.id);
					this.getElement('[for="y' + oldId + '"]').setAttribute('for', 'y' + point.id);
					controls[index].name = index;
				});

				this.points = points;
				this.controls = controls;
				this.canvas.renderAll();
			}
		}
	}

	class AreaForm {
		/**
		 * @type {HTMLElement}
		 */
		areaZone = null;

		/**
		 * @type {AreaEditor}
		 */
		editor = null;

		constructor(formElement, editor) {
			this.element = fabric.document.querySelector(formElement);
			this.areaZone = this.element.querySelector('#areaZone');
			this.editor = editor;
		}

		initializeArrows() {
			this.editor.areas.forEach((area) => {
				area.initializeArrows();
			});
		}

		addArea(area) {
			area.form = this;
			area.postAddToForm();
		}

		moveArea(area, offset) {
			let index = this.editor.areas.indexOf(area),
				newIndex = index + offset,
				parent = area.element.parentNode;

			if (newIndex > -1 && newIndex < this.editor.areas.length) {
				let removedArea = this.editor.areas.splice(index, 1)[0];
				this.editor.areas.splice(newIndex, 0, removedArea);

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
				url: this.editor.browseLinkUrlAjaxUrl,
				context: area,
				data: data
			}).done((response) => {
				let vHWin = window.open(
					response.url,
					'',
					'height=600,width=500,status=0,menubar=0,scrollbars=1'
				);
				vHWin.focus()
			});
		}

		syncAreaLinkValue(id) {
			this.editor.areas.forEach((area) => {
				if (area.id === parseInt(id)) {
					area.link = area.getElement('.link').value;
				}
			});
		}

		toAreaXml() {
			let xml = ['<map>'];
			this.editor.areas.forEach((area) => {
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

		/**
		 * @type {string}
		 */
		browseLinkUrlAjaxUrl = '';

		/**
		 * @type {boolean}
		 */
		preview = true;

		/**
		 * @type {Array}
		 */
		areas = [];

		constructor(options, canvasSelector, formSelector) {
			this.initializeOptions(options);

			this.canvas = new fabric.Canvas(canvasSelector, {
				...options.canvas,
				selection: false
			});

			if (formSelector !== undefined) {
				this.preview = false;
				this.form = new AreaForm(formSelector, this);
			}
		}

		initializeOptions(options) {
			for (let option in options) {
				if (options.hasOwnProperty(option)) {
					this[option] = options[option];
				}
			}
		}

		setScale(scaling) {
			this.canvas.setZoom(this.canvas.getZoom() * (scaling ? scaling : 1));
		}

		initializeAreas(areas) {
			areas.forEach((area) => {
				switch (area.shape) {
					case 'rect':
						this.addRect(area);
						break;

					case 'circle':
						this.addCircle(area);
						break;

					case 'poly':
						this.addPoly(area);
						break;
				}
			});
		}

		removeAllAreas() {
			this.areas.forEach((area) => { area.deleteAction(); });
		}

		addRect(configuration) {
			configuration.color = AreaEditor.getRandomColor(configuration.color);
			let [left, top, right, bottom] = configuration.coords.split(','),
				area = new Rect({
					...configuration,
					...this.areaConfig,
					selectable: !this.preview,
					hasControls: !this.preview,
					left: parseInt(left),
					top: parseInt(top),
					width: right - left,
					height: bottom - top,
					stroke: configuration.color,
					strokeWidth: 1,
					fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.1 : 0.3)
				});

			area.editor = this;
			this.canvas.add(area);
			this.areas.push(area);
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
					selectable: !this.preview,
					hasControls: !this.preview,
					left: left - radius,
					top: top - radius,
					radius: parseInt(radius),
					stroke: configuration.color,
					strokeWidth: 1,
					fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.1 : 0.3)
				});

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
				selectable: false,
				objectCaching: false,
				hasControls: !this.preview,
				top: top,
				left: left,
				stroke: configuration.color,
				strokeWidth: 1,
				fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.1 : 0.3)
			});

			area.editor = this;
			this.canvas.add(area);
			this.areas.push(area);
			if (this.form) {
				area.addControls(this.areaConfig);
				this.form.addArea(area);
			}
		}

		triggerAreaLinkUpdate(id) {
			this.form.syncAreaLinkValue(id);
		}

		deleteArea(area) {
			let areas = [];
			this.areas.forEach((currentArea) => {
				if (area !== currentArea) {
					areas.push(currentArea);
				}
			});
			this.areas = areas;
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

