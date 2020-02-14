// Utility
let VectorUtil = function() {
    let Clone = function(V) {
        let C = [];
        
	let cc = V.length;
	for (let j = 0; j < cc; j++) 
	{
		C.push(V[j]);
	}
        return C;
    };
    
    let Norm = function(V)
	{
		let sum= 0;
		for (let j = 0, count = V.length; j < count; j++) 
		{   sum += Math.pow(A[j],2);
		}
		return Math.sqrt(sum);
	}
    let InnerProduct = function(A,B)
	{
		let sum= 0;
		for (let j = 0, count = A.length; j < count; j++) 
		{   sum += A[j]*B[j];
		}
		return sum;
	}
    let Cos = function (A,B)
	{
		return innerProduct(A,B)/(Norm(A)*Norm(B));
	}
    let Phi = function(A,B)
	{ 	return Math.acos(Cos(A,B));
	}
    let Add = function(A, B) {
        let C = [];
        
        for (let j = 0, count = A.length; j < count; j++) 
	{    C.push(A[j] + B[j]);
        }
            
        return C;
    };
    
    let Subtract =  function(A, B) {
        let C = [];
        
        let count = A.length;
    
        for (let j = 0; j < count; j++) 
	{    C.push(A[j] - B[j]);
        }
        return C;
    };
    
    let TimesScalar =  function(A, s)
    {
        let C = [];
        
        let count = A.length;

        for (let j = 0; j < count; j++) 
	{
            C.push(A[j]*s);
        }
        return C;
    };

    let Round = function(V, decimal) {
        let C = [];
        
        let count = V.length;
        
        for (let i = 0; i < count; i++)
	{
                C.push(Number(V[j].toFixed(decimal)));
        }
        
        return C;
    };

    let AsString = function(A, precision)
	{
		// precision = (null==precision)?5:precision;
		var factor = Math.pow(10,precision);

		var result = "[ ";
		if (0<A.length)
		{
			result +=  A[0].toFixed(precision) 

			for (let j=1; j<A.length ; j++ )
			{	result +=  ", " + ((null==precision)?A[j]:A[j].toFixed(precision));
			}
		}
		result +=" ]";
		return result
	}
    return {
        Clone: Clone,
	Norm: Norm,
	InnerProduct: InnerProduct,
	Cos: Cos,
	Phi: Phi,
        Add: Add,
        Subtract: Subtract,
        TimesScalar: TimesScalar,
        Round: Round,
	AsString: AsString,
    };
}();
