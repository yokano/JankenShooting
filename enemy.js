var enemy = function(){
	var DEFAULT_SHOT_INTERVAL = 2000;
	var DEFAULT_MOVING_TIME = 3500; // Right to left of screen
	
	var hands = [];  // Array of jQuery Objects (hand div tag)
	var timer = null;
	
	var interval = DEFAULT_SHOT_INTERVAL;
	var handMoveInterval = DEFAULT_MOVING_TIME;
	
	// Wait for the next shot
	var wait = function() {
		timer = setTimeout(shot, interval);
		
		if(interval > 400) {
			interval -= interval / 75;
		} else {
			handMoveInterval -= handMoveInterval / 80;
		}
	};
	
	var resetHands = function() {
		hands = [];
	};
	
	var getHands = function() {
		return hands;
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
			duration: interval + handMoveInterval,
			easing: 'linear',
			complete: game.stop  // When got in the far left of the screen
		});
		
		// Animation: Invisible -> Visible immediately after shot
		div.animate({ opacity: 1.0 }, {
			queue: false,
			duration : 500,
			easing: 'linear'
		});
		
		hands.push(div);
		wait(); // wait next shot
	};
	
	// Lose player's hand
	var miss = function() {
		hands[0].explode();
		hands.shift();
	};
	
	// When the game is set
	var stop = function() {
		clearTimeout(timer);
		interval = DEFAULT_SHOT_INTERVAL;
		handMoveInterval = DEFAULT_MOVING_TIME;
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
