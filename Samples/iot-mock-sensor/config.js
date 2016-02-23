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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Configure these values
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

var DEVICE_NAME						= "YOU_THING_NAME";
var IOT_KEY_PATH					= './cert/private.pem.key';
var IOT_CERT_PATH                   = './cert/certificate.pem.crt';
var IOT_CA_PATH                     = './cert/rootCA.pem';
var IOT_REGION						= 'us-east-1';
var AWS_REGION						= 'us-east-1';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Leave these as they are - pre-configured for use in the sample script 
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

var config = {}

config.aws 	        = {};
config.IoT		    = {};

//
// IoT
//
config.IoT.thingName = DEVICE_NAME;
config.IoT.keyPath	 = IOT_KEY_PATH;
config.IoT.certPath  = IOT_CERT_PATH;
config.IoT.caPath    = IOT_CA_PATH;
config.IoT.region	 = IOT_REGION;

//
// General
//
config.SEND_TO_IOT						= true;
config.DEVICE_NAME						= DEVICE_NAME;

//
// AWS
//
config.aws.AWS_REGION                  	= AWS_REGION;

//
// Mock
//
config.mock                                 = {};
config.mock.enabled                         = true;

//
// Export
//
module.exports = config;

