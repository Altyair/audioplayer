require(['Player', 'PlayerViewController'], function (Player, PlayerViewController) {
	var player = new Player();
	player.setPlaylist(['mp3/Kalimba.mp3']);
	
	var playerViewController = new PlayerViewController(player);
	playerViewController.renderTo(document.querySelector('.music-player'));
});
