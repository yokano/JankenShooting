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
