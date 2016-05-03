var $A$ = (function ($){
//✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹✹  	
var
scuts = [],

html = '',

arrScutCollection = [], // for shortcut category objects, each of which will contain shortcut objects

p = {  // properties (p) .. constants
	filename : 'app.js'
},

$j = { //jQuery (dom) objects ($j)
	shortcuts : $('div#shortcuts'),
	ftContainer : $('div.freetile-container'),
	keys: $('td.keys'),
	element : $('.element')
},	

// Private functions
displayShortcuts, readData, cats2html, cat2tables, addKbdTags, cats2html_nogrid,
loadScript, jsonLoaded,

// Class constructors
Category, Shortcut,

pf = { // public functions (pf)
  init : null
},

//.........................................................
// application (_app)
_app = {}; // for return as APP..WILL-BE made public as return value
//.........................................................

//Public
//_app.$jqo = $j;
_app.functions = pf;

//░░░░░░░░░░░░░░░░░░░░░░
//  END DECLARATIONS //
//░░░░░░░░░░░░░░░░░░░░░░

// Private Class Definitions

Category = function(name){
	this.name = name;
	this.shortcuts = [];
};

Shortcut = function(keys, action, info, style, ident){ 
	this.keys = keys;  // keys is keyboard combination
	this.action = action;
	this.info = info;
	// optional param .. var=param||''; 
	this.scCss = style || '';
	this.scId = ident || '';
};

// Private Functions

//- - - - - - - - - - - -
jsonLoaded = function(){
//- - - - - - - - - - - -
	scuts = $A$.SUBLIME_SHORTCUTS.scuts;
	$A$.SUBLIME_SHORTCUTS.scuts = [];
	readData();
	displayShortcuts();
	console.log('App in filename-' + p.filename + ' init complete');
};


//- - - - - - - - - - - 
readData = function(){ 
//- - - - - - - - - - - 
// The structure of the scuts array is as follows:
// - Each first level element in the array is an array of categories.
// - The categories each contain 2 elements.
//		- element 0 = string (the category name)
//		- element 1 = array (containing an array of shortcuts)
//		- Each shortcut is an array of 3 attribute elements
//			- element 0 = string (spec of shortcut keyboard combination)
//			- element 1 = string (action of the shortcut)
//			- element 2 = string (additional info about the shortcut, e.g. to put into a tool tip)
// Unknowns until processing: 
//	1. The category count
// 2. The shortcut count within each category
// Notes: This isn't the most object-oriented way to deal with the 
// 	shortcut data. Consideration of the tradeoffs between taking
//		an object-oriented approach and the approach implemented,
//		prioritized DRY (Don't Repeat Yourself) in the JSON data (repetition 
//		in the form of repeated attribute names) … and brevity in creation and
//		update of shortcuts within the JSON data.
// Still want to work with objects, so this processing will contruct
// 	the objects we will use to display HTML.

//	Added optional 4th & 5th params. 4=class, 5=id

	console.log('displayShortcuts() initializing');

	var
		i, j, countCats, arrCatSpec, arrScuts, countScuts, oCat, oScut;

	countCats = scuts.length;
	for(i=0;i<countCats;i++){
		arrCatSpec = scuts[i];
		oCat = new Category(arrCatSpec[0]);
		arrScuts = arrCatSpec[1];
		countScuts = arrScuts.length;
		for(j=0;j<countScuts;j++){
			if(arrScuts[j].length == 4){
				oScut = new Shortcut((arrScuts[j])[0], (arrScuts[j])[1], (arrScuts[j])[2], (arrScuts[j])[3]);
			}else{
				oScut = new Shortcut((arrScuts[j])[0], (arrScuts[j])[1], (arrScuts[j])[2]);
			}
			oCat.shortcuts.push(oScut);
		}
		arrScutCollection.push(oCat);
	}

	console.log('displayShortcuts() init complete');
};

//- - - - - - - - - - - - - - -
displayShortcuts = function(){ 
//- - - - - - - - - - - - - - -
	$j.shortcuts.html(cats2html_nogrid());
	$j.shortcuts.freetile({
	    animate: true,
	    elementDelay: 30
	});
};

//- - - - - - - - - - - - - -
addKbdTags = function(keys){
//- - - - - - - - - - - - - -
	keys = keys.replace(/(\←|\→|\↓|\↑|PgUp|PgDn|([NP].[\s\S])|\#|\.|\[|\]|`|;|:|\/|([A-Z]?\w+))/g,"<kbd>$1</kbd>");
	return keys;
};

//- - - - - - - - - - - - - - -
cats2html_nogrid = function(){
//- - - - - - - - - - - - - - -
var
	i, catCount, html='';

	// arrScutCollection contains Category objects
	catCount = arrScutCollection.length;
	for(i=0;i<catCount; i++){
		html += '<div class="element">';
		html += '<h4>' + arrScutCollection[i].name  + '</h4>';
		html += cat2tables(arrScutCollection[i]);
		html += '</div>';
	}
	return html;
};

//- - - - - - - - - - - 
cats2html = function(){
//- - - - - - - - - - - 
var
	i, catCount, html='';

	// arrScutCollection contains Category objects
	catCount = arrScutCollection.length;
	for(i=0;i<catCount; i++){
		if(!(i%4)){
			html += '<div class="row">';
		}
		html += '<div class="col-md-3">';
		html += '<h3>' + arrScutCollection[i].name  + '</h3>';
		html += cat2tables(arrScutCollection[i]);
		html += '</div>';
		if((i%4) == 3){
			html += '</div>';
		}
	}
	if((i%4) != 3){ // if previous loop exits before row can be closed.
		html += '</div>';
		console.log('closed open div.row tag');
	}
	console.log('i = ' + i);
	return html;
};

//- - - - - - - - - - - - - 
cat2tables = function(cat){
//- - - - - - - - - - - - - 
	var
		i, shortcutCount, html;

	shortcutCount = cat.shortcuts.length;
	html = '<table role="grid">';
	for(i=0;i<shortcutCount; i++){
		if(cat.shortcuts[i].scCss != ""){
			html += '<tr class="' + cat.shortcuts[i].scCss + '">';
		}else{
			html += '<tr>';
		}
		html += '<td class="keys">';
		//html += cat.shortcuts[i].keys + '</td><td class="action">';
		if(cat.shortcuts[i].scCss != ""){
			html += cat.shortcuts[i].keys + '</td><td class="action">';
		}else{
			html += addKbdTags(cat.shortcuts[i].keys) + '</td><td class="action">';
		}
		html += cat.shortcuts[i].action + '</td><td class="info">';
		html += cat.shortcuts[i].info + '</td></tr>';
	}
	html += '</table>';
	return html;
};

//- - - - - - - - - - - - - - - - - - -
loadScript = function (url, callback){
//- - - - - - - - - - - - - - - - - - -
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
};

// Public functions

//❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚
_app.init = function (){
//❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚❚
	console.log('App in filename-' + p.filename + ' initializing');
	loadScript('js/keyboard_shortcuts.js', jsonLoaded)
};

//- - - - - - - - - - - - - - - - - - - - - - - - - - -
// $A$ will have an attribute named 'SUBLIME_SHORTCUTS', 
// 'SUBLIME_SHORTCUTS' is a reference to '_app'
return {SUBLIME_SHORTCUTS : _app}; 
//✹✹✹✹✹✹✹✹
}(jQuery));
//✹✹✹✹✹✹✹✹

$(document).ready(function() {
	$(document).foundation();
	$A$.SUBLIME_SHORTCUTS.init();
});


