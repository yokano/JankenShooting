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
		div.append($('<div class="additional_score"></div>'));
		div.appendTo($('#game'));
		div.animate({left: '800px'}, 3000, 'easeOutQuad', out);
		hands.push(div);
	};
	
	var showAdditionalScore = function(score) {
		$('.additional_score:eq(0)').stop().html('+'+score).effect('bounce', 500, function() {
			$(this).stop().empty();  // Show 500ms only
		});
	};
	
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
		miss: miss,
		out: out,
		back: back
	};
}();
