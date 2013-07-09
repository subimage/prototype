var extensions_text = '[{"name":"Twitter BootStrap for Prototype","descrip":"For those developers that use PrototypeJS, Twitter Bootstrap requires the use of jQuery. If you do not want to load another library use this fork of Twitter Bootstrap.","demo":"bootstrap-prototype.html","github":"https://github.com/jwestbrook/bootstrap-prototype"},{"name":"Growler","descrip":"Growler is a PrototypeJS based class that displays unobtrusive notices on a page similar to OSX Growl.","demo":"growler.html","github":"https://github.com/jwestbrook/Prototype.Growler"},{"name":"Sortable","descrip":"Sortable Tables","demo":"sortable.html","github":"https://github.com/jwestbrook/Prototype.Sortable"},{"name":"Wipes","descrip":"Wipes is an add-on method for the Effect namespace in the Script.aculo.us library.","demo":"wipes.html","github":"https://github.com/jwestbrook/Prototype.Wipes"},{"name":"Watermark","descrip":"Watermark is a PrototypeJS based class that emulates the HTML5 placeholder attribute for Internet Explorer.","demo":"watermark.html","github":"https://github.com/jwestbrook/Prototype.Watermark"},{"name":"3DImageReflection","descrip":"3D image reflection with Javascript","demo":"imagereflection.html","github":"https://github.com/jwestbrook/Prototype.3DImageReflection"},{"name":"AJAX-Rating-Stars","descrip":"AJAX Rating Stars using PrototypeJS","demo":"ajaxratingstars.html","github":"https://github.com/jwestbrook/Prototype.AJAX-Rating-Stars"},{"name":"FullColorPicker","descrip":"PrototypeJS based color picker with fill HSB and RGB options of Adobe Photoshops picker","demo":"fullcolorpicker.html","github":"https://github.com/jwestbrook/Prototype.FullColorPicker"}]';
var extensions;

function showextensions( result )
{
	if(result != undefined && result.responseJSON != undefined)
	{
		extensions = result.responseJSON;
	}
	else
	{
		extensions = extensions_text.evalJSON();
	}

	var span = new Element('div',{'class':'extension-blocks'});

	var perrow = 1;

	extensions.each(function(ext){
		var t = span.clone(true);
		t.update(new Element('h3').update(ext.name));
		if(ext.descrip != undefined)
		{
			t.insert(new Element('p').update(ext.descrip));
		}
		if(ext.demo != undefined && ext.demo.length > 0)
		{
			t.insert(new Element('a',{'class':'btn','href':'demos/'+ext.demo}).update('Demo'));
		}
		if(ext.github != undefined && ext.github.length > 0)
		{
			t.insert(new Element('a',{'class':'btn','href':ext.github,'_target':'_blank'}).update('GitHub Repo'));
		}
		$('extensions_list').insert(t);
	});

//	console.log(extensions);
}

document.observe('dom:loaded',function(){
//	new Ajax.Request('js/extension_list.json',{'method':'get','onSuccess':showextensions})
	showextensions()
});