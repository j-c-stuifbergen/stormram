/** @param {number} a - side of a triangle
* @param {number} b - side of a triangle
* @param {number} opposite - third side of a triangle
* returns the cosine of the angle between sides a and b of a triangle
*/
function cosine(opposite,a,b)
{
	result = (-Math.pow(opposite,2)+Math.pow(a,2)+Math.pow(b,2))/(2*a*b)
	if ( result < -1 ) // a+b < opposite
	{	let tooBig = true;
		throw new CosineError("Can't create a triangle with sides of lengths "+opposite+" , "+a+" , "+b,tooBig)
	}
	if ( 1 < result)
	{	let tooBig = false;
		throw new CosineError("Can't create a triangle with sides of lengths "+opposite+" , "+a+" , "+b,tooBig)
	}

	return result;
}

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

/*function handleCosineError(exception,labelAdj1, labelAdj2, labelOpp, adjacent1L, adjacent2L, oppositeL)
{
  	if (exception instanceof CosineError)
	{
		if (exception.tooBig)
		{	message = "Can't construct triangle "+labelAdj1+"-"+labelAdj2+"-"+labelOpp+", "+labelOpp+" is too big compared to "+labelAdj2+" ("+oppositeL+" vs "+adjacent2L+"). ";
		}
		else
		{	message = "Can't construct triangle "+labelAdj1+"-"+labelAdj2+"-"+labelOpp+", try a bigger value for "+labelOpp+" (currently "+oppositeL+" ). ";
		}
		//	exception.addMessage(message); throw (exception);
		message = "Can't construct triangle with sides \r\n "+adjacent1L+" ("+labelAdj1+"), \r\n"+adjacent2L+" ("+labelAdj2+"), \r\n"+oppositeL+" ("+labelOpp+")";
		// message +=exception.message
		alert(message )
		throw (new Error (message ));
	}
	else 
	{	throw (exception)
	}
}
*/


