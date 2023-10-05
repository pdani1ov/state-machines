function generateView(nodes: Object, edges: Object) {
    return `
const NODES_JSON = '${JSON.stringify(nodes)}'
const EDGES_JSON = '${JSON.stringify(edges)}'

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
`
}

export {
    generateView
}