let Fabric_1 = fabric;

class AreaShapePolygon extends Fabric_1.Polygon {
  constructor(points, options) {
    super(points, options);
  }
  initializeControls() {
    let self = this, lastControl = this.points.length - 1;
    this.hasBorders = false;
    this.cornerStyle = 'circle';
    this.controls = this.points.reduce(function (acc, point, index) {
      let control = new Fabric_1.Control({
        actionHandler: self.anchorWrapper(index > 0 ? index - 1 : lastControl, self.actionHandler),
        actionName: 'modifyPolygon',
        pointIndex: index
      });
      control.positionHandler = self.polygonPositionHandler.bind(control);
      acc['p' + index] = control;
      return acc;
    }, {});
    this.canvas.requestRenderAll();
  }
  // from example
  // define a function that can locate the controls.
  // this function will be used both for drawing and for interaction.
  polygonPositionHandler(dim, finalMatrix, fabricObject) {
    let x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x), y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
    return Fabric_1.util.transformPoint({ x: x, y: y }, fabricObject.calcTransformMatrix());
  }
  // from example
  // define a function that will define what the control does
  // this function will be called on every mouse move after a control has been
  // clicked and is being dragged.
  // The function receive as argument the mouse event, the current transform object
  // and the current position in canvas coordinate
  // transform.target is a reference to the current object being transformed,
  actionHandler(eventData, transform, x, y) {
    let polygon = transform.target, currentControl = polygon.controls[polygon.__corner], mouseLocalPosition = polygon.toLocalPoint(new Fabric_1.Point(x, y), 'center', 'center'), size = polygon._getTransformedDimensions(0, 0);
    polygon.points[currentControl.pointIndex].x = mouseLocalPosition.x * polygon.width / size.x + polygon.pathOffset.x;
    polygon.points[currentControl.pointIndex].y = mouseLocalPosition.y * polygon.height / size.y + polygon.pathOffset.y;
    return true;
  }
  // from example
  // define a function that can keep the polygon in the same position when we change its
  // width/height/top/left.
  anchorWrapper(anchorIndex, fn) {
    return function (eventData, transform, x, y) {
      let fabricObject = transform.target, absolutePoint = Fabric_1.util.transformPoint({
        x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
        y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
      }, fabricObject.calcTransformMatrix()), actionPerformed = fn(eventData, transform, x, y);
      fabricObject._setPositionDimensions({});
      let newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / fabricObject.width, newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / fabricObject.height;
      fabricObject.setPositionByOrigin(absolutePoint, (newX + 0.5), (newY + 0.5));
      return actionPerformed;
    };
  }
}

var points = [{
  x: 3, y: 4
}, {
  x: 16, y: 3
}, {
  x: 30, y: 5
}, {
  x: 25, y: 55
}, {
  x: 19, y: 44
}, {
  x: 15, y: 30
}, {
  x: 15, y: 55
}, {
  x: 9, y: 55
}, {
  x: 6, y: 53
}, {
  x: -2, y: 55
}, {
  x: -4, y: 40
}, {
  x: 0, y: 20
}]

var productionOptions = {
  fill: "rgba(115, 248, 131, 0.3)",
  cornerColor: "#eee",
  cornerSize: 10,
  cornerStrokeColor: "#bbb",
  cornerStyle: "circle",
  hasBorders: false,
  hasControls: true,
  hasRotatingPoint: false,
  id: 6,
  objectCaching: false,
  selectable: true,
  stroke: "#73f883",
  strokeWidth: 0,
  transparentCorners: false
};

var testOptions = {
  left: 100,
  top: 50,
  fill: '#D81B60',
  strokeWidth: 0,
  scaleX: 4,
  scaleY: 4,
  objectCaching: false,
  transparentCorners: false,
  cornerColor: 'blue'
};

var polygon = new AreaShapePolygon(points, productionOptions);

var canvas = this.__canvas = new fabric.Canvas('c');
canvas.add(polygon);
polygon.initializeControls();
