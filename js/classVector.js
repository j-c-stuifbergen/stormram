function vector(coordinates)
{
	this.copy = function()
	{	return new vector(this.vector)
	}
	this.vector = coordinates;
	this.norm= function()
	{  	let sum = 0;
		for (let i = 0; i<this.vector.length; i++)
		{ 	sum += this.vector[i]*this.vector[i];
		}
		return Math.sqrt(sum);
	};

	this.plus = function(vec_b)
	{	let result = Array(this.vector.length);
		for (let i = 0; i<this.vector.length; i++)
		{ 	result[i]= this.vector[i] +vec_b.vector[i];
		}
		return new vector(result);
	}
	this.minus = function(vec_b)
	{	let result = Array(this.vector.length);
		for (let i = 0; i<this.vector.length; i++)
		{ 	result[i]= this.vector[i] -vec_b.vector[i];
		}
		return new vector(result);
	}
	this.times = function(scalar)
	{	let result = Array(this.vector.length);
		for (let i = 0; i<this.vector.length; i++)
		{ 	result[i]= this.vector[i] * scalar;
		}
		return new vector(result);
	}
	this.ip= function(vec_b)
	{  	let sum = 0;
		for (let i = 0; i<this.vector.length; i++)
		{ 	sum += this.vector[i]*vec_b.vector[i];
		}
		return sum;
	};
	this.unit = function()
	{	return this.times(1/this.norm());
	}

	// outer product
	this.op= function(vec_b)
	{	let coords = [];
		coords[0] = this.vector[1]*vec_b.vector[2]-this.vector[2]*vec_b.vector[1];
		coords[1] = this.vector[2]*vec_b.vector[0]-this.vector[0]*vec_b.vector[2];
		coords[2] = this.vector[0]*vec_b.vector[1]-this.vector[1]*vec_b.vector[0];
		return new vector(coords);
	}
	this.along= function (vec_b)
	{	return this.ip(vec_b)/vec_b.norm();
	}
	this.projectOn= function(vec_b)
	{  	let ip = this.ip(vec_b);
		let norm2 = vec_b.ip(vec_b);
		return vec_b.times(ip/norm2);
	}
	this.cos= function(vec_b)
	{	let ip = this.ip(vec_b);
		return ip / (this.norm()*vec_b.norm());
	}
	this.phi= function(vec_b)
	{	return Math.acos(this.cos(vec_b));	
	}
	this.toString = function()
	{	return VectorUtil.AsString(this.vector);
	}
	this.toString = function(precision)
	{	return VectorUtil.AsString(this.vector,precision);
	}
}

