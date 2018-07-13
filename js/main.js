


$(".randomNodeButton").click(function () {
    $(".mensaje1").html(" <i class='fas fa-info-circle'></i> Selecciona los nodos que desee unir, luego presione <strong>'Conectar nodos' </strong> para unir los nodos seleccionados");
});

$(".connectNodeButton").click(function(){
    $(".mensaje1").html("<i class='fas fa-info-circle'></i> Presione <strong>'Camino mas corto' </strong> para encontrar el camino mas corto mediante Dijkstra...");
});

$(".dijkstraButton").click(function(){
    $(".mensaje1").html("<i class='fas fa-info-circle'></i> Presione <strong>'Limpiar'</strong> para empezar denuevo...");
});

$(".resetButton").click(function(){
    $(".mensaje1").html("<i class='fas fa-info-circle'></i> Presione <strong>Añadir nodo</strong> para comenzar...")
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


