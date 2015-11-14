var fs = require('fs');

var root_path = "E:/node/study";

function walk_path(path) {
	fs.readdir(path, function(err, file) {
		console.log(file);
		process.exit();
		file.forEach(function(item) {
			var stat = fs.statSync(path+'/'+item);
			if( stat.isDirectory() ) {
				walk_path(path+'/'+item);
			}
			else
				console.log(item);
		});
	});

	return;
}

walk_path(root_path);