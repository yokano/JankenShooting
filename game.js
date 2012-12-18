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
			if(window.confirm(term[currentLang].upload_check)) {
				var name = window.prompt(term[currentLang].input_your_name);
				name = escape(name);
				$.ajax({
					url: '/register',
					async: false,
					success: function(data) {
						console.log(data);
						alert(term[currentLang].registered_ranking);
						alert(term[currentLang].your_rank + ': ' + data.rank);
					},
					data: {
						name: name,
						score: score
					},
					dataType: 'json',
					error: function() {
						alert(term[currentLang].ajax_error);
					}
				});
			}
			
			$('*').stop();
			enemy.stop();
			$(window).unbind('keypress');
			$(window).unbind('keyup');
			$('.shot_button').unbind('click');
			$('#levelup').hide();
			$('.addtional_score').remove();
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
