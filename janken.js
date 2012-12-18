var currentLang = 'ja';
var term = {
	en: {
		explanation: [
			"Let's blast enemy's hands!",
			'You can shoot the Rock, Scissors, Paper by press key. You can rapid-fire.',
			"You will get the combo bonus if you blast enemy's hands at one hand.",
			"But if your hand blasted by enemy's hand, you lost points. When your hand was almost blast, back your hand in a flash.",
			'Configure key settings by input to textboxes below.'
		],
		gu: 'Rock',
		tyoki: 'Scissors',
		pa: 'Paper',
		back: 'Back a hand',
		change_key_config: 'Change key settings',
		how_to_play: 'How to play Janken Shooting!',
		no_inputted_key: 'Some textbox not inputted.',
		duplicated_keys: 'Some keys are duplicated.',
		congrats: 'Congratulations! You cleared all levels!'
	},
	ja: {
		explanation: [
			'画面右から迫ってくるグー、チョキ、パーを破壊しよう！',
			'キーを押すとグー、チョキ、パーを飛ばせるぞ！連射も可能だ！',
			'連続して相手の手を破壊するとコンボボーナスがもらえるぞ！',
			'相手の手に破壊されると減点されるから要注意だ！そんなときは出した手を急いで引っ込めてしまおう！',
			'下のテキストボックスに好きなキーを設定できるぞ！'
		],
		gu: 'グー',
		tyoki: 'チョキ',
		pa: 'パー',
		back: '出した手を引っ込める',
		change_key_config: 'キー設定を変更する',
		how_to_play: 'じゃんけんシューティング！の遊び方',
		no_inputted_key: '入力されていないキーがあります',
		duplicated_keys: '重複したキーが設定されています',
		congrats: 'おめでとう！すべてのレベルをクリアしました！'
	}
};var hand = function(kind) {
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
var player = function() {
	var hands = [];  // Array of jQuery objects (div)
	var SHOT_INTERVAL = 100; // (ms)
	var prev = 0;
	var now = 0;
	
	var getHands = function() {
		return hands;
	};
	
	var resetHands = function() {
		$('.hand').stop().remove();
		hands = [];
	};
	
	var shot = function(kind) {
		// Check shot interval
		var now = (new Date()).getTime();
		if(now - prev < SHOT_INTERVAL) {
			return;
		}
		prev = now;
		
		var div = hand(kind);
		div.appendTo($('#game'));
		div.animate({left: '800px'}, 3000, 'easeOutQuad', out);
		hands.push(div);
	};
	
	var showAdditionalScore = function(score) {
		var pos = hands[0].position();
		var additionalScore = $('<div class="additional_score">+' + score + '</div>');
		additionalScore.css('top', pos.top).css('left', pos.left).hide().appendTo($('#game'));
		additionalScore.show('bounce', 500, function() {
			var pos = $('#score').position();
			$(this).animate({
				left: pos.left,
				top: pos.top + 25,
				'font-size': '15px'
			}, 500, function() {
				$(this).remove();
				game.addScore(score);
			});
		});
	};
	
	var showSubtractiveScore = function(score) {
		var pos = hands[0].position();
		var additionalScore = $('<div class="subtractive_score">-' + score + '</div>');
		additionalScore.css('top', pos.top).css('left', pos.left).hide().appendTo($('#game'));
		additionalScore.show('bounce', 500, function() {
			var pos = $('#score').position();
			$(this).animate({
				left: pos.left,
				top: pos.top + 25,
				'font-size': '15px'
			}, 500, function() {
				$(this).remove();
				game.missScore(score);
			});
		});
	}
	
	// Lose enemy's hand
	var miss = function() {
		hands[0].explode();
		hands.shift();
	};
	
	// Remove a hand when it got in the far right of the screen
	var out = function() {
		game.resetGain();
		if(hands.length > 0) {
			hands[0].fadeOut($(this).remove);
			hands.shift();
		}
	};
	
	var back = function() {
		if(hands.length > 0) {
			hands[0].back();
			hands.shift();
		}
	};
	
	// Public interface
	return {
		getHands: getHands,
		resetHands: resetHands,
		shot: shot,
		showAdditionalScore: showAdditionalScore,
		showSubtractiveScore: showSubtractiveScore,
		miss: miss,
		out: out,
		back: back
	};
}();
var enemy = function(){
	var DEFAULT_SHOT_INTERVAL = 1000;
	var DEFAULT_MOVING_TIME = 4000; // Right to left of screen
	var SHOT_INTERVAL_MARGIN = 0;
	var MOVING_TIME_MARGIN = 1000;  // Add margin for moving time
	var MAX_LEVEL = 5;  // Index from 1
	
	var hands = [];  // Array of jQuery Objects (hand div tag)
	var timer = null;
	var level = 1;
	var shotCount = 0;  // For condition of level up
	
	var shotInterval = DEFAULT_SHOT_INTERVAL;
	var movingTime = DEFAULT_MOVING_TIME;
	
	// Wait for the next shot
	var wait = function() {
		// Speed up next shot
		shotInterval -= shotInterval / 75;
		movingTime -= movingTime / 75;
		
		timer = setTimeout(shot, shotInterval + SHOT_INTERVAL_MARGIN);		
	};
	
	var resetHands = function() {
		hands = [];
	};
	
	var getHands = function() {
		return hands;
	};
	
	var levelUp = function() {
		level++;

		var action;
		if(level > MAX_LEVEL) {
			action = game.clear;
		} else {
			action = function() {
				player.resetHands();
				enemy.resetHands();
				shotInterval += 500;
				movingTime += 1000;
				game.showLevelUp(level, shot);
			}
		}
		
		timer = setInterval(function() {
			if(hands.length == 0) {
				clearInterval(timer);
				action();
			}
		}, 1000);
	};
	
	// Shot random hand
	var shot = function() {
		var randomHand = ['gu', 'tyoki', 'pa'][Math.floor(Math.random() * 3)];
		var div = hand(randomHand);
		div.addClass('enemy');
		div.css('opacity', 0);  // Invisible at first
		div.appendTo($('#game'));
		
		// Animation: Go to left
		div.animate({ left: '0px'}, {
			duration: movingTime + MOVING_TIME_MARGIN,
			easing: 'linear',
			complete: game.stop  // When got in the far left of the screen
		});
		
		// Animation: Invisible -> Visible immediately after shot
		div.animate({ opacity: 1.0 }, {
			queue: false,
			duration : movingTime / 5,
			easing: 'linear'
		});
		
		hands.push(div);
		shotCount++;
		
		// check level up
		if(shotCount > level * level * 15) {
			levelUp();
		} else {
			wait(); // Wait next shot
		}
	};
	
	// Lose player's hand
	var miss = function() {
		hands[0].explode();
		hands.shift();
	};
	
	// When the game is set
	var stop = function() {
		clearTimeout(timer);
		clearInterval(timer);
		level = 1;
		shotCount = 0;
		shotInterval = DEFAULT_SHOT_INTERVAL;
		movingTime = DEFAULT_MOVING_TIME;
	};
	
	// Public interface
	return {
		resetHands: resetHands,
		getHands: getHands,
		shot: shot,
		miss: miss,
		stop: stop
	};
}();
var game = function() {
	var COMBO_RATE = 2;
	var SUBTRACTIVE_SCORE = 100;
	var COLLISION_LOOP_INTERVAL = 50;  // ms
	var DEFAULT_GAIN = 10;
	var isVictory = {
		"gu": {
			"tyoki": true,
			"pa": false	
		},
		"tyoki": {
			"pa": true,
			"gu": false
		},
		"pa": {
			"gu": true,
			"tyoki": false	
		}
	};
	
	var isFinish = false;
	var score = 0;
	var addScore = function(s) {
		var div = $('#score');
		var target = score + s;
		if(div.html() != score) {
			div.html(score);
		}
		var now = score;
		var count = function() {
			div.html(now);
			if(target > now) {
				now++;
				timer = setTimeout(count, 10);
			} else {
				clearTimeout(timer);
			}
		};
		var timer = setTimeout(count, 10);
		score = target;
	};
	var missScore = function(s) {
		var div = $('#score');
		var target = score - s;
		if(div.html() != score) {
			div.html(score);
		}
		if(target < 0) {
			target = 0;
		}
		var now = score;
		var count = function() {
			div.html(now);
			if(target < now) {
				now--;
				timer = setTimeout(count, 10);
			} else {
				clearTimeout(timer);
				div.css('color', 'white');
			}
		};
		div.css('color', 'red');
		var timer = setTimeout(count, 10);
		score = target;
	};
	
	var comboCount = 1;  // For combo sounds
	
	var keySettings = {
		gu: 122,
		tyoki: 120,
		pa: 99,
		back: 118
	};
	
	var getCommand = function(char) {
		for(var key in keySettings) {
			if(keySettings[key] == char) {
				return key;
			}
		}
	};
	
	var keypress = function(e) {
		var command = getCommand(e.charCode);
		if(command == 'back') {
			resetGain();
			player.back();
			if(trigger == 'click') {
				$('#back').css('background-image', 'url("img/back_button_hover.png")');
			}
		} else if(command == 'gu' || command == 'tyoki' || command == 'pa') {
			player.shot(command);
			if(trigger == 'click') {
				$('#shot_' + command).css('background-image', 'url("img/' + command + '_button_hover.png")');
			}
		}
	}; 
	
	var keyup = function(e) {
		var command = getCommand(e.keyCode + 32);  // BIG LETTER -> small letter : for jQuery
		if(trigger == 'click' && command == 'back') {
			$('#back').css('background-image', 'url("img/back_button.png")');
		} else {
			$('#shot_' + command).css('background-image', 'url("img/' + command + '_button.png")');
		}
	}
	
	var sounds = [];
	for(var i = 0; i <= 6; i++) {
		var se = new Audio('');
		se.src = 'sound/se' + i + '.mp3';
		sounds.push(se);
	}
	var seMiss = new Audio('');
	seMiss.src = ('sound/miss.mp3');
	
	var currentGain = DEFAULT_GAIN; // For combo
	var collisionCheck = function() {
		var playerHands = player.getHands();
		var enemyHands = enemy.getHands();
		
		// Check player's hand and enemy's hand.
		if(playerHands.length != 0 && enemyHands.length != 0) {
			var pp = playerHands[0].position();
			var ep = enemyHands[0].position();
			
			// Check collision
			if(pp.left <= ep.left && ep.left <= pp.left + 100) {
				// Run off
				if(playerHands[0].attr('hand') == enemyHands[0].attr('hand')) {
					// Draw
					player.miss();
					enemy.miss();
					resetGain();
				} else if(isVictory[playerHands[0].attr('hand')][enemyHands[0].attr('hand')]) {
					// Win
					enemy.miss();
					player.showAdditionalScore(currentGain);
					currentGain = Math.floor(currentGain * COMBO_RATE);
					sounds[comboCount % 7].play();
					comboCount++;
				} else {
					// Lose
					player.showSubtractiveScore(SUBTRACTIVE_SCORE);
					player.miss();
					resetGain();
					seMiss.play();
				}
			}
		}
	};
	
	var showTitle = function() {
		$('#title').fadeIn();
		
		// Blink "Click to start"
		var message = $('#click_to_start');
		var on = function() { message.fadeIn('slow', off) };
		var off = function() { message.fadeOut('slow', on) };
		off();
		
		$('#title').click(function() {
			$(this).unbind('click').hide('fade', 300, function() {
				game.start();
			});
		});
	};
	
	var collisionLoop;
	var start = function() {
		$(window).keypress(keypress);
		$(window).keyup(keyup);
		$('#shot_gu').bind(trigger, function(e) {
			e.preventDefault();
			keypress({charCode: keySettings.gu});
		});	
		$('#shot_tyoki').bind(trigger, function(e) {
			e.preventDefault();
			keypress({charCode: keySettings.tyoki});
		});
		$('#shot_pa').bind(trigger, function(e) {
			e.preventDefault();
			keypress({charCode: keySettings.pa});
		});
		$('#back').bind(trigger, function(e) {
			e.preventDefault();
			keypress({charCode: keySettings.back});
		});
		
		$('#score').html(0);
		comboCount = 1;
		collisionLoop = setInterval(collisionCheck, COLLISION_LOOP_INTERVAL);
		showLevelUp(1, enemy.shot);
	};
	
	var stop = function() {
		if(!isFinish) {
			isFinish = true;
			comboCount = 1;
			clearInterval(collisionLoop);
			alert('GAME OVER  SCORE:' + score);
			$('*').stop();
			enemy.stop();
			$(window).unbind('keypress');
			$(window).unbind('keyup');
			$('.shot_button').unbind('click');
			$('#levelup').hide();
			$('.additonal_score').remove();
			$('.subtractive_score').remove();
			
			// Return to title
			setTimeout(function() {
				player.resetHands();
				enemy.resetHands();
				score = 0;
				isFinish = false;
				showTitle();
			}, 500);
		}	
	};
	
	var resetGain = function() {
		currentGain = DEFAULT_GAIN;
		comboCount = 1;
	};
	
	var changeKeySettings = function(setting) {
		$('#char_gu').html(String.fromCharCode(setting.gu));
		$('#char_tyoki').html(String.fromCharCode(setting.tyoki));
		$('#char_pa').html(String.fromCharCode(setting.pa));
		$('#char_back').html(String.fromCharCode(setting.back));
		keySettings = setting;
	};
	
	// Clear all levels
	var clear = function() {
		alert(term[currentLang].congrats);
		stop();
	};
	
	var clearSE = new Audio('');
	clearSE.src = 'sound/clear.mp3';
	var showLevelUp = function(level, callback) {
		clearSE.play();
		if(callback == undefined) {
			callback = function(){};
		}
		$('#levelup').hide('slide', {direction: 'left'}, function() {
			$(this).html('Level ' + level);
			setTimeout(function() {
				$('#levelup').show('slide', {direction: 'right'}, callback);
			}, 500);
		});
	};
	
	// Public
	return {
		start: start,
		stop: stop,
		resetGain: resetGain,
		changeKeySettings: changeKeySettings,
		showTitle: showTitle,
		clear: clear,
		showLevelUp: showLevelUp,
		addScore: addScore,
		missScore: missScore
	};
}();
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
		$('.ui-dialog-title').html(term[currentLang].how_to_play);
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

});
