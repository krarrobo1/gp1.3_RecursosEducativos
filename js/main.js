


$("#randomNodeButton").click(function () {
    $(".mensaje1").html("<p>Selecciona los nodos que desee unir, luego presione <strong>'Conectar nodos' </strong> para unir los nodos seleccionados</p>");
});

$("#connectNodeButton").click(function(){
    $(".mensaje1").html("<p>Presione <strong>'Camino mas corto' </strong> para encontrar el camino mas corto mediante Dijkstra...</p>");
});

$("#dijkstraButton").click(function(){
    $(".mensaje1").html("<p>Presione <strong>'Limpiar'</strong> para empezar denuevo...</p>");
});

$("#resetButton").click(function(){
    $(".mensaje1").html("<p>Presione <strong>Añadir nodo</strong> para comenzar...</p>")
});



/*function presentarMensaje() {
    var p = '<p class="alert alert-info">';
    p += "Seleccione los nodos que desea unir...";
    p += '</p>';
    $(p).appendTo('.mensaje');
}

$("#resetButton").click(function(){
    $("#aviso").show("slow");
});*/


