// If client is tablet, trigger is touchstart. Else click.
var trigger = (window.ontouchstart === null) ? 'touchstart' : 'click';

$(function() {
	// preload
	(new Image()).src  =  'img/back_button_hover.png';
	(new Image()).src  =  'img/gu_button_hover.png';
	(new Image()).src  =  'img/pa_button_hover.png';
	(new Image()).src  =  'img/tyoki_button_hover.png';
	(new Image()).src  =  'img/gu.png';
	(new Image()).src  =  'img/pa.png';
	(new Image()).src  =  'img/tyoki.png';
	
	game.showTitle();
	
	// Initialize interfaces below
	$('#mute').click(game.toggleMute);
	
	// Modal of help
	$('#dialog').dialog({
		autoOpen: false,
		width: 500,
		show: { effect:'fade', duration:200 },
		hide: { effect:'fade', duration:200 },
		draggable: false,
		resizable: false
	});
	
	// Open modal when ? button clicked
	$('#help').click(function() {
		$('#dialog').dialog('open');
	});
	
	// KeyConfig
	$('#key_change').button().click(function() {
		var guKey = $('#gu_key').val();
		var tyokiKey = $('#tyoki_key').val();
		var paKey = $('#pa_key').val();
		var backKey = $('#back_key').val();
		
		guKey = guKey.toLowerCase();
		tyokiKey = tyokiKey.toLowerCase();
		paKey = paKey.toLowerCase();
		backKey = backKey.toLowerCase();
				
		// Assign inputted character to empty object.
		// If keys are duplicative, those will be overrided and reduces the number of elements.
		var checker = {};
		checker[guKey] = null;
		checker[tyokiKey] = null;
		checker[paKey] = null;
		checker[backKey] = null;
		
		if(guKey == '' || tyokiKey == '' || paKey == '' || backKey == '') {
			alert('入力されていないキーがあります');
		} else if (Object.keys(checker).length < 4) {
			alert("重複したキーが設定されています");
		} else {
			var settings = {
				'gu': guKey.charCodeAt(0),
				'tyoki': tyokiKey.charCodeAt(0),
				'pa': paKey.charCodeAt(0),
				'back': backKey.charCodeAt(0)
			};
			game.changeKeySettings(settings);
			$('#dialog').dialog('close');
		}
	});
	
	// Bind events shot buttons
	if(trigger == 'click') {
		$(['gu', 'tyoki', 'pa']).each(function(_, hand) {
			$('#shot_'+hand).hover(function() {
				$(this).css('background-image', 'url("img/'+hand+'_button_hover.png")');
			}, function() {
				$(this).css('background-image', 'url("img/'+hand+'_button.png")');
			});
		});
		$('#back').hover(function() {
			$(this).css('background-image', 'url("img/back_button_hover.png")');
		}, function() {
			$(this).css('background-image', 'url("img/back_button.png")');
		});
	}
	
	// If smartphone, mute by defalut.
	if(trigger == 'touchstart') {
		$('#mute').click();
	}

});
