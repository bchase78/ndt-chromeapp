/**
 * @author Benjamin M. Chase <benjamin.chase@fh-luebeck.de>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
"use strict";

//Test Compatibility of Websockets in Web Workers
// wsww = websockets in webworkers

self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {
    case 'test':
        wswwSocket();
        break;
    default:
        // self.postMessage('Unknown command: ' + data.msg);
    };
}, false);

/**
 * Description   test if websocket is available in a web worker and report it to 
 * the main thread. Then exit the webworker
 * 
 * self must referenced because a window is unavailable in a web worker
 * @method wswwSocket
 * @return 
 */
function wswwSocket() {
    /**
     * @returns {boolean} Websocket available?
     */
    var IsSupported = ("WebSocket" in self);

    // On Success report that function is working
    self.postMessage({
        'cmd': 'wsWwTest',
        'msg': IsSupported
    });
    // Terminates the worker.
    self.close();
}