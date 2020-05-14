var svgNameSpace = "http://www.w3.org/2000/svg";


/* perform repeated small rotation around x and z axis
*/
function Matrix_rotate(M_in,nPhi,nTheta)
{
	var N = 20; // 20 small rotations along 2 different axes
	
	var delta = 0.02 ;// standard angle of rotation, in radians
	deltaPhi = delta * nPhi/N;
	deltaTheta = - delta * nTheta/N; // negative, because y-coordinates are mirrored in svg
	cosP = Math.cos(deltaPhi);
	sinP = Math.sin(deltaPhi);
	cosT = Math.cos(deltaTheta);
	sinT = Math.sin(deltaTheta);

	// the generators of the rotations
	// = matrices for small rotations
	// theta: rotate along z axis 
	M_theta = [ [ cosT, sinT  , 0],
		    [ -sinT , cosT  , 0],
		    [     0,   0   , 1] ];
	// phi: rotate along y axis
	M_phi = [ [ cosP, 0, sinP],
		  [ 0,    1,   0 ],
		  [ -sinP,0, cosP] ];
   	M_combined = MatrixUtil.Multiply(M_theta,M_phi); 
	// displayText += "Mcombined is "+MatrixUtil.AsHMTL(M_combined);
	// for small values of delta, M_theta x M_phi = M_phi x M_theta
	var M = M_in
	for (let k =0; k<N; k++)
	{
		M = MatrixUtil.Multiply(M_combined,M);
	}
	// make the rows orthonormal, because
        // after many rotations, round-off errors may have accumulated
	for(var i = 0; i<M.length; i++)
        {
               for (var j = 0; j<i; j++)
               { 
                        M[i]=VectorUtil.Subtract(M[i],
                               VectorUtil.TimesScalar(M[j],
                                 VectorUtil.InnerProduct(M[i],M[j])));
               }
        }
	return M;
}

/** param {svgObject} svg - a reference tot the svgObject 
 * param {array} from - x,y,z
 * param { array} to - x, y , z
 */

function lineSegment(svgObject,from,to, color)
   {
   	this.from = from; // [x,y,z]
   	this.to = to; // [x,y,z]

	this.element = document.createElementNS(svgNameSpace, 'path'); //Create a path in SVG's namespace
	this.element.style.stroke = color; //Set stroke colour
	this.element.style.strokeWidth = "2px"; //Set stroke width
	
   	this.setAtrb=function(attribute,value)
	   {	this.element.setAttributeNS(null,attribute,value);
	   }
   	/** @params {array} M_rotation - 3 x 3 matrix
   	*   @params {array} center - 	the center of the rotation, and of the projection
   	*/

   	this.project = function(M_rotation,center)
   	{	var from = VectorUtil.Subtract(this.from,center);
			from =MatrixUtil.TimesVector(M_rotation,from);
   		var to = VectorUtil.Subtract(this.to,center);
   			to = MatrixUtil.TimesVector(M_rotation,to);
		var pathDef = "M "+from[0]+" "+from[1]+" "+to[0]+" "+to[1]+" ";
		this.element.setAttribute("d",pathDef); //Set path's data
	}
   }
/** param {svgObject} svg - a reference tot the svgObject 
 * param {array} from - x,y,z
 * param { array} to - x, y , z
 */

function svgText(svgObject,coordinates,text, color)
   {
	this.element = document.createElementNS(svgNameSpace, 'text'); //Create a text in SVG's namespace

   	this.setAtrb=function(attribute,value)
	   {	this.element.setAttributeNS(null,attribute,value);
	   }

   	this.coord = coordinates; // [x,y,z]

	this.element.style.stroke = color; //Set stroke colour
	this.element.style.strokeWidth = "0.3px"; //Set stroke width
	this.element.textContent = text;
	this.setAtrb("font-family","sans-serif")
	this.setAtrb("font-size",5)
	this.setAtrb("x",coordinates[0])
	this.setAtrb("y",coordinates[1])
	
	this.setText= function(text)
	{	this.element.textContent = text;
	}

   	/** @params {array} M_rotation - 3 x 3 matrix
   	*   @params {array} center - 	the center of the rotation, and of the projection
   	*/

   	this.project = function(M_rotation,center)
   	{	var coord = VectorUtil.Subtract(this.coord,center);
			coord =MatrixUtil.TimesVector(M_rotation,coord);
   		this.setAtrb("x",coord[0])
   		this.setAtrb("y",coord[1])
	}
   }

function svgObjects(svgId)
{
	// private variables
	var svg = document.getElementById(svgId); //Get svg element
	var Mat_orient =	[ [-1,  0  , 0],
		[   0, 1  , 0],
		[   0,   0   , -1] ];  
	var Mat_projection_init =	[ [ 0,  0  , 1],
		[   0, -1  , 0],
		[   0,   0   , 0] ];

	var Mat_projection = MatrixUtil.Multiply(Mat_projection_init,Mat_orient);

	this.svg = function ()
	{	return svg;
	}
	// because positive y is down on the screen
	var that = this; 

	center = [20,20,20]

	this.setCenter=function(xyz)
		{       if (3 == xyz.length)
		        {       center = xyz;
		        }
		}
        this.elements = []; // array of lineSegments

	this.addCircle = function(center, color)
        {};
        
        this.addSegment = function (from,to,color)
	{
		let count = this.elements.length;
		this.elements[count] = new lineSegment(that,from,to,color);
		svg.appendChild(this.elements[count].element);
		this.elements[count].project(Mat_projection,center);
                return this.elements[count]; // return a handle to the segment
	}
	this.addText = function (coord,text,color)
	{
		let count = this.elements.length;
		this.elements[count] = new svgText(that,coord,text,color);
		svg.appendChild(this.elements[count].element);
		this.elements[count].project(Mat_projection,center);
                return this.elements[count]; // return a handle to the segment
	}
	this.rotate = function(down,right)
	{
		Mat_orient = Matrix_rotate(Mat_orient, down,right);
                Mat_projection = MatrixUtil.Multiply(Mat_projection_init,Mat_orient);
   		this.project();
	}

	this.project = function()
	{
   		for( let i = 0; i<this.elements.length; i++)
   		{
		this.elements[i].project(Mat_projection,center);
   		}
	}

}
var mouseX, mouseY;

function mouseIsDown(e)
{	
  	takeCoordinates(e)
	svg.setAttributeNS(null,'onmousemove',"mouseHasMoved(evt)");
}
function takeCoordinates(e)
{
	mouseX =   e.clientX||e.changedTouches[0].clientX;
	mouseY =   e.clientY||e.changedTouches[0].clientY;
}
function mouseIsUp(e)
{
   svg.setAttributeNS(null,'onmousemove',null);
}
function mouseHasMoved(e)
{
	oldX= mouseX;
	oldY= mouseY;
	takeCoordinates(e)
	resultSvg.rotate(mouseX-oldX,mouseY-oldY);
	axisSVG.rotate(mouseX-oldX,mouseY-oldY);
}

