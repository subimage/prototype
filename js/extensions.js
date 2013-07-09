var extensions;

function showextensions( result )
{
	if(result != undefined && result.responseJSON != undefined)
	{
		extensions = result.responseJSON;
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
	new Ajax.Request('js/extension_list.json',{'method':'get','onSuccess':showextensions})
});