// Returns the distance between two points
function distanceTo(vector, vector1) {
	return Math.pow( Math.pow(vector[0]-vector1[0], 2) + Math.pow(vector[1]-vector1[1], 2) , 0.5);
}

// Returns the unit vector direction between two points
function directionTo(vector, vector1) {
	var modulus = distanceTo (vector, vector1);
	if (modulus) {
		return [ (vector1[0] - vector[0]) / modulus, (vector1[1] - vector[1]) / modulus];
	}
	else {
		return [0,0];
	}
}

// Returns the modulus of a vector
function modulus(vector) {
	return distanceTo([0,0], [vector[0], vector[1]])
}

// Returns the dot product of two vectors
function dotProduct(vector1, vector2) { 
	return vector1[0]*vector2[0] + vector1[1]*vector2[1];
}

// Returns the vector scaled 
function scale(vector, factor) {
	return [vector[0]*factor, vector[1] * factor];
}
