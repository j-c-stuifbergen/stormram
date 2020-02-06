

function CosineError(message,tooBig) {
  this.name = "CosineError";
  this.message = (message || "");
  this.tooBig = tooBig;
}

CosineError.prototype = new RangeError();
CosineError.prototype.constructor = CosineError;
CosineError.prototype.addMessage = function(message) {
  this.message = (message || "");
}


