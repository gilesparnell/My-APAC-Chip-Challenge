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
var aws                         = require("aws-sdk");
var kinesis                     = null;
var COGNITO_IDENTITY_POOL_ID    = "YOUR_IDENTITY_POOL_ID";
var COGNITO_ROLE_UNAUTH         = "arn:aws:iam::YOUR_ACCOUNT_ID:role/Cognito_CHIPPoolUnauth_Role";
var COGNITO_REGION              = "us-east-1";
var KINESIS_STREAM_NAME         = "CHIPStream";

function initialiseCognito()
{
    var regex = /[\w-]+:[0-9a-f-]+/;
    if ( !regex.test(COGNITO_IDENTITY_POOL_ID) )
    {
        console.log("Configuration Error!");
        console.log("Your Cognito Identity Pool Id is not set correctly");
        process.exit();
    }      

    console.log("Initialising Cognito...");
    
	var params = {
        //AccountId: 			AWS_ACCOUNT_ID, 
        RoleArn: 			COGNITO_ROLE_UNAUTH, 
        IdentityPoolId: 	COGNITO_IDENTITY_POOL_ID
    };
    
    // initialize the region for the SDK
    aws.config.region      = COGNITO_REGION;
    
    // initialize the Credentials object
    aws.config.credentials = new aws.CognitoIdentityCredentials(params);
	
    // Get the credentials for our user
    aws.config.credentials.get(function(err) 
    {
        if (err)
        {
            console.log("## credentials.get: " + err, err.stack); // an error occurred
        }
        else 
        {
            console.log("Cognito IdentityId => " + aws.config.credentials.identityId);    

            //
            // Other AWS SDKs will automatically use the Cognito Credentials provider
            //
            initialiseKinesis();
            sendRecordToKinesis();
        }
    });
}

function initialiseKinesis()
{
    kinesis = new aws.Kinesis();
}

function sendRecordToKinesis()
{
    var partitionKey    = aws.config.credentials.identityId;
    var recordParams    = 
    {
        Data:           "Hello Kinesis World!",
        PartitionKey:   partitionKey,
        StreamName:     KINESIS_STREAM_NAME
    };
    
    console.log(JSON.stringify(recordParams));
 
    kinesis.putRecord(recordParams, onKinesisPutRecord);
}

function onKinesisPutRecord(err, data)
{
    if (err) 
    {
      console.error(">>>>>>>>> " + err);
    }
    else
    {
        console.error(data);
    }
}

initialiseCognito();
