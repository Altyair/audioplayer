require(['Player', 'PlayerViewController'], function (Player, PlayerViewController) {
	var player = new Player();
	player.setPlaylist(['mp3/Триада - Белое танго.mp3',
						'mp3/Триада - Лебединая.mp3',
						'mp3/Триада - Свет не горит.mp3',
						'mp3/Триада - Твой танец.mp3'
					]);
	
	var playerViewController = new PlayerViewController(player);
	playerViewController.renderTo(document.querySelector('.music-player'));
});


