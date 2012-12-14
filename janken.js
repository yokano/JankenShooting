// 手のDOM(DIVタグ)
var handDiv = function(hand) {
	var div = $('<div class="hand"></div>');
	div.attr('hand', hand);
	div.css('background-image', 'url("img/' + hand + '.png")');
	
	div.explode = function() {
		$(this).stop(true).effect('explode', 'easeOutExpo', 250, function() {
			$(this).remove();
		});
	}
	
	div.breakout = function() {
		$(this).stop().hide('drop', 100, function() {
			$(this).remove();
		});		
	};
	
	return div;
};

var player = function() {
	var hands = [];
		
	return {
		getHands: function() {
			return hands;
		},
		
		resetHands: function() {
			hands = [];
		},
		
		shot: function(hand) {
			var div = handDiv(hand);
			div.appendTo($('#game'))
			div.animate({left: '800px'}, 3000, 'easeOutQuad', function() {
				player.out();
			});
			div.append($('<div class="gain"></div>'));
			hands.push(div);
		},
		
		gain: function(score) {
			$('.gain:eq(0)').stop().html('+'+score).effect('bounce', 500, function() {
				$(this).stop().empty();
			});
		},
		
		miss: function() {
			hands[0].explode();
			hands.shift();
		},
		
		out: function() {
			game.resetGain();
			hands[0].fadeOut(function() {
				$(this).remove();	
			});
			hands.shift();
		},
		
		breakout: function() {
			hands[0].breakout();
			hands.shift();
		}		
	};
}();



var enemy = function(){
	var DEFAULT_SHOT_INTERVAL = 2000;
	var DEFAULT_MOVING_TIME = 3500;	
	
	var hands = [];
	var timer = null;
	var interval = DEFAULT_SHOT_INTERVAL;
	var handMoveInterval = DEFAULT_MOVING_TIME;
	var isFinish = false;
	
	var wite = function() {
		timer = setTimeout(shot, interval);
		
		// 400ms までは相手の手が出てくる間隔が短くなり続ける
		if(interval > 400) {
			interval -= interval / 75;
		} else {
			// それ以上は間隔固定で手の移動スピードのみ上がる
			handMoveInterval -= handMoveInterval / 80;
		}
	};
	
	// game stop
	var stop = function() {
		clearTimeout(timer);
		interval = DEFAULT_SHOT_INTERVAL;
		handMoveInterval = DEFAULT_MOVING_TIME;
	};
	
	var shot = function() {
		var hand = ['gu', 'tyoki', 'pa'][Math.floor(Math.random() * 3)];
		var div = handDiv(hand);
		div.addClass('enemy');
		div.css('opacity', 0);
		div.appendTo($('#game'));
		div.animate({ left: '0px' }, {
			duration: interval + handMoveInterval,
			easing: 'linear',
			complete: game.lose
		});
		div.animate({ opacity:1 }, {
			queue: false,
			duration : 500,
			easing: 'linear'
		});
		hands.push(div);
		wite();
	};
	
	return {
		resetHands: function() {
			hands = [];
		},
		
		getHands: function() {
			return hands;
		},
		
		shot: shot,
		
		miss: function() {
			hands[0].explode();
			hands.shift();
		},
		
		stop: stop
	};
}();

var game = function() {
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
	
	
	var isFinish = false;
	

	var keySettings = {
		'gu': 103,
		'tyoki': 116,
		'pa': 112,
		'breakout': 119
	};
	
	var prev = 0; 
	var keypress = function(e) {
		// 手の発射
		var now = (new Date()).getTime();
		if(now - prev > 100) {
			for(var key in keySettings) {
				if(key != 'breakout' && keySettings[key] == e.charCode) {
					player.shot(key);
				}
			}
			prev = now;
		}
		
		// 自爆
		if(e.charCode == keySettings['breakout'] && player.getHands().length > 0) {
			currentGain = 10;
			player.breakout();
		}
	};
	
	// 勝敗テーブル victory[自分][相手] = 勝敗(T/F)
	var victory = {
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
	
	// 衝突判定ループ	
	var currentGain = 10; // 獲得中の点数：コンボ用
	var collisionCheck = setInterval(function() {
		var playerHands = player.getHands();
		var enemyHands = enemy.getHands();
		
		// お互いに手を出しているか
		if(playerHands.length != 0 && enemyHands.length != 0) {
			var pp = playerHands[0].position();
			var ep = enemyHands[0].position();
			
			// 衝突したか
			if(pp.left <= ep.left && ep.left <= pp.left + 100) {
				se.play();
				
				// 勝負の結果
				if(playerHands[0].attr('hand') == enemyHands[0].attr('hand')) {
					// あいこ
					player.miss();
					enemy.miss();
					currentGain = 10;
				} else if(victory[playerHands[0].attr('hand')][enemyHands[0].attr('hand')]) {
					// かち
					enemy.miss();
					addScore(currentGain);
					player.gain(currentGain);
					currentGain = Math.floor(currentGain * 2.5);
				} else {
					// まけ
					player.miss();
					missScore(20);
					currentGain = 10;
				}
			}
		}
	}, 15);

	// タイトル画面の表示
	var title = function() {
		//タイトルの表示
		$('#title').fadeIn();
		
		// Click to start を点滅させる
		var message = $('#click_to_start');
		var on = function() {
			message.fadeIn('slow', off);
		};
		var off = function() {
			message.fadeOut('slow', on);
		};
		off();
		
		// クリックされたらゲーム開始
		$('#title').click(function() {
			$(this).unbind('click').hide('fade', 300, function() {
				game.start();
			});
		});
	};

	// public method
	return {
		// ゲーム開始
		start: function() {
			$(window).keypress(keypress);
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
			$('#breakout').bind(trigger, function(e) {
				e.preventDefault();
				keypress({charCode: keySettings.breakout});
			});
			
			$('#score').html(0);
			setTimeout(enemy.shot, 1000);
		},

		// ゲームに敗北
		lose: function() {
			if(!isFinish) {
				isFinish = true;
				alert('ゲーム終了　' + score + '点');
				$('*').stop();
				enemy.stop();
				$(window).unbind('keypress');
				$('.shot_button').unbind('click');
				
				// タイトル画面へ戻る
				setTimeout(function() {
					$('.hand').remove();
					player.resetHands();
					enemy.resetHands();
					score = 0;
					isFinish = false;
					title();
				}, 500);
			}	
		},
		
		// コンボのリセット
		resetGain: function() {
			currentGain = 10;
		},
		
		// キーセッティング変更
		changeKeySettings: function(setting) {
			keySettings = setting;
		},
		
		// タイトル画面の表示	
		title: title
	};
}();

// 最初にタイトル画面を表示
var trigger = (window.ontouchstart === null) ? 'touchstart' : 'click';
$(function() {
	game.title();
	
	// BGM再生
	var bgm = new Audio('');
	bgm.src = 'sound/bgm.mp3';
	bgm.isMute = false;
	
	// ミュートボタン
	$('#mute').click(function(){
		if(!bgm.isMute) {
			bgm.pause();
		} else {
			bgm.play();
		}
		bgm.isMute = !bgm.isMute;
	});
	
	// ヘルプボタンのモーダル
	$('#dialog').dialog({
		autoOpen: false,
		width: 500,
		show: { effect:'fade', duration:200 },
		hide: { effect:'fade', duration:200 },
		draggable: false,
		resizable: false
	});
	
	// はてなマークがクリックされたらモーダルを開く
	$('#help').click(function() {
		$('#dialog').dialog('open');
	});
	
	// キーコンフィグ
	$('#key_change').button().click(function() {
		var guKey = $('#gu_key').val();
		var tyokiKey = $('#tyoki_key').val();
		var paKey = $('#pa_key').val();
		var breakoutKey = $('#breakout_key').val();
		
		// 入力された文字をキーとして空オブジェクトへ代入
		// キーが重複すると要素は上書きされるので最終的に要素数が少なくなる
		var checker = {};
		checker[guKey] = null;
		checker[tyokiKey] = null;
		checker[paKey] = null;
		checker[breakoutKey] = null;
		
		if(guKey == '' || tyokiKey == '' || paKey == '' || breakoutKey == '') {
			alert('入力されていないキーがあります');
		} else if (Object.keys(checker).length < 4) {
			alert("重複したキーが設定されています");
		} else {
			var settings = {
				'gu': guKey.charCodeAt(0),
				'tyoki': tyokiKey.charCodeAt(0),
				'pa': paKey.charCodeAt(0),
				'breakout': breakoutKey.charCodeAt(0)
			};
			game.changeKeySettings(settings);
			$('#dialog').dialog('close');
		}
	});
	
	if(trigger == 'click') {
		$(['gu', 'tyoki', 'pa']).each(function(_, hand) {
			$('#shot_'+hand).hover(function() {
				$(this).css('background-image', 'url("img/'+hand+'_button_hover.png")');
			}, function() {
				$(this).css('background-image', 'url("img/'+hand+'_button.png")');
			});
		});
	}
});
