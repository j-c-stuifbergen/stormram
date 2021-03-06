/** sketch:
   A   D             C
       B

     B3              B1    B5
 
* the distance from A to D is fixed).
* B1 till B5 are fixed points.
* D is between A and C
* B is always under D
* known fixed distances: AD, AC, DB (and thus AC, AB)
* known distances (chosen settings):
* B-B5, B3-A, B4-A, B1-C, B2-C, B5-B, 
* The distance AB5 is calculated by an iterative process
* and adjusted till it is in agreement with the 5 set distances
*/

function stormramSolver()
{
	estimates=null;
	// store in global variable initial

	/* coordinates
	*/
	var L1 = 97.48*0.5; // fig 6.4 of Vincent's thesis
	var L2 = 45; // fig 6.4 of Vincent's thesis
	var AB = 15.07; // eq. 6.10 in Vincent's thesis
	var BD = AB; 
	var AC = 45.833; // distance between A and C, eq. 6.10 in Vincent's thesis

	// fixed coordinates: according to fig 6.4 of Vincent's thesis
	var b1 = new vector([L1, 0,0]);
	var b2 = new vector([-L1, 0,0]);
	var b3 = new vector([L1, 0,L2]);
	var b4 = new vector([-L1, 0,L2]);
	var b5 = new vector([0,-9.08, -22.5]);

	this.b1 = b1
	this.b2 = b2
	this.b3 = b3
	this.b4 = b4
	this.b5 = b5

	let backup = { OK: false,
	 error:new Error("calculation not finished"),
	 vecA: new vector([0,0,0]),
	 vecB: new vector([0,0,0]),
	 vecC: new vector([0,0,0]),
	 vecD: new vector([0,0,0]),
	 // err2: err2,
	 text: "no result",
	 settings: null,
	 results:[],
	 recommendation: null
	// checkText: checkText
	};

	/* find a better estimate for BA, given estimates for vecA and vecD,
		satisfying given values for vecB5 and B5D
		by comparing the length of vecctor from B5 to D
		with B5D.
	*/
	function estimate_BA(B5D,vecB5,vecA,vecD)
	{
			vecAB = vecB5.minus(vecA);
			// vecABunit = vecAB.times(1/vecAB.norm());
			vecDB = vecB5.minus(vecD);
			vecAD = vecD.minus(vecA);
			
			/* return the sum:
			 * length of DB projected on AB +
			 * the projected length that B5D should have along AB
			*/
			// if B5D == vecDB.norm(), the solution is stable
			return 	(vecAB.ip(vecAD) + 
				 vecAB.ip(vecDB) /vecDB.norm() * B5D
				)/vecAB.norm();
	}

	/* find the projection (foot) of a triangle on a basis between vectors axStart and axEnd
	   param {vector} axStart
	   param {vector} axEnd
	   param {Number} adjacentL
	   param {Number} oppositeL
	 */    
	function footOnAxis(axStart, axEnd, adjacentL, oppositeL)
	{
		var axVector = axEnd.minus(axStart);

		cosPhi = cosine(oppositeL, adjacentL,axVector.norm());

		B = cosPhi*adjacentL;
		R = adjacentL*(Math.sqrt(1-cosPhi*cosPhi));

		Center = axVector.times(B/axVector.norm());
		return { axisVec: axVector,
			 H: R,
			 footVec: Center};
	}

	/* return a vector vecR such that:
	* - vecR.norm() == R
	* - || vecR - vecBasis || == BA
	* - the outer product: vecR x vecBasis is parallel to vecAxis
	*   so (vecR x vecBasis) x vecAxis = 0 
	* - the result is a kind of right-handed system of vectors,
	*   so (vecR x vecBasis) . vecAxis >= 0 
	*
	*	throws CosineError
	*/
	function find_vec(vecAx, vecBasis,H, D, D_alongAxis, labelBasis, labelAdjacent, labelH)
	{	
		D2 = 	D*D - Math.pow(D_alongAxis,2)
		if ( D2 <0 )
		{	message ="component "+labelAdjacent+" is too short to create a triangle "+labelAdjacent+" - "+labelBasis+" - "+labelH
			error = new Error(message);
			error.name = "findVecError";
			throw error;
		}
		D_ortho = Math.sqrt(D2);
		
		var BNorm = vecBasis.norm();
		var unitBasis = vecBasis.times(1/BNorm);
		// var unitAx = vecAx.times(1/vecAx.norm());
		var unitOrtho = vecBasis.op(vecAx).unit(); // unit vector orthogonal to vecBasis and vecAx
		// var unitOrtho = vecOrtho.times(1/vecOrtho.norm());

		{	var cosAxis = cosine(D_ortho,BNorm,H);
		}
		var sinAxis = Math.sqrt(1-cosAxis*cosAxis);

		var result =  unitBasis.times(cosAxis*H).plus(unitOrtho.times(sinAxis*H));
		
		return result;
	}

	function estimationsObject(vecBD, B5toA)
	{	return JSON.stringify({arrayBD:vecBD.vector, B5toA:B5toA});
	}
	this.estimationsObject = estimationsObject;
	function handleTriangleError(err)
	{	backup.error =  err;
		backup.OK = false;
		return backup;
	}
	/** param {number} nIterations - an integer
	* param {number} B0 - distance from B5 to the axis B1-B2 (roughly under A)
	* param {number} R - initial guess for AD
	* param {number} BA - initial guess for BA
	* param {vector} vecAD - for the moment, a constant value
	* find the correct coordinates for A, based on B0 and R and B5D.
	*/
	this.solveABCD = function (params)
	{
		var nIterations = params.nIterations;
		var R1 = params.R1;
		var R2 = params.R2;
		var R3 = params.R3;
		var R4 = params.R4;
		var R5 = params.R5;

		estimates = JSON.parse(params.estimates)
		// output variables
		var vecA, vecB, vecC, vecD;
		var infoText = "<hr>";
		var B5toA = (estimates.B5toA==null?R5:estimates.B5toA); // intial estimate for BA, e.g. BA =R5
		let vecBD = (estimates.arrayBD==null?new vector([0,-BD,0]):new vector(estimates.arrayBD)) ; // initial value, not a constant

		settings = { R1:R1, R2:R2, R3:R3, R4:R4, R5: R5,
				 AC:AC, AB: AB, BD:BD, 
				 b1:b1, b2:b2, b3:b3, b4:b4, b5:b5,
				 estimates:{B5toA:B5toA, arrayBD:vecBD.vector}
				}

		infoText += "We will start the iteration with B5toA = "+ B5toA +"<br>";
		var vectorAxis = b4.minus(b3); // b4.minus(b3) gives the wrong orientation

		// var triangleInfo_A = axisPoint(vectorAxis, R3,R4);// Axis points from b3 to b4
		try
		{	var triangleInfo_A = footOnAxis(b3,b4, R3,R4)//, "B3 to B4", "R3","R4");// the foot of A on the axis
		} catch(err)
		{	if ( "CosineError" == err.name)
			{	err.message = "I can't find a solution for A with the current values of R3 and R4.\n\r" + err.message;
				handleTriangleError(err);
				return backup;
			}
			throw err;
		}
	
		var foot_A = triangleInfo_A.footVec.plus(b3);
		var B5_projected = b5.minus(foot_A).projectOn(vectorAxis)
		let basisVec = b5.minus(foot_A).minus(B5_projected) // b5+(vecC-b5)pO(axis)-veC
		
		var vectorAxis_C = b1.minus(b2); // b2.minus(b3) gives the wrong orientation in find_vec
		//	var triangleInfo_C = axisPoint(vectorAxis_C, R1,R2);// Axis points from b1 to b2
		try
		{	var triangleInfo_C = footOnAxis(b1,b2, R1,R2)// ,"B1 to B2","R1","R2");// Axis points from b1 to b2
		} catch(err)
		{	if ( "CosineError" == err.name)
			{	err.message = "I can't find a solution for C with the current values of R1 and R2.\n\r"+err.message
				handleTriangleError(err);
				return backup;
			}
			throw err;
		}
		var foot_C = triangleInfo_C.footVec.plus(b1);
		var hC = triangleInfo_C.H;

		// By definition of b1 and b2, foot_C has y=0 and z=0
		
		var results = []
		for (var j = 0; j<nIterations ; j++)
		{
			results.B5toA = B5toA;
			infoText += "<hr>iteration = "+ j+"<br>";
			infoText += "B5toA: "+B5toA+" <br>";
			// estimate A

			try
			{	vecA = find_vec(vectorAxis,basisVec,triangleInfo_A.H,B5toA,B5_projected.norm(), "A","B to A","H of A").plus(foot_A);
			} catch(err)
			{	if ( "CosineError" == err.name || "findVecError"==err.name)
				{	err.message =  "I can't find a solution for A with the current values of R3, R4 and R5"
					handleTriangleError(err);
					return backup;
				}
				throw err;
			}

			// calculate C
			let A_projected = vecA.minus(foot_C).projectOn(vectorAxis_C) // A might change at each iteration, but the projection should not change
			let basisVec_A = vecA.minus(foot_C).minus(A_projected) // from A to the axis of C

			try
			{	vecC = find_vec(vectorAxis_C,basisVec_A,triangleInfo_C.H,AC,A_projected.norm(), "C", "AC", " hC ").plus(foot_C);	
			} catch(err)
			{	if ( "CosineError" == err.name || "findVecError"==err.name)
				{	err.message =  "I can't find a solution for C with the current values of A, R1 and R2"
					handleTriangleError(err);
					return backup;
				}
				throw err;
			}
			// calculate B, between A and C
			vecB = vecA.times(1-AB/AC).plus(vecC.times(AB/AC));
			vecD = vecB.plus(vecBD);

			let vecAC = vecC.minus(vecA)

			// axis J13 is parallel to J14, J15 is perpendicular to J13 and to AC
			// J15 = AC x (Db5 x b1b2)
			// repetition of this loop is useless. For a better estimation of vecD, vecA and vecB must also be re-calculated.
			{	
				let J13 = vecD.minus(b5).op(vectorAxis_C).unit()
				let J15 = vecAC.op(J13).unit()
				let calcResults = {iteration: j,
						B5toA: B5toA,
						vecA: vecA.copy(), vecB:vecB.copy(), vecC:vecC.copy(), vecDEstimated:vecD.copy(),
						J14:J13.copy(), J15:J15.copy()
						};
				vecBD_new = vecAC.op(J15).unit().times(BD)
				if (vecBD_new.ip(vecBD)<0)
				{ 	alert(" inverting BD at iteration "+j
						+"\n\r BD was: "+vecBD
						+"\n\r BD becomes: "+vecBD_new.times(-1)
						);
					vecBD = vecBD_new.times(-1)
				} else
				{ vecBD = vecBD_new
				}
				vecBD_alt = vecAC.op(vecAC.op(vecA.minus(b5))).unit().times(BD) // perpendicular to AC, in the plane of A, C and B5
				// estimate D		
				vecD = vecB.plus(vecBD); // corresponds to the orientation of J15 and J14 and J13
				calcResults.vecD= vecD.copy();
				results[results.length] = calcResults;		
			}
			
			// set a better value for BA for the nex approximation
			B5toA = estimate_BA(R5,b5,vecA,vecD);

		}

		backup = { OK: true,
			 error:null,
			 vecA: vecA,
			 vecB: vecB,
			 vecC: vecC,
			 vecD:vecD,
			 // err2: err2,
			 text: infoText,
			 settings: settings,
			 results:results,
			 recommendation: estimationsObject(vecBD, B5toA)
			// checkText: checkText
			};
		return backup;
	}
	this.settingText = function(params)
	{
		var nIterations = params.nIterations;
		var R1 = params.R1;
		var R2 = params.R2;
		var R3 = params.R3;
		var R4 = params.R4;
		var R5 = params.R5;

		result = "Settings: "
		result += "<br>number of iterations = "+nIterations;
	/*	result += "<br>R1 = "+R1;
		result += "<br>R2 = "+R2;
		result += "<br>R3 = "+R3;
		result += "<br>R4 = "+R4;
		result += "<br>R5 = "+R5;
	*/
		result += "<br>fixed distances :";
		result += "<br>AC = "+AC;
		result += "<br>AB = "+AB;
		result += "<br>BD = "+BD;

		result += "<br>fixed positions :";
		result += "<br>b1 = "+b1;
		result += "<br>b2 = "+b2;
		result += "<br>b3 = "+b3;
		result += "<br>b4 = "+b4;
		result += "<br>b5 = "+b5;
		result += "<hr>";

		return result;
	}
	this.performChecks = function(settings,results)
	{
		vecA = results.vecA;
		vecB= results.vecB;
		vecC = results.vecC;
		vecD = results.vecD;

		vecBD = vecD.minus(vecB);
		vecAB = vecB.minus(vecA);
		vecAC = vecC.minus(vecA);
		// perform checks
		var prec = 5; // precision for displaying numbers
		var error2Sum = 0;
		var checkText = "<table><tr><th>segment</th><th>required</th><th>obtained</th><th>error</th></tr>";

		// R1, R2, R3, R4, R5=B5D
		let err = b1.minus(vecC).norm()-settings.R1; error2Sum += err*err;
		checkText += "<tr><td>from B1 to C </td><td>"+settings.R1.toFixed(prec) +"</td><td>"+b1.minus(vecC).norm().toFixed(prec)+"</td><td>"+err+"</td></tr>";
		err = b2.minus(vecC).norm()-settings.R2; error2Sum += err*err;
		checkText += "<tr><td>from B2 to C </td><td>"+settings.R2.toFixed(prec)  +"</td><td>"+b2.minus(vecC).norm().toFixed(prec) +"</td><td>"+err+"</td></tr>";
		err = b3.minus(vecA).norm()-settings.R3; error2Sum += err*err;
		checkText += "<tr><td>from B3 to A </td><td>"+settings.R3.toFixed(prec)  +"</td><td>"+b3.minus(vecA).norm().toFixed(prec) +"</td><td>"+err+"</td></tr>";
		err = b4.minus(vecA).norm()-settings.R4; error2Sum += err*err;
		checkText += "<tr><td>from B4 to A </td><td>"+settings.R4.toFixed(prec) +"</td><td>"+b4.minus(vecA).norm().toFixed(prec)+"</td><td>"+err+"</td></tr>";
		err = b5.minus(vecD).norm()-settings.R5; error2Sum += err*err;
		checkText += "<tr><td>from B5 to D  </td><td>"+ settings.R5.toFixed(prec) +"</td><td>"+b5.minus(vecD).norm().toFixed(prec)+"</td><td>"+err+"</td></tr>";
		// AB, AC, BD
		err = vecB.minus(vecA).norm()-AB; error2Sum += err*err;
		
		checkText += "<tr><td>from A to B </td><td>"+AB +"</td><td>"+vecB.minus(vecA).norm().toFixed(prec)+"</td><td>"+err+"</td></tr>";
		err = vecC.minus(vecA).norm()-AC; error2Sum += err*err;
		checkText += "<tr><td>from A to C </td><td>"+AC +"</td><td>"+vecC.minus(vecA).norm().toFixed(prec)+"</td><td>"+err+"</td></tr>";
		err = vecB.minus(vecC).norm()-(AC-AB); error2Sum += err*err;
		checkText += "<tr><td>from B to C </td><td>"+(AC-AB).toFixed(prec)+"</td><td>"+vecB.minus(vecC).norm().toFixed(prec)+"</td><td>"+err+"</td></tr>";
		err = vecB.minus(vecD).norm()-BD; error2Sum += err*err;
		checkText += "<tr><td>from B to D </td><td>"+BD+"</td><td>"+vecB.minus(vecD).norm().toFixed(prec)+"</td><td>"+err+"</td></tr>";
		err2 = Math.sqrt(error2Sum);
		checkText += "<tr><td>sqrt(sum of error^2)</td><td> </td><td></td><td>"+err2+"</td></tr>";

		checkText += "</table>";
		checkText += "<br>orthogonality of axes:<br>"
		checkText += "<table><tr><th>axis</th><th>axis</th><th>inner product</th></tr>";
		checkText += "<tr><td>BD</td><td>AC</td><td>"+vecBD.ip(vecAC)+"</td></tr>";
		checkText += "<tr><td>AC</td><td>J15</td><td>"+ vecAC.ip(results.J15)+"</td></tr>";
		checkText += "<tr><td>BD</td><td>J15</td><td>"+vecBD.ip(results.J15)+"</td></tr>";
		checkText += "<tr><td>B5-D</td><td>J13=J14</td><td>"+b5.minus(vecD).ip(results.J14)+"</td></tr>";
		checkText += "<tr><td>J15</td><td>J13=J14</td><td>"+results.J15.ip(results.J14)	+"</td></tr>";

		checkText += "</table>";

	return { text:checkText, err2:err2};	
	}

	this.resultString= function(settings, results)
	{
		result = "number of iterations: "+results.length;
		for (var j=results.length-1; 0<=j;  j--)
		{
			checked = this.performChecks(settings, results[j])
			 result+= "<hr>";
			result += "iteration: "+results[j].iteration;
			result += "<br> error: "+checked.err2;
			result += "<br> from B5 to A :"+results[j].B5toA;
			result += "<br> coordinates :";
			result += "<br> A ="+results[j].vecA.toString(5);	
			result += "<br> B ="+results[j].vecB.toString(5);	
			result += "<br> C ="+results[j].vecC.toString(5);	
			result += "<br> D ="+results[j].vecD.toString(5);
			result += "<br> orientations :";
			result += "<br> J14 ="+results[j].J14.toString(5);
			result += "<br> J15 ="+results[j].J15.toString(5);
			if (0<j)
			{
				result += "<br> changes :";
				result += "<br> change in A = "+results[j].vecA.minus(results[j-1].vecA).times(1/results[j].vecA.norm())
				result += "<br> change in B = "+results[j].vecB.minus(results[j-1].vecB).times(1/results[j].vecB.norm())
				result += "<br> change in C = "+results[j].vecC.minus(results[j-1].vecC).times(1/results[j].vecC.norm())
				result += "<br> change in D = "+results[j].vecD.minus(results[j-1].vecD).times(1/results[j].vecD.norm())
				result += "<br> change in J14 = "+results[j].J14.minus(results[j-1].J14)
				result += "<br> change in J15 = "+results[j].J15.minus(results[j-1].J15)
			}
				result += "<br> <b>precision</b>:<br>"+checked.text;
		}
		return result;
	}

}
