define(['TYPO3/CMS/Imagemap/Fabric'], (fabric) => {
	let imagemap = imagemap || {};

	class Rect extends fabric.Rect {
		persistanceXML() {
			return '<area shape="rect" coords="' + this.getLeftX(0) + "," + this.getTopY(0)
				+ "," + this.getRightX(0) + "," + this.getBottomY(0)
				+ '" ' + this.getAdditionalAttributeXML() + ">" + this.getLink() + "</area>"
		}
	}
	imagemap.Rect = Rect;

	class Circle extends fabric.Circle {
		persistanceXML() {
			return '<area shape="circle" coords="' + this.getX(0) + "," + this.getY(0) + "," + this.getRadius(0)
				+ '" ' + this.getAdditionalAttributeXML() + ">" + this.getLink() + "</area>";
		}
	}
	imagemap.Circle = Circle;

	class Polygon extends fabric.Polygon {
		persistanceXML() {
			return '<area shape="poly" coords="' + this.joinCoords()
				+ '" ' + this.getAdditionalAttributeXML() + ">" + this.getLink() + "</area>"
		}
	}
	imagemap.Polygon = Polygon;

	class AreaEditor extends fabric.Canvas {
		constructor(canvas, picture, form) {
			super (canvas, picture, form);
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
			let area = new imagemap.Rect({
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
			this.add(area);
		}

		addCircle(configuration) {
			let [left, top, radius] = configuration.coords.split(',');
			let area = new imagemap.Circle({
				...configuration,
				left: parseInt(left),
				top: parseInt(top),
				radius: parseInt(radius),
				borderColor: configuration.color,
				stroke: configuration.color,
				strokeWidth: 1,
				fill: this.hexToRgbA(configuration.color, 0.2)
			});
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

			let area = new imagemap.Polygon(points, {
				...configuration,
				top: top,
				left: left,
				borderColor: configuration.color,
				stroke: configuration.color,
				strokeWidth: 1,
				fill: this.hexToRgbA(configuration.color, 0.2)
			});
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
