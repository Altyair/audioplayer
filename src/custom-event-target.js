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

export default CustomEventTarget;