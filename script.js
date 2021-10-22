// Please note: dragging and dropping images only works for
// certain browsers when serving this script online:

var values = {
	amount: 30
};

var raster,
	group;
var piece = createPiece();
var count = 0;

handleImage('mona');

var text = new PointText({
	point: view.center,
	justification: 'center',
	fillColor: 'white',
  textfont: 'Poppins',
	fontSize: 20,
	content: window.FileReader
		? 'Drag & drop an image from your desktop'
		: 'To drag & drop images, please use Webkit, Firefox, Chrome or IE 10'
});

function createPiece() {
	var group = new Group();
	var myPolygon = new Path.RegularPolygon({
		center: view.center,
		sides: 6,
		radius: 50,
		fillColor: 'gray',
		parent: group
	});
	for (var i = 0; i < 2; i++) {
		var path = new Path({
			closed: true,
			parent: group,
			fillColor: i == 0 ? '#FFD6FF' : '#A385FF'
		});
		for (var j = 0; j < 3; j++) {
			var index = (i * 2 + j) % myPolygon.segments.length;
			path.add(myPolygon.segments[index].clone());
		}
		path.add(myPolygon.bounds.center);
	}
	// Remove the group from the document, so it is not drawn:
	group.remove();
	return group;
}

function handleImage(image) {
	count = 0;
	var size = piece.bounds.size;

	if (group)
		group.remove();

	// As the web is asynchronous, we need to wait for the raster to
	// load before we can perform any operation on its pixels.
	raster = new Raster(image);
	raster.visible = false;
	raster.on('load', function() {
		// Transform the raster, so it fills the view:
		raster.fitBounds(view.bounds, true);
		group = new Group();
		for (var y = 0; y < values.amount; y++) {
			for (var x = 0; x < values.amount; x++) {
				var copy = piece.clone();
				copy.position += size * [x + (y % 2 ? 0.5 : 0), y * 0.75];
				group.addChild(copy);
			}
		}

		// Transform the group so it covers the view:
		group.fitBounds(view.bounds, true);
		group.scale(1.1);
	})
}

function onFrame(event) {
	if (!group)
		return;
	// Loop through the uncolored myPolygons in the group and fill them
	// with the average color:
	var length = Math.min(count + values.amount, group.children.length);
	for (var i = count; i < length; i++) {
		piece = group.children[i];
		var myPolygon = piece.children[0];
		var color = raster.getAverageColor(myPolygon);
		if (color) {
			myPolygon.fillColor = color;
			var top = piece.children[1];
			top.fillColor = color.clone();
			top.fillColor.brightness *= 1.5;

			var right = piece.children[2];
			right.fillColor = color.clone();
			right.fillColor.brightness *= 0.5;
		}
	}
	count += values.amount;
}

function onResize() {
	project.activeLayer.position = view.center;
}

function onDocumentDrag(event) {
	event.preventDefault();
}

function onDocumentDrop(event) {
	event.preventDefault();

	var file = event.dataTransfer.files[0];
	var reader = new FileReader();

	reader.onload = function(event) {
		var image = document.createElement('img');
		image.onload = function () {
			handleImage(image);
			view.draw();
		};
		image.src = event.target.result;
	};
	reader.readAsDataURL(file);
}

document.addEventListener('drop', onDocumentDrop, false);
document.addEventListener('dragover', onDocumentDrag, false);
document.addEventListener('dragleave', onDocumentDrag, false);
