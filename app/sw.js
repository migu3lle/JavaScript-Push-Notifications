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

/* eslint-env browser, serviceworker, es6 */

'use strict';

// ---------- LISTEN FOR PUSH EVENTS -----------------
self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
  
    //We might put the event.data to our notification....but let's keep it simple...

    //Create Push Notification
    const title = 'Push WEBTECH-18';
    const options = {
      body: 'Sure it works.',
      icon: 'images/icon.png',
      badge: 'images/badge.png'
    };
    //waitUntil() takes a Promise and keep the Service worker alive until Promise has resolved
    event.waitUntil(self.registration.showNotification(title, options));
  });