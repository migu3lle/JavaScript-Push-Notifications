/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, es6 */

'use strict';

//Generate VAPID Key pair from https://web-push-codelab.glitch.me/
//Or use node webpush library
const applicationServerPublicKey = 'BJ2lVVusIV33e7zCusRC_PxbDYROIEtzT8byEfSjzTbSTBZnVHGTfhE4dWduJOKuiNMsGWG6EyHNfBUle-E8pVQ';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false; //Bool: User subscribed to notifcations or not
let swRegistration = null;  //Will be returned from navigator.serviceWorker.register()

// ---------- CONVERT PUBLIC KEY ------------------
//Needed for converting public key to UInt8Array which is expected input of the subscribe call.
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ---------- REGISTER A SERVICE WORKER -----------
//Check if Service Workers and Push Messaging are supported by the current browser
if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  //!!! Register our sw.js file as Service Worker !!!
  navigator.serviceWorker.register('sw.js')
  .then(function(swReg) {
    console.log('Service Worker is registered', swReg);

    swRegistration = swReg;
    initializeUI();
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
  pushButton.textContent = 'Push Not Supported';
}

// ---------- ACTIVATE UI BUTTON IF SUBSCRIBED -----------
function initializeUI() {
  //Add click listener for our button
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true; //Disable since subscription to push can take some time
    if (isSubscribed) {
      // TODO: Unsubscribe user
    } else {
      subscribeUser();
    }
  });
  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    //Check if user is currently subscribed
    isSubscribed = !(subscription === null);

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }
    updateBtn();  //Update Button state (enabled/disabled)
  });
}
//Function to update Button Text and enable button
function updateBtn() {
  //Check if user blocked permission to push notifications
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true; //If so, disable button
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}


// ---------- SUBSCRIPTION TO NOTIFICATIONS -----------
//Subscribe when we know the user isn't currently subscribed 
function subscribeUser() {
  //Convert public key to UInt8Array
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  
  /*Subscribe on our Service Worker's pushManager
    --> Promise will resolve on
        1. user has granted permissions to display notifications (pop-up)
        2. browser has sent network request to a push service to get the details to generate a PushSubscription */
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,  //Admission to show notification every time a push is sent
    applicationServerKey: applicationServerKey  //Service worker will listen to notifications with this key
  })
  //User has accepted and promise returned a PushSubscription
  .then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {  //User declined or subscribing the user failed
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

// ---------- UPDATE SUBSCRIPTION ON SERVER -----------
function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server (not in this case)

  const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails =
    document.querySelector('.js-subscription-details');

  if (subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove('is-invisible');
  } else {
    subscriptionDetails.classList.add('is-invisible');
  }
}