/**
 * HTML5 Drag and Drop
 *
 * Reference:
 *  http://www.html5rocks.com/en/tutorials/dnd/basics/
 *
 */

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  $('#plate').addClass('active');
  evt.dataTransfer.dropEffect = 'copy';
}

function handleDragLeave(evt) {
  $('#plate').removeClass('active');
}

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  // FIXME: not the place for DOM updates
  cleanupOldPack();
  $('#working').show();

  var files = evt.dataTransfer.files; // FileList object.

  // files is a FileList of File objects. List some properties.
  var output = [];
  for (var i = 0, f; f = files[i]; i++) {
      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          newMenu(e.target.result);
        };
      })(f);

      reader.readAsText(f);
  }

  handleDragLeave(evt);
}

// Setup the dnd listeners.
var dropbox = document.getElementById('plate');
dropbox.addEventListener('dragover', handleDragOver, false);
dropbox.addEventListener('dragleave', handleDragLeave, false);
dropbox.addEventListener('drop', handleFileSelect, false);
