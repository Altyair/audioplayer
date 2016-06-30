require(['Player', 'PlayerViewController'], function (Player, PlayerViewController) {
	var player = new Player();
	player.setPlaylist(['mp3/Триада - Белое танго.mp3',
						'mp3/Триада - Лебединая.mp3',
						'mp3/Триада - Свет не горит.mp3',
						'mp3/Триада - Твой танец.mp3'
					]);
	
	var playerViewController = new PlayerViewController(player);
	playerViewController.renderTo(document.querySelector('.music-player'));
	
	player.setVolume(0.5);
});


//function Menu(options) {
//	options1 = Object.create(options); 
//	console.log(options1); // options1._proto_ = options
//	options1.width = options.width || 300;
//  
//	alert( options1.width ); // возьмёт width из наследника
//	alert( options1.height ); // возьмёт height из исходного объекта
//};
//
//var obj = new Menu({width: 100, height: 200});

var obj = {};
console.log( obj.__proto__ == Object.prototype  );



