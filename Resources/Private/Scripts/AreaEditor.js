define(['TYPO3/CMS/Imagemap/Fabric'], (fabric) => {
	class AreaEditor extends fabric.Canvas {
		constructor(canvas, picture, form) {
			super (canvas, picture, form);
		}

		initializeScaling(scaling) {
			let width = parseInt(scaling) / this.imageOrigW,
				height = parseInt(scaling) / this.imageOrigH;
			return (width > height) ? height : width;
		}
		setScale(scaling) {
			this.scaleFactor = scaling > 1 ? 1 : scaling;
			jQuery(this.pictureId + " > #image > img").width(this.getMaxW());
			jQuery(this.pictureId + " > #image > img").height(this.getMaxH());
			jQuery(this.pictureId).width(this.getMaxW());
			jQuery(this.pictureId).height(this.getMaxH());
			let that = this;
			jQuery.each(this.areaObjectList, function (d, c) {
				that.areaObjects[c].setScale(that.scaleFactor);
				that.updateCanvas(c)
			});
			jQuery(this.canvasId).width(this.getMaxW()).height(this.getMaxH())
		}
		getMaxW() {
			return this.scaleFactor * this.imageOrigW
		}
		getMaxH () {
			return this.scaleFactor * this.imageOrigH
		}

		persistanceXML() {
			return '';
		}

		mousedown() {
			console.log();
		}

		mouseup() {
			console.log();
		}

		mousemove() {
			console.log();
		}

		dblclick() {
			console.log();
		}
	}
	return AreaEditor;
});
