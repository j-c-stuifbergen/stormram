// Utility

let MatrixUtil = function() {
    let Identity =  function(dim) {
        let I = [];
    
        let i, j;
        for (i = 0; i < dim; i++) {
            let r = [];
            
            for (j = 0; j < dim; j++) {
                r.push((i == j)? 1: 0);
            }
            
            I.push(r)
        }
        
        return I;
    };
    
    let Clone = function(M) {
        let C = [];
        let i, j;
        
        let rc = M.length;
        for (i = 0; i < rc; i++) {
            let m = M[i];
            let r = [];
            
            let cc = m.length;
            for (j = 0; j < cc; j++) {
                r.push(m[j]);
            }
            
            C.push(r);
        }
        
        return C;
    };
    
    let Transpose = function(M) {
        let C = [];
        let i, j;
        
        let rc = M.length;
        let cc = M[0].length;
        
        for (i = 0; i < cc; i++) {
            let r = [];
            
            for (j = 0; j < rc; j++) {
                r.push(M[j][i]);
            }
            
            C.push(r);
        }
        
        return C;
    };
    
    let Add = function(A, B) {
        let C = [];
        let i, j;
        
        let rc = A.length;
        let cc = A[0].length;
    
        for (i = 0; i < rc; i++) {
            let r = [];
            
            for (j = 0; j < cc; j++) {
                r.push(A[i][j] + B[i][j]);
            }
            
            C.push(r);
        }
        
        return C;
    };
    
    let Subtract =  function(A, B) {
        let C = [];
        let i, j;
        
        let rc = A.length;
        let cc = A[0].length;
        for (i = 0; i < rc; i++) {
            let r = [];
            
            for (j = 0; j < cc; j++) {
                r.push(A[i][j] - B[i][j]);
            }
            
            C.push(r);
        }
        
        return C;
    };
    
    let Rows = function(Matrix,first,last)
    {
         tempResult = [];
	 if(typeof(last)=='undefined')
	 {	last = Matrix.length;
	 }
         
	 for( var i = first; i<last;i++)
	 {    tempResult.push(Matrix[i]);
	 }
	 // clone, so the result will not reference the same arrays as Matrix
	 return Clone(tempResult);
    }
 
    let Columns = function(Matrix,first,last)
    {
         result = [];
	 if(typeof(last)=='undefined')
	 {	last = Matrix[0].length;
	 }
          
	 for(var i=0;i<Matrix.length;i++)
	 {	
		result.push(Matrix[i].slice(first,last)); 
	 }
	 return result;
    }

    let RemoveColumns = function(A, index, quantity) {
	 if(typeof(quantity)=='undefined')
	 {	quantity = A.length-index;
	 }
	 if ( quantity < 0)
	 {	quantity = -quantity;
		index = index-quantity;
	 }
	let C= Clone(A);

	for (let j=0; j<A.length; j++)
	{    C[j].splice(index,quantity);
	}

        return C
    };
    
    let RemoveRows = function(A, index, quantity) {
	 if(typeof(quantity)=='undefined')
	 {	quantity = A.length-index;
	 }
	 if ( quantity < 0)
	 {	quantity = -quantity;
		index = index-quantity;
	 }
	
        return Clone(A).splice(index,quantity);
    };
    
    let StackColumns= function(A, B) {
        let C = Clone(A);
        let D = Clone(B);

        return C.concat(D);
    };
    
    let StackRows= function(A, B) {
        let C = Clone(A);
        let D = Clone(B);
        let rCount = D[0].length;// should = C[0].length

        let i;
        for (i = 0; i < rCount; i++) {
            C[i]= C[i].concat(D[i]);
        }
        return C;
    };
    
    let SubMatrix = function(Matrix, firstRow, lastRow, firstCol, lastCol)
    {
	   return Rows(Columns(Matrix, firstCol, lastCol), firstRow,lastRow);
    } 
    

    let TimesScalar =  function(A, s) {
        let C = [];
        
        let rCount = A.length;
        let cCount = A[0].length;

        let i, j, k;
        for (i = 0; i < rCount; i++) {
            let r = [];
            let ra = A[i];
            
            for (j = 0; j < cCount; j++) {
                r.push(ra[j]*s);
            }
            
            C.push(r);
        }
        
        return C;
    };

    let TimesVector =  function(M,V) {
        let C = [];
        for (i = 0, rCount = M.length; i < rCount; i++) 
	{	let row = M[i];
                let cell = 0;
            	for (j = 0,cCount = V.length; j < cCount; j++)
		{
			cell = cell + row[j] * V[j];
                }
                
                C.push(cell);
        }
        return C;
    };

    let TransposedVectorTimes =  function(V,M) {
        let C = [];
        for (j = 0,cCount = M[0].length; j < cCount; j++)
	{       let cell = 0;
        	for (i = 0, rCount = V.length; i < rCount; i++) 
		{
			cell = cell + M[j][i] * V[j];
                }
                
                C.push(cell);
        }
        return C;
    };

    let Multiply =  function(A, B) {
        let C = [];
        
        let rCount = A.length;
        let cCount = B[0].length;
	let innerCount = B.length; // should be equal to A[0].length

        let i, j, k;
        for (i = 0; i < rCount; i++) {
            let r = [];
            let ra = A[i];
            
            for (j = 0; j < cCount; j++) {
                
                let cell = 0;
                for (k = 0; k < innerCount; k++) {
                    temp = cell;
			cell = cell + ra[k] * B[k][j];
                }
                
                r.push(cell);
            }
            
            C.push(r);
        }
        
        return C;
    };
    
    let Round = function(M, decimal) {
        let C = [];
        
        let rc = M.length;
        let cc = M[0].length;
        
        let i, j;
        for (i = 0; i < rc; i++) {
            let r = [];
            let rm = M[i];
            
            for (j = 0; j < cc; j++) {
                r.push(Number(rm[j].toFixed(decimal)));
            }
            
            C.push(r);
        }
        
        return C;
    };
	let AsHTML = function (M)
	{	result = "[";
		if (0<M.length)
		{
			result +=" [ "
			if (0<M[0].length)
			{
				result += M[0][0];
				for (j =1; j<M[0].length; j++)
				{
					result += ", "+M[0][j];
				}
			}
			result += " ]"
				
			for (i =1; i<M.length; i++)
			{	
				result +=",<br> \n [ "
				if (0<M[i].length)
				{
					result += M[i][0];
					for (j =1; j<M[i].length; j++)
					{
						result += ", "+M[i][j];
					}
				}
				result += " ]"
			}
		}
		result += " ] <br> \n";
		return result;
	}
				
    let AsString = function(A, precision)
	{
		var result = "";
		precision = 2;//null==precision?0:precision;
		var factor = Math.pow(10,precision);

		for (i=0 ; i<A.length ; i++)
		{	result +=" row "+i+": "+A[i].length+" items | ";
			for (j=0; j<A[i].length ; j++ )
			//{	result += (Math.round(factor *A[i][j]) / factor)+" "
			{	result +=  A[i][j] +" "
			}
			result +=" | \n"
		}
		return result
	}
    return {
        Identity: Identity,
        Clone: Clone,
        Transpose: Transpose,
        Add: Add,
        Subtract: Subtract,
        TimesScalar: TimesScalar,
        TimesVector: TimesVector,
	TransposedVectorTimes:TransposedVectorTimes,
	Multiply: Multiply,
        Round: Round,
	AsHTML: AsHTML,
	AsString: AsString,
	Rows:Rows,
	StackColumns:StackColumns,
	StackRows:StackRows,
	Columns:Columns,
	SubMatrix:SubMatrix,
	RemoveColumns:RemoveColumns,
	RemoveRows:RemoveRows
    };
}();
