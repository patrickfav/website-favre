---
title: 'Snippet: Simple Sigma.js AngularJs Directive'
date: 2014-10-02
lastmod: 2023-02-25
lastfetch: 2023-02-26T09:46:48.919Z
description: 'Simple Sigma.js AngularJs Directive: Since I did not find any angularjs directive for angularjs I created a little simple of my own. This is by no means a ready-for-all solutions, but all the features I needed at the time; it is easily extended to your needs and maybe sometimes somebody will do a full-blown directive for sigma.js  Tested: angularjs 1.2.25, sigma.js 1.0.3 (should work with angularjs 1.3).'
summary: 'Simple Sigma.js AngularJs Directive: Since I did not find any angularjs directive for angularjs I created a little simple of my own. This is by no means a ready-for-all solutions, but all the features I needed at the time; it is easily extended to your needs and maybe sometimes somebody will do a full-blown directive for sigma.js  Tested: angularjs 1.2.25, sigma.js 1.0.3 (should work with angularjs 1.3).'
aliases: [/l/45528e7135dd]
slug: 2014/simple-sigmajs-angularjs-directive
tags: ["JavaScript", "HTML"]
keywords: ["JavaScript", "HTML"]
alltags: ["JavaScript", "HTML"]
categories: ["opensource"]
type: gist
showTableOfContents: false
showTaxonomies: false
thumbnail: 'gistbanner*'
editURL: https://gist.github.com/cd20939b383b9c284511
originalContentLink: https://gist.github.com/cd20939b383b9c284511
originalContentType: gist
gistLanguage: JavaScript
gistFileCount: 3
gistComments: 4
gistCommentsUrl: https://api.github.com/gists/cd20939b383b9c284511/comments
---

{{< info >}} Simple Sigma.js AngularJs Directive: Since I did not find any angularjs directive for angularjs I created a little simple of my own. This is by no means a ready-for-all solutions, but all the features I needed at the time; it is easily extended to your needs and maybe sometimes somebody will do a full-blown directive for sigma.js  Tested: angularjs 1.2.25, sigma.js 1.0.3 (should work with angularjs 1.3). The [original Gist](https://gist.github.com/cd20939b383b9c284511) can be found on Github.{{< /info >}}


### sigma-js-angular-app.js

```JavaScript
/*
 * Copyright 2017 Patrick Favre-Bulle
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
	'use strict';
	angular.module('sigmajs-ng', []).directive('sigmajs', function() {
		//over-engineered random id, so that multiple instances can be put on a single page
		var divId = 'sigmjs-dir-container-'+Math.floor((Math.random() * 999999999999))+'-'+Math.floor((Math.random() * 999999999999))+'-'+Math.floor((Math.random() * 999999999999));
		return {
			restrict: 'E',
			template: '<div id="'+divId+'" style="width: 100%;height: 100%;"></div>',
			scope: {
				//@ reads the attribute value, = provides two-way binding, & works with functions
				graph: '=',
				width: '@',
				height: '@',
				releativeSizeNode: '='
			},
			link: function (scope, element, attrs) {
				// Let's first initialize sigma:
				var s = new sigma({
					container: divId,
					settings: {
						defaultNodeColor: '#ec5148',
						labelThreshold: 4
					}
				});
	
	
				scope.$watch('graph', function(newVal,oldVal) {
					s.graph.clear();
					s.graph.read(scope.graph);
					s.refresh();
					if(scope.releativeSizeNode) {
						//this feature needs the plugin to be added
						sigma.plugins.relativeSize(s, 2);
					}
				});
	
				scope.$watch('width', function(newVal,oldVal) {
					console.log("graph width: "+scope.width);
					element.children().css("width",scope.width);
					s.refresh();
					window.dispatchEvent(new Event('resize')); //hack so that it will be shown instantly
				});
				scope.$watch('height', function(newVal,oldVal) {
					console.log("graph height: "+scope.height);
					element.children().css("height",scope.height);
					s.refresh();
					window.dispatchEvent(new Event('resize'));//hack so that it will be shown instantly
				});
	
				element.on('$destroy', function() {
					s.graph.clear();
				});
			}
		};
	});
})();
```

### sigma-js-controller.js

```JavaScript
function MyCtrl($scope) {
  $scope.sigmaGraph = {
  "nodes": [
    {
      "id": "n0",
      "label": "A node",
      "x": 0,
      "y": 0,
      "size": 3
    },
    {
      "id": "n1",
      "label": "Another node",
      "x": 3,
      "y": 1,
      "size": 2
    },
    {
      "id": "n2",
      "label": "And a last one",
      "x": 1,
      "y": 3,
      "size": 1
    }
  ],
  "edges": [
    {
      "id": "e0",
      "source": "n0",
      "target": "n1"
    },
    {
      "id": "e1",
      "source": "n1",
      "target": "n2"
    },
    {
      "id": "e2",
      "source": "n2",
      "target": "n0"
    }
  ]
}
}
```

### sigma-js-index.html

```HTML
<script src="js/sigma.min.js"></script>

...

<sigmajs graph="sigmaGraph" width="100%" height="300px" releative-size-node="true"></sigmajs>

```

