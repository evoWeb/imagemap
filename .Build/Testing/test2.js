//http://fabricjs.com/custom-controls-polygon

  var canvas = this.__canvas = new fabric.Canvas('c');
// create a polygon object
var points = [{
  x: 3, y: 4
}, {
  x: 16, y: 3
}, {
  x: 30, y: 5
},  {
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
var polygon = new fabric.Polygon(points, {
  left: 100,
  top: 50,
  fill: '#D81B60',
  strokeWidth: 0,
  scaleX: 4,
  scaleY: 4,
  objectCaching: false,
  transparentCorners: false,
  cornerColor: 'blue'
});

canvas.add(polygon);

// define a function that can locate the controls.
// this function will be used both for drawing and for interaction.
function polygonPositionHandler(dim, finalMatrix, fabricObject) {
  var x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
    y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
  return fabric.util.transformPoint(
    { x: x, y: y }, fabricObject.calcTransformMatrix()
  );
}

// define a function that will define what the control does
// this function will be called on every mouse move after a control has been
// clicked and is being dragged.
// The function receive as argument the mouse event, the current trasnform object
// and the current position in canvas coordinate
// transform.target is a reference to the current object being transformed,
function actionHandler(eventData, transform, x, y) {
  var polygon = transform.target,
    currentControl = polygon.controls[polygon.__corner],
    mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
    size = polygon._getTransformedDimensions(0, 0),
    finalPointPosition = {
      x: mouseLocalPosition.x * polygon.width / size.x + polygon.pathOffset.x,
      y: mouseLocalPosition.y * polygon.height / size.y + polygon.pathOffset.y
    };
  polygon.points[currentControl.pointIndex] = finalPointPosition;
  return true;
}

// define a function that can keep the polygon in the same position when we change its
// width/height/top/left.
function anchorWrapper(anchorIndex, fn) {
  return function(eventData, transform, x, y) {
    var fabricObject = transform.target,
      absolutePoint = fabric.util.transformPoint({
        x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
        y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
      }, fabricObject.calcTransformMatrix());
    var actionPerformed = fn(eventData, transform, x, y);
    var newDim = fabricObject._setPositionDimensions({});
    var newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / fabricObject.width,
      newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / fabricObject.height;
    fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
    return actionPerformed;
  }
}

function Edit() {
  // clone what are you copying since you
  // may want copy and paste on different moment.
  // and you do not want the changes happened
  // later to reflect on the copy.
  var poly = canvas.getObjects()[0];
  canvas.setActiveObject(poly);
  poly.edit = !poly.edit;
  if (poly.edit) {
    var lastControl = poly.points.length - 1;
    poly.cornerStyle = 'circle';
    poly.controls = poly.points.reduce(function(acc, point, index) {
      acc['p' + index] = new fabric.Control({
        positionHandler: polygonPositionHandler,
        actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
        actionName: 'modifyPoligon',
        pointIndex: index
      });
      return acc;
    }, { });
  } else {
    poly.cornerStyle = 'rect';
    poly.controls = fabric.Object.prototype.controls;
  }
  poly.hasBorders = !poly.edit;
  canvas.requestRenderAll();
}