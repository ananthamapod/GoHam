// Saves options to chrome.storage
function save_options() {
  var disable = document.getElementById('disable').checked;
  var suffix = document.getElementById('suffix').value;
  var hints = document.getElementById('hints').checked;
  chrome.storage.sync.set({
	disable: disable,
    suffix: suffix,
	hints: hints
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function reload_tab() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.reload(tabs[0].id);
	});
	document.getElementById('status').removeEventListener('DOMSubtreeModified', reload_tab);
}

function save_then_reload_tab() {
	document.getElementById('status').addEventListener('DOMSubtreeModified', reload_tab);
	save_options();
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
	disable: false,
    suffix: 'way',
	hints: false
  }, function(items) {
	document.getElementById('disable').checked = items.disable;
    document.getElementById('suffix').value = items.suffix;
	document.getElementById('hints').checked = items.hints;
	toggle();
  });
}

function toggle(){
	if (document.getElementById('disable').checked) {
		document.getElementById('suffix').disabled = true;
		document.getElementById('hints').disabled = true;
	} else {
		document.getElementById('suffix').disabled = false;
		document.getElementById('hints').disabled = false;
	}
}

document.getElementById('disable').addEventListener('click', toggle);
document.addEventListener('DOMContentLoaded', restore_options);
if ( document.getElementById('save') ) document.getElementById('save').addEventListener('click', save_options);
if ( document.getElementById('save_reload') ) document.getElementById('save_reload').addEventListener('click', save_then_reload_tab);
