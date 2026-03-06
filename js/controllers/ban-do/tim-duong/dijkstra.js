function findShortestPath(startId, endId, nodes, connections) {
    const graph = {};
    for (let id in nodes) graph[id] = {};
    
    connections.forEach(([p1, p2]) => {
        if(nodes[p1] && nodes[p2]) {
            // Tính khoảng cách Pythagore đơn giản
            let d = Math.sqrt((nodes[p1].x-nodes[p2].x)**2 + (nodes[p1].y-nodes[p2].y)**2);
            graph[p1][p2] = d;
            graph[p2][p1] = d;
        }
    });

    let distances = {}, previous = {}, queue = [];
    for (let id in nodes) { distances[id] = Infinity; queue.push(id); }
    distances[startId] = 0;

    while (queue.length) {
        queue.sort((a, b) => distances[a] - distances[b]);
        let u = queue.shift();
        if (u === endId) break;
        
        for (let v in graph[u]) {
            let alt = distances[u] + graph[u][v];
            if (alt < distances[v]) { distances[v] = alt; previous[v] = u; }
        }
    }
    
    let path = [], curr = endId;
    if (previous[curr] || curr === startId) {
        while (curr) { path.unshift(curr); curr = previous[curr]; }
    }
    return path;
}