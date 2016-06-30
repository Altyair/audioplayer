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

   function Iterator (data) {
   	this._data = data;
   	this._index = 0;
   	this._length = data.length;
   }

   Iterator.prototype = {
   	constructor: Iterator,
   	current: function () {
   		return this._data[this._index];  
   	},
   	rewind: function () {
   		this._index = 0; 
   	},
   	prev: function () {
   		if (!this.hasPrev()) {
   			return null;
   		}
   		this._index -= 1;
   		return this._data[this._index];
   	},
   	next: function () {
   		if (!this.hasNext()) {
   			return null;
   		}
   		this._index += 1;
   		return this._data[this._index];
   	},
   	hasNext: function () {
   		return this._index < this._length - 1;
   	},
   	hasPrev: function () {
   		return this._index > 0;
   	}
   }

   function Player () {
   	this._audio = new Audio;
   	this._canPlay = false; // флаг о полной загрузки файла
   	this._play = false; // флаг воспроизведения
   	this.changeProgressOnTimer = true;
   	// событие canplay возникает, когда объём загруженных мультимедийных данных становится
   	// достаточным для того, чтобы успешно начать воспроизведение ролика. Возникает после
   	// события loadeddata и перед событием canplaythrough.
   	this._audio.addEventListener('canplay', this._onCanPlay.bind(this));
   	this._audio.addEventListener('timeupdate', this._onTimer.bind(this));
   	//this._audio.addEventListener('ended', this._onEnded.bind(this));
   	
   	CustomEventTarget.call(this); // наследуем свойства от CustomEventTarget
   }

   // просто созданим новый объект с прототипом от EventTarget
   Player.prototype = Object.create(CustomEventTarget.prototype);
   //восстановим ссылку на конструктор
   Player.prototype.constructor = Player;
   //запомним от кого мы наследовали функционал
   Player.Super = CustomEventTarget; //Super от Super/Parent Class

   //Player.prototype._source = '';

   Player.prototype._onCanPlay = function () {
   	this._canPlay = true;
   	
   	// оповещаем имя трека, когда трек загружен
   	this._fire('changeSource', {source: this._source});
   	
   	if (this._play) { // если this._play true
   		this.play(); // играть сразу
   	}
   };

   // установка плейлиста -- 04.10.2014
   Player.prototype.setPlaylist = function (playlist) {
   	this._playlist = new Iterator(playlist);
   	
   	// первоначально ставится первый трек из плейлиста
   	if (this._playlist.current()) {
   		this._setSource(this._playlist.current());
   	}
   };

   Player.prototype._setSource = function (source) {
   	this._canPlay = false; //сбрасываем флаг о загрузки файла
   	this._source = source;
   	this._audio.src = this._source; // устанавливаем источник
   };

   Player.prototype.isPaused = function () {
   	return this._audio.paused;
   };

   Player.prototype.play = function () {
   	if (this._canPlay) { // если произошло событие canplay играем сразу
   		this._audio.play();
   		
   		this._fire('play'); //оповещаем подписчика о начале воспроизведения (интерфейс)
   	} else {
   		this._play = true; //устанавливаем флаг, что по canplay нужно начать воспроизведение
   	}
   };

   Player.prototype.pause = function () {
   	this._fire('pause'); //оповещаем подписчика о завершении воспроизведения (интерфейс)
   	this._audio.pause();
   };

   Player.prototype.stop = function () {
   	this._fire('stop'); //оповещаем подписчика о завершении воспроизведения (интерфейс)
   	this._audio.pause();
   	this._play = false;
   	// установить указатель текущего трэка на начало 
   	this._audio.currentTime = '0';
   };

   // установка предидущего трека
   Player.prototype.prev = function () {
   	if (this._playlist.hasPrev()) {
   		this._play = true;
   		this._setSource(this._playlist.prev());
   	}
   };

   // установка следующего трека
   Player.prototype.next = function () {
   	if (this._playlist.hasNext()) {
   		this._play = true;
   		this._setSource(this._playlist.next());
   	}
   };

   Player.prototype._onTimer = function () {
   	this._fire('timer', {currentTime: this._audio.currentTime, duration: this.getDuration()});
   };

   Player.prototype._onEnded = function () {
   	// берем след трек из плейлиста -- 04.10.2014
   	if (this._playlist.hasNext()) {
   		this._setSource(this._playlist.next());
   		this._play = true;
   	}
   };

   Player.prototype.isMuted = function () {
   	return this._audio.muted;
   };

   Player.prototype.mute = function () {
   	this._fire('mute');

   	this._audio.muted = true;
   };

   Player.prototype.unmute = function () {
   	this._fire('unmute');

   	this._audio.muted = false;
   };

   Player.prototype.setCurrentTime = function (value) {
   	this._audio.currentTime = value;
   };

   Player.prototype.setVolume = function (value) {
   	this._audio.volume = value;
   	
   	this._fire('changeVolume',  {value: value, maxValue: 1});
   };

   Player.prototype.getDuration = function () {
   	var duration = this._audio.duration;
   	if (isFinite(duration)) { // Функция isFinite возвращает значение true, если number имеет любое значение, отличное от NaN
   		return duration;
   	}
   	return 0;
   };

   return Player;

});