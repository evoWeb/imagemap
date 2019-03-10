define([
	'jquery',
	'TYPO3/CMS/Imagemap/Fabric',
	'TYPO3/CMS/Core/Contrib/jquery.minicolors'
], ($, fabric) => {
	// needed to access top frame elements
	let d = top.document || document,
		w = top.window || window;
	if (typeof d !== 'undefined' && typeof w !== 'undefined') {
		fabric.document = d;
		fabric.window = w;
	}

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

		/**
		 * @type {number}
		 */
		static before = -1;

		/**
		 * @type {number}
		 */
		static after = 1;

		postAddToForm() {
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

		initializeElement() {
			this.element = this.getFormElement('#' + this.name + 'Form');
			this.form.areaZone.append(this.element);
			this.form.initializeArrows();
		}

		initializeColorPicker() {
			$(this.getElement('.t3js-color-picker')).minicolors({
				format: 'hex',
				position: 'left',
				theme: 'default',
				changeDelay: 100,
				change: this.colorPickerAction.bind(this)
			});
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
			this.removeFauxInput();
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

		colorPickerAction(value) {
			this.getElement('.t3js-color-picker').value = value;
			this.set('borderColor', value);
			this.set('stroke', value);
			this.set('fill', AreaEditor.hexToRgbA(value, 0.2));
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
					result.push(field.id + '="' + field.value + '"');
				}
			});

			return (result.length > 0 ? ' ' : '') + result.join(' ');
		}

		getLink() {
			return this.getElement('.link').value;
		}

		/**
		 * Add faux input as target for browselink which listens for changes and writes value to real field
		 */
		addFauxInput() {
			if (this.form.fauxForm !== null) {
				let fauxInput = this.editor.fauxFormDocument.createElement('input');
				fauxInput.setAttribute('id', 'link' + this.id);
				fauxInput.setAttribute('data-formengine-input-name', 'link' + this.id);
				fauxInput.setAttribute('value', this.link);
				fauxInput.addEventListener('change', this.fauxInputChanged.bind(this));
				this.form.fauxForm.appendChild(fauxInput);
			}
		}

		fauxInputChanged(event) {
			let field = event.currentTarget;
			this.link = field.value;
			this.updateFields();
		}

		removeFauxInput() {
			if (this.form && this.form.fauxForm !== null) {
				let field = this.form.fauxForm.querySelector('#link' + this.id);
				if (field) {
					field.remove();
				}
			}
		}

		static wait(callback, delay) {
			return window.setTimeout(callback, delay);
		}
	}

	class Rect extends Aggregation(fabric.Rect, AreaFormElement) {
		name = 'rect';

		updateFields() {
			this.getElement('#color').value = this.color;
			this.getElement('#alt').value = this.alt || '';
			this.getElement('.link').value = this.link || '';
			this.getElement('#left').value = Math.floor(this.left + 0);
			this.getElement('#top').value = Math.floor(this.top + 0);
			this.getElement('#right').value = Math.floor(this.left + this.getScaledWidth());
			this.getElement('#bottom').value = Math.floor(this.top + this.getScaledHeight());

			Object.entries(this.attributes).forEach((attribute) => {
				this.getElement('#' + attribute[0]).value = attribute[1] || '';
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
			this.getElement('#color').value = this.color;
			this.getElement('#alt').value = this.alt || '';
			this.getElement('.link').value = this.link || '';
			this.getElement('#left').value = Math.floor(this.left + 0);
			this.getElement('#top').value = Math.floor(this.top + 0);
			this.getElement('#radius').value = Math.floor(this.getRadiusX());

			Object.entries(this.attributes).forEach((attribute) => {
				this.getElement('#' + attribute[0]).value = attribute[1] || '';
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

		constructor(points, options) {
			let coordsXY = options.coords.split(','),
				left = 100000,
				top = 100000,
				i = 0;

			if (coordsXY.length % 2) {
				throw new Error('Bad coords count');
			}

			// first get all coordinates and create point of odd even numbers
			// and get top and left corner of polygon
			points = [];
			for (; i < coordsXY.length; i = i + 2) {
				let xy = {
					x: parseInt(coordsXY[i]),
					y: parseInt(coordsXY[i + 1])
				};
				points.push(xy);

				left = Math.min(left, xy.x);
				top = Math.min(top, xy.y);
			}
			options.left = left;
			options.top = top;

			// reduce point x/y values by top/left values
			points.forEach((point) => {
				point.x = point.x - options.left;
				point.y = point.y - options.top;
			});

			super(points, options);
			this.on('moved', this.polygonMoved.bind(this));
		}

		updateFields() {
			this.getElement('#color').value = this.color;
			this.getElement('#alt').value = this.alt || '';
			this.getElement('.link').value = this.link || '';

			Object.entries(this.attributes).forEach((attribute) => {
				this.getElement('#' + attribute[0]).value = attribute[1] || '';
			});

			let parentElement = this.getElement('.positionOptions');
			this.points.forEach((point, index) => {
				point.id = point.id ? point.id : 'p' + this.id + '_' + index;

				if (!point.hasOwnProperty('element')) {
					point.element = this.getFormElement('#polyCoords', point.id);
					parentElement.append(point.element);
				}

				point.element.querySelector('#x' + point.id).value = point.x + this.left;
				point.element.querySelector('#y' + point.id).value = point.y + this.top;
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

		addControls() {
			this.points.forEach((point, index) => {
				this.addControl(this.controlConfig, point, index, 100000);
			});
		}

		addControl(areaConfig, point, index, newControlIndex) {
			let circle = new fabric.Circle({
				...areaConfig,
				hasControls: false,
				radius: 5,
				fill: areaConfig.cornerColor,
				stroke: areaConfig.cornerStrokeColor,
				originX: 'center',
				originY: 'center',
				name: index,
				polygon: this,
				point: point,
				type: 'control',

				// set control position relative to polygon
				left: this.left + point.x,
				top: this.top + point.y,
			});
			circle.on('moved', this.pointMoved.bind(this));

			point.control = circle;

			this.controls = Poly.addElementToArrayWithPosition(this.controls, circle, newControlIndex);
			this.canvas.add(circle);
			this.canvas.renderAll();
		}

		pointMoved(event) {
			let control = event.currentTabId || event.target,
				id = 'p' + control.polygon.id + '_' + control.name,
				center = control.getCenterPoint();

			this.getElement('#x' + id).value = center.x;
			this.getElement('#y' + id).value = center.y;
		}

		polygonMoved() {
			this.points.forEach((point) => {
				this.getElement('#x' + point.id).value = this.left + point.x;
				this.getElement('#y' + point.id).value = this.top + point.y;
			});
		}

		addPointBeforeAction(event) {
			let direction = AreaFormElement.before,
				index = this.points.length,
				parentElement = this.getElement('.positionOptions'),
				[point, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction);

			parentElement.insertBefore(element, currentPoint.element);

			this.points = Poly.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
			this.addControl(this.editor.areaConfig, point, index, currentPointIndex + direction);
		}

		addPointAfterAction(event) {
			let direction = AreaFormElement.after,
				index = this.points.length,
				parentElement = this.getElement('.positionOptions'),
				[point, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction);

			if (currentPoint.element.nextSibling) {
				parentElement.insertBefore(element, currentPoint.element.nextSibling);
			} else {
				parentElement.append(element);
			}

			this.points = Poly.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
			this.addControl(this.editor.areaConfig, point, index, currentPointIndex + direction);
		}

		getPointElementAndCurrentPoint(event, direction) {
			let currentPointId = event.currentTarget.parentNode.parentNode.id,
				[currentPoint, nextPoint, currentPointIndex] = this.getCurrentAndNextPoint(currentPointId, direction),
				index = this.points.length,
				id = 'p' + this.id + '_' + index,
				element = this.getFormElement('#polyCoords', id),
				point = {
					x: Math.floor((currentPoint.x + nextPoint.x) / 2),
					y: Math.floor((currentPoint.y + nextPoint.y) / 2),
					id: id,
					element: element
				};

			element.querySelectorAll('.t3js-btn').forEach(this.buttonHandler.bind(this));

			element.querySelector('#x' + point.id).value = point.x;
			element.querySelector('#y' + point.id).value = point.y;

			return [point, element, currentPointIndex, currentPoint];
		}

		getCurrentAndNextPoint(currentPointId, direction) {
			let currentPointIndex = 0;

			for (let i = 0; i < this.points.length; i++) {
				if (this.points[i].id === currentPointId) {
					break;
				}
				currentPointIndex++;
			}

			let nextPointIndex = currentPointIndex + direction;

			if (nextPointIndex < 0) {
				nextPointIndex = this.points.length - 1;
			}
			if (nextPointIndex >= this.points.length) {
				nextPointIndex = 0;
			}

			return [this.points[currentPointIndex], this.points[nextPointIndex], currentPointIndex, nextPointIndex];
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

		static addElementToArrayWithPosition(array, item, newPointIndex) {
			if (newPointIndex < 0) {
				array.unshift(item);
			} else if (newPointIndex >= array.length) {
				array.push(item);
			} else {
				let newPoints = [];
				for (let i = 0; i < array.length; i++) {
					newPoints.push(array[i]);
					if (i === newPointIndex - 1) {
						newPoints.push(item);
					}
				}
				array = newPoints;
			}
			return array;
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

		/**
		 * Element needed to add inputs that act as target for browselink finalizeFunction target
		 *
		 * @type {HTMLElement}
		 */
		fauxForm = null;

		constructor(formElement, editor) {
			this.element = editor.document.querySelector(formElement);
			this.areaZone = this.element.querySelector('#areaZone');
			this.editor = editor;

			this.addFauxFormForLinkBrowser(this.editor.browseLink);
		}

		destroy() {
			this.removeFauxForm();
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
				...this.editor.browseLink,
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

		/**
		 * Triggers change event after faux field was changed by browselink
		 */
		addFauxFormForLinkBrowser() {
			if (top.document !== this.editor.fauxFormDocument) {
				this.fauxForm = this.editor.fauxFormDocument.createElement('form');
				this.fauxForm.setAttribute('name', this.editor.browseLink.formName);

				let fauxFormContainer = this.editor.fauxFormDocument.querySelector('#fauxFormContainer');
				while (fauxFormContainer.firstChild) {
					fauxFormContainer.removeChild(fauxFormContainer.firstChild);
				}
				fauxFormContainer.appendChild(this.fauxForm);
			}
		}

		removeFauxForm() {
			if (this.fauxForm) {
				this.fauxForm.remove();
			}
		}

		syncAreaLinkValue(id) {
			this.editor.areas.forEach((area) => {
				if (area.id === parseInt(id)) {
					area.link = area.getElement('.link').value;
				}
			});
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
		 * @type {Document}
		 */
		document = null;

		/**
		 * @type {Document}
		 */
		fauxFormDocument = null;

		/**
		 * @type {string}
		 */
		browseLinkUrlAjaxUrl = '';

		/**
		 * @type {object}
		 */
		browseLink = null;

		/**
		 * @type {boolean}
		 */
		preview = true;

		/**
		 * @type {Array}
		 */
		areas = [];

		constructor(options, canvasSelector, formSelector, document) {
			this.setOptions(options);

			this.document = document;
			this.preview = formSelector === '';

			this.initializeCanvas(canvasSelector, options);

			if (!this.preview) {
				this.form = new AreaForm(formSelector, this);
			}
		}

		setOptions(options) {
			for (let option in options) {
				if (options.hasOwnProperty(option)) {
					this[option] = options[option];
				}
			}
		}

		setScale(scaling) {
			this.canvas.setZoom(this.canvas.getZoom() * (scaling ? scaling : 1));
		}

		initializeCanvas(canvasSelector, options) {
			this.canvas = new fabric.Canvas(canvasSelector, {
				...options.canvas,
				selection: false,
				hoverCursor: this.preview ? 'default' : 'move',
			});

			this.canvas.on('object:moving', (event) => {
				let element = event.target;
				switch (event.target.type) {
					case 'control':
						let center = element.getCenterPoint();
						element.point.x = center.x - element.polygon.left;
						element.point.y = center.y - element.polygon.top;
						break;

					case 'polygon':
						element.controls.forEach((control) => {
							control.left = element.left + control.point.x;
							control.top = element.top + control.point.y;
						});
						break;
				}
			});
		}

		initializeAreas(areas) {
			if (areas !== undefined) {
				areas.forEach((area) => {
					area.color = AreaEditor.getRandomColor(area.color);
					let configuration = {
						...area,
						...this.areaConfig,
						selectable: !this.preview,
						hasControls: !this.preview,
						stroke: area.color,
						strokeWidth: 1,
						fill: AreaEditor.hexToRgbA(area.color, 0.3)
					};

					switch (configuration.shape) {
						case 'rect':
							area = this.addRect(configuration);
							break;

						case 'circle':
							area = this.addCircle(configuration);
							break;

						case 'poly':
							area = this.addPoly(configuration);
							break;
					}

					area.editor = this;
					this.areas.push(area);
					if (this.form) {
						this.form.addArea(area);
					}
				});
			}
		}

		removeAllAreas() {
			this.areas.forEach((area) => { area.deleteAction(); });
		}

		addRect(configuration) {
			let [left, top, right, bottom] = configuration.coords.split(','),
				area = new Rect({
					...configuration,
					left: parseInt(left),
					top: parseInt(top),
					width: right - left,
					height: bottom - top,
				});

			this.canvas.add(area);
			return area;
		}

		addCircle(configuration) {
			let [left, top, radius] = configuration.coords.split(','),
				area = new Circle({
					...configuration,
					left: left - radius,
					top: top - radius,
					radius: parseInt(radius),
				});

			// disable control points as these would stretch the circle
			// to an ellipse which is not possible in html areas
			area.setControlVisible('ml', false);
			area.setControlVisible('mt', false);
			area.setControlVisible('mr', false);
			area.setControlVisible('mb', false);

			this.canvas.add(area);
			return area;
		}

		addPoly(configuration) {
			let area = new Poly([], {
				...configuration,
				selectable: false,
				hasControls: false,
				objectCaching: false,
				controlConfig: this.areaConfig,
			});

			this.canvas.add(area);
			if (this.form) {
				area.addControls();
			}
			return area;
		}

		triggerLinkChanged(id) {
			let selector = 'form[name="' + this.browseLink.formName + '"] [data-formengine-input-name="link' + id + '"]',
				field = this.fauxFormDocument.querySelector(selector),
				event = this.fauxFormDocument.createEvent('HTMLEvents');
			event.initEvent('change', false, true);
			field.dispatchEvent(event);
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
			let xml = ['<map>'];
			this.areas.forEach((area) => {
				xml.push(area.toAreaXml());
			});
			xml.push('</map>');
			return xml.join("\n");
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
	}

	return AreaEditor;
});

