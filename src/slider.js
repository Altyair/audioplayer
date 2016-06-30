import CustomEventTarget from './custom-event-target';
import Template from './template';

function Slider () {
	this._sliderActive = false;
	var template = new Template();
	this._element = this._createDOMElement(template.template(this._template)());
	this._findElements(); // инициализация элементов
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
};

Slider.prototype.renderTo = function (container) {
	container.appendChild(this._element);
	this._sliderContainer = container;
	this._initializeEvents();
};

Slider.prototype.getWidthSliderContainer = function () {
	return this._sliderContainer.offsetWidth - this._slider.offsetWidth;
};

// перемещение извне.
Slider.prototype.move = function (value) {
	this._slider.style.left = value + 'px';
};

Slider.prototype.getSliderActiveFlag = function () {
	return this._sliderActive;
};

// инициализация событий
Slider.prototype._initializeEvents = function () {
  var slider = this;
  var coordinatesSliderContainer = this._getCoordinates(this._sliderContainer);
  var leftCoordinateContainer = coordinatesSliderContainer.left;
  var widthSliderContainer = this.getWidthSliderContainer();
  var widthSlider = this._slider.offsetWidth;
  var centrPositionCursor = widthSlider / 2;

  var moveSlider = function (e) {
	  if (e.pageX <= leftCoordinateContainer + centrPositionCursor) {
		var value = 0;
	  } else if(e.pageX >= leftCoordinateContainer + widthSliderContainer + centrPositionCursor) {
		 value = widthSliderContainer;
	  } else {
		 value = e.pageX - leftCoordinateContainer - centrPositionCursor;
	  }
	  slider._slider.style.left = value + 'px';
	  
	  slider._fire('changeSlider', {value: value, maxValue: widthSliderContainer});
  };

  this._slider.addEventListener('mousedown', function (e) {
	slider._sliderActive = true;
	
	moveSlider(e);
	document.addEventListener('mousemove', moveSlider);
  });
 
  document.addEventListener('mouseup', function() {
	  slider._sliderActive = false;

	  document.removeEventListener('mousemove', moveSlider);
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