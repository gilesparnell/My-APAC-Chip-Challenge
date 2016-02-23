/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 *
 * Author: Adam Larter, Solutions Architect, AWS
 * Created: February, 2016
 * 
 * For internal Amazon purposes only! Not for distribution.
 * Contact author for more details
 * 
 */
var kalman             = require("./kalman_prediction");

// Constructor
function DetectionContainer(uuid, name, detectorName) 
{
	//
  	// Instance properties
	//
    this.detectorName            = detectorName; 
    this.name                    = name;
	this.uuid 				     = uuid;
	this.rssi				     = 0;
    this.confidence              = 0;
	this.filteredRSSI		     = 0;
	this.calculatedDistance	     = 0;
    this.lastDetectionTimestamp  = new Date(); 
	
  	this.arrayDetections 	     = new Array();  
}

//
// class methods
//
DetectionContainer.prototype.CloneWithoutDetections = function()
{
    var lhs                         = new DetectionContainer(this.uuid, this.name);
    lhs.detectorName                = this.detectorName;
    lhs.rssi                        = this.rssi;
    lhs.confidence                  = this.confidence;
    lhs.filteredRSSI                = this.filteredRSSI;
    lhs.calculatedDistance          = this.calculatedDistance;
    lhs.lastDetectionTimestamp      = this.lastDetectionTimestamp;
    lhs.arrayDetections             = null;
    
    return lhs;
}

DetectionContainer.prototype.PredictUsingKalman = function() 
{
    var lastTimestamp = 0;
    var prediction = 0;
    var confidence = 0;
    var lastMeasured = 0;
    
    var sylvester = require("sylvester");
    var decay = 0.1;
    var R = sylvester.Matrix.Diagonal([0.2, 0.2]);
    var x = sylvester.Matrix.create([
        [0],
        [0],
        [0],
        [0]
    ]);
    var u = sylvester.Matrix.create([
        [0],
        [0],
        [0],
        [0]
    ]);
    var P = sylvester.Matrix.create([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]);
    var H = sylvester.Matrix.create([
        [1, 0, 0, 0],
        [0, 1, 0, 0]
    ]);
    var I = sylvester.Matrix.I(4);
    
    for (var i = 0; i < this.arrayDetections.length; i++) 
    {
        var xMeasure = parseInt(this.arrayDetections[i].RSSI);
        var yMeasure = xMeasure;
        
        // change in time
        var dateEvent = Date.parse(this.arrayDetections[i].timestamp);
        var dt = dateEvent - lastTimestamp;
        lastTimestamp = dateEvent;
        
        dt /= 1000;
        
        // get rid of way-off values - anything older than 1 hour, becomes 1 second
        if (dt == 0 || dt > 3600)
            dt = 1;
        
        // Derive the next state
        F = sylvester.Matrix.create(
                [[1, 0, dt, 0],
                [0, 1, 0, dt],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ]);
        
        P = P.map(function (x) {
            return x * (1 + decay * dt);
        });
        
        // prediction
        x = F.x(x).add(u);
        P = F.x(P).x(F.transpose());
        
        // measurement update
        Z = sylvester.Matrix.create([[xMeasure, yMeasure]]);
        y = Z.transpose().subtract(H.x(x));
        S = H.x(P).x(H.transpose()).add(R);
        
        K = P.x(H.transpose()).x(S.inverse());
        x = x.add(K.x(y));
        P = I.subtract(K.x(H)).x(P);
        
        var pSize = P.max() * 2000;
        
        prediction = x.e(1, 1);
        confidence = parseFloat(pSize.toFixed(2));
        lastMeasured = xMeasure;
        
    }
    
    //
    // Update container
    //
    this.rssi               = lastMeasured;
    this.filteredRSSI       = parseFloat(prediction.toFixed(4));
    this.confidence         = confidence;
};

DetectionContainer.prototype.CalculateDistance = function() {
    
    var txCalibratedPower = -59;
    
    var coefficient1 = 0.42093;
    var coefficient2 = 6.9476;
    var coefficient3 = 0.54992;
    
    /*
    var coefficient1 = 0.89976;
    var coefficient2 = 7.7095;
    var coefficient3 = 0.111;
    */
     

    if (this.filteredRSSI == 0) {
        return -1.0;
    }
    
    var result = 0;
    
    var ratio = this.filteredRSSI * 1.0 / txCalibratedPower;
    if (ratio < 1.0) 
    {
    	    result = Math.pow(ratio, 10);
    }
    else 
    {
        result = (coefficient1) * Math.pow(ratio, coefficient2) + coefficient3;
    }
    
    this.calculatedDistance = parseFloat(result.toFixed(4));    
}

// export the class
module.exports = DetectionContainer;