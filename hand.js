var hand = function(kind) {
	var div = $('<div class="hand"></div>');
	div.attr('hand', kind);
	div.css('background-image', 'url("img/' + kind + '.png")');
	
	var explode = function() {
		$(this).stop(true).effect('explode', 'easeOutExpo', 250, function() {
			$(this).remove();
		});
	};
	
	var back = function() {
		$(this).stop().hide('drop', 100, function() {
			$(this).remove();
		});
	};
	
	div.back = back;	
	div.explode = explode;
	return div;
};
