var game = function() {
	var COMBO_RATE = 2.5;
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
		score += s;
		$('#score').html(score);
	};
	var missScore = function(s) {
		score -= s;
		if(score < 0) {
			score = 0;
		}
		$('#score').html(score);
	};
	
	var se = new Audio('');
	se.src = 'sound/se.mp3';
	
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
			currentGain = 10;
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
				if(!isMute) {
					se.play();
				}
				
				// Run off
				if(playerHands[0].attr('hand') == enemyHands[0].attr('hand')) {
					// Draw
					player.miss();
					enemy.miss();
					currentGain = DEFAULT_GAIN;
				} else if(isVictory[playerHands[0].attr('hand')][enemyHands[0].attr('hand')]) {
					// Win
					enemy.miss();
					addScore(currentGain);
					player.showAdditionalScore(currentGain);
					currentGain = Math.floor(currentGain * COMBO_RATE);
				} else {
					// Lose
					player.miss();
					missScore(20);
					currentGain = DEFAULT_GAIN;
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
		collisionLoop = setInterval(collisionCheck, COLLISION_LOOP_INTERVAL);
		showLevelUp(1, enemy.shot);
	};
	
	var stop = function() {
		if(!isFinish) {
			isFinish = true;
			clearInterval(collisionLoop);
			alert('ゲーム終了　' + score + '点');
			$('*').stop();
			enemy.stop();
			$(window).unbind('keypress');
			$(window).unbind('keyup');
			$('.shot_button').unbind('click');
			$('#levelup').hide();
			
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
		alert('おめでとう！ゲームクリアです！');
		stop();
	};
	
	var showLevelUp = function(level, callback) {
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
	
	var isMute = false;
	var toggleMute = function() {
		isMute = !isMute;
		if(isMute) {
			$('#mute').addClass('on');
		} else {
			$('#mute').removeClass('on');
		}
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
		toggleMute: toggleMute
	};
}();
