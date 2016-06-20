import CustomEventTarget from './custom-event-target';

function Slider () {
	this._element = this._createDOMElement(template(this._template)());
	this._findElements(); // инициализация элементов
	this._initializeEvents();
	this.onMouseDown = false; // флаг о начале движения ползунка
	CustomEventTarget.call(this); // наследуем свойства от CustomEventTarget
	
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

// просто созданим новый объект с прототипом от EventTarget
Slider.prototype = Object.create(CustomEventTarget.prototype);
//восстановим ссылку на конструктор
Slider.prototype.constructor = Slider;
//запомним от кого мы наследовали функционал
Slider.Super = CustomEventTarget; //Super от Super/Parent Class

Slider.prototype._template = [
	'<div class="timeInfo"></div>',
	'<div class="slider"></div>',
].join('');

Slider.prototype.hideTime = function () {
	this._timeInfo.style.display = 'none';
};

Slider.prototype.showTime = function (progressValue, value) {
	this._timeInfo.innerHTML = value;
	this._timeInfo.style.left = progressValue - 12 + 'px';  
	this._timeInfo.style.display = 'block';
};

Slider.prototype.setContainer = function (container) {
	console.log(getComputedStyle(this._slider, '').width);  //  ???
	this._container = container;
	this._container.style.width = this._progressMaxValue + 15 + 'px';  // значение 15 - ширина слайдера. Не могу получить это значение.
};

Slider.prototype.getContainer = function () {
	return this._container;
};

Slider.prototype._createDOMElement = function (obj) {
	var wrapper = document.createElement('div');
	wrapper.className = 'wrapper';
	wrapper.innerHTML = obj;
	return wrapper;
};

Slider.prototype._findElements = function () {
	var element = this._element;
	this._slider = element.querySelector('.slider');
	this._timeInfo = element.querySelector('.timeInfo');
};

// установка максимального значения 
Slider.prototype.setMaxValue = function (maxValue) {
	this._progressMaxValue = maxValue;
};

Slider.prototype.getMaxValue = function (maxValue) {
	return this._progressMaxValue;
};

Slider.prototype.setMinValue = function () {
	this._slider.style.left = '0px';
};

// установка шага
Slider.prototype.setStep = function (stepValue) {
	this._step = stepValue;
};

Slider.prototype.move = function (value) {
	this._slider.style.left = value + 'px';
};

Slider.prototype.render = function () {
	this._container.appendChild(this._element);
};

// инициализация событий
Slider.prototype._initializeEvents = function () {
	var handlerOnMove = this._setValue.bind(this),
		me = this;
	
	this._slider.addEventListener('mousedown', function (e) {
		me.onMouseDown = true; // флаг, чтобы ф-я document.onmouseup отработала именно когда нажали на ползунок, а не в любое место
		document.addEventListener('mousemove', handlerOnMove);
	});
	
	document.addEventListener('mouseup', function() {
		if (me.onMouseDown) {
			me._fire('hideTime'); // скрываем время над ползунком
			me.onMouseDown = false;
			document.removeEventListener('mousemove', handlerOnMove);
		}
	});

	this._slider.addEventListener('dragstart', function () {
		return false;
	});
};

Slider.prototype._setValue = function (e) {
	var coordsParent = this._getCoords(this._container),
		left = coordsParent.left,
		value = null;
		
	if (e.pageX <= left) {
		value = 0;
	} else if(e.pageX >= left + this._progressMaxValue) {
		value = this._progressMaxValue;
	} else {
		value = e.pageX - left;
	}
	
	this._fire('change', {value: value, progressMax: this._progressMaxValue});
};

Slider.prototype._getCoords = function(elem) {
	var box = elem.getBoundingClientRect(), // координаты объекта относительно документа
		scrollTop = window.pageYOffset, // значение прокрутки
		scrollLeft = window.pageXOffset, // значение прокрутки
		top  = box.top +  scrollTop , // верт координата объекта относительно документа с учетом прокрутки
		left = box.left + scrollLeft;  // гориз. координата объекта относительно документа с учетом прокрутки
		
	return { top: Math.round(top), left: Math.round(left) };
};

export default Slider;