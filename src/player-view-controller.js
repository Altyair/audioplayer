import Slider from './slider';

function PlayerViewController (player) {
	this._player = player; // экземпляр плеера
	this._element = this._createDOMElement(template(this._template)()); // html разметка интерфеса
	this._findElements(); // инициализация элементов
	
	this._initializeEvents(); // инициализация событий
	
	// щаблонизатор 
	function template(str) {
		str = (typeof str === "string") ? str : str.innerHTML;
		var p = [];
		p.push('var p = [];p.push(\'' + str
			.replace(/[\r\t\n]/g, "")
			.split("<%").join("\t")
			.replace(/((^|%>)[^\t]*)'/g, "$1\r")
			.replace(/\t=(.*?)%>/g, "',$1,'")
			.split("\t").join("');")
			.split("%>").join("p.push('")
			.split("\r").join("\\'") + '\');return p.join(\'\');');
		return new Function('data', p);
	};
}

PlayerViewController.prototype = {
	constructor: PlayerViewController,
	_template: [
		'<div class="player">',
		'<span class="timer">00:00 / 00:00</span>',
		'<div class="name"></div>',
		'<div class="actions">',
			'<div class="play"></div>',
			'<div class="prev"></div>',
			'<div class="next"></div>',
			'<div class="mute"></div>',
			'<div class="sliderPlaying"></div>',
			'<div class="sliderVolume"></div>',
		'</div>',
		'</div>'
	].join(''),
	
	_createDOMElement: function (obj) {
		var div = document.createElement('div');
		div.innerHTML = obj;
		return div.firstChild;
	},
	
	_formatTime: function (time) {
		var minutes = Math.floor(time / 60) % 60,
		seconds = Math.floor(time % 60);
	   
		return  (minutes < 10 ? '0' + minutes : minutes) + ':' +
			(seconds < 10 ? '0' + seconds : seconds);
	},

	// инициализация элементов интерфейса
	_findElements: function () {
		var element = this._element;
		
		// прокрутка проигрывания
		var sliderPlaying = new Slider();
		sliderPlaying.setMaxValue(130); // в px
		sliderPlaying.setContainer(element.querySelector('.sliderPlaying'));
		sliderPlaying.render();
		
		sliderPlaying.on('change', this._onProgressPlayingChange.bind(this));
		sliderPlaying.on('hideTime', this._onHideTimePlayingChange.bind(this));
		
		this._sliderPlaying = sliderPlaying;
		
		// прокрутка громкости
		var sliderVolume = new Slider();
		sliderVolume.setMaxValue(130);
		sliderVolume.setContainer(element.querySelector('.sliderVolume'));
		sliderVolume.render();
		
		sliderVolume.on('change', this._onProgressVolumeChange.bind(this));
		sliderVolume.on('hideTime', this._onHideTimeVolumeChange.bind(this));

		this._sliderVolume = sliderVolume;
		
		// название трека
		this._nameField = element.querySelector('.name');
		
		// полоса прогресса громкости
		//this._progressVolume  = new Slider();
		
		// таймер
		this._timer = element.querySelector('.timer');
		// кнопка play у каждого интерфейса своя
		this._buttonPlay = element.querySelector('.play');
		// кнопка предидущий трек
		this._buttonPrev = element.querySelector('.prev');
		// кнопка следующий трек
		this._buttonNext = element.querySelector('.next');
		// кнопка вкл / выкл звука
		this._buttonMute = element.querySelector('.mute');
	},
	
	// инициализация событий
	_initializeEvents: function () {
		this._player.on('play', this._playView.bind(this));
		this._player.on('pause', this._pauseView.bind(this));
		this._player.on('mute', this._muteView.bind(this));
		this._player.on('unmute', this._unmuteView.bind(this));
		this._player.on('timer', this._timerView.bind(this));
		this._player.on('ended', this._endedView.bind(this));
		this._player.on('changeSource', this._sourceView.bind(this));
		this._player.on('progressCurrentTime', this._progressPlayingView.bind(this));
		this._player.on('progressVolume', this._progressVolumeView.bind(this));
		this._player.on('hideTimePlaying', this._hideTimePlayingView.bind(this));
		this._player.on('hideTimeVolume', this._hideTimeVolumeView.bind(this));


		// вкл / выкл плеера
		this._buttonPlay.addEventListener('click', this._onPlay.bind(this));
		// предидущий. трек
		this._buttonPrev.addEventListener('click', this._onPrev.bind(this));
		// следующий трек
		this._buttonNext.addEventListener('click', this._onNext.bind(this));
		// вкл / выкл звука
		this._buttonMute.addEventListener('click', this._onMute.bind(this));
		
	},
	
	// показываем кнопку пауза при проигывании плеера
	_playView: function () {
		this._buttonPlay.className = 'pause';
	},
		
	// показываем кнопку плэй при остановке плеера
	_pauseView: function () {
		this._buttonPlay.className = 'play';
	},
	
	// показываем кнопку выкл. звука
	_muteView: function () {
		this._buttonMute.className = 'unmute';
	},
		
	// показываем кнопку вкл. звука
	_unmuteView: function () {
		this._buttonMute.className = 'mute';
	},
	
	// показываем движение ползунка.
	_progressPlayingView: function (event) {
		this._sliderPlaying.move(event.detail.value); // перемещаем ползунок
		this._sliderPlaying.showTime(event.detail.value, this._formatTime(event.detail.currentTime)); // показываем всплывающее время
	},
	// показываем движение ползунка.
	_hideTimePlayingView: function (event) {
		this._sliderPlaying.hideTime();
	},
	
	// показываем движение ползунка.
	_hideTimeVolumeView: function (event) {
		this._sliderVolume.hideTime();
	},
	
	// показываем движение ползунка.
	_progressVolumeView: function (event) {
		this._sliderVolume.move(event.detail.value);
		
		this._sliderVolume.showTime(event.detail.value, Math.ceil(event.detail.volumeValue * 10)); // показываем всплывающее время
	},
	
	// показываем таймер
	_timerView: function (event) {
		if (event.detail.duration) {
			if (this._timer.classList.contains('hide')) {
				this._timer.classList.remove('hide');
				sliderPlayingContainer.classList.remove('hide');
			}
			this._timer.innerHTML = this._formatTime(event.detail.currentTime) + ' / ' + this._formatTime(event.detail.duration);
			if (!this._sliderPlaying.onMouseDown) { // если ползунок проигрывания в бездействии
				this._sliderPlaying.move(Math.round(this._sliderPlaying.getMaxValue() * event.detail.currentTime / event.detail.duration));
			}
		} else {
			var sliderPlayingContainer = this._sliderPlaying.getContainer();
			this._timer.classList.add('hide');
			sliderPlayingContainer.classList.add('hide');
		}
	},
	
	// окончание проигрывания.
	_endedView: function (event) {
		this._sliderPlaying.setMinValue();
		this._buttonPlay.className = 'play';
		this._timer.innerHTML = '00:00 / ' + this._formatTime(event.detail.duration);
	},
	
	// показываем имя трека.
	_sourceView: function (event) {
		var pathName = event.detail.source.split('/');
		this._nameField.innerHTML = pathName[pathName.length - 1];
	},
	
	//действие по нажатию кнопки play / pause
	_onPlay: function (e) {
		if (this._player.isPaused()) {
			this._player.play();
			return;
		}
		this._player.pause();
	},
	
	//действие по нажатию кнопки prev
	_onPrev: function (e) {
		this._player.prev();
	},
	
	//действие по нажатию кнопки next
	_onNext: function (e) {
		this._player.next();
	},
	
	//действие по нажатию кнопки mute
	_onMute: function (e) {
		if (this._player.isMuted()) {
			this._player.unmute();
			return;
		}
		this._player.mute();
	},
	
	_onHideTimePlayingChange: function () {
		this._player.hideTimePlayingChange();  
	},
	
	_onHideTimeVolumeChange: function () {
		this._player.hideTimeVolumeChange();  
	},
	
	_onProgressPlayingChange: function (event) {
		this._player.changeCurrentTime(event.detail.value, event.detail.progressMax);  
	},
	
	_onProgressVolumeChange: function (event) {
		this._player.changeVolume(event.detail.value, event.detail.progressMax);  
	},
	
	//отображает плеер внутри указанного элемента
	renderTo: function (container) {
		container.appendChild(this._element);
	}
};

export default PlayerViewController;