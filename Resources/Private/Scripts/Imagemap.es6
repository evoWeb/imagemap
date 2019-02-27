define(['TYPO3/CMS/Imagemap/Fabric'], (fabric) => {
	let imagemap = imagemap || {};

	class Rect extends fabric.Rect {
		constructor(options) {
			super(options);

			this.form = null;
			this.subForm = null;
		}

		postInitializeForm() {
			this.values();
			this.addEvents();
			console.log(this);
		}

		setValues() {
			this.subForm.querySelector('#link').value = this.link;
			this.subForm.querySelector('#label').value = this.alt;
			this.subForm.querySelector('.colorPreview > div').style.backgroundColor = this.color;
		}

		addEvents() {
			this.subForm.querySelector('#linkwizard').addEventListener('click', this.openLinkWizard);
		}

		openLinkWizard() {

		}

		persistanceXML() {
			let coords = this.left + ',' + this.top + ',' + (this.left + this.width) + ',' + (this.height + this.top);
			return '<area shape="rect" coords="' + coords + '" ' + this.getAdditionalAttributeXML() + '>'
				+ this.getLink() + '</area>'
		}
	}

	class Circle extends fabric.Circle {
		constructor(options) {
			super(options);

			this.form = null;
			this.subForm = null;
		}

		postInitializeForm() {
			this.values();
			console.log(this);
		}

		setValues() {
			this.subForm.querySelector('#link').value = this.link;
			this.subForm.querySelector('#label').value = this.alt;
			this.subForm.querySelector('.colorPreview > div').style.backgroundColor = this.color;
		}

		persistanceXML() {
			let coords = this.left + ',' + this.top + ',' + this.radius;
			return '<area shape="circle" coords="' + coords + '" ' + this.getAdditionalAttributeXML() + '>'
				+ this.getLink() + '</area>';
		}
	}

	class Polygon extends fabric.Polygon {
		constructor(options) {
			super(options);

			this.form = null;
			this.subForm = null;
		}

		postInitializeForm() {
			this.values();
			console.log(this);
		}

		setValues() {
			this.subForm.querySelector('#link').value = this.link;
			this.subForm.querySelector('#label').value = this.alt;
			this.subForm.querySelector('.colorPreview > div').style.backgroundColor = this.color;
		}

		persistanceXML() {
			return '<area shape="poly" coords="' + this.joinCoords()
				+ '" ' + this.getAdditionalAttributeXML() + ">" + this.getLink() + "</area>"
		}
	}

	class AreaForm {
		constructor(formElement) {
			this.element = fabric.document.querySelector('#' + formElement);
		}

		getFormElement(selector) {
			return new DOMParser().parseFromString(
				this.element.querySelector(selector).innerHTML,
				'text/html'
			).body.firstChild;
		}

		addRectSubForm(area)
		{
			area.form = this;
			area.subForm = this.getFormElement('#rectForm');

			this.element.insertBefore(area.subForm, this.element.firstChild);
			area.postInitializeForm();
		}

		addCircleSubForm(area)
		{
			area.form = this;
			area.subForm = this.getFormElement('#circForm');

			this.element.insertBefore(area.subForm, this.element.firstChild);
			area.postInitializeForm();
		}

		addPolySubForm(area)
		{
			area.form = this;
			area.subForm = this.getFormElement('#polyForm');
			area.coordForm = this.getFormElement('#polyCoords');

			this.element.insertBefore(area.subForm, this.element.firstChild);
			area.postInitializeForm();
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
	}

	class AreaEditor extends fabric.Canvas {
		constructor(canvas, form, options) {
			super (canvas, options);

			this.form = new AreaForm(form);
		}

		initializeScaling(scaling) {
			let width = parseInt(scaling) / this.width,
				height = parseInt(scaling) / this.height;
			return (width > height) ? height : width;
		}
		setScale(scaling) {
			this.scaleFactor = scaling > 1 ? 1 : scaling;
		}
		getMaxWidth() {
			return this.scaleFactor * this.width;
		}
		getMaxHeight() {
			return this.scaleFactor * this.height;
		}

		addRect(configuration) {
			let [left, top, right, bottom] = configuration.coords.split(',');
			let area = new Rect({
				...configuration,
				left: parseInt(left),
				top: parseInt(top),
				width: parseInt(right - left),
				height: parseInt(bottom - top),
				borderColor: configuration.color,
				stroke: configuration.color,
				strokeWidth: 1,
				fill: this.hexToRgbA(configuration.color, 0.2)
			});

			this.form.addRectSubForm(area);
			this.add(area);
		}

		addCircle(configuration) {
			let [left, top, radius] = configuration.coords.split(',');
			let area = new Circle({
				...configuration,
				left: parseInt(left),
				top: parseInt(top),
				radius: parseInt(radius),
				borderColor: configuration.color,
				stroke: configuration.color,
				strokeWidth: 1,
				fill: this.hexToRgbA(configuration.color, 0.2)
			});

			this.form.addCircleSubForm(area);
			this.add(area);
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
				fill: this.hexToRgbA(configuration.color, 0.2)
			});

			this.form.addPolySubForm(area);
			this.add(area);
		}

		hexToRgbA(hex, alpha) {
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

		mousedown(event) {
			console.log(event);
		}

		mouseup(event) {
			console.log(event);
		}

		mousemove(event) {
			console.log(event);
		}

		dblclick(event) {
			console.log(event);
		}
	}
	imagemap.AreaEditor = AreaEditor;

	return imagemap;
});
