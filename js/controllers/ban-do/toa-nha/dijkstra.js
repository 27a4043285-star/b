/**
 * FILE: js/controllers/ban-do/tim-duong/dijkstra.js
 */
function findShortestPath(startId, endId, nodes, connections) {
    // 1. Khởi tạo đồ thị
    const graph = {};
    for (let id in nodes) graph[id] = {};
    
    connections.forEach(([p1, p2]) => {
        if(nodes[p1] && nodes[p2]) {
            let d = Math.sqrt((nodes[p1].x - nodes[p2].x)**2 + (nodes[p1].y - nodes[p2].y)**2);
            graph[p1][p2] = d;
            graph[p2][p1] = d;
        }
    });

    // Hàm phụ tìm đường đi ngắn nhất giữa 2 điểm
    function getPathAndDistance(src, dest) {
        let dist = {}, prev = {}, queue = [];
        for (let id in nodes) { dist[id] = Infinity; queue.push(id); }
        dist[src] = 0;

        while (queue.length) {
            queue.sort((a, b) => dist[a] - dist[b]);
            let u = queue.shift();
            if (u === dest) break;
            
            for (let v in graph[u]) {
                let alt = dist[u] + graph[u][v];
                if (alt < dist[v]) { dist[v] = alt; prev[v] = u; }
            }
        }
        
        let path = [], curr = dest;
        if (prev[curr] || curr === src) {
            while (curr) { path.unshift(curr); curr = prev[curr]; }
        }
        return { path, distance: dist[dest] };
    }

    // 2. Thuật toán Tham lam lọc danh sách điểm cần đi
    const excludedNodes = ['1.2', '12.1', '14.2', 'f20', 'f7', '8.2'];
    let unvisited = new Set();
    
    // CHỈ thêm vào danh sách cần thăm các điểm type 'red' VÀ không bị loại trừ
    for (let id in nodes) {
        let nodeType = (nodes[id].type || '').toLowerCase();
        let nodeId = String(id).toLowerCase();
        if (nodeType === 'red' && !excludedNodes.includes(nodeId)) {
            unvisited.add(id);
        }
    }
    
    let finalPath = [startId];
    let currentNode = startId;
    
    unvisited.delete(startId);
    if (endId && startId !== endId) {
        unvisited.delete(endId);
    }

    // Vòng lặp: Tìm điểm chưa thăm gần nhất
    while (unvisited.size > 0) {
        let nearestNode = null;
        let minDistance = Infinity;
        let bestPathToNext = [];

        for (let candidate of unvisited) {
            let result = getPathAndDistance(currentNode, candidate);
            if (result.distance < minDistance) {
                minDistance = result.distance;
                nearestNode = candidate;
                bestPathToNext = result.path;
            }
        }

        if (!nearestNode) break; 

        bestPathToNext.shift();
        finalPath.push(...bestPathToNext);
        
        currentNode = nearestNode;
        unvisited.delete(nearestNode);
        
        // Đánh dấu đã đi qua nếu vô tình đi ngang qua các điểm red khác
        for (let p of bestPathToNext) {
            if (unvisited.has(p)) unvisited.delete(p);
        }
    }

    if (endId && currentNode !== endId) {
        let finalLeg = getPathAndDistance(currentNode, endId);
        if (finalLeg.path.length > 0) {
            finalLeg.path.shift();
            finalPath.push(...finalLeg.path);
        }
    }

    return finalPath;
}