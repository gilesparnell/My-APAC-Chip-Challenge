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
var SENSOR_TIMEOUT  = 1000;
var util            = require("util");
var events          = require('events');
var mockServiceData = [
    { temperature: 30 },
];

MockImplementation.prototype.__proto__ = events.EventEmitter.prototype;

function MockImplementation()
{
    events.EventEmitter.call(this);
}

MockImplementation.prototype.startMockService = function()
{
    setTimeout(this.doMockServiceInterrupt, 500, this);
    this.establishKeyListenerForMockMode();
}

MockImplementation.prototype.doMockServiceInterrupt = function(host)
{
    //
    // Iterate through each of the mock sensors, bump their values by 'a bit'
    //
    for ( var sensor in mockServiceData )
    {
        var thisSensor = mockServiceData[sensor];
        thisSensor.temperature = ~~(thisSensor.temperature) + ((Math.random() > .05) ? 0.5 : -0.1); 
        
        //
        // Tell the app we heard from this pretend device
        //
        host.emit("onmocksensorupdate", thisSensor);
    }
    
    // Call ourselves again
    setTimeout(host.doMockServiceInterrupt, SENSOR_TIMEOUT, host);
}

MockImplementation.prototype.establishKeyListenerForMockMode = function()
{
    var stdin = process.stdin;
    var host  = this;

    // without this, we would only get streams once enter is pressed
    stdin.setRawMode( true );
    
    // resume stdin in the parent process (node app won't quit all by itself
    // unless an error or process.exit() happens)
    stdin.resume();
    
    // i don't want binary, do you?
    stdin.setEncoding( 'utf8' ); 
    
    // on any data into stdin
    stdin.on( 'data', function( key ){
    // ctrl-c ( end of text )
    if ( key === '\u0003' ) {
        process.exit();
    }
    
    /*
    if ( key === 'm' || key === 'M' )
    {
        host.doMockSendMessage();
    }
    */
    });
}

MockImplementation.prototype.doMockSendMessage = function()
{
    this.emit("onmockmessagesend", JSON.stringify({data:"Hello World"}));  
}


// export the class
module.exports = MockImplementation;