import CustomEventTarget from './custom-event-target';
import Template from './template';

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
	'<div class="slider"></div>',
].join('');

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

export default Slider;