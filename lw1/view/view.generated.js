
const NODES_JSON = '[{"id":0,"label":"s2"},{"id":1,"label":"s3"},{"id":2,"label":"s1"}]'
const EDGES_JSON = '[{"from":0,"to":2,"label":"1/y2","length":250},{"from":0,"to":2,"label":"2/y1","length":250},{"from":1,"to":0,"label":"1/y1","length":250},{"from":1,"to":1,"label":"2/y2","length":250},{"from":2,"to":0,"label":"1/y1","length":250},{"from":2,"to":1,"label":"2/y2","length":250}]'

window.onload = () => {
    var nodes = new vis.DataSet(JSON.parse(NODES_JSON));

// create an array with edges
    var edges = new vis.DataSet(JSON.parse(EDGES_JSON));

    var data = {
        nodes: nodes,
        edges: edges,
    };
    var options = {
        edges: {
            font: {
                align: "top",
                size: 10,
            },
            arrows: {
                to: { enabled: true, scaleFactor: 0.5, type: "arrow" }
            },
        },
    }
    new vis.Network(document.getElementsByClassName('container')[0], data, options);
}
