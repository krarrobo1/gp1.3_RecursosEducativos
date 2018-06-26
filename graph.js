

/*
 * Written by Christophe
 * Purpose: This is a starting point for visualizing 
 * graph algorithms. User can save, load, and modify graphs.
 * Obviously some assembly required. Adding in Dijkstra's MST 
 * as an example.
 * 
 */

// TODO
// 3) MST
// 1) Disconnecting edges
// 2) More graph algos: 
//      e.g. Steiner tree approximation, where steiner nodes are selected nodes; add cost and unidirection to do flows;

//
// Mozilla's solution for allowing indexOf in certain browsers
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

// Stackoverflow: Finding the x,y position of the current DOM element. Solution by user: lwburk
function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

// Holds all the relevant graph information
Graph = function() {
    var self = this;

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    var points = new Array();
    var selectedPoints = new Array(); // subset of points    
    var shortestEdges = new Array();
    // var edges = new Array();

    // Initialize the function
    this.init = function() {
        
        canvas.setAttribute("style","border-width:2px;border-style:solid");

        canvas.onmousedown = self.onmousedown;

        var randomNodeButton = document.getElementById('randomNodeButton');
        var connectNodeButton = document.getElementById('connectNodeButton');
        var shortestPathButton = document.getElementById('dijkstraButton');
        var resetButton = document.getElementById('resetButton');
        //var saveButton = document.getElementById('saveButton');
        //var loadButton = document.getElementById('loadButton');

        //var mstButton = document.getElementById('mstButton');

        // this.toggleShortestPathButton();
        
        randomNodeButton.onclick = this.addRandomNode;
        connectNodeButton.onclick = this.connectNodes;
        resetButton.onclick = this.resetGraph;
        shortestPathButton.onclick = this.calculateShortestPath;
       /* saveButton.onclick = this.saveGraph;
        loadButton.onclick = this.loadGraph;

        mstButton.onclick = this.mstGraph;
        */
    }

    // Save the current graph points and edges; can only do 1 at a time
    this.saveGraph = function() {
        var savePoints = new Array();
        var saveEdges = new Array();
        // for (var point in points) {
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            var toSavePoint = new Point(point.x, point.y, point.radius);
            // Orders are for saving edges later
            point.order = savePoints.length;

            savePoints[savePoints.length] = toSavePoint;
        }
        // second pass for saving edges
        // for (var point in points) {
        for (var i = 0; i < points.length; i++) {
            var point = points[i];

            // for (var otherPoint in point.edges);
            for (var j = 0; j < point.edges.length; j++) {
                var otherPoint = point.edges[j];
                // edges overloaded -- index instead of pointers
                saveEdges[saveEdges.length] = new Edge(point.order, otherPoint.order, null);
            }
        }
        /*
        localStorage.graphPoints = JSON.stringify(savePoints);
        localStorage.graphEdges = JSON.stringify(saveEdges);*/
    }

    // Load the last saved graph
    this.loadGraph = function() {
        var savePoints = JSON.parse(localStorage.graphPoints);
        var saveEdges = JSON.parse(localStorage.graphEdges);

        if (!savePoints) {
            return;
        }
        self.resetGraph();

        // use proper loop because of the way ECMAscript standard does not define for-in
        for (var i = 0; i < savePoints.length; i++) {
            var pointObj = savePoints[i];
            points[points.length] = new Point(pointObj.x, pointObj.y, pointObj.radius);
        }
        
        // for (var edge in saveEdges) {
        for (var i = 0; i < saveEdges.length; i++) {
            var edge = saveEdges[i];
            var source = points[edge.source];
            var destination = points[edge.destination];
            source.edges[source.edges.length] = destination;
        }
    }

    this.resetGraph = function() {
        delete points;
        delete selectedPoints;
        delete shortestEdges;
        points = new Array();
        selectedPoints = new Array();
        shortestEdges = new Array();
    }

    this.toggleShortestPathButton = function() {
        var shortestPathButton = document.getElementById('dijkstraButton');
        if (shortestPathButton.getAttribute('disabled')) {
            shortestPathButton.setAttribute('disabled','false');
        }
        else {
            shortestPathButton.setAttribute('disabled','false');
        }
    }

    this.mstGraph = function() {
        self.calculateShortestPath(action='MST');
    }

    // Create shortest path with first selected point;
    this.calculateShortestPath = function(action) {
        var findMST = false;
        if (action == 'MST') {
            findMST = true;
        }


        if (!selectedPoints || selectedPoints.length == 0) {
            return;
        }

        var root = selectedPoints[0]; // arbitrary
        root.cost = 0;
        shortestEdges = new Array();
        
        // For drawing later
        shortestEdges.root = root; //new Point(root.x, root.y);

        // dijkstra's on root
        var candidates = points.slice(0);
        var visited = new Array();
        
        // Remove root from candidates
        var removeIndex = candidates.indexOf(root);
        if (removeIndex > -1) {
            candidates.splice(removeIndex, 1);
        }

        // remove candidate
        visited[visited.length] = root;

        while (candidates.length > 0) {

            // find shortest path from node
            var candidateEdge = null;

            // Check all visited nodes
            for (var i = 0; i < visited.length; i++) {
                var node = visited[i];
                
                // All nodes connected
                for (var j = 0; j < node.edges.length; j++) {
                    var otherNode = node.edges[j];

                    // Only unadded nodes
                    if (visited.indexOf(otherNode) == -1) {

                        var cost = node.distanceTo(otherNode);
                        if (findMST) { 

                        }
                        else { // Check cost from root
                            cost += node.cost;
                        }
                        
                        if (!candidateEdge || cost < candidateEdge.cost) {
                            candidateEdge = new Edge(node, otherNode, cost);
                        }
                        
                    }
                    
                }
            }
            // Add new edge or continue
            if (candidateEdge) {
                // Update this node's cost!
                if (findMST) {

                }
                else { // add cost from root
                    candidateEdge.destination.cost = candidateEdge.cost;    
                }
                shortestEdges[shortestEdges.length] = candidateEdge;
                var toRemove = candidates.indexOf(candidateEdge.destination);
                visited[visited.length] = candidateEdge.destination;
                candidates.splice(toRemove,1);
            }
            else {
                break;
            }
        }

    }

    this.onmousedown = function(event) {
        // Register onmousemove and move the element accordingly
        var pos = findPos(this);
        var x = event.pageX - pos.x;
        var y = event.pageY - pos.y;

        // Temporary -- not the best way to go about things

        var selectedPoint = self.pointInCoordinates(x,y);
        if (selectedPoint) {
            var moved = false;

            selectedPoint.showCoordinates= true;

            canvas.onmousemove = function(event) {
                var point = selectedPoint;
                var pos = findPos(this);
                var x = event.pageX - pos.x;
                var y = event.pageY - pos.y;

                point.x = x;
                point.y = y;

                moved = true;
            }
            canvas.onmouseup = function(event) {

                selectedPoint.showCoordinates = false;
                if (selectedPoint.selected) {
                    var index = selectedPoints.indexOf(selectedPoint);
                    selectedPoints.splice(index,1);
                    selectedPoint.selected = false;

                }
                else {
                    selectedPoints[selectedPoints.length] = selectedPoint;
                    selectedPoint.selected = true;
                }

                // }
                canvas.onmouseup = null;            
                canvas.onmousemove = null;
            }
        }
        else {
            canvas.onmouseup = function() {
                for (var i = 0; i < selectedPoints.length; i++) {
                    selectedPoints[i].selected = false;
                }

                selectedPoints.splice(0, selectedPoints.length);
                canvas.onmouseup = null;
            }
        }

    }

    // Grab the first point that is in the given coordinates
    this.pointInCoordinates = function(x,y) {
        // First check one... then the other... maybe better to use priority queue so you can cycle through
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            if (point.containsPoint(x,y)) {
                return point;
            }
        }
        // for (var i = 0; i < selectedPoints.length; i++) {
        //     var point = selectedPoints[i];
        //     if (point.containsPoint(x,y)) {
        //         return point;
        //     }   
        // }
        return null;
    }

    // Create a clique from the selection
    this.connectNodes = function() {
        for (var i = 0; i < selectedPoints.length; i++) {
            for (var j = i+1; j < selectedPoints.length; j++) {

                var pointI = selectedPoints[i];
                var pointJ = selectedPoints[j];
                
                var indexJ = pointI.edges.indexOf(pointJ);
                var indexI = pointJ.edges.indexOf(pointI);
                
                // Assume bidirectionality
                if (indexI * indexJ < 0) {
                    alert("Edge inconsistency: not bidirectional")
                }

                if (indexI >= 0 && indexJ >= 0) { // disconnect
                    // pointI.edges.splice(indexJ,1);
                    // pointJ.edges.splice(indexI,1);
                    console.log('NOT adding edge:'  + i + ',' + j);
                }
                else {
                    console.log('Adding edge:' + i + ',' + j);
                    pointI.edges[pointI.edges.length] = pointJ;
                    pointJ.edges[pointJ.edges.length] = pointI;
                }
            }
        }
    }

    // Adds a random node to the graph and selects it
    this.addRandomNode = function() {
        var randomX = Math.floor(Math.random() * canvas.width);
        var randomY = Math.floor(Math.random() * canvas.height);
        var newPoint = new Point(randomX,randomY);
        newPoint.selected = true;
        points[points.length] = newPoint;
        selectedPoints[selectedPoints.length] = newPoint;
    }

    // Draw everything
    this.timer = function() {

        context.clearRect(0,0,canvas.width, canvas.height)

        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            point.draw(context);
        }

        if (shortestEdges) {
            for (var i = 0; i < shortestEdges.length; i++) {
                var edge = shortestEdges[i];
                edge.draw(context);
            }
            if (shortestEdges.root && !shortestEdges.root.showCoordinates) {
                var shadowPoint = new Point(shortestEdges.root.x, shortestEdges.root.y, shortestEdges.root.radius);

                shadowPoint.draw(context,'red', 'Source');
            }
        }
    }

    this.run = function() {
        setInterval(function(){self.timer()},10);
    }

}

Edge = function(source,destination,cost) {
    this.source = source;
    this.destination = destination;
    this.cost = cost;

    
    this.draw = function(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = 'blue';
        ctx.moveTo(this.source.x, this.source.y);
        ctx.lineTo(this.destination.x, this.destination.y);
        ctx.stroke();
    }
    
}

// Bit of a misnomer
Point = function(x,y,radius) {
    this.x = x;
    this.y = y;
    if (!radius) {
        radius = 8;
    }
    this.radius = radius;
    this.selected = false;
    this.edges = new Array();
    
    this.distanceTo = function(otherPoint) {
        if (otherPoint instanceof Point) {
            return Math.pow(Math.pow(this.x - otherPoint.x, 2) + Math.pow(this.y - otherPoint.y, 2), .5);
        }
        else {
            throw new TypeError();
        }
    }

    this.draw = function(ctx,color,text) {
        
        if (!color) {
            color = 'black';
        }

        ctx.beginPath();
        ctx.arc(this.x,this.y,radius,0,2*Math.PI);
        ctx.fillStyle=color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle=color;
        ctx.stroke();

        if (this.selected) {
            ctx.beginPath();
            ctx.arc(this.x,this.y,radius*2,0,2*Math.PI);
            ctx.strokeStyle='red';
            ctx.stroke();
        }

        if (this.showCoordinates) {
            ctx.font="20px Helvetica";
            ctx.fillText("(" + this.x + "," + this.y + ")",this.x + this.radius * 2, this.y+this.radius * 2);
        }

        if (text) {
            ctx.font="20px Helvetica";
            ctx.fillText(text,this.x + this.radius * 2, this.y+this.radius * 2);
        }

        // draw all edges
        ctx.beginPath();
        for (var i = 0; i < this.edges.length; i++) {
            var otherPoint = this.edges[i];
            ctx.strokeStyle='black';
            ctx.moveTo(this.x,this.y);
            ctx.lineTo(otherPoint.x, otherPoint.y);
            
        }
        ctx.stroke();
    }

    this.containsPoint = function(x,y) {
        return (Math.pow(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2), .5) < this.radius);
    }
}

var graph = new Graph();

graph.init();
graph.run();
