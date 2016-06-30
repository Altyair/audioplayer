import Slider from './slider';
import Template from './template';

function PlayerViewController (player) {
	this._player = player; // экземпляр плеера
	var template = new Template();
	this._element = this._createDOMElement(template.template(this._template)());
	this._findElements(); // инициализация элементов
	this._initializeEvents(); // инициализация событий
}

PlayerViewController.prototype = {
	constructor: PlayerViewController,
	_template: [
		'<div class="player">',
		'<span class="timer">00:00 / 00:00</span>',
		'<div class="name"></div>',
		'<div class="actions">',
			'<div class="play"></div>',
			'<div class="stop"></div>',
			'<div class="prev"></div>',
			'<div class="next"></div>',
			'<div class="slider-playing"></div>',
			'<div class="mute"></div>',
			'<div class="slider-volume"></div>',
		'</div>',
		'</div>'
	].join(''),
	
	_createDOMElement: function (obj) {
		var div = document.createElement('div');
		div.innerHTML = obj;
		return div.firstChild;
	},
	
	_formatTime: function (time) {
		var minutes = Math.floor(time / 60) % 60;
		var seconds = Math.floor(time % 60);
	   
		return  (minutes < 10 ? '0' + minutes : minutes) + ':' +
			(seconds < 10 ? '0' + seconds : seconds);
	},

	// инициализация элементов интерфейса
	_findElements: function () {
		var element = this._element;
		
		// название трека
		this._nameField = element.querySelector('.name');
		
		// таймер
		this._timer = element.querySelector('.timer');
		// кнопка play у каждого интерфейса своя
		this._buttonPlay = element.querySelector('.play');
		this._buttonStop = element.querySelector('.stop');
		// кнопка предидущий трек
		this._buttonPrev = element.querySelector('.prev');
		// кнопка следующий трек
		this._buttonNext = element.querySelector('.next');
		// кнопка вкл / выкл звука
		this._buttonMute = element.querySelector('.mute');
		// сладер проигрывания
		this._sliderPlaying = new Slider();
		// сладер громкости
		this._sliderVolume = new Slider();
	},
	
	// инициализация событий
	_initializeEvents: function () {
		this._player.on('play', this._playView.bind(this));
		this._player.on('stop', this._stopView.bind(this));
		this._player.on('pause', this._pauseView.bind(this));
		this._player.on('mute', this._muteView.bind(this));
		this._player.on('unmute', this._unmuteView.bind(this));
		this._player.on('timer', this._progressPlayingView.bind(this));
		this._player.on('changeVolume', this._progressVolumeView.bind(this));
		
		this._sliderPlaying.on('changeSlider', this._onSliderPlayingChange.bind(this));
		this._sliderVolume.on('changeSlider', this._onSliderVolumeChange.bind(this));
		
		//this._player.on('ended', this._endedView.bind(this));
		//this._player.on('changeSource', this._sourceView.bind(this));

		// вкл. / пауза 
		this._buttonPlay.addEventListener('click', this._onPlay.bind(this));
		// остановка трэка. установка на начало трэка.
		this._buttonStop.addEventListener('click', this._onStop.bind(this));
		// предидущий. трек
		this._buttonPrev.addEventListener('click', this._onPrev.bind(this));
		// следующий трек
		this._buttonNext.addEventListener('click', this._onNext.bind(this));
		// вкл / выкл звука
		this._buttonMute.addEventListener('click', this._onMute.bind(this));
		
	},
	
	// показываем кнопку пауза при проигывании плеера
	_progressVolumeView: function (event) {
		this._sliderVolume.move(Math.round(this._sliderVolume.getWidthSliderContainer() * event.detail.value / event.detail.maxValue));
	},
	
	// показываем кнопку пауза при проигывании плеера
	_playView: function () {
		this._buttonPlay.className = 'pause';
	},
	
	// показываем кнопку play при остановке воспроизведения трека
	_stopView: function () {
		this._buttonPlay.className = 'play';
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
	
	// показываем таймер
	_progressPlayingView: function (event) {
		this._timer.innerHTML = this._formatTime(event.detail.currentTime) + ' / ' + this._formatTime(event.detail.duration);
		if (!this._sliderPlaying.getSliderActiveFlag()) { // если ползунок проигрывания не передвигается юзером, то он перемещается по таймеру пдеера
			this._sliderPlaying.move(Math.round(this._sliderPlaying.getWidthSliderContainer() * event.detail.currentTime / event.detail.duration));
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
	
	//////////////////////////////
	_onSliderPlayingChange: function (event) {
		var value = this._player.getDuration() / event.detail.maxValue * event.detail.value;
		this._player.setCurrentTime(value);  
	},
	
	_onSliderVolumeChange: function (event) {
		var value = 1 / event.detail.maxValue * event.detail.value;
		this._player.setVolume(value);  
	},
	
	//действие по нажатию кнопки play / pause
	_onPlay: function (e) {
		if (this._player.isPaused()) {
			this._player.play();
			return;
		}
		this._player.pause();
	},
	
	//действие по нажатию кнопки stop
	_onStop: function (e) {
		this._player.stop();
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
	
	//отображает плеер внутри указанного элемента
	renderTo: function (container) {
		container.appendChild(this._element);
		
		// прокрутка проигрывания
		this._sliderPlaying.renderTo(this._element.querySelector('.slider-playing'));
		this._sliderVolume.renderTo(this._element.querySelector('.slider-volume'));
	}
};

export default PlayerViewController;