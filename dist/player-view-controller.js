define(function () { 'use strict';

   /**
   * Конструктор объектов, которые умеют оповещать
   * слушателей о своих событиях.
   */
   function CustomEventTarget() {
       //объект, где мы будем хранить ссылки на функции-слушатели
       this._events = {};
   };

   CustomEventTarget.prototype = {

      constructor: CustomEventTarget,

      //добавляет слушателя события
      on: function (eventType, listener) {
         var events = this._events,
            listeners;
         if (eventType in events) {
            //если уже есть слушатели такого события
            listeners = events[eventType];
            if (listeners.indexOf(listener) == -1) {
               //проверяем что такого слушателя еще нет
               //и помещаем в список слушателей
               listeners.push(listener);
            }
         } else {
            //если еще нет слушатлей такого события,
            //то добавляем новый массив и сразу
            //помещаем в него слушателя
            events[eventType] = [listener];
         }
      },
      
      //удаляет слушателя события
      off: function (eventType, listener) {
         var events = this._events,
            listeners;
         if (eventType in events) {
            listeners = events[eventType];
            var i;
            var pos = listeners.indexOf(listener);
            if(pos !== -1) {
               listeners.splice(pos, 1);
            }
         } 
      },

      //оповещает слушателей события
      _fire: function(eventType, detail) {
         var listeners = this._events[eventType];
         if (listeners) {
            //если есть слушатели такого события,
            //создаем новый объект события
            var event = {
               type: eventType,
               detail: detail
            };
            listeners.forEach(function (listener) {
               //и вызываем каждого слушателя,
               //передавая объект события
               listener.call(this, event);
            }, this);
         }
      }
   };

   function Template () {}
   Template.prototype.template = function (str) {
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
   }

   function Slider () {
   	var template = new Template();
   	this._element = this._createDOMElement(template.template(this._template)());
   	this._findElements(); // инициализация элементов
   	this._initializeEvents();

   	this.onMouseDown = false; // флаг о начале движения ползунка
   	CustomEventTarget.call(this); // наследуем свойства от CustomEventTarget
   }

   // просто созданим новый объект с прототипом от EventTarget
   Slider.prototype = Object.create(CustomEventTarget.prototype);
   //восстановим ссылку на конструктор
   Slider.prototype.constructor = Slider;
   //запомним от кого мы наследовали функционал
   Slider.Super = CustomEventTarget; //Super от Super/Parent Class

   Slider.prototype._template = [
   	//'<div class="timeInfo"></div>',
   	'<div class="slider"></div>',
   ].join('');

   //Slider.prototype.hideTime = function () {
   //	this._timeInfo.style.display = 'none';
   //};

   //Slider.prototype.showTime = function (progressValue, value) {
   //	this._timeInfo.innerHTML = value;
   //	this._timeInfo.style.left = progressValue - 12 + 'px';  
   //	this._timeInfo.style.display = 'block';
   //};

   Slider.prototype._createDOMElement = function (obj) {
   	var wrapper = document.createElement('div');
   	wrapper.className = 'slider-wrapper';
   	wrapper.innerHTML = obj;
   	return wrapper;
   };

   Slider.prototype._findElements = function () {
   	var element = this._element;
   	this._slider = element.querySelector('.slider');
   	//this._timeInfo = element.querySelector('.timeInfo');
   };

   Slider.prototype.renderTo = function (container) {
   	this._container = container;
   	container.appendChild(this._element);
   };

   // инициализация событий
   Slider.prototype._initializeEvents = function () {
     var slider = this;
     var coordinatesContainer;
     var leftCoordinateContainer;
     var widthSlider;
     var widthContainer;
     var centrPositionCursor;
     var moveAt = function (e) {
   	  if (e.pageX <= leftCoordinateContainer + centrPositionCursor) {
   		var value = 0;
   	  } else if(e.pageX >= leftCoordinateContainer + (widthContainer - centrPositionCursor)) {
   		 value = widthContainer - widthSlider;
   	  } else {
   		 value = e.pageX - leftCoordinateContainer - centrPositionCursor;
   	  }
   	  slider._slider.style.left = value + 'px';
   	  
   	  //this._fire('change', {value: value, progressMax: this._progressMaxValue});
     };

     this._slider.addEventListener('mousedown', function (e) {
   	if(!coordinatesContainer) {
   		coordinatesContainer = slider._getCoordinates(slider._container);
   		leftCoordinateContainer = coordinatesContainer.left;
   		widthSlider = slider._slider.offsetWidth;
   		centrPositionCursor = widthSlider / 2;
   		widthContainer = slider._container.offsetWidth;
   	}
   	
   	moveAt(e);
   	document.addEventListener('mousemove', moveAt);
     });
    
     document.addEventListener('mouseup', function() {
   	  document.removeEventListener('mousemove', moveAt);
     });
    
     this._slider.ondragstart = function() {
   	return false;
     };
   };

   Slider.prototype._getCoordinates = function(elem) {
   	var box = elem.getBoundingClientRect(), // координаты объекта относительно документа
   		scrollTop = window.pageYOffset, // значение прокрутки
   		scrollLeft = window.pageXOffset, // значение прокрутки
   		top  = box.top +  scrollTop , // верт координата объекта относительно документа с учетом прокрутки
   		left = box.left + scrollLeft;  // гориз. координата объекта относительно документа с учетом прокрутки
   		
   	return { top: Math.round(top), left: Math.round(left) };
   };

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
   			'<div class="sliderPlaying"></div>',
   			'<div class="mute"></div>',
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
   		sliderPlaying.renderTo(element.querySelector('.sliderPlaying'));

   		//
   		//sliderPlaying.on('change', this._onProgressPlayingChange.bind(this));
   		//sliderPlaying.on('hideTime', this._onHideTimePlayingChange.bind(this));
   		//
   		//this._sliderPlaying = sliderPlaying;
   		
   		// прокрутка громкости
   		//var sliderVolume = new Slider();
   		//sliderVolume.setMaxValue(130);
   		//sliderVolume.setContainer(element.querySelector('.sliderVolume'));
   		//sliderVolume.render();
   		//
   		//sliderVolume.on('change', this._onProgressVolumeChange.bind(this));
   		//sliderVolume.on('hideTime', this._onHideTimeVolumeChange.bind(this));
   		//
   		//this._sliderVolume = sliderVolume;
   		
   		// название трека
   		this._nameField = element.querySelector('.name');
   		
   		// полоса прогресса громкости
   		//this._progressVolume  = new Slider();
   		
   		// таймер
   		//this._timer = element.querySelector('.timer');
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
   		//this._player.on('timer', this._timerView.bind(this));
   		//this._player.on('ended', this._endedView.bind(this));
   		//this._player.on('changeSource', this._sourceView.bind(this));
   		//this._player.on('progressCurrentTime', this._progressPlayingView.bind(this));
   		//this._player.on('progressVolume', this._progressVolumeView.bind(this));
   		//this._player.on('hideTimePlaying', this._hideTimePlayingView.bind(this));
   		//this._player.on('hideTimeVolume', this._hideTimeVolumeView.bind(this));


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

   return PlayerViewController;

});