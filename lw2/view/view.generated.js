
const NODES_JSON = '[{"id":100,"label":"s2/y3"},{"id":101,"label":"s3/y3"},{"id":102,"label":"s1/y2"},{"id":103,"label":"s3/y1"},{"id":104,"label":"s1/y3"},{"id":5,"label":"s2/y3"},{"id":6,"label":"s3/y3"},{"id":7,"label":"s1/y2"}]'
const EDGES_JSON = '[{"from":100,"to":102,"label":"x0","length":250},{"from":100,"to":101,"label":"x1","length":250},{"from":101,"to":101,"label":"x0","length":250},{"from":101,"to":102,"label":"x1","length":250},{"from":102,"to":100,"label":"x0","length":250},{"from":102,"to":101,"label":"x1","length":250},{"from":103,"to":101,"label":"x0","length":250},{"from":103,"to":102,"label":"x1","length":250},{"from":104,"to":100,"label":"x0","length":250},{"from":104,"to":101,"label":"x1","length":250},{"from":5,"to":7,"label":"x0","length":250},{"from":5,"to":6,"label":"x1","length":250},{"from":6,"to":6,"label":"x0","length":250},{"from":6,"to":7,"label":"x1","length":250},{"from":7,"to":5,"label":"x0","length":250},{"from":7,"to":6,"label":"x1","length":250}]'

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
