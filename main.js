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
	(new Image()).src  =  'img/ranking_hover.png';
	
	game.showTitle();
	
	// Initialize interfaces below
	$('#mute').click(game.toggleMute);
	
	// KeyConfig
	var keyChange = function() {
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
			alert(term[currentLang].no_inputted_key);
		} else if (Object.keys(checker).length < 4) {
			alert(term[currentLang].duplicated_keys);
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
	};
	
	var updateText = function() {
		var explanation = $('#explanation');
		explanation.empty();
		for(var i in term[currentLang].explanation) {
			explanation.append($('<p>' + term[currentLang].explanation[i] + '</p>'));
		}
		$('#dialog .ui-dialog-title').html(term[currentLang].how_to_play);
		$('#gu_label').html(term[currentLang].gu);
		$('#tyoki_label').html(term[currentLang].tyoki);
		$('#pa_label').html(term[currentLang].pa);
		$('#back_label').html(term[currentLang].back);
		$('#key_change_button').html(term[currentLang].change_key_config);
	};
	
	var changeLang = function(lang) {
		currentLang = lang;
		updateText();
	};
	
	// Modal of help
	$('#dialog').dialog({
		autoOpen: false,
		width: 500,
		show: { effect:'fade', duration:200 },
		hide: { effect:'fade', duration:200 },
		draggable: false,
		resizable: false,
		buttons: [
			{text:'English', id:'english', class:'language', click:function(){changeLang('en');}},
			{text:'日本語', id:'japanese', class:'language', click:function(){changeLang('ja');}},
			{text:'キー設定を変更', id:'key_change_button', click:keyChange}
		]
	});
	
	// Open modal when ? button clicked
	$('#help').click(function() {
		$('#dialog').dialog('open');
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
	
	// ranking modal
	$('#ranking_modal').dialog({
		autoOpen: false,
		width: 300,
		height: 500,
		show: { effect:'fade', duration:200 },
		hide: { effect:'fade', duration:200 }
	});
	
	// Bind ranking button event
	var rankingTimeStamp = 0;
	$('#ranking_button').click(function() {
		var currentTime = (new Date()).getTime();
		
		// 5sec ajax confinement
		if(currentTime - rankingTimeStamp > 5000) {
			$.ajax({
				url: '/get',
				success: function(json) {
					var datas = JSON.parse(json);
					var rankingList = $('#ranking_list');
					rankingList.empty();
					for(var i in datas) {
						$('<li></li>').html(unescape(datas[i].name) + '(' + datas[i].score + 'pt)').appendTo(rankingList)
					}
					$('#ranking_modal').dialog('open');
				},
				error: function() {
					alert(term[currentLang].ajax_error);
				}
			});
			rankingTimeStamp = currentTime;
		} else {
			$('#ranking_modal').dialog('open');
		}
	});

});
