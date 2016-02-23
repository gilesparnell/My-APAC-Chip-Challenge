Welcome to the samples!

This directory has the following samples for you to use as a basis for learning
or for your own projects. Please note that the code cannot be released to anyone
outside of Amazon, without contacting the relevant author(s):

>> distance_graph
   Sample to show how to set up Bluetooth Low Energy on the CHIP. Hosts a web server that
   serves out a page to show the RSSI between two CHIPs, one acting as server and one
   as a client. Distance is calculated and rendered on a gauge.
   
   Use this sample as a basis for proximity detection apps
   

>> iot-mock-sensor
   This sample shows how to use the IoT SDK to update a thing shadow. It implements a mock
   temperature sensor, and updates the shadow once per second. You can update the desired
   state of the shadow for a pretend 'servo' to see the CHIP receive the update and
   respond appropriately
   
   Use this sample as a basis for any app that needs to interact with the thing shadow
   
 >> write-to-kinesis
   This sample shows how to use the AWS SDK to write to a Kinesis stream
   
   Use this sample as a basis for an app that needs to use the AWS SDK to write to Kinesis,
   or any other service (eg: SQS, SNS), and also uses Cognito an unauthenticated role
   to gain access
   
   