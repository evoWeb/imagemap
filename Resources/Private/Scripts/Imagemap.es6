define(['jquery', 'TYPO3/CMS/Imagemap/Fabric'], ($, fabric) => {
	let imagemap = imagemap || {};

	class Rect extends fabric.Rect {
		constructor(options) {
			super(options);

			this.form = null;
			this.subForm = null;
		}

		postInitializeForm() {
			this.setValues();
			this.addEvents();
		}

		setValues() {
			this.subForm.querySelectorAll('.t3js-field').forEach(function (field) {
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

		addEvents() {
			this.subForm.querySelectorAll('.t3js-btn').forEach(function (button) {
				button.addEventListener('click', this[button.id + 'Action'].bind(this));
			}.bind(this));
		}

		linkAction() {
// var area = jQuery(this).parents('.areaForm').data('area'); area.getCanvas().openPopup(this, area);
		}

		upAction() {
		}

		downAction() {
		}

		undoAction() {
		}

		redoAction() {
		}

		deleteAction() {
			this.form.deleteArea(this);
			this.subForm.remove();
			delete this;
		}

		expandAction() {
			this.showElement('.moreOptions');
			this.hideElement('#expand');
			this.showElement('#collaps');
		}

		collapseAction() {
			this.hideElement('.moreOptions');
			this.hideElement('#collaps');
			this.showElement('#expand');
		}

		getElement(selector) {
			return this.subForm.querySelector(selector);
		}

		hideElement(selector) {
			this.getElement(selector).classList.add('hide');
		}

		showElement(selector) {
			this.getElement(selector).classList.remove('hide');
		}

		toAreaXml() {
			return [
				'<area shape="rect"',
				' coords="' + this.getAreaCoords() + '"',
				this.getAdditionalAttributes() + '>',
				this.getLink(),
				'</area>'
			].join('');
		}

		getAreaCoords() {
			return [this.left, this.top, (this.left + this.width), (this.height + this.top)].join(',');
		}

		getLink() {
			return this.subForm.querySelector('#link').value;
		}

		getAdditionalAttributes() {
			let result = [];

			if (this.subForm.querySelector('#title').value) {
				result.push('alt="' + this.subForm.querySelector('#title').value + '"');
			}

			if (this.subForm.querySelector('#color')) {
				result.push('color="' + AreaEditor.rgbAToHex(
					this.subForm.querySelector('#color').style.backgroundColor
				) + '"');
			}

			return (result.length > 0 ? ' ' : '') + result.join(' ');
		}
	}

	class Circle extends fabric.Circle {
		constructor(options) {
			super(options);

			this.form = null;
			this.subForm = null;
		}

		postInitializeForm() {
			this.setValues();
			this.addEvents();
		}

		setValues() {
			this.subForm.querySelector('#link').value = this.link;
			this.subForm.querySelector('#label').value = this.alt;
			this.subForm.querySelector('.colorPreview > div').style.backgroundColor = this.color;
		}

		addEvents() {
			this.subForm.querySelectorAll('.t3js-btn').forEach(function (button) {
				button.addEventListener('click', this[button.id + 'Action'].bind(this));
			}.bind(this));
		}

		linkAction() {
// var area = jQuery(this).parents('.areaForm').data('area'); area.getCanvas().openPopup(this, area);
		}

		upAction() {
		}

		downAction() {
		}

		undoAction() {
		}

		redoAction() {
		}

		deleteAction() {
			this.form.deleteArea(this);
			this.subForm.remove();
			delete this;
		}

		expandAction() {
			this.showElement('.moreOptions');
			this.hideElement('#expand');
			this.showElement('#collaps');
		}

		collapseAction() {
			this.hideElement('.moreOptions');
			this.hideElement('#collaps');
			this.showElement('#expand');
		}

		getElement(selector) {
			return this.subForm.querySelector(selector);
		}

		hideElement(selector) {
			this.getElement(selector).classList.add('hide');
		}

		showElement(selector) {
			this.getElement(selector).classList.remove('hide');
		}

		toAreaXml() {
			return [
				'<area shape="circle"',
				' coords="' + this.getAreaCoords() + '"',
				this.getAdditionalAttributes() + '>',
				this.getLink(),
				'</area>'
			].join('');
		}

		getAreaCoords() {
			return this.left + ',' + this.top + ',' + this.radius;
		}

		getLink() {
			return this.subForm.querySelector('#link').value;
		}

		getAdditionalAttributes() {
			let result = [];

			if (this.subForm.querySelector('#title').value) {
				result.push('alt="' + this.subForm.querySelector('#title').value + '"');
			}

			if (this.subForm.querySelector('#color')) {
				result.push('color="' + AreaEditor.rgbAToHex(
					this.subForm.querySelector('#color').style.backgroundColor
				) + '"');
			}

			return (result.length > 0 ? ' ' : '') + result.join(' ');
		}
	}

	class Polygon extends fabric.Polygon {
		constructor(options) {
			super(options);

			this.form = null;
			this.subForm = null;
			this.coordForm = null;
		}

		postInitializeForm() {
			this.setValues();
			this.addEvents();
		}

		setValues() {
			this.subForm.querySelector('#link').value = this.link;
			this.subForm.querySelector('#label').value = this.alt;
			this.subForm.querySelector('.colorPreview > div').style.backgroundColor = this.color;
		}

		addEvents() {
			this.subForm.querySelectorAll('.t3js-btn').forEach(function (button) {
				button.addEventListener('click', this[button.id + 'Action'].bind(this));
			}.bind(this));
		}

		linkAction() {
// var area = jQuery(this).parents('.areaForm').data('area'); area.getCanvas().openPopup(this, area);
		}

		upAction() {
		}

		downAction() {
		}

		undoAction() {
		}

		redoAction() {
		}

		deleteAction() {
			this.form.deleteArea(this);
			this.subForm.remove();
			this.coordForm.remove();
			delete this;
		}

		addAction() {
		}

		expandAction() {
			this.showElement('.moreOptions');
			this.hideElement('#expand');
			this.showElement('#collaps');
		}

		collapseAction() {
			this.hideElement('.moreOptions');
			this.hideElement('#collaps');
			this.showElement('#expand');
		}

		getElement(selector) {
			return this.subForm.querySelector(selector);
		}

		hideElement(selector) {
			this.getElement(selector).classList.add('hide');
		}

		showElement(selector) {
			this.getElement(selector).classList.remove('hide');
		}

		toAreaXml() {
			let coords = this.getAreaCoords();
			return [
				'<area shape="poly"',
				' coords="' + coords + '"',
				this.getAdditionalAttributes() + '>',
				this.getLink(),
				'</area>'
			].join('');
		}

		getAreaCoords() {

		}

		getLink() {
			return this.subForm.querySelector('#link').value;
		}

		getAdditionalAttributes() {
			let result = [];

			if (this.subForm.querySelector('#title').value) {
				result.push('alt="' + this.subForm.querySelector('#title').value + '"');
			}

			if (this.subForm.querySelector('#color')) {
				result.push('color="' + AreaEditor.rgbAToHex(
					this.subForm.querySelector('#color').style.backgroundColor
				) + '"');
			}

			return (result.length > 0 ? ' ' : '') + result.join(' ');
		}
	}

	class AreaForm {
		constructor(formElement, editor) {
			this.element = fabric.document.querySelector('#' + formElement);
			this.editor = editor;
			this.areas = [];
		}

		getFormElement(selector) {
			return new DOMParser().parseFromString(
				this.element.querySelector(selector).innerHTML,
				'text/html'
			).body.firstChild;
		}

		addRect(area) {
			area.form = this;
			area.subForm = this.getFormElement('#rectForm');

			this.addArea(area);
			area.postInitializeForm();
		}

		addCircle(area) {
			area.form = this;
			area.subForm = this.getFormElement('#circForm');

			this.addArea(area);
			area.postInitializeForm();
		}

		addPoly(area) {
			area.form = this;
			area.subForm = this.getFormElement('#polyForm');
			area.coordForm = this.getFormElement('#polyCoords');

			this.addArea(area);
			area.postInitializeForm();
		}

		addArea(area) {
			this.areas.push(area);
			this.element.insertBefore(area.subForm, this.element.firstChild);
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
			data.objectId = area.getId();
			data.currentValue = area.getLink();

			$.ajax({
				url: TYPO3.settings.ajaxUrls['imagemap_browselink_url'],
				context: area,
				data: data
			}).done(function (response) {
				console.log(response);
				let vHWin = window.open(response.url, '', 'height=600,width=500,status=0,menubar=0,scrollbars=1'); vHWin.focus()
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
			let [left, top, right, bottom] = configuration.coords.split(','),
				area = new Rect({
					...configuration,
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
			if (this.form) {
				this.form.addRect(area);
			}
		}

		addCircle(configuration) {
			let [left, top, radius] = configuration.coords.split(','),
				area = new Circle({
					...configuration,
					left: parseInt(left),
					top: parseInt(top),
					radius: parseInt(radius),
					borderColor: configuration.color,
					stroke: configuration.color,
					strokeWidth: 1,
					fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.001 : 0.2)
				});

			this.canvas.add(area);
			if (this.form) {
				this.form.addCircle(area);
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
				top: top,
				left: left,
				borderColor: configuration.color,
				stroke: configuration.color,
				strokeWidth: 1,
				fill: AreaEditor.hexToRgbA(configuration.color, this.preview ? 0.001 : 0.2)
			});

			this.canvas.add(area);
			if (this.form) {
				this.form.addPoly(area);
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
			return this.form.toAreaXml();
		}
	}
	imagemap.AreaEditor = AreaEditor;

	return imagemap;
});
